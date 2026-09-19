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

# ---------- A: G state (evt + stats.events) ----------
rep("G.evt state field",
    "  pz:{},           // puzzle progress: id -> {done:[stepIds]}\n",
    "  pz:{},           // puzzle progress: id -> {done:[stepIds]}\n  evt:{done:{},cd:{}},  // event manager state (fired once-flags + cooldowns)\n")
rep("G.stats.events",
    "  stats:{deaths:0, hidden:0, anomalies:0, docs:0, walk:0},",
    "  stats:{deaths:0, hidden:0, anomalies:0, docs:0, walk:0, events:0},")

# ---------- B: EVENT MANAGER + built-in events (after triggerAnomaly) ----------
OLD_B = """function triggerAnomaly(id){
  const pool=id?ANOMS.filter(a=>a.id===id):ANOMS;
  let tot=0;for(const a of pool)tot+=a.w;
  let r=Math.random()*tot;
  for(const a of pool){r-=a.w;if(r<=0){a.f();G.stats.anomalies++;
    if(Math.random()<0.45)note('شيء غير طبيعي: '+a.id,'anomaly');return;}}
}"""
NEW_B = OLD_B + r"""

/* =====================================================================
   PSYCHOLOGICAL HORROR EVENT MANAGER (Phase 7) — central & data-driven.
   Horror is not "an enemy spawns". Nothing here lives in the Player
   Controller: the loop calls EVT.update(dt); enterScene calls EVT.onEnter(id);
   story / puzzle progression calls EVT.fire(id) (or reward.evt).
   ---------------------------------------------------------------------
   An EVENT is pure data:
     { id, kind:'fake'|'real',                 // fake = no lasting world/progression effect
       weight, cooldown, once, random,         // random-pool tuning
       scene:'id'|['ids'], enter:'id'|['ids'], region:{x,y,r},
       when(ctx)->bool,                         // gate on story/puzzle/echo/flags
       beats:[{at:0, effects:{...}, run(ctx)}], // timed sequence (appear -> vanish)
       effects:{...},                           // shorthand for a single immediate beat
       onFire(ctx) }
   EFFECTS are composed from a library (EVT.FX). To add an event you ONLY call
   defEvent({...}) — the engine never changes.
   ===================================================================== */
const EVENTS={};
function defEvent(e){EVENTS[e.id]=e;return e;}
const EVT={
  _queue:[], _rndT:10, randInterval:16,
  REAL:['spawn','despawn','door','mutate','flag'],   // world / progression mutating effects
  /* ---------------- effect library ---------------- */
  FX:{
    text(p){ if(!p)return;
      if(p.subtitle!=null)subtitle(p.who||'',p.subtitle,p.dur);
      if(p.flash)flashMsg(p.flash,p.flashDur||2400);
      if(p.note)note(p.note,p.tag||'event');
      if(p.toast)toast(p.toast,p.toastSub||''); },
    fx(p){ if(!p)return;
      if(p.distort!=null)G.distort=Math.max(G.distort||0,p.distort);
      if(p.grain!=null)G.grain=p.grain;
      if(p.whiteout!=null)G.whiteout=Math.max(G.whiteout||0,p.whiteout);
      if(p.shake)shake(p.shake[0],p.shake[1]); },
    echo(p){ const v=typeof p==='number'?p:(p.set!=null?p.set:(G.echo||0)+(p.add||0));G.echo=clamp(v,0,1); },
    sound(p){ if(!p)return;
      if(p.sfx&&SFX[p.sfx])SFX[p.sfx]();
      if(p.tone)tone(p.tone[0],p.tone[1],p.tone[2],p.tone[3]||'sine',p.tone[4]);
      if(p.noise)noiseBurst(p.noise[0],p.noise[1],p.noise[2],p.noise[3],p.noise[4]);
      if(p.speak){const sp=Array.isArray(p.speak)?p.speak:[p.speak];speak(sp[0],sp[1],sp[2],sp[3]);} },
    light(p){ const s=G.scene;if(!s||!p)return; s.atmo=s.atmo||{};
      const keys=['fog','hemi','amb','fogColor','bg'];
      if(p.save){ s._atmoPrev=s._atmoPrev||{}; keys.forEach(k=>{if(p[k]!=null&&s._atmoPrev[k]==null)s._atmoPrev[k]=s.atmo[k];}); }
      keys.forEach(k=>{if(p[k]!=null)s.atmo[k]=p[k];});
      if(p.flick!=null)for(const L of s.lights)L.flick=Math.min(.7,(L.flick||0)+p.flick);
      EVT._applyAtmo(s); },
    lightRestore(){ const s=G.scene;if(!s||!s._atmoPrev)return;
      Object.assign(s.atmo,s._atmoPrev);s._atmoPrev=null;EVT._applyAtmo(s); },
    spawn(p){ const s=G.scene;if(!s||!p)return;
      const sp={x:p.x,y:p.y,type:p.type||'statue'};sp._evt=p.tag||'evt';s.sprites.push(sp);EVT.rebuild(); },
    despawn(p){ const s=G.scene;if(!s)return;const tag=(p&&p.tag)||p;
      s.sprites=s.sprites.filter(sp=>sp._evt!==tag);EVT.rebuild(); },
    door(p){ const s=G.scene;if(!s||!p)return;
      const d=(s.doors||[]).find(x=>x.id===p.id)||(s.ints||[]).find(x=>x.id===p.id);if(!d)return;
      if(p.vanish){ setT(s.g,d.x,d.y,TL.WALL);d._gone=true;d.used=true; }
      else{ if(p.open!=null){d.open=p.open;setT(s.g,d.x,d.y,p.open?TL.F_CONC:(d.locked?TL.LOCKDOOR:TL.DOOR));}
            if(p.locked!=null){d.locked=p.locked;if(p.open==null)setT(s.g,d.x,d.y,p.locked?TL.LOCKDOOR:TL.DOOR);} }
      EVT.rebuild(); },
    mutate(p){ const s=G.scene;if(!s||!p)return;
      if(p.tiles)p.tiles.forEach(t=>setT(s.g,t[0],t[1],t[2]));
      if(p.shift){s.shifted=s.shifted||{};Object.assign(s.shifted,p.shift);}
      if(p.addSprites)p.addSprites.forEach(sp=>s.sprites.push(Object.assign({},sp)));
      EVT.rebuild(); },
    flag(p){ if(typeof p==='string')G.flags[p]=true; else if(p)Object.assign(G.flags,p); },
    objective(p){ if(p)setObjective(p[0],p[1]); },
    threat(p){ const v=typeof p==='number'?p:(p&&p.set)||0;G.threat=Math.max(G.threat||0,v);if(p&&p.noise)G.noiseEvent={r:p.noise}; },
    anomaly(p){ triggerAnomaly(typeof p==='string'?p:(p&&p.id)); },
    run(p,ctx,e){ if(typeof p==='function')p(ctx,e); else if(p&&typeof p.fn==='function')p.fn(ctx,e); },
  },
  _applyAtmo(s){ if(typeof E3==='undefined'||!E3.ok||!s)return; const AT=s.atmo||{};
    if(AT.fog!=null)E3.scene.fog.density=AT.fog;
    if(AT.hemi!=null)E3.hemi.intensity=AT.hemi;
    if(AT.amb!=null)E3.amb.intensity=AT.amb;
    if(AT.fogColor!=null)E3.scene.fog.color.set(AT.fogColor);
    if(AT.bg!=null)E3.scene.background=new THREE.Color(AT.bg); },
  rebuild(){ const s=G.scene;if(s)s.dirty=true; if(typeof E3!=='undefined')E3.builtFor=null; },
  isReal(e){ if(!e)return false; if(e.kind==='real')return true; if(e.kind==='fake')return false;
    const beats=e.beats||(e.effects?[{effects:e.effects}]:[]);
    return beats.some(b=>b.effects&&Object.keys(b.effects).some(k=>EVT.REAL.indexOf(k)>=0)); },
  /* ---------------- state ---------------- */
  st(){ if(!G.evt)G.evt={done:{},cd:{}}; if(!G.evt.done)G.evt.done={}; if(!G.evt.cd)G.evt.cd={}; return G.evt; },
  fired(id){ return !!EVT.st().done[id]; },
  eligible(e,ctx){ const st=EVT.st();
    if(e.once&&st.done[e.id])return false;
    if(e.cooldown&&st.cd[e.id]!=null&&G.time<st.cd[e.id])return false;
    if(e.scene){const list=[].concat(e.scene);if(list.indexOf(G.sceneId)<0)return false;}
    if(e.when){let w;try{w=e.when(ctx||{});}catch(x){w=false;}if(!w)return false;}
    return true; },
  /* ---------------- fire ---------------- */
  fire(id,ctx){ const e=EVENTS[id];if(!e)return false;ctx=ctx||{};
    if(!EVT.eligible(e,ctx))return false;
    const st=EVT.st();if(e.once)st.done[id]=true;if(e.cooldown)st.cd[id]=G.time+e.cooldown;
    G.stats.events=(G.stats.events||0)+1;
    const beats=e.beats||(e.effects?[{at:0,effects:e.effects}]:[]);
    for(const b of beats){const at=b.at||0;
      if(at<=0)EVT.applyBeat(e,b,ctx);else EVT._queue.push({t:G.time+at,e:e,b:b,ctx:ctx});}
    if(e.onFire){try{e.onFire(ctx);}catch(x){}}
    return true; },
  applyBeat(e,b,ctx){ const fx=(b&&b.effects)||{};
    for(const k in fx){const fn=EVT.FX[k];if(fn){try{fn(fx[k],ctx,e);}catch(x){}}}
    if(b&&b.run){try{b.run(ctx,e);}catch(x){}} },
  /* ---------------- triggers (loop / scene entry) ---------------- */
  update(dt){ if(!G.started||G.over)return;
    for(let i=EVT._queue.length-1;i>=0;i--){const q=EVT._queue[i];
      if(G.time>=q.t){EVT.applyBeat(q.e,q.b,q.ctx);EVT._queue.splice(i,1);}}
    const s=G.scene;if(!s||!G.player)return;
    for(const id in EVENTS){const e=EVENTS[id];
      if(e.region&&(!e.scene||[].concat(e.scene).indexOf(G.sceneId)>=0)){
        if(dist(G.player.x,G.player.y,e.region.x,e.region.y)<=e.region.r&&EVT.eligible(e,{trigger:'region'}))
          EVT.fire(id,{trigger:'region'});}}
    EVT._rndT-=dt;
    if(EVT._rndT<=0){EVT._rndT=EVT.randInterval*(0.7+Math.random()*0.6);
      if(Math.random()<0.10+G.echo*0.5){
        const pool=Object.keys(EVENTS).filter(id=>EVENTS[id].random&&EVT.eligible(EVENTS[id],{trigger:'random'}));
        if(pool.length){let tot=0;for(const id of pool)tot+=(EVENTS[id].weight||1);
          let r=Math.random()*tot;
          for(const id of pool){r-=(EVENTS[id].weight||1);if(r<=0){EVT.fire(id,{trigger:'random'});break;}}}}}
  },
  onEnter(sceneId){ for(const id in EVENTS){const e=EVENTS[id];
      if(e.enter&&[].concat(e.enter).indexOf(sceneId)>=0&&EVT.eligible(e,{trigger:'enter'}))
        EVT.fire(id,{trigger:'enter'});} },
  clearQueue(){ EVT._queue.length=0; },
};

/* ---------------- built-in events (data only — one per horror category) ---------------- */
/* REAL + story/puzzle-linked: fires the instant the lockbox puzzle is solved. */
defEvent({id:'lockbox_aftermath',kind:'real',once:true,
  beats:[
    {at:0,effects:{
      flag:{slice_changed:true},
      light:{save:true,hemi:0.030,amb:0.011,fog:0.115,flick:0.3},
      sound:{sfx:'dread'},
      fx:{distort:0.55,shake:[3,0.5]},
      echo:{add:0.06},
      text:{subtitle:'الجدران تنفّست. الضوء في الممر صار أثقل. شيء ما في الشقّة أعاد ترتيب نفسه.',
            flash:'الشقّة تغيّرت',note:'بعد «صندوق الشقّة»: الممر صار مختلفًا. اخرج ثم عُد.',tag:'story'}}},
    {at:5,effects:{sound:{sfx:'door'},fx:{distort:0.3},
      text:{subtitle:'باب يُغلق في مكان ما من الشقّة. لست متأكدًا أنه كان مفتوحًا.'}}},
  ]});
/* REAL + enter-triggered + story-gated: the change is there every time you come back (and after load). */
defEvent({id:'evt_slice_changed',kind:'real',enter:'slice_bld',
  when:()=>!!G.flags.slice_changed&&!(G.scene&&G.scene.shifted&&G.scene.shifted.hallChanged),
  effects:{
    door:{id:'sb_bath',vanish:true},
    mutate:{shift:{hallChanged:true},addSprites:[{x:10,y:6,type:'statue',_evt:'hall_figure'}]},
    light:{hemi:0.030,amb:0.012,fog:0.112},
    text:{subtitle:'عدت إلى الشقّة. الممر تغيّر: تمثال لم يكن هنا، وباب الحمّام صار حائطًا مصمتًا.',
          note:'الشقّة تتغيّر كلما عدت إليها. هذا لم يكن هنا من قبل.',tag:'story'}}});
/* FAKE + region-triggered: a figure appears at the end of the street, then is gone (appear -> vanish). */
defEvent({id:'evt_street_apparition',kind:'fake',once:true,scene:'slice',region:{x:33,y:17,r:3.5},
  beats:[
    {at:0,effects:{spawn:{x:37.5,y:17.5,type:'statue',tag:'street_fig'},sound:{sfx:'dread'},
      text:{subtitle:'في آخر الشارع شيء يقف. بعيد. لا يتحرّك.'}}},
    {at:4.5,effects:{despawn:{tag:'street_fig'},fx:{distort:0.3},
      text:{subtitle:'رمشتَ. اختفى. لا أثر له على الأرض.'}}},
  ]});
/* FAKE + random: a door slams somewhere far away (distant sound). */
defEvent({id:'evt_distant_door',kind:'fake',random:true,weight:3,cooldown:35,
  effects:{sound:{sfx:'door'},text:{subtitle:'باب يُغلق في مكان ما بعيدًا. ليس في هذا المبنى.'}}});
/* FAKE + random: the lights surge then settle (lighting change). */
defEvent({id:'evt_light_surge',kind:'fake',random:true,weight:2,cooldown:40,scene:['slice_bld','apartment','hospital','school'],
  beats:[
    {at:0,effects:{light:{save:true,hemi:0.16,amb:0.07,flick:0.4},sound:{sfx:'glitch'},
      text:{subtitle:'الإضاءة ترتفع فجأة — كأن أحدًا ضغط مفتاحًا في غرفة أخرى.'}}},
    {at:2.5,effects:{lightRestore:{},fx:{distort:0.2}}},
  ]});
/* FAKE + random: the ambience itself changes (wind dies, a hum rises). */
defEvent({id:'evt_amb_shift',kind:'fake',random:true,weight:2,cooldown:45,
  effects:{sound:{noise:[1.6,90,0.7,0.05,'lowpass'],sfx:'dread'},
    text:{subtitle:'صوت المدينة تغيّر. الريح توقّفت، وبقي طنين خافت تحت الأرض.'}}});
/* FAKE + random: a whisper right by your ear. */
defEvent({id:'evt_whisper',kind:'fake',random:true,weight:2,cooldown:50,
  effects:{sound:{sfx:'whisper',speak:['you were here before',0.7,0.7,0.3]},echo:{add:0.03},
    text:{subtitle:'همسة قريبة جدًا من أذنك. لا أحد هناك.'}}});"""
