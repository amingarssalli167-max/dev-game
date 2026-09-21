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

# ---------- 1. G.story slot ----------
rep("G.story slot",
    "  evt:{done:{},cd:{}},  // event manager state (fired once-flags + cooldowns)",
    "  evt:{done:{},cd:{}},  // event manager state (fired once-flags + cooldowns)\n"
    "  story:null,      // Story System state (Phase 10): {chapter,obj,doneObj,doneEvt,vars,complete,log}")

# ---------- 2. save ----------
rep("saveGame story",
    "echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,docs:G.docs,tapes:G.tapes,syms:G.syms,",
    "echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,story:G.story,docs:G.docs,tapes:G.tapes,syms:G.syms,")

# ---------- 3. load ----------
rep("loadGame story",
    "flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},docs:d.docs||[],",
    "flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},story:d.story||null,docs:d.docs||[],")

# ---------- 4. enterScene hook ----------
rep("enterScene STORY.onEnter",
    "  if(typeof EVT!=='undefined')EVT.onEnter(id);\n  if(!opt.silent){",
    "  if(typeof EVT!=='undefined')EVT.onEnter(id);\n  if(typeof STORY!=='undefined')STORY.onEnter(id);\n  if(!opt.silent){")

# ---------- 5. loop hook ----------
rep("loop STORY.update",
    "  if(typeof EVT!=='undefined')EVT.update(dt);\n",
    "  if(typeof EVT!=='undefined')EVT.update(dt);\n  if(typeof STORY!=='undefined')STORY.update(dt);\n")

# ---------- 6. notebook quest tab ----------
rep("notebook quest section",
    "  if(NB.tab==='obj'){\n    b.appendChild(entry('الهدف الحالي',G.objective||'—'));",
    "  if(NB.tab==='obj'){\n"
    "    const pr=(typeof STORY!=='undefined')?STORY.progress():null;\n"
    "    if(pr&&pr.chapter){\n"
    "      b.appendChild(entry(pr.title||'الفصل',pr.subtitle||''));\n"
    "      pr.objectives.forEach(o=>{ if(!o.revealed)return;\n"
    "        b.appendChild(entry((o.done?'✓ ':o.active?'▶ ':'· ')+o.text, o.done?'مكتملة':(o.hint||''))); });\n"
    "      if(pr.complete)b.appendChild(entry('— انتهى الفصل —','يتبع…'));\n"
    "    }\n"
    "    b.appendChild(entry('الهدف الحالي',G.objective||'—'));")

