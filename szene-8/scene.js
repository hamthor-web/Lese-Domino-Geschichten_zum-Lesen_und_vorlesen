'use strict';
(()=>{
const $=id=>document.getElementById(id);
const visited='silvana-visited-scenes-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content,phase=0,feedback='',videoAvailable=false;
function sizes(){document.documentElement.style.setProperty('--text',Number($('textSize').value)/100);document.documentElement.style.setProperty('--board',Number($('boardSize').value)/100);$('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';}
function picture(){return '<figure class="king-picture"><img src="'+esc(content.image)+'" width="1536" height="1152" alt="Der König steht im Wald am glitzernden Spinnennetz. Er hebt ratlos die Hände."></figure>';}
function reading(){return '<div class="reading">'+esc(content.simple)+'</div>';}
function nextButton(){return '<button class="video-next" id="next" aria-label="Weiter"><video id="nextMovie" src="'+esc(content.nextVideo)+'" autoplay loop muted playsinline preload="auto" aria-hidden="true"></video><span class="video-fallback">Weiter</span></button>';}
function navigation(forward=false){return '<div class="actions scene-navigation"><button class="secondary" id="back">← Zurück</button>'+(forward?nextButton():'')+'</div>';}
function hint(){return '<p class="scene-feedback" id="feedback" role="status" aria-live="polite">'+esc(feedback)+'</p>';}
function render(){
 let html='<section class="panel">';
 if(phase===0)html+='<h1>Der enttäuschte König</h1><p class="king-question">Lies den Text in deinem Tempo.</p>'+reading()+picture()+navigation(true);
 if(phase===1)html+='<h1>Wie fühlt sich der König?</h1>'+picture()+'<p class="king-question">Welcher Smiley passt zum König?</p><div class="emotions" role="group" aria-label="Welches Gefühl passt zum König?"><button class="emotion" data-feel="sad" aria-label="Enttäuscht" title="Enttäuscht">😞</button><button class="emotion" data-feel="angry" aria-label="Wütend" title="Wütend">😠</button><button class="emotion" data-feel="happy" aria-label="Glücklich" title="Glücklich">😊</button></div>'+hint()+'<details><summary>Lesetext noch einmal ansehen</summary>'+reading()+'</details>'+navigation();
 if(phase===2)html+='<h1>Warum ist der König enttäuscht?</h1>'+picture()+'<p class="king-question">Lies die drei Sätze. Welcher passt zur Geschichte?</p><div class="answer-list">'+content.answers.map((a,i)=>'<button class="answer" data-answer="'+i+'">'+esc(a)+'</button>').join('')+'</div>'+hint()+'<details><summary>Lesetext noch einmal ansehen</summary>'+reading()+'</details>'+navigation();
 if(phase===3)html+='<h1>Richtig erkannt!</h1>'+picture()+'<p class="king-question">'+esc(content.answers[content.correct])+'</p><p class="scene-feedback">Du hast erkannt, warum der König enttäuscht ist.</p><div class="actions"><button class="secondary" id="again">Diese Szene wiederholen</button></div>'+navigation();
 html+='</section>';$('game').innerHTML=html;
 document.querySelectorAll('[data-feel]').forEach(b=>b.onclick=()=>{if(b.dataset.feel==='sad'){phase=2;feedback='';render();}else{feedback='Schau dir den König an. Was hat er sich von den Spinnweben erhofft?';render();}});
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.answer)===content.correct){phase=3;feedback='';render();}else{feedback='Das passt noch nicht. Denke an die glitzernden Tautropfen.';render();}});
 if($('back'))$('back').onclick=()=>{if(phase===0)location.assign('../szene-7/?abschnitt=abschluss');else{phase--;feedback='';render();}};
 if($('next')){$('next').onclick=()=>{phase=1;feedback='';render();}; const video=$('nextMovie');if(video){video.addEventListener('loadeddata',()=>{$('next').classList.add('video-ready');});video.addEventListener('error',()=>{$('next').classList.remove('video-ready');});if(video.readyState>=2)$('next').classList.add('video-ready');video.play().catch(()=>{});}}
 if($('again'))$('again').onclick=()=>{phase=0;feedback='';render();};
}
$('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
fetch('content.json?v=3').then(r=>{if(!r.ok)throw Error('Textdatei nicht gefunden');return r.json();}).then(data=>{
if(!Array.isArray(data.answers)||data.answers.length!==3||data.correct!==1||!data.simple)throw Error('Unvollständige Textdaten');
content=data;try{localStorage.setItem(visited,String(Math.max(8,Number(localStorage.getItem(visited))||0)));}catch{}render();
}).catch(()=>{$('game').innerHTML='<section class="panel"><h1>Der Text konnte nicht geladen werden.</h1><button class="primary" onclick="location.reload()">Erneut laden</button></section>';});
})();