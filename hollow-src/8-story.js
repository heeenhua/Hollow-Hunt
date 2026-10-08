// ===== STORY SCRIPTS =====
const COUNTER={embit:'dribb',dribb:'sprout',sprout:'embit'};

function* trainerFight(e,spotted){
  const T=e.trainer;
  if(F['t_'+T.id]){yield say(...T.post);return;}
  if(spotted){yield excl(e);yield approach(e);}
  yield say(...T.pre);
  const r=yield* doBattle({kind:'trainer',team:T.team,trainer:T,bg:M.bg});
  if(r==='lose'){yield* blackout();return;}
  F['t_'+T.id]=1;G.money+=T.reward;
  yield say(...T.post,`You received ¥${T.reward}.`);
}

function* centerTalk(){
  yield say(...(stage()<2
    ?["Willa: Welcome! Let me take a look at your Wilds.","Willa: ...All patched up. They're so quiet, though. Wilds usually chatter."]
    :["Willa: I'll take them. ...They're fine. They just don't want to go back to you. Isn't that odd?","Willa: Never mind me. Rest well."]));
  healAll();G.lastHeal={map:M.id,x:P.x,y:P.y};
  if(stage()>=2)note('willa',"The nurse says my Wilds are fine, they just don't want to come back to me.");
}

// ----- Ashmere -----
function* motherTalk(){
  if(!F.mother1){
    F.mother1=1;
    yield say("Mother: There you are. Sit, sit. Eat something.",
      "You sit in your usual chair. The stew steams, and smells of nothing at all.",
      "You push it around the bowl. She pretends not to watch.",
      "Mother: Not hungry? Hm. You never are, in the mornings. You always did prefer your meals outdoors.",
      "Mother: Today's the day, isn't it? Professor Alder's been by twice.",
      "She reaches to straighten your collar, and stops, her hand hovering an inch from your neck. She turns it into a wave.",
      "Mother: Your father would be so proud. Here: Cages, a little Salve, some coin for the road.",
      "Mother: And dear? Keep your gloves on. Please. People... ask questions.");
    G.bag.cage+=5;G.bag.salve+=3;G.money+=300;
    yield say("You received 5 Cages, 3 Salves and ¥300.");
    note('gloves',"Mother made me promise to keep my gloves on. She never touches me. She hovers.");
    return;
  }
  const s=stage();
  if(s===0)yield say("Mother: Go on. Alder's waiting. I'll be here.");
  else if(s===1)yield say("Mother: Be home before dark, dear.","Mother: ...Or don't. I'll leave the window open, as I always do.");
  else if(s===2)yield say("Mother: You're back! I...","Mother: You were gone four days, you know. I left the window open. Like always.");
  else if(s===3){
    yield say("Mother: They told me about the festival. The burning.","Mother: Did you light it?");
    yield say(F.torch?"Mother: ...I see.":"Mother: Good. Good.");
  }else if(s===4)yield say("Mother: You've been to the fen. You smell like rain.","Mother: Go to the Lighthouse, dear. Alder will tell you what he thinks you are.","Mother: I'll tell you what I know you are, when you come home.");
  else yield say("Mother: Go on. I'll be here. I'm always here.");
}
function* alderTalk(){
  const s=stage();
  if(s<=1)yield say("Alder: Thornby is north. Mind the path.","Alder: And do keep your gloves on. For the cold.");
  else if(s<4)yield say("Alder: Already back? ...No. Of course not. Carry on.");
  else yield say("Alder: ...The Lighthouse, then. I'll be there before you.");
}
function* labIntro(){
  F.labIntro=1;
  yield walkTo(P,6,5);
  yield say("Alder: There you are. I'd begun to think you'd sleep through your own beginning.",
    "He stands on the far side of the long table, and keeps the table between you. In the corner, the old hound has pressed itself flat against the wall.",
    "Alder: Today the Wardens open the License to Ashmere's young. You will hunt Wilds. Cage them. Learn them. Fill the Wildbook.",
    "Alder: A Warden's work in miniature: keep the Wilds from the towns, and the towns from the Wilds.",
    "Alder: And keep an eye out for the Hollow, of course. Everyone does.",
    "He laughs. It doesn't land.");
  const kes=npc(M,6,8,{id:'kes',col:'#d8a040',hair:'#2a2a3a',dir:0});
  yield walkTo(kes,7,6);
  yield say("Kes: Sorry! Sorry, I'm here! Did I miss it?",
    "Kes: Oh. Hey. You're already here. You're always already here.",
    "Kes: ...That sounded weird. Forget it.");
  const c=yield ask("Three Wilds came from the fen this morning, quite willingly. Choose your partner.",["Embit (flame)","Dribb (tide)","Sprout (bloom)"]);
  const pick=['embit','dribb','sprout'][c],kp=COUNTER[pick];
  G.party.push(mkMon(pick,5));F.starter=pick;G.seen[pick]=1;G.caught[pick]=1;
  yield say(`The cage door opens on its own. ${SP[pick].name} doesn't bound out. It crawls, belly low, eyes on the floor.`,
    "It keeps as far from you as the room allows... but it comes. It sits at your heel, trembling.",
    "Alder: Remarkable. They always bow to something strong.");
  note('starter',"My first partner shakes whenever I look at it. But it stays close, like it's more afraid of leaving.");
  yield say(`Kes: Ha! Then I'll take ${SP[kp].name}. It beats yours. Come on, first battle! Right here!`);
  const r=yield* doBattle({kind:'trainer',team:[{sp:kp,lv:5}],trainer:{name:'Kes'},bg:'indoor'});
  if(r==='lose')healAll();
  yield say("Kes: Whoa. Your Wild didn't dodge once. It just took it. Like it didn't want to run.",
    "Kes: Hey, why the gloves? It's the middle of summer.");
  const q=yield ask("What do you tell him?",["Cold hands.","A rash. It's nothing.","..."]);
  F.lies=q<2?1:0;
  yield say(["Kes: Cold hands. Right. You do always run cold. ...I think.","Kes: Gross. Okay.","Kes: ...Okay. Weird, but okay."][q],
    "Kes: I've known you forever. Since... the festival? No. The fen. No, wait. Huh.",
    "Kes: Doesn't matter! See you in Thornby!");
  yield walkTo(kes,6,8);
  M.ents.splice(M.ents.indexOf(kes),1);
  note('kes',"Kes says he's known me forever. He can't remember how we met. Neither can I.");
  yield say("Alder: This is the Wildbook. Fill it. Fill it all.",
    "He says it the way someone says a prayer they no longer believe in.",
    "Alder: Take the north road to Thornby. Warden Maren runs the Trial there. Earn her Seal.",
    "Alder: Stay on the path. If anything out there frightens you, remember: it is almost certainly more afraid of you.",
    "The amulet at his throat clicks softly against his collar.");
}

