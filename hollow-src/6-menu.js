// ===== MENUS: pause menu, party, wildbook, bag, journal, shop, save =====
const SAVEKEY='hollowhunt_v1';
function saveGame(){try{G.x=P.x;G.y=P.y;G.dir=P.dir;localStorage.setItem(SAVEKEY,JSON.stringify(G));return true;}catch(e){return false;}}
function loadSave(){try{const s=localStorage.getItem(SAVEKEY);return s?JSON.parse(s):null;}catch(e){return null;}}

function openMenu(){S.menu={page:'main',sel:0,sub:null,scroll:0};sfx(440,.05);}
const MAINMENU=['PARTY','WILDBOOK','BAG','BOX','JOURNAL','SAVE','CLOSE'];

function updMenu(){
  const m=S.menu;
  switch(m.page){
    case 'main':
      if(isU())m.sel=(m.sel+MAINMENU.length-1)%MAINMENU.length;
      if(isD())m.sel=(m.sel+1)%MAINMENU.length;
      if(isB()||hit.has('m')){S.menu=null;break;}
      if(isA()){
        const o=MAINMENU[m.sel];sfx(520,.04);
        if(o==='CLOSE')S.menu=null;
        else if(o==='SAVE'){S.toast={text:saveGame()?'Game saved':'Save failed',t:2};}
        else S.menu={page:o.toLowerCase(),sel:0,sub:null,scroll:0,from:m.sel};
      }
      break;
    case 'party':updPartyMenu(m);break;
    case 'box':updBoxMenu(m);break;
    case 'wildbook':updDexMenu(m);break;
    case 'bag':updBagMenu(m);break;
    case 'journal':
      if(isU())m.scroll=Math.max(0,m.scroll-1);
      if(isD())m.scroll=Math.min(Math.max(0,G.notes.length-6),m.scroll+1);
      if(isB())back(m);
      break;
  }
}
function back(m){S.menu={page:'main',sel:m.from||0,sub:null,scroll:0};}

function updPartyMenu(m){
  if(m.sub==='summary'){if(isA()||isB())m.sub=null;return;}
  if(m.sub==='confirm'){
    if(isL()||isRt()||isU()||isD())m.yes=!m.yes;
    if(isB())m.sub=null;
    if(isA()){
      if(m.yes){const mon=G.party[m.sel];G.party.splice(m.sel,1);G.mercy++;G.spared++;m.sel=0;
        S.toast={text:`${mon.name} was released`,t:2.4};
        note('release',"I let one go. It didn't run. It stayed a moment, then it left, and I felt lighter and heavier at once.");}
      m.sub=null;
    }
    return;
  }
  if(m.sub==='act'){
    if(isU())m.act=(m.act+3)%4;if(isD())m.act=(m.act+1)%4;
    if(isB())m.sub=null;
    if(isA()){
      sfx(520,.04);
      if(m.act===0)m.sub='summary';
      else if(m.act===1){const mon=G.party.splice(m.sel,1)[0];G.party.unshift(mon);m.sel=0;m.sub=null;}
      else if(m.act===2){
        if(G.party.length<=1){S.toast={text:"It won't leave you",t:2.4};m.sub=null;note('stay',"I tried to release my last partner. It wouldn't go. It just stared at me.");}
        else{m.sub='confirm';m.yes=false;}
      }else m.sub=null;
    }
    return;
  }
  if(isU())m.sel=(m.sel+G.party.length-1)%G.party.length;
  if(isD())m.sel=(m.sel+1)%G.party.length;
  if(isB())back(m);
  if(isA()){m.sub='act';m.act=0;sfx(520,.04);}
}
function updBoxMenu(m){
  if(!G.box.length){if(isA()||isB())back(m);return;}
  if(isU())m.sel=(m.sel+G.box.length-1)%G.box.length;
  if(isD())m.sel=(m.sel+1)%G.box.length;
  if(isB())back(m);
  if(isA()){
    const mon=G.box.splice(m.sel,1)[0];
    if(G.party.length<6)G.party.push(mon);else{const out=G.party.pop();G.box.push(out);G.party.push(mon);}
    m.sel=0;sfx(520,.04);
  }
}
function updDexMenu(m){
  if(m.sub==='entry'){if(isA()||isB())m.sub=null;return;}
  if(isU())m.sel=(m.sel+DEXORDER.length-1)%DEXORDER.length;
  if(isD())m.sel=(m.sel+1)%DEXORDER.length;
  if(isB())back(m);
  if(isA()&&G.seen[DEXORDER[m.sel]])m.sub='entry';
}
function updBagMenu(m){
  const items=bagItems();
  if(m.sub==='pick'){
    if(isU())m.t=(m.t+G.party.length-1)%G.party.length;
    if(isD())m.t=(m.t+1)%G.party.length;
    if(isB())m.sub=null;
    if(isA()){const mon=G.party[m.t];
      if(mon.hp>0&&mon.hp<mon.mhp){G.bag.salve--;mon.hp=Math.min(mon.mhp,mon.hp+40);sfx(660,.08);if(G.bag.salve<=0)m.sub=null;}
      else sfx(120,.1);}
    return;
  }
  if(isU())m.sel=(m.sel+items.length-1)%items.length;
  if(isD())m.sel=(m.sel+1)%items.length;
  if(isB())back(m);
  if(isA()&&items[m.sel].id==='salve'&&G.bag.salve>0){m.sub='pick';m.t=0;}
}
const bagItems=()=>[
  {id:'cage',n:'Cage',c:G.bag.cage,d:'Closes around a Wild. It hums faintly when it holds something.'},
  {id:'iron',n:'Iron Cage',c:G.bag.iron,d:'Heavier. Holds tighter. You don\'t know why that comforts you.'},
  {id:'salve',n:'Salve',c:G.bag.salve,d:'Restores 40 HP to one Wild.'}
];

