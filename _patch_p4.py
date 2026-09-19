#!/usr/bin/env python3
# Phase 4: Central modular Interaction System (registry + gaze focus + 3D indicator).
import re, sys
P = "/home/user/chernobyl/index.html"
s = open(P, encoding="utf-8").read()
orig = len(s)
log = []
def sub1(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        log.append(("MISS(%d)" % n, label)); return False
    s = s.replace(old, new, 1); log.append(("ok", label)); return True

# ---------------------------------------------------------------- 1. INTERACTION block
OLD_BLOCK = r"""/* =====================================================================
   INTERACTION
   ===================================================================== */
let curInt=null;
function updateHint(){
  const e=$('inter'),P=G.player,s=G.scene;
  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open){e.style.opacity=0;curInt=null;return;}
  let best=null,bd=2.3;
  const cand=[];
  for(const it of s.ints)if(!it.used)cand.push(it);
  for(const en of s.entsLive||[]){
    if(en.type==='nika'&&en.vis>0.3)cand.push({type:'talk',x:en.x,y:en.y,ent:en,label:'تحدّث'});
    if(en.type==='rex'&&!en.joined)cand.push({type:'rex',x:en.x,y:en.y,ent:en,label:'نادِه'});
  }
  for(const c of cand){
    const d=dist(P.x,P.y,c.x,c.y);
    if(d<bd){
      if(c.locked&&c.need&&!hasItem(c.need)&&c.type==='door'){ /* still show */ }
      bd=d;best=c;
    }
  }
  curInt=best;
  if(best){
    e.style.opacity=1;
    e.querySelector('.k').textContent=best.type==='hide'?'H':'E';
    let lbl=best.label||'تفاعل';
    if(best.type==='door'){
      if(best.locked){
        if(best.power&&!G.flags.power)lbl='مقفل — لا يوجد تيار';
        else if(best.need&&!hasItem(best.need))lbl='مقفل — تحتاج: '+itemName(best.need);
        else if(best.need==='echo2'&&!G.flags.echo2)lbl='مقفل — المصعد لا يستجيب';
      }else lbl=(best.to==='outdoor'?'اخرج':(best.label||'ادخل'));
    }
    if(best.type==='final'){
      if(!hasItem('doc_echo2')||!hasItem('doc_zero1')||!G.syms.length)lbl='ملف على الطاولة — ليس بعد';
    }
    e.querySelector('.d').textContent=lbl;
  }else e.style.opacity=0;
}
function itemName(k){
  return {key_bath:'مفتاح الحمّام',keycard:'بطاقة الوصول',archkey:'مفتاح الأرشيف',
    tapeplayer:'مشغّل الأشرة',batteries:'بطاريات',medkit:'حقيبة إسعاف'}[k]||k;
}
function doInteract(){
  const P=G.player;
  if(P.hidden){unhide();return;}
  const c=curInt;if(!c)return;
  const d=dist(P.x,P.y,c.x,c.y);
  if(d>2.4)return;
  switch(c.type){
    case 'door':{
      if(c.locked){
        if(c.power&&!G.flags.power){SFX.deny();subtitle('','«لا يوجد تيار.» لوحة على الباب: BASEMENT — POWER REQUIRED');return;}
        if(c.need==='archkey'&&!hasItem('archkey')){SFX.deny();subtitle('','المصعد لا يستجيب. لوحة بجانبه: ACCESS — ARKHIV KEY.');return;}
        if(c.need==='allDocs'){SFX.deny();return;}
        if(c.need&&!hasItem(c.need)){SFX.deny();subtitle('','مقفل. تحتاج: '+itemName(c.need));return;}
        if(c.need){c.locked=false;subtitle('','استخدمت: '+itemName(c.need));SFX.door();}
      }
      if(c.to){
        c.open=true;
        SFX.door();
        transition(c.to,c.spawn);
      }else if(c.static){
        /* a door in this scene that opens in place */
        c.used=true;c.locked=false;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
        subtitle('','القفل فتح. الباب كان مقفلًا من الخارج — وهذا غريب.');
        note('فتحت بابًا كان مقفلًا من الخارج. من الداخل لا يوجد قفل.','anomaly');
      }else{
        c.open=true;c.used=true;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
        subtitle('','فتحت الباب.');
      }
      break;}
    case 'locked':SFX.deny();subtitle('',c.msg||'مغلق.');break;
    case 'item':{
      addItemKey(c.key);c.used=true;SFX.pickup();
      toast('التقطت: '+c.label,itemName(c.key));
      if(c.note)note(c.note,'item');
      if(c.onTake)c.onTake();
      if(c.key==='tapeplayer'){G.flags.hasPlayer=true;note('مشغّل أشرطة. الآن يمكنني سماع ما تركوه.','item');}
      if(c.key==='archkey'){setObjective('عُد إلى المصعد في قبو المستشفى','المفتاح مدرّع وعليه ختم АРХИВ.');}
      if(c.key==='keycard'){setObjective('عد إلى المستشفى — باب القبو','البطاقة تعمل الآن مع التيّار.');}
      break;}
    case 'doc':{
      if(c.locked&&c.need&&!hasItem(c.need)){SFX.deny();subtitle('','تحتاج: '+itemName(c.need));return;}
      if(c.locked&&c.need){c.locked=false;}
      openDoc(c.doc);c.used=true;G.stats.docs++;
      if(c.onTake)c.onTake();
      break;}
    case 'tape':{
      c.used=true;playTape(c.tape);break;}
    case 'search':{
      if(c.needFlag&&!G.flags[c.needFlag]){SFX.deny();subtitle('','مقفل. لا يفتح بدون تيار.');return;}
      c.used=true;SFX.write();
      subtitle('',c.text||'لا شيء.');
      if(c.give==='tape1')playTape('tape1');
      if(c.give==='tape2')playTape('tape2');
      if(c.keycard){addItemKey('keycard');}
      if(c.onTake)c.onTake();
      break;}
    case 'hide':hideAt(c);break;
    case 'terminal':openCode(c);break;
    case 'talk':talkNika(c.ent);break;
    case 'rex':joinRex(c.ent);break;
    case 'final':tryFinal(c);break;
  }
  updateHint();
}"""

# NOTE: the shipped file has a typo 'مشغّل الأشرة' in itemName? verify below before replacing.
NEW_BLOCK = r"""/* =====================================================================
   INTERACTION SYSTEM (Phase 4) — central, modular, data-driven
   ---------------------------------------------------------------------
   One registry maps an interactable's `type` to a definition:
     { key, prompt(c), run(c) }
   Nothing else in the engine needs a per-door / per-item branch again.
   To add a new kind of interactable you ONLY call INTERACT.register(...)
   and author data — updateHint()/doInteract() never change.

   Flow:  look (gaze cone + line of sight)  ->  focus  ->  prompt  ->  run
   ===================================================================== */
const INTERACT={
  range:2.4,          // max interaction distance (tiles)
  gazeAngle:0.95,     // half-cone (rad) that counts as "looking at" it
  types:{},           // type -> {key,prompt,run}

  register(type,def){INTERACT.types[type]=def;return def;},
  def(type){return INTERACT.types[type];},
  key(c){const d=INTERACT.types[c&&c.type];return (d&&d.key)||'E';},
  prompt(c){
    const d=INTERACT.types[c&&c.type];
    if(d&&d.prompt){const p=d.prompt(c);if(p!=null)return p;}
    return (c&&c.label)||'تفاعل';
  },
  /* every interactable currently in scope (placed ints + live entity verbs) */
  candidates(s){
    const out=[];
    for(const it of s.ints)if(!it.used)out.push(it);
    for(const en of s.entsLive||[]){
      if(en.type==='nika'&&en.vis>0.3)out.push({type:'talk',x:en.x,y:en.y,ent:en,label:'تحدّث'});
      if(en.type==='rex'&&!en.joined)out.push({type:'rex',x:en.x,y:en.y,ent:en,label:'نادِه'});
    }
    return out;
  },
  /* resolve what the player is focused on: prefer the candidate inside the
     gaze cone WITH line of sight; otherwise fall back to the nearest in range
     (keeps touch / no-mouse play and existing content working). */
  focus(){
    const P=G.player,s=G.scene;
    if(!P||!s||P.hidden)return null;
    const R=INTERACT.range;
    let inCone=null,any=null;
    for(const c of INTERACT.candidates(s)){
      const d=dist(P.x,P.y,c.x,c.y);
      if(d>R)continue;
      const a=Math.atan2(c.y-P.y,c.x-P.x);
      const da=Math.abs(((a-IN.aim+Math.PI*3)%TAU)-Math.PI);
      const los=losClear(s,P.x,P.y,c.x,c.y);
      const score=d+da*1.5+(los?0:1.2);          // lower = better
      const rec={c:c,score:score};
      if(!any||score<any.score)any=rec;
      if(da<INTERACT.gazeAngle&&los&&(!inCone||score<inCone.score))inCone=rec;
    }
    const pick=inCone||any;
    return pick?pick.c:null;
  },
  /* dispatch */
  run(c){
    const d=INTERACT.types[c&&c.type];
    if(!d||!d.run){SFX.deny();subtitle('','لا يمكن التفاعل مع هذا.');return false;}
    d.run(c);
    return true;
  },
};

/* ---- built-in interactable types (all game content is pure data) ---- */
INTERACT.register('door',{key:'E',
  prompt(c){
    if(c.locked){
      if(c.power&&!G.flags.power)return 'مقفل — لا يوجد تيار';
      if(c.need==='echo2'&&!G.flags.echo2)return 'مقفل — المصعد لا يستجيب';
      if(c.need&&!hasItem(c.need))return 'مقفل — تحتاج: '+itemName(c.need);
    }
    return c.to==='outdoor'?'اخرج':(c.label||'ادخل');
  },
  run(c){
    if(c.locked){
      if(c.power&&!G.flags.power){SFX.deny();subtitle('','«لا يوجد تيار.» لوحة على الباب: BASEMENT — POWER REQUIRED');return;}
      if(c.need==='archkey'&&!hasItem('archkey')){SFX.deny();subtitle('','المصعد لا يستجيب. لوحة بجانبه: ACCESS — ARKHIV KEY.');return;}
      if(c.need==='allDocs'){SFX.deny();return;}
      if(c.need&&!hasItem(c.need)){SFX.deny();subtitle('','مقفل. تحتاج: '+itemName(c.need));return;}
      if(c.need){c.locked=false;subtitle('','استخدمت: '+itemName(c.need));SFX.door();}
    }
    if(c.to){c.open=true;SFX.door();transition(c.to,c.spawn);}
    else if(c.static){
      c.used=true;c.locked=false;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
      subtitle('','القفل فتح. الباب كان مقفلًا من الخارج — وهذا غريب.');
      note('فتحت بابًا كان مقفلًا من الخارج. من الداخل لا يوجد قفل.','anomaly');
    }else{
      c.open=true;c.used=true;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
      subtitle('','فتحت الباب.');
    }
  }});
INTERACT.register('locked',{key:'E',
  prompt(c){return c.label||'مغلق';},
  run(c){SFX.deny();subtitle('',c.msg||'مغلق.');}});
INTERACT.register('item',{key:'E',
  prompt(c){return c.label||'التقط';},
  run(c){
    addItemKey(c.key);c.used=true;SFX.pickup();
    toast('التقطت: '+c.label,itemName(c.key));
    if(c.note)note(c.note,'item');
    if(c.onTake)c.onTake();
    if(c.key==='tapeplayer'){G.flags.hasPlayer=true;note('مشغّل أشرطة. الآن يمكنني سماع ما تركوه.','item');}
    if(c.key==='archkey'){setObjective('عُد إلى المصعد في قبو المستشفى','المفتاح مدرّع وعليه ختم АРХИВ.');}
    if(c.key==='keycard'){setObjective('عد إلى المستشفى — باب القبو','البطاقة تعمل الآن مع التيّار.');}
  }});
INTERACT.register('doc',{key:'E',
  prompt(c){
    if(c.locked&&c.need&&!hasItem(c.need))return (c.label||'اقرأ')+' — تحتاج: '+itemName(c.need);
    return c.label||'اقرأ';
  },
  run(c){
    if(c.locked&&c.need&&!hasItem(c.need)){SFX.deny();subtitle('','تحتاج: '+itemName(c.need));return;}
    if(c.locked&&c.need){c.locked=false;}
    openDoc(c.doc);c.used=true;G.stats.docs++;
    if(c.onTake)c.onTake();
  }});
INTERACT.register('tape',{key:'E',
  prompt(c){return c.label||'استمع';},
  run(c){c.used=true;playTape(c.tape);}});
INTERACT.register('search',{key:'E',
  prompt(c){return c.label||'ابحث';},
  run(c){
    if(c.needFlag&&!G.flags[c.needFlag]){SFX.deny();subtitle('','مقفل. لا يفتح بدون تيار.');return;}
    c.used=true;SFX.write();
    subtitle('',c.text||'لا شيء.');
    if(c.give==='tape1')playTape('tape1');
    if(c.give==='tape2')playTape('tape2');
    if(c.keycard){addItemKey('keycard');}
    if(c.onTake)c.onTake();
  }});
INTERACT.register('hide',{key:'H',
  prompt(c){return c.label||'اختبئ';},
  run(c){hideAt(c);}});
INTERACT.register('terminal',{key:'E',
  prompt(c){return c.label||'لوحة تحكم';},
  run(c){openCode(c);}});
INTERACT.register('talk',{key:'E',
  prompt(c){return c.label||'تحدّث';},
  run(c){talkNika(c.ent);}});
INTERACT.register('rex',{key:'E',
  prompt(c){return c.label||'نادِه';},
  run(c){joinRex(c.ent);}});
INTERACT.register('final',{key:'E',
  prompt(c){
    if(!hasItem('doc_echo2')||!hasItem('doc_zero1')||!G.syms.length)return 'ملف على الطاولة — ليس بعد';
    return c.label||'اقرأ الملف';
  },
  run(c){tryFinal(c);}});

/* ---- NEW generic reusable types (no per-object code needed) ---- */
/* examine: inspect an object, read a description, optional one-shot reward */
INTERACT.register('examine',{key:'E',
  prompt(c){return c.label||'افحص';},
  run(c){
    SFX.write();
    subtitle('',c.text||'لا شيء مميز.');
    if(c.once!==false)c.used=true;
    if(c.give)addItemKey(c.give);
    if(c.flag)G.flags[c.flag]=true;
    if(c.onExamine)c.onExamine(c);
  }});
/* device: any operable machine — switch / valve / console / generator.
   Data-driven: {state,flag,onUse(c,state),power,need,onMsg,offMsg} */
INTERACT.register('device',{key:'E',
  prompt(c){
    if(c.power&&!G.flags.power)return (c.label||'جهاز')+' — لا يوجد تيار';
    if(c.locked&&c.need&&!hasItem(c.need))return (c.label||'جهاز')+' — تحتاج: '+itemName(c.need);
    return c.state?(c.offLabel||'أوقف التشغيل'):(c.onLabel||c.label||'شغّل');
  },
  run(c){
    if(c.power&&!G.flags.power){SFX.deny();subtitle('','لا يوجد تيار. الجهاز ميت.');return;}
    if(c.locked&&c.need&&!hasItem(c.need)){SFX.deny();subtitle('','تحتاج: '+itemName(c.need));return;}
    if(c.locked&&c.need)c.locked=false;
    c.state=!c.state;
    SFX.beep();tone(c.state?660:300,0.12,0.05,'square');
    subtitle('',c.state?(c.onMsg||'شغّلت الجهاز.'):(c.offMsg||'أوقفت الجهاز.'));
    if(c.flag)G.flags[c.flag]=c.state;
    if(c.onUse)c.onUse(c,c.state);
    if(G.scene)G.scene.dirty=true;
  }});
/* puzzle: activation hook only — full puzzle content plugs in here later.
   If a puzzle defines `code`, it reuses the symbol terminal; otherwise it
   runs `onActivate`, or reports that the system is ready and awaits content. */
INTERACT.register('puzzle',{key:'E',
  prompt(c){return c.label||'لغز';},
  run(c){
    if(c.solved){SFX.deny();subtitle('','حللت هذا اللغز بالفعل.');return;}
    if(c.onActivate){c.onActivate(c);return;}
    if(c.code&&typeof openCode==='function'){openCode(c);return;}
    SFX.beep();
    subtitle('','[نظام الألغاز جاهز — المحتوى لم يُضف بعد]');
    note('وجدت لغزًا. النظام جاهز للتفعيل.','puzzle');
  }});

let curInt=null;
function updateHint(){
  const e=$('inter'),P=G.player,s=G.scene;
  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open){e.style.opacity=0;curInt=null;return;}
  const c=INTERACT.focus();
  curInt=c;
  if(c){
    e.style.opacity=1;
    e.querySelector('.k').textContent=INTERACT.key(c);
    e.querySelector('.d').textContent=INTERACT.prompt(c);
  }else e.style.opacity=0;
}
function itemName(k){
  return {key_bath:'مفتاح الحمّام',keycard:'بطاقة الوصول',archkey:'مفتاح الأرشيف',
    tapeplayer:'مشغّل الأشرطة',batteries:'بطاريات',medkit:'حقيبة إسعاف'}[k]||k;
}
function doInteract(){
  const P=G.player;
  if(P.hidden){unhide();return;}
  const c=curInt;if(!c)return;
  if(dist(P.x,P.y,c.x,c.y)>INTERACT.range+0.2)return;
  INTERACT.run(c);
  updateHint();
}"""

# the shipped itemName uses 'مشغّل الأشرطة'; guard against transcription drift
if OLD_BLOCK not in s:
    # tolerate the one known variance and retry
    alt = OLD_BLOCK.replace("مشغّل الأشرة", "مشغّل الأشرطة")
    if alt in s:
        OLD_BLOCK = alt
    else:
        log.append(("MISS", "INTERACTION block (anchor not found)")); 

if OLD_BLOCK in s:
    sub1(OLD_BLOCK, NEW_BLOCK, "INTERACTION -> registry system")

# ---------------------------------------------------------------- 2. 3D focus indicator
sub1(
"""  /* memory layer tint */
  const fogC=E3.scene.fog.color;
  if(G.echo>0.35){
    const k=(G.echo-0.35)*0.5;
    fogC.setRGB(0.02+k*0.10,0.024+k*0.06,0.035+k*0.02);
  }
  E3.renderer.render(E3.scene,E3.camera);""",
"""  /* memory layer tint */
  const fogC=E3.scene.fog.color;
  if(G.echo>0.35){
    const k=(G.echo-0.35)*0.5;
    fogC.setRGB(0.02+k*0.10,0.024+k*0.06,0.035+k*0.02);
  }
  /* ---- interaction focus indicator: a glowing ring on what you can use ---- */
  if(!E3.focusRing){
    E3.focusRing=new THREE.Mesh(new THREE.TorusGeometry(0.46,0.05,6,26),
      new THREE.MeshBasicMaterial({color:new THREE.Color(0x9fe8d8),transparent:true,opacity:0,
        blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    E3.focusRing.rotation.x=Math.PI/2;E3.focusRing.visible=false;
    E3.scene.add(E3.focusRing);
  }
  const fr=E3.focusRing;
  const fc=(typeof curInt!=='undefined')?curInt:null;
  if(fc&&!P.hidden&&!G.paused&&!G.over){
    const rx=fc.type==='door'?fc.x+0.5:fc.x, rz=fc.type==='door'?fc.y+0.5:fc.y;
    fr.visible=true;
    fr.position.set(rx,0.13+Math.sin(G.time*3)*0.02,rz);
    const pulse=0.5+0.5*Math.sin(G.time*4);
    fr.material.opacity=0.28+0.24*pulse;
    fr.scale.setScalar(1+0.07*pulse);
  }else{fr.visible=false;fr.material.opacity=0;}
  E3.renderer.render(E3.scene,E3.camera);""",
"3D focus ring")

# ---------------------------------------------------------------- 3. E3 state field
sub1("  soldierTorch:null, charRig:null, disposables:[], frame:0\n};",
     "  soldierTorch:null, charRig:null, disposables:[], frame:0, focusRing:null\n};",
     "E3.focusRing field")

# ---------------------------------------------------------------- 4. hint text mentions gaze
sub1(
"""  $('hint').innerHTML='<kbd>WASD</kbd> حركة باتجاه نظرك &nbsp; <b>الماوس</b> للنظر &nbsp; <kbd>E</kbd> تفاعل &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';""",
"""  $('hint').innerHTML='<kbd>WASD</kbd> حركة باتجاه نظرك &nbsp; <b>الماوس</b> للنظر &nbsp; <kbd>E</kbd> تفاعل (انظر إلى العنصر) &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';""",
"hint text (gaze)")

open(P, "w", encoding="utf-8").write(s)
js = re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open("/tmp/game.js", "w", encoding="utf-8").write(js)
for st, lb in log:
    print("%-9s %s" % (st, lb))
print("bytes %d -> %d" % (orig, len(s)))
miss = [e for e in log if e[0] != "ok"]
print("MISSES:", len(miss))
sys.exit(0 if not miss else 1)
