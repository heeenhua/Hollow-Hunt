// ===== ENGINE: scripts, overworld =====
function startScript(fn){gen=fn();cur=null;advance();}
function advance(v){
  if(!gen)return;
  let r;
  try{r=gen.next(v);}catch(e){console.error(e);document.title='ERR '+e.message;gen=null;cur=null;if(S.mode==='battle'){S.mode='world';S.b=null;}return;}
  if(r.done){gen=null;cur=null;return;}
  cur=r.value;initCmd(cur);
}
const SPK=/^(@|[A-Z][A-Za-z]+(?: [A-Z][a-z]+)?): ([\s\S]*)$/;
function parseLines(lines){
  return lines.map(l=>{
    l=String(l).replace(/\{n\}/g,G?G.name:'');let who=null;const m=l.match(SPK);
    if(m){who=m[1]==='@'?G.name:m[1];l=m[2];}
    return {who,txt:l,w:wrap(l,690,FONT(20))};
  });
}
function initCmd(c){
  switch(c.t){
    case 'say':c.i=0;c.ch=0;c.L=parseLines(c.lines);break;
    case 'cut':c.i=0;c.ch=0;c.L=c.lines.map(l=>({txt:l.replace(/\{n\}/g,G?G.name:''),w:wrap(l.replace(/\{n\}/g,G?G.name:''),620,FONT(24,false,true))}));break;
    case 'choice':c.sel=0;break;
    case 'wait':c.left=c.ms/1000;break;
    case 'shake':S.shakeT=c.ms/1000;advance();break;
    case 'name':c.buf='';break;
    case 'walk':c.i=0;break;
    case 'excl':c.e.excl=true;c.left=.6;break;
    default:if(initExtra)initExtra(c);
  }
}
function nameKey(e,k){
  if(k==='Enter'){if(cur.buf.length){sfx(520,.05);advance(cur.buf);}return;}
  if(k==='Backspace'){cur.buf=cur.buf.slice(0,-1);return;}
  if(k.length===1&&/[a-z0-9 ]/i.test(k)&&cur.buf.length<10){cur.buf+=e.key;sfx(380,.03);}
}
function updCmd(dt){
  const c=cur;if(!c)return;
  switch(c.t){
    case 'say':{
      const L=c.L[c.i],n=L.txt.length,prev=c.ch;c.ch=Math.min(n,c.ch+dt*60);
      if(Math.floor(c.ch/3)!==Math.floor(prev/3)&&c.ch<n)sfx(260+RI(0,60),.02,'square',.01);
      if(isA()){if(c.ch<n)c.ch=n;else{c.i++;c.ch=0;sfx(520,.04);if(c.i>=c.L.length)advance();}}
      break;}
    case 'cut':{
      const L=c.L[c.i];c.ch+=dt;
      if(isA()&&c.ch>.5){c.i++;c.ch=0;if(c.i>=c.L.length)advance();}
      break;}
    case 'choice':{
      if(isU())c.sel=(c.sel+c.opts.length-1)%c.opts.length;
      if(isD())c.sel=(c.sel+1)%c.opts.length;
      if(isA()){sfx(520,.05);advance(c.sel);}
      break;}
    case 'wait':c.left-=dt;if(c.left<=0)advance();break;
    case 'fade':{
      const sp=dt*1000/c.ms;
      if(S.fade<c.a)S.fade=Math.min(c.a,S.fade+sp);else S.fade=Math.max(c.a,S.fade-sp);
      if(S.fade===c.a)advance();
      break;}
    case 'walk':{
      const e=c.e;
      if(!e.mv){
        if(c.i>=c.path.length){advance();break;}
        const [x,y]=c.path[c.i++];
        for(let d=0;d<4;d++)if(e.x+DX[d]===x&&e.y+DY[d]===y)stepEnt(e,d);
      }
      break;}
    case 'excl':c.left-=dt;if(c.left<=0){c.e.excl=false;advance();}break;
    default:if(updExtra)updExtra(dt,c);
  }
}

