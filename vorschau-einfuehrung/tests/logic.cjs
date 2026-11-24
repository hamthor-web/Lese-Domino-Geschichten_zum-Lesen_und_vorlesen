const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const slots={settingsToggle:{},textSize:{value:'100',addEventListener(){}},boardSize:{value:'100',addEventListener(){}}};
let spoken=null,cancelled=0;
const context=vm.createContext({
 console,
 fetch:()=>new Promise(()=>{}),
 document:{getElementById:id=>slots[id]||null,addEventListener(){},removeEventListener(){}},
 window:{
  speechSynthesis:{cancel(){cancelled++},getVoices(){return [{lang:'de-DE'}]},speak(u){spoken=u}},
  SpeechSynthesisUtterance:function(text){this.text=text},
  addEventListener(){}
 },
 SilvanaProgress:{finish(){},isCurrent(){return true}},
 localStorage:{setItem(){}}
});
vm.runInContext(fs.readFileSync('../shared/story-speech.js','utf8'),context);
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
const data=JSON.parse(fs.readFileSync('content.json','utf8'));
vm.runInContext('content='+JSON.stringify(data),context);
const run=s=>vm.runInContext(s,context);
for(const p of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]){run('placed='+JSON.stringify(p)+';check()');assert.equal(run('solved'),p.join()==='0,1,2');assert.equal(run('placed.join()'),p.join());}
run('placed=[0];check()');assert.equal(run('solved'),false);
run('placed=[0,1,2];check();selected=1;shiftTile(-1)');assert.equal(run('placed.join()'),'1,0,2');assert.equal(run('solved'),false);
run('selected=1;removeTile()');assert.equal(run('placed.join()'),'0,2');run('move(1,1)');assert.equal(run('placed.join()'),'0,1,2');
run('move(1,3)');assert.equal(run('placed.join()'),'0,2,1');run('move(9,0)');assert.equal(run('placed.join()'),'0,2,1');
run('audio=createStorySpeech(()=>{});audio.start(content.original)');
const firstSentence=[...new Intl.Segmenter('de',{granularity:'sentence'}).segment(data.original)][0].segment.trim();
assert.equal(spoken.text,firstSentence);
assert.equal(spoken.lang,'de-DE');
assert.equal(run('audio.state'),'playing');
run('audio.toggle(content.original)');
assert.equal(run('audio.state'),'paused');
run('audio.toggle(content.original)');
assert.equal(spoken.text,firstSentence);
assert.equal(run('audio.state'),'playing');
const oldUtterance=spoken;
run('stopAudio()');
oldUtterance.onend();
assert.equal(run('audio.state'),'idle');
assert.equal(cancelled,2);
assert.equal(run('escapeHtml("<b>&")'),'&lt;b&gt;&amp;');
console.log('Passed: six sentence orders, incomplete sentence, correction/return/drop guards, unchanged wrong orders, original audio text, pause/resume/cancellation, escaping.');
