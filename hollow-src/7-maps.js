// ===== MAPS =====
function newMap(id,w,h,fill,o){
  const m=Object.assign({id,w,h,t:[],ents:[],doors:[],trig:[],look:{},enc:null,name:id,interior:false,bg:'indoor'},o||{});
  for(let y=0;y<h;y++)m.t.push(new Array(w).fill(fill));
  MAPS[id]=m;return m;
}
const setT=(m,x,y,c)=>{if(x>=0&&y>=0&&x<m.w&&y<m.h)m.t[y][x]=c;};
const rect=(m,x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)setT(m,x+i,y+j,c);};
function building(m,x,y,w,roof,door){
  rect(m,x,y,w,2,roof);rect(m,x,y+2,w,2,'W');
  if(w>=4){setT(m,x+1,y+2,'w');setT(m,x+w-2,y+2,'w');}
  if(door!=null)setT(m,x+door,y+3,'D');
}
function scatter(m,seed,n,ch){const r=srng(seed);for(let i=0;i<n;i++){const x=Math.floor(r()*m.w),y=Math.floor(r()*m.h);if(m.t[y][x]==='g')m.t[y][x]=ch||'#';}}
function room(id,w,h,name,exitTo,ex,ey,o){
  const m=newMap(id,w,h,',',Object.assign({name,interior:true},o||{}));
  rect(m,0,0,w,2,'X');rect(m,0,0,1,h,'X');rect(m,w-1,0,1,h,'X');rect(m,0,h-1,w,1,'X');
  const dx=w>>1;setT(m,dx,h-1,'D');m.doors.push({x:dx,y:h-1,to:exitTo,tx:ex,ty:ey,dir:2});return m;
}
const door=(m,x,y,to,tx,ty,dir)=>m.doors.push({x,y,to,tx,ty,dir:dir||0});
function npc(m,x,y,o){
  const e=Object.assign({kind:'npc',x,y,ox:0,oy:0,dir:2,solid:true,col:'#6a7ac0',hair:'#3a2a20',mv:false},o);
  m.ents.push(e);return e;
}
const byStage=(...a)=>()=>a[Math.min(stage(),a.length-1)];
const lines=f=>function*(){yield say(...(typeof f==='function'?f():f));};
const sign=(m,x,y,f)=>npc(m,x,y,{kind:'sign',talk:lines(f)});
function pickup(m,x,y,key,item,n,label){
  return npc(m,x,y,{kind:'item',vis:()=>!F[key],talk:function*(){F[key]=1;G.bag[item]+=n;sfx(700,.12);yield say(`You found ${label}!`);}});
}
function trainer(m,x,y,dir,t,o){
  return npc(m,x,y,Object.assign({dir,sight:t.sight||4,trainer:t,talk:function*(e){yield* trainerFight(e,false);}},o||{}));
}
function clearUnder(m){for(const e of m.ents)if(m.t[e.y][e.x]==='#')m.t[e.y][e.x]='g';for(const tr of m.trig)for(const p of tr.at)if(m.t[p[1]][p[0]]==='#')m.t[p[1]][p[0]]='g';}
function centerRoom(id,name,exitTo,ex,ey){
  const m=room(id,10,8,name,exitTo,ex,ey);
  rect(m,2,3,6,1,'K');setT(m,8,2,'H');
  npc(m,4,3,{col:'#e88aa0',hair:'#e8d0d8',talk:centerTalk});
  npc(m,2,5,{col:'#8a9a6a',talk:lines(byStage(["A woman waits on the bench, knitting. Her needles stop when you sit nearby."],["The woman on the bench has moved to the far end. She doesn't look up."]))});
  return m;
}
function martRoom(id,name,exitTo,ex,ey,stock){
  const m=room(id,10,8,name,exitTo,ex,ey);
  rect(m,2,3,6,1,'K');rect(m,1,2,2,1,'b');rect(m,7,2,2,1,'b');
  npc(m,4,3,{col:'#c8a050',talk:function*(){yield say("Clerk: Welcome!");yield {t:'shop',stock};yield say("Clerk: Come again!");}});
  return m;
}
const STOCK_A=[{id:'cage',n:'Cage',p:80,d:'Closes around a Wild.'},{id:'salve',n:'Salve',p:60,d:'Restores 40 HP.'}];
const STOCK_B=[{id:'cage',n:'Cage',p:80,d:'Closes around a Wild.'},{id:'iron',n:'Iron Cage',p:220,d:'Holds much tighter. It hums.'},{id:'salve',n:'Salve',p:60,d:'Restores 40 HP.'}];

