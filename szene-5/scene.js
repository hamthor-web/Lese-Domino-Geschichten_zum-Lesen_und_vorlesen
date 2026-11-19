'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let content,phase=0,removed=false,solved=false,feedback='',animationToken=0;
 function sizes(){
  document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);
  document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);
  $('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';

 }
 let audio;
 function stopAudio(){audio?.stop();}

 function go(n){if(!Number.isInteger(n)||n<0||n>3||(n>=2&&!solved))return;animationToken++;stopAudio();phase=n;render();$('main').focus();$('main').scrollIntoView({block:'start'});}
 function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button>'+'</div>';}
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
 function render(){SilvanaProgress.checkpoint(phase);
  $('completionVideo')?.pause();
  $('stepStatus').textContent=['Schritt 1 von 2 · Selbst lesen','Schritt 2 von 2 · Ein Wort tauschen','',''][phase];$('stepStatus').hidden=phase===3;
  if(phase===0)$('game').innerHTML='<section class="panel"><h1>Der König</h1><div class="king-layout"><div><p>Lies in deinem Tempo.</p>'+reading()+'</div>'+illustration()+'</div>'+nav()+'</section>';
  if(phase===1){$('game').innerHTML='<section class="panel"><h1>Finde den Fehler</h1><div class="king-layout task-layout">'+illustration()+'<section class="task-content"><div class="parchment question-box"><h2>Welches Wort muss getauscht werden?</h2><p>Tippe das Wort an. Wähle danach ein passendes Wort für die Lücke.</p></div><div id="wordTask"></div><details><summary>Lesetext ansehen</summary>'+reading()+'</details></section></div>'+nav()+'</section>';renderTask();}
  if(phase===3)$('game').innerHTML='<section class="panel"><h1>Der König und die Spinnennetze</h1><p>Du hast herausgefunden, was der König vorhatte.</p><p class="parchment sentence">'+esc(content.sentenceStart)+' '+esc(content.correct)+'.</p><div class="actions scene-navigation completion-navigation"><button class="completion-video" id="scene6" type="button" disabled aria-label="Würstchen-Animation läuft"><video id="completionVideo" src="assets/wuerstchen-kutsche-weiter.mp4" width="358" height="354" preload="auto" muted playsinline aria-hidden="true"></video><span class="primary" id="completionVideoFallback" hidden></span></button></div><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+nav(false)+'</section>';
  if(phase===3)audio=mountStoryReading($('game').firstElementChild,content.original);
  if ($('back')) $('back').onclick=()=>phase===0?location.assign(SilvanaProgress.previousScene(4)):go(phase===3?1:phase-1);
  if($('next')){$('next').disabled=phase===1&&!solved;$('next').onclick=()=>go(phase===1?3:phase+1);}
  if(phase===3)setupCompletionVideo();
  if($('again'))$('again').onclick=()=>{removed=false;solved=false;feedback='';go(0);};

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
  solved=true;SilvanaProgress.finish(5);feedback='Genau! Der König wollte die Netze kaufen.';renderTask();
  const target=$('answerWord'),r=target.getBoundingClientRect();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof target.animate==='function'){
   const animation=target.animate([{transform:'translate('+(source.left-r.left)+'px,'+(source.top-r.top)+'px)',opacity:.5},{transform:'translate(0,0)',opacity:1}],{duration:420,easing:'ease-out'});
   animation.onfinish=()=>{if(token===animationToken&&phase===1)target.classList.add('arrived');};
  }
  $('next').focus();
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();

 window.addEventListener('pagehide',()=>{animationToken++;stopAudio();});

 fetch('content.json?v=1').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.original!=='string'||typeof data.simple!=='string'||typeof data.image!=='string'||!Array.isArray(data.options)||data.options.length!==3||!data.options.includes(data.correct))throw Error('Inhalt');
  content=data;if(SilvanaProgress.completed().includes(5) && new URLSearchParams(location.search).get('abschnitt')==='abschluss'){phase=3;solved=true;removed=true;}if (!SilvanaProgress.connect(phase, screen => {animationToken++; stopAudio(); phase = screen === 2 ? 3 : screen; if(screen >= 2) {solved = true; removed = true;} render();})) render();
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();});
})();
