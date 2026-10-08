// ===== DATA: types, moves, species =====
const TCOL={plain:'#a8a090',flame:'#e8602c',tide:'#3a8fd8',bloom:'#58b04a',spark:'#e8c820',gloom:'#8a5ac0'};
const EFFT={flame:{bloom:2,tide:.5,flame:.5},tide:{flame:2,bloom:.5,tide:.5},bloom:{tide:2,flame:.5,bloom:.5},
  spark:{tide:2,bloom:.5,spark:.5},gloom:{plain:2,gloom:.5}};
const eff=(a,d)=>(EFFT[a]&&EFFT[a][d])||1;

const MVraw={
  tackle:['Tackle','plain',40,100],scratch:['Scratch','plain',40,100],peck:['Quick Peck','plain',35,100],
  slam:['Body Slam','plain',65,95],growl:['Growl','plain',0,100,'atkdown'],brace:['Brace','plain',0,100,'defup'],mend:['Mend','plain',0,100,'heal'],
  ember:['Ember','flame',45,100],flamefang:['Flame Fang','flame',65,95],inferno:['Inferno','flame',90,85],
  bubble:['Bubble','tide',45,100],tidalslap:['Tidal Slap','tide',65,95],surge:['Surge','tide',90,85],
  vine:['Vine Lash','bloom',45,100],thorn:['Thorn Barrage','bloom',65,95],bloomburst:['Bloom Burst','bloom',90,85],
  spark:['Spark','spark',45,100],thunderfang:['Thunder Fang','spark',65,95],overload:['Overload','spark',90,85],
  shade:['Shade Bite','gloom',50,100],nightmaw:['Night Maw','gloom',75,90],hollowcry:['Hollow Cry','gloom',95,85]
};
const MV={};for(const k in MVraw){const a=MVraw[k];MV[k]={id:k,name:a[0],type:a[1],pow:a[2],acc:a[3],eff:a[4]};}

// name,type,[hp,atk,def,spd],exp,catch,learn,look,dex[early,late]
const SP={};
function sp(id,name,type,b,exp,ct,learn,look,dex){SP[id]={id,name,type,b,exp,catch:ct,learn,look,dex};}
sp('embit','Embit','flame',[44,52,43,56],60,.4,[[1,'scratch'],[1,'growl'],[5,'ember'],[12,'flamefang'],[20,'inferno']],
  {shape:'quad',c1:'#e8793a',c2:'#f8d890',feat:'flame'},
  ['A small fox with a flame at its tail. Warm to the touch and loyal to its Tamer.','Its tail gutters whenever you come near. It keeps one eye on the door. It has never once looked at you directly.']);
sp('dribb','Dribb','tide',[48,48,50,48],60,.4,[[1,'tackle'],[1,'growl'],[5,'bubble'],[12,'tidalslap'],[20,'surge']],
  {shape:'blob',c1:'#4a9ae0',c2:'#bfe4ff',feat:'drop'},
  ['Slippery and playful. Loves puddles and praise.','It hides under the water when you pass. It surfaces only after you have gone.']);
sp('sprout','Sprout','bloom',[50,46,52,42],60,.4,[[1,'tackle'],[1,'brace'],[5,'vine'],[12,'thorn'],[20,'bloomburst']],
  {shape:'quad',c1:'#7ac050',c2:'#d8f0a0',feat:'leaf'},
  ['A bulb-backed grazer that photosynthesises while it naps.','Its leaves curl when you stand close. The Wardens call it Hollow-wilt.']);
sp('flitwing','Flitwing','plain',[40,45,38,62],50,.6,[[1,'peck'],[1,'growl'],[8,'tackle'],[15,'slam']],
  {shape:'bird',c1:'#b89c78',c2:'#f0e4cc'},
  ['A common sky-messenger. Sings at dawn.','Songbirds fall silent within ten paces of the Hollow.']);
sp('mossling','Mossling','bloom',[55,38,50,28],50,.6,[[1,'tackle'],[4,'vine'],[9,'brace'],[16,'thorn']],
  {shape:'blob',c1:'#5a8a40',c2:'#9cc870',feat:'leaf'},
  ['A gentle blob that carpets old stones.','Mosslings pile up in your path and refuse to move. Some call it surrender. Some call it prayer.']);