function drawMenu(){
  const m=S.menu;
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);
  if(m.page==='main'){
    box(560,30,210,MAINMENU.length*38+36);
    MAINMENU.forEach((o,i)=>{text(o,610,52+i*38,20,i===m.sel?'#e8c660':'#f0ead8');if(i===m.sel)text('▶',580,52+i*38,20,'#e8c660');});
    box(30,30,240,110);text(G.name,50,48,22,'#e8c660',undefined,true);
    text('¥'+G.money,50,80,18);text(`Caged: ${G.hunted}`,50,104,16,'#a8a0b8');
    return;
  }
  box(40,30,720,516);
  switch(m.page){
    case 'party':{
      text('PARTY',70,50,24,'#e8c660',undefined,true);
      G.party.forEach((mon,i)=>{
        const y=100+i*68;
        if(i===m.sel){g.fillStyle='rgba(232,198,96,.12)';g.fillRect(60,y-6,400,62);}
        drawMon(mon.sp,96,y+26,52,{});
        text(mon.name+'  Lv'+mon.lv,150,y,20,mon.hp<=0?'#7a7088':'#f0ead8');
        g.fillStyle='#1a1226';g.fillRect(150,y+28,200,10);g.fillStyle='#58b04a';g.fillRect(150,y+28,200*cl(mon.hp/mon.mhp,0,1),10);
        text(`${mon.hp}/${mon.mhp}`,360,y+24,14,'#a8a0b8');
      });
      if(m.sub==='act'){box(500,100,220,170);['SUMMARY','MOVE FIRST','RELEASE','BACK'].forEach((o,i)=>{text(o,550,124+i*34,18,i===m.act?'#e8c660':'#f0ead8');if(i===m.act)text('▶',522,124+i*34,18,'#e8c660');});}
      if(m.sub==='confirm'){box(200,230,400,130);text(`Release ${G.party[m.sel].name}?`,400,252,20,'#f0ead8','center');
        text('It will leave and not come back.',400,282,14,'#a8a0b8','center');
        text((m.yes?'▶ ':'  ')+'YES',300,318,20,m.yes?'#e8c660':'#f0ead8');text((!m.yes?'▶ ':'  ')+'NO',440,318,20,!m.yes?'#e8c660':'#f0ead8');}
      if(m.sub==='summary'){
        const mon=G.party[m.sel];box(120,70,560,440,'rgba(12,9,20,.98)');
        drawMon(mon.sp,260,230,200,{fear:mon.hp>0&&stage()>=2});
        text(mon.name+'  Lv'+mon.lv,400,100,24,'#e8c660',undefined,true);text(SP[mon.sp].type.toUpperCase(),400,134,16,TCOL[SP[mon.sp].type]);
        text(`HP  ${mon.hp}/${mon.mhp}`,400,164,16);text(`ATK ${mon.atk}   DEF ${mon.def}   SPD ${mon.spd}`,400,188,16);
        mon.moves.forEach((k,i)=>{text(MV[k].name,400,224+i*26,16);text(MV[k].pow?'PWR '+MV[k].pow:'-',600,224+i*26,14,'#a8a0b8');});
        const d=SP[mon.sp].dex[stage()>=2?1:0];
        wrap(d,500,FONT(16)).forEach((ln,i)=>text(ln,150,360+i*24,16,'#d8d0e8'));
      }
      break;}
    case 'box':
      text('CAGE STORAGE',70,50,24,'#e8c660',undefined,true);
      if(!G.box.length)text('Empty. Press Z to go back.',70,100,18,'#a8a0b8');
      G.box.forEach((mon,i)=>{text((i===m.sel?'▶ ':'  ')+mon.name+'  Lv'+mon.lv,70,100+i*30,18,i===m.sel?'#e8c660':'#f0ead8');});
      if(G.box.length)text('Z: bring into party',70,500,14,'#a8a0b8');
      break;
    case 'wildbook':{
      text('WILDBOOK',70,50,24,'#e8c660',undefined,true);
      const per=14,top=Math.max(0,Math.min(m.sel-6,DEXORDER.length-per));
      DEXORDER.slice(top,top+per).forEach((id,j)=>{const i=top+j,y=96+j*30,sn=G.seen[id],cg=G.caught[id];
        text(`${(i+1+'').padStart(3,'0')}  ${sn?SP[id].name:'??????'}`,90,y,18,i===m.sel?'#e8c660':sn?'#f0ead8':'#6a6078');
        if(i===m.sel)text('▶',68,y,18,'#e8c660');
        if(cg){g.fillStyle='#e8c660';g.fillRect(290,y+5,10,10);}});
      text(`Seen ${Object.keys(G.seen).length}  Caged ${Object.keys(G.caught).length}`,70,510,14,'#a8a0b8');
      if(F.finale)text('#000  ???  —  ENTRY UPDATED',420,510,14,'#d83a3a');
      if(m.sub==='entry'){
        const id=DEXORDER[m.sel];box(120,70,560,440,'rgba(12,9,20,.98)');
        drawMon(id,260,230,200,{fear:stage()>=2});
        text(SP[id].name,400,100,24,'#e8c660',undefined,true);text(SP[id].type.toUpperCase(),400,134,16,TCOL[SP[id].type]);
        wrap(SP[id].dex[stage()>=2?1:0],500,FONT(18)).forEach((ln,i)=>text(ln,150,360+i*26,18,'#d8d0e8'));
      }
      break;}
    case 'bag':{
      text('BAG',70,50,24,'#e8c660',undefined,true);
      const items=bagItems();
      items.forEach((it,i)=>{text((i===m.sel?'▶ ':'  ')+it.n+'  x'+it.c,70,100+i*34,20,i===m.sel?'#e8c660':'#f0ead8');});
      text(items[m.sel].d,70,230,16,'#d8d0e8');
      if(m.sub==='pick'){box(380,90,340,360);G.party.forEach((mon,i)=>{text((i===m.t?'▶ ':'  ')+mon.name+'  '+mon.hp+'/'+mon.mhp,404,118+i*40,18,i===m.t?'#e8c660':'#f0ead8');});}
      break;}
    case 'journal':{
      text('JOURNAL',70,50,24,'#e8c660',undefined,true);
      text(`${G.notes.length} entries — things you noticed`,70,84,14,'#a8a0b8');
      if(!G.notes.length)text('Nothing yet.',70,120,18,'#6a6078');
      let y=116;
      G.notes.slice(m.scroll,m.scroll+6).forEach(n=>{wrap('• '+n.t,640,FONT(17)).forEach(ln=>{text(ln,70,y,17,'#d8d0e8');y+=24;});y+=12;});
      break;}
  }
}

