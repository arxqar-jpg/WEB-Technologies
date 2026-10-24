const {chromium}=require(process.env.CODEQUIZ_PLAYWRIGHT_PATH || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const passed=[];
async function test(label,fn){await fn();passed.push(label);console.log('PASS',label);}
(async()=>{
const c=await chromium.launchPersistentContext(process.env.CODEQUIZ_TEST_PROFILE || require('node:os').tmpdir()+'/codequiz-a5-test-profile',{...(process.env.CODEQUIZ_CHANNEL ? {channel:process.env.CODEQUIZ_CHANNEL}:{}),headless:true,viewport:{width:1440,height:1100},timezoneId:'Asia/Qyzylorda'});
try{
const p=await c.newPage();p.setDefaultTimeout(6000);
const errors=[];p.on('pageerror',e=>errors.push(e.message));
const go=file=>p.goto(pathToFileURL(path.join(root,file)).href);
const open=()=>p.locator('.trigger-modal-btn[data-modal-tab="register"]').first().click();
const submit=()=>p.locator('#registration-form button[type="submit"]').click();
const raw=(selector,value)=>p.locator(selector).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
await test('Every page initializes clock, popup and common JavaScript',async()=>{
 for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
 await go(file);assert.match(await p.locator('#current-date-time').textContent(),/2026/);
 assert.equal(await p.locator('#custom-modal-overlay').isVisible(),false);
 await open();assert.equal(await p.locator('#reg-name').isVisible(),true);
 await p.locator('#modal-close-btn').click();assert.equal(await p.locator('#custom-modal-overlay').isVisible(),false);
 }
});
await go('index.html');
await test('Clock updates every second',async()=>{
const before=await p.locator('#current-date-time').textContent();
await p.waitForFunction(t=>document.getElementById('current-date-time').textContent!==t,before);
});
await test('Five theme colours cycle and return to original',async()=>{
const initial=await p.locator('body').evaluate(e=>e.style.backgroundColor);
await p.locator('#btn-change-bg').click();
assert.notEqual(await p.locator('body').evaluate(e=>e.style.backgroundColor),initial);
for(let i=0;i<4;i++)await p.locator('#btn-change-bg').click();
assert.equal(await p.locator('body').evaluate(e=>e.style.backgroundColor),initial);
});
await test('FAQ default hidden, open, switch and close',async()=>{
const h=p.locator('.custom-accordion-header');
for(const el of await h.all())assert.equal(await el.getAttribute('aria-expanded'),'false');
await h.nth(0).click();assert.equal(await h.nth(0).getAttribute('aria-expanded'),'true');
await h.nth(1).click();assert.equal(await h.nth(0).getAttribute('aria-expanded'),'false');
await h.nth(1).press('Enter');assert.equal(await h.nth(1).getAttribute('aria-expanded'),'false');
});
await test('Popup tabs, focus trap, Escape and backdrop closing',async()=>{
await open();
await p.locator('#modal-close-btn').focus();await p.keyboard.press('Shift+Tab');
assert.equal(await p.locator('#registration-form button[type="submit"]').evaluate(e=>e===document.activeElement),true);
await p.keyboard.press('Escape');assert.equal(await p.locator('#custom-modal-overlay').getAttribute('aria-hidden'),'true');
await open();await p.locator('#custom-modal-overlay').click({position:{x:2,y:2}});assert.equal(await p.locator('#custom-modal-overlay').isVisible(),false);
await p.locator('.trigger-modal-btn[data-modal-tab="subscribe"]').first().click();assert.equal(await p.locator('#sub-email').isVisible(),true);
await p.locator('#modal-tab-register').click();assert.equal(await p.locator('#reg-name').isVisible(),true);
});
await test('Required registration fields, Kazakh name and invalid name',async()=>{
await submit();assert.equal(await p.locator('#registration-form .is-invalid').count(),5);
await p.locator('#reg-name').fill('--');assert.equal(await p.locator('#reg-name').getAttribute('aria-invalid'),'true');
await p.locator('#reg-name').fill('Дархан Садуақасов');assert.equal(await p.locator('#reg-name').getAttribute('aria-invalid'),'false');
});
await test('Bad syntax, dummy, temporary and typo emails rejected; realistic addresses accepted',async()=>{
for(const email of ['abc','a@@gmail.com','.dar@gmail.com','dar.@gmail.com','dar..han@gmail.com','dar@-gmail.com','dar@gmail-.com','dar@gmail..com','dar@gmail.c','dar@example.com','dar@sub.mailinator.com','test@test.com','fake@gmail.com','dar@gmail.con','dar@site.invalid','dar@localhost','dar han@gmail.com']){
await p.locator('#reg-email').fill(email);assert.equal(await p.locator('#reg-email').getAttribute('aria-invalid'),'true',email);
}
for(const email of ['darkhan.saduakasov@gmail.com','darkhan@astanait.edu.kz','darkhan+quiz@outlook.com']){
await p.locator('#reg-email').fill(email);assert.equal(await p.locator('#reg-email').getAttribute('aria-invalid'),'false',email);
}
});
await test('Short password, missing digits and confirmation mismatch rejected',async()=>{
await p.locator('#reg-password').fill('abc12');assert.equal(await p.locator('#reg-password').getAttribute('aria-invalid'),'true');
await p.locator('#reg-password').fill('abcdefgh');assert.equal(await p.locator('#reg-password').getAttribute('aria-invalid'),'true');
await p.locator('#reg-password').fill('CodeQuiz2026');await p.locator('#reg-confirm-password').fill('OtherPass2026');assert.equal(await p.locator('#reg-confirm-password').getAttribute('aria-invalid'),'true');
});
await test('Typing/pasting whitespace blocked and raw whitespace rejected',async()=>{
for(const id of ['#reg-password','#reg-confirm-password']){
await p.locator(id).fill('CodeQuiz2026');await p.locator(id).press('End');await p.keyboard.type(' ');assert.equal(await p.locator(id).inputValue(),'CodeQuiz2026');
for(const value of ['Bad Pass2026','Bad\tPass2026','Bad\nPass2026','Bad\u00a0Pass2026','Bad\u200bPass2026']){
assert.equal(await p.locator(id).evaluate((el,text)=>{const d=new DataTransfer();d.setData('text',text);const e=new ClipboardEvent('paste',{clipboardData:d,bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented;},value),true);
}
}
await raw('#reg-password','Bad Pass2026');await raw('#reg-confirm-password','Bad Pass2026');await submit();assert.equal(await p.locator('#reg-password').getAttribute('aria-invalid'),'true');assert.equal(await p.locator('#reg-confirm-password').getAttribute('aria-invalid'),'true');
});
await test('Successful demo registration resets passwords and fields',async()=>{
await p.locator('#reg-name').fill('Darkhan Saduakasov');await p.locator('#reg-email').fill('darkhan.saduakasov@gmail.com');
await p.locator('#reg-password').fill('CodeQuiz2026');await p.locator('#reg-confirm-password').fill('CodeQuiz2026');await p.locator('#reg-terms').check();await submit();
assert.match(await p.locator('#reg-success-message').textContent(),/passed validation/);assert.equal(await p.locator('#reg-password').inputValue(),'');
await p.locator('#modal-close-btn').click();
});
await test('Newsletter shares validation and handles successful demo',async()=>{
await p.locator('.trigger-modal-btn[data-modal-tab="subscribe"]').first().click();
await p.locator('#sub-email').fill('test@test.com');await p.locator('#quick-subscribe-form button').click();assert.equal(await p.locator('#sub-email').getAttribute('aria-invalid'),'true');
await p.locator('#sub-email').fill('darkhan.saduakasov@gmail.com');await p.locator('#quick-subscribe-form button').click();assert.match(await p.locator('#sub-success-message').textContent(),/passed validation/);
await p.locator('#modal-close-btn').click();
});
await test('Three quizzes: incomplete, 100%, 67% and score clearing',async()=>{
await go('quiz.html');
for(const [language,answers]of Object.entries({java:['class','main()',';'],python:['def','print()','.py'],html:['HyperText Markup Language','<p>','Styling']})){
const form=p.locator('#'+language+'-quiz-form');const result=p.locator('#'+language+'-quiz-result');
await form.locator('button').click();assert.match(await result.textContent(),/answer all/);
for(let i=0;i<3;i++)await form.locator('input[name="'+language+(i+1)+'"]').evaluateAll((els,value)=>els.find(e=>e.value===value).click(),answers[i]);
await form.locator('button').click();assert.match(await result.textContent(),/3 out of 3 \(100%\)/);
await form.locator('input[name="'+language+'1"]').nth(1).check();assert.equal(await result.textContent(),'');
await form.locator('button').click();assert.match(await result.textContent(),/2 out of 3 \(67%\)/);
}
});
await test('Contact form required fields, safe output and successful correction',async()=>{
await go('contact.html');await p.locator('#contact-form button[type=submit]').click();assert.equal(await p.locator('#contact-form .is-invalid').count(),4);
await p.locator('#user-name').fill('<img src=x>');assert.equal(await p.locator('#user-name').getAttribute('aria-invalid'),'true');
await p.locator('#user-name').fill('Darkhan Saduakasov');await p.locator('#user-email').fill('darkhan@mailinator.com');assert.equal(await p.locator('#user-email').getAttribute('aria-invalid'),'true');
await p.locator('#user-email').fill('darkhan.saduakasov@gmail.com');await p.locator('#user-message').fill('Please add a JavaScript quiz.');await p.locator('#contact-consent').check();await p.locator('#contact-form button[type=submit]').click();assert.match(await p.locator('#contact-feedback').textContent(),/passed validation/);
});
await test('Mobile popup tabs and submitting checkbox at 360px',async()=>{
await p.setViewportSize({width:360,height:844});await go('index.html');await open();await p.locator('#reg-terms').check();assert.equal(await p.locator('#reg-terms').isChecked(),true);
await p.locator('#modal-close-btn').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});

await test('Assignment 5: jQuery 3.7.1 and five-page arrow-key navigation',async()=>{
for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
await p.setViewportSize({width:1440,height:1100});await go(file);
assert.equal(await p.evaluate(()=>jQuery.fn.jquery),'3.7.1');
const links=p.locator('#mainNavigation .nav-link, #mainNavigation .trigger-modal-btn');
assert.equal(await links.count(),6);
await links.first().focus();await p.keyboard.press('ArrowRight');assert.equal(await links.nth(1).evaluate(e=>e===document.activeElement),true);
await p.keyboard.press('End');assert.equal(await links.last().evaluate(e=>e===document.activeElement),true);
await p.keyboard.press('ArrowDown');assert.equal(await links.first().evaluate(e=>e===document.activeElement),true);
await p.keyboard.press('ArrowLeft');assert.equal(await links.last().evaluate(e=>e===document.activeElement),true);
await p.keyboard.press('Home');assert.equal(await links.first().evaluate(e=>e===document.activeElement),true);
}
});
await test('Assignment 5: array, filter callback, switch labels and generated quiz links',async()=>{
await go('study.html');
assert.equal(await p.locator('#practice-topics .topic-card').count(),3);
for(const [category,label,href]of [['java','Java','quiz.html#java'],['python','Python','quiz.html#python'],['web','HTML & CSS','quiz.html#htmlcss']]){
await p.locator('.topic-filter[data-category="'+category+'"]').click();
assert.equal(await p.locator('#practice-topics .topic-card').count(),1);
assert.match(await p.locator('#topic-count').textContent(),new RegExp(label.replace('&','&')));
assert.equal(await p.locator('#practice-topics a').getAttribute('href'),href);
assert.equal(await p.locator('.topic-filter[aria-pressed=true]').count(),1);
}
await p.locator('.topic-filter[data-category=all]').click();assert.equal(await p.locator('#practice-topics .topic-card').count(),3);
});
await test('Assignment 5: multi-step validation and state across Next and Back callbacks',async()=>{
await p.locator('#plan-next').click();assert.equal(await p.locator('#plan-name').getAttribute('aria-invalid'),'true');assert.match(await p.locator('#plan-step-status').textContent(),/Step 1/);
await p.locator('#plan-name').fill('Darkhan');await p.locator('#plan-next').click();assert.equal(await p.locator('#plan-topic').isVisible(),true);
await p.locator('#plan-next').click();assert.equal(await p.locator('#plan-topic').getAttribute('aria-invalid'),'true');
await p.locator('#plan-topic').selectOption('python');await p.locator('#plan-minutes').selectOption('25');await p.locator('#plan-back').click();assert.equal(await p.locator('#plan-name').inputValue(),'Darkhan');
await p.locator('#plan-name').fill('Дархан');await p.locator('#plan-next').click();assert.equal(await p.locator('#plan-topic').inputValue(),'python');assert.equal(await p.locator('#plan-minutes').inputValue(),'25');
await p.locator('#plan-next').click();assert.match(await p.locator('#plan-review').textContent(),/Дархан.*25 minutes of Python/);
await p.locator('#plan-back').click();await p.locator('#plan-minutes').selectOption('10');await p.locator('#plan-next').click();assert.match(await p.locator('#plan-review').textContent(),/10 minutes/);
});
await test('Assignment 5: object method summary, correct linked quiz and animation',async()=>{
await p.locator('#sound-enabled').uncheck();await p.locator('#plan-finish').click();
assert.match(await p.locator('#plan-result').textContent(),/Дархан.*10 minutes of Python/);assert.equal(await p.locator('#plan-quiz-link').getAttribute('href'),'quiz.html#python');
assert.equal(await p.locator('.plan-result-panel').evaluate(el=>el.classList.contains('completed')),true);
await p.waitForFunction(()=>getComputedStyle(document.querySelector('.plan-result-panel')).opacity==='1');
assert.equal(await p.locator('#notification-sound').evaluate(el=>el.paused),true);
});
await test('Assignment 5: native addEventListener resets the full plan and its feedback',async()=>{
await p.locator('#plan-reset').click();assert.equal(await p.locator('#plan-name').inputValue(),'');assert.equal(await p.locator('#plan-topic').inputValue(),'');assert.equal(await p.locator('#plan-minutes').inputValue(),'15');
assert.match(await p.locator('#plan-step-status').textContent(),/Step 1/);assert.equal(await p.locator('#plan-quiz-link').isVisible(),false);assert.equal(await p.locator('#practice-plan .is-invalid').count(),0);
assert.match(await p.locator('#plan-result').textContent(),/Complete the three steps/);
});
await test('Assignment 5: all planner topics link to the existing corresponding quiz',async()=>{
for(const [topic,href]of [['java','quiz.html#java'],['python','quiz.html#python'],['web','quiz.html#htmlcss']]){
await p.locator('#plan-name').fill('Kassymkhan');await p.locator('#plan-next').click();await p.locator('#plan-topic').selectOption(topic);await p.locator('#plan-next').click();await p.locator('#plan-finish').click();assert.equal(await p.locator('#plan-quiz-link').getAttribute('href'),href);await p.locator('#plan-reset').click();
}
});
await test('Assignment 5: thumbnail src, alt, caption, ARIA and rapid-click animation queues',async()=>{
for(let i=0;i<3;i++){
const thumb=p.locator('.study-thumb').nth(i);const src=await thumb.getAttribute('data-src');const alt=await thumb.getAttribute('data-alt');await thumb.click();
await p.waitForFunction(source=>document.getElementById('study-image').getAttribute('src')===source&&getComputedStyle(document.getElementById('study-image')).opacity==='1',src);
assert.equal(await p.locator('#study-image').getAttribute('alt'),alt);assert.equal(await thumb.getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.study-thumb[aria-pressed=true]').count(),1);
}
await p.locator('.study-thumb').nth(0).click();await p.locator('.study-thumb').nth(1).click();await p.locator('.study-thumb').nth(2).click();
const finalSrc=await p.locator('.study-thumb').nth(2).getAttribute('data-src');
await p.waitForFunction(src=>document.getElementById('study-image').getAttribute('src')===src&&getComputedStyle(document.getElementById('study-image')).opacity==='1',finalSrc);
assert.equal(await p.locator('#study-image').evaluate(el=>el.complete&&el.naturalWidth>0),true);
});
await test('Assignment 5: bundled audio really advances, retriggers without overlap, mutes and ends',async()=>{
await p.locator('#sound-enabled').check();await p.locator('#test-sound').click();
await p.waitForFunction(()=>document.getElementById('notification-sound').currentTime>0.02);
assert.equal(await p.locator('#notification-sound').evaluate(el=>el.readyState>=2),true);
assert.equal(await p.locator('audio').count(),1);
await p.locator('#test-sound').click();await p.locator('#test-sound').click();
await p.waitForFunction(()=>document.getElementById('notification-sound').ended);
assert.match(await p.locator('#sound-status').textContent(),/Sound finished/);
await p.locator('#sound-enabled').uncheck();await p.locator('#test-sound').click();assert.equal(await p.locator('#notification-sound').evaluate(el=>el.paused),true);assert.equal(await p.locator('#notification-sound').evaluate(el=>el.currentTime),0);assert.match(await p.locator('#sound-status').textContent(),/Sound is off/);
});
await test('Assignment 5: Enter in the multi-step form advances without reload',async()=>{
await p.locator('#plan-reset').click();await p.locator('#plan-name').fill('Darkhan');await p.locator('#plan-name').press('Enter');
assert.match(await p.locator('#plan-step-status').textContent(),/Step 2/);assert.match(p.url(),/study.html$/);
});
await test('Assignment 5: all assets and all five pages fit phone, tablet and desktop widths',async()=>{
for(const width of [360,390,768,1440]){
await p.setViewportSize({width,height:900});
for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
await go(file);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,width+' '+file);
await p.waitForFunction(()=>[...document.images].every(el=>el.complete));assert.deepEqual(await p.locator('img').evaluateAll(els=>els.filter(el=>el.naturalWidth===0).map(el=>el.src)),[]);
}
}
});
await test('Assignment 5: mobile planner, filtering, gallery and existing popup remain usable',async()=>{
await p.setViewportSize({width:360,height:844});await go('study.html');await p.locator('#plan-name').fill('Дархан');await p.locator('#plan-next').click();await p.locator('#plan-topic').selectOption('web');await p.locator('#plan-next').click();await p.locator('#sound-enabled').uncheck();await p.locator('#plan-finish').click();assert.match(await p.locator('#plan-result').textContent(),/HTML & CSS/);
await p.locator('.topic-filter[data-category=python]').click();assert.equal(await p.locator('#practice-topics .topic-card').count(),1);
await p.locator('.study-thumb').nth(1).click();await p.waitForFunction(()=>document.getElementById('study-image').alt==='A laptop and a bright coding workspace');
await open();assert.equal(await p.locator('#reg-name').isVisible(),true);await p.locator('#modal-close-btn').click();
});

assert.deepEqual(errors,[]);
fs.writeFileSync(path.join(root,'report/assignment-5/test-results.json'),JSON.stringify({
passed,errors,browser:'Google Chrome '+c.browser().version(),transport:'offline file URLs',
widths:[360,390,768,1440],team:'Team Spirit',group:'SE 2508'
},null,2));
console.log(passed.length+' groups passed; no JavaScript errors.');
await p.close();
}finally{await c.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
