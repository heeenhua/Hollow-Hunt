// ===== RENDER: tiles, people, creatures =====
const SOLID=new Set('#~RrqWwXTBKbHMPFL'.split(''));
function drawTile(m,ch,tx,ty,sx,sy){
  const h=((tx*73856093)^(ty*19349663))>>>0,r=(h%97)/97,t=S.t;
  const fill=c=>{g.fillStyle=c;g.fillRect(sx,sy,TS,TS);};
  const rc=(c,x,y,w,hh)=>{g.fillStyle=c;g.fillRect(sx+x,sy+y,w,hh);};
  const grass=()=>{fill('#5a9a46');rc('#6aae54',(h>>3)%26,(h>>6)%26,2,4);rc('#4c8a3c',(h>>9)%26,(h>>4)%26,2,3);};
  const floor=()=>{fill('#caa56e');rc('#b8935c',0,TS-1,TS,1);if(r<.3)rc('#b8935c',(h>>3)%28,0,1,TS);};
  switch(ch){
    case '.':fill('#b89a68');if(r<.45){rc('#a88a5a',(h>>3)%24,(h>>7)%24,3,2);rc('#c8aa78',(h>>5)%26,(h>>9)%26,2,2);}break;
    case 'g':grass();break;
    case 'f':grass();rc(['#f0e060','#f08ca0','#fff'][h%3],(h>>3)%24+2,(h>>5)%24+2,4,4);rc('#e8e8a0',(h>>7)%24+2,(h>>9)%24+4,3,3);break;
    case 'G':fill('#3f8a3c');g.fillStyle='#2f7030';for(let i=0;i<4;i++){const x=(i*9+(h>>i))%26,y=(i*7+(h>>(i+2)))%20;g.fillRect(sx+x,sy+y+4,2,10);g.fillRect(sx+x+3,sy+y+7,2,8);}
      rc('#58a850',(h>>2)%24,(h>>5)%20,2,6);break;
    case 'm':fill('#4d7550');rc('#3f6a68',(h>>2)%18,(h>>5)%18,10,5);rc('#5e8a5a',(h>>4)%26,(h>>8)%26,2,6);rc('#3c5f3e',(h>>6)%26,(h>>3)%26,2,5);break;
    case '=':fill('#9a7648');for(let i=0;i<4;i++)rc(i%2?'#8a6a3e':'#a8834f',0,i*8,TS,7);break;
    case '~':{fill(m.id==='route2'?'#27483f':'#2d6aa6');g.fillStyle='rgba(255,255,255,.16)';const o=Math.sin(t*2+tx*.7+ty)*4;g.fillRect(sx+6+o,sy+10,12,2);g.fillRect(sx+14-o,sy+22,10,2);break;}
    case '#':grass();rc('#3a2a1a',13,19,6,11);ell(sx+16,sy+13,14,13,'#2c6632');ell(sx+12,sy+9,8,7,'#3d8442');break;
    case 'R':case 'r':case 'q':{fill(ch==='R'?'#9a4a3a':ch==='r'?'#3a5a8a':'#4a7a4a');g.fillStyle='rgba(0,0,0,.22)';for(let i=0;i<4;i++)g.fillRect(sx,sy+i*8+7,TS,2);if(r<.5)rc('rgba(255,255,255,.1)',(h>>3)%24,(h>>5)%24,6,3);break;}
    case 'W':fill('#d8cba6');rc('#b8a888',0,TS-3,TS,3);rc('#b8a888',TS-2,0,2,TS);break;
    case 'w':fill('#d8cba6');rc('#5a4a38',6,5,20,20);rc('#6a9ac0',8,7,16,16);rc('#bfe4ff',10,9,5,5);rc('#5a4a38',15,7,2,16);break;
    case 'D':if(m.interior){floor();rc('#8a3a3a',2,8,28,16);rc('#c8a050',2,8,28,2);}else{fill('#d8cba6');rc('#5a3a22',5,2,22,30);rc('#7a5232',7,4,18,28);rc('#e0c060',21,18,3,3);}break;
    case ',':floor();break;
    case 'C':fill('#8a2f3a');rc('#c8a050',0,0,2,TS);rc('#c8a050',TS-2,0,2,TS);break;
    case 'X':fill('#5f5068');g.fillStyle='rgba(0,0,0,.25)';g.fillRect(sx,sy+15,TS,2);g.fillRect(sx+(ty%2?8:20),sy,2,15);g.fillRect(sx+(ty%2?20:8),sy+17,2,15);break;
    case 'T':floor();rc('#7a5232',0,6,TS,20);rc('#946a42',0,6,TS,6);break;
    case 'K':floor();rc('#6a4528',0,6,TS,22);rc('#b88a58',0,6,TS,8);break;
    case 'B':floor();rc('#7a5232',2,4,28,26);rc('#e8e0d0',4,6,24,8);rc('#8a3a5a',4,14,24,14);break;
    case 'b':floor();rc('#4a3220',1,0,30,32);for(let i=0;i<3;i++){for(let j=0;j<5;j++)rc(['#a84a4a','#4a6aa8','#5a9a5a','#c8a850'][(i+j+tx)%4],3+j*5,3+i*10,4,8);rc('#2a1a10',1,11+i*10,30,2);}break;
    case 'H':floor();rc('#8a8a98',2,6,28,22);rc('#aaaab8',2,6,28,5);{const a=.5+.5*Math.sin(t*3);ell(sx+16,sy+19,6,6,`rgba(255,120,160,${.5+a*.5})`);}break;
    case 'P':floor();ell(sx+16,sy+16,12,12,'#8a8a98');ell(sx+14,sy+14,7,7,'#a8a8b8');break;
    case 'F':grass();rc('#8a6a3e',0,12,TS,4);rc('#8a6a3e',0,20,TS,4);rc('#6a4a2a',4,8,4,20);rc('#6a4a2a',24,8,4,20);break;
    case 'L':fill('#b89a68');rc('#3a3a44',14,8,4,22);ell(sx+16,sy+8,9,9,'rgba(255,200,100,.25)');ell(sx+16,sy+8,4,4,'#ffd880');break;
    case 'M':drawMirror(m,sx,sy);break;
    default:fill('#222');
  }
}
function drawMirror(m,sx,sy){
  g.fillStyle='#5f5068';g.fillRect(sx,sy,TS,TS);
  g.fillStyle='#c8a050';g.fillRect(sx+2,sy+1,28,30);
  g.fillStyle='#8aa4b8';g.fillRect(sx+4,sy+3,24,26);
  const st=stage();
  g.fillStyle='rgba(20,20,30,.85)';
  // reflection: human early, something else later
  const ox=Math.sin(S.t*1.7)*1.5,hunch=st>=4?3:0;
  g.beginPath();g.arc(sx+16+ox,sy+13+hunch,5,0,7);g.fill();
  g.fillRect(sx+11+ox,sy+18+hunch,10,11-hunch);
  if(st>=2){tri(sx+11+ox,sy+10+hunch,sx+9+ox,sy+3,sx+14+ox,sy+8+hunch,'rgba(20,20,30,.85)');tri(sx+21+ox,sy+10+hunch,sx+23+ox,sy+3,sx+18+ox,sy+8+hunch,'rgba(20,20,30,.85)');}
  if(st>=1){const b=(Math.floor(S.t*.9)%4===0);g.fillStyle=st>=3?'#ffe070':'#d8d0c0';
    if(!b||st>=3){g.fillRect(sx+13+ox,sy+12+hunch,2,2);g.fillRect(sx+17+ox,sy+12+hunch,2,2);}}
  if(st>=3){g.fillStyle='rgba(20,20,30,.9)';for(let i=0;i<3;i++)g.fillRect(sx+7+i*2+ox,sy+24,1,5);}
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(sx+5,sy+4,5,24);
}

