'use strict';
(()=>{
 const $=id=>document.getElementById(id),VISITED='silvana-visited-scenes-v1';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let content,phase=0,solved=false,feedback='',animationToken=0,selected=0;
 let bubbles=initialBubbles();
 function initialBubbles(){return [{x:.27,y:.80,angle:0,person:null},{x:.73,y:.80,angle:0,person:null}];}
 let speechToken=0,utterance=null,audioState='idle';
 const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 function sizes(){
  document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);
  document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);
  $('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';
  scheduleButtons();if(phase===1)requestAnimationFrame(positionBubbles);
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


 function markVisited(){try{localStorage.setItem(VISITED,String(Math.max(6,Number(localStorage.getItem(VISITED))||0)));}catch{}}
 function go(n){if(n<0||n>3||(n>=2&&!solved))return;stopAudio();phase=n;render();$('main').focus();$('main').scrollIntoView({block:'start'});}
 function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button></div>';}
 function illustration(){return '<figure class="king-art"><img src="'+esc(content.image)+'" alt="'+esc(content.imageAlt)+'" width="1448" height="1086"></figure>';}
 function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
 function render(){
  $('stepStatus').textContent=['Schritt 1 von 3 · Selbst lesen','Schritt 2 von 3 · Zuordnen','Schritt 3 von 3 · Zuhören',''][phase];$('stepStatus').hidden=phase===3;
  if(phase===0)$('game').innerHTML='<section class="panel"><h1>Im Dorf</h1><div class="king-layout"><div><p>Lies in deinem Tempo.</p>'+reading()+'</div>'+illustration()+'</div>'+nav()+'</section>';
  if(phase===1){$('game').innerHTML='<section class="panel"><h1>Wer sagt oder tut das?</h1><p>Schiebe jede Blase zu der passenden Person. Du kannst sie auch drehen.</p><p class="note">Oder: Tippe eine Blase und danach den Namen der Person an. Auf einem kleinen Bildschirm kannst du das Bild seitlich verschieben.</p><div class="board-scroll" tabindex="0" role="region" aria-label="Wirtshausbild mit verschiebbaren Textblasen"><div id="villageBoard"><img class="village-image" src="'+esc(content.image)+'" alt="'+esc(content.imageAlt)+'" draggable="false">'+content.bubbles.map((b,i)=>'<button type="button" class="speech-bubble" id="bubble'+i+'" data-bubble="'+i+'" aria-label="Textblase: '+esc(b.text)+'" aria-pressed="'+(selected===i)+'"><img src="assets/sprechblase.webp" alt="" draggable="false"><span>'+esc(b.text)+'</span></button>').join('')+'</div></div><div class="bubble-controls"><p id="selectedText"></p><div class="actions"><button class="secondary" id="selectOther">Andere Blase wählen</button><button class="secondary" id="turnLeft">↶ Links drehen</button><button class="secondary" id="turnRight">↷ Rechts drehen</button></div><label class="rotation-label" for="rotation">Drehung <output id="rotationValue"></output><input id="rotation" type="range" min="-45" max="45" step="5"></label><p>Ausgewählte Blase zuordnen:</p><div class="actions"><button class="secondary" data-person="king">Zum König · links</button><button class="secondary" data-person="mayor">Zum Bürgermeister · rechts</button></div><p id="assignments" class="note"></p><div class="actions"><button class="primary" id="check">Prüfen</button><button class="secondary" id="reset">Neu legen</button></div><p id="feedback" class="feedback" role="status" aria-live="polite">'+esc(feedback)+'</p></div><details><summary>Lesetext ansehen</summary>'+reading()+'</details>'+nav()+'</section>';bindBoard();}
  if(phase===2)$('game').innerHTML='<section class="panel"><h1>Im Dorf</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details>'+nav()+'</section>';
  if(phase===3)$('game').innerHTML='<section class="panel"><h1>Das Gespräch im Dorf</h1><p>Du hast die Worte und die Handlung richtig zugeordnet.</p><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+nav(false)+'</section>';
  $('back').onclick=()=>phase===0?location.assign('../szene-5/?abschnitt=abschluss'):go(phase-1);
  if($('next')){$('next').disabled=phase===1&&!solved;$('next').onclick=()=>go(phase+1);}
  if(phase===2){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if($('again'))$('again').onclick=()=>{bubbles=initialBubbles();solved=false;feedback='';selected=0;go(0);};
  scheduleButtons();
 }
 function positionBubbles(){
  const board=$('villageBoard');if(!board)return;
  const w=board.clientWidth,h=board.clientHeight;
  bubbles.forEach((b,i)=>{const el=$('bubble'+i);if(!el)return;
   const a=Math.abs(b.angle)*Math.PI/180,ex=(el.offsetWidth*Math.cos(a)+el.offsetHeight*Math.sin(a))/2+4,ey=(el.offsetWidth*Math.sin(a)+el.offsetHeight*Math.cos(a))/2+4;
   b.x=Math.min(1-ex/w,Math.max(ex/w,b.x));b.y=Math.min(1-ey/h,Math.max(ey/h,b.y));
   el.style.left=(b.x*100)+'%';el.style.top=(b.y*100)+'%';el.style.transform='translate(-50%,-50%) rotate('+b.angle+'deg)';el.style.zIndex=selected===i?3:2;el.setAttribute('aria-pressed',String(selected===i));
  });
 }
 function controls(){
  if(!$('rotation'))return;
  $('selectedText').textContent='Ausgewählt: '+content.bubbles[selected].text;
  $('rotation').value=bubbles[selected].angle;$('rotationValue').textContent=bubbles[selected].angle+'°';
  $('assignments').textContent=bubbles.map((b,i)=>content.bubbles[i].text+' → '+(b.person==='king'?'König':b.person==='mayor'?'Bürgermeister':'noch nicht zugeordnet')).join(' · ');
  positionBubbles();
 }
 function change(){solved=false;feedback='';$('feedback').textContent='';$('next').disabled=true;controls();}
 function assign(person){const b=bubbles[selected];b.person=person;b.x=person==='king'?.25:.75;b.y=.32;change();}
 function bindBoard(){
  let drag=null;
  document.querySelectorAll('[data-bubble]').forEach(el=>{
   const i=Number(el.dataset.bubble);
   el.onclick=()=>{selected=i;controls();};
   el.onkeydown=e=>{const dirs={ArrowLeft:[-.025,0],ArrowRight:[.025,0],ArrowUp:[0,-.025],ArrowDown:[0,.025]};if(dirs[e.key]){e.preventDefault();selected=i;bubbles[i].x+=dirs[e.key][0];bubbles[i].y+=dirs[e.key][1];positionBubbles();bubbles[i].person=bubbles[i].x<.5?'king':'mayor';change();}};
   el.onpointerdown=e=>{if(e.button!==0)return;selected=i;controls();const r=$('villageBoard').getBoundingClientRect();drag={id:e.pointerId,i,x:e.clientX,y:e.clientY,bx:bubbles[i].x,by:bubbles[i].y,w:r.width,h:r.height,moved:false};el.setPointerCapture(e.pointerId);};
   el.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)<5&&!drag.moved)return;drag.moved=true;bubbles[i].x=drag.bx+dx/drag.w;bubbles[i].y=drag.by+dy/drag.h;positionBubbles();};
   el.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.moved){bubbles[i].person=bubbles[i].x<.5?'king':'mayor';change();}drag=null;};
   el.onpointercancel=()=>{if(drag){bubbles[i].x=drag.bx;bubbles[i].y=drag.by;}drag=null;positionBubbles();};
  });
  document.querySelectorAll('[data-person]').forEach(el=>el.onclick=()=>assign(el.dataset.person));
  $('selectOther').onclick=()=>{selected=1-selected;controls();$('bubble'+selected).focus({preventScroll:true});};
  function turn(v){bubbles[selected].angle=Math.max(-45,Math.min(45,v));controls();}
  $('rotation').oninput=()=>turn(Number($('rotation').value));
  $('turnLeft').onclick=()=>turn(bubbles[selected].angle-15);$('turnRight').onclick=()=>turn(bubbles[selected].angle+15);
  $('reset').onclick=()=>{bubbles=initialBubbles();selected=0;change();};
  $('check').onclick=()=>{solved=bubbles.every((b,i)=>b.person===content.bubbles[i].person);feedback=solved?'Genau! Der König bezahlt mit Gold. Der Bürgermeister zuckt mit den Schultern.':bubbles.some(b=>!b.person)?'Ordne erst beide Blasen einer Person zu.':'Das passt noch nicht ganz. Lies nach: Wer spricht vom Gold? Wer zuckt mit den Schultern?';$('feedback').textContent=feedback;$('next').disabled=!solved;};
  $('villageBoard').querySelector('.village-image').onload=positionBubbles;controls();requestAnimationFrame(positionBubbles);
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
 window.addEventListener('resize',()=>{scheduleButtons();positionBubbles();});if(document.fonts)document.fonts.ready.then(scheduleButtons);
 window.addEventListener('pagehide',()=>{animationToken++;stopAudio();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState==='playing'&&speechAvailable){speechSynthesis.pause();audioState='paused';updateAudio();}});
 fetch('content.json?v=1').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.original!=='string'||typeof data.simple!=='string'||typeof data.image!=='string'||!Array.isArray(data.bubbles)||data.bubbles.length!==2)throw Error('Inhalt');
  content=data;markVisited();render();
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();scheduleButtons();});
})();