// ----- shop -----
function initShop(c){c.sel=0;c.msg='';}
function shopItems(c){return c.stock;}
function updShop(dt,c){
  if(isU())c.sel=(c.sel+c.stock.length-1)%c.stock.length;
  if(isD())c.sel=(c.sel+1)%c.stock.length;
  if(isB()){advance();return;}
  if(isA()){
    const it=c.stock[c.sel];
    if(G.money>=it.p){G.money-=it.p;G.bag[it.id]++;c.msg=`Bought ${it.n}.`;sfx(660,.08);}else{c.msg="Not enough ¥.";sfx(120,.1);}
  }
}
function drawShop(c){
  box(40,40,460,300);text('SHOP',70,58,24,'#e8c660',undefined,true);
  c.stock.forEach((it,i)=>{text((i===c.sel?'▶ ':'  ')+it.n,70,110+i*36,20,i===c.sel?'#e8c660':'#f0ead8');text('¥'+it.p,400,110+i*36,20,'#e8c660','right');text('(have '+G.bag[it.id]+')',420,114+i*36,13,'#a8a0b8');});
  text(c.stock[c.sel].d,70,260,15,'#d8d0e8');
  text(c.msg,70,296,16,'#9fe0a0');
  box(520,40,240,70);text('¥'+G.money,640,64,24,'#e8c660','center');
  box(24,420,752,140);text('Z: buy    X: leave',48,440,18);
}