// humans (player and NPCs)
function human(sx,sy,dir,o,walking){
  const bob=walking?Math.sin(S.t*16)*1.5:0,f=walking?Math.sin(S.t*16)*3:0;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(sx+16,sy+29,10,4,0,0,7);g.fill();
  g.fillStyle=o.leg||'#3a3040';g.fillRect(sx+10,sy+22+bob,5,8+f*.3);g.fillRect(sx+17,sy+22+bob,5,8-f*.3);
  g.fillStyle=o.col||'#6a7ac0';g.fillRect(sx+8,sy+12+bob,16,12);
  g.fillStyle=o.col2||'rgba(0,0,0,.18)';g.fillRect(sx+8,sy+19+bob,16,2);
  g.fillStyle=o.glove||'#f0d0b0';g.fillRect(sx+5,sy+14+bob,4,8);g.fillRect(sx+23,sy+14+bob,4,8);
  g.fillStyle='#f0d0b0';g.beginPath();g.arc(sx+16,sy+9+bob,7,0,7);g.fill();
  g.fillStyle=o.hair||'#3a2a20';g.beginPath();g.arc(sx+16,sy+7+bob,7.5,Math.PI,0);g.fill();
  if(dir===0){g.fillRect(sx+9,sy+6+bob,14,6);}
  if(dir===2){g.fillStyle='#222';g.fillRect(sx+12,sy+9+bob,2,2);g.fillRect(sx+18,sy+9+bob,2,2);}
  if(dir===1){g.fillStyle='#222';g.fillRect(sx+19,sy+9+bob,2,2);}
  if(dir===3){g.fillStyle='#222';g.fillRect(sx+11,sy+9+bob,2,2);}
  if(o.eyes&&dir!==0){g.fillStyle=o.eyes;if(dir===2){g.fillRect(sx+12,sy+9+bob,2,2);g.fillRect(sx+18,sy+9+bob,2,2);}else g.fillRect(sx+(dir===1?19:11),sy+9+bob,2,2);}
  if(o.mask&&dir!==0){g.fillStyle='#ece6d6';g.beginPath();g.arc(sx+16,sy+10+bob,6,0,Math.PI);g.fill();g.fillRect(sx+10,sy+8+bob,12,3);g.fillStyle='#222';g.fillRect(sx+12,sy+9+bob,2,2);g.fillRect(sx+18,sy+9+bob,2,2);}
  if(o.hat){g.fillStyle=o.hat;g.fillRect(sx+8,sy+1+bob,16,4);g.fillRect(sx+10,sy-2+bob,12,4);}
}
function playerShadow(sx,sy){
  const st=stage(),k=1+Math.min(st,5)*.14;
  g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(sx+16,sy+29,10,4,0,0,7);g.fill();
  if(st<1)return;
  g.fillStyle='rgba(0,0,0,.26)';
  const hx=sx+16+20*k,hy=sy+30+8*k;
  g.beginPath();g.moveTo(sx+10,sy+29);g.lineTo(sx+22,sy+29);g.lineTo(hx+4,hy);g.lineTo(hx-4,hy);g.fill();
  g.beginPath();g.arc(hx,hy,6*k,0,7);g.fill();
  if(st>=2){tri(hx-4*k,hy-3*k,hx-8*k,hy-13*k,hx-1*k,hy-5*k,g.fillStyle);tri(hx+4*k,hy-3*k,hx+8*k,hy-13*k,hx+1*k,hy-5*k,g.fillStyle);}
  if(st>=3){for(let i=0;i<3;i++){g.fillRect(sx+22+i*3,sy+29,1.5,8*k);}}
}

