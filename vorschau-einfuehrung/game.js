'use strict';
const $=id=>document.getElementById(id);
const KEY='silvana-intro-v1';
const VISITED_KEY='silvana-visited-scenes-v1';
function scene2Visited(){try{return Number(localStorage.getItem(VISITED_KEY))>=2;}catch{return false;}}
function markScene2Visited(){try{localStorage.setItem(VISITED_KEY,String(Math.max(2,Number(localStorage.getItem(VISITED_KEY))||0)));}catch{}}
function updateSceneMenu(){
 const next=$('sceneMenu2');
 if(next)next.hidden=!scene2Visited();
 try{
  if(next&&Number(localStorage.getItem(VISITED_KEY))>=3&&!$('sceneMenu3')){
   const link=document.createElement('a');link.id='sceneMenu3';link.href='../szene-3/';link.textContent='Die Spinnen im Wald';next.parentElement.append(link);
  }
 }catch{}

}

let content,phase=0,furthest=0,placed=[],order=[2,0,1],selected=null,solved=false,feedback='',hadError=false,saved=null;
let audioState='idle',audioToken=0,currentUtterance=null;
const audioAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
let buttonSizingFrame=0;
function scheduleButtonSizing(){
 if(typeof requestAnimationFrame!=='function')return;
 cancelAnimationFrame(buttonSizingFrame);
 buttonSizingFrame=requestAnimationFrame(equalizeButtons);
}
function equalizeButtons(){
 const buttons=[...document.querySelectorAll('button.primary,button.secondary,button.quiet')].filter(b=>b.getClientRects().length);
 if(!buttons.length)return;
 // Measure every label at its natural size before choosing the shared size.
 for(const b of buttons){b.style.width='max-content';b.style.maxWidth='none';b.style.height='auto';b.style.flexShrink='0';}
 const naturalWidth=Math.ceil(Math.max(...buttons.map(b=>b.getBoundingClientRect().width)));
 const limits=[];
 for(const b of buttons)for(let p=b.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),inner=Math.min(p.clientWidth,p.getBoundingClientRect().width-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth));limits.push(inner-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight));}
 const availableWidth=Math.floor(Math.min(...limits));
 const width=Math.max(1,Math.min(naturalWidth,availableWidth));
 for(const b of buttons){b.style.width=width+'px';b.style.maxWidth='100%';}
 const height=Math.ceil(Math.max(...buttons.map(b=>b.getBoundingClientRect().height)));
 for(const b of buttons)b.style.height=height+'px';
}
if(typeof MutationObserver==='function')new MutationObserver(scheduleButtonSizing).observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',()=>{scheduleButtonSizing();updateMoveLabels();});
if(document.fonts){document.fonts.ready.then(scheduleButtonSizing);document.fonts.addEventListener('loadingdone',scheduleButtonSizing);}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function loadSaved(){try{const x=JSON.parse(localStorage.getItem(KEY));if(!x)return;const goodIds=a=>Array.isArray(a)&&a.every(i=>Number.isInteger(i)&&i>=0&&i<3)&&new Set(a).size===a.length;if(Number.isInteger(x.phase)&&x.phase>=0&&x.phase<=3&&goodIds(x.placed)&&goodIds(x.order)&&x.order.length===3){saved=x;}if([90,100,110,120,130,140,150,160].includes(x.text))$('textSize').value=x.text;if([80,90,100,110,120,130,140,150,160].includes(x.board))$('boardSize').value=x.board;}catch{}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({phase,furthest,placed,order,solved,text:Number($('textSize').value),board:Number($('boardSize').value)}));}catch{}}
function sizes(){document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);$('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';updateMoveLabels();}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.every((n,i)=>n===i))a.reverse();return a;}
function stopAudio(){audioToken++;currentUtterance=null;if(audioAvailable)speechSynthesis.cancel();audioState='idle';}
function updateAudio(){const toggle=$('audioToggle'),status=$('audioStatus');if(!toggle||!status)return;toggle.textContent=audioState==='playing'?'Ⅱ Pause':audioState==='paused'?'▶ Weiterhören':audioState==='ended'?'↻ Noch einmal hören':'▶ Geschichte anhören';status.textContent=!audioAvailable?'Dein Browser kann hier nicht vorlesen. Du kannst den Originaltext aufklappen.':audioState==='playing'?'Die Geschichte wird vorgelesen.':audioState==='paused'?'Die Geschichte ist angehalten.':audioState==='ended'?'Das war der Anfang von Silvana.':audioState==='error'?'Die Stimme konnte nicht starten. Versuche es erneut oder klappe den Originaltext auf.':'Mach es dir gemütlich und höre zu.';toggle.disabled=!audioAvailable;}
function speak(){if(!audioAvailable)return;stopAudio();const token=audioToken;const u=new SpeechSynthesisUtterance(content.original);currentUtterance=u;u.lang='de-DE';u.rate=.85;const voices=speechSynthesis.getVoices();const voice=voices.find(v=>/^de[-_]/i.test(v.lang));if(voice)u.voice=voice;u.onend=()=>{if(token!==audioToken)return;audioState='ended';currentUtterance=null;updateAudio();};u.onerror=e=>{if(token!==audioToken||e.error==='canceled'||e.error==='interrupted')return;audioState='error';updateAudio();};audioState='playing';updateAudio();speechSynthesis.speak(u);}
function toggleAudio(){if(!audioAvailable)return;if(audioState==='playing'){speechSynthesis.pause();audioState='paused';updateAudio();}else if(audioState==='paused'){speechSynthesis.resume();audioState='playing';updateAudio();}else speak();}
function changePhase(n){if(n<0||n>3)return;finishTileDrag(false);stopAudio();phase=n;furthest=Math.max(furthest,n);selected=null;feedback='';hadError=false;saved=null;persist();render();$('main').focus();$('main').scrollIntoView({block:'start'});}
function tileText(id,index){let text=content.tiles[id];if(index===0)text=text.charAt(0).toUpperCase()+text.slice(1);else if(id===0)text='das'+text.slice(3);return text;}
function move(id,pos){if(!Number.isInteger(id)||id<0||id>2||!Number.isInteger(pos)||pos<0||pos>placed.length)return;const old=placed.indexOf(id);if(old!==-1){placed.splice(old,1);if(old<pos)pos--;}placed.splice(pos,0,id);changed();}
function changed(){solved=false;selected=null;feedback='';hadError=false;persist();renderBoard();}
function removeTile(){if(selected===null)return;placed=placed.filter(i=>i!==selected);changed();}
function shiftTile(delta){if(selected===null)return;const i=placed.indexOf(selected),j=i+delta;if(j<0||j>=placed.length)return;[placed[i],placed[j]]=[placed[j],placed[i]];const active=selected;changed();selected=active;renderBoard();}
function check(){selected=null;solved=placed.length===3&&placed.every((id,i)=>id===i);hadError=!solved;feedback=solved?'Das passt! Lies deinen Satz noch einmal.':placed.length<3?'Dein Satz ist noch nicht vollständig. Lege auch die übrigen Steine dazu.':'Lies deinen Satz noch einmal. Passt die Reihenfolge? Du kannst die Steine selbst umstellen.';persist();renderBoard();}
function hint(){feedback=placed[0]===0?'Was erfährst du zuerst über das Land? Lege danach den Stein mit den zwei Dörfern.':'Mit „Das kleine Land“ kann dein Satz beginnen.';hadError=false;renderBoard();}
let ignoreTileClickUntil=0,activeDrag=null;
function verticalBoard(){const chain=$('chain');return !!chain&&getComputedStyle(chain).flexDirection==='column';}
function updateMoveLabels(){
 if(!$('left'))return;
 const vertical=verticalBoard();
 $('left').textContent=vertical?'↑ Nach oben':'← Nach links';
 $('right').textContent=vertical?'Nach unten ↓':'Nach rechts →';
}
function insertionAt(x,y){
 const tiles=[...$('chain').querySelectorAll('.tile')];
 if(!tiles.length)return 0;
 if(verticalBoard()){
  const index=tiles.findIndex(t=>y<t.getBoundingClientRect().top+t.getBoundingClientRect().height/2);
  return index<0?tiles.length:index;
 }
 let nearest=0,distance=Infinity;
 tiles.forEach((t,i)=>{const r=t.getBoundingClientRect(),dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),d=dx*dx+dy*dy;if(d<distance){distance=d;nearest=i;}});
 const r=tiles[nearest].getBoundingClientRect();
 return nearest+(x>=r.left+r.width/2?1:0);
}
function dragTarget(d){
 const chain=$('chain'),r=chain.getBoundingClientRect();
 const inside=d.x>=r.left-8&&d.x<=r.right+8&&d.y>=r.top-8&&d.y<=r.bottom+8;
 d.position=inside?insertionAt(d.x,d.y):null;
 let line=$('dropLine');
 if(!inside){if(line)line.remove();return;}
 if(!line){line=document.createElement('div');line.id='dropLine';line.className='drop-line';line.setAttribute('aria-hidden','true');document.body.append(line);}
 const tiles=[...chain.querySelectorAll('.tile')],vertical=verticalBoard();
 const target=tiles[Math.min(d.position,tiles.length-1)];
 const t=target?target.getBoundingClientRect():r;
 if(vertical){const y=target?(d.position===tiles.length?t.bottom+6:t.top-6):r.top+20;Object.assign(line.style,{left:(t.left+4)+'px',top:(y-2)+'px',width:Math.max(20,t.width-8)+'px',height:'4px'});}
 else{const x=target?(d.position===tiles.length?t.right+6:t.left-6):r.left+20;Object.assign(line.style,{left:(x-2)+'px',top:(t.top+4)+'px',width:'4px',height:Math.max(30,t.height-8)+'px'});}
}
function finishTileDrag(commit){
 const d=activeDrag;if(!d)return;
 activeDrag=null;cancelAnimationFrame(d.frame);d.button.classList.remove('dragging');
 const line=$('dropLine');if(line)line.remove();
 if(d.button.hasPointerCapture(d.pointer))d.button.releasePointerCapture(d.pointer);
 if(!d.started)return;
 ignoreTileClickUntil=Date.now()+400;
 if(!commit)return;
 if(d.position!==null)move(d.id,d.position);
 else{const r=$('bank').getBoundingClientRect();if(d.x>=r.left&&d.x<=r.right&&d.y>=r.top&&d.y<=r.bottom&&placed.includes(d.id)){selected=d.id;removeTile();}}
}
function attachTileDrag(button,id){
 button.onpointerdown=e=>{
  if(!e.isPrimary||e.button!==0)return;
  finishTileDrag(false);
  activeDrag={button,id,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,started:false,position:null,frame:0};
  button.setPointerCapture(e.pointerId);
 };
 button.onpointermove=e=>{
  const d=activeDrag;if(!d||d.pointer!==e.pointerId)return;
  d.x=e.clientX;d.y=e.clientY;
  if(!d.started&&Math.hypot(d.x-d.startX,d.y-d.startY)<8)return;
  if(!d.started){d.started=true;button.classList.add('dragging');
   const tick=()=>{if(activeDrag!==d)return;const delta=d.y<70?-14:d.y>innerHeight-70?14:0;if(delta)scrollBy(0,delta);dragTarget(d);d.frame=requestAnimationFrame(tick);};
   d.frame=requestAnimationFrame(tick);
  }
  e.preventDefault();dragTarget(d);
 };
 button.onpointerup=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(true);};
 button.onpointercancel=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(false);};
 button.onlostpointercapture=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(false);};
}
window.addEventListener('blur',()=>finishTileDrag(false));
function renderBoard(){finishTileDrag(false);const box=$('boardContent');if(!box)return;box.innerHTML=`<div class="chain" id="chain" aria-label="Dein gelegter Satz">${placed.map((id,i)=>`<button class="tile placed ${selected===id?'selected':''}" draggable="true" data-id="${id}" data-pos="${i}" aria-pressed="${selected===id}">${escapeHtml(tileText(id,i))}</button>`).join('')}${placed.length===3?'<span class="dot" aria-hidden="true">.</span>':''}${!placed.length?'<p class="empty">Hier wächst dein Satz.</p>':''}</div><p class="board-help">${selected===null?'Zum Umstellen: Tippe einen gelegten Stein an.':'Ein Stein ist ausgewählt. Verschiebe ihn oder lege ihn zurück.'}</p><div class="move-controls"><button class="secondary" id="left" ${selected===null||placed.indexOf(selected)===0?'disabled':''}>← Nach links</button><button class="secondary" id="right" ${selected===null||placed.indexOf(selected)===placed.length-1?'disabled':''}>Nach rechts →</button><button class="secondary" id="return" ${selected===null?'disabled':''}>↓ Zurücklegen</button></div><p class="banklabel">Deine übrigen Steine</p><div class="bank" id="bank" aria-label="Deine übrigen Steine">${order.filter(id=>!placed.includes(id)).map(id=>`<button class="tile" draggable="true" data-id="${id}">${escapeHtml(content.tiles[id])}</button>`).join('')||'<p class="empty">Alle Steine liegen im Satz.</p>'}</div><p class="status ${hadError?'error':''}" id="feedback" role="status" aria-live="polite">${escapeHtml(feedback)}</p><div class="actions"><button class="primary" id="check">Satz prüfen</button><button class="secondary" id="hint">Kleiner Tipp</button></div><div class="actions scene-navigation"><button class="primary" id="finish" ${solved?'':'disabled'}>Weiter</button><button class="secondary" id="back">← Zurück</button></div>`;
 box.querySelectorAll('.tile').forEach(button=>{
  const id=Number(button.dataset.id);
  button.draggable=false;
  button.onclick=()=>{
   if(Date.now()<ignoreTileClickUntil)return;
   if(placed.includes(id)){selected=selected===id?null:id;renderBoard();const b=$('chain').querySelector(`[data-id="${id}"]`);if(b)b.focus();}
   else move(id,placed.length);
  };
  attachTileDrag(button,id);
 });
 updateMoveLabels();
 $('back').onclick=()=>changePhase(1);
 $('left').onclick=()=>shiftTile(-1);$('right').onclick=()=>shiftTile(1);$('return').onclick=removeTile;$('check').onclick=check;$('hint').onclick=hint;$('finish').onclick=()=>changePhase(3);
}
function originalDetails(){return `<details><summary>Originaltext zum Mitlesen</summary><div class="original">${escapeHtml(content.original)}</div></details>`;}
function render(){updateSceneMenu();for(let i=0;i<3;i++){const b=$('step'+i);b.disabled=i>furthest;b.classList.toggle('active',i===Math.min(phase,2));if(i===Math.min(phase,2))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.onclick=()=>changePhase(i);}
 const game=$('game');if(phase===0){game.innerHTML=`${saved?'<section class="restore"><strong>Du warst schon hier.</strong><p>Möchtest du an deinem letzten Stand weitermachen?</p><div class="actions"><button class="primary" id="resume">Weitermachen</button><button class="secondary" id="new">Von vorn beginnen</button></div></section>':''}<section class="listen"><div><span class="eyebrow">Erst einmal zuhören</span><h1>Das Land der glitzernden Spinnweben</h1><p>Hinter dunklen Bergen liegt ein kleines Land. Lerne Silvana kennen.</p><div class="audio-controls"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p class="audio-status" id="audioStatus" role="status" aria-live="polite"></p><button class="secondary listen-next" id="toRead">Weiter</button></div><div class="listen-art">${$('landscape').innerHTML}<div class="caption">Ein kleines Land voller Geschichten.</div></div></section>${originalDetails()}`;$('audioToggle').onclick=toggleAudio;$('toRead').onclick=()=>changePhase(1);updateAudio();if(saved){$('resume').onclick=()=>{const x=saved;phase=x.phase;furthest=Math.max(x.phase,Math.min(3,Number(x.furthest)||0));placed=x.placed;order=x.order;solved=placed.length===3&&placed.every((id,i)=>id===i);saved=null;render();};$('new').onclick=()=>{saved=null;phase=0;furthest=0;placed=[];solved=false;order=shuffle([0,1,2]);persist();render();};}}
 else if(phase===1){game.innerHTML=`<section class="panel reading-layout"><span class="eyebrow">Jetzt bist du dran</span><h2>Willkommen in Silvana</h2><p class="read-intro">Lies in deinem Tempo.</p><div class="reading">${escapeHtml(content.simple)}</div><div class="actions scene-navigation"><button class="primary" id="toDomino">Weiter</button><button class="secondary" id="back">← Zurück</button></div></section>`;$('back').onclick=()=>changePhase(0);$('toDomino').onclick=()=>changePhase(2);}
 else if(phase===2){game.innerHTML=`<div class="domino-layout"><section class="panel readback"><span class="eyebrow">Zum Nachschauen</span><h3>Dein Lesetext</h3><div class="reading">${escapeHtml(content.simple)}</div></section><section class="panel board"><span class="eyebrow">Dein erstes Domino</span><h2>Baue deinen Satz.</h2><p class="board-help">Tippe die Steine in deiner Reihenfolge an. Du kannst sie auch ziehen. Prüfe deinen Satz, wenn du fertig bist.</p><div id="boardContent"></div></section></div>`;renderBoard();}
 else{game.innerHTML=`<section class="panel finish"><div class="finish-star" aria-hidden="true">✧</div><h2>Willkommen in Silvana!</h2><p>Du hast zugehört, selbst gelesen und deinen Satz gelegt.</p><p class="completed-sentence">${escapeHtml(content.tiles.join(' '))}.</p><p class="note">Die Geschichte geht weiter. Was wartet wohl als Nächstes auf dich?</p><div class="actions completion-actions"><button class="primary" id="again">Domino noch einmal spielen</button><button class="secondary" id="listenAgain">Geschichte noch einmal hören</button><div class="adventure-link"><p>Jetzt geht das Abenteuer weiter.</p><div class="scene-navigation actions"><button class="primary" id="scene2">Weiter</button><button class="secondary" id="back">← Zurück</button></div></div></div></section>`;$('back').onclick=()=>changePhase(2);$('again').onclick=()=>{placed=[];solved=false;order=shuffle([0,1,2]);changePhase(2);};$('listenAgain').onclick=()=>{changePhase(0);speak();};$('scene2').onclick=()=>{markScene2Visited();location.href='../szene-2/';};}}
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};for(const id of ['textSize','boardSize'])$(id).addEventListener('input',()=>{sizes();if(!saved)persist();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState==='playing'&&audioAvailable){speechSynthesis.pause();audioState='paused';updateAudio();}});window.addEventListener('pagehide',stopAudio);
 fetch('content.json').then(r=>{if(!r.ok)throw Error('Text nicht gefunden');return r.json();}).then(data=>{content=data;order=shuffle([0,1,2]);loadSaved();sizes();if(new URLSearchParams(location.search).get('abschnitt')==='abschluss'&&scene2Visited()){phase=3;furthest=3;saved=null;}render();}).catch(()=>{$('game').innerHTML='<section class="panel"><h2>Der Text konnte nicht geladen werden.</h2><p>Bitte lade die Seite noch einmal.</p><button class="primary" onclick="location.reload()">Erneut laden</button></section>';});
