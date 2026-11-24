'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const live=process.env.SILVANA_BASE_URL;
const base=(live||'http://127.0.0.1:8766/').replace(/\/?$/,'/');
const server=live?null:spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
 for(let i=0;i<180;i++){try{const r=await fetch(base+'vorschau-einfuehrung/?test='+Date.now());if(r.ok&&(await r.text()).includes('parchment-actions.js'))break;}catch{}if(i===179)throw Error('Aktuelle Einführung nicht erreichbar');await sleep(500);}
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'vorschau-einfuehrung/');
 async function stable(){await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 await stable();
 for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});
  for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){
   await page.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}},[text,board]);
   await stable();
   const art=await page.locator('#introTitle').boundingBox(),brand=await page.locator('.brand').boundingBox();
   assert.ok(art.y>=brand.y+brand.height,'Titelbild unter dem Namenskopf');
   assert.equal(await page.locator('.brand').evaluate(e=>e.nextElementSibling.id),'introTitle');
   assert.equal(await page.locator('.chapterline, .steps').count(),0);
   for(const selector of ['#settingsToggle','#sceneMenu','.reading-layout','.restore']){
    const element=page.locator(selector);if(await element.count())assert.ok((await element.boundingBox()).y>=art.y+art.height,selector+' muss unter dem Titelbild stehen');
   }
   assert.equal(await page.locator('#game img.landscape').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Kein horizontaler Überlauf');
  }
 }
 // Wiederbesuch mit gespeichertem Stand darf das Bild nicht nach unten schieben.
 await page.reload();await stable();await page.locator('#toRead').waitFor();
 const hero=await page.locator('#introTitle').boundingBox();
 assert.equal(await page.locator('.restore').count(),0);
 assert.ok((await page.locator('#settingsToggle').boundingBox()).y>=hero.y+hero.height);
 console.log('PASS: Titelbild unmittelbar unter dem Namenskopf vor sämtlichen Bedienelementen; 24 Ansichten und Wiederbesuch mit gespeichertem Stand.');
 await page.setViewportSize({width:412,height:915});
 await page.evaluate(()=>{for(const id of ['textSize','boardSize']){const e=document.getElementById(id);e.value=100;e.dispatchEvent(new Event('input',{bubbles:true}));}});
 await stable();await page.locator('#toRead').click();
 async function navigation(){
  const r=await page.locator('.scene-navigation').evaluate(g=>{const ns=g.querySelector('.primary, .completion-video').getBoundingClientRect(),bs=g.querySelector('.secondary').getBoundingClientRect();return {next:{x:ns.x,y:ns.y,w:ns.width,h:ns.height},back:{x:bs.x,y:bs.y,w:bs.width,h:bs.height}}});
  assert.ok(r.back.x+r.back.w<=r.next.x||r.next.y+r.next.h<=r.back.y+1,'Weiter rechts oder über Zurück');
  assert.ok(r.next.h>=48&&r.back.h>=48,'Große Bedienflächen');
 }
 await navigation();await page.locator('#toDomino').click();
 const ids=()=>page.locator('#chain .tile').evaluateAll(bs=>bs.map(b=>Number(b.dataset.id)));
 for(const id of [0,1,2])await page.locator('#bank [data-id="'+id+'"]').click();
 assert.deepEqual(await ids(),[0,1,2]);
 assert.match(await page.locator('#left').innerText(),/oben/);
 assert.match(await page.locator('#right').innerText(),/unten/);
 await page.locator('#chain [data-id="2"]').click();await page.locator('#left').click();assert.deepEqual(await ids(),[0,2,1]);
 await page.locator('#right').click();assert.deepEqual(await ids(),[0,1,2]);
 // Real mouse pointer input exercises the same captured-pointer path as touch.
 async function drag(id,target,after=false,cancel=false){
  await stable();await page.locator('#chain').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await stable();
  const a=await page.locator('#chain [data-id="'+id+'"]').boundingBox(),b=await page.locator('#chain [data-id="'+target+'"]').boundingBox();
  const vertical=await page.locator('#chain').evaluate(e=>getComputedStyle(e).flexDirection==='column');
  const x=vertical?b.x+b.width/2:b.x+b.width*(after?.8:.2),y=vertical?b.y+b.height*(after?.8:.2):b.y+b.height/2;
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(x,y,{steps:8});
  try{await page.locator('#dropLine').waitFor({state:'visible',timeout:5000});}catch(e){console.error('Drag-Diagnose:',await page.evaluate(()=>({drag:activeDrag&&{started:activeDrag.started,id:activeDrag.id,x:activeDrag.x,y:activeDrag.y,position:activeDrag.position},chain:document.getElementById('chain').getBoundingClientRect().toJSON(),scroll:scrollY,height:innerHeight})));throw e;}
  if(cancel){await page.dispatchEvent('#chain [data-id="'+id+'"]','pointercancel',{pointerId:1});}
  await page.mouse.up();
  assert.equal(await page.locator('#dropLine').count(),0);
 }
 await drag(2,0);assert.deepEqual(await ids(),[2,0,1]);
 await drag(2,1,true);assert.deepEqual(await ids(),[0,1,2]);
 // Touch events through Chrome's input protocol, with real touch identifiers/capture.
 const cdp=await context.newCDPSession(page);
 await stable();await page.locator('#chain').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await stable();
 let a=await page.locator('#chain [data-id="2"]').boundingBox(),b=await page.locator('#chain [data-id="0"]').boundingBox();
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:3}]});
 await touch('touchStart',a.x+a.width/2,a.y+a.height/2);
 await touch('touchMove',b.x+b.width/2,b.y+b.height*.2);
 try{await page.locator('#dropLine').waitFor({state:'visible',timeout:5000});}catch(e){console.error('Drag-Diagnose:',await page.evaluate(()=>({drag:activeDrag&&{started:activeDrag.started,id:activeDrag.id,x:activeDrag.x,y:activeDrag.y,position:activeDrag.position},chain:document.getElementById('chain').getBoundingClientRect().toJSON(),scroll:scrollY,height:innerHeight})));throw e;}await touch('touchEnd');
 assert.deepEqual(await ids(),[2,0,1]);
 await drag(2,1,true);assert.deepEqual(await ids(),[0,1,2]);
 await touch('touchStart',a.x+a.width/2,a.y+a.height/2);await touch('touchMove',b.x+b.width/2,b.y+b.height*.2);await touch('touchCancel');
 assert.deepEqual(await ids(),[0,1,2]);assert.equal(await page.locator('#dropLine').count(),0);
 await page.setViewportSize({width:2000,height:1600});
 await page.waitForFunction(()=>document.getElementById('left').textContent.includes('links'));
 assert.match(await page.locator('#left').innerText(),/links/);assert.match(await page.locator('#right').innerText(),/rechts/);
 await drag(2,0);assert.deepEqual(await ids(),[2,0,1]);await drag(2,1,true);assert.deepEqual(await ids(),[0,1,2]);
 await page.locator('#chain [data-id="1"]').click();await page.locator('#return').click();assert.deepEqual(await ids(),[0,2]);
 await page.locator('#bank [data-id="1"]').scrollIntoViewIfNeeded();
 a=await page.locator('#bank [data-id="1"]').boundingBox();b=await page.locator('#chain [data-id="2"]').boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width*.2,b.y+b.height/2,{steps:8});
 try{await page.locator('#dropLine').waitFor({state:'visible',timeout:5000});}catch(e){console.error('Drag-Diagnose:',await page.evaluate(()=>({drag:activeDrag&&{started:activeDrag.started,id:activeDrag.id,x:activeDrag.x,y:activeDrag.y,position:activeDrag.position},chain:document.getElementById('chain').getBoundingClientRect().toJSON(),scroll:scrollY,height:innerHeight})));throw e;}await page.mouse.up();assert.deepEqual(await ids(),[0,1,2]);
 let layouts=0;
 for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});
  for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){
   await page.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}},[text,board]);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await navigation();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.match(await page.locator('#left').innerText(),height>width?/oben/:/links/);layouts++;
  }
 }
 assert.equal(await page.locator('#hint').isVisible(),true);
 assert.equal(await page.locator('#check').isVisible(),true);
 await page.locator('#check').click();assert.equal(await page.locator('#finish').isEnabled(),true);
 assert.equal(await page.locator('#hint').isVisible(),false);
 assert.equal(await page.locator('#check').isVisible(),false);
 await page.locator('#chain [data-id="2"]').click();await page.locator('#left').click();
 assert.equal(await page.locator('#hint').isVisible(),true);
 assert.equal(await page.locator('#check').isVisible(),true);
 await page.locator('#right').click();await page.locator('#check').click();
 assert.equal(await page.locator('#hint').isVisible(),false);
 assert.equal(await page.locator('#check').isVisible(),false);
 await page.locator('#finish').click();await navigation();
 const next=page.locator('#scene2'),video=page.locator('#completionVideo');
 assert.equal(await next.isEnabled(),false);
 await video.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>{const video=document.getElementById('completionVideo');return video.currentTime>0&&!video.ended;});
 assert.equal(await next.isEnabled(),false);
 await page.waitForFunction(()=>document.getElementById('completionVideo').ended);
 assert.equal(await next.isEnabled(),true);
 assert.equal(await page.locator('#completionVideoFallback').isVisible(),false);
 for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});
  for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){
   await page.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}},[text,board]);
   await stable();
   await navigation();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const bounds=await video.boundingBox();
   assert.ok(Math.abs(bounds.height-bounds.width*350/356)<1,'Videoproportionen');
  }
 }
 await page.locator('#back').click();assert.deepEqual(await ids(),[0,1,2]);
 await page.locator('#finish').click();
 await video.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.getElementById('completionVideo').ended);
 await next.click();
 await page.waitForURL('**/szene-2/');
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('silvana-completed-scenes-v1')).includes(1)));

 // Falls Autoplay gesperrt ist, bleibt die Navigation über den Textbutton erreichbar.
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Autoplay gesperrt','NotAllowedError'));});
 await page.goto(base+'vorschau-einfuehrung/?abschnitt=abschluss');
 await next.scrollIntoViewIfNeeded();
 await page.locator('#completionVideoFallback').waitFor({state:'visible'});
 await next.press('Enter');
 await page.waitForURL('**/szene-2/');
 console.log('PASS: Einmalige Weiter-Animation, Sperre während des Videos, Ziel und Ersatzschaltfläche; 24 Abschlusslayouts.');
 assert.deepEqual(errors,[]);
 console.log('PASS: Domino per Maus und echtem Touch-Pointer in beide Richtungen einsortiert; Einfügelinie, Abbruch, Richtungstexte, Rücknavigation und '+layouts+' Layoutprüfungen bestanden.');
 await context.close();
}
run().then(async()=>{if(browser)await browser.close();if(server)server.kill();}).catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.kill();process.exitCode=1;});