// ----- Route 1 -----
function* kesRoute1(){
  const kes=M.ents.find(e=>e.id==='kes');
  yield excl(kes);yield approach(kes);
  yield say("Kes: Hey! Over here! I've caught three already. Look!",
    "Kes: ...Okay, two. One got away. But it LOOKED at me first, so that counts.",
    "Kes: Dad says the Wardens are meeting at the Lighthouse. They think the Hollow is close. Everyone's skittish.",
    "Kes: You ever think about it? What it would be like, being the only one of something?",
    "Kes: ...Never mind. Race you to Thornby! But first, battle!");
  const r=yield* doBattle({kind:'trainer',team:[{sp:COUNTER[F.starter],lv:7},{sp:'flitwing',lv:6}],trainer:{name:'Kes'},bg:'grass'});
  if(r==='lose'){healAll();yield say("Kes: Whoa, are you okay? Here, I've got a spare Salve.");G.bag.salve++;}
  else{G.money+=200;yield say("Kes: You're getting scary good, you know that? Ha. Scary. Good.","You received ¥200.");}
  yield say("Kes: I'm running ahead. Don't let the tall grass get you!");
  yield walkTo(kes,11,1);
  F.kes1done=1;
}

// ----- Thornby -----
function* bellScene(){
  yield shake(400);
  yield say("A bell tolls from the gate tower. Slow. Heavy. Everyone in the square turns to look.",
    "The guard tugs at the rope, then stares at his own hands.",
    "Rowan: Huh. That's the Warden's Bell. It rings when... no. No, that's not it. It's rusted. It must be rusted.",
    "Rowan: Welcome to Thornby, Tamer.",
    "Several villagers glance at you, and then very carefully at their feet.");
  note('bell',"A Warden's Bell rang when I walked into Thornby. The guard said it must be rusted.");
}
function* dellScene(){
  yield say("Dell: Tamer? Are you the one from Ashmere? I'm Warden Maren's apprentice.",
    "Dell: Maren's out in the fen until dawn. The Trial is tomorrow morning. Tomorrow night is Hollow Night, the festival.",
    "Dell: The inn's up the road. It's free for Tamers. And Maribel's, by the north-east gate, has masks. Everyone wears one.",
    "Dell: ...You don't have to. I mean, you should. I mean, you do you.");
}
function* maribelTalk(){
  if(!G.mask){
    yield say("Maribel: A Tamer! And no mask. Everyone wears one for the festival. Everyone.",
      "She turns one over in her hands: white, blank, two narrow eye slits.",
      "Maribel: This one's yours. ...Especially yours.");
    const c=yield ask("Wear the mask?",["Put it on","Not now"]);
    if(c===0){
      G.mask=true;
      yield say("You put it on. The whole room breathes out.","Maribel: There. Now you look like one of us.","Maribel: ...Don't take it off, will you? Not tonight.");
      note('mask',"When I put on the mask, everyone in the room relaxed. As if my face was the problem.");
    }else yield say("Maribel: It'll be here. It always is.");
  }else yield say("Maribel: It suits you. Better than your face did.","Maribel: I'm sorry. That came out wrong.");
}
function* odoTalk(){
  yield say("Odo: Room's free for Tamers. Take any bed.","Odo: Don't mind the mirror. Cracked this morning. Since you walked in, actually. Funny.");
  yield* sleepScene();
}
function* sleepScene(){
  if(F.slept){
    yield fade(1,500);healAll();yield wait(500);yield fade(0,500);
    yield say("You rest. The room is very quiet.");return;
  }
  const c=yield ask("Rest for the night?",["Sleep","Not yet"]);
  if(c===1)return;
  yield fade(1,800);
  yield cut("Tall grass. The world is enormous.",
    "You are low to the ground. Your breath is fog. You are so, so hungry.",
    "Something small in the grass. Soft. Warm. Shaking.",
    "It looks at you. It knows.",
    "It tasted like fear and honey.",
    "Above you, a human hand lowers a lantern. A voice, very quiet:",
    "'Shhh. There you are. Come home.'");
  healAll();F.slept=1;
  yield wait(400);yield fade(0,800);
  yield say("Morning. Sun through the shutters.","Your jaw aches. There is something caught between your teeth.","You decide not to look at what it is.");
  note('dream',"I dreamed I was the one hunting in the grass. I woke with something in my teeth.");
}
function* marenTalk(){
  if(F.maren){yield say("Maren: The Lighthouse, Tamer. Council meets soon. Go as a Tamer.");return;}
  if(!F.t_corvin||!F.t_ines){yield say("Maren: Two juniors stand between you and me. That's how the Trial works. Go on.");return;}
  yield say("Maren: So. The Tamer from Ashmere.",
    "She studies you the way one studies a river before crossing.",
    "Maren: The Trial exists for a reason, and it isn't sport. Wardens test Tamers because Tamers are who stand between the towns and the Hollow.",
    "Maren: Show me you hold the cage. Not the other way around.");
  const r=yield* doBattle({kind:'trainer',team:[{sp:'thornlet',lv:10},{sp:'fennick',lv:11},{sp:'voltmink',lv:12}],trainer:{name:'Warden Maren'},bg:'indoor'});
  if(r==='lose'){yield* blackout();return;}
  F.maren=1;G.money+=600;
  yield say("Maren: ...Well fought.",
    "Maren: Give me your hand. The Seal passes from my hand to yours.",
    "She takes your gloved hand. Her fingers close around it, and she goes very still.",
    "Maren: Cold. Like river stone.",
    "Maren: How long have you been wearing these gloves?",
    "You don't answer. She lets go.",
    "Maren: I've seen that mark on your wrist before. In the old Warden books. ...No. Never mind. I'm tired.",
    "You received the Ember Seal and ¥600.",
    "Maren: Tonight is Hollow Night. Stay for the burning. Tomorrow the marsh road opens.",
    "Maren: And Tamer? Whatever you decide to be, decide it before the Council decides for you.");
  note('maren',"Maren held my hand and said it was cold as river stone. She looked frightened. Then she gave me a badge anyway.");
}
function* festivalScene(){
  yield fade(1,500);setMap('thornby',15,16,0);
  M.ents.push({kind:'npc',id:'kes',x:18,y:16,ox:0,oy:0,dir:3,solid:true,col:'#d8a040',hair:'#2a2a3a',mask:true,mv:false});
  yield fade(0,700);
  yield say("Dusk. Lanterns bloom along the avenue. The whole town has gathered in the plaza, every face behind a mask.",
    "Every face but, perhaps, yours.",
    "Hobb: Tamer! You've done Thornby proud. It's tradition: the Trial's victor lights the effigy.");
  const c=yield ask("Hobb holds out a torch.",["Take the torch","Decline"]);
  if(c===0){
    F.torch=1;
    yield say("The torch is heavier than it looks. The straw child stares up at you with button eyes.",
      "You hold the flame to its mittened hands.");
  }else{
    yield say("Hobb: No matter. Your friend will do it.",
      "Kes takes the torch. His hand is steady. His eyes are not.");
  }
  yield shake(900);
  yield say("The crowd begins to chant, softly: 'Out, out, hungry one. Out, out, hungry one.'",
    "The fire climbs. The buttons pop one by one.",
    "For a moment, you feel the heat on your own skin, in the same places. Under your gloves, a seam splits. You tuck it away before anyone sees.");
  F.burned=1;F.festival=1;
  yield say("Kes: Hey. You okay? You're shaking.","@: It's the cold.","Kes: It's the middle of summer.",
    "Kes: ...I'm heading to the Lighthouse. My dad's there. Meet me?");
  const kes=M.ents.find(e=>e.id==='kes'&&!e.trainer);
  yield walkTo(kes,16,27);M.ents.splice(M.ents.indexOf(kes),1);
  note('festival',"They burned a child-shaped effigy and chanted 'out, hungry one'. I felt the heat on my own hands.");
}

