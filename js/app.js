(()=>{
/* ================= Key maps (matched by physical key position, KeyboardEvent.code, so ABNT2 and US both work) =================
   Contínuo  : Z row = Dó4 and runs on through , . ; /   (blacks S D G H J · L Ç)
               Q row = Dó5 and runs on through I O P ´ [  (blacks 2 3 5 6 7 · 9 0 =)   range Dó4–Sol6
   Heartopia : , . ; O P ´ [ = Dó3 · Z..M = Dó4 · Q..U = Dó5 · I = Dó6                range Dó3–Dó6 */
const STEPS=[0,2,4,5,7,9,11];
const SOLFA=['Dó','Dó♯','Ré','Ré♯','Mi','Fá','Fá♯','Sol','Sol♯','Lá','Lá♯','Si'];
const STYLES={
  cont:{lo:60,hi:91,rows:[
    ['KeyQ','Digit2','KeyW','Digit3','KeyE','KeyR','Digit5','KeyT','Digit6','KeyY','Digit7','KeyU','KeyI','Digit9','KeyO','Digit0','KeyP','BracketLeft','Equal','BracketRight'],
    ['KeyZ','KeyS','KeyX','KeyD','KeyC','KeyV','KeyG','KeyB','KeyH','KeyN','KeyJ','KeyM','Comma','KeyL','Period','Semicolon','Slash','IntlRo']],
    starts:[72,60]},
  heart:{lo:48,hi:84,rows:[
    ['Comma','KeyL','Period','Semicolon','Slash','KeyO','Digit0','KeyP','Minus','BracketLeft','Equal','BracketRight'],
    ['KeyZ','KeyS','KeyX','KeyD','KeyC','KeyV','KeyG','KeyB','KeyH','KeyN','KeyJ','KeyM'],
    ['KeyQ','Digit2','KeyW','Digit3','KeyE','KeyR','Digit5','KeyT','Digit6','KeyY','Digit7','KeyU','KeyI']],
    starts:[48,60,72]}
};
const LAYOUT_LABELS={
  abnt2:{Comma:',',Period:'.',Slash:';',IntlRo:'/',Semicolon:'Ç',BracketLeft:'´',BracketRight:'[',Minus:'-',Equal:'='},
  us:{Comma:',',Period:'.',Slash:'/',IntlRo:'\\',Semicolon:';',BracketLeft:'[',BracketRight:']',Minus:'-',Equal:'='}
};
const labelFor=code=>LAYOUT_LABELS[layout][code]||(code.startsWith('Key')?code.slice(3):code.startsWith('Digit')?code.slice(5):code);
let LO,HI,NW,style='cont',layout='abnt2';
const KEYS={},CODE2MIDI={};
const WI2MIDI=i=>LO+12*Math.floor(i/7)+STEPS[i%7];
function buildKeys(){
  const st=STYLES[style];LO=st.lo;HI=st.hi;
  for(const k in KEYS)delete KEYS[k];for(const k in CODE2MIDI)delete CODE2MIDI[k];
  NW=0;for(let m=LO;m<=HI;m++)if(STEPS.includes(m%12))NW++;
  for(let i=0;i<NW;i++){const m=WI2MIDI(i);KEYS[m]={wi:i,black:false};if([0,2,5,7,9].includes(STEPS[i%7])&&m+1<HI)KEYS[m+1]={wi:i,black:true}}
  st.rows.forEach((row,r)=>row.forEach((code,j)=>{const m=st.starts[r]+j;if(KEYS[m])CODE2MIDI[code]=m}));
  setLayout(layout);
}
function setLayout(l){
  layout=l;
  for(const k of Object.values(KEYS)){k.label='';k.alt=''}
  for(const[code,m]of Object.entries(CODE2MIDI)){const k=KEYS[m],lab=labelFor(code);if(!k.label)k.label=lab;else k.alt=lab}
}
buildKeys();
const fitRange=m=>{while(m<LO)m+=12;while(m>HI)m-=12;return m};
function fitSong(notes){
  const ref=notes.some(n=>n.mel)?notes.filter(n=>n.mel):notes;
  let best=0,bc=-1;for(let k=-3;k<=3;k++){const c=ref.filter(n=>n.midi+12*k>=LO&&n.midi+12*k<=HI).length;if(c>bc||(c===bc&&Math.abs(k)<Math.abs(best))){bc=c;best=k}}
  const out=notes.map(n=>({...n,midi:fitRange(n.midi+12*best)})).sort((a,b)=>a.t-b.t||a.midi-b.midi);
  const lastT={};return out.filter(n=>{const ok=!(n.midi in lastT)||n.t-lastT[n.midi]>=.03;lastT[n.midi]=n.t;return ok});
}
function refitSongs(){SONGS.forEach(s=>{s.notes=fitSong(s.raw||s.notes)})}

/* ================= Songs ================= */
function nameToMidi(n){const m=/^([A-G])(#?)(-?\d)$/.exec(n);return 12*(+m[3]+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0)}
function track(seq,unit){let t=0;const out=[];for(const tok of seq.trim().split(/\s+/)){if(tok==='|')continue;const[ns,d]=tok.split(':');const dur=+d*unit;if(ns!=='R')for(const n of ns.split('+'))out.push({t,midi:nameToMidi(n),dur:dur*.92});t+=dur}return out}
function mk(name,unit,...tr){return{name,kind:tr.length>1?'builtin':'easy',raw:tr.flatMap((s,i)=>track(s,unit).map(n=>({...n,mel:i===0}))),notes:[]}}
const EASY=[
 mk('Maria Tinha um Carneirinho',.5,'E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:2 | D4:1 D4:1 D4:2 | E4:1 G4:1 G4:2 | E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:1 E4:1 | D4:1 D4:1 E4:1 D4:1 | C4:4'),
 mk('Frère Jacques (Frei João)',.5,'C4:1 D4:1 E4:1 C4:1 | C4:1 D4:1 E4:1 C4:1 | E4:1 F4:1 G4:2 | E4:1 F4:1 G4:2 | G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 | G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 | C4:1 G3:1 C4:2 | C4:1 G3:1 C4:2'),
 mk('Jingle Bells (refrão)',.4,'E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:.5 | E4:4 | F4:1 F4:1 F4:1.5 F4:.5 | F4:1 E4:1 E4:1 E4:.5 E4:.5 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2 | E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:.5 | E4:4 | F4:1 F4:1 F4:1.5 F4:.5 | F4:1 E4:1 E4:1 E4:.5 E4:.5 | G4:1 G4:1 F4:1 D4:1 | C4:4'),
 mk('Parabéns pra Você',.5,'G4:.75 G4:.25 | A4:1 G4:1 C5:1 | B4:2 G4:.75 G4:.25 | A4:1 G4:1 D5:1 | C5:2 G4:.75 G4:.25 | G5:1 E5:1 C5:1 | B4:1 A4:2 F5:.75 F5:.25 | E5:1 C5:1 D5:1 | C5:3')
];
const C='C3+G3',G='G2+D3',F='F2+C3';
const SONGS=[...EASY,
 mk('Ode à Alegria — Beethoven',.5,
  'E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | E4:1.5 D4:.5 D4:2 | E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:1.5 C4:.5 C4:2 | D4:1 D4:1 E4:1 C4:1 | D4:1 E4:.5 F4:.5 E4:1 C4:1 | D4:1 E4:.5 F4:.5 E4:1 D4:1 | C4:1 D4:1 G3:2 | E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:1.5 C4:.5 C4:2',
  `${C}:4 | ${G}:4 | ${C}:4 | ${C}:2 ${G}:2 | ${C}:4 | ${G}:4 | ${C}:4 | ${G}:2 ${C}:2 | ${G}:2 ${C}:2 | ${G}:2 ${C}:2 | ${G}:2 ${C}:1 ${G}:1 | ${C}:2 ${G}:2 | ${C}:4 | ${G}:4 | ${C}:4 | ${G}:2 ${C}:2`),
 mk('Brilha, Brilha Estrelinha',.5,
  'C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:2 | G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 | G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 | C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:2',
  `${C}:4 | ${F}:2 ${C}:2 | ${F}:2 ${C}:2 | ${G}:2 ${C}:2 | ${C}:2 ${F}:2 | ${C}:2 ${G}:2 | ${C}:2 ${F}:2 | ${C}:2 ${G}:2 | ${C}:4 | ${F}:2 ${C}:2 | ${F}:2 ${C}:2 | ${G}:2 ${C}:2`),
 mk('Für Elise (início) — Beethoven',.19,
  'E5:1 D#5:1 | E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 | A4:3 C4:1 E4:1 A4:1 | B4:3 E4:1 G#4:1 B4:1 | C5:3 E4:1 E5:1 D#5:1 | E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 | A4:3 C4:1 E4:1 A4:1 | B4:3 E4:1 C5:1 B4:1 | A4:6',
  'R:2 | R:6 | A2:1 E3:1 A3:1 R:3 | E2:1 E3:1 G#3:1 R:3 | A2:1 E3:1 A3:1 R:3 | R:6 | A2:1 E3:1 A3:1 R:3 | E2:1 E3:1 G#3:1 R:3 | A2:1 E3:1 A3:4')
];
let recCount=0;
try{const saved=JSON.parse(localStorage.getItem('pc-recordings')||'[]');saved.forEach(s=>{s.raw=s.raw||s.notes;SONGS.push(s)});recCount=saved.length}catch(e){}
try{const st=localStorage.getItem('pc-style');if(st&&STYLES[st]){style=st;buildKeys()}}catch(e){}
refitSongs();
function saveRecordings(){try{localStorage.setItem('pc-recordings',JSON.stringify(SONGS.filter(s=>s.kind==='rec')))}catch(e){}}

/* ================= MIDI parser (all notes, with durations) ================= */
function parseMidi(buf){
  const d=new DataView(buf);let p=0;
  const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(d.getUint8(p+i));p+=n;return s};
  const u32=()=>{const v=d.getUint32(p);p+=4;return v},u16=()=>{const v=d.getUint16(p);p+=2;return v},u8=()=>d.getUint8(p++);
  const vlq=()=>{let v=0,b;do{b=u8();v=(v<<7)|(b&0x7f)}while(b&0x80);return v};
  if(str(4)!=='MThd')throw new Error('Este arquivo não é um MIDI válido.');
  const hl=u32();u16();const ntr=u16();const div=u16();p=8+hl;
  if(div&0x8000)throw new Error('Este MIDI usa tempo SMPTE, que ainda não é suportado.');
  const tempos=[{tick:0,us:500000}],raw=[];
  for(let t=0;t<ntr&&p<d.byteLength;t++){
    const id=str(4),len=u32(),end=p+len;
    if(id!=='MTrk'){p=end;continue}
    let tick=0,run=0;const open={};
    while(p<end){
      tick+=vlq();
      const b=d.getUint8(p);let st;
      if(b>=0x80){p++;st=b;if(b<0xF0)run=b}else st=run;
      if(st===0xFF){const ty=u8(),l=vlq();if(ty===0x51)tempos.push({tick,us:(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2)});p+=l}
      else if(st===0xF0||st===0xF7){p+=vlq()}
      else{const hi=st&0xF0,ch=st&0x0F;
        if(hi===0xC0||hi===0xD0){p+=1}
        else{const a=u8(),v=u8();if(ch===9)continue;const k=ch*128+a;
          if(hi===0x90&&v>0){const n={tick,end:tick+div/2,midi:a};raw.push(n);(open[k]=open[k]||[]).push(n)}
          else if(hi===0x80||(hi===0x90&&v===0)){const s=open[k];if(s&&s.length)s.shift().end=tick}}}
    }
    p=end;
  }
  tempos.sort((a,b)=>a.tick-b.tick);
  const toSec=tick=>{let s=0,last=0,us=500000;for(const tp of tempos){if(tp.tick>=tick)break;s+=(tp.tick-last)*us/div/1e6;last=tp.tick;us=tp.us}return s+(tick-last)*us/div/1e6};
  let notes=raw.map(n=>{const t=toSec(n.tick);return{t,midi:n.midi,dur:Math.max(.08,toSec(n.end)-t)}}).sort((a,b)=>a.t-b.t||a.midi-b.midi);
  notes=notes.filter((n,i)=>!(i&&notes[i-1].midi===n.midi&&n.t-notes[i-1].t<.03));
  if(!notes.length)throw new Error('Não encontrei notas de piano neste MIDI.');
  const t0=notes[0].t;notes.forEach(n=>n.t-=t0);
  return notes;
}

/* ================= Piano synth ================= */
let ac,master,wave,noiseBuf;
function audio(){
  if(!ac){
    ac=new (window.AudioContext||window.webkitAudioContext)();
    const comp=ac.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;
    master=ac.createGain();master.gain.value=.75;master.connect(comp).connect(ac.destination);
    const amps=[0,1,.6,.32,.22,.14,.09,.06,.04,.03,.02,.015];
    wave=ac.createPeriodicWave(new Float32Array(amps.length),new Float32Array(amps));
    noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.05),ac.sampleRate);
    const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*(1-i/nd.length);
  }
  if(ac.state==='suspended')ac.resume();
  return ac;
}
const voices=[];
function noteOn(midi,vel=.8){
  audio();const t=ac.currentTime,f=440*Math.pow(2,(midi-69)/12);
  const lp=ac.createBiquadFilter(),env=ac.createGain(),rel=ac.createGain(),mix=ac.createGain();
  lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(15000,f*(6+vel*10)),t);lp.frequency.setTargetAtTime(Math.max(f*1.6,300),t+.02,.35);
  const decay=Math.max(.9,4.2-(midi-36)*.055),lvl=.22*vel*(midi<48?1.2:1);
  env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(lvl,t+.005);env.gain.setTargetAtTime(lvl*.4,t+.006,.12);env.gain.setTargetAtTime(0,t+.3,decay/3);
  mix.gain.value=.5;
  const o1=ac.createOscillator(),o2=ac.createOscillator();
  [o1,o2].forEach(o=>{o.setPeriodicWave(wave);o.frequency.value=f;o.connect(mix)});o2.detune.value=4;
  mix.connect(lp).connect(env).connect(rel).connect(master);
  const nz=ac.createBufferSource(),bp=ac.createBiquadFilter(),ng=ac.createGain();
  nz.buffer=noiseBuf;bp.type='bandpass';bp.frequency.value=Math.min(8000,f*4);bp.Q.value=1.2;ng.gain.value=.07*vel;
  nz.connect(bp).connect(ng).connect(rel);nz.start(t);
  const end=t+decay*2.4;o1.start(t);o2.start(t);o1.stop(end);o2.stop(end);
  const v={midi,rel,o:[o1,o2],done:false};voices.push(v);
  o1.onended=()=>{const i=voices.indexOf(v);if(i>=0)voices.splice(i,1)};
  if(voices.length>44)noteOff(voices.find(x=>!x.done),.04);
  return v;
}
function noteOff(v,tau=.09){if(!v||v.done)return;v.done=true;const t=ac.currentTime;v.rel.gain.setTargetAtTime(0,t,tau);v.o.forEach(o=>{try{o.stop(t+tau*8)}catch(e){}})}

