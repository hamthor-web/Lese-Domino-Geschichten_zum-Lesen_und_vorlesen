'use strict';
const assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const live=process.env.SILVANA_BASE_URL,base=(live||'http://127.0.0.1:8770/').replace(/\/?$/,'/');
const server=live?null:spawn('python3',['-m','http.server','8770','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;const errors=[];
async function run(){
 for(let i=0;i<180;i++){try{if((await fetch(base+'szene-7/?test='+Date.now())).ok)break;}catch{}if(i===179)throw Error('Szene 7 fehlt');await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{channel:'chrome'})});
 const ctx=await browser.newContext({viewport:{width:412,height:915},hasTouch:true});
 await ctx.addInitScript(()=>{window.__speech=[];Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel:()=>window.__speech.push('cancel'),speak:u=>{window.__u=u;window.__speech.push('speak');},pause:()=>window.__speech.push('pause'),resume:()=>window.__speech.push('resume')}});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});
 await p.goto(base+'szene-7/');await p.locator('#next').waitFor();let checks=0;
 async function layout(label){for(const [width,height] of [[360,800],[800,360],[412,915],[915,412],[768,1024],[1024,768]]){await p.setViewportSize({width,height});for(const [text,board] of [[100,100],[160,100],[100,160],[160,160]]){await p.evaluate(([t,b])=>{for(const [id,v] of [['textSize',t],['boardSize',b]]){const el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('input'));}},[text,board]);await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' overflow '+width+' '+text+'/'+board);assert.ok(await p.locator('button:visible:not(.hotspot)').evaluateAll(bs=>bs.every(b=>b.scrollHeight<=b.clientHeight+2&&b.getBoundingClientRect().width<=innerWidth+1)),label+' clipped button');assert.ok(await p.locator('.forest-board img').evaluateAll(imgs=>imgs.every(i=>Math.abs(i.clientWidth/i.clientHeight-4/3)<.02)),label+' image proportion');checks++;}}await p.setViewportSize({width:412,height:915});await p.evaluate(()=>{for(const id of ['textSize','boardSize']){const el=document.getElementById(id);el.value=100;el.dispatchEvent(new Event('input'));}});}
 await layout('Hören');for(const word of ['Pause','Weiterhören','Pause']){await p.locator('#audioToggle').click();assert.match(await p.locator('#audioToggle').innerText(),new RegExp(word));}assert.match(await p.evaluate(()=>window.__u.text),/Schließlich blieben sie vor einem Haselstrauch stehen/);assert.match(await p.evaluate(()=>window.__u.text),/„Das haben wir.“/);await p.evaluate(()=>window.__u.onend());await p.locator('#audioToggle').click();await p.locator('#next').click();assert.equal(await p.locator('.reading').isVisible(),true);await layout('Lesen');await p.locator('#next').click();
 await p.waitForFunction(()=>[...document.querySelectorAll('.forest-board img')].every(i=>i.complete&&i.naturalWidth===1536));assert.equal(await p.locator('#next').isDisabled(),true);await layout('Suchen');const data=await(await fetch(base+'szene-7/content.json')).json();
 for(const side of [0,1]){
  if(side){await p.goto(base+'szene-7/');await p.locator('#next').click();await p.locator('#next').click();}
  for(let i=0;i<data.differences.length;i++)for(let area=0;area<data.differences[i].areas.length;area++){await p.locator('.hotspot[data-side="'+side+'"][data-diff="'+i+'"][data-area="'+area+'"]').click();assert.match(await p.locator('#questionTitle').innerText(),new RegExp('Bild '+(side?1:2)));assert.deepEqual((await p.locator('[data-word]').allTextContents()).sort(),[...data.differences[i].options[side]].sort());}
  if(!side)await layout('Wortauswahl');
  for(let i=0;i<data.differences.length;i++){await p.locator('.hotspot[data-side="'+side+'"][data-diff="'+i+'"]').first().click();const d=data.differences[i],correct=d.words[1-side],wrong=d.options[side].find(w=>w!==correct);await p.locator('[data-word="'+wrong+'"]').click();assert.match(await p.locator('#feedback').innerText(),/noch nicht/);assert.equal(await p.locator('#next').isDisabled(),true);await p.locator('[data-word="'+correct+'"]').click();assert.match(await p.locator('#progress').innerText(),new RegExp('^'+(i+1)+' von 6'));assert.equal(await p.locator('.hotspot.found[data-diff="'+i+'"]').count(),2*d.areas.length);await p.locator('.hotspot[data-side="'+(1-side)+'"][data-diff="'+i+'"]').first().click();assert.match(await p.locator('#progress').innerText(),new RegExp('^'+(i+1)+' von 6'));}
  assert.equal(await p.locator('#next').isEnabled(),true);if(!side)await layout('Gelöst');await p.locator('#back').click();await p.locator('#next').click();assert.match(await p.locator('#progress').innerText(),/^6 von 6/);await p.locator('#next').click();if(!side)await layout('Abschluss');await p.locator('#again').click();await p.locator('#next').click();await p.locator('#next').click();assert.match(await p.locator('#progress').innerText(),/^0 von 6/);
 }
 await p.locator('#back').click();await p.locator('#back').click();await p.locator('#back').click();await p.waitForURL('**/szene-6/?abschnitt=abschluss');await p.locator('#scene7').waitFor();await p.locator('#scene7').click();await p.waitForURL('**/szene-7/');
 for(const path of ['vorschau-einfuehrung/','szene-3/','szene-4/','szene-5/','szene-6/']){await p.goto(base+path);await p.locator('.scene-menu summary').click();await p.getByRole('link',{name:'Der König im Wald',exact:true}).waitFor({state:'visible'});assert.equal(await p.locator('.scene-menu nav a').last().innerText(),'Der König im Wald');}
 const transition = await ctx.newPage();
 await transition.addInitScript(() => {
  document.addEventListener('play', event => {
   if (event.target.id === 'scene7-next-video') {
    window.transitionWasLocked = document.getElementById('scene8').disabled;
   }
  }, true);
 });
 await transition.goto(base+'szene-7/?abschnitt=abschluss');
 const video = transition.locator('#scene7-next-video');
 const nextScene = transition.locator('#scene8');
 await transition.waitForFunction(() => document.getElementById('scene7-next-video')?.ended);
 assert.equal(await transition.evaluate(() => window.transitionWasLocked), true);
 assert.equal(await nextScene.isEnabled(), true);
 assert.equal(await video.evaluate(movie => movie.loop), false);
 assert.equal(await transition.locator('#scene7-video-fallback').isVisible(), false);
 assert.match(transition.url(), /szene-7/);
 assert.deepEqual(await nextScene.evaluate(button => {
  const style = getComputedStyle(button);
  return [style.backgroundImage, style.backgroundColor, style.borderTopWidth, style.boxShadow];
 }), ['none', 'rgba(0, 0, 0, 0)', '0px', 'none']);
 await nextScene.click();
 await transition.waitForURL('**/szene-8/');

 const blocked = await ctx.newPage();
 await blocked.addInitScript(() => {
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
   if (this.id === 'scene7-next-video' && !this.dataset.retried) {
    this.dataset.retried = 'true';
    return Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'));
   }
   return play.call(this);
  };
 });
 await blocked.goto(base+'szene-7/?abschnitt=abschluss');
 await blocked.getByRole('button', {name: 'Würstchen-Animation abspielen'}).click();
 await blocked.waitForFunction(() => document.getElementById('scene7-next-video').ended);
 await blocked.getByRole('button', {name: 'Weiter zu Szene 8'}).click();
 await blocked.waitForURL('**/szene-8/');

 const missing = await ctx.newPage();
 await missing.route('**/Wuerstchen_Animation.mp4', route => route.abort());
 await missing.goto(base+'szene-7/?abschnitt=abschluss');
 const fallback = missing.getByRole('button', {name: 'Weiter zu Szene 8'});
 assert.equal(await fallback.innerText(), 'Weiter zu Szene 8');
 await fallback.click();
 await missing.waitForURL('**/szene-8/');
 assert.deepEqual(errors,[]);console.log('PASS Szene 7: alle Trefferflächen beider Bilder, sechs Gruppen, zwölf Wortrichtungen, falsche Wahl, keine Doppelzählung, Freigabe, Rücknavigation, Wiederholung, Audio, Übergang und Menüs; '+checks+' Layoutprüfungen. Sprachdienst simuliert.');await ctx.close();
}
run().then(async()=>{if(browser)await browser.close();if(server)server.kill();}).catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.kill();process.exitCode=1;});
