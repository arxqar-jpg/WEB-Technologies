const {chromium}=require(process.env.CODEQUIZ_PLAYWRIGHT_PATH || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const report=path.join(root,'report/assignment-6');
const shots=path.join(report,'screenshots');
fs.mkdirSync(shots,{recursive:true});
const passed=[];
async function test(name,fn){await fn();passed.push(name);console.log('PASS',name);}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
(async()=>{
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({channel:process.env.CODEQUIZ_CHANNEL||'chrome',headless:true});
const c=await browser.newContext({viewport:{width:1280,height:1000},timezoneId:'Asia/Qyzylorda'});
await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
const p=await c.newPage();p.setDefaultTimeout(7000);
const errors=[];const messages=[];const requests=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>messages.push(m.text()));p.on('request',r=>requests.push(r.url()));
const go=f=>p.goto(base+f);
const shot=(name,selector)=>p.locator(selector).first().screenshot({path:path.join(shots,name+'.png'),animations:'disabled'});
const ready=()=>p.waitForFunction(()=>window.jQuery&&jQuery.fn.jquery==='4.0.0');
async function plan(){
 await p.locator('#plan-name').fill('Darkhan');await p.locator('#plan-next').click();await p.locator('#plan-topic').selectOption('python');await p.locator('#plan-minutes').selectOption('25');await p.locator('#plan-next').click();await p.locator('#sound-enabled').uncheck();await p.locator('#plan-finish').click();
}
let cdnStatus;
try{
await test('Task 0: CDN script is in head; jQuery 4 and ready message initialize',async()=>{
 await go('study.html');await ready();
 assert.equal(await p.locator('head script[src="https://code.jquery.com/jquery-4.0.0.min.js"]').count(),1);
 await p.waitForFunction(()=>document.querySelectorAll('#practice-topics .topic-card').length===3);
 assert.ok(messages.includes('jQuery is ready!'));
 const r=await p.request.get('https://code.jquery.com/jquery-4.0.0.min.js',{timeout:15000});cdnStatus=r.status();assert.equal(cdnStatus,200);
});
await test('Task 0: offline CDN fallback runs all five pages with the same local version',async()=>{
 await c.route('https://code.jquery.com/**',r=>r.abort());
 for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
  await p.goto(pathToFileURL(path.join(root,file)).href);await ready();
  assert.match(await p.locator('#current-date-time').textContent(),/2026/);
 }
});
await test('Task 1: live search filters titles/descriptions, ignores case and clears',async()=>{
 await go('study.html');const search=p.locator('#topic-search');
 await search.fill('PYTH');assert.equal(await p.locator('.topic-card').count(),1);assert.match(await p.locator('.topic-card').textContent(),/Python essentials/);
 await search.fill('classes');assert.equal(await p.locator('.topic-card').count(),1);assert.match(await p.locator('.topic-card').textContent(),/Java foundations/);
 await search.fill('');assert.equal(await p.locator('.topic-card').count(),3);
 await search.fill('not-a-topic');assert.equal(await p.locator('.topic-card').count(),0);assert.match(await p.locator('#practice-topics').textContent(),/No matching topics/);
 await search.fill('');await shot('01-library','#practice-library');
});
await test('Tasks 1-2: category and text filters combine without stale suggestions',async()=>{
 await p.locator('.topic-filter[data-category=python]').click();await p.locator('#topic-search').fill('java');assert.equal(await p.locator('.topic-card').count(),0);assert.equal(await p.locator('#topic-suggestions').isVisible(),false);
 await p.locator('.topic-filter[data-category=all]').click();await p.locator('#topic-search').fill('py');assert.equal(await p.locator('.topic-card').count(),1);assert.equal(await p.locator('#topic-suggestions [role=option]').count(),1);
});
await test('Task 2: mouse and Arrow/Enter suggestions complete the search',async()=>{
 await shot('02-autocomplete','#practice-library');
 await p.locator('#topic-suggestions button').click();assert.equal(await p.locator('#topic-search').inputValue(),'Python essentials');assert.equal(await p.locator('#topic-suggestions').isVisible(),false);
 await p.locator('#topic-search').fill('java');await p.locator('#topic-search').press('ArrowDown');assert.ok(await p.locator('#topic-search').getAttribute('aria-activedescendant'));await p.locator('#topic-search').press('Enter');assert.equal(await p.locator('#topic-search').inputValue(),'Java foundations');
 await p.locator('#topic-search').fill('py');await p.locator('#topic-search').press('Escape');assert.equal(await p.locator('#topic-suggestions').isVisible(),false);assert.equal(await p.locator('#topic-search').inputValue(),'py');
});
await test('Task 3: all literal matches are highlighted and repeated searches do not nest marks',async()=>{
 await p.locator('#topic-search').fill('python');assert.equal(await p.locator('#practice-topics mark').count(),2);assert.equal(await p.locator('mark mark').count(),0);await p.locator('#topic-search').press('Escape');await shot('03-highlighting','#practice-library');
 await p.locator('#topic-search').fill('Python');assert.equal(await p.locator('#practice-topics mark').count(),2);
 await p.locator('#topic-search').fill('');assert.equal(await p.locator('#practice-topics mark').count(),0);
 for(const value of ['[','.*','(java)','<img src=x onerror=alert(1)>']){await p.locator('#topic-search').fill(value);assert.equal(await p.locator('#practice-topics img').count(),0);}
 await p.locator('#topic-search').fill('');
});
await test('Task 4: progress updates from zero through halfway to 100 and after resize',async()=>{
 await go('index.html');await p.locator('.platform-resources summary').click();await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.getElementById('scroll-progress').getAttribute('aria-valuenow')==='0');
 await p.evaluate(()=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)/2));await p.waitForFunction(()=>Math.abs(Number(document.getElementById('scroll-progress').getAttribute('aria-valuenow'))-50)<=1);
 await p.screenshot({path:path.join(shots,'04-scroll-progress.png'),clip:{x:0,y:0,width:1280,height:380},animations:'disabled'});
 await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForFunction(()=>document.getElementById('scroll-progress').getAttribute('aria-valuenow')==='100');
 await p.setViewportSize({width:768,height:900});assert.ok(Number(await p.locator('#scroll-progress').getAttribute('aria-valuenow'))<=100);
 await p.setViewportSize({width:1280,height:1000});
});
await test('Task 5: visible counters count through intermediate values to actual totals',async()=>{
 await go('study.html');await p.waitForFunction(()=>[...document.querySelectorAll('.number-counter')].some(e=>Number(e.textContent)>0&&Number(e.textContent)<Number(e.dataset.count)));
 await shot('05-counter-animating','.lab-stats');await p.waitForFunction(()=>[...document.querySelectorAll('.number-counter')].every(e=>e.textContent===e.dataset.count));await shot('05-counters','.lab-stats');
 assert.deepEqual(await p.locator('.number-counter').allTextContents(),['3','9','3']);
});
await test('Task 5: counters honor reduced motion',async()=>{
 await p.emulateMedia({reducedMotion:'reduce'});await go('study.html');await p.waitForFunction(()=>[...document.querySelectorAll('.number-counter')].every(e=>e.textContent===e.dataset.count));await p.emulateMedia({reducedMotion:'no-preference'});
});
await test('Task 6: invalid forms stay editable; valid submit shows spinner and blocks repeats',async()=>{
 await go('contact.html');const button=p.locator('#contact-form button[type=submit]');
 await button.click();assert.equal(await button.isDisabled(),false);assert.equal(await p.locator('#contact-form .is-invalid').count(),4);
 await p.locator('#user-name').fill('Darkhan');await p.locator('#user-email').fill('darkhan@astanait.edu.kz');await p.locator('#user-message').fill('Please add a JavaScript quiz.');await p.locator('#contact-consent').check();
 await button.click();assert.equal(await button.isDisabled(),true);assert.match(await button.textContent(),/Please wait/);assert.equal(await button.locator('.spinner-border').count(),1);
 await p.locator('#contact-form').evaluate(e=>{e.dispatchEvent(new Event('submit',{cancelable:true}));e.dispatchEvent(new Event('submit',{cancelable:true}));});
 await shot('06-submit-spinner','#contact-form');await p.waitForFunction(()=>!document.querySelector('#contact-form button[type=submit]').disabled);assert.equal(await button.textContent(),'Send Message');assert.match(await p.locator('#contact-feedback').textContent(),/passed validation/);
});
await test('Task 7: success notification appears then fades away',async()=>{
 assert.match(await p.locator('#action-toast').textContent(),/Form submitted successfully/);assert.equal(await p.locator('#action-toast').isVisible(),true);await shot('07-notification','#action-toast');await p.locator('#action-toast').waitFor({state:'hidden'});
 await p.evaluate(()=>{showNotification('First');showNotification('Latest action');});assert.equal(await p.locator('#action-toast').textContent(),'Latest action');await p.locator('#action-toast').waitFor({state:'hidden'});
});
await test('Tasks 6-7: registration and newsletter share loading, reset and confirmation',async()=>{
 await go('index.html');await p.locator('.trigger-modal-btn[data-modal-tab=register]').first().click();
 await p.locator('#reg-name').fill('Darkhan');await p.locator('#reg-email').fill('darkhan@astanait.edu.kz');await p.locator('#reg-password').fill('CodeQuiz2026');await p.locator('#reg-confirm-password').fill('CodeQuiz2026');await p.locator('#reg-terms').check();
 await p.locator('#registration-form button[type=submit]').click();assert.ok(await p.locator('#registration-form button').isDisabled());await p.waitForFunction(()=>document.getElementById('registration-form').getAttribute('aria-busy')!=='true');assert.equal(await p.locator('#reg-password').inputValue(),'');
 await p.locator('#modal-tab-subscribe').click();await p.locator('#sub-email').fill('darkhan@astanait.edu.kz');await p.locator('#quick-subscribe-form button').click();assert.ok(await p.locator('#quick-subscribe-form button').isDisabled());await p.waitForFunction(()=>document.getElementById('quick-subscribe-form').getAttribute('aria-busy')!=='true');assert.match(await p.locator('#sub-success-message').textContent(),/passed validation/);
});
await test('Task 8: real clipboard copy shows checkmark and tooltip then resets',async()=>{
 await go('study.html');assert.equal(await p.locator('#copy-plan').isVisible(),false);await plan();
 await p.locator('#copy-plan').click();await p.waitForFunction(()=>document.getElementById('copy-plan').textContent.includes('✓'));assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),await p.locator('#plan-result').textContent());
 await p.locator('.tooltip').waitFor({state:'visible'});assert.match(await p.locator('.tooltip').textContent(),/Copied to clipboard!/);await shot('08-copy-plan','.plan-result-panel');
 await p.waitForFunction(()=>document.getElementById('copy-plan').textContent==='Copy plan');await p.locator('#plan-reset').click();assert.equal(await p.locator('#copy-plan').isVisible(),false);
});
await test('Task 8: fallback copy works; denied copy never claims success',async()=>{
 await go('study.html');await plan();
 await p.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('denied'));});await p.locator('#copy-plan').click();await p.waitForFunction(()=>document.getElementById('copy-plan').textContent.includes('✓'));
 await p.waitForFunction(()=>document.getElementById('copy-plan').textContent==='Copy plan');
 await p.evaluate(()=>{document.execCommand=()=>false;});await p.locator('#copy-plan').click();await p.waitForFunction(()=>document.getElementById('action-toast').textContent.startsWith('Copy failed.'));assert.equal(await p.locator('#copy-plan').textContent(),'Copy plan');
});
await test('Task 9: offscreen images are not requested until visible',async()=>{
 const start=requests.length;await go('index.html');
 const image=p.locator('.topic-image').first();const source=await image.getAttribute('data-src');assert.ok(source);assert.ok(!(await image.getAttribute('src')).includes('photo-'));
 assert.ok(!requests.slice(start).some(r=>r.endsWith(source)));
 await p.locator('.platform-resources summary').click();await image.scrollIntoViewIfNeeded();await p.waitForFunction(()=>!document.querySelector('.topic-image').hasAttribute('data-src')&&document.querySelector('.topic-image').naturalWidth>1);assert.ok(requests.slice(start).some(r=>r.endsWith(source)));await shot('09-lazy-loaded','[aria-labelledby="topics-heading"]');
});
await test('Task 9: all nine carousel slides load when shown; gallery selection is preserved',async()=>{
 await go('index.html');await p.locator('.platform-resources summary').click();await p.locator('#codeQuizCarousel').scrollIntoViewIfNeeded();
 for(let i=0;i<9;i++){
  await p.evaluate(i=>{const el=document.querySelector('.carousel');const c=bootstrap.Carousel.getOrCreateInstance(el);c.pause();c.to(i);},i);
  await p.waitForFunction(i=>{const slides=[...document.querySelectorAll('.carousel-item')];const img=slides[i].querySelector('img');return slides[i].classList.contains('active')&&!img.hasAttribute('data-src')&&img.naturalWidth>1;},i);
 }
 await go('study.html');await p.locator('.study-thumb').nth(1).click();await p.waitForFunction(()=>document.getElementById('study-image').alt==='A laptop and a bright coding workspace');await p.locator('#study-image').scrollIntoViewIfNeeded();assert.equal(await p.locator('#study-image').getAttribute('data-src'),null);assert.match(await p.locator('#study-image').getAttribute('src'),/1498050108023/);
});
await test('Regression: quiz scores, FAQ, background colors and menu keys still work',async()=>{
 await go('quiz.html');
 for(const [language,answers] of Object.entries({java:['5','6','Quiz round = new Quiz();'],python:['4','True','6'],html:['submit','#selected','One card per row']})){
  await p.locator('[data-quiz-topic="'+(language==='html'?'htmlcss':language)+'"]').click();const f=p.locator('#'+language+'-quiz-form');for(let i=0;i<answers.length;i++)await f.locator('input[name="'+language+(i+1)+'"]').evaluateAll((es,v)=>es.find(e=>e.value===v).click(),answers[i]);await f.locator('button').click();assert.match(await p.locator('#'+language+'-quiz-result').textContent(),/100%/);
 }
 await go('index.html');await p.locator('.platform-resources summary').click();await p.locator('#faq-question-1').click();assert.equal(await p.locator('#faq-question-1').getAttribute('aria-expanded'),'true');
 const before=await p.locator('body').evaluate(e=>e.style.backgroundColor);await p.locator('#btn-change-bg').click();assert.notEqual(await p.locator('body').evaluate(e=>e.style.backgroundColor),before);
 await p.locator('#mainNavigation .nav-link').first().focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#mainNavigation .nav-link').nth(1).evaluate(e=>e===document.activeElement),true);
});
await test('Mobile: search dropdown, planner/copy and loading controls fit at 360px',async()=>{
 await p.setViewportSize({width:360,height:844});await go('study.html');await p.locator('#topic-search').fill('py');await shot('10-mobile-search','#practice-library');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#topic-search').press('Escape');await plan();await p.locator('#copy-plan').click();await p.waitForFunction(()=>document.getElementById('copy-plan').textContent.includes('✓'));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
await test('All five pages fit 320/360/390/576/768/992/1440px with no runtime errors',async()=>{
 for(const width of [320,360,390,576,768,992,1440]){
  await p.setViewportSize({width,height:900});
  for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
   await go(file);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+file);assert.match(await p.locator('footer').textContent(),/Kassymkhan/);assert.match(await p.locator('footer').textContent(),/Darkhan/);
  }
 }
 assert.deepEqual(errors,[]);
});
fs.writeFileSync(path.join(report,'test-results.json'),JSON.stringify({date:'2026-11-04',passed,errors,browser:browser.version(),cdnHttpStatus:cdnStatus,transports:['HTTP localhost','offline file URLs'],widths:[320,360,390,576,768,992,1440]},null,2));
console.log(passed.length+' Assignment 6 groups passed; no JavaScript errors.');
}finally{await c.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