// ----- Route 2 -----
function* haleTalk(){
  yield say("Hale: Halt. Warden cadet. The Council's inside the Lighthouse, and I'm to check every Tamer's hands.","Hale: Standard procedure. Take off the gloves.");
  const c=yield ask("Take off your gloves?",["Take them off","Refuse"]);
  if(c===0){
    yield say("You peel off the gloves. The nails are too dark. Too long. Curved like something never meant to hold a pencil.",
      "They've always been like this, haven't they? You've simply never looked.",
      "Hale stares for a very long moment. Then, very carefully, he looks at the sky.",
      "Hale: ...Looks fine to me. Pass.");
    F.glovesOff=1;note('claws',"I took my gloves off. My nails are claws. They've always been claws.");
  }else{
    yield say("@: I'd rather not.","Hale: ...Regulations say I have to ask. They don't say I have to insist.","He steps aside. His hands are shaking.");
  }
  F.haleDone=1;
}
function* heronScene(){
  yield say("The Elder Heron stands in the shallows like a pillar of dusk. As you near, every Wild in the marsh falls silent.",
    "Not fear. Something older. Reverence?",
    "Elder Heron: Little hungry one. You came the long way around.",
    "Elder Heron: Do not be afraid. We are not. That has been the secret all along.");
  const c=yield ask("It is looking directly at you.",["Who are you talking to?","I'm not hungry.","(Say nothing)"]);
  yield say([ "Elder Heron: You know who. You have always known who.","Elder Heron: Not hungry. Mm. And yet.","Elder Heron: Silence is honest. You were always good at it."][c],
    `Elder Heron: ${G.hunted} of my grandchildren sleep in your cages. Yes. I count them. I do not blame you.`,
    "Elder Heron: A tide is not cruel. It takes the sand, and the sand is never angry.",
    "Elder Heron: The Hollow is the oldest hunger in the fen. It does not hate us. It is how we end. And we are how it eats.",
    "Elder Heron: But you forgot. You put on a small shape and forgot, because someone loved the shape. That is a rare magic, child. It does not last.",
    "Elder Heron: The man at the Lighthouse knows. Ask him what he did on the night of the rain.",
    "Elder Heron: One thing I ask. Open your cages. Let some of them breathe.");
  F.heron=1;
  note('heron',"The Elder Heron called me 'little hungry one'. It said I was the Hollow. It wasn't angry. That's the worst part.");
  const r=yield ask("Release your caged Wilds? You would keep only your first partner.",["Release them all","Not yet"]);
  if(r===0){
    const first=G.party.find(m=>m.sp===F.starter)||G.party[0];
    const n=G.party.length-1+G.box.length;
    G.party=[first];G.box=[];G.mercy+=n;G.spared+=n;F.releasedAll=1;
    yield say("One by one the cages open. None of them run at first. They look at you.",
      "Then, slowly, they walk into the reeds. The last, a tiny Mossling, presses itself against your shin before it goes.",
      "For the first time all day, something touches you without fear.",
      "Elder Heron: Keep the first. It chose you. That is not a debt, child. That is a gift.");
    note('released',"I opened every cage. They didn't run at first. The little one touched my leg before it left.");
  }else yield say("Elder Heron: Then carry them a little longer. But they will remember who held the door.");
}

