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

# ---------- EDIT A: G state gets pz ----------
rep("G.pz state field",
    "  items:{},        // key -> count/true\n",
    "  items:{},        // key -> count/true\n  pz:{},           // puzzle progress: id -> {done:[stepIds]}\n")

# ---------- EDIT B: lockbox_key item ----------
rep("lockbox_key item",
    "defItem({id:'key_bath',name:'مفتاح الحمّام',type:'key',stack:false,icon:'⚿',\n  desc:'مفتاح صغير صدئ.'});",
    "defItem({id:'key_bath',name:'مفتاح الحمّام',type:'key',stack:false,icon:'⚿',\n  desc:'مفتاح صغير صدئ.'});\n"
    "defItem({id:'lockbox_key',name:'مفتاح صغير صدئ',type:'key',stack:false,icon:'⚿',\n  desc:'مفتاح من صندوق غرفة النوم. يفتح خزانة المطبخ.'});")

# ---------- EDIT C: PUZZLE FRAMEWORK + demo + updated 'puzzle' interaction type ----------
OLD_C = """/* puzzle: activation hook only — full puzzle content plugs in here later.
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
  }});"""

NEW_C = r"""/* =====================================================================
   PUZZLE FRAMEWORK (Phase 6) — multi-step, world-bound, data-driven.
   A puzzle is an ORDERED CHAIN of steps that live in the world. Each step is
   a node the player interacts with ({type:'puzzle',puzzle,step}). Nodes gate on
   items / flags / previous steps, so one puzzle spans rooms & scenes and ties
   into exploration + story (clue -> location -> puzzle -> reward -> unlock ->
   clue -> back -> event).  Adding a puzzle = one defPuzzle({...}) + a few nodes.
   The engine never changes.
   ---------------------------------------------------------------------
   step  : { id, kind:'inspect'|'code'|'answer'|'sequence', label, question,
             hint, solution, options, len, clue, wrongMsg,
             require:{items:[],flags:[],steps:[]},
             reward:{item,qty,flag,sym,echo,info,clue,objective:[t,sub],event,toast},
             onSolve(step) }
   puzzle: { id, name, steps:[...], onComplete() }
   ===================================================================== */
const PZUI={open:false,id:null,sid:null,input:[],sel:null,msg:'',solved:false};
const PUZZLES={};
function defPuzzle(p){PUZZLES[p.id]=p;return p;}
const PZ={
  def(id){return PUZZLES[id]||null;},
  state(id){if(!G.pz)G.pz={};if(!G.pz[id])G.pz[id]={done:[]};return G.pz[id];},
  step(id,sid){const p=PUZZLES[id];return p?p.steps.find(s=>s.id===sid):null;},
  stepSolved(id,sid){const st=G.pz&&G.pz[id];return !!(st&&st.done.indexOf(sid)>=0);},
  solved(id){const p=PUZZLES[id];return !!p&&p.steps.every(s=>PZ.stepSolved(id,s.id));},
  requireMet(id,s){
    const rq=(s&&s.require)||{};
    if(rq.items)for(const it of rq.items)if(!INV.has(it))return{ok:false,kind:'item',id:it};
    if(rq.flags)for(const f of rq.flags)if(!G.flags[f])return{ok:false,kind:'flag',id:f};
    if(rq.steps)for(const sid of rq.steps)if(!PZ.stepSolved(id,sid))return{ok:false,kind:'step',id:sid};
    return{ok:true};
  },
  nodeState(id,sid){
    const s=PZ.step(id,sid);if(!s)return null;
    if(PZ.stepSolved(id,sid))return 'solved';
    return PZ.requireMet(id,s).ok?'active':'locked';
  },
  /* entry point used by the 'puzzle' interaction type */
  node(c){
    const id=c.puzzle,sid=c.step;
    if(!PUZZLES[id]){SFX.deny();subtitle('','[لغز غير معرّف]');return;}
    const st=PZ.nodeState(id,sid);
    if(st==='solved'){SFX.deny();subtitle('',c.solvedMsg||'أنجزت هذا بالفعل.');return;}
    if(st==='locked'){
      const rq=PZ.requireMet(id,PZ.step(id,sid));SFX.deny();
      if(rq.kind==='item')subtitle('','مقفل. تحتاج: '+itemName(rq.id));
      else subtitle('',c.lockedMsg||'يبدو أن هناك ما يجب اكتشافه هنا أولًا.');
      return;
    }
    PZ.open(id,sid);
  },
  /* ---- panel ---- */
  open(id,sid){PZUI.id=id;PZUI.sid=sid;PZUI.input=[];PZUI.sel=null;PZUI.msg='';PZUI.solved=false;
    PZUI.open=true;$('pz').classList.remove('hide');renderPz();SFX.beep();},
  close(){$('pz').classList.add('hide');PZUI.open=false;updateHint();},
  check(s){
    if(!s)return false;
    if(s.kind==='inspect')return true;
    if(s.kind==='code')return PZUI.input.join('')===String(s.solution);
    if(s.kind==='answer')return PZUI.sel!=null&&PZUI.sel===s.solution;
    if(s.kind==='sequence')return PZUI.input.length===(s.solution||[]).length&&PZUI.input.every((v,i)=>v===s.solution[i]);
    return false;
  },
  submit(){
    const s=PZ.step(PZUI.id,PZUI.sid);if(!s||PZUI.solved)return;
    if(PZ.check(s)){PZUI.solved=true;PZUI.msg='';SFX.write();renderPz();}
    else{SFX.deny();shake(3,.3);PZUI.msg=s.wrongMsg||'خطأ. فكّر في الدليل.';renderPz();
      G.noiseEvent={r:9};note('أخطأت في «'+((PUZZLES[PZUI.id]||{}).name||'لغز')+'». شيء ما سمع الصوت.','anomaly');}
  },
  advance(){
    const id=PZUI.id,s=PZ.step(id,PZUI.sid);if(!s||!PZUI.solved)return;
    const st=PZ.state(id);if(st.done.indexOf(s.id)<0)st.done.push(s.id);
    PZ.reward(s.reward);
    if(s.onSolve)try{s.onSolve(s);}catch(e){}
    if(PZ.solved(id)&&PUZZLES[id].onComplete)try{PUZZLES[id].onComplete();}catch(e){}
    PZ.close();
  },
  reward(r){
    if(!r)return;
    if(r.flag)G.flags[r.flag]=true;
    if(r.item)INV.add(r.item,r.qty||1);
    if(r.sym)giveSym(r.sym);
    if(r.echo!=null)G.echo=Math.max(G.echo,r.echo);
    if(r.info)note(r.info,'puzzle');
    if(r.clue){flashMsg(r.clue,3600);note(r.clue,'puzzle');}
    if(r.objective)setObjective(r.objective[0],r.objective[1]);
    if(r.toast)toast(r.toast[0],r.toast[1]);
    if(r.event){try{triggerAnomaly(r.event);}catch(e){}}
    if(r.onReward){try{r.onReward();}catch(e){}}
  }
};
function renderPz(){
  const root=$('pzBody');if(!root)return;
  const id=PZUI.id,p=PZ.def(id),s=PZ.step(id,PZUI.sid);
  if(!p||!s){PZ.close();return;}
  const doneN=PZ.state(id).done.length,total=p.steps.length;
  $('pzTitle').textContent=p.name||'لغز';
  $('pzStep').textContent='الخطوة '+(doneN+1)+' من '+total;
  root.innerHTML='';if(typeof root.replaceChildren==='function'){try{root.replaceChildren();}catch(e){}}
  if(PZUI.solved){
    root.appendChild(el('div','pzClue',s.clue||'تمّ الحل.'));
    const b=el('button','btn','تابع');b.onclick=()=>PZ.advance();root.appendChild(b);
    return;
  }
  if(s.question)root.appendChild(el('div','pzQ',s.question));
  if(s.kind==='code'){
    const len=s.len||String(s.solution).length;
    const disp=el('div','pzCode');
    for(let i=0;i<len;i++)disp.appendChild(el('span','pzDigit',PZUI.input[i]||'·'));
    root.appendChild(disp);
    const pad=el('div','pzPad');
    const press=n=>{if(PZUI.input.length<len){PZUI.input.push(String(n));SFX.beep();renderPz();}};
    ['1','2','3','4','5','6','7','8','9'].forEach(n=>{const b=el('button','pzKey',n);b.onclick=()=>press(n);pad.appendChild(b);});
    const bdel=el('button','pzKey','⌫');bdel.onclick=()=>{PZUI.input.pop();renderPz();};pad.appendChild(bdel);
    const b0=el('button','pzKey','0');b0.onclick=()=>press('0');pad.appendChild(b0);
    root.appendChild(pad);
  } else if(s.kind==='answer'||s.kind==='sequence'){
    if(s.kind==='sequence'){
      const seq=el('div','pzSeq');
      PZUI.input.forEach(v=>{const o=(s.options||[]).find(x=>x.id===v);seq.appendChild(el('span','pzChip',o?o.label:v));});
      root.appendChild(seq);
    }
    const opts=el('div','pzOpts');
    (s.options||[]).forEach(o=>{
      const used=s.kind==='sequence'&&PZUI.input.indexOf(o.id)>=0;
      const sel=s.kind==='answer'&&PZUI.sel===o.id;
      const b=el('button','pzOpt'+(sel?' sel':'')+(used?' used':''),o.label);
      b.onclick=()=>{
        if(s.kind==='answer'){PZUI.sel=o.id;SFX.beep();renderPz();}
        else{if(used||PZUI.input.length>=(s.solution||[]).length)return;PZUI.input.push(o.id);SFX.beep();renderPz();}
      };
      opts.appendChild(b);
    });
    root.appendChild(opts);
  }
  if(s.hint)root.appendChild(el('div','pzHint',s.hint));
  if(PZUI.msg)root.appendChild(el('div','pzMsg',PZUI.msg));
  const len=s.len||String(s.solution||'').length;
  const ready=s.kind==='inspect'
    ||(s.kind==='code'&&PZUI.input.length>=len)
    ||(s.kind==='answer'&&PZUI.sel!=null)
    ||(s.kind==='sequence'&&PZUI.input.length===(s.solution||[]).length);
  const cb=el('button','btn'+(ready?'':' disabled'),'تحقّق');
  cb.onclick=()=>{if(!ready){SFX.deny();return;}PZ.submit();};
  root.appendChild(cb);
}

/* ---- the ONE demo puzzle that proves the framework end-to-end ---- */
defPuzzle({
  id:'pz_lockbox',name:'صندوق الشقّة',
  steps:[
    {id:'clue_drawing',kind:'inspect',label:'افحص الرسم على الحائط',
      question:'رسم طفل بالفحم: شمس صغيرة، وتحتها ثلاثة أرقام محفورة في الجص: ٣ - ١ - ٤. وكلمة «الصندوق».',
      hint:'احفظ الأرقام.',
      clue:'الأرقام ٣-١-٤. هناك صندوق مقفل في غرفة النوم.',
      reward:{flag:'pz_drawing',info:'رسم الطفل: ٣-١-٤ ← صندوق غرفة النوم.',
        objective:['افتح الصندوق المقفل','غرفة النوم — المبنى السكني']}},
    {id:'lockbox',kind:'code',len:3,solution:'314',label:'الصندوق المقفل',
      question:'صندوق معدني بلوحة أرقام من ثلاثة منازل.',
      hint:'الأرقام من رسم الطفل في غرفة المعيشة.',
      wrongMsg:'لا ينفتح. الأرقام خطأ.',
      clue:'انفتح الصندوق: بداخله مفتاح صغير صدئ.',
      require:{steps:['clue_drawing']},
      reward:{item:'lockbox_key',info:'مفتاح الصندوق ← خزانة المطبخ.',
        objective:['افتح خزانة المطبخ','المطبخ — تحتاج المفتاح الصغير']}},
    {id:'cabinet',kind:'answer',solution:'sun',label:'خزانة المطبخ',
      question:'فتحت الخزانة بالمفتاح الصغير: بالداخل ثلاث علب صدئة — واحدة عليها شمس، واثنتان عليهما هلال ونجمة.',
      options:[{id:'moon',label:'العلبة عليها هلال'},{id:'sun',label:'العلبة عليها شمس'},{id:'star',label:'العلبة عليها نجمة'}],
      hint:'في الرسم كان الطفل يحمل شمسًا.',
      wrongMsg:'العلبة فارغة.',
      clue:'داخل علبة الشمس صورة قديمة لعائلة أمام هذا المبنى. على الظهر بخطٍّ مطبعي: «SUBJECT N-07». ينطفئ الضوء وتسمع همهمة من الشارع.',
      require:{items:['lockbox_key']},
      reward:{flag:'pz_cabinet',echo:0.4,info:'الصورة: SUBJECT N-07 ← عُد إلى الشارع.',
        objective:['عُد إلى الشارع','شيء ما تغيّر خارج المبنى']}}
  ],
  onComplete(){
    G.echo=Math.max(G.echo,0.45);
    flashMsg('همهمة في الشارع…',3000);
    note('انتهى «صندوق الشقّة». الشارع خلفك لم يعد كما كان.','story');
    try{triggerAnomaly('static');}catch(e){}
  }
});

/* puzzle: routes framework nodes to PZ; keeps the old activation hook as fallback */
INTERACT.register('puzzle',{key:'E',
  prompt(c){
    if(c.puzzle&&PUZZLES[c.puzzle]){
      const st=PZ.nodeState(c.puzzle,c.step);
      if(st==='solved')return (c.label||'لغز')+' — تمّ';
      if(st==='locked'){const rq=PZ.requireMet(c.puzzle,PZ.step(c.puzzle,c.step));
        if(rq.kind==='item')return (c.label||'لغز')+' — تحتاج '+itemName(rq.id);
        return (c.label||'لغز')+' — ليس بعد';}
    }
    return c.label||'لغز';
  },
  run(c){
    if(c.puzzle&&PUZZLES[c.puzzle]){PZ.node(c);return;}
    if(c.solved){SFX.deny();subtitle('','حللت هذا اللغز بالفعل.');return;}
    if(c.onActivate){c.onActivate(c);return;}
    if(c.code&&typeof openCode==='function'){openCode(c);return;}
    SFX.beep();
    subtitle('','[نظام الألغاز جاهز — المحتوى لم يُضف بعد]');
    note('وجدت لغزًا. النظام جاهز للتفعيل.','puzzle');
  }});"""