sp('puddlet','Puddlet','tide',[44,42,40,50],50,.6,[[1,'bubble'],[1,'tackle'],[9,'brace'],[14,'tidalslap']],
  {shape:'frog',c1:'#4e8ad0',c2:'#cfe6ff'},
  ['A rain-loving frog. Its croak predicts storms.','Near you it croaks a single note, over and over. A warning.']);
sp('zapkit','Zapkit','spark',[38,50,36,64],55,.4,[[1,'tackle'],[3,'spark'],[10,'growl'],[15,'thunderfang']],
  {shape:'quad',c1:'#e8d040',c2:'#fff4a0',feat:'bolt'},
  ['A static-furred kit. Zaps when startled.','Its fur stands on end around you, though there is no static in the air.']);
sp('cindrel','Cindrel','flame',[42,54,38,58],55,.4,[[1,'scratch'],[4,'ember'],[13,'flamefang']],
  {shape:'quad',c1:'#c04830',c2:'#f0a060',feat:'flame'},
  ['A coal-feathered pup. Fears nothing.','Fears one thing.']);
sp('dusklet','Dusklet','gloom',[40,48,40,66],65,.25,[[1,'peck'],[3,'shade'],[10,'growl'],[16,'nightmaw']],
  {shape:'moth',c1:'#5a4a88',c2:'#a890d8'},
  ['A night moth drawn to lanterns.','It is not drawn to lanterns. It is drawn to you. It remembers you.']);
sp('fennick','Fennick','flame',[50,58,48,60],70,.2,[[1,'scratch'],[1,'ember'],[8,'mend'],[10,'flamefang'],[18,'inferno']],
  {shape:'quad',c1:'#d8602a',c2:'#fff0d0',feat:'flame'},
  ['A bright-eared fox that partners with Wardens.','Maren\'s partner sleeps beside the door, in case it must run.']);
sp('thornlet','Thornlet','bloom',[52,56,52,40],65,.3,[[1,'tackle'],[1,'vine'],[8,'brace'],[10,'thorn'],[18,'bloomburst']],
  {shape:'quad',c1:'#3f8a3c',c2:'#bce08a',feat:'thorn'},
  ['A thorny little grazer. Prickly with strangers.','Its thorns lie flat around you. Submission, or exhaustion.']);
sp('marshhop','Marshhop','tide',[58,54,52,45],60,.5,[[1,'bubble'],[1,'slam'],[10,'brace'],[15,'tidalslap'],[20,'surge']],
  {shape:'frog',c1:'#3f9a8a',c2:'#d0f0e0'},
  ['A big-mouthed frog of the fen. Swallows lanterns whole.','It dives and does not come up while you are on the boardwalk.']);
sp('reedback','Reedback','tide',[52,50,48,56],60,.45,[[1,'bubble'],[1,'vine'],[11,'tidalslap'],[16,'mend']],
  {shape:'serpent',c1:'#4a8a70',c2:'#c8e8b0',feat:'leaf'},
  ['A river serpent that hides in the reeds.','The reeds lean away from you. So does it.']);
sp('voltmink','Voltmink','spark',[48,56,44,70],65,.35,[[1,'spark'],[1,'tackle'],[9,'growl'],[12,'thunderfang'],[20,'overload']],
  {shape:'quad',c1:'#5a5ad8',c2:'#e8e8ff',feat:'bolt'},
  ['A fast, crackling hunter of the marsh.','It hunts everything in the fen. It does not hunt you.']);
sp('gloomjaw','Gloomjaw','gloom',[62,66,52,50],80,.15,[[1,'shade'],[1,'growl'],[12,'nightmaw'],[20,'hollowcry']],
  {shape:'quad',c1:'#3a2a58',c2:'#9a7ac8',feat:'horn'},
  ['A fear-feeding beast of the deep fen.','It does not bow to the Wardens. It bows to something else.']);