/* ================= Player input (keyboard + touch) ================= */
const held=new Map(), sustained=new Set(), lit=new Map(), autoLit=new Map();
let spaceDown=false,pedalLatch=false;
const pedalOn=()=>spaceDown||pedalLatch;
function press(src,midi){
  if(held.has(src))release(src);
  sustained.forEach(v=>{if(v.midi===midi){noteOff(v,.03);sustained.delete(v)}});
  const v=noteOn(midi);held.set(src,{midi,v});lit.set(midi,(lit.get(midi)||0)+1);
  if(rec)recOn(src,midi);
  onPlayerNote(midi);
}
function release(src){
  const h=held.get(src);if(!h)return;held.delete(src);
  const c=(lit.get(h.midi)||1)-1;c?lit.set(h.midi,c):lit.delete(h.midi);
  if(pedalOn())sustained.add(h.v);else noteOff(h.v);
  if(rec)recOff(src);
}
function updatePedal(){$('pedalBtn').setAttribute('aria-pressed',String(pedalOn()));if(!pedalOn()){sustained.forEach(v=>noteOff(v));sustained.clear()}}

/* ================= Recording ================= */
let rec=null;
function recOn(src,midi){if(!rec.start)rec.start=performance.now();const n={t:(performance.now()-rec.start)/1000,midi,dur:.25};rec.notes.push(n);rec.open.set(src,n)}
function recOff(src){const n=rec.open.get(src);if(n){n.dur=Math.max(.08,(performance.now()-rec.start)/1000-n.t);rec.open.delete(src)}}

