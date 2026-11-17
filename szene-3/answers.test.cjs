'use strict';
const assert=require('node:assert/strict');
const A=require('./answers.js');
const cases=[
 ['grau','correct'],['GRAU','correct'],['graue Spinnen','correct'],
 ['Die Spinnen müssen grau sein.','correct'],['graun','correct'],['grauh','correct'],
 ['blau','partial'],['BLAUE FARBE','partial'],['Farbe','partial'],['Spinnen','partial'],
 ['Die Spinnen sind blau, sie sollen grau sein.','correct'],
 ['nicht grau','wrong'],['Die Spinnen sind nicht grau.','wrong'],
 ['grau ist falsch','wrong'],['Falsch ist grau','wrong'],
 ['blau oder grau','clarify'],['vielleicht grau oder blau','clarify'],
 ['rot','wrong'],['grün','wrong'],['','empty'],['   ','empty'],
 ['Tautropfen','clarify'],['graue ist falsch','wrong'],
 ['nicht blau sondern grau','correct'],
 ['die Spinnen sind nicht blau, sie sind grau','correct'],
 ['graue Spinnen sind falsch','wrong']
];
for(const [value,kind] of cases)assert.equal(A.evaluate(value).kind,kind,value);
let state=A.initial();
for(const value of ['','Spinnen','Farbe','blau','Tautropfen'])state=A.submit(state,value);
assert.equal(state.mistakes,0);assert.equal(state.help,false);
for(const value of ['rot','grün'])state=A.submit(state,value);
assert.equal(state.help,false);
state=A.submit(state,'gelb');assert.equal(state.mistakes,3);assert.equal(state.help,true);
state=A.submit(state,'grau');assert.equal(state.done,true);
assert.deepEqual(A.submit(state,'rot'),state);
for(const [random,fixed] of [[0,0],[.25,1],[.5,2],[.75,3],[.9999,3]]){
 assert.deepEqual(A.letters(()=>random),{word:'grau',fixed});
}
console.log(cases.length+' Antwortfälle und Zustands-/Hilferegeln bestanden.');

let correction=A.submit(A.initial(),'blau');
assert.equal(correction.done,false);
assert.equal(A.evaluate('BLAUE SPINNEN').identifiedBlue,true);
const wrongBlue=A.submitCorrection(correction,'blau');
assert.equal(wrongBlue.mistakes,1);assert.equal(wrongBlue.done,false);
assert.equal(A.submitCorrection(correction,'').mistakes,0);
correction=A.submitCorrection(wrongBlue,'rot');
assert.equal(correction.help,false);
correction=A.submitCorrection(correction,'gelb');
assert.equal(correction.help,true);
correction=A.submitCorrection(correction,'GRAU');
assert.equal(correction.done,true);
console.log('Zweiter Antwortschritt und Hilfe bestanden.');