function buildMaps(){
  let m;
  // ---------- HOME ----------
  m=room('home',10,8,'Home','ashmere',7,18);
  rect(m,1,2,2,1,'B');setT(m,5,1,'M');rect(m,4,4,3,1,'T');rect(m,7,2,2,1,'K');
  m.look['5,1']=function*(){
    if(stage()<2)yield say("Your reflection looks back at you.","It blinks a moment after you do.","You decide you're tired.");
    else yield say("Your reflection is already looking at you.","It was looking before you turned around.");
    note('mirror',"My reflection blinks a little late. I think it's looking at something behind me.");
  };
  const plates=function*(){
    yield say("Three bowls. Three chairs. Three spoons.","Two of you live here.");
    note('plates',"Mother sets the table for three. There are only two of us. She says it's habit.");
  };
  for(const x of [4,5,6])m.look[x+',4']=plates;
  const bed=function*(){
    if(stage()<3)yield say("You slept well. You always do.","You never dream.");
    else yield say("You lift the mattress. The wood beneath is scored with tally marks.","Hundreds of them. Small, even, patient.","You put the mattress back down very carefully.");
  };
  m.look['1,2']=bed;m.look['2,2']=bed;
  npc(m,7,3,{col:'#a86a8a',hair:'#8a8a90',glove:'#f0d0b0',talk:motherTalk});
  m.trig.push({at:[[5,6]],when:()=>!F.mother1,run:motherTalk});
  // ---------- ASHMERE ----------
  m=newMap('ashmere',30,24,'g',{name:'Ashmere',bg:'grass'});
  rect(m,0,0,30,2,'#');rect(m,0,0,2,24,'#');rect(m,28,0,2,24,'#');rect(m,0,20,30,4,'~');
  scatter(m,11,45);scatter(m,5,30,'f');
  rect(m,14,0,2,20,'.');rect(m,11,9,8,5,'.');rect(m,7,9,5,2,'.');rect(m,23,8,1,3,'.');rect(m,18,10,6,1,'.');
  rect(m,7,18,15,1,'.');rect(m,14,20,2,3,'=');
  building(m,4,5,6,'R',3);building(m,19,4,8,'r',4);building(m,4,14,6,'q',3);building(m,19,14,5,'q',2);
  rect(m,4,2,3,2,'f');
  door(m,7,8,'centerA',5,6);door(m,23,7,'lab',6,7);door(m,7,17,'home',5,6);door(m,21,17,'martA',5,6);
  door(m,14,0,'route1',11,42);door(m,15,0,'route1',12,42);
  sign(m,13,3,["NORTH: Route 1 → Thornby, 2 km.","Tamers must register Wild captures with the Wardens. Do not travel after dark."]);
  sign(m,17,12,["NOTICES","LOST: one tabby cat, answers to Biscuit.","HOLLOW NIGHT, THORNBY, 3rd day. All welcome. Masks required.","WARDENS' LICENSE ceremony at the Professor's lab. Young Tamers, report this morning."]);
  npc(m,12,11,{col:'#e8a0a0',hair:'#6a4a2a',talk:function*(){
    yield say(...byStage(
      ["Pip: Hi! Are you gonna be a Tamer? Mum says Tamers are brave.","Pip: Funny. The sparrows always sing here. Except...","Pip: ...Except when you're around. Weird, huh?"],
      ["Pip: Is that your Wild? It's so shy! It's hiding behind your legs.","Pip: Mum says don't stare at you. She says you're not mean. You're just... not right.","Pip: What does 'not right' mean?"],
      ["Pip: Mum says I can't talk to you anymore.","Pip: I drew you! Look. ...Oh. I drew the shadow too. It came out bigger than you."])());
    note('pip',"Birds go quiet when I walk by. A little girl said it like a joke. It didn't sound like one.");
  }});
  npc(m,15,21,{col:'#6a8a9a',hat:'#caa050',hair:'#aaa',dir:2,talk:lines(byStage(
    ["Gorm: Fifty years on this pier. Fish bite for everyone.","Gorm: Except the last quarter hour. The whole cove's gone still. Not a ripple."],
    ["Gorm: Cove's been empty since you started coming round.","Gorm: Not blaming you, mind. Just... noting."]))});
  npc(m,9,12,{col:'#caa070',hair:'#5a3a2a',talk:lines(byStage(
    ["Marta: My Flitwing's been hiding in the cupboard since you walked by. It never does that.","Marta: Silly bird."],
    ["Marta: I'm not scared of you. I'm just checking my windows are locked.","Marta: I always check my windows."]))});
  npc(m,5,3,{kind:'obj',draw:(sx,sy)=>{ell(sx+16,sy+28,10,3,'rgba(0,0,0,.25)');g.fillStyle='#8a8a98';g.fillRect(sx+8,sy+8,16,20);ell(sx+16,sy+8,8,6,'#8a8a98');g.fillStyle='#6a6a78';g.fillRect(sx+12,sy+14,8,2);ell(sx+9,sy+30,3,2,'#f0a0b0');ell(sx+23,sy+30,3,2,'#f0e060');},
    talk:function*(){
      if(stage()<4)yield say("A small headstone. The name has weathered away: W——N.","'Beloved. Six winters.' Fresh flowers lie on it. They are from this morning.","You stand here longer than you meant to. Your chest aches in a place you didn't know could ache.");
      else yield say("WREN. Beloved daughter of Edda. Six winters.","You kneel. The stone is warm, as if something has been sleeping against it.");
      note('grave',"A child's grave in Ashmere. W——N. Six winters. I can't stop thinking about it.");
    }});
  // ---------- LAB ----------
  m=room('lab',12,9,'Warden Lab','ashmere',23,8);
  rect(m,1,2,3,1,'b');rect(m,8,2,3,1,'b');rect(m,3,4,6,1,'T');
  m.enter=function*(){if(!F.labIntro)yield* labIntro();};
  const cage=(x,sp)=>npc(m,x,4,{kind:'obj',draw:(sx,sy)=>{
    g.fillStyle='#3a3a4a';g.fillRect(sx+3,sy+2,26,26);
    if(!F.starter)drawMon(sp,sx+16,sy+14,22,{fear:true});
    g.strokeStyle='#caa050';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(sx+6+i*7,sy+2);g.lineTo(sx+6+i*7,sy+28);g.stroke();}
    g.strokeRect(sx+3,sy+2,26,26);},
    talk:lines(()=>F.starter?["An empty cage. The door is bent, as if it opened from the inside."]:["Alder: Patience. Let me finish."])});
  cage(4,'embit');cage(6,'dribb');cage(8,'sprout');
  npc(m,6,3,{col:'#e8e4d8',hair:'#8a8a98',glove:'#f0d0b0',talk:alderTalk,hat:null});
  npc(m,10,6,{kind:'mon',sp:'wardhound',size:38,fear:true,talk:function*(){
    yield say(...byStage(
      ["Marrow the hound presses itself flat against the wall. The whites of its eyes follow you around the room."],
      ["Marrow whines and tries to squeeze behind the shelves."],
      ["Marrow hasn't eaten since you walked in. Alder's bowl sits full and untouched."])());
    note('hound',"The Professor's old hound shakes whenever I'm in the room.");
  }});
  // ---------- CENTER / MART A ----------
  centerRoom('centerA','Ashmere Wild Center','ashmere',7,9);
  martRoom('martA','Ashmere Mart','ashmere',21,18,STOCK_A);
  // ---------- ROUTE 1 ----------
  m=newMap('route1',24,44,'g',{name:'Route 1',bg:'grass',enc:[
    {sp:'flitwing',lv:[3,5],w:30},{sp:'mossling',lv:[3,5],w:25},{sp:'puddlet',lv:[3,5],w:20},
    {sp:'zapkit',lv:[4,6],w:10},{sp:'cindrel',lv:[4,6],w:8},{sp:'dusklet',lv:[5,6],w:3}]});
  rect(m,0,0,24,1,'#');rect(m,0,43,24,1,'#');rect(m,0,0,2,44,'#');rect(m,22,0,2,44,'#');
  scatter(m,21,150);scatter(m,9,40,'f');
  rect(m,11,34,2,10,'.');rect(m,11,34,8,2,'.');rect(m,17,18,2,18,'.');rect(m,8,18,11,2,'.');rect(m,8,6,2,14,'.');rect(m,8,6,5,2,'.');rect(m,11,0,2,8,'.');
  rect(m,13,38,6,4,'G');rect(m,3,36,6,5,'G');rect(m,19,26,3,6,'G');rect(m,10,21,6,5,'G');rect(m,3,10,5,6,'G');rect(m,13,3,6,5,'G');rect(m,19,36,3,4,'~');
  door(m,11,0,'thornby',15,26);door(m,12,0,'thornby',16,26);door(m,11,43,'ashmere',14,1);door(m,12,43,'ashmere',15,1);
  sign(m,13,41,["ROUTE 1. Thornby, 2 km.","Mind the tall grass. Wilds nest there."]);
  sign(m,16,30,["WANTED: THE HOLLOW.","Not a Wild. Not a person. It wears the shape of one of us.","Wild creatures go still in its presence. It will say it is not hungry. Do not trust anyone who is never hungry.","If you see it, do not run. It prefers it when you run."]);
  sign(m,10,2,["THORNBY ahead. Hollow Night festival in progress. Masks encouraged."]);
  pickup(m,20,41,'i_r1a','cage',2,'2 Cages');pickup(m,5,20,'i_r1b','salve',1,'a Salve');pickup(m,20,10,'i_r1c','cage',1,'a Cage');
  trainer(m,15,28,1,{id:'tobin',name:'Tamer Tobin',sight:5,team:[{sp:'flitwing',lv:4},{sp:'flitwing',lv:5}],reward:80,
    pre:["Tobin: Hey! Eyes met, so we battle. That's the rule!"],post:["Tobin: My Flitwing wouldn't look at me during that. It kept looking at you."]});
  trainer(m,11,13,3,{id:'lyra',name:'Tamer Lyra',team:[{sp:'mossling',lv:5},{sp:'puddlet',lv:6}],reward:100,
    pre:["Lyra: Quick match? ...Why are all my Wilds backing up?"],post:["Lyra: Take care of yours. They look tired. Or scared. I can't tell which."]});
  npc(m,10,6,{id:'kes',col:'#d8a040',hair:'#2a2a3a',vis:()=>!F.kes1done,dir:2});
  m.trig.push({at:[[8,9],[9,9]],flag:'kes1',run:kesRoute1});
  // ---------- THORNBY ----------
  m=newMap('thornby',34,28,'g',{name:'Thornby',bg:'grass',tint:()=>F.festivalStart&&!F.festival?'rgba(80,20,40,.35)':(F.slept?null:'rgba(50,25,90,.28)')});
  rect(m,0,0,34,1,'#');rect(m,0,27,34,1,'#');rect(m,0,0,2,28,'#');rect(m,32,0,2,28,'#');
  scatter(m,33,60);scatter(m,7,40,'f');
  rect(m,9,12,14,6,'.');rect(m,15,0,2,28,'.');rect(m,11,7,1,3,'.');rect(m,6,10,20,1,'.');rect(m,20,6,1,5,'.');
  rect(m,7,21,10,1,'.');rect(m,16,21,9,1,'.');
  building(m,7,3,8,'r',4);building(m,22,6,6,'q',3);building(m,18,2,5,'q',2);building(m,4,17,6,'R',3);building(m,22,17,5,'R',2);
  building(m,26,12,4,'R',null);building(m,3,12,4,'q',null);
  for(const [x,y] of [[14,22],[17,22],[14,25],[17,25],[14,5],[17,5],[13,13],[18,13],[13,16],[18,16]])setT(m,x,y,'L');
  door(m,11,6,'gym',7,12);door(m,25,9,'inn',6,7);door(m,20,5,'mask',4,5);door(m,7,20,'centerB',5,6);door(m,24,20,'martB',5,6);
  door(m,15,27,'route1',11,1);door(m,16,27,'route1',12,1);door(m,15,0,'route2',12,40);door(m,16,0,'route2',13,40);
  m.trig.push({at:[[15,26],[16,26]],flag:'bell',run:bellScene});
  m.trig.push({at:[[15,22],[16,22]],flag:'dellMeet',run:dellScene});
  m.trig.push({at:[[11,7]],when:()=>F.maren&&!F.festival,flag:'festivalStart',run:festivalScene});
  npc(m,15,14,{kind:'obj',vis:()=>!F.burned,draw:(sx,sy)=>{
    ell(sx+16,sy+29,10,3,'rgba(0,0,0,.3)');g.fillStyle='#caa050';g.fillRect(sx+10,sy+14,12,14);g.fillRect(sx+4,sy+16,6,3);g.fillRect(sx+22,sy+16,6,3);
    g.fillStyle='#a88838';g.fillRect(sx+12,sy+24,3,4);g.fillRect(sx+17,sy+24,3,4);
    ell(sx+16,sy+9,7,7,'#caa050');g.fillStyle='#111';g.fillRect(sx+12,sy+7,3,3);g.fillRect(sx+18,sy+7,3,3);g.fillStyle='#4a3a28';g.fillRect(sx+3,sy+17,4,5);g.fillRect(sx+25,sy+17,4,5);},
    talk:function*(){
      yield say("A straw effigy of a child, tied to a post. Button eyes. A dark hole where the mouth should be.","Its hands are stitched into little mittens.","A placard reads: THE HOLLOW. IT WEARS A CHILD'S FACE.");
      if(stage()>=2)yield say("It's smaller than you expected. And stranger: someone has stitched its gloves exactly the way yours are stitched.");
      note('effigy',"The festival effigy of the Hollow looks like a child in mittens. Like me. Nobody else seems to notice.");
    }});
  npc(m,14,24,{col:'#6a6a7a',hat:'#8a8a98',talk:lines(["Rowan: Gate bell rang when you came through. Rusted rope, must be. Welcome to Thornby."])});
  npc(m,17,24,{col:'#6a6a7a',hat:'#8a8a98',dir:3,talk:lines(["Guard: First time that bell's rung in fifteen years. Rope must've caught the wind."])});
  npc(m,17,19,{col:'#5a9a5a',hair:'#4a3a2a',talk:lines(()=>F.maren?["Dell: You beat her! I mean, she let you. I mean, you earned it!"]:F.slept?["Dell: Warden Maren's in the gym. Good luck!"]:["Dell: Trial's at dawn. The inn's up the road, free for Tamers."])});
  npc(m,13,13,{mask:true,col:'#9a6a4a',hair:'#aaa',talk:lines(()=>F.festival?["Hobb: The fire took well. Thank you, Tamer."]:F.maren?["Hobb: Stay for the burning, Tamer. It's tradition."]:["Hobb: Hollow Night tomorrow! We burn the effigy. Keeps the Hollow's eyes off us another year.","Hobb: Fetch a mask from Maribel's. Everyone wears one. Everyone."])});
  npc(m,19,14,{mask:true,col:'#8a4a6a',talk:lines(byStage(
    ["Sarai: Masks so it can't recognise us. The old stories say the Hollow learns faces. Takes the ones it likes.","Sarai: ...Why are you looking at me like that?"],
    ["Sarai: I keep forgetting your face the second you leave. Isn't that strange?"]))});
  npc(m,12,16,{mask:true,col:'#4a6a8a',talk:lines(["Piet: Thirty years I've worn this mask and never felt watched through it.","Piet: I felt it just now. When you walked past. (He laughs. It doesn't help.)"])});
  npc(m,18,16,{mask:true,col:'#e8c0a0',hair:'#6a3a2a',talk:lines(["Lumi: The effigy has mittens like yours!","Lumi: Mum says that's rude to say."])});
  npc(m,9,15,{col:'#7a7a8a',hair:'#ddd',talk:function*(){
    yield say(...byStage(
      ["Baba: New Tamer? I can't see you, child. But I can hear hearts.","Baba: ...Odd. I can hear everyone's but yours."],
      ["Baba: I'm blind, love. But there's no heartbeat where you're standing. Just a waiting.","Baba: Don't look so frightened. Waiting is a kind of life."])());
    note('baba',"An old blind woman in Thornby says she can't hear my heartbeat.");
  }});
  npc(m,15,2,{col:'#6a6a7a',hat:'#8a8a98',vis:()=>!F.festival,talk:lines(()=>F.maren?["Guard: Gate stays shut till the effigy's burned. Festival rules."]:["Guard: Marsh road's closed until the Trial is done. Warden's orders."])});
  npc(m,16,2,{col:'#6a6a7a',hat:'#8a8a98',vis:()=>!F.festival,talk:lines(["Guard: Rules are rules, Tamer."])});
  pickup(m,5,24,'i_th1','salve',2,'2 Salves');
  // ---------- THORNBY interiors ----------
  centerRoom('centerB','Thornby Wild Center','thornby',7,21);
  martRoom('martB','Thornby Mart','thornby',24,21,STOCK_B);
  m=room('mask',8,7,"Maribel's Masks",'thornby',20,6);
  rect(m,1,2,2,1,'b');rect(m,5,2,2,1,'b');
  npc(m,4,4,{col:'#c88a6a',hair:'#5a3a2a',talk:maribelTalk});
  m=room('inn',12,9,'Thornby Inn','thornby',25,10);
  rect(m,2,3,4,1,'K');setT(m,6,1,'M');rect(m,8,3,2,1,'B');rect(m,8,5,2,1,'B');
  npc(m,3,3,{col:'#8a6a4a',hair:'#aaa',talk:odoTalk});
  m.look['6,1']=function*(){
    if(!F.slept)yield say("The mirror is cracked from corner to corner. Your reflection is split in three.","All three are looking at you.");
    else yield say("Your reflection is smiling.","You are not.");
    note('innmirror',"The mirror at the inn cracked the day I arrived. My reflection smiled at me. I wasn't smiling.");
  };
  for(const k of ['8,3','9,3','8,5','9,5'])m.look[k]=sleepScene;
  m=room('gym',14,14,'Warden Trial Hall','thornby',11,7);
  rect(m,6,2,2,11,'C');for(const [x,y] of [[3,4],[10,4],[3,8],[10,8]])setT(m,x,y,'P');
  m.enter=function*(){
    if(!F.slept){yield say("Dell: Trial's at dawn, Tamer. Rest first. The inn's up the road.");yield* goto('thornby',11,7,2);}
  };
  trainer(m,4,10,1,{id:'corvin',name:'Junior Corvin',team:[{sp:'flitwing',lv:8},{sp:'mossling',lv:9}],reward:150,
    pre:["Corvin: Maren says only the steady pass. I say prove it."],post:["Corvin: My Wilds kept staring at the door the whole fight. Like they wanted to leave."]},{col:'#4a6aa8'});
  trainer(m,9,6,3,{id:'ines',name:'Junior Ines',team:[{sp:'puddlet',lv:8},{sp:'zapkit',lv:9}],reward:160,
    pre:["Ines: Dell said you'd come. He also said not to stare at your hands."],post:["Ines: ...I stared. Sorry."]},{col:'#a84a6a'});
  npc(m,7,3,{col:'#c0392b',hair:'#2a2a2a',glove:'#d8c8a0',talk:marenTalk});
  // ---------- ROUTE 2 ----------
  m=newMap('route2',26,42,'~',{name:'Mirewood Fen',bg:'marsh',tint:()=>'rgba(150,200,190,.1)',enc:[
    {sp:'marshhop',lv:[10,13],w:28},{sp:'reedback',lv:[10,13],w:22},{sp:'mossling',lv:[9,12],w:15},
    {sp:'voltmink',lv:[11,14],w:15},{sp:'gloomjaw',lv:[12,14],w:8},{sp:'dusklet',lv:[10,13],w:8},{sp:'puddlet',lv:[9,12],w:4}]});
  rect(m,4,30,18,9,'m');rect(m,6,20,14,8,'m');rect(m,8,13,10,7,'g');rect(m,5,6,16,6,'m');rect(m,12,4,2,38,'=');
  building(m,10,0,6,'R',2);setT(m,13,3,'D');
  door(m,12,41,'thornby',15,1);door(m,13,41,'thornby',16,1);door(m,12,3,'tower1',6,12);door(m,13,3,'tower1',6,12);
  trainer(m,15,34,3,{id:'ysolde',name:'Tamer Ysolde',team:[{sp:'reedback',lv:12},{sp:'marshhop',lv:12}],reward:300,
    pre:["Ysolde: Quiet out here, huh? The reeds hush when you pass. They never hush for me."],post:["Ysolde: The frogs stopped croaking the second you stepped on the boardwalk. All of them. At once."]});
  trainer(m,10,24,1,{id:'brann',name:'Tamer Brann',team:[{sp:'voltmink',lv:13},{sp:'puddlet',lv:12},{sp:'mossling',lv:12}],reward:360,
    pre:["Brann: Everything went silent a mile back. Did you do that?"],post:["Brann: I'll fight anyone. I'd rather not fight whatever that was."]});
  npc(m,12,5,{col:'#4a6a4a',hat:'#8a8a98',dir:2,vis:()=>!F.haleDone,talk:haleTalk});
  npc(m,13,5,{col:'#4a6a4a',hat:'#8a8a98',dir:2,vis:()=>!F.haleDone,talk:haleTalk});
  npc(m,15,16,{kind:'obj',draw:(sx,sy)=>{
    ell(sx+16,sy+30,12,4,'rgba(0,0,0,.3)');g.strokeStyle='#8a8aa0';g.lineWidth=3;g.beginPath();g.moveTo(sx+13,sy+26);g.lineTo(sx+13,sy+34);g.moveTo(sx+19,sy+26);g.lineTo(sx+19,sy+34);g.stroke();
    ell(sx+16,sy+14,11,13,'#c8c8dc');ell(sx+16,sy+16,7,9,'#e8e8f4');
    g.strokeStyle='#c8c8dc';g.lineWidth=5;g.beginPath();g.moveTo(sx+19,sy+6);g.quadraticCurveTo(sx+30,sy-2,sx+24,sy-14);g.stroke();
    ell(sx+24,sy-15,5,4,'#e8e8f4');tri(sx+27,sy-16,sx+38,sy-13,sx+27,sy-12,'#e8a840');ell(sx+25,sy-16,1.5,1.5,'#111');},
    talk:lines(()=>F.heron?["The Elder Heron watches the water. It does not look at you. It has said what it needs to."]:["The Heron is waiting for you to come closer."])});
  m.trig.push({at:[[12,17],[13,17]],flag:'heronMet',run:heronScene});
  pickup(m,9,15,'i_r2a','cage',3,'3 Cages');pickup(m,16,14,'i_r2b','salve',2,'2 Salves');pickup(m,6,22,'i_r2c','iron',1,'an Iron Cage');
  // ---------- TOWER ----------
  m=room('tower1',12,14,'Lighthouse','route2',12,4);
  for(const [x,y] of [[2,4],[9,4],[2,9],[9,9]])setT(m,x,y,'P');
  setT(m,6,2,'D');door(m,6,2,'tower2',6,10);
  npc(m,6,3,{id:'kes',col:'#d8a040',hair:'#2a2a3a',vis:()=>!F.kesTower,talk:function*(){yield* kesTowerScene();}});
  m.trig.push({at:[[5,8],[6,8],[7,8]],flag:'kesScene',when:()=>!F.kesTower,run:kesTowerScene});
  m=room('tower2',12,12,'Lamp Room','tower1',6,3,{bg:'tower'});
  npc(m,6,2,{kind:'obj',draw:(sx,sy)=>{const a=.6+.4*Math.sin(S.t*2);ell(sx+16,sy+16,26,26,`rgba(255,220,140,${a*.25})`);g.fillStyle='#caa050';g.fillRect(sx+8,sy+8,16,22);ell(sx+16,sy+10,8,8,`rgba(255,230,160,${.6+a*.4})`);},talk:lines(["The great lamp. Its brass is warm. It hums at a pitch you feel in your teeth."])});
  npc(m,6,4,{col:'#e8e4d8',hair:'#8a8a98',talk:function*(){yield* finaleScene();},dir:2});
  npc(m,6,9,{col:'#a86a8a',hair:'#8a8a90',vis:()=>F.motherHere,talk:lines(["Edda: I'm here. I'm not going anywhere."])});
  m.trig.push({at:[[5,7],[6,7],[7,7]],flag:'finaleStart',when:()=>!F.finale,run:finaleScene});
  for(const k in MAPS)clearUnder(MAPS[k]);
}