/* ================= State / helpers ================= */
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
let W=0,H=0,mode='free',run=null,viewStart=7,viewCount=36,follow=false,manualPan=false;

function rebuildSongList(sel){
  const s=$('songSel');s.innerHTML='';
  const groups=[['easy','Fáceis (só melodia)'],['builtin','Com acompanhamento'],['mine','Suas músicas']];
  for(const[kind,label]of groups){
    const og=document.createElement('optgroup');og.label=label;
    SONGS.forEach((x,i)=>{if((kind==='mine')?(x.kind==='midi'||x.kind==='rec'):x.kind===kind){const o=document.createElement('option');o.value=i;o.textContent=x.name;og.append(o)}});
    if(og.children.length)s.append(og);
  }
  if(sel!=null)s.value=sel;
}
let melodyOnly=true;
try{if(localStorage.getItem('pc-hands')==='full')melodyOnly=false}catch(e){}
function notesOf(s){
  if(!s)return[];
  if(!melodyOnly)return s.notes;
  if(s.notes.some(n=>n.mel))return s.notes.filter(n=>n.mel);
  // MIDI / recordings: keep the highest note of each moment, then drop notes buried under a still-sounding higher one
  const top=[];for(const n of s.notes){const l=top[top.length-1];if(l&&n.t-l.t<.035){if(n.midi>l.midi)top[top.length-1]=n}else top.push(n)}
  return top.filter((n,i)=>!top.slice(Math.max(0,i-6),i).some(p=>p.t+p.dur*.8>n.t&&p.midi>n.midi+4));
}
const song=()=>SONGS[+$('songSel').value];

