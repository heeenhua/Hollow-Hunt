// ===== BATTLE =====
function catchLines(name){
  const st=stage();
  return [
    [`Gotcha! ${name} was caged!`],
    [`The Cage clicks shut. ${name} didn't struggle.`,`You feel warm. Fuller. For a moment.`],
    [`The Cage snaps shut around ${name}.`,`It stares at you through the bars. Not afraid anymore. Just very tired.`,`Something inside you settles, like a meal.`],
    [`${name} is caged.`,`You didn't feel the cage close. You felt yourself close.`,`You are less hungry now. You hate that you are less hungry.`],
    [`${name} is caged. As the door shut, it whispered: "forgive."`],
    [`${name} is caged. It does not look at you. Neither of you pretends anymore.`]
  ][Math.min(st,5)];
}
function* doBattle(o){
  const wild=o.kind==='wild';
  const foes=o.team.map(t=>mkMon(t.sp,t.lv));
  const first=G.party.findIndex(m=>m.hp>0);
  if(first<0)return 'lose';
  const B=S.b={wild,foes,fi:0,foe:foes[0],me:G.party[first],bg:o.bg||'grass',trainer:o.trainer||null,
    foeShake:0,meShake:0,foeDead:0,meDead:0,cage:null,ui:null};
  G.party.forEach(m=>{m.st={atk:0,def:0};});
  yield fade(1,300);S.mode='battle';yield fade(0,300);
  G.seen[B.foe.sp]=1;
  const nm=m=>m===B.me?m.name:(wild?'Wild ':'Foe ')+m.name;
  const st=stage();
  if(wild){
    yield bm(`A wild ${B.foe.name} appeared!`);
    if(st>=1&&Math.random()<.3+st*.1){
      yield bm(PK(FEAR[Math.min(st,5)]).replace('{n}',B.foe.name));
      if(st>=3)note('wildfear',"The wild ones don't run from me. They kneel. They go still. Like they know.");
      else note('wildfreeze',"Wild creatures freeze when I get close. They don't even try to flee.");
    }
  }else{
    yield bm(`${B.trainer.name} wants to battle!`);
    yield bm(`${B.trainer.name} sent out ${B.foe.name}!`);
  }
  yield bm(`Go, ${B.me.name}!`);

  function pickFoeMove(){
    const ms=B.foe.moves.map(k=>MV[k]);
    const w=ms.map(m=>m.pow?m.pow*eff(m.type,SP[B.me.sp].type)*(SP[B.foe.sp].type===m.type?1.3:1):18);
    let t=w.reduce((a,b)=>a+b,0),r=Math.random()*t;
    for(let i=0;i<ms.length;i++){r-=w[i];if(r<=0)return ms[i];}
    return ms[0];
  }
  function* strike(att,def,mv){
    yield bm(`${nm(att)} used ${mv.name}!`);
    if(Math.random()*100>mv.acc){yield bm('It missed!');return;}
    if(mv.pow>0){
      const e=eff(mv.type,SP[def.sp].type),d=calcDmg(att,def,mv);
      def.hp=Math.max(0,def.hp-d);
      if(def===B.foe)B.foeShake=1;else B.meShake=1;
      sfx(110,.14,'sawtooth',.04);
      yield bwait(500);
      if(e>1)yield bm("It's super effective!");else if(e<1)yield bm("It's not very effective...");
    }else if(mv.eff==='atkdown'){def.st.atk=Math.max(-3,def.st.atk-1);yield bm(`${nm(def)}'s attack fell!`);}
    else if(mv.eff==='defup'){att.st.def=Math.min(3,att.st.def+1);yield bm(`${nm(att)}'s defense rose!`);}
    else if(mv.eff==='heal'){att.hp=Math.min(att.mhp,att.hp+Math.floor(att.mhp*.4));yield bm(`${nm(att)} recovered health!`);}
  }
  function* foeFaint(){
    B.foeDead=.01;yield bwait(700);yield bm(`${nm(B.foe)} fainted!`);
    const base=Math.floor(SP[B.foe.sp].exp*B.foe.lv/4*(wild?1:1.5));
    for(const m of G.party){
      if(m.hp<=0)continue;
      const amt=m===B.me?base:Math.max(1,Math.floor(base/2));
      const msgs=gainExp(m,amt);
      if(m===B.me){yield bm(`${m.name} gained ${amt} exp.`);for(const t of msgs)yield bm(t);}
      else for(const t of msgs)if(t.includes('grew'))yield bm(t);
    }
    if(B.fi+1<B.foes.length){
      B.fi++;B.foe=B.foes[B.fi];B.foeDead=0;G.seen[B.foe.sp]=1;
      yield bm(`${B.trainer.name} sent out ${B.foe.name}!`);return 'next';
    }
    return 'win';
  }
  function* meFaint(){
    B.meDead=.01;yield bwait(700);yield bm(`${B.me.name} fainted!`);
    if(!G.party.some(m=>m.hp>0))return 'lose';
    let idx=-1;
    while(idx<0)idx=yield {t:'bparty',mode:'swap',forced:true};
    B.me=G.party[idx];B.me.st={atk:0,def:0};B.meDead=0;
    yield bm(`Go, ${B.me.name}!`);return 'ok';
  }
  const frozen=()=>wild&&st>=2&&Math.random()<.12+.06*(Math.min(st,5)-2);

  let result=null;
  loop:while(true){
    const act=yield {t:'bmenu'};
    let meMove=null;
    if(act.k==='run'){
      if(Math.random()<.75){yield bm('Got away safely!');result='ran';break;}
      yield bm("Couldn't get away!");
    }else if(act.k==='spare'){
      G.mercy++;G.spared++;
      if(st<2)yield bm(`You step back. The wild ${B.foe.name} blinks, then scampers off.`);
      else{yield bm(`You lower your hands. The wild ${B.foe.name} stares at you for a long moment...`);yield bm('Then it bows, and goes.');}
      note('spare',"I let a wild one go. It looked at me like I'd done something impossible.");
      result='spared';break;
    }else if(act.k==='salve'){
      const idx=yield {t:'bparty',mode:'salve'};
      if(idx<0)continue;
      const m=G.party[idx];
      if(m.hp<=0||m.hp>=m.mhp){yield bm("It won't have any effect.");continue;}
      G.bag.salve--;m.hp=Math.min(m.mhp,m.hp+40);yield bm(`${m.name} was patched up.`);
    }else if(act.k==='party'){
      const idx=yield {t:'bparty',mode:'swap'};
      if(idx<0||G.party[idx]===B.me)continue;
      B.me=G.party[idx];B.me.st={atk:0,def:0};yield bm(`Go, ${B.me.name}!`);
    }else if(act.k==='cage'){
      const iron=act.ball==='iron';
      if(iron)G.bag.iron--;else G.bag.cage--;
      yield bm(`You threw the ${iron?'Iron Cage':'Cage'}!`);
      B.cage={state:'fly',t:0,wob:0};yield bwait(800);B.cage.state='shut';
      const ratio=B.foe.hp/B.foe.mhp;
      const p=cl(SP[B.foe.sp].catch*(1.7-1.4*ratio)*(iron?1.7:1),.04,.97),q=Math.pow(p,1/3);
      let n=0;
      for(let i=0;i<3;i++){B.cage.wob=1;sfx(200,.1,'triangle',.05);yield bwait(750);if(Math.random()<q)n++;else break;}
      if(n===3){
        const m=B.foe;G.caught[m.sp]=1;G.hunted++;m.st={atk:0,def:0};
        for(const l of catchLines(m.name))yield bm(l);
        if(G.party.length<6)G.party.push(m);else{G.box.push(m);yield bm(`${m.name} was sent to storage.`);}
        if(G.hunted===1)note('firstcage',"My first cage. It felt good. Why did it feel so good?");
        if(st>=2)note('caged',"When the cage closes, something in me is satisfied. Not happy. Fed.");
        result='caught';break loop;
      }
      B.cage=null;
      yield bm(st>=2?`${B.foe.name} slipped the Cage. For a second it looked relieved.`:`Oh no! ${B.foe.name} broke free!`);
    }else if(act.k==='move'){meMove=MV[B.me.moves[act.i]];}

    const steps=meMove?(B.me.spd>=B.foe.spd?['me','foe']:['foe','me']):['foe'];
    for(const s of steps){
      if(B.me.hp<=0||B.foe.hp<=0)continue;
      if(s==='me'){
        yield* strike(B.me,B.foe,meMove);
        if(B.foe.hp<=0){const r=yield* foeFaint();if(r==='win'){result='win';break loop;}break;}
      }else{
        if(frozen())yield bm(`${nm(B.foe)} is too afraid to move!`);
        else yield* strike(B.foe,B.me,pickFoeMove());
        if(B.me.hp<=0){const r=yield* meFaint();if(r==='lose'){result='lose';break loop;}break;}
      }
    }
  }
  yield fade(1,300);S.mode='world';S.b=null;yield fade(0,300);
  return result;
}

