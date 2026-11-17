/* Browser + Node: reine Antwortlogik ohne DOM und ohne Netzwerk. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SilvanaSpiderAnswers=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function normalize(value){return String(value).normalize('NFKC').toLocaleLowerCase('de-DE').trim().replace(/[.,!?;:„“"'()]/g,' ').replace(/\s+/g,' ');}
 function initial(){return {mistakes:0,help:false,done:false,prompt:'Schreibe auf, was falsch ist.',feedback:''};}
 function evaluate(value){
  const s=normalize(value);
  if(!s)return {kind:'empty',feedback:'Schreibe ein Wort oder einen kurzen Satz.'};
  const gray=/\b(?:grau(?:e|en|er|es)?|graun|grauh)\b/.test(s);
  const blue=/\b(?:blau(?:e|en|er|es)?|blauhe|blauhen)\b/.test(s);
  const negatedGray=/\b(?:nicht|kein|keine|keinen|keiner)\s+(?:(?:wirklich|mehr|richtig|ganz|nur|die|farbe)\s+){0,2}grau\w*\b/.test(s);
  const wrongGray=/\bgrau\w*\s+(?:spinnen\s+)?(?:ist|sind|war|waren)\s+(?:die\s+)?(?:falsch\w*|verkehrt\w*)\b/.test(s)||/\b(?:falsch\w*|verkehrt\w*)\s+(?:ist|sind|war|waren)\s+(?:die\s+)?grau\w*\b/.test(s);
  if(gray&&blue&&/\b(?:oder|vielleicht|eventuell)\b/.test(s))return {kind:'clarify',feedback:'Welche Farbe sollen die Spinnen haben? Entscheide dich für eine Farbe.'};
  if(negatedGray||wrongGray)return {kind:'wrong',feedback:'Lies noch einmal nach: Welche Farbe haben die Spinnen im Text?'};
  if(gray)return {kind:'correct',feedback:'Richtig! Im Text sind die Spinnen grau.'};
  if(blue)return {kind:'partial',identifiedBlue:true,feedback:'Du hast die blaue Farbe bemerkt. Welche Farbe sollen die Spinnen laut Text haben?'};
  if(/\bfarb\w*\b/.test(s))return {kind:'partial',feedback:'Du hast die Farbe entdeckt. Schreibe die richtige Farbe der Spinnen auf.'};
  if(/\bspinn\w*\b/.test(s))return {kind:'partial',feedback:'Du hast die Spinnen entdeckt. Was ist an ihnen anders? Schreibe die richtige Farbe auf.'};
  if(/\b(?:tropfen|tautropfen|glitzern|netz|netze|spinnennetz|spinnennetze)\b/.test(s))return {kind:'clarify',feedback:'Vergleiche die Spinnen in beiden Bildern. Was ist an ihnen anders?'};
  return {kind:'wrong',feedback:'Schau noch einmal in den Lesetext und vergleiche die Spinnen.'};
 }
 function submit(state,value){
  if(state.done)return {...state};
  const result=evaluate(value);
  const mistakes=state.mistakes+(result.kind==='wrong'?1:0);
  return {...state,mistakes,help:state.help||mistakes>=3,done:result.kind==='correct',
   prompt:result.kind==='empty'?state.prompt:(result.kind==='correct'?'Die richtige Farbe ist gefunden.':'Welche Farbe sollen die Spinnen laut Text haben?'),
   feedback:result.feedback};
 }
 function submitCorrection(state,value){
  if(state.done)return {...state};
  const result=evaluate(value);
  const isWrong=!['correct','empty','clarify'].includes(result.kind);
  const mistakes=state.mistakes+(isWrong?1:0);
  return {...state,mistakes,help:state.help||mistakes>=3,done:result.kind==='correct',
   feedback:result.identifiedBlue?'Blau ist die Farbe im falschen Bild. Welche Farbe steht im Text?':result.feedback};
 }
 function letters(random){return {word:'grau',fixed:Math.min(3,Math.max(0,Math.floor((random||Math.random)()*4)))};}
 return {normalize,initial,evaluate,submit,submitCorrection,letters};
});