function groupsOf(notes){
  const g=[];for(const n of notes){const l=g[g.length-1];if(l&&n.t-l.t<.035)l.notes.push(n);else g.push({t:n.t,notes:[n]})}
  g.forEach(x=>{const ls=[...new Set(x.notes.slice().sort((a,b)=>a.midi-b.midi).map(n=>KEYS[n.midi].label))];x.text=ls.length>1?'('+ls.join('')+')':ls[0]});
  return g;
}
function sheetText(notes){const g=groupsOf(notes);return g.map((x,i)=>(i&&x.t-g[i-1].t>.9?'| ':'')+x.text).join(' ')}

function fitView(){
  const maxCount=Math.max(7,Math.min(NW,Math.floor(W/(W<640?17:22))));
  if(mode==='free'||!song()||maxCount>=NW){
    viewCount=maxCount;
    if(viewCount>=NW)viewStart=0;else viewStart=clampStart(WI2MIDI(0)===LO?KEYS[60].wi-Math.floor(viewCount/2)+2:0);
    follow=false;return;
  }
  const ns=notesOf(song());let lo=99,hi=-1;ns.forEach(n=>{const w=KEYS[n.midi].wi;lo=Math.min(lo,w);hi=Math.max(hi,w+(KEYS[n.midi].black?1:0))});
  const range=hi-lo+3;
  viewCount=Math.min(maxCount,Math.max(range,Math.min(15,maxCount)));
  follow=range>viewCount;
  viewStart=clampStart(Math.round((lo+hi)/2-viewCount/2+.5));
}
const clampStart=s=>Math.max(0,Math.min(NW-viewCount,s));

/* ================= Song run ================= */
function startRun(){
  const s=song();if(!s)return;
  audio();stopRun(false);
  const speed=+$('speedSel').value;
  const notes=notesOf(s).map(n=>({...n,judged:false,hit:false}));
  run={notes,groups:groupsOf(notes),speed,time:-2*speed,last:Math.max(...notes.map(n=>n.t+n.dur)),
    autoIdx:0,perfect:0,good:0,miss:0,wrong:0,combo:0,maxCombo:0,score:0,startedAt:performance.now(),sheetIdx:-1};
  manualPan=false;fitView();$('overlay').hidden=true;
  $('mainBtn').textContent='Parar';prev=performance.now();
  requestAnimationFrame(loop);
}
function stopRun(results){
  if(!run)return;const r=run;run=null;autoLit.clear();
  $('mainBtn').textContent=mode==='free'?'Gravar':'Começar';
  if(results)showResults(r);
  renderSheet();updateHud();
}
function showResults(r){
  const tot=r.notes.length;
  if(mode==='listen'){openOverlay('Fim da música','Agora tente no modo Aprender: a música espera você acertar cada nota.');return}
  if(mode==='learn'){
    const secs=Math.round((performance.now()-r.startedAt)/1000);
    openOverlay('Você tocou a música inteira!','No Desafio a música não espera. Quando estiver confortável, tente lá.',
      [['Notas certas',tot],['Notas erradas',r.wrong],['Tempo',`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`]]);
    return;
  }
  const acc=tot?Math.round((r.perfect+r.good*.6)/tot*100):0;
  const grade=acc>=95?'S':acc>=85?'A':acc>=70?'B':acc>=50?'C':'D';
  openOverlay(`Nota ${grade} · ${acc}% de precisão`,acc>=85?'Mandou bem. Que tal subir a velocidade?':'Diminua a velocidade ou treine no modo Aprender.',
    [['Pontos',r.score.toLocaleString('pt-BR')],['No tempo',r.perfect],['Quase',r.good],['Perdidas',r.miss],['Teclas extras',r.wrong],['Maior combo',r.maxCombo]]);
}
function openOverlay(title,text,stats,area){
  $('ovTitle').textContent=title;$('ovText').textContent=text;
  const st=$('ovStats');st.hidden=!stats;if(stats)st.innerHTML=stats.map(([a,b])=>`<span>${a}</span><span>${b}</span>`).join('');
  const ta=$('ovArea');ta.hidden=!area;if(area){ta.value=area;setTimeout(()=>ta.select(),0)}
  $('overlay').hidden=false;
}

