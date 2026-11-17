'use strict';
(() => {
 const $=id=>document.getElementById(id),A=window.SilvanaSpiderAnswers;
 const VISITED='silvana-visited-scenes-v1';
 let content,phase=0,state=A.initial(),hint=null,draft='',helpValues=['','','',''];
 let imagesReady=false,loadToken=0,speechToken=0,utterance=null,audioState='idle';
 const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function markVisited(){try{localStorage.setItem(VISITED,String(Math.max(3,Number(localStorage.getItem(VISITED))||0)));}catch{}}
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
  $('audioToggle').disabled=!speechAvailable;$('restartAudio').disabled=!speechAvailable;scheduleButtons();
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
 function go(n){
  if(!Number.isInteger(n)||n<0||n>3||(n>=2&&!state.done))return;
  loadToken++;stopAudio();phase=n;render();$('main').focus();$('main').scrollIntoView({block:'start'});
 }
 function backButton(){return '<button class="secondary" id="back">← Zurück</button>';}
 function simpleDetails(){return '<details><summary>Lesetext ansehen</summary><div class="reading">'+esc(content.simple)+'</div></details>';}
 function render(){
  $('stepStatus').textContent=['Schritt 1 von 4 · Selbst lesen','Schritt 2 von 4 · Bilder vergleichen','Schritt 3 von 4 · Zuhören','Szene 3 geschafft'][phase];
  let html='';
  if(phase===0){
   html='<section class="panel"><span class="eyebrow">Jetzt bist du dran</span><h1>'+esc(content.title)+'</h1><p>Lies in deinem Tempo.</p><div class="reading">'+esc(content.simple)+'</div><div class="actions">'+backButton()+'<button class="primary" id="next">Weiter</button></div></section>';
  }else if(phase===1){
   html='<section class="panel"><span class="eyebrow">Schau genau hin</span><h1>Finde den Fehler!</h1><p>Vergleiche beide Bilder mit dem Lesetext.</p>'+simpleDetails()+'<p id="imageStatus" role="status">Die Bilder werden geladen.</p><div class="image-grid" id="images" hidden>'+content.images.map((im,i)=>'<figure><img id="compare'+i+'" alt="Waldbild '+(i+1)+' zum Vergleichen"><figcaption>'+esc(im.label)+'</figcaption></figure>').join('')+'</div><div class="image-error" id="imageError" hidden><p>Die Bilder konnten nicht geladen werden. Bitte versuche es noch einmal.</p><button class="secondary" id="retryImages">Erneut versuchen</button></div><form class="answer-form" id="answerForm"><label id="answerLabel" for="answer">'+esc(state.prompt)+'</label><input id="answer" type="text" maxlength="180" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="feedback" value="'+esc(draft)+'" disabled><div class="actions"><button class="primary" id="check" type="submit" disabled>Antwort prüfen</button></div></form><p class="feedback" id="feedback" role="status" aria-live="polite">'+esc(state.feedback)+'</p><section class="help-box" id="help" hidden><h2>Deine Schreibhilfe</h2><p>Ein Buchstabe steht schon an der richtigen Stelle. Ergänze die übrigen Buchstaben.</p><form id="helpForm"><div class="letter-row" id="letterRow"></div><button class="secondary" id="checkHelp" type="submit">Wort prüfen</button></form></section><div class="actions">'+backButton()+'<button class="primary" id="next" '+(state.done?'':'hidden')+'>Weiter</button></div></section>';
  }else if(phase===2){
   html='<section class="panel"><span class="eyebrow">Jetzt hörst du die Geschichte</span><h1>Die Spinnen im Wald</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button><button class="secondary" id="restartAudio">↻ Von vorn hören</button></div><p id="audioStatus" class="feedback" role="status" aria-live="polite"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details><div class="actions">'+backButton()+'<button class="primary" id="next">Weiter</button></div></section>';
  }else{
   html='<section class="panel"><span class="eyebrow">Szene 3 geschafft</span><h1>Sehr gut hingeschaut!</h1><p>Du hast die Farbe der Spinnen im Text und in den Bildern verglichen.</p><div class="actions">'+backButton()+'<button class="secondary" id="again">Diese Szene wiederholen</button><button class="primary" id="intro">Zur Einführung</button></div></section>';
  }
  $('game').innerHTML=html;
  $('back').onclick=()=>phase===0?location.assign('../szene-2/?abschnitt=abschluss'):go(phase-1);
  if($('next'))$('next').onclick=()=>go(phase+1);
  if(phase===1){
   $('answer').oninput=()=>draft=$('answer').value;
   $('answerForm').onsubmit=e=>{e.preventDefault();if(imagesReady&&!state.done)check($('answer').value);};
   $('helpForm').onsubmit=e=>{e.preventDefault();if(imagesReady&&!state.done)check([...$('letterRow').querySelectorAll('input')].map(i=>i.value).join(''));};
   $('retryImages').onclick=()=>{loadToken++;loadImages();};
   updateAnswer();loadImages();
  }
  if(phase===2){$('audioToggle').onclick=toggleAudio;$('restartAudio').onclick=startAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if(phase===3){$('again').onclick=()=>{state=A.initial();hint=null;draft='';helpValues=['','','',''];go(0);};$('intro').onclick=()=>location.assign('../vorschau-einfuehrung/');}
  scheduleButtons();
 }
 async function loadImages(){
  const token=loadToken;
  imagesReady=false;$('images').hidden=true;$('imageError').hidden=true;$('imageStatus').hidden=false;
  $('imageStatus').textContent='Die Bilder werden geladen.';updateAnswer();
  const result=await Promise.all(content.images.map(im=>new Promise(resolve=>{
   const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=im.src;
  })));
  if(token!==loadToken||phase!==1)return;
  if(result.some(ok=>!ok)){$('imageStatus').hidden=true;$('imageError').hidden=false;scheduleButtons();return;}
  content.images.forEach((im,i)=>$('compare'+i).src=im.src);imagesReady=true;$('images').hidden=false;$('imageStatus').hidden=true;updateAnswer();
 }
 function check(value){
  const wasHelp=state.help;state=A.submit(state,value);
  if(state.help&&!hint)hint=A.letters();
  updateAnswer();
  if(!wasHelp&&state.help){$('letterRow').querySelector('input:not([readonly])').focus();}
 }
 function updateAnswer(){
  if(!$('answer'))return;
  $('answerLabel').textContent=state.prompt;$('feedback').textContent=state.feedback;
  $('answer').disabled=!imagesReady||state.done;$('check').disabled=!imagesReady||state.done;
  $('next').hidden=!state.done;$('help').hidden=!state.help;
  if(state.help&&!$('letterRow').children.length){
   if(!hint)hint=A.letters();
   for(let i=0;i<4;i++){
    const input=document.createElement('input');input.type='text';input.maxLength=1;input.autocomplete='off';input.spellcheck=false;input.autocapitalize='none';
    input.setAttribute('aria-label','Buchstabe '+(i+1)+' von 4');
    input.readOnly=i===hint.fixed;input.value=input.readOnly?hint.word[i]:helpValues[i];
    input.oninput=()=>{input.value=input.value.replace(/[^a-zA-Z]/g,'').slice(0,1).toLowerCase();helpValues[i]=input.value;};
    $('letterRow').append(input);
   }
  }
  $('letterRow').querySelectorAll('input').forEach(i=>i.disabled=!imagesReady||state.done);
  $('checkHelp').disabled=!imagesReady||state.done;
  scheduleButtons();
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
 window.addEventListener('resize',scheduleButtons);
 if(document.fonts)document.fonts.ready.then(scheduleButtons);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState==='playing'&&speechAvailable){try{speechSynthesis.pause();audioState='paused';updateAudio();}catch{stopAudio();}}});
 window.addEventListener('pagehide',()=>{loadToken++;stopAudio();});
 fetch('content.json').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.simple!=='string'||typeof data.original!=='string'||!Array.isArray(data.images)||data.images.length!==2)throw Error('Inhalt');
  content=data;markVisited();render();
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();scheduleButtons();});
})();