// creatures
function drawMon(id,cx,cy,s,o={}){
  const d=SP[id].look,t=S.t;
  g.save();g.translate(cx+(o.shake||0),cy+Math.sin(t*3+cx)*(o.fear?.6:2));
  if(o.flip)g.scale(-1,1);
  if(o.fear)g.rotate(Math.sin(t*28)*.012);
  if(o.dead){g.globalAlpha=Math.max(0,1-o.dead);g.translate(0,o.dead*40);}
  if(o.shrink)g.scale(1-o.shrink*.8,1-o.shrink*.8);
  const c1=d.c1,c2=d.c2;
  ell(0,s*.44,s*.5,s*.09,'rgba(0,0,0,.25)');
  const eye=(x,y,r)=>{ell(x,y,r,r,'#fff');ell(x+r*.25,y+(o.fear?r*.35:0),r*.55,r*.55,'#1a1226');if(o.fear)ell(x-r*.4,y+r*1.2,r*.18,r*.3,'#9fe0ff');};
  switch(d.shape){
    case 'quad':
      ell(-.25*s,.3*s,.07*s,.14*s,c1);ell(.2*s,.3*s,.07*s,.14*s,c1);
      ell(-.45*s,-.08*s,.16*s,.1*s,c1,-.5);
      ell(0,0,.45*s,.28*s,c1);ell(.05*s,.1*s,.3*s,.14*s,c2);
      ell(.38*s,-.17*s,.22*s,.2*s,c1);ell(.5*s,-.1*s,.1*s,.08*s,c2);
      tri(.28*s,-.3*s,.3*s,-.5*s,.4*s,-.34*s,c1);tri(.44*s,-.32*s,.5*s,-.5*s,.54*s,-.28*s,c1);
      eye(.44*s,-.2*s,.045*s);
      if(d.feat==='flame')flame(-.55*s,-.12*s,s*.2);
      if(d.feat==='bolt')bolt(-.1*s,-.3*s,s*.22);
      if(d.feat==='leaf'){leaf(.1*s,-.3*s,s*.2,-.4);leaf(-.1*s,-.3*s,s*.18,.3);}
      if(d.feat==='thorn'){for(let i=0;i<4;i++)tri(-.3*s+i*.16*s,-.25*s,-.26*s+i*.16*s,-.42*s,-.22*s+i*.16*s,-.25*s,'#e8e0a0');}
      if(d.feat==='horn'){tri(.34*s,-.34*s,.28*s,-.62*s,.42*s,-.36*s,c2);tri(.46*s,-.34*s,.56*s,-.6*s,.52*s,-.3*s,c2);}
      break;
    case 'blob':
      ell(0,0,.4*s,.36*s,c1);ell(0,.1*s,.28*s,.2*s,c2);
      ell(-.4*s,.05*s,.08*s,.12*s,c1);ell(.4*s,.05*s,.08*s,.12*s,c1);
      eye(-.13*s,-.08*s,.06*s);eye(.13*s,-.08*s,.06*s);
      if(d.feat==='drop')tri(-.08*s,-.34*s,0,-.6*s,.08*s,-.34*s,'#9fd8ff');
      if(d.feat==='leaf'){leaf(-.1*s,-.34*s,s*.22,-.5);leaf(.1*s,-.34*s,s*.2,.5);}
      break;
    case 'bird':
      ell(-.05*s,.05*s,.3*s,.26*s,c1);ell(-.1*s,.1*s,.18*s,.14*s,c2);
      ell(-.12*s,0,.2*s,.12*s,c2,-.4);
      ell(.26*s,-.2*s,.15*s,.15*s,c1);tri(.36*s,-.24*s,.56*s,-.17*s,.37*s,-.1*s,'#f0a840');
      eye(.3*s,-.24*s,.04*s);
      g.fillStyle='#d09030';g.fillRect(-.1*s,.28*s,.03*s,.14*s);g.fillRect(.06*s,.28*s,.03*s,.14*s);
      tri(-.3*s,0,-.55*s,-.1*s,-.32*s,.12*s,c1);
      break;
    case 'frog':
      ell(0,.05*s,.42*s,.3*s,c1);ell(0,.14*s,.3*s,.18*s,c2);
      ell(-.38*s,.2*s,.12*s,.16*s,c1);ell(.38*s,.2*s,.12*s,.16*s,c1);
      ell(-.2*s,-.24*s,.12*s,.1*s,c1);ell(.2*s,-.24*s,.12*s,.1*s,c1);
      eye(-.2*s,-.26*s,.06*s);eye(.2*s,-.26*s,.06*s);
      g.strokeStyle='#1a1226';g.lineWidth=2;g.beginPath();g.arc(0,0,.18*s,.2,Math.PI-.2);g.stroke();
      break;
    case 'moth':
      ell(-.3*s,-.1*s,.3*s,.36*s,c1,-.4);ell(.3*s,-.1*s,.3*s,.36*s,c1,.4);
      ell(-.3*s,-.1*s,.14*s,.18*s,c2,-.4);ell(.3*s,-.1*s,.14*s,.18*s,c2,.4);
      ell(0,.05*s,.1*s,.28*s,c1);eye(-.04*s,-.12*s,.035*s);eye(.04*s,-.12*s,.035*s);
      g.strokeStyle=c2;g.lineWidth=2;g.beginPath();g.moveTo(-.04*s,-.25*s);g.lineTo(-.12*s,-.42*s);g.moveTo(.04*s,-.25*s);g.lineTo(.12*s,-.42*s);g.stroke();
      break;
    case 'serpent':
      for(let i=6;i>=0;i--){const x=-.45*s+i*.14*s,y=Math.sin(i*.9+t*3)*.12*s+.1*s;ell(x,y,.12*s+(i===6?.04*s:0),.12*s+(i===6?.04*s:0),i%2?c1:c2);}
      eye(.44*s,.02*s,.04*s);
      if(d.feat==='leaf')leaf(.35*s,-.1*s,s*.18,-.2);
      break;
  }
  g.restore();
}
function flame(x,y,s){const f=Math.sin(S.t*12)*.15;tri(x-s*.5,y,x,y-s*(1.2+f),x+s*.5,y,'#f08020');tri(x-s*.28,y,x,y-s*(.8+f),x+s*.28,y,'#ffe060');}
function bolt(x,y,s){g.fillStyle='#fff070';g.beginPath();g.moveTo(x,y);g.lineTo(x+s*.4,y-s*.3);g.lineTo(x+s*.1,y-s*.3);g.lineTo(x+s*.5,y-s*.9);g.lineTo(x-s*.1,y-s*.4);g.lineTo(x+s*.15,y-s*.4);g.closePath();g.fill();}
function leaf(x,y,s,rot){g.save();g.translate(x,y);g.rotate(rot);ell(0,-s*.5,s*.22,s*.5,'#78c850');g.restore();}

