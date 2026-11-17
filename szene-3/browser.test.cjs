'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const live=process.env.SILVANA_BASE_URL;
const base=(live||'http://127.0.0.1:8765/').replace(/\/?$/,'/');
const server=live?null:spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const errors=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
 for(let i=0;i<(live?180:60);i++){
  try{const r=await fetch(base+'szene-3/');if(r.ok){if(!live)return;const code=await fetch(base+'szene-2/?pruefung='+Date.now()).then(x=>x.text());if(code.includes("{location.href='../szene-3/';return}"))return;}}catch{}
  await delay(500);
 }
 throw Error('Server nicht erreichbar: '+base);
}
async function sizeCheck(page,label){
 const result=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));
 assert.ok(result.width<=result.viewport+1,label+': horizontaler Überlauf '+JSON.stringify(result));
}
async function run(){
 await ready();
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 // Nur der Sprachdienst ist simuliert; Navigation, DOM, Bilder und Video sind echt.
 await context.addInitScript(()=>{
  window.__speechCalls=[];
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
   getVoices:()=>[],cancel:()=>window.__speechCalls.push('cancel'),
   speak:u=>{window.__utterance=u;window.__speechCalls.push('speak');},
   pause:()=>window.__speechCalls.push('pause'),resume:()=>window.__speechCalls.push('resume')
  }});
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 await page.goto(base+'szene-2/');
 await page.locator('#next').click();await page.locator('#next').click();
 assert.equal(await page.locator('.crate-preview').count(),3);
 for(const word of ['Stoff','Wege']){
  await page.locator('[data-answer="'+word+'"]').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.crate-preview')].every(b=>!b.disabled));
 }
 await page.locator('[data-answer="Marktplatz"]').click();
 await page.locator('.weather-choice').first().waitFor({state:'visible'});
 assert.equal(await page.locator('.roll-gif').count(),2);
 assert.equal(await page.locator('.roll-gif').evaluateAll(images=>new Set(images.map(i=>i.src)).size),1);
 await page.locator('[data-answer="sun"]').click();
 assert.equal(await page.locator('#next').isVisible(),false);
 await page.locator('[data-answer="rain"]').click();
 try{await page.waitForFunction(()=>document.getElementById('nextAnimation').ended,{},{timeout:20000});}catch(error){console.error('Videozustand:',await page.locator('#nextAnimation').evaluate(v=>({paused:v.paused,ended:v.ended,time:v.currentTime,duration:v.duration,ready:v.readyState,error:v.error&&v.error.message})));throw error;}
 assert.equal(await page.locator('#nextAnimation').evaluate(v=>v.loop),false);
 await page.locator('#next').click();
 await page.waitForURL('**/szene-3/');
 await page.locator('#next').waitFor();
 console.log('PASS: echte Kisten/Rollen/MP4 und animierter Weiter-Button führen zu Szene 3.');
 await page.locator('#next').click();
 await page.waitForFunction(()=>!document.getElementById('answer').disabled);
 const dimensions=await page.locator('#images img').evaluateAll(images=>images.map(i=>({w:i.naturalWidth,h:i.naturalHeight})));
 assert.equal(dimensions.length,2);assert.ok(dimensions[0].w>0);
 assert.deepEqual(dimensions[0],dimensions[1]);
 console.log('PASS: beide Original-Spinnenbilder geladen, gleiche Abmessungen: '+JSON.stringify(dimensions[0]));
 for(const answer of ['Spinnen','Farbe','BLAU']){
  await page.locator('#answer').fill(answer);await page.locator('#check').click();
  assert.equal(await page.locator('#help').isVisible(),false);
  assert.equal(await page.locator('#next').isVisible(),false);
 }
 for(const answer of ['rot','grün','gelb']){await page.locator('#answer').fill(answer);await page.locator('#check').click();}
 assert.equal(await page.locator('#help').isVisible(),true);
 assert.equal(await page.locator('#letterRow input').count(),4);
 assert.equal(await page.locator('#letterRow input[readonly]').count(),1);
 for(let i=0;i<4;i++){
  const field=page.locator('#letterRow input').nth(i);
  if(!await field.evaluate(el=>el.readOnly))await field.fill('grau'[i]);
 }
 await page.locator('#checkHelp').click();
 assert.equal(await page.locator('#next').isVisible(),true);
 console.log('PASS: Teilantworten, drei falsche Antworten, Hilfe mit vier Feldern und richtige Lösung.');
 const views=[[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]];
 const zooms=[[100,100],[160,100],[100,160],[160,160]];
 let checks=0;
 async function layout(){
  for(const [w,h] of views){
   await page.setViewportSize({width:w,height:h});
   for(const [text,board] of zooms){
    await page.evaluate(([text,board])=>{
     for(const [id,value] of [['textSize',text],['boardSize',board]]){
      const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));
     }
    },[text,board]);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await sizeCheck(page,w+'x'+h+' '+text+'/'+board);checks++;
   }
  }
 }
 await layout();
 await page.locator('#next').click();await layout();
 await page.locator('#audioToggle').click();assert.match(await page.locator('#audioToggle').innerText(),/Pause/);
 await page.locator('#audioToggle').click();assert.match(await page.locator('#audioToggle').innerText(),/Weiterhören/);
 await page.locator('#audioToggle').click();assert.match(await page.locator('#audioToggle').innerText(),/Pause/);
 await page.locator('#restartAudio').click();
 const calls=await page.evaluate(()=>window.__speechCalls);
 assert.ok(calls.includes('speak')&&calls.includes('pause')&&calls.includes('resume'));
 await page.locator('#next').click();await layout();
 await page.locator('#back').click();await page.locator('#back').click();
 await page.locator('#back').click();await layout();
 await page.locator('#back').click();
 await page.waitForURL('**/szene-2/?abschnitt=abschluss');
 await page.locator('#scene3').waitFor();
 await page.locator('#scene3').click();await page.waitForURL('**/szene-3/');
 await page.locator('.brand').click();
 await page.locator('.scene-menu summary').click();
 await page.locator('#sceneMenu3').waitFor({state:'visible'});
 console.log('PASS: Rücknavigation zum Szene-2-Abschluss, Wiederbesuch, Menüfreischaltung.');
 assert.deepEqual(errors,[]);
 console.log('PASS: '+checks+' Layoutprüfungen, sechs Smartphone/Tablet-Viewports, vier getrennte Zoomkombinationen. Keine JS- oder HTTP-Fehler.');
 await context.close();
}
run().then(async()=>{if(browser)await browser.close();if(server)server.kill();}).catch(async error=>{
 console.error(error);if(browser)await browser.close();if(server)server.kill();process.exitCode=1;
});