// ----- movement -----
function stepEnt(e,d){e.dir=d;e.x+=DX[d];e.y+=DY[d];e.ox=-DX[d]*TS;e.oy=-DY[d]*TS;e.mv=true;if(e===P)G.steps++;}
function tileSolid(x,y){return x<0||y<0||x>=M.w||y>=M.h||SOLID.has(M.t[y][x]);}
function walkable(x,y,self){
  if(tileSolid(x,y))return false;
  if(self!==P&&P.x===x&&P.y===y)return false;
  for(const e of M.ents)if(e!==self&&e.solid&&e.x===x&&e.y===y&&(!e.vis||e.vis()))return false;
  return true;
}
function entsMove(dt){
  let arrived=false;
  for(const e of [P,...M.ents]){
    if(!e.mv)continue;
    const sp=TS*(e===P?5.4:4.6)*dt;
    e.ox=e.ox>0?Math.max(0,e.ox-sp):Math.min(0,e.ox+sp);
    e.oy=e.oy>0?Math.max(0,e.oy-sp):Math.min(0,e.oy+sp);
    if(e.ox===0&&e.oy===0){e.mv=false;if(e===P)arrived=true;}
  }
  return arrived;
}
function pathTo(e,tx,ty){
  const q=[[e.x,e.y]],prev={},key=(x,y)=>x+','+y;prev[key(e.x,e.y)]=null;
  while(q.length){
    const [x,y]=q.shift();if(x===tx&&y===ty)break;
    for(let d=0;d<4;d++){
      const nx=x+DX[d],ny=y+DY[d],k=key(nx,ny);
      if(k in prev)continue;
      if(!(nx===tx&&ny===ty)&&!walkable(nx,ny,e))continue;
      if(tileSolid(nx,ny))continue;
      prev[k]=[x,y];q.push([nx,ny]);
    }
  }
  if(!(key(tx,ty) in prev))return[];
  const out=[];let k=key(tx,ty);
  while(prev[k]){const [x,y]=k.split(',').map(Number);out.unshift([x,y]);k=key(...prev[k]);}
  return out;
}
function approach(e){const p=pathTo(e,P.x,P.y);p.pop();return{t:'walk',e,path:p};}
const excl=e=>({t:'excl',e});
const walkTo=(e,x,y)=>({t:'walk',e,path:pathTo(e,x,y)});

function canSee(e){
  for(let k=1;k<=(e.sight||4);k++){
    const x=e.x+DX[e.dir]*k,y=e.y+DY[e.dir]*k;
    if(tileSolid(x,y))return false;
    if(x===P.x&&y===P.y)return true;
    if(M.ents.some(o=>o!==e&&o.solid&&o.x===x&&o.y===y&&(!o.vis||o.vis())))return false;
  }
  return false;
}

function setMap(id,x,y,dir){
  G.map=id;M=MAPS[id];P.x=x;P.y=y;if(dir!=null)P.dir=dir;P.mv=false;P.ox=P.oy=0;
  S.area={text:M.name,t:2.4};
}
function* goto(id,x,y,dir){
  yield fade(1,250);setMap(id,x,y,dir);yield fade(0,250);
  if(M.enter)yield* M.enter();
}

function interact(){
  const fx=P.x+DX[P.dir],fy=P.y+DY[P.dir];
  const e=M.ents.find(o=>o.x===fx&&o.y===fy&&(!o.vis||o.vis())&&o.talk);
  if(e){if(e.kind==='npc')e.dir=(P.dir+2)%4;startScript(function*(){yield* e.talk(e);});return;}
  const lk=M.look[fx+','+fy];
  if(lk)startScript(lk);
}