rep("EVENT MANAGER + built-ins", OLD_B, NEW_B)

# ---------- C: main loop integration ----------
rep("loop EVT.update",
    "  updateAnoms(dt);\n  if(G.subtitleT>0){G.subtitleT-=dt;",
    "  updateAnoms(dt);\n  if(typeof EVT!=='undefined')EVT.update(dt);\n  if(G.subtitleT>0){G.subtitleT-=dt;")

# ---------- D: enterScene integration ----------
rep("enterScene EVT.onEnter",
    "  if(typeof E3!=='undefined')E3.builtFor=null;\n  if(!opt.silent){",
    "  if(typeof E3!=='undefined')E3.builtFor=null;\n  if(typeof EVT!=='undefined')EVT.onEnter(id);\n  if(!opt.silent){")

# ---------- E: puzzle reward can fire an event ----------
rep("PZ.reward evt hook",
    "    if(r.event){try{triggerAnomaly(r.event);}catch(e){}}\n    if(r.onReward){try{r.onReward();}catch(e){}}",
    "    if(r.event){try{triggerAnomaly(r.event);}catch(e){}}\n    if(r.evt){try{EVT.fire(r.evt,{trigger:'puzzle'});}catch(e){}}\n    if(r.onReward){try{r.onReward();}catch(e){}}")

# ---------- F: puzzle onComplete fires the aftermath event ----------
rep("puzzle onComplete -> EVT",
    "    note('انتهى «صندوق الشقّة». الشارع خلفك لم يعد كما كان.','story');\n    try{triggerAnomaly('static');}catch(e){}",
    "    note('انتهى «صندوق الشقّة». الشارع خلفك لم يعد كما كان.','story');\n    try{triggerAnomaly('static');}catch(e){}\n    try{EVT.fire('lockbox_aftermath',{trigger:'puzzle'});}catch(e){}")

# ---------- G/H: save / load evt ----------
rep("saveGame evt",
    "      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,docs:G.docs,tapes:G.tapes,syms:G.syms,",
    "      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,docs:G.docs,tapes:G.tapes,syms:G.syms,")
rep("loadGame evt",
    "    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},docs:d.docs||[],",
    "    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},docs:d.docs||[],")

io.open(P, "w", encoding="utf-8").write(s)
print("bytes %d -> %d" % (orig, len(s.encode("utf-8"))))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