function onPlayerNote(midi){
  if(!run||mode==='listen')return;
  const now=run.time;
  if(mode==='learn'){
    const n=run.notes.find(n=>!n.judged&&n.midi===midi&&n.t<=now+.35*run.speed);
    if(n){n.judged=n.hit=true}else run.wrong++;
  }else if(mode==='play'){
    let best=null,bd=1e9;
    for(const n of run.notes){if(n.judged||n.midi!==midi)continue;const d=Math.abs(n.t-now)/run.speed;if(d<bd){bd=d;best=n}if(n.t>now+run.speed)break}
    if(best&&bd<=.15){best.judged=best.hit=true;const p=bd<=.06;p?run.perfect++:run.good++;run.combo++;run.maxCombo=Math.max(run.maxCombo,run.combo);
      run.score+=(p?100:60)*(1+Math.min(3,Math.floor(run.combo/15)));}
    else run.wrong++;
  }
  updateHud();
}

let prev=0;
function loop(t){
  if(!run){draw();return}
  const dt=Math.max(0,Math.min(.1,(t-prev)/1000));prev=t;
  run.time+=dt*run.speed;
  const now=run.time;
  if(mode==='listen'){
    while(run.autoIdx<run.notes.length&&run.notes[run.autoIdx].t<=now){
      const n=run.notes[run.autoIdx++];const v=noteOn(n.midi,.7);n.judged=n.hit=true;
      autoLit.set(n.midi,(autoLit.get(n.midi)||0)+1);
      setTimeout(()=>{noteOff(v,.12);const c=(autoLit.get(n.midi)||1)-1;c?autoLit.set(n.midi,c):autoLit.delete(n.midi)},n.dur/run.speed*1000);
    }
  }else if(mode==='learn'){
    const first=run.notes.find(n=>!n.judged);
    if(first&&now>first.t)run.time=first.t;
  }else if(mode==='play'){
    for(const n of run.notes){if(n.t>now)break;if(!n.judged&&(now-n.t)/run.speed>.15){n.judged=true;run.miss++;run.combo=0}}
  }
  if(follow&&!manualPan){
    let lo=99,hi=-1;for(const n of run.notes){if(n.t<now-.2*run.speed)continue;if(n.t>now+2.5*run.speed)break;if(mode!=='listen'&&n.judged)continue;const w=KEYS[n.midi].wi;lo=Math.min(lo,w);hi=Math.max(hi,w)}
    if(hi>=0){const target=clampStart((lo+hi)/2-viewCount/2+.5);viewStart+=(target-viewStart)*Math.min(1,dt*4)}
  }
  renderSheet();
  if(mode==='play')updateHud();
  draw();
  const done=mode==='learn'?run.notes.every(n=>n.judged)&&now>=run.notes[run.notes.length-1].t:now>run.last+run.speed;
  if(done){stopRun(true);return}
  requestAnimationFrame(loop);
}

/* ================= Letter sheet strip ================= */
function renderSheet(){
  const el=$('sheet');
  if(!run){
    if(mode==='free'){el.textContent=rec?`Gravando… ${rec.notes.length} notas`:(style==='cont'?'Toque livre: Z até ; e Q até [ seguem a escala sem pular. Sustenidos na fileira logo acima.':'Toque livre: linha de baixo = graves, Z a M = médio, Q a U = agudos. Sustenidos na linha de cima de cada uma.');return}
    const s=song();el.textContent=s?sheetText(notesOf(s)):'';return;
  }
  const idx=mode==='listen'?run.groups.findIndex(g=>g.t>run.time-.01):run.groups.findIndex(g=>g.notes.some(n=>!n.judged));
  const i=idx<0?run.groups.length:idx;
  if(i===run.sheetIdx)return;run.sheetIdx=i;
  const from=Math.max(0,i-2);
  el.innerHTML=run.groups.slice(from,i+24).map((g,k)=>`<span class="g ${from+k<i?'past':from+k===i?'now':''}">${g.text.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span>`).join('');
}
function updateHud(){
  const h=$('hud');
  if(mode==='free'){h.innerHTML=rec?'<b>● Gravando</b>':'Piano livre';return}
  if(!run){h.textContent=({listen:'Ouça antes de tocar',learn:'A música espera você',play:'Valendo pontos'})[mode];return}
  if(mode==='play'){const tot=run.perfect+run.good+run.miss;const acc=tot?Math.round((run.perfect+run.good*.6)/tot*100):100;h.innerHTML=`<b>${run.score.toLocaleString('pt-BR')}</b> · combo ${run.combo} · ${acc}%`}
  else if(mode==='learn'){const d=run.notes.filter(n=>n.judged).length;h.innerHTML=`<b>${d}</b>/${run.notes.length} notas · ${run.wrong} erros`}
  else h.textContent='Ouvindo…';
}