// ----- Lighthouse -----
function* kesTowerScene(){
  if(F.kesTower)return;
  const kes=M.ents.find(e=>e.id==='kes'&&e.vis!==undefined)||M.ents.find(e=>e.id==='kes');
  yield say("Inside the Lighthouse, an iron stair spirals into the dark. At its foot stands Kes, an open ledger in his hands. His mask hangs around his neck.",
    "Kes: I found it in the Warden register. 'Hollow, juvenile. Last sighted: Ashmere fen, fifteen years ago, the night of the Great Rain.'",
    "Kes: 'Took the shape of a dead child. Daughter of Edda, of Ashmere.' ...Your mum's name is Edda.",
    "Kes: Dad says the Hollow gets itself remembered into places. It plants itself in people's memories so no one asks where it came from.",
    "Kes: I've known you my whole life, and I can't tell you a single day I met you.");
  const c=yield ask("Kes: Tell me it's not you.",["I don't know.","It's not me.","..."]);
  F.lies=(F.lies||0)+(c===1?1:0);
  yield say(["Kes: That's the first honest thing you've ever said to me.","Kes: You're a bad liar. You've never had to practice.","Kes: Yeah."][c],
    "Kes: I'm not going to hurt you. But I'm not letting the Council do it either, not without you being able to face them.",
    "Kes: So fight me. Properly. If I can't beat you, I'll believe you get to decide what you become.");
  while(true){
    const r=yield* doBattle({kind:'trainer',team:[{sp:COUNTER[F.starter],lv:16},{sp:'voltmink',lv:15},{sp:'fennick',lv:15}],trainer:{name:'Kes'},bg:'tower'});
    if(r==='win'||r==='ran')break;
    healAll();yield say("Kes: Again. I'm not going anywhere.");
  }
  F.kesTower=1;G.bag.salve+=5;G.money+=500;
  yield say("Kes: ...Yeah. Okay. Yeah.","Kes: Go up. Alder's waiting. I'll be right behind you. Probably.","You received 5 Salves and ¥500.");
  note('kesfight',"Kes knows what I am. He fought me anyway, and then he let me go up the stairs.");
}