rep("PUZZLE framework + demo + type", OLD_C, NEW_C)

# ---------- EDIT D: #pz overlay HTML ----------
rep("#pz overlay HTML",
    "<!-- inventory (Phase 5) -->",
    """<!-- puzzle (Phase 6) -->
<div id="pz" class="ov hide">
  <div class="panel" id="pzPanel">
    <div class="dim mono">PUZZLE</div>
    <h1 id="pzTitle" style="font-size:20px;margin-top:6px">لغز</h1>
    <div id="pzStep" class="dim" style="margin:6px 0 14px"></div>
    <div id="pzBody"></div>
    <div style="margin-top:14px"><button class="btn small" id="btnPzClose">إغلاق <span class="dim">(Esc)</span></button></div>
  </div>
</div>

<!-- inventory (Phase 5) -->""")

# ---------- EDIT E: puzzle CSS ----------
rep("puzzle CSS",
    "  .invEmpty{color:#6b777e;font-size:13px;padding:18px 4px}",
    """  .invEmpty{color:#6b777e;font-size:13px;padding:18px 4px}
  /* puzzle (Phase 6) */
  #pz .panel{max-width:560px;text-align:center}
  #pzBody{min-height:120px}
  .pzQ{font-size:14px;color:#c3ced4;line-height:1.85;margin-bottom:14px}
  .pzClue{font-size:14px;color:#9fe8d8;line-height:1.9;margin:10px 0 18px;border:1px solid #2c4a44;background:#0f1a18;padding:14px 16px;text-align:right}
  .pzCode{display:flex;gap:8px;justify-content:center;margin:8px 0 16px}
  .pzDigit{width:40px;height:50px;border:1px solid #2a343b;background:#0d1115;color:#e2eaee;font-size:26px;display:flex;align-items:center;justify-content:center;font-family:monospace}
  .pzPad{display:grid;grid-template-columns:repeat(3,58px);gap:8px;justify-content:center;margin-bottom:14px}
  .pzKey{width:58px;height:46px;border:1px solid #2a343b;background:#11161b;color:#cdd8de;font-size:18px;cursor:pointer;pointer-events:auto;font-family:monospace}
  .pzKey:hover{border-color:#7fd8c4}
  .pzOpts{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
  .pzOpt{padding:11px 14px;border:1px solid #2a343b;background:#11161b;color:#c3ced4;cursor:pointer;pointer-events:auto;font-size:13px;text-align:right}
  .pzOpt.sel{border-color:#7fd8c4;background:#12211f;color:#e8eef2}
  .pzOpt.used{opacity:.4;pointer-events:none}
  .pzSeq{display:flex;gap:6px;justify-content:center;margin-bottom:10px;min-height:26px;flex-wrap:wrap}
  .pzChip{padding:4px 10px;border:1px solid #2c4a44;background:#0f1a18;color:#9fe8d8;font-size:12px}
  .pzHint{font-size:11.5px;color:#6f7c84;margin:4px 0 12px;font-style:italic}
  .pzMsg{font-size:12px;color:#d98b8b;margin-bottom:10px}
  .btn.disabled{opacity:.4;pointer-events:none}""")

