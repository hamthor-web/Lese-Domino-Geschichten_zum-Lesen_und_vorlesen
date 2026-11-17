'use strict';
(()=>{
 const $=id=>document.getElementById(id),VISITED='silvana-visited-scenes-v1';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let content,phase=0,solved=false,feedback='',animationToken=0,question=0,busy=false;
 let placed=[false,false],flight=null,flightAnimation=null;
 let speechToken=0,utterance=null,audioState='idle';
 const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 function sizes(){
  document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);
  document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);
  $('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';
  cancelFlight();scheduleButtons();
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
 function go(n){if(n<0||n>3||(n>=2&&!solved))return;cancelFlight();stopAudio();phase=n;render();$('main').focus();$('main').scrollIntoView({block:'start'});}
 function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button></div>';}
 function illustration(){return '<figure class="king-art"><img src="'+esc(content.image)+'" alt="'+esc(content.imageAlt)+'" width="1448" height="1086"></figure>';}
 function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
 function render(){
  $('stepStatus').textContent=['Schritt 1 von 3 · Selbst lesen','Schritt 2 von 3 · Zuordnen','Schritt 3 von 3 · Zuhören',''][phase];$('stepStatus').hidden=phase===3;
  if(phase===0)$('game').innerHTML='<section class="panel"><h1>Im Dorf</h1><div class="king-layout"><div><p>Lies in deinem Tempo.</p>'+reading()+'</div>'+illustration()+'</div>'+nav()+'</section>';
  if(phase===1){$('game').innerHTML='<section class="panel"><h1>Wer sagt oder tut das?</h1><p>Tippe auf das passende Kreuz im Bild.</p><div class="village-task"><div class="board-scroll" role="region" aria-label="Wirtshausbild mit zwei Kreuzen"><div id="villageBoard"><img class="village-image" src="'+esc(content.image)+'" alt="'+esc(content.imageAlt)+'" width="1200" height="900">'+['king','mayor'].map((person,i)=>'<div class="person-slot '+person+'" id="slot'+i+'"><button class="person-cross" data-person="'+person+'" aria-label="Kreuz beim '+(i?'Bürgermeister':'König')+'"><span aria-hidden="true">✕</span></button></div>').join('')+'</div></div><aside class="question-panel"><div id="questionArea"></div><p id="feedback" class="feedback" role="status" aria-live="polite">'+esc(feedback)+'</p></aside></div><details><summary>Lesetext ansehen</summary>'+reading()+'</details>'+nav()+'</section>';renderQuestion();}

  if(phase===2)$('game').innerHTML='<section class="panel"><h1>Im Dorf</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details>'+nav()+'</section>';
  if(phase===3)$('game').innerHTML='<section class="panel"><h1>Das Gespräch im Dorf</h1><p>Du hast die Worte und die Handlung richtig zugeordnet.</p><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+nav(false)+'</section>';
  $('back').onclick=()=>phase===0?location.assign('../szene-5/?abschnitt=abschluss'):go(phase-1);
  if($('next')){$('next').disabled=phase===1&&!solved;$('next').onclick=()=>go(phase+1);}
  if(phase===2){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if($('again'))$('again').onclick=()=>{cancelFlight();placed=[false,false];question=0;solved=false;feedback='';go(0);};
  scheduleButtons();
 }
 function bubbleMarkup(i,kind){return '<div class="text-bubble '+kind+'"><img src="assets/sprechblase.webp" alt="" width="900" height="600"><span>'+esc(content.bubbles[i].text)+'</span></div>';}
 function renderQuestion(){
  if(!$('questionArea'))return;
  $('questionArea').innerHTML=solved?'<h2>Beide Blasen passen!</h2><p>Jetzt kannst du diesen Teil der Geschichte hören.</p>':'<p class="note">Frage '+(question+1)+' von 2</p><h2 id="questionTitle">'+(question===0?'Wer hat gesagt:':'Wer hat mit den Schultern gezuckt?')+'</h2><div class="prompt-scroll"><div id="promptBubble" aria-label="'+esc(content.bubbles[question].text)+'">'+bubbleMarkup(question,'large-bubble')+'</div></div>';
  document.querySelectorAll('.person-cross').forEach(b=>{b.disabled=solved||busy;b.onclick=()=>choosePerson(b.dataset.person);});
  placed.forEach((yes,i)=>{const slot=$('slot'+i);slot.classList.toggle('occupied',yes);const old=slot.querySelector('.parked');if(old)old.remove();if(yes){slot.insertAdjacentHTML('beforeend','<div class="parked" role="img" aria-label="'+esc(content.bubbles[i].text)+' – '+(i?'Bürgermeister':'König')+'">'+bubbleMarkup(i,'small-bubble')+'</div>');}});
  if($('next'))$('next').disabled=!solved||busy;scheduleButtons();
 }
 function cancelFlight(){animationToken++;if(flightAnimation){flightAnimation.cancel();flightAnimation=null;}if(flight){flight.remove();flight=null;}busy=false;const prompt=$('promptBubble');if(prompt)prompt.style.visibility='';document.querySelectorAll('.person-cross').forEach(b=>b.disabled=solved);}
 async function animateBubble(frames,duration,token){
  if(token!==animationToken||!flight)return false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return true;
  flightAnimation=flight.animate(frames,{duration,easing:'ease-in-out',fill:'forwards'});
  try{await flightAnimation.finished;}catch{return false;}return token===animationToken;
 }
 async function choosePerson(person){
  if(busy||solved||phase!==1)return;
  const prompt=$('promptBubble'),target=$('slot'+(person==='king'?0:1));if(!prompt||!target)return;
  // Bring the target into view on narrow/short screens, then measure both ends.
  target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  const source=prompt.getBoundingClientRect(),dest=target.getBoundingClientRect(),token=++animationToken;
  busy=true;document.querySelectorAll('.person-cross').forEach(b=>b.disabled=true);$('next').disabled=true;feedback='';$('feedback').textContent='';
  flight=document.createElement('div');flight.className='flying-bubble';flight.innerHTML=bubbleMarkup(question,'large-bubble');flight.style.cssText='left:'+source.left+'px;top:'+source.top+'px;width:'+source.width+'px;height:'+source.height+'px;';document.body.append(flight);prompt.style.visibility='hidden';
  const dx=dest.left+dest.width/2-source.left-source.width/2,dy=dest.top+dest.height/2-source.top-source.height/2,scale=dest.width/source.width,angle=person==='king'?8:-8;
  const home='translate(0px,0px) rotate(0deg) scale(1)',at='translate('+dx+'px,'+dy+'px) rotate('+angle+'deg) scale('+scale+')';
  if(!await animateBubble([{transform:home},{transform:at}],650,token))return;
  if(person!==content.bubbles[question].person){
   const whirl='translate('+dx+'px,'+dy+'px) rotate('+(angle+1080)+'deg) scale('+scale+')';
   if(!await animateBubble([{transform:at},{transform:whirl}],850,token))return;
   if(!await animateBubble([{transform:whirl},{transform:'translate(0px,0px) rotate(1440deg) scale(1)'}],650,token))return;
   cancelFlight();feedback='Das passt noch nicht. Lies noch einmal und tippe auf das andere Kreuz.';$('feedback').textContent=feedback;renderQuestion();return;
  }
  placed[question]=true;question++;solved=question===content.bubbles.length;cancelFlight();feedback=solved?'Genau! Beide Blasen sind am richtigen Platz.':'Genau! Hier bleibt die Blase. Jetzt kommt die nächste Frage.';$('feedback').textContent=feedback;renderQuestion();
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
 window.addEventListener('resize',()=>{cancelFlight();scheduleButtons();});if(document.fonts)document.fonts.ready.then(scheduleButtons);
 window.addEventListener('pagehide',()=>{cancelFlight();stopAudio();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState==='playing'&&speechAvailable){speechSynthesis.pause();audioState='paused';updateAudio();}});
 fetch('content.json?v=2').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.original!=='string'||typeof data.simple!=='string'||typeof data.image!=='string'||!Array.isArray(data.bubbles)||data.bubbles.length!==2)throw Error('Inhalt');
  content=data;markVisited();render();
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();scheduleButtons();});
})();