function* finaleScene(){
  if(F.finale)return;
  F.finale=1;
  healAll();
  yield say("The lamp room. Glass on all sides, black fen below, moonlight like spilled milk.",
    "Professor Alder stands at the lamp's brass heart. For the first time since you met him, there is no table between you.",
    "Alder: Fifteen years. I rehearsed this so many times. In every version, you were smaller.",
    "Alder: Sit, if you like. You won't. You never do.");
  yield ask("What do you say?",["What am I?","Why did you let me?","Tell me everything."]);
  yield say("Alder: The Hollow is the oldest predator in the fen. It was never meant to be killed. It can't be. It can only be fed, or sealed.",
    "Alder: Fifteen years ago the Council sealed the last. Or so we thought. A fragment slipped away in the Great Rain, starving, wounded, small.",
    "Alder: It crawled into Ashmere and scratched at the door of a woman named Edda.",
    "Alder: Her daughter, Wren, had died of fever that spring. The Hollow, you, wanted warmth. It wanted a shape that would be let in. And it chose the one she was most desperate to see.",
    "Alder: I found you the next morning in her kitchen, eating bread you couldn't taste. Edda looked at me with a look I have never forgotten. And I did not report you.",
    "Alder: I told myself I would study you. A Hollow that forgot itself! I gave you a childhood. A hobby. Catch and Cage. Feed the hunger a little at a time, until it passes for play.",
    "Alder: The Wilds in your cages aren't kept, child. They're fed on. A little each time. That is how a Hollow stays small.",
    "Alder: You typed a name on your first morning, do you remember? You didn't have one. You needed one. 'Wren' never came to you, did it?",
    "Alder: The Council wants you sealed. They're right. I have known they're right for fifteen years, and I could not do it.",
    "Alder: So here is my failure. Fight me. If you cannot beat an old man and his hounds, you are no danger to anyone.",
    "Alder: The seal is in this lamp. I can use it on you now, or I can fail. Let your hands decide. I'm too much of a coward to.");
  while(true){
    const r=yield* doBattle({kind:'trainer',team:[{sp:'wardhound',lv:18},{sp:'gloomjaw',lv:19},{sp:'elderhart',lv:21}],trainer:{name:'Professor Alder'},bg:'tower'});
    if(r==='win'||r==='ran')break;
    healAll();yield say("Alder: Not yet. Rest. Again.");
  }
  yield say("Alder: ...Good. Good.","He sits down on the stair, suddenly very old.",
    "Footsteps on the stairs. Uneven. Someone climbing too fast, too old.");
  F.motherHere=true;
  yield say("Edda: Don't. Please. Both of you.",
    "She is wearing her gloves. She made them herself, for you, and you have never once thought to ask why they were so big.",
    "Edda: I'm not asking you to be Wren. I stopped asking years ago. I'm asking you to be home. Whatever home is, for the likes of us.");
  note('finale',"I am the Hollow. I was never hunting the Wilds. I was eating.");
  const c=yield ask("What will you do?",["Let them seal me.","Open every cage. Go to the fen.","Eat.","Take the mask. Go home. Forget."]);
  yield* ending(c);
}

