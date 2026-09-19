#!/usr/bin/env python3
# Phase 3: Environment System — additive ENV builder API + vertical-slice test district.
import re, sys
P = "/home/user/chernobyl/index.html"
s = open(P, encoding="utf-8").read()
orig_len = len(s)
edits = []

def sub_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        edits.append(("MISS(%d)" % n, label)); return
    s = s.replace(old, new, 1)
    edits.append(("ok", label))

# ============================================================ 1. ENV MODULE
anchor = """    note:opt.note,sprite:opt.sprite||'paper'});
}

/* =====================================================================
   SCENES
   ===================================================================== */
const SCENES={};"""

ENV = r"""    note:opt.note,sprite:opt.sprite||'paper'});
}

/* =====================================================================
   ENV — Environment System (Phase 3)
   ---------------------------------------------------------------------
   A reusable, data-driven builder for psychological-horror spaces.
   It writes into the SAME tile grid the rest of the engine already uses,
   so collision, AI flow-field navigation, anomalies, save/load and the
   3D mesh keep working with zero changes elsewhere.

   Structures are carved "solid-first": fill a footprint with wall, then
   punch floor pockets (rooms / corridors) and door openings. That makes
   single-thickness walls and doors-on-real-wall-rows the default, which
   is exactly what hand-authored maps keep getting wrong.

   Everything here is ADDITIVE — the nine shipped scenes are untouched.
   Future districts (city / hospital / forest / labs / underground) are
   just more scenes composed from these same primitives.
   ===================================================================== */
const ENV={
  _ambScene:null,_ambTimer:null,

  /* ---------- scene shell ---------- */
  scene(id,w,h,base,opts){
    opts=opts||{};
    const s=newScene(id,w,h,base,opts);
    s.zones=[];                       // named regions {name,x,y,w,h,kind}
    s.atmo=opts.atmo||null;           // {fog,hemi,amb,fogColor,bg}
    s.ambAudio=opts.audio||null;      // {wind,hum,windFreq,events:[{sfx,min,max}]}
    return s;
  },

  /* ---------- terrain ---------- */
  ground(s,type,x0,y0,x1,y1){
    x0=x0||0;y0=y0||0;x1=x1==null?s.w:x1;y1=y1==null?s.h:y1;
    rect(s.g,x0,y0,x1-x0,y1-y0,type);return s;},
  noise(s,seed,bands,x0,y0,x1,y1){noiseFill(s.g,seed,bands,x0,y0,x1,y1);return s;},
  road(s,a,b,w){road(s.g,a,b,w==null?2:w);return s;},
  plaza(s,x,y,w,h,type){rect(s.g,x,y,w,h,type||TL.F_CONC);
    s.zones.push({name:'plaza',x:x,y:y,w:w,h:h,kind:'open'});return s;},
  border(s,type){box(s.g,0,0,s.w,s.h,type||TL.WALL);return s;},

  /* ---------- structures (solid-first carving) ---------- */
  /* sealed exterior volume — reads as a building block from the street */
  block(s,x,y,w,h,opts){
    opts=opts||{};
    rect(s.g,x,y,w,h,opts.fill||TL.ROOF);
    box(s.g,x,y,w,h,TL.WALL);
    if(opts.label)s.sprites.push({x:x+w/2,y:y-0.6,type:'sign',text:opts.label});
    s.zones.push({name:opts.name||'building',x:x,y:y,w:w,h:h,kind:'solid'});
    return s;},

  /* enterable interior: shell + carved rooms/corridors + openings + doors.
     def={x,y,w,h,floor,
          corridors:[{x,y,w,h,floor,name}], rooms:[{x,y,w,h,floor,name}],
          walls:[{x,y,w,h}], openings:[{x,y,floor}], doors:[{x,y,...}]}
     Room/corridor coords are ABSOLUTE grid tiles. Leave >=1 wall tile between
     adjacent floor pockets, or they merge (validate() reports merges). */
  interior(s,def){
    rect(s.g,def.x,def.y,def.w,def.h,TL.WALL);                       // 1. solid footprint
    const cf=def.floor||TL.F_CONC;
    (def.corridors||[]).forEach(c=>{rect(s.g,c.x,c.y,c.w,c.h,c.floor||cf);
      if(c.name)s.zones.push({name:c.name,x:c.x,y:c.y,w:c.w,h:c.h,kind:'corridor'});});
    (def.rooms||[]).forEach(r=>{rect(s.g,r.x,r.y,r.w,r.h,r.floor||cf);
      if(r.name)s.zones.push({name:r.name,x:r.x,y:r.y,w:r.w,h:r.h,kind:'room'});});
    (def.walls||[]).forEach(wl=>rect(s.g,wl.x,wl.y,wl.w,wl.h,TL.WALL));      // partitions
    (def.openings||[]).forEach(o=>setT(s.g,o.x,o.y,o.floor||TL.F_CONC));     // open doorway
    (def.doors||[]).forEach(d=>ENV.door(s,d.x,d.y,d));                       // real doors
    return s;},

  /* a door: scene-link (opt.to) or in-scene openable passage */
  door(s,x,y,opt){
    opt=opt||{};
    if(opt.to)return addDoor(s,x,y,opt.to,opt.spawn,opt);
    setT(s.g,x,y,opt.locked?TL.LOCKDOOR:TL.DOOR);
    const d={type:'door',x:x,y:y,to:null,locked:!!opt.locked,need:opt.need||null,
      label:opt.label||'باب',msg:opt.msg||'',id:opt.id||('door_'+x+'_'+y),
      static:!!opt.static,inScene:true,open:false};
    s.ints.push(d);            // interactable only — NOT in s.doors (keeps save/load clean)
    return s;},

  /* ---------- atmosphere: realistic lighting + dark/bright zones ---------- */
  atmo(s,a){s.atmo=Object.assign(s.atmo||{},a);return s;},
  light(s,L){s.lights.push(L);return s;},
  /* bright pool: street lamp, window spill, fire */
  bright(s,x,y,r,color,a,flick){
    s.lights.push({x:x,y:y,r:r,c:color||'rgba(255,206,140,',a:a==null?0.16:a,flick:flick||0.06});
    s.zones.push({name:'bright',x:x-r,y:y-r,w:r*2,h:r*2,kind:'light'});return s;},
  /* explicitly dark region (recorded for validation / mood) */
  dark(s,x,y,w,h,name){s.zones.push({name:name||'dark',x:x,y:y,w:w,h:h,kind:'dark'});return s;},

  /* ---------- ambient audio zone ---------- */
  audio(s,a){s.ambAudio=Object.assign(s.ambAudio||{},a);return s;},
  startAmbient(s){
    if(!A.ready||!A.on)return;
    const au=s.ambAudio;if(!au||!au.events||!au.events.length){ENV._ambScene=null;return;}
    if(ENV._ambScene===s.id)return;
    ENV._ambScene=s.id;
    clearTimeout(ENV._ambTimer);
    const tick=()=>{
      if(ENV._ambScene!==s.id||G.sceneId!==s.id||!A.ready)return;
      const ev=au.events[(Math.random()*au.events.length)|0];
      const min=ev.min||8,max=ev.max||20;
      ENV._ambTimer=setTimeout(tick,(min+Math.random()*(max-min))*1000);
      if(G.paused||G.over||!G.started||!A.on)return;
      ENV.ambientSfx(ev.sfx);
    };
    ENV._ambTimer=setTimeout(tick,(au.events[0].min||8)*1000);
  },
  /* subtle, non-jump-scare ambience (design rule: horror via uncertainty) */
  ambientSfx(kind){
    if(!A.ready||!A.on)return;
    const t=A.ctx.currentTime;
    if(kind==='drip'){noiseBurst(0.05,1800,3,0.020,'bandpass');setTimeout(()=>noiseBurst(0.04,1500,3,0.014),180);}
    else if(kind==='creak'){tone(70+Math.random()*40,0.7,0.022,'sine',50);noiseBurst(0.5,240,1.2,0.018);}
    else if(kind==='distant'){noiseBurst(1.2,160,0.5,0.020);tone(48,1.6,0.020,'sine');}
    else if(kind==='metal'){noiseBurst(0.3,900,2,0.020);}
    else if(kind==='gust'&&A.wind){A.wind.g.gain.linearRampToValueAtTime(0.46,t+1.4);
      setTimeout(()=>{if(A.ready&&A.wind)A.wind.g.gain.linearRampToValueAtTime(G.scene&&G.scene.ambAudio?G.scene.ambAudio.wind:0.2,A.ctx.currentTime+1.6);},2600);}
  },

  /* ---------- props ---------- */
  prop(s,x,y,type,opts){const o={x:x,y:y,type:type};if(opts)Object.assign(o,opts);s.sprites.push(o);return s;},
  scatter(s,types,n,x0,y0,x1,y1,opts){
    opts=opts||{};scatterSpr(s,mulberry32(opts.seed||1234),types,n,x0,y0,x1,y1,opts.avoidSolid);return s;},
  hide(s,x,y,label,id){return addInt(s,{type:'hide',x:x,y:y,label:label||'اختبئ',id:id||('hide_'+x+'_'+y)});},

  /* ---------- navigation / validation ---------- */
  /* flood-fill navigable tiles from (sx,sy). Doors count as passable (openable);
     LOCKDOOR does not (needs a key). Used for nav-readiness + tests. */
  reachable(s,sx,sy){
    const W=s.w,H=s.h,seen=new Uint8Array(W*H),q=[];
    const pass=(x,y)=>{const t=getT(s.g,x,y);return t===TL.DOOR||!solidT(t);};
    const push=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return;const i=y*W+x;if(seen[i]||!pass(x,y))return;seen[i]=1;q.push(i);};
    push(Math.floor(sx),Math.floor(sy));
    for(let k=0;k<q.length;k++){const i=q[k],x=i%W,y=(i/W)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
    return seen;},
  /* full integrity report — nav-readiness, spawn safety, door/interactable reach */
  validate(s,spawn){
    const problems=[],sp=spawn||s.spawn,W=s.w;
    const pass=(x,y)=>{const t=getT(s.g,x,y);return t===TL.DOOR||!solidT(t);};
    if(!pass(Math.floor(sp.x),Math.floor(sp.y)))problems.push('spawn is inside a solid tile');
    const seen=ENV.reachable(s,sp.x,sp.y);
    for(const d of s.doors){
      const near=[[1,0],[-1,0],[0,1],[0,-1]].some(p=>{const x=d.x+p[0],y=d.y+p[1];
        return x>=0&&y>=0&&x<s.w&&y<s.h&&seen[y*W+x];});
      if(!near)problems.push('door '+(d.id||d.x+','+d.y)+' unreachable');
    }
    for(const it of s.ints){
      if(it.type==='locked')continue;
      const x=Math.floor(it.x),y=Math.floor(it.y);
      if(x<0||y<0||x>=s.w||y>=s.h)continue;
      if(!seen[y*W+x])problems.push('interactable '+(it.id||it.type)+' unreachable');
    }
    let nav=0,reach=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)if(pass(x,y)){nav++;if(seen[y*W+x])reach++;}
    if(reach<nav)problems.push((nav-reach)+' navigable tiles sealed off from spawn');
    return {ok:problems.length===0,problems:problems,nav:nav,reach:reach,seen:seen};},
};

/* =====================================================================
   SCENES
   ===================================================================== */
const SCENES={};"""
sub_once(anchor, ENV, "ENV module")

