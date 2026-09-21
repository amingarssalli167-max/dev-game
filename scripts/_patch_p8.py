#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, sys
P = "/home/user/chernobyl/index.html"
s = io.open(P, encoding="utf-8").read()
orig = len(s.encode("utf-8"))
misses = []
def rep(tag, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        misses.append((tag, n)); print("MISS      %-30s found=%d expected=%d" % (tag, n, count)); return
    s = s.replace(old, new); print("ok        %s" % tag)

# ---------- A: updateEnts dispatch ----------
rep("updateEnts dispatch",
    "    else if(e.type==='subject01')updateS01(dt,s,e,P);",
    "    else if(e.type==='subject01')updateS01(dt,s,e,P);\n    else if(e.type==='ai')AI.drive(e,dt,s,P);")

# ---------- B: threat from AI enemies ----------
rep("threat from AI",
    "  for(const e of s.entsLive)if((e.type==='creature'||e.type==='soldier')&&e.state==='chase')\n    threat=Math.max(threat,clamp(1-dist(e.x,e.y,P.x,P.y)/12,0,1));\n  G.threat=threat;",
    "  for(const e of s.entsLive)if((e.type==='creature'||e.type==='soldier')&&e.state==='chase')\n    threat=Math.max(threat,clamp(1-dist(e.x,e.y,P.x,P.y)/12,0,1));\n  for(const e of s.entsLive)if(e.type==='ai'&&e.ai&&(e.ai.state==='chase'||e.ai.state==='attack'))\n    threat=Math.max(threat,clamp(1-dist(e.x,e.y,P.x,P.y)/12,0,1));\n  G.threat=threat;")

# ---------- C: makeChar render for type 'ai' ----------
rep("makeChar ai branch",
    "  if(e.type==='soldier')return rigHumanoid({cloth:0x39402f,skin:0x6b5c4c,dark:0x2c3226,helmet:0x454c38,gun:true});",
    "  if(e.type==='soldier')return rigHumanoid({cloth:0x39402f,skin:0x6b5c4c,dark:0x2c3226,helmet:0x454c38,gun:true});\n  if(e.type==='ai')return rigHumanoid({scale:1.03,cloth:0x37474a,skin:0x6f6154,dark:0x232d2f,eyes:0xff5a3c,hunch:true});")

# ---------- D: register arena scene ----------
rep("buildAllScenes arena",
    "  SCENES.blacksite=buildBlacksite();\n}",
    "  SCENES.blacksite=buildBlacksite();\n  SCENES.ai_arena=buildAIArena();\n}")

# ---------- E: HUD debug readout ----------
rep("aidebug HUD element",
    '  <div id="hint"></div>',
    '  <div id="aidebug"></div>\n  <div id="hint"></div>')
rep("aidebug CSS",
    "  .btn.disabled{opacity:.4;pointer-events:none}",
    "  .btn.disabled{opacity:.4;pointer-events:none}\n"
    "  #aidebug{position:absolute;top:14px;right:16px;z-index:22;font:12px/1.5 monospace;color:#7fd8c4;\n"
    "    background:rgba(8,12,16,.72);border:1px solid #23413b;padding:6px 10px;opacity:0;transition:opacity .3s;\n"
    "    pointer-events:none;text-align:left;direction:ltr;letter-spacing:.04em}")

# ---------- F: menu button + wiring ----------
rep("menu AI button",
    '      <button class="btn" id="btnSlice">اختبار البيئة (Vertical Slice)</button>\n    </div>',
    '      <button class="btn" id="btnSlice">اختبار البيئة (Vertical Slice)</button>\n'
    '      <button class="btn" id="btnAI">اختبار ذكاء العدو (AI Arena)</button>\n    </div>')
rep("AI button wiring",
    "  const bs=$('btnSlice');if(bs)bs.onclick=()=>startSliceTest();",
    "  const bs=$('btnSlice');if(bs)bs.onclick=()=>startSliceTest();\n  const ba=$('btnAI');if(ba)ba.onclick=()=>startAITest();")

# ---------- G: startAITest (after startSliceTest) ----------
rep("startAITest",
    "  note('قطاع اختبار صغير يمثل جزءًا من مدينة مهجورة. مبني بالكامل عبر نظام البيئة (ENV).','env');\n  saveGame(true);\n}\nfunction boot(){",
    "  note('قطاع اختبار صغير يمثل جزءًا من مدينة مهجورة. مبني بالكامل عبر نظام البيئة (ENV).','env');\n  saveGame(true);\n}\n"
    "function startAITest(){\n"
    "  audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();\n"
    "  buildAllScenes();\n"
    "  G.player=newPlayer();\n"
    "  G.sceneId='ai_arena';\n"
    "  $('menu').classList.add('hide');$('hud').classList.remove('hide');\n"
    "  E3.builtFor=null;G.started=true;G.over=false;\n"
    "  const f=$('fade');f.style.opacity=1;\n"
    "  enterScene('ai_arena',SCENES.ai_arena.spawn,{silent:true});\n"
    "  G.visits.ai_arena=1;\n"
    "  setTimeout(()=>{f.style.opacity=0;},400);\n"
    "  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;\n"
    "  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';\n"
    "  toast('منطقة اختبار الذكاء الاصطناعي','ENEMY AI PROTOTYPE — STALKER');\n"
    "  setObjective('اختبر الذكاء الاصطناعي: تحرّك ليراك/يسمعك، ثم اختبئ ليفقدك ويعود للدورية',\n"
    "    'حالة العدو تظهر أعلى اليمين • WASD حركة • Shift عدو • Ctrl انحناء • H اختباء');\n"
    "  note('منطقة اختبار منفصلة لعدو واحد (Prototype) مبني على إطار الذكاء الاصطناعي (AI).','ai');\n"
    "  saveGame(true);\n}\nfunction boot(){")

# ---------- H: AI FRAMEWORK + states + archetype + arena (before computeFlow) ----------
AI_BLOCK = r"""/* =====================================================================
   ENEMY AI FRAMEWORK (Phase 8) — a modular finite-state machine.
   ---------------------------------------------------------------------
   AI.states     : reusable behavior blocks { name, enter, think, act, exit }
   AI.archetypes : an enemy = DATA (which tunables + speeds + thresholds)
   AI.drive()    : perceive -> think -> act, with transitions (called by updateEnts)
   Detection (sight: range+angle+LOS), audio awareness (entHear), distance checks,
   and flow-field navigation are shared services. Adding an enemy = AI.archetype({...});
   adding a behavior = AI.state({...}). Nothing lives in the Player Controller.
   States: idle, patrol, investigate, search, chase, attack, lose, return.
   ===================================================================== */
const AI={
  states:{}, archetypes:{}, debug:true,
  state(def){AI.states[def.name]=def;return def;},
  archetype(a){AI.archetypes[a.id]=a;return a;},
  /* ---- blackboard ---- */
  init(e){
    const a=AI.archetypes[e.arch]||AI.archetypes.stalker;
    e.ai={arch:a,state:null,prev:null,alert:0,lastKnown:null,lastSeen:null,
      vis:0,hear:0,dist:0,canSee:false,lostT:0,searchT:0,invT:0,idleT:0,loseT:0,scanT:0,
      attackCd:0,stateT:0,patrolIdx:(e.pi|0)||0,ix:e.x,iy:e.y,stuckT:0};
    AI.enter(e,a.initial||'patrol');
    return e.ai;
  },
  enter(e,name){
    const ai=e.ai,cur=AI.states[ai.state];
    if(cur&&cur.exit){try{cur.exit(e,ai);}catch(x){}}
    ai.prev=ai.state;ai.state=name;ai.stateT=0;
    const st=AI.states[name];if(st&&st.enter){try{st.enter(e,ai);}catch(x){}}
  },
  go(e,name){if(e.ai&&e.ai.state!==name)AI.enter(e,name);},
  /* ---- shared perception: detection + audio + distance ---- */
  perceive(e,ai,s,P,dt){
    const a=ai.arch;
    const vis=P.hidden?0:AI.see(e,ai,s,P);
    const hear=AI.hear(e,ai,s,P);
    ai.vis=vis;ai.hear=hear;ai.dist=dist(e.x,e.y,P.x,P.y);ai.canSee=vis>0;
    const gain=vis*(a.alertGainSee!=null?a.alertGainSee:1.5)+hear*(a.alertGainHear!=null?a.alertGainHear:1.1)
      +(P.flash&&vis>0?(a.flashBonus||0.3):0);
    if(gain>0){ai.alert=Math.min(a.alertMax||1.6,ai.alert+dt*gain);
      if(vis>0||hear>=(a.hearLoc!=null?a.hearLoc:0.2))ai.lastKnown={x:P.x,y:P.y,t:G.time};}
    else ai.alert=Math.max(0,ai.alert-dt*(a.alertDecay||0.42));
    return ai;
  },
  see(e,ai,s,P){
    const a=ai.arch,range=(a.sight&&a.sight.range)||CFG.sightRange;
    const d=dist(e.x,e.y,P.x,P.y);if(d>range)return 0;
    const ang=Math.atan2(P.y-e.y,P.x-e.x);
    let da=Math.abs(((ang-e.face+Math.PI*3)%TAU)-Math.PI);
    const half=(a.sight&&a.sight.angle)||CFG.sightAngle;
    if(da>half&&d>1.6)return 0;
    if(!losClear(s,e.x,e.y,P.x,P.y))return 0;
    return clamp(1.25-d/range,0.15,1);
  },
  hear(e,ai,s,P){return entHear(s,e,P.x,P.y);},
  /* ---- shared navigation (flow field + collision) ---- */
  moveTo(e,ai,s,tx,ty,speed,dt){
    if(!(speed>0)){e.moving=false;return null;}
    computeFlowIfNeeded(s,tx,ty);
    let ang=flowDir(s,e);
    if(ang==null||ang===-1)ang=Math.atan2(ty-e.y,tx-e.x);
    e.face=angLerp(e.face,ang,1-Math.pow(0.004,dt));
    const r=(ai.arch&&ai.arch.radius)||0.32;
    const dx=Math.cos(ang)*speed*dt,dy=Math.sin(ang)*speed*dt,bx=e.x,by=e.y;
    moveEnt(s,e,dx,dy,r);
    if(Math.abs(e.x-bx)<1e-4&&Math.abs(e.y-by)<1e-4){moveEnt(s,e,Math.cos(ang+1.6)*speed*dt,Math.sin(ang+1.6)*speed*dt,r);ai.stuckT+=dt;}
    else ai.stuckT=0;
    e.moving=true;return ang;
  },
  faceTo(e,ai,tx,ty,dt,rate){e.face=angLerp(e.face,Math.atan2(ty-e.y,tx-e.x),1-Math.pow(rate||0.005,dt));},
  scan(e,ai,dt){ai.scanT-=dt;if(ai.scanT<=0){ai.scanT=0.6+Math.random()*0.7;
    AI.faceTo(e,ai,e.x+Math.cos(ai.face+1.3)*3,e.y+Math.sin(ai.face+1.3)*3,dt,0.02);}},
  speed(ai,name){const sp=ai.arch.speed||{};return sp[name]!=null?sp[name]:(sp.patrol||CFG.creatureWalk);},
  patrolPoints(e,ai){if(e.patrol&&e.patrol.length)return e.patrol;
    const a=ai.arch;if(a.patrol&&a.patrol.points)return a.patrol.points;return [[e.x,e.y]];},
  searchPoints(e,ai){const r=(ai.arch.search&&ai.arch.search.radius)||4;
    const cx=ai.lastKnown?ai.lastKnown.x:e.x,cy=ai.lastKnown?ai.lastKnown.y:e.y,pts=[];
    for(let i=0;i<4;i++){const a=Math.random()*TAU;pts.push([cx+Math.cos(a)*r*(0.4+Math.random()*0.6),cy+Math.sin(a)*r*(0.4+Math.random()*0.6)]);}
    return pts;},
  /* perception-driven jump used by low-alert states */
  react(e,ai){const a=ai.arch,chaseT=a.chaseAlert!=null?a.chaseAlert:1.0,invT=a.investigateAlert!=null?a.investigateAlert:0.3;
    if(ai.alert>=chaseT&&(ai.canSee||ai.lastKnown))return 'chase';
    if(ai.alert>=invT&&ai.lastKnown)return 'investigate';
    return null;},
  attack(e,ai,s,P){const a=ai.arch;if(a.attack&&a.attack.onHit)a.attack.onHit(e,ai,P);else hitPlayer(e);},
  /* ---- the driver ---- */
  drive(e,dt,s,P){
    if(!e.ai)AI.init(e);
    const ai=e.ai;ai.stateT+=dt;if(ai.attackCd>0)ai.attackCd-=dt;
    AI.perceive(e,ai,s,P,dt);
    let st=AI.states[ai.state];
    if(!st){AI.enter(e,ai.arch.initial||'patrol');st=AI.states[ai.state];}
    let next=null;
    if(st&&st.think){try{next=st.think(e,ai,s,P,dt);}catch(x){}}
    if(next&&next!==ai.state){AI.enter(e,next);st=AI.states[ai.state];}
    if(st&&st.act){try{st.act(e,ai,s,P,dt);}catch(x){}}
    if(AI.debug&&G.sceneId==='ai_arena'){const d=$('aidebug');
      if(d){d.style.opacity=1;
        d.textContent='AI '+(ai.arch.id||'')+' : '+ai.state.toUpperCase()+'   alert '+ai.alert.toFixed(2)
          +'   dist '+ai.dist.toFixed(1)+(ai.canSee?'   [SEE]':'')+(ai.hear>0.01?'   [HEAR '+ai.hear.toFixed(2)+']':'');}}
  },
};

/* ---------------- the eight reusable states ---------------- */
AI.state({name:'idle',
  enter(e,ai){ai.idleT=(ai.arch.idle&&ai.arch.idle.time)||(1.4+Math.random()*2);e.moving=false;},
  think(e,ai,s,P,dt){const r=AI.react(e,ai);if(r)return r;ai.idleT-=dt;AI.scan(e,ai,dt);
    if(ai.idleT<=0)return 'patrol';return null;},
  act(e,ai,s,P,dt){e.moving=false;}});

AI.state({name:'patrol',
  enter(e,ai){e.moving=true;},
  think(e,ai,s,P,dt){return AI.react(e,ai);},
  act(e,ai,s,P,dt){const pts=AI.patrolPoints(e,ai);if(!pts.length){e.moving=false;return;}
    let tg=pts[ai.patrolIdx%pts.length];
    if(dist(e.x,e.y,tg[0],tg[1])<((ai.arch.patrol&&ai.arch.patrol.reach)||1.1)){ai.patrolIdx=(ai.patrolIdx+1)%pts.length;tg=pts[ai.patrolIdx%pts.length];}
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'patrol'),dt);}});

AI.state({name:'investigate',
  enter(e,ai){const lk=ai.lastKnown;ai.ix=lk?lk.x+(Math.random()-0.5)*1.5:e.x;ai.iy=lk?lk.y+(Math.random()-0.5)*1.5:e.y;
    ai.invT=(ai.arch.investigate&&ai.arch.investigate.time)||7;},
  think(e,ai,s,P,dt){const a=ai.arch;if(ai.alert>=(a.chaseAlert!=null?a.chaseAlert:1.0)&&(ai.canSee||ai.lastKnown))return 'chase';
    ai.invT-=dt;if(dist(e.x,e.y,ai.ix,ai.iy)<1.0||ai.invT<=0)return 'search';return null;},
  act(e,ai,s,P,dt){AI.moveTo(e,ai,s,ai.ix,ai.iy,AI.speed(ai,'investigate'),dt);}});

AI.state({name:'search',
  enter(e,ai){ai.searchT=(ai.arch.search&&ai.arch.search.time)||6;ai.searchPts=AI.searchPoints(e,ai);ai.sIdx=0;},
  think(e,ai,s,P,dt){const a=ai.arch,chaseT=a.chaseAlert!=null?a.chaseAlert:1.0;
    if(ai.alert>=chaseT&&(ai.canSee||ai.lastKnown))return 'chase';
    if(ai.lastKnown&&(G.time-ai.lastKnown.t)<1.0&&ai.alert>=(a.investigateAlert||0.3))return 'investigate';
    ai.searchT-=dt;if(ai.searchT<=0)return 'return';return null;},
  act(e,ai,s,P,dt){AI.scan(e,ai,dt);const pts=ai.searchPts||[];
    if(!pts.length){e.moving=false;return;}
    let tg=pts[ai.sIdx%pts.length];
    if(dist(e.x,e.y,tg[0],tg[1])<1.0){ai.sIdx=(ai.sIdx+1)%pts.length;tg=pts[ai.sIdx%pts.length];}
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'search')||AI.speed(ai,'investigate')*0.7,dt);}});

AI.state({name:'chase',
  enter(e,ai){if(ai.lastKnown)ai.lastSeen={x:ai.lastKnown.x,y:ai.lastKnown.y};ai.lostT=0;
    if(ai.arch.onChase){try{ai.arch.onChase(e,ai);}catch(x){}}},
  think(e,ai,s,P,dt){const a=ai.arch;
    if(ai.canSee)ai.lastSeen={x:P.x,y:P.y};
    if(!P.hidden&&ai.dist<=((a.attack&&a.attack.range)||0.95))return 'attack';
    if(ai.alert<=(a.loseAlert!=null?a.loseAlert:0.18)){ai.lostT+=dt;if(ai.lostT>0.45)return 'lose';}else ai.lostT=0;
    return null;},
  act(e,ai,s,P,dt){const tx=ai.canSee?P.x:(ai.lastSeen?ai.lastSeen.x:e.x),ty=ai.canSee?P.y:(ai.lastSeen?ai.lastSeen.y:e.y);
    AI.moveTo(e,ai,s,tx,ty,AI.speed(ai,'chase'),dt);
    if(!ai.canSee&&ai.lastSeen&&dist(e.x,e.y,ai.lastSeen.x,ai.lastSeen.y)<1.1)AI.go(e,'lose');}});

AI.state({name:'attack',
  enter(e,ai){ai.attackCd=Math.min(ai.attackCd,0.25);},
  think(e,ai,s,P,dt){const a=ai.arch,rng=(a.attack&&a.attack.range)||0.95;
    if(ai.alert<=(a.loseAlert!=null?a.loseAlert:0.18))return 'lose';
    if(P.hidden||ai.dist>rng*1.3)return 'chase';return null;},
  act(e,ai,s,P,dt){AI.faceTo(e,ai,P.x,P.y,dt,0.002);e.moving=false;
    const a=ai.arch,rng=(a.attack&&a.attack.range)||0.95;
    if(ai.attackCd<=0&&!P.hidden&&ai.dist<=rng+0.25){ai.attackCd=(a.attack&&a.attack.cooldown)||1.4;AI.attack(e,ai,s,P);}}});

AI.state({name:'lose',
  enter(e,ai){ai.loseT=(ai.arch.lose&&ai.arch.lose.time)||1.0;
    if(ai.arch.onLose){try{ai.arch.onLose(e,ai);}catch(x){}}},
  think(e,ai,s,P,dt){const a=ai.arch;if(ai.canSee&&ai.alert>=(a.chaseAlert!=null?a.chaseAlert:1.0))return 'chase';
    ai.loseT-=dt;if(ai.loseT<=0)return 'search';return null;},
  act(e,ai,s,P,dt){e.moving=false;AI.scan(e,ai,dt);}});

AI.state({name:'return',
  enter(e,ai){const pts=AI.patrolPoints(e,ai);let bi=0,bd=1e9;
    for(let i=0;i<pts.length;i++){const d=dist(e.x,e.y,pts[i][0],pts[i][1]);if(d<bd){bd=d;bi=i;}}
    ai.patrolIdx=bi;},
  think(e,ai,s,P,dt){const r=AI.react(e,ai);if(r)return r;
    const pts=AI.patrolPoints(e,ai),tg=pts[ai.patrolIdx%pts.length]||[e.x,e.y];
    if(dist(e.x,e.y,tg[0],tg[1])<1.3)return 'patrol';return null;},
  act(e,ai,s,P,dt){const pts=AI.patrolPoints(e,ai),tg=pts[ai.patrolIdx%pts.length]||[e.x,e.y];
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'return')||AI.speed(ai,'patrol'),dt);}});

/* ---------------- the ONE prototype enemy (data only) ---------------- */
AI.archetype({
  id:'stalker', initial:'patrol',
  sight:{range:12,angle:1.2},
  speed:{idle:0,patrol:1.6,investigate:2.3,search:1.6,chase:3.4,return:1.9,attack:0},
  alertGainSee:1.7, alertGainHear:1.25, alertDecay:0.40, alertMax:1.6, flashBonus:0.3,
  investigateAlert:0.30, chaseAlert:1.0, loseAlert:0.18, hearLoc:0.2,
  idle:{time:2}, investigate:{time:7}, search:{time:6,radius:4.5}, lose:{time:1.0},
  patrol:{reach:1.1}, attack:{range:1.05,cooldown:1.5,damage:1}, radius:0.34,
  onChase(e,ai){subtitle('','رآك. يتحرّك نحوك بسرعة.');SFX.dread();},
  onLose(e,ai){subtitle('','فقد أثرك. يتلفّت باحثًا.');}
});

/* ---------------- separate AI test arena ---------------- */
function buildAIArena(){
  const s=ENV.scene('ai_arena',26,20,TL.WALL,{indoor:true,name:'منطقة اختبار الذكاء الاصطناعي',
    spawn:{x:3.5,y:10.5},safe:{scene:'ai_arena',x:3.5,y:10.5},
    atmo:{fog:0.055,hemi:0.11,amb:0.045,fogColor:0x06090c,bg:0x06090c},
    audio:{wind:0.04,hum:0.05,windFreq:200,events:[{sfx:'creak',min:14,max:30}]}});
  const g=s.g;
  rect(g,1,1,24,18,TL.F_CONC);
  /* cover blocks: break line-of-sight and force the flow-field to route around */
  rect(g,8,4,2,5,TL.WALL);rect(g,8,12,2,5,TL.WALL);
  rect(g,15,8,3,2,TL.WALL);rect(g,19,3,2,4,TL.WALL);rect(g,19,14,2,4,TL.WALL);
  s.sprites.push({x:5,y:5,type:'crate'},{x:5,y:15,type:'crate'},{x:22,y:10,type:'debris'});
  ENV.light(s,{x:13,y:10,r:9,c:'rgba(200,220,255,',a:0.09,flick:0.04});
  ENV.bright(s,3.5,10.5,4.0,'rgba(255,214,150,',0.10,0.05);
  /* ONE prototype enemy on the framework */
  s.ents.push({type:'ai',arch:'stalker',x:18,y:10,face:Math.PI,id:'proto',hp:1,
    patrol:[[18,4],[18,16],[11,16],[11,4]]});
  /* a hiding spot to test detection-drop / lose-target */
  ENV.hide(s,3,16,'اختبئ خلف الصناديق','ai_hide');
  return s;
}

"""
rep("AI FRAMEWORK + states + arena", "function computeFlow(s,tx,ty){", AI_BLOCK + "function computeFlow(s,tx,ty){")

io.open(P, "w", encoding="utf-8").write(s)
print("bytes %d -> %d" % (orig, len(s.encode("utf-8"))))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