# ---------- 7. STORY module + Chapter 1 (before saveGame) ----------
STORY_BLOCK = r"""/* =====================================================================
   STORY SYSTEM (Phase 10) — a modular, data-driven Story State Machine.
   The narrative is NOT one blob; it is composed of registries:
     CHAPTERS   : ordered quest chains  {id,title,subtitle,intro,objectives[],events[],outro,onComplete}
     STORYEVTS  : narrative beats fired by condition/trigger {id,once,scene,when,effects,run}
     Objectives : quests with when(ctx) completion + onStart/onComplete/toast/note/world
     Dialogues  : reuse the existing dialogue() engine (data = arrays of lines)
     Flags      : reuse G.flags (saved) + G.story.vars for chapter-local state
     World      : STORY.world rules mutate scenes on enter as progress changes
   State lives in G.story (saved/loaded). The engine only READS the player/scene.
   Add a chapter = defChapter({...});  add a beat = defStoryEvent({...});
   add a world rule = STORY.defWorld({...}).  Nothing is hard-wired.
   ===================================================================== */
const CHAPTERS={};
const STORYEVTS={};
function defChapter(c){CHAPTERS[c.id]=c;return c;}
function defStoryEvent(e){STORYEVTS[e.id]=e;return e;}
function defaultStory(){return {chapter:null,started:{},obj:null,doneObj:{},doneEvt:{},vars:{},complete:{},log:[]};}
const STORY={
  world:[],
  defWorld(w){STORY.world.push(w);return w;},
  ctx(){return {P:G.player,scene:G.scene,sceneId:G.sceneId,flags:G.flags,visits:G.visits,items:G.items,
    story:G.story,echo:G.echo,layer:G.layer,time:G.time,
    has:hasItem,visited:id=>(G.visits[id]||0)>0,done:id=>!!(G.story&&G.story.doneObj[id]),
    var:k=>G.story?G.story.vars[k]:undefined};},
  chapter(){return (G.story&&CHAPTERS[G.story.chapter])||null;},
  log(k,id){if(!G.story)return;G.story.log.push({k:k,id:id,t:Math.floor(G.time)});if(G.story.log.length>80)G.story.log.shift();},
  flag(k,v){G.flags[k]=(v===undefined?true:v);},
  has(k){return !!G.flags[k];},
  setVar(k,v){if(G.story)G.story.vars[k]=v;},
  getVar(k){return G.story?G.story.vars[k]:undefined;},
  /* ---- lifecycle ---- */
  start(chId){
    const ch=CHAPTERS[chId];if(!ch)return false;
    if(!G.story)G.story=defaultStory();
    if(G.story.started[chId])return false;
    G.story.started[chId]=true;G.story.chapter=chId;G.story.complete[chId]=false;
    STORY.log('chapter',chId);
    const it=ch.intro;
    if(it){
      if(it.card)flashMsg(it.card,it.cardDur||2600);
      if(it.title)toast(it.title,it.subtitle||('CHAPTER — '+chId.toUpperCase()));
      if(it.note)note(it.note,'story');
      if(it.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(it.lines);},it.delay||1200);
    }
    STORY._refreshActive(ch);
    STORY.onEnter(G.sceneId);
    return true;
  },
  _setActive(ch,o){
    G.story.obj=o.id;STORY.log('obj',o.id);
    if(o.text)setObjective(o.text,o.sub||'');
    if(o.setFlag)G.flags[o.setFlag]=true;
    if(o.onStart){try{o.onStart(STORY.ctx());}catch(e){}}
  },
  _refreshActive(ch){
    for(const o of ch.objectives){ if(!G.story.doneObj[o.id]){ if(G.story.obj!==o.id)STORY._setActive(ch,o); return; } }
    STORY._chapterComplete(ch);
  },
  activeObjective(){const ch=STORY.chapter();if(!ch||!G.story)return null;
    return ch.objectives.find(o=>o.id===G.story.obj)||null;},
  complete(objId){
    const ch=STORY.chapter();if(!ch)return false;
    const o=ch.objectives.find(x=>x.id===objId);if(!o||G.story.doneObj[objId])return false;
    G.story.doneObj[objId]=true;STORY.log('done',objId);
    if(o.onComplete){try{o.onComplete(STORY.ctx());}catch(e){}}
    if(o.flag)G.flags[o.flag]=true;
    if(o.note)note(o.note,'story');
    if(o.toast)toast(o.toast[0],o.toast[1]);
    if(o.world){try{o.world(G.scene);}catch(e){}}
    STORY._refreshActive(ch);
    return true;
  },
  _chapterComplete(ch){
    if(G.story.complete[ch.id])return;
    G.story.obj=null;G.story.complete[ch.id]=true;STORY.log('complete',ch.id);
    const o=ch.outro;
    if(o){
      if(o.note)note(o.note,'story');
      if(o.card)setTimeout(()=>flashMsg(o.card,o.cardDur||2800),o.cardDelay||600);
      if(o.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(o.lines);},o.delay||1600);
      if(o.objective)setTimeout(()=>{if(!G.over)setObjective(o.objective[0],o.objective[1]);},o.objDelay||5200);
    }
    if(ch.onComplete){try{ch.onComplete(STORY.ctx());}catch(e){}}
  },
  /* ---- narrative beats ---- */
  trigger(evtId,ctxArg){
    const e=STORYEVTS[evtId];if(!e||!G.story)return false;
    if(e.once&&G.story.doneEvt[evtId])return false;
    const ctx=ctxArg||STORY.ctx();
    if(e.scene&&e.scene!==G.sceneId)return false;
    if(e.when){let ok=false;try{ok=!!e.when(ctx);}catch(x){ok=false;}if(!ok)return false;}
    G.story.doneEvt[evtId]=true;STORY.log('evt',evtId);
    STORY._runEffects(e,ctx);
    return true;
  },
  _runEffects(e,ctx){
    const fx=e.effects||{};
    if(fx.flag)for(const k in fx.flag)G.flags[k]=fx.flag[k];
    if(fx.var)for(const k in fx.var)G.story.vars[k]=fx.var[k];
    if(fx.echo!=null)G.echo=Math.max(G.echo,fx.echo);
    if(fx.item)addItemKey(fx.item);
    if(fx.sfx&&SFX[fx.sfx])SFX[fx.sfx]();
    if(fx.subtitle)subtitle(fx.subtitle[0]||'',fx.subtitle[1]||fx.subtitle);
    if(fx.toast)toast(fx.toast[0],fx.toast[1]);
    if(fx.note)note(fx.note,'story');
    if(fx.world&&G.scene){try{fx.world(G.scene);}catch(x){}}
    if(fx.objective)setObjective(fx.objective[0],fx.objective[1]);
    if(fx.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(fx.lines,e.run?()=>{try{e.run(ctx);}catch(x){}}:undefined);},fx.delay||300);
    else if(e.run){try{e.run(ctx);}catch(x){}}
  },
  /* ---- per-frame driver: quest progression + eligible beats ---- */
  update(dt){
    if(!G.started||G.over||G.sceneId==='ai_arena')return;
    if(!G.story)G.story=defaultStory();
    if(!G.story.chapter){STORY.start('ch1');}
    const ch=STORY.chapter();if(!ch)return;
    const ctx=STORY.ctx();
    /* auto-complete any objective whose condition is now met (order-safe, no soft-lock) */
    for(const o of ch.objectives){
      if(G.story.doneObj[o.id]||!o.when)continue;
      let done=false;try{done=!!o.when(ctx);}catch(e){}
      if(done)STORY.complete(o.id);
    }
    /* fire eligible chapter beats */
    if(ch.events)for(const id of ch.events){
      const e=STORYEVTS[id];if(!e||(e.once&&G.story.doneEvt[id]))continue;
      if(e.scene&&e.scene!==G.sceneId)continue;
      let ok=true;try{ok=e.when?!!e.when(ctx):true;}catch(x){ok=false;}
      if(ok)STORY.trigger(id,ctx);
    }
  },
  /* ---- on scene enter: apply persistent world-state that depends on progress ---- */
  onEnter(sceneId){
    if(!G.story)return;
    for(const w of STORY.world){
      if(w.scene&&w.scene!==sceneId)continue;
      if(G.story.vars['__w_'+w.id])continue;
      const ctx=STORY.ctx();let ok=true;try{ok=w.when?!!w.when(ctx):true;}catch(e){ok=false;}
      if(ok&&G.scene){try{w.apply(G.scene,ctx);G.story.vars['__w_'+w.id]=1;G.scene.dirty=true;}catch(e){}}
    }
  },
  /* ---- quest-progress view (notebook) ---- */
  progress(){
    const out={chapter:null,title:'',subtitle:'',objectives:[],complete:false};
    const ch=STORY.chapter();if(!ch)return out;
    out.chapter=ch.id;out.title=ch.title||'';out.subtitle=ch.subtitle||'';out.complete=!!G.story.complete[ch.id];
    for(const o of ch.objectives){
      const done=!!G.story.doneObj[o.id],active=(!done&&G.story.obj===o.id);
      out.objectives.push({id:o.id,text:o.text||'',hint:o.hint||'',done:done,active:active,revealed:done||active});
    }
    return out;
  },
};

/* =====================================================================
   CHAPTER 1 — «السقوط / THE FALL» · 2026
   Alexei's aircraft comes down near the Zone; he reaches Pripyat, explores,
   finds a trace of his mother, and arrives at the hospital where the first
   impossible thing happens. The past (1986) and the project are only HINTED.
   (Chapters 2+ — the underground — are intentionally NOT written yet.)
   ===================================================================== */
defChapter({
  id:'ch1',
  title:'الفصل الأول — السقوط',
  subtitle:'CHAPTER I · THE FALL · 2026 · PRIPYAT',
  intro:{
    card:'الفصل الأول — السقوط',cardDur:2800,
    note:'تحطّمت طائرتي شمال منطقة الحظر. الحرب خلف الدخان، وأمامي مدينة قالوا إنها ماتت سنة 1986.',
    delay:4200,
    lines:[
      {who:'ALEXEI',t:'المحرّك مات على ارتفاع أربعة آلاف متر. لم يكن صاروخًا. شيءٌ ما سحب الطائرة إلى الأسفل.'},
      {who:'ALEXEI',t:'الخريطة تقول: منطقة حظر. لا أحد هنا منذ أربعين سنة.'},
      {who:'ALEXEI',t:'إذن لماذا بعض أضواء المدينة ما زالت مضاءة؟',sfx:'whisper'},
    ]
  },
  objectives:[
    {id:'ch1_reach_city',
     text:'اترك الحطام واتجه جنوبًا إلى المدينة',sub:'الدخان خلفك. لا تعود إليه.',
     hint:'اخرج من الغابة إلى الشارع.',
     when:c=>!!G.flags.cityEntered||(G.visits.slice>0),
     toast:['بريبيات','51.406°N 30.054°E'],
     note:'وصلت إلى بريبيات. عدّاد جايجر لا يتوقّف، لكن المدينة تبدو… معتَنى بها.',
     flag:'ch1_city'},
    {id:'ch1_shelter',
     text:'ابحث عن مأوى — ادخل أحد المباني',sub:'الليل يقترب. شيءٌ ما يتحرّك بين العمارات.',
     hint:'جرّب أبواب الشقق والمتاجر.',
     when:c=>(G.visits.slice_bld>0)||(G.visits.apartment>0),
     flag:'ch1_inside'},
    {id:'ch1_trace',
     text:'ابحث عن أثر — أحدهم ترك شيئًا هنا',sub:'تسجيلٌ باسم «إيلينا». ابحث في الشقق.',
     hint:'مشغّل أشرطة أو شريط. في الشقق.',
     when:c=>hasItem('tapeplayer')||hasItem('tape1')||!!G.flags.tapeReady,
     toast:['إيلينا','اسمٌ تعرفه'],
     note:'«إيلينا». هذا اسم أمي. لماذا يوجد تسجيلٌ لها في مدينةٍ ماتت قبل أن أولد؟',
     flag:'ch1_elena'},
    {id:'ch1_hospital',
     text:'اتجه إلى المستشفى',sub:'المبنى الوحيد الذي ما زال التيّار يصل إليه.',
     hint:'اتبع الكابلات/الضوء.',
     when:c=>(G.visits.hospital>0),
     flag:'ch1_hospital'},
    {id:'ch1_anomaly',
     text:'اكتشف ما يحدث — اعثر على أول شذوذ في المستشفى',sub:'أربعون سنة من الهجر… لكن شيئًا هنا يعمل.',
     hint:'افحص المبنى. شيءٌ ما لا يتطابق.',
     when:c=>!!G.flags.ch1_anomalySeen},
  ],
  events:['ch1_city_echo','ch1_hospital_anomaly'],
  outro:{
    note:'تحت المستشفى، المصعد لا يصعد. ينزل فقط. وفي السجلّ اسمٌ مألوف: VOLKOVA.',
    card:'— 1986 —',cardDur:2600,cardDelay:800,
    delay:2000,
    lines:[
      {who:'ALEXEI',t:'سجلّ المستشفى، سنة 1986. مريضة: VOLKOVA، إيلينا. هذا… اسم أمي.'},
      {who:'???',t:'أنت متأخّرٌ أربعين سنةً، يا كابتن.',sfx:'whisper',speak:'You are forty years late, captain.'},
      {who:'ALEXEI',t:'مَن قال هذا؟ …المصعد. المصعد يعمل. لم يلمسه أحد منذ 1986.'},
      {who:'ALEXEI',t:'الأزرار كلها مطفأة إلّا واحدًا. ينزل. لا يوجد زرٌّ للصعود.'},
    ],
    objective:['انزل — المستشفى ليست النهاية','الفصل الثاني: ما تحت بريبيات (قريبًا)'],
    objDelay:6200
  },
  onComplete:()=>{G.flags.ch1_complete=true;}
});

/* ---- Chapter 1 narrative beats ---- */
defStoryEvent({id:'ch1_city_echo',once:true,scene:'slice',
  when:c=>(G.visits.slice>0)&&!!G.flags.cityEntered,
  effects:{echo:0.10,
    subtitle:['','لافتة سوفياتية: «مجدًا للعمّال». وتحتها، بخطٍّ حديثٍ وحبرٍ لم يجفّ: «لا تنزل».'],
    note:'تحذيرٌ كُتب حديثًا على لافتة من سنة 1986. أحدٌ ما ما زال يكتب هنا.'}});
defStoryEvent({id:'ch1_hospital_anomaly',once:true,scene:'hospital',
  when:c=>(G.visits.hospital>0)&&!!G.flags.ch1_hospital,
  effects:{echo:0.30,sfx:'dread',flag:{ch1_anomalySeen:true},
    subtitle:['','في آخر الرواق: مصعدٌ يعمل. لوحة الطوابق تُظهر −2. لا يوجد طابق −2 في أيّ مخطّط.'],
    note:'المستشفى: مصعدٌ يعمل وحده وينزل إلى طابقٍ غير موجود. هذا أول شيءٍ لا أستطيع تفسيره.',
    world:function(s){let n=0;for(const L of (s.lights||[])){if(n<2){L.flick=(L.flick||0)+0.10;n++;}}}}});

/* ---- Chapter 1 world-state: the city reacts to what you learn ---- */
STORY.defWorld({id:'w_ch1_wake',scene:'slice',
  when:c=>!!G.flags.ch1_anomalySeen&&!G.flags.power,
  apply:function(s){let n=0;for(const L of (s.lights||[]))if(L.broken&&n<3){L.broken=false;n++;}
    if(n){subtitle('','بعدما رأيت المصعد، أضاءت ثلاثة مصابيح شارعٍ من تلقاء نفسها.');
      note('ثلاثة مصابيح اشتغلت في بريبيات بعد شذوذ المستشفى. التيّار مقطوعٌ منذ 1986.','story');}}});

"""
rep("STORY module + Chapter 1", "function saveGame(auto){", STORY_BLOCK + "function saveGame(auto){")

io.open(P, "w", encoding="utf-8").write(s)
print("bytes %d -> %d" % (orig, len(s.encode("utf-8"))))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
