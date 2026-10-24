/* Run: npm install && npx playwright install chromium firefox && npm test.
 * Optional env: CODEQUIZ_PLAYWRIGHT_PATH, CODEQUIZ_TEST_DIR, CODEQUIZ_CHANNEL,
 * CODEQUIZ_FIREFOX_PATH, CODEQUIZ_FILE_MODE=1 (offline file:// verification),
 * CODEQUIZ_BROWSERS=chromium (default: chromium,firefox).
 * By default tests use a temporary local HTTP server.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { chromium, firefox } = require(process.env.CODEQUIZ_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const runDir = process.env.CODEQUIZ_TEST_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'codequiz-tests-'));
const shots = path.join(root, 'report', 'screenshots');
fs.mkdirSync(runDir, { recursive: true });
fs.mkdirSync(shots, { recursive: true });
const results = [];
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});
async function test(browser, label, fn) {
    try { await fn(); results.push({ browser, label, status: 'PASS' }); console.log('PASS', browser, label); }
    catch (e) { results.push({ browser, label, status: 'FAIL', error: e.message }); console.error('FAIL', browser, label, e.message); throw e; }
}
async function suite(engine, context, base, screenshots) {
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    const badRequests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', req => badRequests.push(req.url()));
    await context.route('**/*', route => route.request().url().startsWith(base) || route.request().url().startsWith('file:') ? route.continue() : route.abort());
    const go = file => page.goto(base + file);
    const open = () => page.locator('.trigger-modal-btn[data-modal-tab="register"]').first().click();
    const close = () => page.locator('#modal-close-btn').click();
    const submit = () => page.locator('#registration-form button[type="submit"]').click();
    const setRaw = (selector, value) => page.locator(selector).evaluate((input, val) => {
        input.value = val; input.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    const message = selector => page.locator(selector).textContent();

    await test(engine, 'All four pages, local assets, footers and initial modal state', async () => {
        for (const file of ['index.html', 'quiz.html', 'about.html', 'contact.html']) {
            await go(file);
            assert.match(await page.locator('footer').textContent(), /Kassymkhan/);
            assert.match(await page.locator('footer').textContent(), /Darkhan Saduakasov/);
            assert.equal(await page.locator('#custom-modal-overlay').getAttribute('aria-hidden'), 'true');
            assert.equal(await page.locator('#custom-modal-overlay').isVisible(), false);
            assert.equal(await page.locator('h1').count(), 1);
            await page.waitForFunction(() => [...document.images].every(img => img.complete));
            assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(i => i.naturalWidth === 0).map(i => i.src)), []);
            assert.match(await page.locator('#current-date-time').textContent(), /\d{4}/);
            await open();
            assert.equal(await page.locator('#custom-modal-overlay').getAttribute('aria-hidden'), 'false');
            await close();
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(badRequests, []);
    });
    await test(engine, 'Live clock ticks using a machine-readable time element', async () => {
        await go('index.html');
        const first = await page.locator('time').getAttribute('datetime');
        await page.waitForFunction(value => document.querySelector('time').dateTime !== value, first);
        assert.notEqual(await page.locator('time').getAttribute('datetime'), first);
        if (screenshots) await page.screenshot({ path: path.join(shots, '01-home-clock.png') });
    });
    await test(engine, 'Background changes, cycles and persists across pages', async () => {
        const initial = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
        await page.locator('#btn-change-bg').click();
        await page.waitForFunction(value => getComputedStyle(document.body).backgroundColor !== value, initial);
        await page.waitForTimeout(450);
        const changed = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
        if (screenshots) await page.screenshot({ path: path.join(shots, '05-background-theme.png') });
        await go('about.html');
        await page.waitForTimeout(450);
        assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), changed);
        for (let i = 0; i < 5; i++) await page.locator('#btn-change-bg').click();
        await page.waitForTimeout(450);
        assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), changed);
    });
    await test(engine, 'FAQ starts closed, opens smoothly, switches and closes by keyboard', async () => {
        await go('index.html');
        const headers = page.locator('.custom-accordion-header');
        assert.equal(await headers.count(), 5);
        for (const header of await headers.all()) assert.equal(await header.getAttribute('aria-expanded'), 'false');
        await headers.nth(0).click();
        assert.equal(await headers.nth(0).getAttribute('aria-expanded'), 'true');
        await page.waitForTimeout(400);
        assert.ok(await page.locator('#faq-answer-1').evaluate(el => el.clientHeight > 0));
        assert.notEqual(await page.locator('#faq-answer-1').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
        if (screenshots) await page.locator('[aria-labelledby="faq-heading"]').screenshot({ path: path.join(shots, '03-faq-accordion.png') });
        await headers.nth(1).click();
        assert.equal(await headers.nth(0).getAttribute('aria-expanded'), 'false');
        assert.equal(await headers.nth(1).getAttribute('aria-expanded'), 'true');
        await headers.nth(1).press('Enter');
        assert.equal(await headers.nth(1).getAttribute('aria-expanded'), 'false');
    });
    await test(engine, 'Popup close button, backdrop, Escape, focus trap and tab keyboard controls', async () => {
        await open();
        await page.waitForFunction(() => document.activeElement.id === 'reg-name');
        assert.equal(await page.locator('#reg-name').evaluate(el => el === document.activeElement), true);
        await page.locator('#modal-close-btn').focus();
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.locator('#registration-form button[type="submit"]').evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('#modal-close-btn').evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#custom-modal-overlay').getAttribute('aria-hidden'), 'true');
        assert.equal(await page.locator('.trigger-modal-btn[data-modal-tab="register"]').first().evaluate(el => el === document.activeElement), true);
        await open();
        await page.locator('#custom-modal-overlay').click({ position: { x: 2, y: 2 } });
        assert.equal(await page.locator('#custom-modal-overlay').getAttribute('aria-hidden'), 'true');
        await page.locator('.trigger-modal-btn[data-modal-tab="subscribe"]').first().click();
        assert.equal(await page.locator('#tab-subscribe').isVisible(), true);
        await page.locator('#modal-tab-subscribe').focus();
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.locator('#tab-register').isVisible(), true);
        await close();
    });
    await test(engine, 'Empty registration, name rules, short passwords and confirmation mismatch', async () => {
        await open();
        await submit();
        assert.equal(await page.locator('#registration-form .is-invalid').count(), 5);
        await page.locator('#reg-name').fill('--');
        assert.match(await message('#err-reg-name'), /letters/);
        await page.locator('#reg-name').fill('Дархан Садуақасов');
        assert.equal(await page.locator('#reg-name').getAttribute('aria-invalid'), 'false');
        await page.locator('#reg-password').fill('abc12');
        assert.match(await message('#err-reg-password'), /8 characters/);
        await page.locator('#reg-password').fill('abcdefgh');
        assert.match(await message('#err-reg-password'), /number/);
        await page.locator('#reg-password').fill('CodeQuiz2026');
        await page.locator('#reg-confirm-password').fill('Different2026');
        assert.match(await message('#err-reg-confirm-password'), /do not match/);
        await page.locator('#reg-confirm-password').fill('CodeQuiz2026');
        await page.locator('#reg-password').fill('short');
        assert.match(await message('#err-reg-confirm-password'), /do not match/);
    });
    await test(engine, 'Passwords block typed spaces, pasted whitespace and invisible characters', async () => {
        for (const selector of ['#reg-password', '#reg-confirm-password']) {
            await page.locator(selector).fill('CodeQuiz2026');
            await page.locator(selector).press('End');
            await page.keyboard.type(' ');
            assert.equal(await page.locator(selector).inputValue(), 'CodeQuiz2026');
            for (const bad of ['Bad Pass2026', ' BadPass2026', 'BadPass2026 ', 'Bad\tPass2026', 'Bad\nPass2026', 'Bad\u00a0Pass2026', 'Bad\u200bPass2026']) {
                const prevented = await page.locator(selector).evaluate((input, value) => {
                    const data = new DataTransfer(); data.setData('text/plain', value);
                    const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
                    input.dispatchEvent(event); return event.defaultPrevented;
                }, bad);
                assert.equal(prevented, true, bad);
            }
        }
        await setRaw('#reg-password', 'Code Quiz2026');
        await setRaw('#reg-confirm-password', 'Code Quiz2026');
        await submit();
        assert.match(await message('#err-reg-password'), /spaces/);
        assert.match(await message('#err-reg-confirm-password'), /spaces/);
    });
    await test(engine, 'Malformed, dummy, disposable and typo emails are rejected consistently', async () => {
        const invalid = ['no-email', 'one@@gmail.com', '.darkhan@gmail.com', 'darkhan.@gmail.com',
            'dark..han@gmail.com', 'darkhan@-gmail.com', 'darkhan@gmail-.com', 'darkhan@gmail..com',
            'darkhan@gmail.c', 'darkhan@example.com', 'darkhan@sub.example.org', 'test@test.com',
            'fake@gmail.com', 'darkhan@mailinator.com', 'darkhan@sub.yopmail.com', 'darkhan@gmail.con',
            'darkhan@localhost', 'darkhan@site.invalid', 'dark han@gmail.com'];
        for (const value of invalid) {
            await page.locator('#reg-email').fill(value);
            assert.equal(await page.locator('#reg-email').getAttribute('aria-invalid'), 'true', value);
        }
        for (const value of ['darkhan.saduakasov@gmail.com', 'darkhan@astanait.edu.kz', 'darkhan+quiz@outlook.com']) {
            await page.locator('#reg-email').fill(value);
            assert.equal(await page.locator('#reg-email').getAttribute('aria-invalid'), 'false', value);
        }
        await page.locator('#reg-email').fill('darkhan@mailinator.com');
        await setRaw('#reg-password', 'Code Quiz2026');
        await setRaw('#reg-confirm-password', 'CodeQuiz2026');
        if (screenshots) await page.locator('.custom-modal-card').screenshot({ path: path.join(shots, '02-registration-errors.png') });
    });
    await test(engine, 'Valid registration completes locally and never stores password data', async () => {
        await page.locator('#reg-name').fill('Darkhan Saduakasov');
        await page.locator('#reg-email').fill('darkhan.saduakasov@gmail.com');
        await page.locator('#reg-password').fill('CodeQuiz2026');
        await page.locator('#reg-confirm-password').fill('CodeQuiz2026');
        await page.locator('#reg-terms').check();
        await submit();
        assert.match(await message('#reg-success-message'), /passed validation/);
        assert.equal(await page.locator('#reg-password').inputValue(), '');
        assert.doesNotMatch(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })), /CodeQuiz2026|darkhan.saduakasov/i);
        await close();
    });
    await test(engine, 'Newsletter rejects fake email and accepts realistic syntax', async () => {
        await page.locator('.trigger-modal-btn[data-modal-tab="subscribe"]').first().click();
        await page.locator('#sub-email').fill('test@test.com');
        await page.locator('#quick-subscribe-form button').click();
        assert.equal(await page.locator('#sub-email').getAttribute('aria-invalid'), 'true');
        await page.locator('#sub-email').fill('darkhan.saduakasov@gmail.com');
        if (screenshots) await page.locator('.custom-modal-card').screenshot({ path: path.join(shots, '04-newsletter-popup.png') });
        await page.locator('#quick-subscribe-form button').click();
        assert.match(await message('#sub-success-message'), /passed validation/);
        await close();
    });
    await test(engine, 'All three quizzes: incomplete, perfect, incorrect and resubmission scores', async () => {
        await go('quiz.html');
        for (const [id, answers] of Object.entries({ java: ['class', 'main()', ';'], python: ['def', 'print()', '.py'], html: ['HyperText Markup Language', '<p>', 'Styling'] })) {
            const form = page.locator('#' + id + '-quiz-form');
            await form.locator('button').click();
            assert.match(await message('#' + id + '-quiz-result'), /answer all/);
            for (let i = 0; i < answers.length; i++) await form.locator('input[name="' + id + (i + 1) + '"]').evaluateAll((inputs, answer) => {
                const chosen = inputs.find(input => input.value === answer); chosen.click();
            }, answers[i]);
            await form.locator('button').click();
            assert.match(await message('#' + id + '-quiz-result'), /3 out of 3.*100%/s);
            await form.locator('input[name="' + id + '1"]').nth(1).check();
            assert.equal((await message('#' + id + '-quiz-result')).trim(), '');
            await form.locator('button').click();
            assert.match(await message('#' + id + '-quiz-result'), /2 out of 3.*67%/s);
        }
        if (screenshots) await page.locator('main').screenshot({ path: path.join(shots, '06-quiz-results.png') });
    });
    await test(engine, 'Contact validation rejects injected name/fake email and handles corrections', async () => {
        await go('contact.html');
        await page.locator('#contact-form button[type="submit"]').click();
        assert.equal(await page.locator('#contact-form .is-invalid').count(), 4);
        assert.equal(await page.locator('#err-user-email').isVisible(), true);
        await page.locator('#user-name').fill('<img src=x onerror=alert(1)>');
        assert.equal(await page.locator('#user-name').getAttribute('aria-invalid'), 'true');
        await page.locator('#user-name').fill('Darkhan Saduakasov');
        await page.locator('#user-email').fill('darkhan@mailinator.com');
        assert.equal(await page.locator('#user-email').getAttribute('aria-invalid'), 'true');
        await page.locator('#user-email').fill('darkhan.saduakasov@gmail.com');
        await page.locator('#user-message').fill('I would like to suggest a JavaScript quiz.');
        await page.locator('#contact-consent').check();
        await page.locator('#contact-form button[type="submit"]').click();
        assert.match(await message('#contact-feedback'), /passed validation/);
        assert.equal(await page.locator('#contact-form .is-invalid').count(), 0);
    });
    await test(engine, 'Responsive pages at 360px, 390px and 768px, mobile navbar and modal', async () => {
        for (const width of [360, 390, 768]) {
            await page.setViewportSize({ width, height: 844 });
            for (const file of ['index.html', 'quiz.html', 'about.html', 'contact.html']) {
                await go(file);
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, width + ' ' + file);
            }
            await go('index.html');
            await page.locator('.navbar-toggler').click();
            await page.waitForFunction(() => document.querySelector('#mainNavigation').classList.contains('show'));
            await page.locator('#mainNavigation a[href="quiz.html"]').click();
            assert.match(page.url(), /quiz.html/);
            await open();
            const box = await page.locator('.custom-modal-card').boundingBox();
            assert.ok(box.x >= 0 && box.x + box.width <= width);
            assert.ok(box.y >= 0 && box.y + box.height <= 845);
            await page.locator('#reg-terms').check();
            await close();
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await go('index.html');
        if (screenshots) await page.screenshot({ path: path.join(shots, '07-mobile-home.png') });
        await open();
        await page.waitForFunction(() => getComputedStyle(document.getElementById('custom-modal-overlay')).opacity === '1');
        if (screenshots) await page.screenshot({ path: path.join(shots, '08-mobile-popup.png') });
        await close();
        await page.setViewportSize({ width: 1440, height: 1100 });
    });
    await test(engine, 'Works with localStorage disabled and by opening index.html directly', async () => {
        const noStorage = await context.newPage();
        await noStorage.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Disabled', 'SecurityError'); } }));
        const blockedErrors = [];
        noStorage.on('pageerror', e => blockedErrors.push(e.message));
        await noStorage.goto(base + 'index.html');
        await noStorage.locator('#btn-change-bg').click();
        await noStorage.locator('.trigger-modal-btn[data-modal-tab="register"]').first().click();
        assert.equal(await noStorage.locator('#tab-register').isVisible(), true);
        assert.deepEqual(blockedErrors, []);
        await noStorage.close();
        await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
        assert.match(await page.locator('#current-date-time').textContent(), /\d{4}/);
        await open(); await close();
        assert.deepEqual(errors, []);
        assert.deepEqual(badRequests, []);
    });
    await page.close();
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.CODEQUIZ_FILE_MODE === '1' ? pathToFileURL(root + path.sep).href : 'http://127.0.0.1:' + server.address().port + '/';
    let context;
    try {
        context = await chromium.launchPersistentContext(path.join(runDir, 'chrome-profile'), {
            headless: true, ...(process.env.CODEQUIZ_CHANNEL ? { channel: process.env.CODEQUIZ_CHANNEL } : {}),
            viewport: { width: 1440, height: 1100 }, timezoneId: 'Asia/Qyzylorda', reducedMotion: 'no-preference'
        });
        const chromeVersion = context.browser().version();
        await suite('Chrome ' + chromeVersion, context, base, true);
        await context.close(); context = null;
        if ((process.env.CODEQUIZ_BROWSERS || 'chromium,firefox').split(',').includes('firefox')) {
        context = await firefox.launchPersistentContext(path.join(runDir, 'firefox-profile'), {
            headless: true, ...(process.env.CODEQUIZ_FIREFOX_PATH ? { executablePath: process.env.CODEQUIZ_FIREFOX_PATH } : {}),
            viewport: { width: 1440, height: 1100 }, timezoneId: 'Asia/Qyzylorda'
        });
        await suite('Firefox ' + context.browser().version(), context, base, false);
        }
    } finally {
        if (context) await context.close();
        server.close();
        fs.writeFileSync(path.join(root, 'report', 'test-results.json'), JSON.stringify({
            transport: process.env.CODEQUIZ_FILE_MODE === '1' ? 'offline file URLs' : 'local HTTP',
            configuredBrowsers: process.env.CODEQUIZ_BROWSERS || 'chromium,firefox',
            results
        }, null, 2));
        console.log(results.filter(r => r.status === 'PASS').length + ' test groups passed.');
    }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