/* ================= Rendering ================= */
let geo={};
function resize(){
  const r=stage.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
  W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const prevCount=viewCount;fitView();if(!run&&mode!=='free'&&prevCount===viewCount){}
  draw();
}
new ResizeObserver(resize).observe(stage);
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function keyX(m){const k=KEYS[m],kw=geo.kw;return k.black?(k.wi+1-viewStart)*kw-geo.bw/2:(k.wi-viewStart)*kw}
function draw(){
  const kh=Math.max(90,Math.min(190,H*.34)),kbTop=H-kh,kw=W/viewCount,bw=kw*.6,bh=kh*.62;
  geo={kh,kbTop,kw,bw,bh};
  ctx.fillStyle='#3b1520';ctx.fillRect(0,0,W,H);
  // octave guides (each C)
  ctx.font='600 10px "IBM Plex Mono", monospace';ctx.textAlign='left';ctx.textBaseline='top';
  for(let wi=0;wi<NW;wi+=7){const x=(wi-viewStart)*kw;if(x<-1||x>W)continue;ctx.fillStyle='rgba(244,234,213,.08)';ctx.fillRect(x,0,1,kbTop);ctx.fillStyle='rgba(244,234,213,.28)';ctx.fillText('Dó'+(LO/12-1+wi/7),x+4,6)}
  // falling notes
  if(run){
    const pps=kbTop/2.6,now=run.time;
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,kbTop);ctx.clip();
    for(const n of run.notes){
      const ahead=(n.t-now)/run.speed;if(ahead>2.8)break;
      const yb=kbTop-ahead*pps,h=Math.max(12,n.dur/run.speed*pps-3),top=yb-h;
      if(top>kbTop)continue;
      if(n.hit&&mode!=='listen')continue;
      const k=KEYS[n.midi],x=keyX(n.midi),w=k.black?bw:kw;
      if(x+w<0||x>W)continue;
      const missed=n.judged&&!n.hit;
      ctx.globalAlpha=missed?.3:1;
      ctx.fillStyle=k.black?'#ea8f86':'#e0b04a';rr(x+1.5,top,w-3,h,5);ctx.fill();
      if(w>=13&&h>=14){ctx.fillStyle='#2a0d14';ctx.font=`600 ${Math.min(14,w*.55)}px "IBM Plex Mono", monospace`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(k.label,x+w/2,yb-2)}
      ctx.globalAlpha=1;
    }
    ctx.restore();
    if(now<0){ctx.fillStyle='rgba(244,234,213,.85)';ctx.font='800 52px "Bricolage Grotesque", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(Math.ceil(-now/run.speed)),W/2,kbTop*.42)}
    const pr=Math.max(0,Math.min(1,now/run.last));ctx.fillStyle='rgba(244,234,213,.12)';ctx.fillRect(0,0,W,3);ctx.fillStyle='#e0b04a';ctx.fillRect(0,0,W*pr,3);
  }
  // expected keys (learn mode)
  const expected=new Set();
  if(run&&mode==='learn'){const f=run.notes.find(n=>!n.judged);if(f)run.notes.forEach(n=>{if(!n.judged&&n.t<=f.t+.35*run.speed)expected.add(n.midi)})}
  // hit line
  ctx.fillStyle='#e0b04a';ctx.fillRect(0,kbTop-2,W,2);
  // white keys
  ctx.textAlign='center';
  for(let wi=Math.floor(viewStart);wi<Math.min(NW,viewStart+viewCount+1);wi++){
    const m=WI2MIDI(wi),x=(wi-viewStart)*kw,on=lit.has(m),au=autoLit.has(m),ex=expected.has(m);
    ctx.fillStyle=on?'#e0b04a':au?'#f0d48e':'#f4ead5';ctx.fillRect(x+.5,kbTop,kw-1,kh);
    if(ex){ctx.fillStyle='rgba(224,176,74,.45)';ctx.fillRect(x+.5,kbTop+kh*.66,kw-1,kh*.34)}
    ctx.fillStyle='#2a0d14';ctx.textBaseline='bottom';ctx.font=`600 ${Math.max(9,Math.min(15,kw*.5))}px "IBM Plex Mono", monospace`;
    ctx.fillText(KEYS[m].label,x+kw/2,H-6);
    if(KEYS[m].alt&&kw>=18){ctx.fillStyle='rgba(42,13,20,.45)';ctx.font=`600 ${Math.max(8,Math.min(11,kw*.36))}px "IBM Plex Mono", monospace`;ctx.fillText(KEYS[m].alt,x+kw/2,H-8-Math.max(9,Math.min(15,kw*.5)))}
    if(STEPS[wi%7]===0&&kw>=16){ctx.fillStyle='rgba(42,13,20,.55)';ctx.font=`600 ${Math.min(10,kw*.36)}px "IBM Plex Mono", monospace`;ctx.fillText((m===60?'●':'')+'Dó'+(m/12-1),x+kw/2,H-8-Math.min(15,kw*.5))}
  }
  // black keys
  for(let wi=Math.floor(viewStart)-1;wi<Math.min(NW,viewStart+viewCount+1);wi++){
    if(wi<0)continue;const m=WI2MIDI(wi)+1;const k=KEYS[m];if(!k||!k.black)continue;
    const x=(wi+1-viewStart)*kw-bw/2,on=lit.has(m),au=autoLit.has(m),ex=expected.has(m);
    ctx.fillStyle=on?'#e0b04a':au?'#b98a33':'#1c080d';rr(x,kbTop,bw,bh,[0,0,4,4]);ctx.fill();
    if(ex){ctx.fillStyle='rgba(234,143,134,.75)';rr(x+2,kbTop+bh*.6,bw-4,bh*.36,3);ctx.fill()}
    if(bw>=10){ctx.fillStyle=on?'#2a0d14':'#c9b9a0';ctx.font=`600 ${Math.min(12,bw*.6)}px "IBM Plex Mono", monospace`;ctx.textBaseline='bottom';ctx.fillText(k.label,x+bw/2,kbTop+bh-4)}
  }
}
function keyAt(x,y){
  const g=geo;if(y<g.kbTop)return null;
  const wf=x/g.kw+viewStart;
  if(y<g.kbTop+g.bh){for(const wi of [Math.floor(wf),Math.floor(wf)-1]){if(wi<0||wi>=NW)continue;const m=WI2MIDI(wi)+1,k=KEYS[m];if(!k||!k.black)continue;const bx=(wi+1-viewStart)*g.kw-g.bw/2;if(x>=bx&&x<=bx+g.bw)return m}}
  const wi=Math.floor(wf);return wi>=0&&wi<NW?WI2MIDI(wi):null;
}
let idleRaf=0;
function redrawSoon(){if(run)return;cancelAnimationFrame(idleRaf);idleRaf=requestAnimationFrame(draw)}

