'use strict';
(() => {
 const $=id=>document.getElementById(id),A=window.SilvanaSpiderAnswers;
 const VISITED='silvana-visited-scenes-v1';
 let content,phase=0,state=A.initial(),hint=null,draft='',correctionDraft='',firstFeedback='',correctionFeedback='',correctionShown=false,firstAccepted=false,helpValues=['','','',''];
 let pictureSelected=false,comparisonVisible=false,selectionFeedback='';
 let imagesReady=false,loadToken=0;
 const audio = createStorySpeech(updateAudio);
 const speechAvailable = audio.available;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function markVisited(){try{localStorage.setItem(VISITED,String(Math.max(3,Number(localStorage.getItem(VISITED))||0)));}catch{}}
 function updateSceneMenu(){try{const highest=Number(localStorage.getItem(VISITED));for(const [n,title] of [[4,'Der Händler'],[5,'Der König'],[6,'Im Dorf'],[7,'Der König im Wald']]){if(highest>=n){let a=$('sceneMenu'+n);if(!a){a=document.createElement('a');a.id='sceneMenu'+n;a.href='../szene-'+n+'/';a.textContent=title;}document.querySelector('.scene-menu nav').append(a);}}}catch{}}

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

 function go(n){
  if(!Number.isInteger(n)||n<0||n>3||(n>=2&&!state.done))return;
  loadToken++;stopAudio();phase=n;render();$('main').focus();if(phase===3)$('scene4').scrollIntoView({block:'nearest'});else $('main').scrollIntoView({block:'start'});
 }
 function backButton(){return phase === 0 ? '' : '<button class="secondary" id="back">← Zurück</button>';}
 function simpleDetails(){return '<details><summary>Lesetext ansehen</summary><div class="reading">'+esc(content.simple)+'</div></details>';}
 function setupCompletionVideo(){
  const button=$('scene4'),video=$('completionVideo'),fallback=$('completionVideoFallback');
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
   enable('Weiter zu Der Händler',()=>location.assign('../szene-4/'),showFallback?'Weiter':'');
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
  updateSceneMenu();$('stepStatus').textContent=['Schritt 1 von 4 · Selbst lesen','Schritt 2 von 4 · Bilder vergleichen','Schritt 3 von 4 · Zuhören',''][phase];
  $('stepStatus').hidden=phase===3;
  let html='';
  if(phase===0){
   html='<section class="panel"><span class="eyebrow">Jetzt bist du dran</span><h1>'+esc(content.title)+'</h1><p>Lies in deinem Tempo.</p><div class="reading">'+esc(content.simple)+'</div><div class="actions scene-navigation"><button class="primary" id="next">Weiter</button>'+backButton()+'</div></section>';
  }else if(phase===1){
   html='<section class="panel"><h1>Schau genau: Welches Bild passt nicht zur Geschichte?</h1>'+simpleDetails()+'<p id="imageStatus" role="status">Die Bilder werden geladen.</p><div class="image-grid" id="images" hidden>'+content.images.map((im,i)=>'<figure><button type="button" class="picture-choice" data-picture="'+i+'" aria-label="'+esc(im.label)+' auswählen" aria-pressed="false" disabled><img id="compare'+i+'" alt="Waldbild '+(i+1)+' zum Vergleichen"></button><figcaption>'+esc(im.label)+'</figcaption></figure>').join('')+'</div><div class="image-error" id="imageError" hidden><p>Die Bilder konnten nicht geladen werden. Bitte versuche es noch einmal.</p><button class="secondary" id="retryImages">Erneut versuchen</button></div><p class="feedback" id="selectionFeedback" role="status" aria-live="polite"></p><section id="answerDialog" hidden><form class="answer-form" id="answerForm"><label id="answerLabel" for="answer">Genau, dieses Bild passt nicht zur Geschichte. Warum?</label><input id="answer" type="text" maxlength="180" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="feedback" value="'+esc(draft)+'" disabled><div class="actions"><button class="primary" id="check" type="submit" disabled>Antwort prüfen</button></div></form><p class="feedback" id="feedback" role="status" aria-live="polite">'+esc(firstFeedback)+'</p><section class="correction-block" id="correctionBlock" hidden><form class="answer-form" id="correctionForm"><label for="correction">Welche Farbe haben die Spinnen im Text?</label><input id="correction" type="text" maxlength="180" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="correctionFeedback" value="'+esc(correctionDraft)+'" disabled><div class="actions"><button class="primary" id="checkCorrection" type="submit" disabled>Neue Antwort prüfen</button></div></form><p class="feedback" id="correctionFeedback" role="status" aria-live="polite">'+esc(correctionFeedback)+'</p><section class="help-box" id="help" hidden><h2>Deine Schreibhilfe</h2><p>Ein Buchstabe steht schon an der richtigen Stelle. Ergänze die übrigen Buchstaben.</p><form id="helpForm"><div class="letter-row" id="letterRow"></div><button class="secondary" id="checkHelp" type="submit">Wort prüfen</button></form></section></section></section><div class="actions scene-navigation"><button class="primary" id="next" '+(state.done?'':'hidden')+'>Weiter</button>'+backButton()+'</div></section>';
  }else if(phase===2){
   html='<section class="panel"><span class="eyebrow">Jetzt hörst du die Geschichte</span><h1>Die Spinnen im Wald</h1><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status" aria-live="polite"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details><div class="actions scene-navigation"><button class="primary" id="next">Weiter</button>'+backButton()+'</div></section>';
  }else{
   html='<section class="panel"><h1>Sehr gut hingeschaut!</h1><p>Du hast die Farbe der Spinnen im Text und in den Bildern verglichen.</p><p>Jetzt geht das Abenteuer weiter.</p><div class="actions scene-navigation completion-navigation"><button class="completion-video" id="scene4" type="button" disabled aria-label="Würstchen-Animation läuft"><video id="completionVideo" src="assets/wuerstchen-haekelt-weiter.mp4" width="358" height="358" preload="auto" muted playsinline aria-hidden="true"></video><span id="completionVideoFallback" hidden></span></button>'+backButton()+'</div><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div></section>';
  }
  $('game').innerHTML=html;
  if ($('back')) $('back').onclick=()=>go(phase-1);
  if($('next'))$('next').onclick=()=>go(phase+1);
  if(phase===1){
   document.querySelectorAll('.picture-choice').forEach(button=>button.onclick=()=>choosePicture(Number(button.dataset.picture)));
   $('answer').oninput=()=>draft=$('answer').value;
   $('answerForm').onsubmit=e=>{e.preventDefault();if(imagesReady&&pictureSelected&&!state.done&&!firstAccepted)check($('answer').value,'first');};
   $('correction').oninput=()=>correctionDraft=$('correction').value;
   $('correctionForm').onsubmit=e=>{e.preventDefault();if(imagesReady&&pictureSelected&&!state.done&&correctionShown)check($('correction').value,'correction');};
   $('helpForm').onsubmit=e=>{e.preventDefault();if(imagesReady&&pictureSelected&&!state.done)check([...$('letterRow').querySelectorAll('input')].map(i=>i.value).join(''),'correction');};
   $('retryImages').onclick=()=>{loadToken++;loadImages();};
   updateAnswer();loadImages();
  }
  if(phase===2){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if(phase===3){setupCompletionVideo();$('again').onclick=()=>{state=A.initial();hint=null;draft='';correctionDraft='';firstFeedback='';correctionFeedback='';correctionShown=false;firstAccepted=false;pictureSelected=false;comparisonVisible=false;selectionFeedback='';helpValues=['','','',''];go(0);}}
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
 function choosePicture(index){
  if(!imagesReady||pictureSelected||!content.images[index])return;
  if(content.images[index].matchesText===false){
   pictureSelected=true;
   selectionFeedback='';
   updateAnswer();$('answer').focus();
  }else{
   selectionFeedback='Vergleiche das Bild noch einmal mit dem Lesetext.';
   updateAnswer();
  }
 }
 function check(value,stage){
  const wasHelp=state.help,wasShown=correctionShown;
  const result=A.evaluate(value,stage==='correction'?'correction':'description');
  if(result.kind!=='empty'&&result.kind!=='correct'&&!result.identifiedError)comparisonVisible=true;
  if(stage==='correction'&&result.kind==='partial')comparisonVisible=true;
  if(stage==='correction'){
   state=A.submitCorrection(state,value);
   correctionFeedback=state.feedback;correctionDraft=value;$('correction').value=value;
  }else{
   state=A.submit(state,value);
   if(result.identifiedError){
    firstAccepted=true;correctionShown=true;
    firstFeedback=result.feedback;
   }else firstFeedback=state.feedback;
  }
  if(state.help){correctionShown=true;if(!hint)hint=A.letters();}
  updateAnswer();
  if(!wasHelp&&state.help)$('letterRow').querySelector('input:not([readonly])').focus();
  else if(!wasShown&&correctionShown)$('correction').focus();
 }
 function updateAnswer(){
  if(!$('answer'))return;
  $('answerDialog').hidden=!pictureSelected;
  $('selectionFeedback').textContent=selectionFeedback;
  $('selectionFeedback').hidden=!selectionFeedback;
  $('images').classList.toggle('has-selection',pictureSelected&&!comparisonVisible);
  document.querySelectorAll('.picture-choice').forEach(button=>{
   const selected=pictureSelected&&content.images[Number(button.dataset.picture)].matchesText===false;
   button.parentElement.hidden=pictureSelected&&!selected&&!comparisonVisible;
   button.disabled=!imagesReady||pictureSelected;
   button.classList.toggle('selected',selected);
   button.setAttribute('aria-pressed',String(selected));
  });
  $('feedback').textContent=firstFeedback;
  $('answer').disabled=!imagesReady||!pictureSelected;$('answer').readOnly=firstAccepted||state.done;
  $('check').disabled=!imagesReady||!pictureSelected||state.done;$('check').hidden=firstAccepted||state.done;
  $('correctionBlock').hidden=!correctionShown;
  $('correctionFeedback').textContent=correctionFeedback;
  $('correction').disabled=!imagesReady||!pictureSelected||state.done;
  $('checkCorrection').disabled=!imagesReady||!pictureSelected||state.done;
  $('next').hidden=!pictureSelected||!state.done;$('help').hidden=!state.help;
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
 
 window.addEventListener('pagehide',()=>{loadToken++;stopAudio();});
 fetch('content.json?v=3').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{
  if(typeof data.simple!=='string'||typeof data.original!=='string'||!Array.isArray(data.images)||data.images.length!==2||data.images.some(im=>typeof im.matchesText!=='boolean')||data.images.filter(im=>im.matchesText===false).length!==1)throw Error('Inhalt');
  content=data;markVisited();if(new URLSearchParams(location.search).get('abschnitt')==='abschluss'){phase=3;state.done=true;}render();
 }).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" id="retry">Erneut laden</button></section>';$('retry').onclick=()=>location.reload();scheduleButtons();});
})();


