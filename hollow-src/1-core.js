// ===== CORE: setup, input, audio, utils =====
const cv=document.getElementById('c'),g=cv.getContext('2d');
const W=800,H=576,TS=32;
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),PK=a=>a[Math.floor(Math.random()*a.length)];
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const FONT=(s,b,i)=>`${i?'italic ':''}${b?'bold ':''}${s}px "Courier New",monospace`;
const DX=[0,1,0,-1],DY=[-1,0,1,0];
function srng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

let G=null,F={};
const S={mode:'title',t:0,fade:0,fadeTo:0,toast:null,whisper:null,menu:null,b:null,wc:0,shakeT:0,flashA:0,sel:0};
const P={x:0,y:0,dir:2,ox:0,oy:0,mv:false};
let M=null,gen=null,cur=null;
const MAPS={};
const stage=()=>G?((F.starter?1:0)+(F.slept?1:0)+(F.maren?1:0)+(F.heron?1:0)+(F.kesTower?1:0)):0;

// ----- input -----
const held={},hit=new Set();
const kn=e=>e.key.length===1?e.key.toLowerCase():e.key;
addEventListener('keydown',e=>{
  const k=kn(e);audio();
  if(cur&&cur.t==='name'){nameKey(e,k);e.preventDefault();return;}
  if(!held[k])hit.add(k);held[k]=true;
  if(k.startsWith('Arrow')||k===' ')e.preventDefault();
});
addEventListener('keyup',e=>{held[kn(e)]=false;});
const isA=()=>hit.has('z')||hit.has('Enter')||hit.has(' ');
const isB=()=>hit.has('x')||hit.has('Escape')||hit.has('Backspace');
const isU=()=>hit.has('ArrowUp')||hit.has('w'),isD=()=>hit.has('ArrowDown')||hit.has('s');
const isL=()=>hit.has('ArrowLeft')||hit.has('a'),isRt=()=>hit.has('ArrowRight')||hit.has('d');
function heldDir(){
  if(held.ArrowUp||held.w)return 0;if(held.ArrowDown||held.s)return 2;
  if(held.ArrowLeft||held.a)return 3;if(held.ArrowRight||held.d)return 1;return -1;
}

// ----- audio -----
let AC=null,drone=null;
function audio(){
  if(AC)return;
  try{
    AC=new(window.AudioContext||window.webkitAudioContext)();
    const o1=AC.createOscillator(),o2=AC.createOscillator(),gn=AC.createGain();
    o1.frequency.value=55;o2.frequency.value=55.7;gn.gain.value=.02;
    o1.connect(gn);o2.connect(gn);gn.connect(AC.destination);o1.start();o2.start();drone={o1,o2,gn};
  }catch(e){}
}
function sfx(f,d=.06,type='square',v=.03){
  if(!AC)return;
  try{const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.value=f;gn.gain.value=v;
    gn.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(gn);gn.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}
}
function droneTick(){if(drone){const st=stage();drone.o2.frequency.value=55.7+st*.9;drone.gn.gain.value=.02+st*.006;}}

// ----- drawing helpers -----
function box(x,y,w,h,fill,stroke){
  g.fillStyle=fill||'rgba(12,9,20,.93)';g.fillRect(x,y,w,h);
  g.strokeStyle=stroke||'#e8e0c8';g.lineWidth=3;g.strokeRect(x+1.5,y+1.5,w-3,h-3);
  g.strokeStyle='#5a5070';g.lineWidth=1;g.strokeRect(x+6.5,y+6.5,w-13,h-13);
}
function text(s,x,y,size=18,col='#f0ead8',align='left',bold=false,ital=false){
  g.font=FONT(size,bold,ital);g.fillStyle=col;g.textAlign=align;g.textBaseline='top';g.fillText(s,x,y);
}
function wrap(txt,w,font){
  g.font=font;const words=txt.split(' '),out=[];let l='';
  for(const wd of words){const t=l?l+' '+wd:wd;if(g.measureText(t).width>w&&l){out.push(l);l=wd;}else l=t;}
  if(l)out.push(l);return out;
}
function ell(x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,7);g.fill();}
function tri(a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.closePath();g.fill();}

// ----- script command constructors -----
const say=(...lines)=>({t:'say',lines});
const ask=(q,opts)=>({t:'choice',q,opts});
const wait=ms=>({t:'wait',ms});
const fade=(a,ms=400)=>({t:'fade',a,ms});
const cut=(...lines)=>({t:'cut',lines});
const shake=ms=>({t:'shake',ms});
const bm=text=>({t:'bmsg',text});
const bwait=ms=>({t:'bwait',ms});
function note(k,tx){
  if(!G||G.notes.some(n=>n.k===k))return;
  G.notes.push({k,t:tx});S.toast={text:'Journal updated',t:2.4};
}
