'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const live=process.env.SILVANA_BASE_URL,base=(live||'http://127.0.0.1:8767/').replace(/\/?$/,'/');
const server=live?null:spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;const errors=[];
async function run(){
 for(let i=0;i<180;i++){try{const r=await fetch(base+'szene-5/?test='+Date.now());if(r.ok&&(await r.text()).includes('scene.js?v=3'))break;}catch{}if(i===179)throw Error('Szene 5 fehlt');await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true});
 await context.addInitScript(()=>{
 window.__speech=[];
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel:()=>window.__speech.push('cancel'),speak:u=>{window.__u=u;window.__speech.push('speak');},pause:()=>window.__speech.push('pause'),resume:()=>window.__speech.push('resume')}});
 Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
 });
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 await p.goto(base+'szene-5/');await p.locator('#next').waitFor();
 await p.waitForFunction(()=>{const i=document.querySelector('.king-art img');return i&&i.complete&&i.naturalWidth>0;});
 assert.match(await p.locator('.reading').innerText(),/für sein Schloss kaufen/);
 assert.equal(await p.locator('#audioToggle').count(),0);assert.equal(await p.locator('.king-art img').getAttribute('src'),'assets/koenig-spinnweben.webp');
 let checks=0;
 async function stable(){await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 async function layout(label){
  for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){
   await p.setViewportSize({width,height});
   for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){
    await p.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const x=document.getElementById(id);x.value=v;x.dispatchEvent(new Event('input'));}},[text,board]);await stable();
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' horizontal overflow '+width+' '+text+'/'+board);
    assert.ok(await p.locator('button:visible').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.width<=innerWidth+1&&b.scrollHeight<=b.clientHeight+2;})),label+' clipped button');
    assert.ok(await p.locator('.king-art img').evaluateAll(images=>images.every(i=>{const r=i.getBoundingClientRect();return Math.abs(r.width/r.height-i.naturalWidth/i.naturalHeight)<.01;})),label+' distorted picture');
    assert.ok(await p.locator('#completionVideo:visible').evaluateAll(videos=>videos.every(video=>{
     const rect=video.getBoundingClientRect();
     return Math.abs(rect.width/rect.height-358/354)<.01&&rect.height<=innerHeight;
    })),label+' distorted or oversized completion video');
    checks++;
   }
  }
  await p.setViewportSize({width:412,height:915});await p.evaluate(()=>{for(const id of ['textSize','boardSize']){const x=document.getElementById(id);x.value=100;x.dispatchEvent(new Event('input'));}});await stable();
 }
 await layout('Lesen');await p.locator('#next').click();
 assert.equal(await p.locator('#wrongWord').innerText(),'stehlen');assert.equal(await p.locator('#choices').isVisible(),false);assert.equal(await p.locator('#next').isDisabled(),true);
 assert.equal(await p.locator('.question-box').evaluate(e=>getComputedStyle(e).borderRadius),'8px');
 assert.equal(await p.locator('.sentence-word').count(),7);
 const appearances=await p.locator('.sentence-word').evaluateAll(bs=>bs.map(b=>{const s=getComputedStyle(b);return [s.fontFamily,s.fontSize,s.fontWeight,s.color,s.backgroundColor,s.borderWidth,s.textDecorationLine,s.padding,s.boxShadow];}));
 assert.ok(appearances.every(s=>JSON.stringify(s)===JSON.stringify(appearances[0])),'all words must look identical');
 assert.equal(appearances[0][2],'400');assert.equal(appearances[0][6],'none');
 for(let i=0;i<6;i++){await p.locator('[data-token="'+i+'"]').click();assert.equal(await p.locator('#choices').isVisible(),false);assert.equal(await p.locator('#wordGap').count(),0);assert.equal(await p.locator('#next').isDisabled(),true);}
 assert.equal(await p.locator('#taskSentence').innerText(),'Der König wollte Netze für zuhause stehlen.');
 await layout('Fehlerwort');await p.locator('#wrongWord').click();assert.equal(await p.locator('#wrongWord').count(),0);assert.equal(await p.locator('#wordGap').isVisible(),true);
 assert.deepEqual(await p.locator('.word-option').allTextContents(),['kaufen','essen','vergessen']);await layout('Wortauswahl');
 for(const wrong of ['essen','vergessen']){await p.locator('[data-word="'+wrong+'"]').click();assert.equal(await p.locator('#wordGap').isVisible(),true);assert.equal(await p.locator('#next').isDisabled(),true);assert.match(await p.locator('#feedback').innerText(),/noch nicht/);}
 await p.locator('#back').click();await p.locator('#next').click();assert.equal(await p.locator('#wordGap').isVisible(),true);
 await p.locator('[data-word="kaufen"]').click();assert.equal(await p.locator('#answerWord').innerText(),'kaufen');assert.equal(await p.locator('#choices').isVisible(),false);assert.equal(await p.locator('#next').isEnabled(),true);await p.waitForTimeout(450);
 assert.equal(await p.locator('#taskSentence').innerText(),'Der König wollte Netze für zuhause kaufen.');await layout('Gelöst');
 await p.locator('#back').click();await p.locator('#next').click();assert.equal(await p.locator('#answerWord').innerText(),'kaufen');
 await p.locator('#next').click();
 for(const word of ['Pause','Weiterhören','Pause']){await p.locator('#audioToggle').click();assert.match(await p.locator('#audioToggle').innerText(),new RegExp(word));}
 assert.match(await p.evaluate(()=>window.__u.text),/Sechs Pferde begleiteten ihn, zwölf Soldaten und drei Diener/);
 await p.evaluate(()=>window.__u.onend());await p.locator('#audioToggle').click();assert.match(await p.locator('#audioToggle').innerText(),/Pause/);await layout('Zuhören');
 const before=await p.evaluate(()=>window.__speech.filter(x=>x==='cancel').length);await p.locator('#next').click();assert.ok(await p.evaluate(()=>window.__speech.filter(x=>x==='cancel').length)>before);const video=p.locator('#completionVideo'),forward=p.locator('#scene6');
 await video.waitFor();
 assert.equal(await forward.isDisabled(),true);
 await p.waitForFunction(()=>{const video=document.querySelector('#completionVideo');return !video.paused&&video.currentTime>0;});
 assert.equal(await forward.isDisabled(),true);
 await p.waitForFunction(()=>document.querySelector('#completionVideo').ended&&!document.querySelector('#scene6').disabled);
 assert.equal(await forward.getAttribute('aria-label'),'Weiter zu Im Dorf');
 assert.equal(await p.locator('#completionVideoFallback').isVisible(),false);
 await layout('Abschluss');
 await p.locator('#again').click();await p.locator('#next').click();assert.equal(await p.locator('#wrongWord').isVisible(),true);assert.equal(await p.locator('#next').isDisabled(),true);
 await p.locator('#back').click();await p.locator('#back').click();await p.waitForURL('**/szene-4/?abschnitt=abschluss');await p.locator('#scene5').waitFor();await p.locator('#back').click();assert.equal(await p.locator('#check').isVisible(),false);assert.equal(await p.locator('#next').isEnabled(),true);await p.locator('#next').click();await p.locator('#scene5').click();await p.waitForURL('**/szene-5/');
 await p.goto(base+'szene-5/?abschnitt=abschluss');
 await p.waitForFunction(()=>document.querySelector('#completionVideo')?.ended);
 await forward.focus();await p.keyboard.press('Enter');await p.waitForURL('**/szene-6/');
 await p.locator('h1').filter({hasText:'Im Dorf'}).waitFor();
 await p.locator('.brand').click();await p.locator('.scene-menu summary').click();await p.locator('#sceneMenu5').waitFor({state:'visible'});assert.deepEqual(await p.locator('#sceneMenu3,#sceneMenu4,#sceneMenu5').allTextContents(),['Der König']);
 assert.deepEqual(errors,[]);console.log('PASS König: Alle sieben Wörter einheitlich und anklickbar, falsche Wortwahl ohne Freigabe; Illustration, Pergament-Kästchen, Fehlerwort/Lücke, zwei falsche Wörter, richtiges Wort, Rücknavigation, Wiederholung, Kutschen-Video mit automatischer Wiedergabe und Freigabe nach Ende, Übergänge und Menü; '+checks+' Layoutprüfungen. Sprachsteuerung simuliert.');await context.close();
}
run().then(async()=>{if(browser)await browser.close();if(server)server.kill();}).catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.kill();process.exitCode=1;});
