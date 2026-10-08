// ===== MAIN: title, new game, loop, debug =====
function newGame(name){
  G={name,map:'home',party:[],box:[],bag:{cage:0,iron:0,salve:0},money:0,F:{},notes:[],seen:{},caught:{},
    steps:0,mercy:0,spared:0,hunted:0,lastHeal:{map:'ashmere',x:7,y:9},mask:false,x:2,y:3,dir:0};
  F=G.F;
}
function* introScript(){
  S.mode='intro';
  yield cut("ASHMERE.","Seven days of rain. Then, this morning, quiet.","You wake with a taste in your mouth you can't name.");
  const name=yield {t:'name'};
  G.name=name;S.fade=1;
  setMap('home',2,3,0);S.mode='world';
  yield wait(300);yield fade(0,900);
  yield say("Today the Wardens open the License to Ashmere's young. Everyone has been talking about it for weeks.",
    "You have been talking about it too.","You don't remember deciding to want it.",
    "Mother is by the stove, humming. She stops when she sees you're awake.");
}
function startNew(){
  newGame('');S.fade=0;
  startScript(introScript);
}
function continueGame(){
  const s=loadSave();if(!s)return;
  G=s;F=G.F;setMap(G.map,G.x,G.y,G.dir);S.mode='world';S.fade=0;
}
function toTitle(){G=null;F={};S.mode='title';S.sel=0;S.fade=0;S.menu=null;gen=null;cur=null;S.end=null;}

function updTitle(){
  const has=!!loadSave();
  if(isU()||isD())S.sel=has?1-S.sel:0;
  if(isA()){
    sfx(520,.06);
    if(S.sel===0)startNew();else if(has)continueGame();
  }
}
function drawTitle(){
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#08060e');gr.addColorStop(1,'#1c1230');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  // cages with trembling wilds
  const ids=['embit','mossling','flitwing','puddlet','zapkit'];
  ids.forEach((id,i)=>{const x=110+i*145,y=250;
    g.globalAlpha=.55;g.fillStyle='#16101f';g.fillRect(x-45,y-50,90,100);g.strokeStyle='#4a3a5a';g.lineWidth=3;
    for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(x+k*28,y-50);g.lineTo(x+k*28,y+50);g.stroke();}
    drawMon(id,x,y,60,{fear:true});g.globalAlpha=1;});
  // the figure and its shadow
  g.save();g.translate(W/2-48,380);g.scale(3,3);human(0,0,2,{col:'#3a5ea8',glove:'#3a3a44',hair:'#2a1a1a'},false);g.restore();
  g.fillStyle='rgba(0,0,0,.55)';const hx=W/2+80,hy=490;
  g.beginPath();g.moveTo(W/2-30,468);g.lineTo(W/2+10,468);g.lineTo(hx+14,hy);g.lineTo(hx-14,hy);g.fill();
  g.beginPath();g.arc(hx,hy,24,0,7);g.fill();
  tri(hx-14,hy-12,hx-30,hy-52,hx-4,hy-20,'rgba(0,0,0,.55)');tri(hx+14,hy-12,hx+30,hy-52,hx+4,hy-20,'rgba(0,0,0,.55)');
  for(let i=0;i<4;i++)g.fillRect(hx-30+i*12,hy+24,3,28);
  const glitch=Math.floor(S.t*3)%11===0;
  text('HOLLOW HUNT',W/2+(glitch?4:0),70,64,glitch?'#d83a3a':'#e8c660','center',true);
  if(glitch)text('HOLLOW HUNT',W/2-3,72,64,'#3a9ad8','center',true);
  text('Catch them all. Ask yourself why.',W/2,150,20,'#a898c8','center',false,true);
  const has=!!loadSave();
  text((S.sel===0?'▶ ':'  ')+'NEW GAME',W/2,H-90,24,S.sel===0?'#e8c660':'#8a80a0','center');
  if(has)text((S.sel===1?'▶ ':'  ')+'CONTINUE',W/2,H-56,24,S.sel===1?'#e8c660':'#8a80a0','center');
  text('Arrows / WASD move   Z / Enter confirm   X / Esc back / menu',W/2,H-22,13,'#5a5070','center');
}
function drawEnd(){
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  const e=S.end;
  text('ENDING '+(e.k+1)+' OF 4',W/2,60,16,'#6a6078','center');
  text(e.name,W/2,90,64,['#e8c660','#58b04a','#d83a3a','#c8c8dc'][e.k],'center',true);
  const st=[`Wilds caged: ${G.hunted}`,`Wilds spared or released: ${G.spared}`,`Journal entries: ${G.notes.length}`,`Steps taken: ${G.steps}`];
  st.forEach((s,i)=>text(s,W/2,200+i*30,20,'#d8d0e8','center'));
  box(100,350,600,140);
  text('WILDBOOK  #000',130,368,18,'#d83a3a',undefined,true);
  wrap("THE HOLLOW. It wears the shape of a child. It hungers. It did not know it was hungry. Seen: 1. Caged: 0.",520,FONT(18)).forEach((ln,i)=>text(ln,130,400+i*26,18,'#d8d0e8'));
  if(Math.floor(S.t*2)%2)text('Press Z to return to the title',W/2,520,18,'#8a80a0','center');
}