/* ================= Events ================= */
addEventListener('keydown',e=>{
  if(e.target!==kbIn&&e.target.closest&&e.target.closest('select,input,textarea'))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat){spaceDown=true;updatePedal()}return}
  if(e.code==='Escape'){if(run)stopRun(false);$('overlay').hidden=true;return}
  const m=CODE2MIDI[e.code];if(m===undefined)return;
  e.preventDefault();if(e.repeat)return;
  press('k:'+e.code,m);redrawSoon();
});
addEventListener('keyup',e=>{
  if(e.code==='Space'){e.preventDefault();spaceDown=false;updatePedal();return}
  if(CODE2MIDI[e.code]!==undefined){release('k:'+e.code);redrawSoon()}
});
addEventListener('blur',()=>{[...held.keys()].forEach(release);spaceDown=false;updatePedal();redrawSoon()});
/* ---- Phone's native keyboard: a hidden text field; each typed character becomes a note ---- */
const kbIn=$('kbIn'),kbBtn=$('kbBtn');
const CHAR2MIDI={};
function buildChars(){for(const k in CHAR2MIDI)delete CHAR2MIDI[k];for(const[code,m]of Object.entries(CODE2MIDI)){const c=labelFor(code).toLowerCase();if(!(c in CHAR2MIDI))CHAR2MIDI[c]=m}}
buildChars();
let softSeq=0;
function playChar(ch){
  const m=CHAR2MIDI[ch.toLowerCase()];
  if(m===undefined)return;
  audio();const src='s:'+(softSeq++);press(src,m);redrawSoon();
  setTimeout(()=>{release(src);redrawSoon()},380);
}
kbIn.addEventListener('input',e=>{
  const it=e.inputType||'';
  let txt=it.startsWith('delete')?'':(e.data!=null?e.data:kbIn.value);
  if(it==='insertCompositionText'||it==='insertReplacementText')txt=txt.slice(-1);
  for(const ch of txt)playChar(ch);
  kbIn.value='';
});
kbIn.addEventListener('compositionend',()=>{kbIn.value=''});
kbIn.addEventListener('focus',()=>{kbBtn.setAttribute('aria-pressed','true');kbBtn.querySelector('.kb-lbl').textContent='Fechar teclado';document.body.classList.add('kb-open')});
kbIn.addEventListener('blur',()=>{kbBtn.setAttribute('aria-pressed','false');kbBtn.querySelector('.kb-lbl').textContent='Teclado';document.body.classList.remove('kb-open')});
$('setBtn').addEventListener('click',()=>{const on=document.body.classList.toggle('show-settings');$('setBtn').setAttribute('aria-pressed',String(on))});
kbBtn.addEventListener('pointerdown',e=>{if(document.activeElement===kbIn)e.preventDefault()});
kbBtn.addEventListener('click',()=>{if(document.activeElement===kbIn){kbIn.blur()}else{audio();kbIn.focus({preventScroll:true})}});
// keep the phone keyboard open while tapping the on-screen piano
cv.addEventListener('touchstart',e=>{if(document.activeElement===kbIn)e.preventDefault()},{passive:false});
cv.addEventListener('mousedown',e=>{if(document.activeElement===kbIn)e.preventDefault()});
// shrink the app to the visible area when the keyboard covers the screen
if(window.visualViewport){const vv=window.visualViewport;const fit=()=>{const full=window.innerHeight;document.documentElement.style.setProperty('--app-h',vv.height<full-40?(vv.height-12)+'px':'100%');window.scrollTo(0,0)};vv.addEventListener('resize',fit)}