# ---------- EDIT F: guards ----------
rep("updateHint guard +PZUI",
    "  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open){e.style.opacity=0;curInt=null;return;}",
    "  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open){e.style.opacity=0;curInt=null;return;}")
rep("keydown overlay branch +PZUI",
    "    if(INVUI.open){if(e.code==='KeyI'||e.code==='Escape'||e.code==='Tab')closeInv();return;}",
    "    if(PZUI.open){if(e.code==='Escape')PZ.close();return;}\n    if(INVUI.open){if(e.code==='KeyI'||e.code==='Escape'||e.code==='Tab')closeInv();return;}")
rep("uiBusy guard +PZUI",
    "  const uiBusy=()=>!G.started||G.over||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||\n    !$('help').classList.contains('hide');",
    "  const uiBusy=()=>!G.started||G.over||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open||\n    !$('help').classList.contains('hide');")
rep("main-loop guard +PZUI",
    "  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open){",
    "  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open){")
rep("btnPzClose wiring",
    "  $('btnInvClose').onclick=closeInv;",
    "  $('btnInvClose').onclick=closeInv;\n  $('btnPzClose').onclick=()=>PZ.close();")

# ---------- EDIT G: demo nodes + props in slice_bld ----------
rep("demo puzzle nodes",
    """  addInt(s,{type:'item',x:6,y:13,key:'medkit',label:'حقيبة إسعاف',id:'sb_med',sprite:'box',
    note:'حقيبة إسعاف. استعملها بـ Q أو من الحقيبة (I).'});
  return s;""",
    """  addInt(s,{type:'item',x:6,y:13,key:'medkit',label:'حقيبة إسعاف',id:'sb_med',sprite:'box',
    note:'حقيبة إسعاف. استعملها بـ Q أو من الحقيبة (I).'});
  /* --- Phase 6: the demo puzzle chain (multi-step, world-bound) --- */
  P(4.5,6,'paper');P(16,7,'box');P(5,13,'cabinet');
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'clue_drawing',x:4.5,y:6,id:'pz_drawing',label:'افحص الرسم على الحائط'});
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'lockbox',x:16,y:7,id:'pz_lockbox_node',label:'الصندوق المقفل'});
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'cabinet',x:5,y:13,id:'pz_cabinet_node',label:'خزانة المطبخ'});
  return s;""")

# ---------- EDIT H: save / load pz ----------
rep("saveGame pz",
    "      echo:G.echo,flags:G.flags,items:G.items,docs:G.docs,tapes:G.tapes,syms:G.syms,",
    "      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,docs:G.docs,tapes:G.tapes,syms:G.syms,")
rep("loadGame pz",
    "    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},docs:d.docs||[],",
    "    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},docs:d.docs||[],")

io.open(P, "w", encoding="utf-8").write(s)
print("bytes %d -> %d" % (orig, len(s.encode("utf-8"))))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