// world entities
function drawEnt(e,sx,sy){
  if(e.vis&&!e.vis())return;
  switch(e.kind){
    case 'sign':ell(sx+16,sy+28,9,3,'rgba(0,0,0,.25)');g.fillStyle='#6a4a2a';g.fillRect(sx+14,sy+16,4,14);g.fillStyle='#b8905a';g.fillRect(sx+5,sy+5,22,14);g.fillStyle='#4a3220';g.fillRect(sx+8,sy+9,16,2);g.fillRect(sx+8,sy+13,12,2);break;
    case 'item':{const b=Math.sin(S.t*4)*1.5;ell(sx+16,sy+27,8,3,'rgba(0,0,0,.3)');g.fillStyle='#caa050';g.fillRect(sx+8,sy+10+b,16,15);g.strokeStyle='#6a4a20';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(sx+11+i*4,sy+10+b);g.lineTo(sx+11+i*4,sy+25+b);g.stroke();}break;}
    case 'mon':drawMon(e.sp,sx+16,sy+14,e.size||34,{flip:e.flip,fear:e.fear});break;
    case 'obj':e.draw(sx,sy,e);break;
    default:human(sx,sy,e.dir,e,e.mv);
  }
  if(e.excl){g.fillStyle='#fff';g.fillRect(sx+14,sy-14,4,9);g.fillRect(sx+14,sy-3,4,3);}
}
