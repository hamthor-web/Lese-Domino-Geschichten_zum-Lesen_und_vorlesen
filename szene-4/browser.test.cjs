'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const live=process.env.SILVANA_BASE_URL;
const base=(live||'http://127.0.0.1:8765/').replace(/\/?$/,'/');
const server=live?null:spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;const errors=[];
async function run(){
 for(let i=0;i<180;i++){try{const r=await fetch(base+'szene-4/');if(r.ok&&(await r.text()).includes('scene.js?v=3'))break;}catch{}if(i===179)throw Error('Szene 4 fehlt');await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true});
 await context.addInitScript(()=>{
 window.__speech=[];
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel:()=>window.__speech.push('cancel'),speak:u=>{window.__u=u;window.__speech.push('speak');},pause:()=>window.__speech.push('pause'),resume:()=>window.__speech.push('resume')}});
 Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
 });
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 await p.goto(base+'szene-4/');await p.locator('#audioToggle').waitFor();
 for(const word of ['Pause','Weiterhören','Pause']){await p.locator('#audioToggle').click();assert.match(await p.locator('#audioToggle').innerText(),new RegExp(word));}
 await p.evaluate(()=>window.__u.onend());await p.locator('#audioToggle').click();assert.match(await p.locator('#audioToggle').innerText(),/Pause/);
 assert.match(await p.evaluate(()=>window.__u.text),/verlorene Tannennadel/);
 let checks=0;
 async function layout(){
 for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){
 await p.setViewportSize({width,height});
 for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){
 await p.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const x=document.getElementById(id);x.value=v;x.dispatchEvent(new Event('input'));}},[text,board]);
 await p.waitForTimeout(60);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
 assert.ok(await p.locator('button:visible').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.width<=innerWidth+1&&b.scrollHeight<=b.clientHeight+2;})),'clipped button');checks++;
 }}
 await p.setViewportSize({width:412,height:915});await p.evaluate(()=>{for(const id of ['textSize','boardSize']){const x=document.getElementById(id);x.value=100;x.dispatchEvent(new Event('input'));}});
 }
 await layout();await p.locator('#next').click();assert.match(await p.locator('.reading').innerText(),/Ein Händler wollte einmal/);await layout();
 await p.locator('#next').click();assert.equal(await p.locator('.tile').count(),3);await p.waitForFunction(()=>[...document.querySelectorAll('.card-image')].length===3&&[...document.querySelectorAll('.card-image')].every(i=>i.complete&&i.naturalWidth>0));
 assert.deepEqual(await p.locator('.tile').evaluateAll(bs=>bs.map(b=>({id:Number(b.dataset.id),src:b.querySelector('img').getAttribute('src')}))),[{id:2,src:'assets/haendler-rest.webp'},{id:0,src:'assets/haendler-netz.webp'},{id:1,src:'assets/haendler-faeden.webp'}]);await layout();
 const order=()=>p.locator('.tile').evaluateAll(bs=>bs.map(b=>Number(b.dataset.id)));
 await p.locator('#check').click();assert.deepEqual(await order(),[2,0,1]);assert.equal(await p.locator('#next').isDisabled(),true);
 await p.locator('[data-id="2"]').click();await p.locator('#right').click();await p.locator('#right').click();assert.deepEqual(await order(),[0,1,2]);
 await p.locator('#check').click();assert.equal(await p.locator('#next').isEnabled(),true);assert.equal(await p.locator('#check').isVisible(),false);assert.equal(await p.locator('#hint').isVisible(),false);
 await p.locator('#back').click();await p.locator('#next').click();assert.deepEqual(await order(),[0,1,2]);
 // True pointer drag with visible insertion line and drop.
 await p.setViewportSize({width:1024,height:2200});
 const first=p.locator('[data-id="2"]');await first.scrollIntoViewIfNeeded();let a=await first.boundingBox(),b=await p.locator('[data-id="0"]').boundingBox();
 await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+2,{steps:12});await p.locator('#dropLine').waitFor();await p.mouse.up();assert.deepEqual(await order(),[2,0,1]);assert.equal(await p.locator('#check').isVisible(),true);assert.equal(await p.locator('#hint').isVisible(),true);
 // Touch-pointer path uses the same captured-pointer handler.
 await p.locator('#right').click();await p.locator('#right').click();
 const cdp=await context.newCDPSession(p);
 a=await p.locator('[data-id="2"]').boundingBox();b=await p.locator('[data-id="0"]').boundingBox();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+b.width/2,y:b.y+2}]});
 await p.locator('#dropLine').waitFor();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.deepEqual(await order(),[2,0,1]);
 await p.locator('#right').click();await p.locator('#right').click();
 await p.locator('#check').click();await p.locator('#next').click();await layout();
 assert.equal(await p.locator('.result li').count(),3);await p.locator('#back').click();assert.deepEqual(await order(),[0,1,2]);
 await p.locator('#next').click();await p.locator('#again').click();await p.locator('#next').click();await p.locator('#next').click();assert.deepEqual(await order(),[2,0,1]);assert.equal(await p.locator('#next').isDisabled(),true);
 await p.goto(base+'szene-3/?abschnitt=abschluss');await p.locator('#scene4').click();await p.waitForURL('**/szene-4/');await p.locator('#back').click();await p.waitForURL('**/szene-3/?abschnitt=abschluss');await p.locator('#scene4').waitFor();
 await p.locator('.brand').click();await p.locator('.scene-menu summary').click();await p.locator('#sceneMenu4').waitFor({state:'visible'});
 assert.deepEqual(errors,[]);console.log('PASS Händler: Audio-Steuerung (simulierte Stimme), Texte, Reihenfolgeprüfung, Bilder gemeinsam mit Satzkarten, Ausblenden der Prüfhilfen, Pfeile, Mausziehen/Einfügelinie, Zustand bei Rücknavigation, Wiederholung, Übergänge und Menü; '+checks+' Layoutprüfungen.');await context.close();
}
run().then(async()=>{if(browser)await browser.close();if(server)server.kill();}).catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.kill();process.exitCode=1;});

