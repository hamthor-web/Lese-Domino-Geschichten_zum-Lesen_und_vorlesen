'use strict';
(()=>{
 const $=id=>document.getElementById(id),VISITED='silvana-visited-scenes-v1';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let content,phase=0,removed=false,solved=false,feedback='',animationToken=0;
 const audio = createStorySpeech(updateAudio);
 const speechAvailable = audio.available;
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
 function stopAudio(){audio.stop();}
 function updateAudio(message){
  if(!$('audioToggle'))return;
  $('audioToggle').textContent=audio.state==='playing'?'Ⅱ Pause':audio.state==='paused'?'▶ Weiterhören':audio.state==='ended'?'↻ Noch einmal hören':'▶ Geschichte anhören';
  $('audioStatus').textContent=message||(audio.state==='error'?'Die Stimme konnte nicht vorlesen. Versuche es erneut oder klappe den Originaltext auf.':audio.state==='playing'?'Die Geschichte wird vorgelesen.':audio.state==='paused'?'Die Geschichte ist angehalten.':audio.state==='ended'?'Du hast diesen Teil der Geschichte gehört.':'Höre dir die Geschichte an.');
  $('audioToggle').disabled=!speechAvailable;scheduleButtons();
 }
function toggleAudio(){audio.toggle(content.original);}



 function markVisited(){try{localStorage.setItem(VISITED,String(Math.max(5,Number(localStorage.getItem(VISITED))||0)));}catch{}}
 function go(n){if(!Number.isInteger(n)||n<0||n>3||(n>=2&&!solved))return;animationToken++;stopAudio();phase=n;render();$('main').focus();if(phase===3)$('scene6').scrollIntoView({block:'nearest'});else $('main').scrollIntoView({block:'start'});}
 function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button></div>';}
 function illustration(){return '<figure class="king-art"><img src="'+esc(content.image)+'" alt="'+esc(content.imageAlt)+'" width="1200" height="900"></figure>';}
 function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
 function setupCompletionVideo(){
  const button=$('scene6'),video=$('completionVideo'),fallback=$('completionVideoFallback');
  const destination='Weiter zu Im Dorf';
  function enable(label,action,text=''){
   if(!button.isConnected)return;
   fallback.textContent=text;
   fallback.hidden=!text;
   button.setAttribute('aria-label',label);
   button.onclick=action;
   button.disabled=false;
  }
  function ready(showFallback=false){
   video.hidden=showFallback;
   enable(destination,()=>location.assign('../szene-6/'),showFallback?'Weiter: Im Dorf':'');
  }
  function play(){
   button.disabled=true;
   button.setAttribute('aria-label','Würstchen-Animation läuft');
   fallback.hidden=true;
   video.play().catch(error=>{
    if(!button.isConnected||video.error)return;
    if(error.name==='NotAllowedError')enable('Würstchen-Animation abspielen',play,'▶ Abspielen');
    else ready(true);
   });
  }
  video.addEventListener('ended',()=>ready(),{once:true});
  video.addEventListener('error',()=>ready(true),{once:true});
  play();
 }
 function render(){
  $('completionVideo')?.pause();
  $('stepStatus').textContent=['Schritt 1 von 3 · Selbst lesen','Schritt 2 von 3 · Ein Wort tauschen','Schritt 3 von 3 · Zuhören',''][phase];$('stepStatus').hidden=phase===3;
  if(phase===0)$('game').innerHTML='<section class="panel"><h1>Der König</h1><div class="king-layout"><div><p>Lies in deinem Tempo.</p>'+reading()+'</div>'+illustration()+'</div>'+nav()+'</section>';
  if(phase===1){$('game').innerHTML='<section class="panel"><h1>Finde den Fehler</h1><div class="king-layout task-layout">'+illustration()+'<section class="task-content"><div class="parchment question-box"><h2>Welches Wort muss getauscht werden?</h2><p>Tippe das Wort an. Wähle danach ein passendes Wort für die Lücke.</p></div><div id="wordTask"></div><details><summary>Lesetext ansehen</summary>'+reading()+'</details></section></div>'+nav()+'</section>';renderTask();}
  if(phase===2)$('game').innerHTML='<section class="panel"><h1>Der König</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details>'+nav()+'</section>';
  if(phase===3)$('game').innerHTML='<section class="panel"><h1>Der König und die Spinnennetze</h1><p>Du hast herausgefunden, was der König vorhatte.</p><p class="parchment sentence">'+esc(content.sentenceStart)+' '+esc(content.correct)+'.</p><div class="actions scene-navigation completion-navigation"><button class="completion-video" id="scene6" type="button" disabled aria-label="Würstchen-Animation läuft"><video id="completionVideo" src="assets/wuerstchen-kutsche-weiter.mp4" width="358" height="354" preload="auto" muted playsinline aria-hidden="true"></video><span class="primary" id="completionVideoFallback" hidden></span></button></div><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+nav(false)+'</section>';
  $('back').onclick=()=>phase===0?location.assign('../szene-4/?abschnitt=abschluss'):go(phase-1);
  if($('next')){$('next').disabled=phase===1&&!solved;$('next').onclick=()=>go(phase+1);}
  if(phase===2){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if(phase===3)setupCompletionVideo();
  if($('again'))$('again').onclick=()=>{removed=false;solved=false;feedback='';go(0);};
  scheduleButtons();
 }
 function sentenceWords(){
  if(solved)return esc(content.sentenceStart)+' <span class="answer-word" id="answerWord">'+esc(content.correct)+'</span>';
  if(removed)return esc(content.sentenceStart)+' <span class="word-gap" id="wordGap" aria-label="Lücke für das passende Wort"></span>';
  const words=content.sentenceStart.split(' ').concat(content.wrong);
  return words.map((word,i)=>'<button class="sentence-word" data-token="'+i+'"'+(i===words.length-1?' id="wrongWord"':'')+'>'+esc(word)+'</button>').join(' ');
 }
 function renderTask(){
  if(!$('wordTask'))return;
  $('wordTask').innerHTML='<p class="parchment sentence" id="taskSentence">'+sentenceWords()+'.</p><section id="choices" '+(!removed||solved?'hidden':'')+'><p>Welches Wort passt?</p><div class="word-options">'+content.options.map(w=>'<button class="parchment word-option" data-word="'+esc(w)+'">'+esc(w)+'</button>').join('')+'</div></section><p class="feedback" id="feedback" role="status" aria-live="polite">'+esc(feedback)+'</p>';
  document.querySelectorAll('.sentence-word').forEach(button=>button.onclick=()=>{
   if(removed||solved)return;
   if(button.id==='wrongWord'){removed=true;feedback='Welches Wort passt zur Geschichte?';renderTask();document.querySelector('.word-option').focus();}
   else{feedback='Dieses Wort passt zur Geschichte. Suche das Wort, das nicht zum Lesetext passt.';$('feedback').textContent=feedback;}
  });
  document.querySelectorAll('.word-option').forEach(b=>b.onclick=()=>choose(b));
  if($('next'))$('next').disabled=!solved;
 }
 function choose(button){
  if(!removed||solved)return;
  const word=button.dataset.word;
  if(word!==content.correct){feedback='Das passt noch nicht. Lies im Text nach, was der König mit den Netzen vorhatte.';$('feedback').textContent=feedback;button.classList.remove('shake');void button.offsetWidth;button.classList.add('shake');return;}
  const source=button.getBoundingClientRect(),token=++animationToken;
  solved=true;feedback='Genau! Der König wollte die Netze kaufen.';renderTask();
  const target=$('answerWord'),r=target.getBoundingClientRect();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof target.animate==='function'){
   const animation=target.animate([{transform:'translate('+(source.left-r.left)+'px,'+(source.top-r.top)+'px)',opacity:.5},{transform:'translate(0,0)',opacity:1}],{duration:420,easing:'ease-out'});
   animation.onfinish=()=>{if(token===animationToken&&phase===1)target.classList.add('arrived');};
  }
  $('next').focus();
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
 window.addEventListener('resize',scheduleButtons);if(document.fonts)document.fonts.ready.then(scheduleButtons);
 window.addEventListener('pagehide',()=>{animationToken++;stopAudio();});
 
 fetch('content.json?v=1').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.original!=='string'||typeof data.simple!=='string'||typeof data.image!=='string'||!Array.isArray(data.options)||data.options.length!==3||!data.options.includes(data.correct))throw Error('Inhalt');
  content=data;markVisited();if(new URLSearchParams(location.search).get('abschnitt')==='abschluss'){phase=3;solved=true;removed=true;}render();try{if(Number(localStorage.getItem(VISITED))>=6){const a=document.createElement('a');a.href='../szene-6/';a.textContent='Im Dorf';const seven=document.getElementById('sceneMenu7');if(seven)seven.before(a);else document.querySelector('.scene-menu nav').append(a);}}catch{}
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();scheduleButtons();});
})();

window.addEventListener('load',()=>{const add=()=>{try{if(Number(localStorage.getItem('silvana-visited-scenes-v1'))>=7&&!document.getElementById('sceneMenu7')){const a=document.createElement('a');a.id='sceneMenu7';a.href='../szene-7/';a.textContent='Der König im Wald';document.querySelector('.scene-menu nav').append(a);}}catch{}};add();});