function update(dt){
  S.t+=dt;
  for(const k of ['area','toast','whisper'])if(S[k]&&S[k].t>0)S[k].t-=dt;
  if(S.shakeT>0)S.shakeT-=dt;
  if(Math.floor(S.t)%5===0)droneTick();
  switch(S.mode){
    case 'title':updTitle();break;
    case 'intro':if(gen)updCmd(dt);break;
    case 'world':updWorld(dt);break;
    case 'battle':updBattleAnim(dt);if(gen)updCmd(dt);break;
    case 'endcard':S.fade=0;if(isA()){toTitle();}break;
  }
  hit.clear();
}
function draw(){
  switch(S.mode){
    case 'title':drawTitle();break;
    case 'intro':g.fillStyle='#000';g.fillRect(0,0,W,H);break;
    case 'world':drawWorld();if(S.menu)drawMenu();break;
    case 'battle':drawBattle();break;
    case 'endcard':drawEnd();break;
  }
  const full=cur&&(cur.t==='cut'||cur.t==='name');
  if(!full)drawCmd();
  if(S.fade>0){g.fillStyle=`rgba(0,0,0,${S.fade})`;g.fillRect(0,0,W,H);}
  if(full)drawCmd();
}

// ----- debug jumps (for testing): index.html#d=thornby -----
function debugStart(k){
  newGame('Ash');
  const lv={ashmere:5,route1:6,thornby:10,route2:14,tower:17,tower2:19}[k]||5;
  G.party=[mkMon('embit',lv),mkMon('zapkit',lv-1),mkMon('mossling',lv-1)];
  G.bag={cage:8,iron:2,salve:5};G.money=900;F.mother1=1;F.labIntro=1;F.starter='embit';G.seen={embit:1,zapkit:1,mossling:1};G.caught={embit:1,zapkit:1};
  G.notes=[{k:'a',t:'Debug note: reflections blink late.'}];
  const to={home:['home',5,5],ashmere:['ashmere',14,12],route1:['route1',11,40],thornby:['thornby',15,24],route2:['route2',12,38],tower:['tower1',6,10],tower2:['tower2',6,9]}[k]||['ashmere',14,12];
  if(['thornby','route2','tower','tower2'].includes(k)){F.bell=1;F.dellMeet=1;}
  if(['route2','tower','tower2'].includes(k)){F.slept=1;F.maren=1;F.festival=1;F.burned=1;F.kes1done=1;}
  if(['tower','tower2'].includes(k)){F.heron=1;F.haleDone=1;}
  if(k==='tower2'){F.kesTower=1;}
  setMap(to[0],to[1],to[2],0);S.mode='world';S.fade=0;
}

window.addEventListener('error',e=>{document.title='ERR '+e.message+' @'+e.lineno;});
buildMaps();
if(location.hash.includes('newgame'))startNew();
{const h=location.hash.match(/d=(\w+)/);if(h){if(h[1]==='battle'){debugStart('route1');startScript(function*(){yield* doBattle({kind:'wild',team:[{sp:'mossling',lv:5}],bg:'grass'});});}
  else if(h[1]==='menu'){debugStart('thornby');openMenu();}
  else if(h[1]==='end'){debugStart('tower2');S.end={name:'THE MASK',k:3};S.mode='endcard';}
  else if(h[1]==='mirror'){debugStart('home');F.starter='embit';}
  else debugStart(h[1]);}}
{const r=location.hash.match(/run=([a-z0-9]+)/);if(r){const n=r[1],T={finale:finaleScene,kestower:kesTowerScene,heron:heronScene,hale:haleTalk,sleep:sleepScene,festival:()=>{F.maren=1;F.festivalStart=1;return festivalScene();},kes1:kesRoute1,maren:()=>{F.t_corvin=1;F.t_ines=1;return marenTalk();},lab:()=>{G.party=[];F.labIntro=0;F.starter=null;return labIntro();},mother:()=>{F.mother1=0;return motherTalk();},end0:()=>ending(0),end1:()=>ending(1),end2:()=>ending(2),end3:()=>ending(3)};
  if(n==='lab'){setMap('lab',6,7,0);G.bag={cage:0,iron:0,salve:0};}
  startScript(function*(){yield* T[n]();});}}
{const ff=location.hash.match(/ff=([0-9]+)/);if(ff){const auto=location.hash.includes('auto');for(let i=0;i<+ff[1];i++){if(auto&&i%3===0)hit.add('z');update(.05);}}}
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  try{update(dt);draw();if(location.hash.includes('dbg'))document.title='m='+S.mode+' t='+S.t.toFixed(1)+' cmd='+(cur?cur.t+(cur.L&&cur.L[cur.i]?':'+cur.L[cur.i].txt.slice(0,50):''):'-');}catch(e){console.error(e);document.title='ERR '+e.message;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