function arrive(){
  S.wc++;
  const d=M.doors.find(d=>d.x===P.x&&d.y===P.y);
  if(d){startScript(function*(){yield* goto(d.to,d.tx,d.ty,d.dir);});return;}
  for(const tr of M.trig){
    if(tr.at.some(p=>p[0]===P.x&&p[1]===P.y)&&!(tr.flag&&F[tr.flag])&&(!tr.when||tr.when())){
      if(tr.flag)F[tr.flag]=1;startScript(tr.run);return;
    }
  }
  for(const e of M.ents){
    if(e.trainer&&(!e.vis||e.vis())&&!F['t_'+e.trainer.id]&&canSee(e)){startScript(function*(){yield* trainerFight(e,true);});return;}
  }
  const ch=M.t[P.y][P.x];
  if((ch==='G'||ch==='m')&&M.enc&&Math.random()<.13){startScript(wildEncounter);return;}
  if(stage()>=1&&S.wc>=24){S.wc=0;S.whisper={text:PK(WHISPERS[Math.min(stage(),5)]),t:3.4};}
}
function rollWild(){
  const tot=M.enc.reduce((a,e)=>a+e.w,0);let r=Math.random()*tot;
  for(const e of M.enc){r-=e.w;if(r<=0)return{sp:e.sp,lv:RI(e.lv[0],e.lv[1])};}
  return{sp:M.enc[0].sp,lv:M.enc[0].lv[0]};
}
function* wildEncounter(){const r=yield* doBattle({kind:'wild',team:[rollWild()],bg:M.bg});yield* afterBattle(r);}
function* afterBattle(r){if(r==='lose')yield* blackout();}
function* blackout(){
  yield fade(1,500);
  G.money=Math.floor(G.money/2);healAll();
  const h=G.lastHeal;setMap(h.map,h.x,h.y,2);
  yield fade(0,600);
  if(stage()<2)yield say("Everything went dark.","You wake up where it is warm. Someone has healed your Wilds.");
  else{
    yield say("Everything went dark.","You wake up somewhere warm. You don't remember walking here.","Your hands are muddy. There is something under your nails that isn't mud.");
    note('blackout',"I blacked out and woke up somewhere else, hands dirty. I never remember the walk back.");
  }
}