# ============================================================ 2. SLICE SCENES + register
anchor2 = """/* ------------------------------ build all ------------------------------ */
function buildAllScenes(){
  SCENES.outdoor=buildOutdoor();"""

SLICE = r"""/* =====================================================================
   VERTICAL SLICE — "قطاع اختبار" (Phase 3 test district)
   A small, complete cross-section of an abandoned city block, built
   entirely from the ENV API to prove the system before the full map:
     slice      = exterior street (bright spine + dark alley + courtyard)
     slice_bld  = one enterable building interior (rooms/corridor/doors)
   Navigation-ready, collision-complete, lit with dark & bright zones,
   fog + per-scene ambience. Scales to city/hospital/forest/labs/underground.
   ===================================================================== */
function buildSlice(){
  const W=44,H=36;
  const s=ENV.scene('slice',W,H,TL.GRASS,{name:'قطاع اختبار — وسط المدينة',
    spawn:{x:21.5,y:17.5},safe:{scene:'slice',x:21.5,y:17.5},
    atmo:{fog:0.060,hemi:0.13,amb:0.040,fogColor:0x070a0e,bg:0x070a0e},
    audio:{wind:0.34,hum:0.0,windFreq:430,
      events:[{sfx:'gust',min:12,max:26},{sfx:'distant',min:16,max:34},{sfx:'metal',min:20,max:40}]}});
  const g=s.g;
  /* --- ground: overgrown, uneven, irradiated-looking --- */
  ENV.noise(s,41,[[TL.GRASS,0.50],[TL.F_DIRT,0.72],[TL.RUB,0.80],[TL.GRASS,1.01]]);
  /* --- main street = the bright spine of the slice --- */
  ENV.road(s,[3,17],[40,17],2);
  ENV.plaza(s,3,14,38,1,TL.F_CONC);          // north sidewalk
  ENV.plaza(s,3,20,38,1,TL.F_CONC);          // south sidewalk
  /* --- apartment block (enterable) --- */
  ENV.block(s,7,5,11,8,{label:'مبنى سكني ٤',name:'apt'});
  ENV.plaza(s,11,13,3,2,TL.F_CONC);          // approach
  ENV.door(s,12,12,{to:'slice_bld',spawn:{x:10.5,y:13.5},label:'ادخل — المبنى السكني',id:'slice_apt_door'});
  /* --- shop (sealed / deco) --- */
  ENV.block(s,25,5,9,7,{label:'متجر «بريبات»',name:'shop'});
  addInt(s,{type:'locked',x:29.5,y:12.6,label:'متجر',msg:'الواجهة مغلقة بألواح خشبية من الداخل.'});
  s.sprites.push({x:29.5,y:12.2,type:'debris'});
  /* --- courtyard (mixed light, south) --- */
  ENV.plaza(s,13,22,18,9,TL.F_CONC);
  /* --- alley (dark passage linking street -> courtyard) --- */
  rect(g,13,20,2,3,TL.F_DIRT);
  rect(g,12,20,1,2,TL.RUB);rect(g,15,20,1,2,TL.RUB);
  ENV.dark(s,12,20,4,4,'الزقاق');
  /* --- rubble wall + gate out of the district (connects to the main game) --- */
  rect(g,13,31,18,1,TL.RUB);
  ENV.door(s,22,31,{to:'outdoor',spawn:{x:25.5,y:25.5},label:'اترك القطاع — موقع التحطّم',id:'slice_exit'});
  /* --- lighting: bright street lamps vs dark corners --- */
  [[6,14],[16,20],[26,14],[36,20]].forEach((p,i)=>{
    ENV.prop(s,p[0]+0.5,p[1]+0.5,'lamp');
    if(i%2===0)ENV.bright(s,p[0]+0.5,p[1]+0.5,6.0,'rgba(255,206,140,',0.15,0.07);
    else ENV.light(s,{x:p[0]+0.5,y:p[1]+0.5,r:5.0,c:'rgba(255,206,140,',a:0.10,flick:0.05,broken:i===3});
  });
  ENV.bright(s,22,26,5.0,'rgba(210,225,235,',0.07,0.04);   // pale courtyard light
  ENV.dark(s,7,5,11,8,'ظل المبنى');
  /* --- props: a city that left in a hurry --- */
  ENV.prop(s,18,16.4,'car');ENV.prop(s,33,17.6,'car');ENV.prop(s,9,18.4,'bus');
  ENV.prop(s,16,25,'bench');ENV.prop(s,27,25,'bench');ENV.prop(s,21,27,'statue');
  ENV.prop(s,12,23,'dead');ENV.prop(s,31,29,'dead');ENV.prop(s,8,29,'tree');
  ENV.scatter(s,['debris','paper','puddle','crate'],40,4,14,40,31,{seed:7,avoidSolid:true});
  ENV.scatter(s,['bush','grass2'],26,4,21,40,31,{seed:9,avoidSolid:true});
  ENV.scatter(s,['car'],5,4,21,40,30,{seed:11,avoidSolid:true});
  /* --- a couple of environment-storytelling interactables --- */
  addInt(s,{type:'doc',x:21.4,y:27.4,id:'doc_slice_note',label:'ورقة تحت الحجر',doc:'photo_family',sprite:'paper'});
  ENV.hide(s,16.4,25.4,'اختبئ خلف المقعد','slice_hide1');
  /* --- exit sign so the tester knows the loop is closed --- */
  s.sprites.push({x:22.5,y:30.4,type:'sign',text:'القطاع ← المدينة'});
  return s;
}
function buildSliceInterior(){
  const s=ENV.scene('slice_bld',22,18,TL.WALL,{indoor:true,name:'المبنى السكني — الطابق الأرضي',
    spawn:{x:10.5,y:13.5},safe:{scene:'slice_bld',x:10.5,y:13.5},
    atmo:{fog:0.095,hemi:0.055,amb:0.020,fogColor:0x030406,bg:0x030406},
    audio:{wind:0.05,hum:0.035,windFreq:240,
      events:[{sfx:'drip',min:6,max:16},{sfx:'creak',min:12,max:28}]}});
  /* solid-first interior: corridor spine + four rooms, open doorways + one real door */
  ENV.interior(s,{x:2,y:2,w:18,h:14,floor:TL.F_WOOD,
    corridors:[{x:9,y:4,w:3,h:11,floor:TL.F_CONC,name:'الممر'}],
    rooms:[
      {x:4,y:4,w:4,h:5,floor:TL.F_WOOD,name:'غرفة المعيشة'},
      {x:13,y:4,w:5,h:5,floor:TL.F_WOOD,name:'غرفة النوم'},
      {x:4,y:11,w:4,h:4,floor:TL.F_TILE,name:'المطبخ'},
      {x:13,y:11,w:5,h:4,floor:TL.F_TILE,name:'الحمّام'}],
    openings:[{x:8,y:6},{x:12,y:6},{x:8,y:12}],          // living / bedroom / kitchen
    doors:[
      {x:12,y:12,label:'باب الحمّام',id:'sb_bath'},        // one real openable door
      {x:10,y:15,to:'slice',spawn:{x:12.5,y:13.5},label:'اخرج إلى الشارع',id:'sb_exit'}]});
  /* --- props --- */
  const P=(x,y,t)=>s.sprites.push({x:x,y:y,type:t});
  P(5,5,'sofa');P(7,7.4,'table');P(4.6,8,'tv');P(7.4,4.6,'plant');
  P(14,5,'bed');P(17,5,'wardrobe');P(15,8,'drawer');
  P(5,12,'stove');P(7,12,'sink');P(5,14,'table');
  P(14,12,'tub');P(17,14,'toilet');P(14,14,'sink');
  P(10,5,'debris');P(10,11,'paper');P(9,8,'crate');
  /* --- lighting: one warm bulb (bright) vs pitch-dark kitchen/bath --- */
  ENV.bright(s,5.5,6,3.6,'rgba(255,214,150,',0.12,0.09);          // living room lamp
  ENV.light(s,{x:10,y:8,r:3.0,c:'rgba(200,220,255,',a:0.05,flick:0.18}); // dying corridor bulb
  ENV.dark(s,4,11,4,4,'المطبخ');ENV.dark(s,13,11,5,4,'الحمّام');
  /* --- interactables: hide spot, a document, batteries --- */
  ENV.hide(s,17,5,'اختبئ داخل الخزانة','sb_hide1');
  addInt(s,{type:'doc',x:7,y:7.4,id:'doc_slice_apt',label:'مذكرة على الطاولة',doc:'diary',sprite:'paper'});
  addInt(s,{type:'item',x:5,y:14,key:'batteries',label:'بطاريات',id:'sb_batt',sprite:'box',
    note:'بطاريات للكشاف. ما زالت تعمل.'});
  return s;
}

/* ------------------------------ build all ------------------------------ */
function buildAllScenes(){
  SCENES.slice=buildSlice();
  SCENES.slice_bld=buildSliceInterior();
  SCENES.outdoor=buildOutdoor();"""