// ----- battle UI / commands -----
function mainOpts(){
  const B=S.b,o=[{id:'fight',l:'FIGHT'}];
  if(B.wild){o.push({id:'cage',l:`CAGE x${G.bag.cage}`});if(G.bag.iron>0)o.push({id:'iron',l:`IRON x${G.bag.iron}`});}
  o.push({id:'salve',l:`SALVE x${G.bag.salve}`},{id:'party',l:'PARTY'});
  if(B.wild)o.push({id:'spare',l:'SPARE'},{id:'run',l:'RUN'});
  return o;
}
function initExtra(c){
  switch(c.t){
    case 'bmsg':c.ch=0;c.hold=0;c.txt=c.text.replace(/\{n\}/g,G.name);break;
    case 'bwait':c.left=c.ms/1000;break;
    case 'bmenu':S.b.ui={k:'main',sel:0,opts:mainOpts()};break;
    case 'bparty':c.sel=Math.max(0,G.party.indexOf(S.b.me));if(G.party[c.sel].hp<=0){const a=G.party.findIndex(m=>m.hp>0);if(a>=0)c.sel=a;}break;
    case 'shop':initShop(c);break;
  }
}
function navGrid(sel,n,cols){
  if(isU())sel=sel-cols>=0?sel-cols:sel;
  if(isD())sel=sel+cols<n?sel+cols:sel;
  if(isL())sel=sel%cols>0?sel-1:sel;
  if(isRt())sel=(sel%cols<cols-1&&sel+1<n)?sel+1:sel;
  return sel;
}
function updExtra(dt,c){
  const B=S.b;
  switch(c.t){
    case 'bmsg':{
      const n=c.txt.length;c.ch=Math.min(n,c.ch+dt*70);
      if(c.ch>=n)c.hold+=dt;
      if(isA()){if(c.ch<n)c.ch=n;else c.hold=99;}
      if(c.hold>.65)advance();
      break;}
    case 'bwait':c.left-=dt;if(c.left<=0)advance();break;
    case 'bmenu':{
      const u=B.ui;
      if(u.k==='main'){
        u.sel=navGrid(u.sel,u.opts.length,2);
        if(isA()){
          const o=u.opts[u.sel];sfx(520,.04);
          if(o.id==='fight'){B.ui={k:'moves',sel:0};}
          else if(o.id==='cage'||o.id==='iron'){
            const have=o.id==='cage'?G.bag.cage:G.bag.iron;
            if(have>0)advance({k:'cage',ball:o.id});else sfx(120,.1);
          }else if(o.id==='salve'){if(G.bag.salve>0)advance({k:'salve'});else sfx(120,.1);}
          else advance({k:o.id});
        }
      }else{
        u.sel=navGrid(u.sel,B.me.moves.length,2);
        if(isB()){B.ui={k:'main',sel:0,opts:mainOpts()};}
        else if(isA()){sfx(520,.04);advance({k:'move',i:u.sel});}
      }
      break;}
    case 'bparty':{
      if(isU())c.sel=(c.sel+G.party.length-1)%G.party.length;
      if(isD())c.sel=(c.sel+1)%G.party.length;
      if(isB()&&!c.forced)advance(-1);
      else if(isA()){
        const m=G.party[c.sel];
        if(c.mode==='swap'&&m.hp<=0){sfx(120,.1);break;}
        advance(c.sel);
      }
      break;}
    case 'shop':updShop(dt,c);break;
  }
}
function updBattleAnim(dt){
  const B=S.b;if(!B)return;
  B.foeShake=Math.max(0,B.foeShake-dt*3);B.meShake=Math.max(0,B.meShake-dt*3);
  if(B.foeDead>0)B.foeDead=Math.min(1,B.foeDead+dt*1.5);
  if(B.meDead>0)B.meDead=Math.min(1,B.meDead+dt*1.5);
  if(B.cage){B.cage.t+=dt;B.cage.wob=Math.max(0,B.cage.wob-dt*1.6);}
  for(const m of [B.foe,B.me]){if(m.dh===undefined)m.dh=m.hp;m.dh+=(m.hp-m.dh)*Math.min(1,dt*6);if(Math.abs(m.hp-m.dh)<.3)m.dh=m.hp;}
}

