'use strict';
(()=>{
const $=id=>document.getElementById(id);
const visited='silvana-visited-scenes-v1';
const answers=[
 'Der König ist enttäuscht, weil er die Spinnweben nicht mit nach Hause nehmen kann.',
 'Der König ist enttäuscht, weil er die Schönheit der Tautropfen nicht gesehen hat.',
 'Der König ist enttäuscht, weil er zu viel Geld bezahlen musste.'
];
let step=0, selected=-1, message='';
function sizes(){const t=Number($('textSize').value)/100,b=Number($('boardSize').value)/100;document.documentElement.style.setProperty('--text',t);document.documentElement.style.setProperty('--board',b);$('textOutput').textContent=$('textSize').value+' %';$('boardOutput').textContent=$('boardSize').value+' %';}
function image(){return '<figure class="king-picture"><img src="assets/koenig-enttaeuscht.png" onerror="this.onerror=null;this.src=\'../szene-7/assets/wald-a.png\';" alt="Der König steht im sonnigen Wald vor einem glitzernden Spinnennetz, die Hände ratlos erhoben."></figure>';}
function nav(){return '<div class="actions scene-navigation"><button class="secondary" id="back">← Zurück</button>'+(step===2?'<button class="primary" id="again">Noch einmal spielen</button>':'')+'</div>'}
function render(){
let html='<section class="panel">'+image();
if(step===0)html+='<h1>Wie fühlt sich der König?</h1><p class="king-question">Schau dir sein Gesicht an. Welches Gefühl passt?</p><div class="emotions" role="group" aria-label="Wähle das Gefühl des Königs"><button class="emotion" data-feel="sad" aria-label="enttäuscht" title="Enttäuscht">😞</button><button class="emotion" data-feel="angry" aria-label="wütend" title="Wütend">😠</button><button class="emotion" data-feel="happy" aria-label="glücklich" title="Glücklich">😊</button></div><p class="scene-feedback" role="status">'+message+'</p>';
if(step===1)html+='<h1>Richtig, der König ist enttäuscht!</h1><p class="king-question">Warum ist der König enttäuscht? Lies die Sätze und wähle den passenden.</p><div class="answer-list">'+answers.map((a,i)=>'<button class="answer" data-answer="'+i+'">'+a+'</button>').join('')+'</div><p class="scene-feedback" role="status">'+message+'</p>';
if(step===2)html+='<h1>Genau! Du hast den Grund gefunden.</h1><p class="king-question">'+answers[0]+'</p><p class="scene-feedback">Du hast erkannt, wie sich der König fühlt und warum.</p>';
html+=nav()+'</section>';$('game').innerHTML=html;
document.querySelectorAll('[data-feel]').forEach(b=>b.onclick=()=>{if(b.dataset.feel==='sad'){step=1;message='';render();}else{message='Schau dir das Gesicht des Königs noch einmal genau an.';render();}});
document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.answer);if(n===0){selected=n;step=2;message='';render();}else{message='Das passt noch nicht zur Geschichte. Lies die drei Sätze noch einmal.';render();}});
$('back').onclick=()=>{if(step===0)location.href='../szene-7/?abschnitt=abschluss';else{step--;message='';render();}};
if($('again'))$('again').onclick=()=>{step=0;selected=-1;message='';render();};
}
$('settingsToggle').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));};
['textSize','boardSize'].forEach(id=>$(id).addEventListener('input',sizes));sizes();
try{localStorage.setItem(visited,String(Math.max(8,Number(localStorage.getItem(visited))||0)));}catch{}
render();
})();