sub_once(anchor2, SLICE, "slice scenes + register")

# ============================================================ 3. build3D atmosphere override
sub_once(
"""  /* atmosphere */
  E3.scene.fog.density=s.indoor?0.085:0.048;
  E3.hemi.intensity=s.indoor?0.085:0.20;
  E3.amb.intensity=s.indoor?0.028:0.05;
  E3.scene.background=new THREE.Color(s.indoor?0x030406:0x05070c);
  E3.scene.fog.color.set(s.indoor?0x030406:0x05070c);""",
"""  /* atmosphere — per-scene override (ENV.atmo) else indoor/outdoor default */
  const AT=s.atmo||{};
  E3.scene.fog.density=AT.fog!=null?AT.fog:(s.indoor?0.085:0.048);
  E3.hemi.intensity=AT.hemi!=null?AT.hemi:(s.indoor?0.085:0.20);
  E3.amb.intensity=AT.amb!=null?AT.amb:(s.indoor?0.028:0.05);
  const BG=AT.bg!=null?AT.bg:(s.indoor?0x030406:0x05070c);
  E3.scene.background=new THREE.Color(BG);
  E3.scene.fog.color.set(AT.fogColor!=null?AT.fogColor:BG);""",
"build3D atmo override")

# ============================================================ 4. audioBed ambAudio + ambient events
sub_once(
"""function audioBed(){
  if(!A.ready)return;
  const s=G.scene;if(!s)return;
  const t=A.ctx.currentTime;
  A.wind.g.gain.linearRampToValueAtTime(s.indoor?0.05:0.30,t+1.6);
  A.wind.f.frequency.linearRampToValueAtTime(s.indoor?260:520,t+1.6);
  A.hum.gain.linearRampToValueAtTime(s.indoor?0.035:0.0,t+1.6);
}""",
"""function audioBed(){
  if(!A.ready)return;
  const s=G.scene;if(!s)return;
  const t=A.ctx.currentTime,au=s.ambAudio||{};
  A.wind.g.gain.linearRampToValueAtTime(au.wind!=null?au.wind:(s.indoor?0.05:0.30),t+1.6);
  A.wind.f.frequency.linearRampToValueAtTime(au.windFreq||(s.indoor?260:520),t+1.6);
  A.hum.gain.linearRampToValueAtTime(au.hum!=null?au.hum:(s.indoor?0.035:0.0),t+1.6);
  ENV.startAmbient(s);
}""",
"audioBed ambAudio")

