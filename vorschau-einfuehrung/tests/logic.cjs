const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const slots={settingsToggle:{},textSize:{value:'100',addEventListener(){}},boardSize:{value:'100',addEventListener(){}}};
let spoken=null,cancelled=0,paused=0,resumed=0;
const context=vm.createContext({console,fetch:()=>new Promise(()=>{}),document:{getElementById:id=>slots[id]||null,addEventListener(){}},window:{speechSynthesis:{},SpeechSynthesisUtterance:function(){},addEventListener(){}},speechSynthesis:{cancel(){cancelled++},pause(){paused++},resume(){resumed++},getVoices(){return [{lang:'de-DE'}]},speak(u){spoken=u}},SpeechSynthesisUtterance:function(text){this.text=text},localStorage:{setItem(){}}});
vm.runInContext(fs.readFileSync('game.js','utf8'),context);
const data=JSON.parse(fs.readFileSync('content.json','utf8'));
vm.runInContext('content='+JSON.stringify(data),context);
const run=s=>vm.runInContext(s,context);
for(const p of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]){run('placed='+JSON.stringify(p)+';check()');assert.equal(run('solved'),p.join()==='0,1,2');assert.equal(run('placed.join()'),p.join());}
run('placed=[0];check()');assert.equal(run('solved'),false);
run('placed=[0,1,2];check();selected=1;shiftTile(-1)');assert.equal(run('placed.join()'),'1,0,2');assert.equal(run('solved'),false);
run('selected=1;removeTile()');assert.equal(run('placed.join()'),'0,2');run('move(1,1)');assert.equal(run('placed.join()'),'0,1,2');
run('move(1,3)');assert.equal(run('placed.join()'),'0,2,1');run('move(9,0)');assert.equal(run('placed.join()'),'0,2,1');
run('speak()');assert.equal(spoken.text,data.original);assert.equal(spoken.lang,'de-DE');assert.equal(run('audioState'),'playing');
run('toggleAudio()');assert.equal(paused,1);assert.equal(run('audioState'),'paused');run('toggleAudio()');assert.equal(resumed,1);assert.equal(run('audioState'),'playing');
const oldUtterance=spoken;run('stopAudio()');oldUtterance.onend();assert.equal(run('audioState'),'idle');assert.ok(cancelled>=2);
assert.equal(run('escapeHtml("<b>&")'),'&lt;b&gt;&amp;');
console.log('Passed: six sentence orders, incomplete sentence, correction/return/drop guards, unchanged wrong orders, original audio text, pause/resume/cancellation, escaping.');
