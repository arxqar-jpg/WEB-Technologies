const {chromium}=require(process.env.CODEQUIZ_PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');const passed=[];
async function test(name,fn){await fn();passed.push(name);console.log('PASS',name);}
(async()=>{
 const browser=await chromium.launch({channel:process.env.CODEQUIZ_CHANNEL||'chrome',headless:true});const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(7000);const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://code.jquery.com/**',r=>r.abort());
 const go=file=>p.goto(pathToFileURL(path.join(root,file)).href);
 try{
 await test('Sora/Figtree load offline and all five pages retain external script/style separation',async()=>{
  for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){
   await go(file);await p.evaluate(()=>document.fonts.ready);
   assert.ok(await p.evaluate(()=>document.fonts.check('500 16px Figtree')&&document.fonts.check('600 30px Sora')));
   assert.match(await p.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily),/Sora/);
   assert.equal(/\s(?:style|onclick|onchange|oninput)=/.test(fs.readFileSync(path.join(root,file),'utf8')),false);
  }
 });
 await test('Theme menu selects all three complete themes and persists across navigation',async()=>{
  await go('index.html');await p.locator('.theme-toggle').click();await p.locator('[data-site-theme=midnight]').click();assert.equal(await p.locator('body').getAttribute('data-theme'),'midnight');
  await go('study.html');assert.equal(await p.locator('body').getAttribute('data-theme'),'midnight');await p.reload();assert.equal(await p.locator('#theme-name').textContent(),'Midnight');
  await p.locator('.theme-toggle').click();await p.locator('[data-site-theme=cobalt]').click();const before=await p.locator('body').evaluate(e=>e.style.backgroundColor);for(let i=0;i<3;i++)await p.locator('#btn-change-bg').click();assert.equal(await p.locator('body').evaluate(e=>e.style.backgroundColor),before);
  await p.locator('.theme-toggle').click();await p.locator('[data-site-theme=forest]').click();
 });
 await test('Overview reuses the live topic library and opens the selected quiz',async()=>{
  await go('index.html');await p.locator('#topic-search').fill('python');assert.equal(await p.locator('.topic-card').count(),1);await p.locator('#topic-search').press('Escape');await p.locator('.topic-start').click();
  await p.waitForFunction(()=>document.getElementById('python')&&!document.getElementById('python').hidden);assert.equal(await p.locator('#java').isVisible(),false);assert.equal(await p.locator('#python .question-code').count(),3);await p.waitForFunction(()=>window.scrollY===0);
 });
 await test('Each code quiz grades all-right and all-wrong answers and counts actual selections',async()=>{
  await go('quiz.html');
  const keys={java:['5','6','Quiz round = new Quiz();'],python:['4','True','6'],html:['submit','#selected','One card per row']};
  for(const [language,answers] of Object.entries(keys)){
   await p.locator('[data-quiz-topic="'+(language==='html'?'htmlcss':language)+'"]').click();const form=p.locator('#'+language+'-quiz-form');assert.equal(await form.locator('pre code').count(),3);
   for(let i=0;i<3;i++)await form.locator('input[name="'+language+(i+1)+'"]').evaluateAll((es,v)=>es.find(e=>e.value===v).click(),answers[i]);
   assert.equal(await p.locator('#quiz-answer-count').textContent(),'3 / 3');await form.locator('button').click();assert.match(await p.locator('#'+language+'-quiz-result').textContent(),/100%/);
   for(let i=0;i<3;i++)await form.locator('input[name="'+language+(i+1)+'"]').evaluateAll((es,v)=>es.find(e=>e.value!==v).click(),answers[i]);await form.locator('button').click();assert.match(await p.locator('#'+language+'-quiz-result').textContent(),/0 out of 3 \(0%\)/);
  }
 });
 await test('Resources preserve CSS-only 1/2/3 cards, Bootstrap grids/cards, carousel and FAQ',async()=>{
  for(const [width,columns] of [[390,1],[768,2],[1440,3]]){
   await p.setViewportSize({width,height:1000});await go('index.html');await p.locator('.platform-resources summary').click();assert.equal(await p.locator('.quiz-container').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),columns);
  }
  assert.equal(await p.locator('[aria-labelledby=grid-heading] .col-lg-6').count(),2);assert.equal(await p.locator('[aria-labelledby=topics-heading] .col-lg-4').count(),3);assert.equal(await p.locator('.card-group .card').count(),3);assert.equal(await p.locator('.carousel-item').count(),9);
  await p.locator('#faq-question-1').click();assert.equal(await p.locator('#faq-question-1').getAttribute('aria-expanded'),'true');await p.locator('#faq-question-1').click();assert.equal(await p.locator('#faq-question-1').getAttribute('aria-expanded'),'false');
  for(const css of ['style.css','assignment5.css','assignment6.css','platform.css'])assert.equal(/(?:^|[;{\s])(?:margin|padding)(?:-[a-z]+)?\s*:/m.test(fs.readFileSync(path.join(root,'css',css),'utf8')),false);
 });
 await test('Mobile brand/theme controls do not overlap; Bootstrap menu and popup work at 320/390px',async()=>{
  for(const width of [320,390]){
   await p.setViewportSize({width,height:844});await go('index.html');const sizes=await p.evaluate(()=>({brand:document.querySelector('.navbar-brand').getBoundingClientRect().right,theme:document.querySelector('.theme-control').getBoundingClientRect().left}));assert.ok(sizes.brand<=sizes.theme,width+' header overlap');
   await p.locator('.navbar-toggler').click();await p.waitForFunction(()=>document.querySelector('#mainNavigation').classList.contains('show'));assert.equal(await p.locator('#mainNavigation .nav-link:visible').count(),5);
   await p.locator('.navbar-toggler').click();await p.locator('.trigger-modal-btn[data-modal-tab=register]').click();assert.ok(await p.locator('#reg-name').isVisible());await p.locator('#modal-close-btn').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
 });
 await test('All new layouts fit seven viewport widths, including expanded resources',async()=>{
  for(const width of [320,360,390,576,768,992,1440]){
   await p.setViewportSize({width,height:900});for(const file of ['index.html','quiz.html','study.html','about.html','contact.html']){await go(file);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' '+file);}
   await go('index.html');await p.locator('.platform-resources summary').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' expanded resources');
  }
  assert.deepEqual(errors,[]);
 });
 fs.writeFileSync(path.join(root,'report/assignment-6/platform-test-results.json'),JSON.stringify({date:'2026-11-04',passed,errors,browser:browser.version()},null,2));console.log(passed.length+' platform groups passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