# ============================================================ 5. menu button
sub_once(
"""      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>
    </div>""",
"""      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>
      <button class="btn" id="btnSlice">اختبار البيئة (Vertical Slice)</button>
    </div>""",
"menu button")

# ============================================================ 6. startSliceTest (before boot)
sub_once(
"""  G.flags.psyEnabled=false;
  saveGame(true);
}
function boot(){""",
"""  G.flags.psyEnabled=false;
  saveGame(true);
}
/* Enter the Phase-3 environment vertical slice directly (test/preview). */
function startSliceTest(){
  audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
  buildAllScenes();
  G.player=newPlayer();
  G.sceneId='slice';
  $('menu').classList.add('hide');$('hud').classList.remove('hide');
  E3.builtFor=null;G.started=true;G.over=false;
  const f=$('fade');f.style.opacity=1;
  enterScene('slice',SCENES.slice.spawn,{silent:true});
  G.visits.slice=1;
  setTimeout(()=>{f.style.opacity=0;},400);
  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';
  toast('قطاع اختبار — البيئة','ENVIRONMENT VERTICAL SLICE');
  setObjective('اختبر البيئة: امشِ في الشارع، ادخل المبنى، لاحظ الإضاءة والضباب','WASD حركة • الفأرة نظر • E تفاعل/أبواب • F كشاف');
  note('قطاع اختبار صغير يمثل جزءًا من مدينة مهجورة. مبني بالكامل عبر نظام البيئة (ENV).','env');
  saveGame(true);
}
function boot(){""",
"startSliceTest")

# ============================================================ 7. boot wiring
sub_once(
"""  $('btnCam2').onclick=()=>{resetCam();};""",
"""  $('btnCam2').onclick=()=>{resetCam();};
  const bs=$('btnSlice');if(bs)bs.onclick=()=>startSliceTest();""",
"boot wiring")

open(P, "w", encoding="utf-8").write(s)
js = re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open("/tmp/game.js", "w", encoding="utf-8").write(js)
for st, lb in edits:
    print("%-9s %s" % (st, lb))
print("bytes %d -> %d" % (orig_len, len(s)))
miss = [e for e in edits if e[0] != "ok"]
print("MISSES:", len(miss))
sys.exit(0 if not miss else 1)
