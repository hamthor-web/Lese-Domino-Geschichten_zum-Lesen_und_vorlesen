'use strict';
(()=>{
const $=id=>document.getElementById(id),VISITED='silvana-visited-scenes-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content,phase=0,placed=[2,0,1],selected=null,solved=false,feedback='';
let speechToken=0,utterance=null,audioState='idle';
const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 function sizes(){
  document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);
  document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);
  $('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';
  scheduleButtons();
 }
 let sizingFrame=0;
 function scheduleButtons(){cancelAnimationFrame(sizingFrame);sizingFrame=requestAnimationFrame(()=>{
  const buttons=[...document.querySelectorAll('button.primary,button.secondary,button.quiet')].filter(b=>b.getClientRects().length);
  if(!buttons.length)return;
  const available=Math.max(1,Math.min(...buttons.map(b=>b.parentElement.clientWidth-parseFloat(getComputedStyle(b.parentElement).paddingLeft)-parseFloat(getComputedStyle(b.parentElement).paddingRight))));
  buttons.forEach(b=>{b.style.width='max-content';b.style.maxWidth='100%';b.style.height='auto';b.style.flex='0 1 auto';});
  const width=Math.min(available,Math.max(...buttons.map(b=>b.getBoundingClientRect().width)));
  buttons.forEach(b=>b.style.width=width+'px');
  const height=Math.ceil(Math.max(...buttons.map(b=>b.getBoundingClientRect().height)));
  buttons.forEach(b=>b.style.height=height+'px');
 });}
 function stopAudio(){speechToken++;utterance=null;audioState='idle';if(speechAvailable)speechSynthesis.cancel();}
 function updateAudio(message){
  if(!$('audioToggle'))return;
  $('audioToggle').textContent=audioState==='playing'?'Ⅱ Pause':audioState==='paused'?'▶ Weiterhören':audioState==='ended'?'↻ Noch einmal hören':'▶ Geschichte anhören';
  $('audioStatus').textContent=message||(audioState==='playing'?'Die Geschichte wird vorgelesen.':audioState==='paused'?'Die Geschichte ist angehalten.':audioState==='ended'?'Du hast diesen Teil der Geschichte gehört.':'Höre dir die Geschichte an.');
  $('audioToggle').disabled=!speechAvailable;scheduleButtons();
 }
 function startAudio(){
  if(!speechAvailable){updateAudio('Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');return;}
  stopAudio();const token=speechToken;
  const u=new SpeechSynthesisUtterance(content.original);utterance=u;u.lang='de-DE';u.rate=.85;
  const voice=speechSynthesis.getVoices().find(v=>/^de[-_]/i.test(v.lang));if(voice)u.voice=voice;
  u.onend=()=>{if(token!==speechToken)return;audioState='ended';utterance=null;updateAudio();};
  u.onerror=e=>{if(token!==speechToken||['canceled','interrupted'].includes(e.error))return;audioState='error';updateAudio('Die Stimme konnte nicht starten. Versuche es erneut oder klappe den Originaltext auf.');};
  try{audioState='playing';updateAudio();speechSynthesis.speak(u);}catch{if(token===speechToken){audioState='error';updateAudio('Die Stimme konnte nicht starten. Du kannst den Originaltext aufklappen.');}}
 }
 function toggleAudio(){
  if(!speechAvailable)return;
  try{
   if(audioState==='playing'){speechSynthesis.pause();audioState='paused';updateAudio();}
   else if(audioState==='paused'){speechSynthesis.resume();audioState='playing';updateAudio();}
   else startAudio();
  }catch{stopAudio();updateAudio('Die Stimme konnte nicht fortgesetzt werden. Versuche es noch einmal.');}
 }

function markVisited(){try{localStorage.setItem(VISITED,String(Math.max(4,Number(localStorage.getItem(VISITED))||0)));}catch{}}
function go(n){if(n<0||n>3||(n===3&&!solved))return;finishTileDrag(false);stopAudio();phase=n;render();$('main').focus();$('main').scrollIntoView({block:'start'});}
function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button></div>';}
function updateSceneMenu(){try{if(Number(localStorage.getItem(VISITED))>=6&&!$('sceneMenu6')){const a=document.createElement('a');a.id='sceneMenu6';a.href='../szene-6/';a.textContent='Im Dorf';document.querySelector('.scene-menu nav').append(a);}}catch{}try{if(Number(localStorage.getItem(VISITED))>=5&&!$('sceneMenu5')){const a=document.createElement('a');a.id='sceneMenu5';a.href='../szene-5/';a.textContent='Der König';const six=$('sceneMenu6');if(six)six.before(a);else document.querySelector('.scene-menu nav').append(a);}}catch{}}
function render(){updateSceneMenu();
$('stepStatus').textContent=['Schritt 1 von 3 · Zuhören','Schritt 2 von 3 · Selbst lesen','Schritt 3 von 3 · Reihenfolge legen',''][phase];$('stepStatus').hidden=phase===3;
if(phase===0)$('game').innerHTML='<section class="panel"><span class="eyebrow">Erst einmal zuhören</span><h1>Der Händler</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details>'+nav()+'</section>';
if(phase===1)$('game').innerHTML='<section class="panel"><h1>Der Händler</h1><p>Lies in deinem Tempo.</p><div class="reading">'+esc(content.simple)+'</div>'+nav()+'</section>';
if(phase===2){$('game').innerHTML='<section class="panel"><h1>Was geschah zuerst?</h1><div class="reading">'+esc(content.simple)+'</div><p>Bringe die drei Satzkarten in die richtige Reihenfolge. Ziehe sie an die passende Stelle oder tippe eine Karte an und verschiebe sie mit den Pfeilen.</p><div id="boardContent"></div></section>';renderBoard();}
if(phase===3)$('game').innerHTML='<section class="panel"><h1>Die Geschichte des Händlers</h1><p>Du hast geordnet, was mit dem Spinnennetz geschah.</p><ol class="result">'+content.cards.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ol><p>Jetzt geht das Abenteuer weiter.</p><div class="actions scene-navigation"><button class="primary" id="scene5">Weiter</button><button class="secondary" id="back">← Zurück</button></div><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+''+'</section>';
$('back').onclick=()=>phase===0?location.assign('../szene-3/?abschnitt=abschluss'):go(phase-1);
if($('next'))$('next').onclick=()=>go(phase+1);
if(phase===0){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
if($('scene5'))$('scene5').onclick=()=>location.assign('../szene-5/');
if($('again'))$('again').onclick=()=>{placed=[2,0,1];selected=null;solved=false;feedback='';go(0);};scheduleButtons();
}
function changed(){solved=false;feedback='';renderBoard();}
function move(id,pos){if(!placed.includes(id)||!Number.isInteger(pos)||pos<0||pos>3)return;const old=placed.indexOf(id);placed.splice(old,1);if(old<pos)pos--;placed.splice(pos,0,id);selected=id;changed();}
function shift(delta){const i=placed.indexOf(selected),j=i+delta;if(i<0||j<0||j>2)return;[placed[i],placed[j]]=[placed[j],placed[i]];changed();$('chain').querySelector('[data-id="'+selected+'"]').focus();}
function renderBoard(){finishTileDrag(false);$('boardContent').innerHTML='<ol class="chain story-cards" id="chain" aria-label="Deine Reihenfolge">'+placed.map(id=>'<li><button class="tile '+(id===selected?'selected':'')+'" data-id="'+id+'" aria-pressed="'+(id===selected)+'">' + '<img class="card-image" src="'+esc(content.images[id])+'" alt="" draggable="false" width="1000" height="750"><span class="card-sentence">'+esc(content.cards[id])+'</span></button></li>').join('')+'</ol><div class="move-controls"><button class="secondary" id="left" '+(selected===null||placed.indexOf(selected)===0?'disabled':'')+'>Nach oben</button><button class="secondary" id="right" '+(selected===null||placed.indexOf(selected)===2?'disabled':'')+'>Nach unten</button></div><p class="feedback" role="status">'+esc(feedback)+'</p><div class="actions"><button class="primary" id="check" '+(solved?'hidden':'')+'>Reihenfolge prüfen</button><button class="secondary" id="hint" '+(solved?'hidden':'')+'>Kleiner Tipp</button></div>'+nav();
$('chain').querySelectorAll('.tile').forEach(b=>{const id=Number(b.dataset.id);b.onclick=()=>{if(Date.now()<ignoreTileClickUntil)return;selected=selected===id?null:id;renderBoard();$('chain').querySelector('[data-id="'+id+'"]').focus();};attachTileDrag(b,id);});
$('left').onclick=()=>shift(-1);$('right').onclick=()=>shift(1);updateMoveLabels();
$('check').onclick=()=>{solved=placed.every((id,i)=>id===i);feedback=solved?'Das passt! Lies die drei Satzkarten noch einmal.':'Lies noch einmal nach: Was versucht der Händler zuerst? Deine Karten bleiben liegen. Du kannst sie umstellen.';renderBoard();};
$('hint').onclick=()=>{feedback='Was macht der Händler, bevor die Fäden in seinen Haaren kleben?';renderBoard();};
$('next').disabled=!solved;$('next').onclick=()=>go(3);$('back').onclick=()=>go(1);scheduleButtons();}
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
 
}
function attachTileDrag(button,id){
 button.onpointerdown=e=>{
  if(!e.isPrimary||e.button!==0)return;
  finishTileDrag(false);ignoreTileClickUntil=0;
  activeDrag={button,id,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,started:false,position:null,frame:0};
  button.setPointerCapture(e.pointerId);
 };
 button.onpointermove=e=>{
  const d=activeDrag;if(!d||d.pointer!==e.pointerId)return;
  d.x=e.clientX;d.y=e.clientY;
  if(!d.started&&Math.hypot(d.x-d.startX,d.y-d.startY)<8)return;
  if(!d.started){d.started=true;button.classList.add('dragging');
   const tick=()=>{if(activeDrag!==d)return;const chain=$('chain').getBoundingClientRect(),bank=chain,top=Math.min(chain.top,bank.top),bottom=Math.max(chain.bottom,bank.bottom);const delta=d.y<70&&top<12?Math.max(-14,top-12):d.y>innerHeight-70&&bottom>innerHeight-12?Math.min(14,bottom-innerHeight+12):0;if(delta)scrollBy(0,delta);dragTarget(d);d.frame=requestAnimationFrame(tick);};
   d.frame=requestAnimationFrame(tick);
  }
  e.preventDefault();dragTarget(d);
 };
 button.onpointerup=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(true);};
 button.onpointercancel=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(false);};
 button.onlostpointercapture=e=>{if(activeDrag?.pointer===e.pointerId)finishTileDrag(false);};
}
window.addEventListener('blur',()=>finishTileDrag(false));

$('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',()=>{sizes();updateMoveLabels();}));sizes();
window.addEventListener('resize',()=>{scheduleButtons();updateMoveLabels();});
window.addEventListener('pagehide',()=>{finishTileDrag(false);stopAudio();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState==='playing'&&speechAvailable){speechSynthesis.pause();audioState='paused';updateAudio();}});
if(document.fonts)document.fonts.ready.then(scheduleButtons);
fetch('content.json?v=2').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{if(typeof data.original!=='string'||typeof data.simple!=='string'||data.cards?.length!==3||data.images?.length!==3||data.images.some(src=>typeof src!=='string'))throw Error('Inhalt');content=data;markVisited();if(new URLSearchParams(location.search).get('abschnitt')==='abschluss'){phase=3;placed=[0,1,2];solved=true;}render();}).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();});
})();


window.addEventListener('load',()=>{const add=()=>{try{if(Number(localStorage.getItem('silvana-visited-scenes-v1'))>=7&&!document.getElementById('sceneMenu7')){const a=document.createElement('a');a.id='sceneMenu7';a.href='../szene-7/';a.textContent='Der König im Wald';document.querySelector('.scene-menu nav').append(a);}}catch{}};add();});
