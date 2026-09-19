#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re, sys, io
P = "/home/user/chernobyl/index.html"
s = io.open(P, encoding="utf-8").read()
orig = len(s.encode("utf-8"))
misses = []

def rep(tag, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        misses.append((tag, n))
        print("MISS      %-28s found=%d expected=%d" % (tag, n, count))
        return
    s = s.replace(old, new)
    print("ok        %s" % tag)

# ===================== EDIT 1: ITEMS registry + INV module =====================
OLD1 = """function addItemKey(key,n){
  if(key==='batteries'){G.player.bat=Math.min(CFG.batMax,G.player.bat+45);G.items.batteries=(G.items.batteries||0)+1;return;}
  if(key==='medkit'){G.items.medkit=(G.items.medkit||0)+1;return;}
  G.items[key]=n||true;
}
function hasItem(k){return !!G.items[k];}"""

NEW1 = r"""/* =====================================================================
   INVENTORY SYSTEM (Phase 5) — modular & data-driven.
   ITEMS   : id -> definition {name,desc,icon,type,stack,max,use,onPickup}
   RECIPES : combine rules {in:[a,b], out, qty}
   INV     : the single API the game uses. State lives in G.items (already saved).
   Adding an item = one defItem(...) call. No engine changes ever.
   ===================================================================== */
const ITEMS={};
function defItem(d){ITEMS[d.id]=d;return d;}
const RECIPES=[];
function defRecipe(r){RECIPES.push(r);return r;}
const ITEM_TYPES={consumable:'قابل للاستهلاك',tool:'أداة',key:'مفتاح',material:'مادة',misc:'متنوع'};

/* --- the few items that already exist in the game get real definitions --- */
defItem({id:'medkit',name:'حقيبة إسعاف',type:'consumable',stack:true,max:3,icon:'✚',
  desc:'ضمادات ومضاد إشعاع بسيط. يخفّف التلوّث ويستعيد إصابة واحدة.',
  use(){const P=G.player;P.rad=Math.max(0,P.rad-45);P.hp=Math.min(3,P.hp+1);
    toast('استخدمت حقيبة الإسعاف','RAD -45 / HP +1');SFX.pickup();return{ok:true};}});
defItem({id:'batteries',name:'بطاريات',type:'consumable',stack:true,max:6,icon:'▮',
  desc:'بطاريات للكشاف. تُعيد شحن مصباح اليد عند الاستخدام.',
  onPickup(){G.player.bat=Math.min(CFG.batMax,G.player.bat+45);},
  use(){G.player.bat=Math.min(CFG.batMax,G.player.bat+45);
    toast('استخدمت البطاريات','BATTERY +45%');SFX.pickup();return{ok:true};}});
defItem({id:'tapeplayer',name:'مشغّل الأشرطة',type:'tool',stack:false,icon:'▣',
  desc:'مسجّل شرائط قديم. يشغّل الأشرطة التي تجدها في المدينة.'});
defItem({id:'keycard',name:'بطاقة الوصول',type:'key',stack:false,icon:'▭',
  desc:'بطاقة BLACK SITE-4. تفتح الأبواب المقفلة تحت الأرض.'});
defItem({id:'archkey',name:'مفتاح الأرشيف',type:'key',stack:false,icon:'⚿',
  desc:'مفتاح ثقيل. لوحة المصعد تطلبه بالاسم: ARKHIV KEY.'});
defItem({id:'key_bath',name:'مفتاح الحمّام',type:'key',stack:false,icon:'⚿',
  desc:'مفتاح صغير صدئ.'});

/* --- a few TEST items: two materials + one combine result --- */
defItem({id:'scrap',name:'خردة معدنية',type:'material',stack:true,max:9,icon:'⚙',
  desc:'قطعة معدنية ملتوية. تصلح للتجميع.'});
defItem({id:'cloth',name:'قطعة قماش',type:'material',stack:true,max:9,icon:'▨',
  desc:'قماش متّسخ لكنه متين.'});
defItem({id:'repair_kit',name:'عدّة إصلاح',type:'consumable',stack:true,max:3,icon:'🧰',
  desc:'نتيجة دمج خردة وقماش. تستعيد بعض التحمّل.',
  use(){G.player.sta=Math.min(CFG.staMax,G.player.sta+50);
    toast('استخدمت عدّة الإصلاح','STAMINA +50');SFX.pickup();return{ok:true};}});
defRecipe({in:['scrap','cloth'],out:'repair_kit',qty:1,name:'عدّة إصلاح'});

const INV={
  /* ---- queries ---- */
  def(id){return ITEMS[id]||null;},
  meta(id){return ITEMS[id]||{id:id,name:itemName(id),desc:'',icon:'•',type:'misc',stack:false};},
  isItem(k){return !k.startsWith('doc_')&&!/^tape\d/.test(k);},   // docs & tape1/2/3 have their own tabs
  count(id){const v=G.items[id];return v==null?0:(v===true?1:(v|0));},
  has(id){return INV.count(id)>0;},
  list(){return Object.keys(G.items).filter(INV.isItem).map(id=>({id:id,qty:INV.count(id),def:INV.meta(id)}));},
  /* ---- pickup ---- */
  add(id,n){
    n=(n==null||n===true)?1:(n|0);
    const d=ITEMS[id];
    if(d&&d.stack){let q=INV.count(id)+n;if(d.max)q=Math.min(d.max,q);G.items[id]=q;}
    else G.items[id]=n>1?n:true;
    if(d&&d.onPickup)try{d.onPickup(n);}catch(e){}
    INV.onChange();return id;
  },
  /* ---- remove / drop ---- */
  remove(id,n){
    n=(n==null)?1:(n|0);
    const d=ITEMS[id];
    if(d&&d.stack){let q=INV.count(id)-n;if(q<=0)delete G.items[id];else G.items[id]=q;}
    else delete G.items[id];
    INV.onChange();return !INV.has(id);
  },
  /* ---- use ---- */
  canUse(id){const d=ITEMS[id];return INV.has(id)&&!!(d&&d.use);},
  use(id){
    if(!INV.has(id))return{ok:false,msg:'هذا العنصر غير متوفر.'};
    const d=ITEMS[id];
    if(!d||!d.use)return{ok:false,msg:'لا يمكن استخدام «'+INV.meta(id).name+'».'};
    let r;try{r=d.use()||{ok:true};}catch(e){r={ok:false,msg:'تعذّر الاستخدام.'};}
    if(r.ok!==false&&d.consumable!==false&&d.stack)INV.remove(id,1);
    INV.onChange();return r;
  },
  /* ---- combine ---- */
  recipesFor(id){return RECIPES.filter(r=>r.in.indexOf(id)>=0&&r.in.every(x=>INV.has(x)));},
  canCombine(id){return INV.recipesFor(id).length>0;},
  combine(a,b){
    const want=[a,b].slice().sort().join('+');
    const r=RECIPES.find(rc=>rc.in.slice().sort().join('+')===want);
    if(!r)return{ok:false,msg:'لا وصفة لهذا الدمج.'};
    if(!r.in.every(x=>INV.has(x)))return{ok:false,msg:'مكوّن ناقص.'};
    r.in.forEach(x=>INV.remove(x,1));
    INV.add(r.out,r.qty||1);
    toast('دمج: '+INV.meta(r.out).name,'COMBINED');SFX.pickup();
    INV.onChange();return{ok:true,out:r.out};
  },
  onChange(){try{if(INVUI.open)renderInv();}catch(e){}}
};

/* legacy pickup/has helpers now delegate to the registry (behavior preserved) */
function addItemKey(key,n){return INV.add(key,n);}
function hasItem(k){return INV.has(k);}"""
rep("ITEMS registry + INV module", OLD1, NEW1)

# ===================== EDIT 2: itemName consults registry =====================
OLD2 = """function itemName(k){
  return {key_bath:'مفتاح الحمّام',keycard:'بطاقة الوصول',archkey:'مفتاح الأرشيف',
    tapeplayer:'مشغّل الأشرطة',batteries:'بطاريات',medkit:'حقيبة إسعاف'}[k]||k;
}"""
NEW2 = """function itemName(k){
  if(ITEMS[k])return ITEMS[k].name;
  return {key_bath:'مفتاح الحمّام',keycard:'بطاقة الوصول',archkey:'مفتاح الأرشيف',
    tapeplayer:'مشغّل الأشرطة',batteries:'بطاريات',medkit:'حقيبة إسعاف'}[k]||k;
}"""
rep("itemName -> registry", OLD2, NEW2)

# ===================== EDIT 3: #inv overlay HTML =====================
OLD3 = "<!-- code panel -->"
NEW3 = """<!-- inventory (Phase 5) -->
<div id="inv" class="ov hide">
  <div class="panel" id="invPanel">
    <div class="dim mono">INVENTORY — A. VOLKOV</div>
    <h1 style="font-size:20px;margin-top:6px">الحقيبة</h1>
    <div id="invWrap">
      <div id="invGrid"></div>
      <div id="invDetail"></div>
    </div>
    <div style="margin-top:14px"><button class="btn small" id="btnInvClose">إغلاق <span class="dim">(I)</span></button></div>
  </div>
</div>

<!-- code panel -->"""
rep("#inv overlay HTML", OLD3, NEW3)

# ===================== EDIT 4: inventory CSS =====================
OLD4 = '  .entry.unread .h::after{content:" ●";color:#8bb06a}'
NEW4 = OLD4 + """
  /* inventory (Phase 5) */
  #inv .panel{max-width:760px}
  #invWrap{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
  #invGrid{display:grid;grid-template-columns:repeat(4,64px);gap:8px;flex:0 0 auto}
  .slot{width:64px;height:64px;border:1px solid #232c33;background:#0d1115;position:relative;
    display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;
    font-size:26px;color:#cdd8de;transition:border-color .12s,background .12s}
  .slot:hover{border-color:#3a4850}
  .slot.sel{border-color:#7fd8c4;background:#12211f;box-shadow:0 0 0 1px #7fd8c4 inset}
  .slot .q{position:absolute;right:4px;bottom:2px;font-size:11px;color:#9fb0b8;font-family:monospace}
  #invDetail{flex:1 1 240px;min-width:220px;border:1px solid #1c242a;background:#0e1216;padding:14px 16px;pointer-events:auto}
  #invDetail .nm{font-size:15px;color:#e2eaee;letter-spacing:.04em}
  #invDetail .ty{font-size:10px;letter-spacing:.14em;color:#7fd8c4;margin:4px 0 8px}
  #invDetail .ds{font-size:12.5px;color:#8b979e;line-height:1.7;margin-bottom:12px}
  #invDetail .acts{display:flex;gap:8px;flex-wrap:wrap}
  .invEmpty{color:#6b777e;font-size:13px;padding:18px 4px}"""
rep("inventory CSS", OLD4, NEW4)

# ===================== EDIT 5: INVUI state + UI functions =====================
OLD5 = """function closeNb(){$('nb').classList.add('hide');NB.open=false;updateHint();}
function renderNb(){"""
NEW5 = """function closeNb(){$('nb').classList.add('hide');NB.open=false;updateHint();}
/* ===== Inventory UI (Phase 5) ===== */
const INVUI={open:false,sel:null};
function openInv(){
  if(!G.started||G.over)return;
  if(NB.open)closeNb();
  if(!INVUI.sel||!INV.has(INVUI.sel)){const l=INV.list();INVUI.sel=l.length?l[0].id:null;}
  INVUI.open=true;$('inv').classList.remove('hide');renderInv();
}
function closeInv(){$('inv').classList.add('hide');INVUI.open=false;updateHint();}
function toggleInv(){INVUI.open?closeInv():openInv();}
function renderInv(){
  const grid=$('invGrid'),det=$('invDetail');if(!grid||!det)return;
  grid.innerHTML='';det.innerHTML='';
  const items=INV.list();
  if(INVUI.sel&&!INV.has(INVUI.sel))INVUI.sel=items.length?items[0].id:null;
  if(!items.length){grid.innerHTML='<div class="invEmpty">الحقيبة فارغة.</div>';}
  items.forEach(it=>{
    const s=el('div','slot'+(INVUI.sel===it.id?' sel':''));
    s.innerHTML='<span class="ic"></span>'+(it.qty>1?'<span class="q"></span>':'');
    s.querySelector('.ic').textContent=it.def.icon||'•';
    if(it.qty>1)s.querySelector('.q').textContent='×'+it.qty;
    s.title=it.def.name;
    s.onclick=()=>{INVUI.sel=it.id;renderInv();};
    grid.appendChild(s);
  });
  const id=INVUI.sel;
  if(!id){det.innerHTML='<div class="invEmpty">اختر عنصرًا من الحقيبة.</div>';return;}
  const d=INV.meta(id),qty=INV.count(id);
  det.innerHTML='<div class="nm"></div><div class="ty"></div><div class="ds"></div><div class="acts"></div>';
  det.querySelector('.nm').textContent=d.name+(qty>1?'  ×'+qty:'');
  det.querySelector('.ty').textContent=(ITEM_TYPES[d.type]||d.type||'متنوع')+(d.stack?'  •  قابل للتكديس':'  •  غير قابل للتكديس');
  det.querySelector('.ds').textContent=d.desc||'لا وصف.';
  const acts=det.querySelector('.acts');
  if(INV.canUse(id)){const b=el('button','btn small','استخدام');
    b.onclick=()=>{const r=INV.use(id);if(r.ok===false){SFX.deny();subtitle('',r.msg||'');}renderInv();};acts.appendChild(b);}
  const rec=INV.recipesFor(id)[0];
  if(rec){const other=rec.in.find(x=>x!==id)||rec.in[0];
    const b=el('button','btn small','دمج ← '+INV.meta(rec.out).name);
    b.onclick=()=>{const r=INV.combine(id,other);if(r.ok===false){SFX.deny();subtitle('',r.msg||'');}
      if(r.ok)INVUI.sel=r.out;renderInv();};acts.appendChild(b);}
  const rm=el('button','btn small','إزالة');
  rm.onclick=()=>{INV.remove(id,1);INVUI.sel=null;renderInv();};acts.appendChild(rm);
}
function renderNb(){"""
rep("INVUI state + UI functions", OLD5, NEW5)

# ===================== EDIT 6a: updateHint guard =====================
rep("updateHint guard",
    "  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open){e.style.opacity=0;curInt=null;return;}",
    "  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open){e.style.opacity=0;curInt=null;return;}")

# ===================== EDIT 6b: keydown overlay branch =====================
rep("keydown overlay branch",
    "    if(NB.open){if(e.code==='Tab'||e.code==='KeyJ'||e.code==='Escape')closeNb();return;}",
    "    if(INVUI.open){if(e.code==='KeyI'||e.code==='Escape'||e.code==='Tab')closeInv();return;}\n    if(NB.open){if(e.code==='Tab'||e.code==='KeyJ'||e.code==='Escape')closeNb();return;}")

# ===================== EDIT 6c: uiBusy =====================
rep("uiBusy guard",
    "  const uiBusy=()=>!G.started||G.over||G.paused||DLG.open||DOC.open||CODE.open||NB.open||\n    !$('help').classList.contains('hide');",
    "  const uiBusy=()=>!G.started||G.over||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||\n    !$('help').classList.contains('hide');")

# ===================== EDIT 6d: main-loop overlay guard =====================
rep("main-loop overlay guard",
    "  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open){",
    "  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open){")

# ===================== EDIT 6e: KeyQ -> INV.use + KeyI binding =====================
OLD6e = """      case 'KeyQ':if(hasItem('medkit')&&G.items.medkit>0){G.items.medkit--;G.player.rad=Math.max(0,G.player.rad-45);
        G.player.hp=Math.min(3,G.player.hp+1);toast('استخدمت حقيبة الإسعاف','RAD -45 / HP +1');}
        else{SFX.deny();subtitle('','لا توجد حقيبة إسعاف.');}break;
      case 'Tab':case 'KeyJ':openNb();break;"""
NEW6e = """      case 'KeyQ':{const r=INV.use('medkit');if(r.ok===false){SFX.deny();subtitle('',r.msg||'لا توجد حقيبة إسعاف.');}}break;
      case 'KeyI':toggleInv();break;
      case 'Tab':case 'KeyJ':openNb();break;"""
rep("KeyQ->INV.use + KeyI", OLD6e, NEW6e)

# ===================== EDIT 6f: touch button HTML =====================
rep("touch button HTML",
    '  <div class="tbtn" id="tbN">دفتر</div>\n</div>',
    '  <div class="tbtn" id="tbN">دفتر</div>\n  <div class="tbtn" id="tbI">حقيبة</div>\n</div>')

# ===================== EDIT 6g: touch bind =====================
rep("touch bind tbI",
    "    bind('tbN',()=>{NB.open?closeNb():openNb();});",
    "    bind('tbN',()=>{NB.open?closeNb():openNb();});\n    bind('tbI',()=>{INVUI.open?closeInv():openInv();});")

# ===================== EDIT 6h: button wiring =====================
rep("btnInvClose wiring",
    "  $('btnNbClose').onclick=closeNb;",
    "  $('btnNbClose').onclick=closeNb;\n  $('btnInvClose').onclick=closeInv;")

# ===================== EDIT 7: notebook bag line -> INV.list =====================
OLD7 = """    const inv=Object.keys(G.items).filter(k=>!k.startsWith('doc_')&&!k.startsWith('tape'));
    b.appendChild(entry('الحقيبة',inv.length?inv.map(k=>itemName(k)+(G.items[k]>1?' ×'+G.items[k]:'')).join('  •  '):'فارغة تقريبًا.'));"""
NEW7 = """    const inv=INV.list();
    b.appendChild(entry('الحقيبة',inv.length?inv.map(it=>it.def.name+(it.qty>1?' ×'+it.qty:'')).join('  •  '):'فارغة تقريبًا.'));"""
rep("notebook bag -> INV.list", OLD7, NEW7)

# ===================== EDIT 8: test pickups in slice_bld =====================
OLD8 = """    onUse:(c,on)=>{ if(on)s.lights.push({x:10,y:8,r:3.4,c:'rgba(200,220,255,',a:0.10,flick:0.1}); }});
  return s;"""
NEW8 = """    onUse:(c,on)=>{ if(on)s.lights.push({x:10,y:8,r:3.4,c:'rgba(200,220,255,',a:0.10,flick:0.1}); }});
  /* --- Phase 5: a few test pickups for the Inventory System --- */
  addInt(s,{type:'item',x:6,y:6,key:'scrap',label:'خردة معدنية',id:'sb_scrap',sprite:'box',
    note:'خردة معدنية. تُدمج مع القماش من الحقيبة (I).'});
  addInt(s,{type:'item',x:16,y:6,key:'cloth',label:'قطعة قماش',id:'sb_cloth',sprite:'box',
    note:'قطعة قماش متينة. تُدمج مع الخردة (I).'});
  addInt(s,{type:'item',x:6,y:13,key:'medkit',label:'حقيبة إسعاف',id:'sb_med',sprite:'box',
    note:'حقيبة إسعاف. استعملها بـ Q أو من الحقيبة (I).'});
  return s;"""
rep("slice_bld test pickups", OLD8, NEW8)

io.open(P, "w", encoding="utf-8").write(s)
new = len(s.encode("utf-8"))
print("bytes %d -> %d" % (orig, new))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