sp('wardhound','Wardhound','plain',[64,60,60,58],75,.1,[[1,'tackle'],[1,'growl'],[8,'slam'],[14,'brace'],[20,'nightmaw']],
  {shape:'quad',c1:'#8a8a96',c2:'#e0e0e8',feat:'horn'},
  ['A loyal guardian bred by the Wardens.','Trained to hunt the Hollow. It trembles when it finds one.']);
sp('elderhart','Elderhart','gloom',[70,64,64,56],90,.05,[[1,'shade'],[1,'slam'],[14,'nightmaw'],[18,'mend'],[22,'hollowcry']],
  {shape:'quad',c1:'#2a2a3a',c2:'#d8c8a8',feat:'horn'},
  ['An ancient antlered Wild. Rarely seen.','It knew you before you had a face.']);
const DEXORDER=Object.keys(SP);

// ----- mons -----
const need=L=>Math.floor(.6*L*L*L);
function calc(m){
  const b=SP[m.sp].b,L=m.lv,old=m.mhp||0;
  m.mhp=Math.floor(2*b[0]*L/100)+L+10;
  m.atk=Math.floor(2*b[1]*L/100)+5;m.def=Math.floor(2*b[2]*L/100)+5;m.spd=Math.floor(2*b[3]*L/100)+5;
  return m.mhp-old;
}
function mkMon(id,lv){
  const m={sp:id,name:SP[id].name,lv,exp:need(lv),mhp:0,hp:0,moves:[]};
  calc(m);m.hp=m.mhp;
  for(const [l,mv] of SP[id].learn)if(l<=lv&&!m.moves.includes(mv))m.moves.push(mv);
  while(m.moves.length>4)m.moves.shift();
  m.st={atk:0,def:0};return m;
}
function gainExp(m,amt){
  const out=[];m.exp+=amt;
  while(m.lv<50&&m.exp>=need(m.lv+1)){
    m.lv++;const d=calc(m);m.hp=Math.min(m.mhp,m.hp+d);
    out.push(`${m.name} grew to Lv.${m.lv}!`);
    for(const [l,mv] of SP[m.sp].learn)if(l===m.lv&&!m.moves.includes(mv)){
      if(m.moves.length>=4){const f=m.moves.shift();out.push(`${m.name} forgot ${MV[f].name}...`);}
      m.moves.push(mv);out.push(`${m.name} learned ${MV[mv].name}!`);
    }
  }
  return out;
}
const stg=s=>s>=0?(2+s)/2:2/(2-s);
function calcDmg(a,d,mv){
  if(!mv.pow)return 0;
  const A=a.atk*stg(a.st.atk),D=d.def*stg(d.st.def);
  let dm=((2*a.lv/5+2)*mv.pow*A/D)/50+2;
  dm*=(SP[a.sp].type===mv.type?1.3:1)*eff(mv.type,SP[d.sp].type)*R(.85,1);
  return Math.max(1,Math.floor(dm));
}
const healAll=()=>{for(const m of [...G.party,...G.box]){m.hp=m.mhp;}};

// ----- journal / flavour lines -----
const WHISPERS=[
  [],
  ['...is it hungry?','the birds went quiet again.','the grass leans away from you.'],
  ['you remember the taste.','they can hear you coming.','you never sleep. you only close your eyes.'],
  ['you are not who they say you are.','count the cages. count them.','you have been here before.'],
  ['it was never a game.','you already know your name.','hungry. hungry. hungry.'],
  ['go up the stairs.','it is almost over.','you can stop pretending.']
];
const FEAR=[
  [],
  ['The wild {n} is trembling. It does not run.','The wild {n} goes very still.'],
  ['The wild {n} will not look at you.','The wild {n} is shaking so hard it can barely stand.','Every bird nearby has gone quiet.'],
  ['The wild {n} is staring at your hands.','The wild {n} lowers itself to the ground, as if already caged.','It is not afraid of the Cage. It is afraid of you.'],
  ['The wild {n} bows its head.','The wild {n} whispers something you almost understand.'],
  ['The wild {n} bows its head. It has been waiting for you.']
];
