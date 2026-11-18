'use strict';
(()=>{
 const $=id=>document.getElementById(id),VISITED='silvana-visited-scenes-v1';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let content,phase=0,active=null,solved=new Set(),choices=[],feedback='';
 const audio = createStorySpeech(updateAudio);
 const speechAvailable = audio.available;
 function sizes(){document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);$('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';scheduleButtons();}
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

 function complete(){return solved.size===content.differences.length;}
 function go(n){if(n<0||n>3||(n===3&&!complete()))return;$('scene7-next-video')?.pause();stopAudio();phase=n;active=null;feedback='';render();$('main').focus();$('main').scrollIntoView({block:'start'});}
 function nav(next=true){return '<div class="actions scene-navigation">'+(next?'<button class="primary" id="next">Weiter</button>':'')+'<button class="secondary" id="back">← Zurück</button></div>';}
 function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
 function pictures(){return '<div class="forest-pictures">'+[0,1].map(side=>'<figure><figcaption>Bild '+(side+1)+'</figcaption><div class="forest-scroll" role="region" aria-label="Bild '+(side+1)+' vergrößert seitlich verschieben" tabindex="0"><div class="forest-board" data-side="'+side+'"><img src="assets/wald-'+(side?'b':'a')+'.png" width="1536" height="1152" alt="'+(side?'Wald mit Haselnüssen, Käfern, Schal, Strauch und alter Frau.':'Wald mit Tautropfen, Spinnen, Spinnennetz, Brunnen und Mädchen.')+'">'+content.differences.map((d,i)=>d.areas.map((r,j)=>'<button class="hotspot '+(solved.has(d.id)?'found':'')+'" style="left:'+(r[0]+r[2]/2)+'%;top:'+(r[1]+r[3]/2)+'%;width:'+r[2]+'%;height:'+r[3]+'%" data-diff="'+i+'" data-area="'+j+'" data-side="'+side+'" aria-label="Bild '+(side+1)+', Bildstelle '+(i+1)+(d.areas.length>1?'.'+(j+1):'')+(solved.has(d.id)?', schon gefunden':'')+'">'+(solved.has(d.id)?'<span aria-hidden="true">✓</span>':'')+'</button>').join('')).join('')+'</div></div></figure>').join('')+'</div>';}
 function render(){
  $('stepStatus').textContent=['Schritt 1 von 3 · Zuhören','Schritt 2 von 3 · Selbst lesen','Schritt 3 von 3 · Bilder vergleichen',''][phase];$('stepStatus').hidden=phase===3;
  if(phase===0)$('game').innerHTML='<section class="panel"><h1>Der König im Wald</h1><p>Höre, was der König im Wald entdeckt.</p><div class="actions"><button class="primary" id="audioToggle">▶ Geschichte anhören</button></div><p id="audioStatus" class="feedback" role="status"></p><details><summary>Originaltext zum Mitlesen</summary><div class="original">'+esc(content.original)+'</div></details>'+nav()+'</section>';
  if(phase===1)$('game').innerHTML='<section class="panel"><h1>Der König im Wald</h1><p>Lies in deinem Tempo.</p>'+reading()+nav()+'</section>';
  if(phase===2){$('game').innerHTML='<section class="panel"><h1>Was ist auf dem anderen Bild?</h1><p>Vergleiche die Bilder. Tippe auf etwas, das anders ist. Wähle dann das Wort für die gleiche Stelle auf dem anderen Bild.</p><p class="note">Du kannst in beiden Bildern suchen. Mit „Spielfeld“ machst du die Bilder größer und kannst sie seitlich verschieben.</p><p id="progress" role="status"></p>'+pictures()+'<section id="question" class="comparison-question" aria-labelledby="questionTitle" tabindex="-1" hidden></section><p id="feedback" class="feedback" role="status" aria-live="polite"></p><details><summary>Lesetext ansehen</summary>'+reading()+'</details>'+nav()+'</section>';bindPictures();updateProgress();}
  if(phase===3)$('game').innerHTML=`
   <section class="panel">
    <h1>Genau hingeschaut!</h1>
    <p>Du hast alle Unterschiede gefunden und die passenden Wörter gelesen.</p>
    <div class="actions scene7-completion-actions">
     <button class="secondary" id="again">Diese Szene wiederholen</button>
     <button class="scene7-video-next" id="scene8" type="button" disabled aria-label="Würstchen-Animation läuft">
      <video id="scene7-next-video" src="../szene-8/assets/Wuerstchen_Animation.mp4" width="354" height="354" muted playsinline preload="auto" aria-hidden="true"></video>
      <span id="scene7-video-fallback" hidden></span>
     </button>
     <button class="secondary" id="back">← Zurück</button>
    </div>
   </section>`;
  $('back').onclick=()=>phase===0?location.assign('../szene-6/?abschnitt=abschluss'):go(phase-1);
  if($('next')){$('next').disabled=phase===2&&!complete();$('next').onclick=()=>go(phase+1);}
  if($('audioToggle')){$('audioToggle').onclick=toggleAudio;updateAudio(speechAvailable?'':'Dein Browser kann hier nicht vorlesen. Klappe den Originaltext auf.');}
  if($('again'))$('again').onclick=()=>{solved.clear();go(0);};
  if(phase===3)playCompletionVideo();
  scheduleButtons();
 }
 function playCompletionVideo(){
  const button=$('scene8'),movie=$('scene7-next-video'),fallback=$('scene7-video-fallback');
  function ready(label=''){
   if(!button.isConnected)return;
   movie.hidden=Boolean(label);
   fallback.textContent=label;
   fallback.hidden=!label;
   button.setAttribute('aria-label','Weiter zu Szene 8');
   button.onclick=()=>location.assign('../szene-8/');
   button.disabled=false;
  }
  async function play(){
   button.disabled=true;
   button.setAttribute('aria-label','Würstchen-Animation läuft');
   fallback.hidden=true;
   try{await movie.play();}
   catch(error){
    if(!button.isConnected||movie.error)return;
    if(error.name==='NotAllowedError'){
     fallback.textContent='▶ Animation abspielen';
     fallback.hidden=false;
     button.setAttribute('aria-label','Würstchen-Animation abspielen');
     button.onclick=play;
     button.disabled=false;
    }else ready('Weiter zu Szene 8');
   }
  }
  movie.addEventListener('ended',()=>ready(),{once:true});
  movie.addEventListener('error',()=>ready('Weiter zu Szene 8'),{once:true});
  play();
 }
 function updateProgress(){$('progress').textContent=solved.size+' von '+content.differences.length+' Unterschieden gefunden';$('next').disabled=!complete();}
 function bindPictures(){document.querySelectorAll('.hotspot').forEach(b=>b.onclick=()=>select(Number(b.dataset.diff),Number(b.dataset.side)));document.querySelectorAll('.forest-board').forEach(b=>b.onclick=e=>{if(e.target.closest('.hotspot'))return;$('feedback').textContent='Schau, was an der gleichen Stelle auf dem anderen Bild anders ist.';});}
 function select(index,side){
  const d=content.differences[index];if(solved.has(d.id)){$('feedback').textContent='Diesen Unterschied hast du schon gefunden.';return;}
  active={index,side};feedback='';choices=[...d.options[side]];for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  document.querySelectorAll('.hotspot').forEach(b=>b.classList.toggle('selected',Number(b.dataset.diff)===index&&Number(b.dataset.side)===side));
  const q=$('question');q.hidden=false;q.innerHTML='<h2 id="questionTitle">Was ist hier auf Bild '+(side?1:2)+'?</h2><p>Du hast auf Bild '+(side+1)+' gewählt. Was siehst du an dieser Stelle auf dem anderen Bild?</p><div class="word-options">'+choices.map(w=>'<button class="word-option" data-word="'+esc(w)+'">'+esc(w)+'</button>').join('')+'</div>';
  $('feedback').textContent='';q.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>answer(b.dataset.word));scheduleButtons();q.focus({preventScroll:true});q.scrollIntoView({block:'center',behavior:'instant'});
 }
 function answer(word){if(!active)return;const d=content.differences[active.index],target=d.words[1-active.side];if(word!==target){$('feedback').textContent='Das passt noch nicht. Vergleiche diese Stelle auf beiden Bildern.';$('feedback').scrollIntoView({block:'nearest'});return;}
  solved.add(d.id);active=null;$('question').hidden=true;document.querySelectorAll('.hotspot').forEach(b=>{b.classList.remove('selected');if(content.differences[Number(b.dataset.diff)].id===d.id){b.classList.add('found');b.innerHTML='<span aria-hidden="true">✓</span>';b.setAttribute('aria-label',b.getAttribute('aria-label')+', schon gefunden');}});
  $('feedback').textContent=complete()?'Alle Unterschiede gefunden! Jetzt kannst du weiter.':'Richtig! '+d.words[0]+' und '+d.words[1]+'. Suche weiter auf den Bildern.';updateProgress();$('feedback').scrollIntoView({block:'center'});$('next').focus({preventScroll:true});if(!complete())document.querySelector('.forest-scroll').focus({preventScroll:true});scheduleButtons();
 }
 $('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
 ['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();window.addEventListener('resize',scheduleButtons);if(document.fonts)document.fonts.ready.then(scheduleButtons);window.addEventListener('pagehide',stopAudio);
 
 fetch('content.json?v=2').then(r=>{if(!r.ok)throw Error('Text');return r.json();}).then(data=>{if(typeof data.original!=='string'||typeof data.simple!=='string'||data.differences.length!==6)throw Error('Inhalt');content=data;try{localStorage.setItem(VISITED,String(Math.max(7,Number(localStorage.getItem(VISITED))||0)));}catch{}if(new URLSearchParams(location.search).get('abschnitt')==='abschluss'){phase=3;solved=new Set(content.differences.map(d=>d.id));}render();}).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Die Geschichte konnte nicht geladen werden.</h1><button class="primary" onclick="location.reload()">Erneut laden</button></section>';});
})();