function* ending(k){
  const names=['SEALED','THE FEN','THE HOLLOW','THE MASK'];
  yield fade(1,900);
  const L=[
    ["You walk to the lamp yourself.","Alder's hands shake on the brass. 'It won't hurt,' he says, and for once he sounds like a liar by choice.","Light fills the lamp room. Gold, not white. The colour of the lamp in Edda's kitchen.","Across the fen, the Wilds you caged wake and remember how to sing.","In Ashmere, Edda sets two plates at the table. Then, after a while, a third. For the sound of something still scratching at the door in her dreams."],
    ["You take every Cage from your belt and open them, one by one.","Nobody runs. They look at you a long time. Then they go, into the reeds, into the dark, into being something that is not yours.",G.mercy>=5?"The fen remembers every Wild you let go. They gather at the shore to see you off.":"The fen does not forgive you. But it makes room.","The Elder Heron waits at the water. 'You are still hungry,' it says. 'So are we all. Come and learn what to do with it.'","You do not go home that night. Or the next. Edda leaves the window open, as always.","In Ashmere, children say a quiet creature watches from the reeds at dusk. They leave bread on the pier. It takes the bread, though it can't taste it.","Some mornings it leaves a feather in return."],
    ["The Cages open, but not to release.","Everything you have ever caged comes back to you, and it is warm, and it is yours. You remember how to eat.","Alder doesn't scream. He seems, if anything, relieved.","Edda reaches out a gloved hand. You look at it for a long moment. You have never been able to taste bread. But you have an excellent memory for what everything else tastes like.","By morning, Ashmere is quiet. Not silent. Quiet, the way a held breath is quiet.","No bird sings. Pip's mother does not let her out.","And somewhere in the fen, an enormous, lonely thing lies down at last, full."],
    ["Alder opens his palm. In it, a small bronze charm: the amulet he has worn every day you have known him.","'The last of its kind,' he says. 'One more mask. One more childhood. You won't remember. Edda will.'","You nod. Edda cries. The brass lamp burns the memory out of you, gently, like falling asleep in a warm bath.","You wake in a narrow bed in Ashmere. Seven days of rain, then quiet. Something tastes strange in your mouth.","Mother calls up the stairs: 'Today's the day!'","Under the mattress, the wood is scratched with fifteen years of tally marks. Or maybe more. Or maybe the newest ones are yours."]
  ][k];
  yield cut(...L);
  S.end={name:names[k],k};S.mode='endcard';gen=null;cur=null;
  saveGame();
}