function local(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
cv.addEventListener('pointerdown',e=>{const[x,y]=local(e);const m=keyAt(x,y);if(m==null)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}press('p:'+e.pointerId,m);redrawSoon()});
cv.addEventListener('pointermove',e=>{const src='p:'+e.pointerId,h=held.get(src);if(!h)return;const[x,y]=local(e);const m=keyAt(x,y);if(m!=null&&m!==h.midi){press(src,m);redrawSoon()}});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,e=>{release('p:'+e.pointerId);redrawSoon()}));

document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{
  if(rec)finishRecording();stopRun(false);mode=b.dataset.mode;
  document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  $('mainBtn').textContent=mode==='free'?'Gravar':'Começar';$('mainBtn').className='btn primary';
  $('overlay').hidden=true;fitView();renderSheet();updateHud();draw();
}));
$('mainBtn').addEventListener('click',()=>{
  audio();document.body.classList.remove('show-settings');$('setBtn').setAttribute('aria-pressed','false');
  if(mode==='free'){if(rec)finishRecording();else{rec={notes:[],open:new Map(),start:0};$('mainBtn').textContent='Parar gravação';$('mainBtn').className='btn rec';renderSheet();updateHud()}return}
  if(run)stopRun(false);else startRun();
});
function finishRecording(){
  const r=rec;rec=null;$('mainBtn').textContent='Gravar';$('mainBtn').className='btn primary';
  if(r.notes.length){
    recCount++;const raw=r.notes.sort((a,b)=>a.t-b.t);const s={name:`Minha gravação ${recCount}`,kind:'rec',raw,notes:fitSong(raw)};
    SONGS.push(s);saveRecordings();rebuildSongList(SONGS.length-1);
    openOverlay(`${s.name} salva`,`${s.notes.length} notas. Escolha Ouvir, Aprender ou Desafio para tocar por cima dela.`,null,sheetText(s.notes));
  }
  renderSheet();updateHud();
}
$('songSel').addEventListener('change',()=>{stopRun(false);fitView();renderSheet();draw()});
$('speedSel').addEventListener('change',()=>{if(run)startRun()});
$('pedalBtn').addEventListener('click',()=>{pedalLatch=!pedalLatch;updatePedal()});
$('panL').addEventListener('click',()=>{manualPan=true;viewStart=clampStart(Math.round(viewStart)-7);draw()});
$('panR').addEventListener('click',()=>{manualPan=true;viewStart=clampStart(Math.round(viewStart)+7);draw()});
$('ovBtn').addEventListener('click',()=>{$('overlay').hidden=true});
$('copyBtn').addEventListener('click',()=>{
  const s=song();if(!s)return;const txt=sheetText(notesOf(s));
  const fallback=()=>openOverlay(`Letras de ${s.name}`,'Selecione e copie o texto abaixo.',null,txt);
  try{navigator.clipboard.writeText(txt).then(()=>{$('copyBtn').textContent='Copiado';setTimeout(()=>$('copyBtn').textContent='Copiar letras',1400)},fallback)}catch(e){fallback()}
});
$('midiIn').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const raw=parseMidi(await f.arrayBuffer()),notes=fitSong(raw);
    SONGS.push({name:f.name.replace(/\.midi?$/i,''),kind:'midi',raw,notes});rebuildSongList(SONGS.length-1);
    stopRun(false);fitView();renderSheet();draw();
    openOverlay('MIDI carregado',`${notes.length} notas, com acordes e as duas mãos. Notas fora do teclado foram trazidas para a oitava mais próxima.`);
  }catch(err){openOverlay('Não consegui ler o arquivo',err.message+' Tente outro arquivo .mid.')}
  e.target.value='';
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&run)stopRun(false)});

$('handSel').value=melodyOnly?'mel':'full';
$('handSel').addEventListener('change',e=>{melodyOnly=e.target.value==='mel';try{localStorage.setItem('pc-hands',e.target.value)}catch(_){}stopRun(false);fitView();renderSheet();draw()});
function applyLayout(l){setLayout(l);buildChars();$('layoutSel').value=l;try{localStorage.setItem('pc-layout',l)}catch(e){}renderSheet();draw()}
$('layoutSel').addEventListener('change',e=>applyLayout(e.target.value));
function updateHint(){$('hintKeys').innerHTML=style==='cont'?'<kbd>Z</kbd>…<kbd>;</kbd> de Dó4 a Mi5 · <kbd>Q</kbd>…<kbd>[</kbd> de Dó5 a Sol6':'<kbd>,</kbd> <kbd>.</kbd> <kbd>;</kbd> <kbd>O</kbd> <kbd>P</kbd> grave · <kbd>Z</kbd>…<kbd>M</kbd> médio · <kbd>Q</kbd>…<kbd>U</kbd> agudo'}
function applyStyle(st){
  [...held.keys()].forEach(release);stopRun(false);
  style=st;buildKeys();buildChars();refitSongs();$('styleSel').value=st;
  try{localStorage.setItem('pc-style',st)}catch(e){}
  manualPan=false;fitView();renderSheet();updateHint();draw();
}
$('styleSel').value=style;updateHint();
$('styleSel').addEventListener('change',e=>applyStyle(e.target.value));
try{const l=localStorage.getItem('pc-layout');if(l)applyLayout(l)}catch(e){}
try{navigator.keyboard&&navigator.keyboard.getLayoutMap().then(map=>{const c=map.get('Semicolon');if(c==='ç')applyLayout('abnt2');else if(c===';')applyLayout('us')}).catch(()=>{})}catch(e){}
rebuildSongList(0);renderSheet();updateHud();resize();
})();
