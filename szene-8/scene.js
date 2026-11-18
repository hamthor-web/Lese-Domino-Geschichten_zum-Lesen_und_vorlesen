'use strict';
(()=>{
const $=id=>document.getElementById(id), visited='silvana-visited-scenes-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content,phase=0,feedback='';
function sizes(){
 document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);
 document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);
 $('textOutput').textContent=$('textSize').value+' %';
 $('boardOutput').textContent=$('boardSize').value+' %';
}
function picture(){return '<figure class="king-picture"><img src="'+esc(content.image)+'" width="1536" height="1152" alt="Der König steht im Wald am glitzernden Spinnennetz und hebt die Hände."></figure>';}
function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
function navigation(forward=false){return '<div class="actions scene-navigation">'+(forward?'<button class="primary" id="next">Weiter</button>':'')+(phase === 0 ? '' : '<button class="secondary" id="back">← Zurück</button>')+'</div>';}
function hint(){return '<p class="scene-feedback" id="feedback" role="status" aria-live="polite">'+esc(feedback)+'</p>';}
function render(){
 $('transitionVideo')?.pause();
 let html='<section class="panel">';
 if(phase===0)html+='<h1>Der wütende König</h1><p class="king-question">Lies den Text in deinem Tempo.</p>'+reading()+picture()+navigation(true);
 if(phase===1)html+='<h1>Wie fühlt sich der König?</h1>'+picture()+'<p class="king-question">Welcher Smiley passt zum König?</p><div class="emotions" role="group" aria-label="Welches Gefühl passt zum König?"><button class="emotion" data-feel="angry" aria-label="Wütend" title="Wütend">😠</button><button class="emotion" data-feel="sad" aria-label="Traurig" title="Traurig">😢</button><button class="emotion" data-feel="happy" aria-label="Fröhlich" title="Fröhlich">😊</button></div>'+hint()+'<details><summary>Lesetext noch einmal ansehen</summary>'+reading()+'</details>'+navigation();
 if(phase===2)html+='<h1>Warum ist der König wütend?</h1>'+picture()+'<p class="king-question">Lies die drei Sätze. Welcher passt zur Geschichte?</p><div class="answer-list">'+content.answers.map((a,i)=>'<button class="answer" data-answer="'+i+'">'+esc(a)+'</button>').join('')+'</div>'+hint()+'<details><summary>Lesetext noch einmal ansehen</summary>'+reading()+'</details>'+navigation();
 if(phase===3)html+='<h1>Richtig erkannt!</h1>'+picture()+'<p class="king-question">'+esc(content.answers[content.correct])+'</p><p class="scene-feedback">Du hast erkannt, warum der König wütend ist.</p><button class="scene-transition" id="goToNextScene" type="button" disabled aria-label="Würstchen-Animation läuft"><video id="transitionVideo" width="354" height="354" poster="assets/wuerstchen-uebergang.jpg" src="assets/Wuerstchen_Animation.mp4" muted playsinline preload="none" aria-hidden="true"></video><span class="transition-fallback" aria-hidden="true" hidden></span></button><p id="transitionStatus" class="scene-feedback" role="status" hidden></p><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+navigation();
 html+='</section>';$('game').innerHTML=html;
 document.querySelectorAll('[data-feel]').forEach(b=>b.onclick=()=>{if(b.dataset.feel==='angry'){phase=2;feedback='';render();}else{feedback='Schau dir den Text noch einmal an: Wie reagiert der König?';render();}});
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.answer)===content.correct){phase=3;feedback='';render();}else{feedback='Das passt noch nicht. Was hat der König sich im Wald erhofft?';render();}});
 if($('back'))$('back').onclick=()=>{phase--;feedback='';render();};
 if($('next'))$('next').onclick=()=>{phase=1;feedback='';render();};
 if($('again'))$('again').onclick=()=>{phase=0;feedback='';render();};
 if(phase===3)playTransition();
}
function playTransition(){
 const button=$('goToNextScene'), video=$('transitionVideo'), status=$('transitionStatus');
 const label=button.querySelector('.transition-fallback');
 function enable(action,ariaLabel,fallbackText=''){
  if(!button.isConnected)return;
  label.textContent=fallbackText;
  label.hidden=!fallbackText;
  button.setAttribute('aria-label',ariaLabel);
  button.onclick=action;
  button.disabled=false;
 }
 const ready=(fallbackText='')=>enable(()=>openNextScene(button,status),'Weiter zur nächsten Szene',fallbackText);
 video.addEventListener('ended',()=>ready(),{once:true});
 video.addEventListener('error',()=>ready('Weiter'),{once:true});
 function play(){
  button.disabled=true;
  button.setAttribute('aria-label','Würstchen-Animation läuft');
  label.hidden=true;
  video.play().catch(error=>{
   if(error.name==='NotAllowedError')enable(play,'Würstchen-Animation abspielen','▶ Abspielen');
   else ready('Weiter');
  });
 }
 button.scrollIntoView({block:'nearest',behavior:'instant'});
 play();
}
async function openNextScene(button,status){
 button.disabled=true;
 try {
  const response=await fetch('../szene-9/index.html',{method:'HEAD',cache:'no-store'});
  if(!button.isConnected)return;
  if(response.ok){
   location.assign('../szene-9/');
   return;
  }
 } catch {
  // Die Abschlussseite bleibt auch ohne Netz bedienbar.
 }
 if(!button.isConnected)return;
 button.disabled=false;
 status.textContent='Hier geht die Geschichte bald weiter.';
 status.hidden=false;
}
$('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
fetch('content.json?v=4').then(r=>{if(!r.ok)throw Error('Textdatei nicht gefunden');return r.json();}).then(data=>{
 if(!Array.isArray(data.answers)||data.answers.length!==3||data.correct!==2||!data.simple)throw Error('Unvollständige Textdaten');
 content=data;try{localStorage.setItem(visited,String(Math.max(8,Number(localStorage.getItem(visited))||0)));}catch{}render();
}).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Der Text konnte nicht geladen werden.</h1><button class="primary" onclick="location.reload()">Erneut laden</button></section>';});
})();