// ----- world update/draw -----
function updWorld(dt){
  if(entsMove(dt)&&!gen)arrive();
  if(gen){updCmd(dt);return;}
  if(S.menu){updMenu();return;}
  if(!P.mv){
    if(isB()||hit.has('m')){openMenu();return;}
    if(isA()){interact();return;}
    const d=heldDir();
    if(d>=0){P.dir=d;if(walkable(P.x+DX[d],P.y+DY[d],P))stepEnt(P,d);}
  }
}
function cam(){
  const px=P.x*TS+P.ox+TS/2,py=P.y*TS+P.oy+TS/2,mw=M.w*TS,mh=M.h*TS;
  let cx=px-W/2,cy=py-H/2;
  cx=mw<=W?-(W-mw)/2:cl(cx,0,mw-W);cy=mh<=H?-(H-mh)/2:cl(cy,0,mh-H);
  return[Math.round(cx),Math.round(cy)];
}
function drawWorld(){
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  let [cx,cy]=cam();if(S.shakeT>0){cx+=RI(-4,4);cy+=RI(-4,4);}
  const x0=Math.max(0,Math.floor(cx/TS)),x1=Math.min(M.w-1,Math.floor((cx+W)/TS)),y0=Math.max(0,Math.floor(cy/TS)),y1=Math.min(M.h-1,Math.floor((cy+H)/TS));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)drawTile(M,M.t[y][x],x,y,x*TS-cx,y*TS-cy);
  const list=[];
  for(const e of M.ents){if(e.vis&&!e.vis())continue;list.push({y:e.y*TS+e.oy,f:()=>drawEnt(e,e.x*TS+e.ox-cx,e.y*TS+e.oy-cy)});}
  list.push({y:P.y*TS+P.oy,f:()=>{
    const sx=P.x*TS+P.ox-cx,sy=P.y*TS+P.oy-cy;playerShadow(sx,sy);
    human(sx,sy,P.dir,{col:'#3a5ea8',glove:'#3a3a44',hair:'#2a1a1a',mask:G.mask,eyes:stage()>=3?'#ffe070':null},P.mv);
  }});
  list.sort((a,b)=>a.y-b.y);for(const o of list)o.f();
  const tint=M.tint&&M.tint();if(tint){g.fillStyle=tint;g.fillRect(0,0,W,H);}
  const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${.35+stage()*.08})`);
  g.fillStyle=v;g.fillRect(0,0,W,H);
  if(S.area&&S.area.t>0){const a=Math.min(1,S.area.t);g.globalAlpha=a;box(16,14,Math.max(160,S.area.text.length*14+40),40);text(S.area.text,34,24,20);g.globalAlpha=1;}
  if(S.toast&&S.toast.t>0){g.globalAlpha=Math.min(1,S.toast.t);box(W-250,14,236,36);text('✎ '+S.toast.text,W-236,23,16,'#e8c660');g.globalAlpha=1;}
  if(S.whisper&&S.whisper.t>0&&!cur){g.globalAlpha=Math.min(.7,S.whisper.t/2);text(S.whisper.text,W/2,H-60,18,'#b0a0c8','center',false,true);g.globalAlpha=1;}
}

// ----- command overlays -----
function drawCmd(){
  const c=cur;if(!c)return;
  switch(c.t){
    case 'say':{
      const L=c.L[c.i];box(24,420,752,140);
      if(L.who){box(40,396,Math.max(110,L.who.length*13+30),32,'rgba(40,30,60,.97)');text(L.who,52,402,17,'#e8c660',undefined,true);}
      let rem=Math.floor(c.ch);
      L.w.forEach((ln,i)=>{const s=ln.slice(0,Math.max(0,rem));rem-=ln.length+1;text(s,48,440+i*27,20);});
      if(c.ch>=L.txt.length&&Math.floor(S.t*2)%2)text('▼',740,530,16,'#e8c660');
      break;}
    case 'cut':{
      g.fillStyle='#000';g.fillRect(0,0,W,H);
      const L=c.L[c.i];g.globalAlpha=Math.min(1,c.ch*1.2);
      const y0=H/2-L.w.length*17;
      L.w.forEach((ln,i)=>text(ln,W/2,y0+i*34,24,'#d8d0e8','center',false,true));
      g.globalAlpha=1;if(c.ch>.8&&Math.floor(S.t*2)%2)text(c.i===0?'Press Z or Enter  ▼':'▼',W/2,H-60,16,'#8a80a0','center');
      break;}
    case 'choice':{
      if(c.q){box(24,420,752,140);const lines=wrap(c.q.replace(/\{n\}/g,G.name),690,FONT(20));lines.forEach((ln,i)=>text(ln,48,440+i*27,20));}
      g.font=FONT(20);let w=0;for(const o of c.opts)w=Math.max(w,g.measureText(o).width);
      const bw=w+70,bh=c.opts.length*34+30,bx=W-bw-30,by=410-bh;
      box(bx,by,bw,bh);
      c.opts.forEach((o,i)=>{text(o,bx+46,by+18+i*34,20,i===c.sel?'#e8c660':'#f0ead8');if(i===c.sel)text('▶',bx+20,by+18+i*34,20,'#e8c660');});
      break;}
    case 'name':{
      g.fillStyle='#000';g.fillRect(0,0,W,H);
      text('What is your name?',W/2,200,30,'#d8d0e8','center',false,true);
      box(W/2-180,260,360,64);
      text(c.buf+(Math.floor(S.t*2)%2?'_':' '),W/2,278,30,'#f0ead8','center');
      text('Type, then press Enter',W/2,350,16,'#8a80a0','center');
      break;}
    default:if(drawExtra)drawExtra(c);
  }
}