function drawBattle(){
  const B=S.b;if(!B)return;
  const sets={grass:['#a8d4f0','#5a9a46'],marsh:['#7a9a9a','#3f6a56'],indoor:['#3a3048','#2a2036'],tower:['#1a1a30','#2a2a44']};
  const [a,b]=sets[B.bg]||sets.grass;
  const gr=g.createLinearGradient(0,0,0,410);gr.addColorStop(0,a);gr.addColorStop(.55,a);gr.addColorStop(.56,b);gr.addColorStop(1,b);
  g.fillStyle=gr;g.fillRect(0,0,W,410);
  ell(590,235,130,26,'rgba(0,0,0,.18)');ell(210,370,150,30,'rgba(0,0,0,.2)');
  const st=stage();
  // foe
  const cg=B.cage;
  if(!(cg&&cg.state==='shut')){
    const shrink=cg&&cg.state==='fly'?cl((cg.t-.55)/.25,0,1):0;
    drawMon(B.foe.sp,590,170,190,{flip:true,shake:B.foeShake*Math.sin(S.t*60)*6,fear:B.wild&&st>=1,dead:B.foeDead,shrink});
  }
  if(cg){
    let x=590,y=215;
    if(cg.state==='fly'){const k=cl(cg.t/.75,0,1);x=210+(590-210)*k;y=330+(215-330)*k-Math.sin(k*Math.PI)*120;}
    else y=215+Math.sin(S.t*40)*cg.wob*4;
    if(cg.state==='shut')x+=Math.sin(S.t*30)*cg.wob*6;
    g.fillStyle='#3a3a4a';g.fillRect(x-22,y-30,44,44);g.strokeStyle='#caa050';g.lineWidth=3;
    for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(x+i*12,y-30);g.lineTo(x+i*12,y+14);g.stroke();}
    g.strokeRect(x-22,y-30,44,44);
  }
  // me
  drawMon(B.me.sp,210,285,210,{shake:B.meShake*Math.sin(S.t*60)*6,dead:B.meDead});
  // panels
  panel(40,36,330,B.foe,false);
  panel(430,296,330,B.me,true);
  if(B.trainer)text(B.trainer.name,52,16,14,'#fff','left',true);
  // bottom
  box(24,420,752,140);
}
function panel(x,y,w,m,mine){
  box(x,y,w,84,'rgba(12,9,20,.9)');
  text(m.name,x+16,y+12,20,'#f0ead8',undefined,true);
  text('Lv'+m.lv,x+w-70,y+14,16,'#d8d0e8');
  const t=SP[m.sp].type;g.fillStyle=TCOL[t];g.fillRect(x+16,y+38,10,10);text(t,x+30,y+36,12,'#a8a0b8');
  text('HP',x+16,y+58,14,'#e8c660',undefined,true);
  const bx=x+46,bw=w-70,f=cl((m.dh===undefined?m.hp:m.dh)/m.mhp,0,1);
  g.fillStyle='#1a1226';g.fillRect(bx,y+58,bw,12);
  g.fillStyle=f>.5?'#58b04a':f>.2?'#e8c820':'#d83a3a';g.fillRect(bx,y+58,bw*f,12);
  g.strokeStyle='#8a80a0';g.lineWidth=1;g.strokeRect(bx+.5,y+58.5,bw,12);
  if(mine)text(`${Math.ceil(m.hp)}/${m.mhp}`,x+w-16,y+36,14,'#d8d0e8','right');
}
function drawExtra(c){
  const B=S.b;
  switch(c.t){
    case 'bmsg':{
      const lines=wrap(c.txt,690,FONT(20));let rem=Math.floor(c.ch);
      lines.forEach((ln,i)=>{text(ln.slice(0,Math.max(0,rem)),48,440+i*27,20);rem-=ln.length+1;});
      break;}
    case 'bwait':break;
    case 'bmenu':{
      const u=B.ui;
      text(u.k==='main'?`What will ${B.me.name} do?`:'Choose a move.',48,440,20);
      box(400,420,376,140);
      if(u.k==='main'){
        u.opts.forEach((o,i)=>{const x=430+(i%2)*170,y=442+Math.floor(i/2)*29;
          text(o.l,x+22,y,18,i===u.sel?'#e8c660':'#f0ead8');if(i===u.sel)text('▶',x,y,18,'#e8c660');});
      }else{
        B.me.moves.forEach((k,i)=>{const mv=MV[k],x=420+(i%2)*180,y=446+Math.floor(i/2)*50;
          text(mv.name,x+20,y,16,i===u.sel?'#e8c660':'#f0ead8');if(i===u.sel)text('▶',x,y,16,'#e8c660');
          g.fillStyle=TCOL[mv.type];g.fillRect(x+20,y+22,8,8);text(mv.pow?'PWR '+mv.pow:'STATUS',x+32,y+20,12,'#a8a0b8');});
      }
      break;}
    case 'bparty':{
      box(60,40,420,360);text(c.mode==='salve'?'Use Salve on...':'Choose a Wild',84,56,20,'#e8c660',undefined,true);
      G.party.forEach((m,i)=>{
        const y=96+i*48;
        text((i===c.sel?'▶ ':'  ')+m.name+'  Lv'+m.lv,84,y,18,m.hp<=0?'#7a7088':i===c.sel?'#e8c660':'#f0ead8');
        g.fillStyle='#1a1226';g.fillRect(84,y+24,220,8);g.fillStyle='#58b04a';g.fillRect(84,y+24,220*cl(m.hp/m.mhp,0,1),8);
        text(`${m.hp}/${m.mhp}`,320,y+18,14,'#a8a0b8');
      });
      break;}
    case 'shop':drawShop(c);break;
  }
}
