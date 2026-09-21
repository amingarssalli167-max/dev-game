# -*- coding: utf-8 -*-
# _patch_p12.py — Phase 12: SAVE/LOAD SYSTEM
# - autosave slot (SAVEKEY, unchanged) + quicksave (F5->auto) + quickload (F9)
# - 3 manual slots (SAVEKEY_s1..3) with metadata + delete
# - full player state (pos, face, modelYaw, crouch, injured, vertical, stamina...)
# - enemy state per-scene (position + death + hp) persisted via flags.pos
# - settings embedded in each save and restored on load
# - UI: slot list panel (auto + 3 slots), per-slot save/load/delete
# - beforeunload autosave (closing the game saves)
import io, sys

P = '/home/user/chernobyl/index.html'
s = io.open(P, encoding='utf-8').read()
orig = s
n = 0

def rep(old, new):
    global s, n
    assert s.count(old) == 1, 'ANCHOR FAIL (%d matches): %r' % (s.count(old), old[:90])
    s = s.replace(old, new)
    n += 1

# ------------------------------------------------------------------ E1
# #saveload panel: slots subtitle + slot list container
rep('''    <p style="color:#8fa3ab;font-size:13px;margin:4px 0 10px">حفظ واحد — يُستبدل في كل مرة.</p>
    <div id="slInfo" class="note">…</div>''',
'''    <p style="color:#8fa3ab;font-size:13px;margin:4px 0 10px">ثلاث خانات للحفظ اليدوي + خانة حفظ تلقائي.</p>
    <div id="slInfo" class="note">…</div>
    <div id="slSlots"></div>''')

# ------------------------------------------------------------------ E2
# bottom buttons act on the selected slot
rep('''      <button class="btn" id="btnSlSave">حفظ الآن</button>
      <button class="btn" id="btnSlLoad">تحميل</button>''',
'''      <button class="btn" id="btnSlSave">حفظ في المحدّدة</button>
      <button class="btn" id="btnSlLoad">تحميل المحدّدة</button>''')

# ------------------------------------------------------------------ E3
# CSS for slot rows
rep('''  #slInfo{font:12px monospace;color:#8fa3ab;direction:ltr}''',
'''  #slInfo{font:12px monospace;color:#8fa3ab;direction:ltr}
  #slSlots{display:flex;flex-direction:column;gap:6px;margin:8px 0;max-height:46vh;overflow:auto}
  .slrow{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #1d2b30;border-radius:6px;cursor:pointer}
  .slrow.sel{border-color:#3d6b60;background:rgba(61,107,96,.08)}
  .slrow .sllab{min-width:86px;color:#cfe3dc;font-size:13px}
  .slrow .slmeta{flex:1;font:11px monospace;color:#8fa3ab;direction:ltr;text-align:left}
  .slbtns{display:flex;gap:6px}''')

# ------------------------------------------------------------------ E4
# help panel: quicksave / quickload
rep('''          <li><kbd>C</kbd> أو <kbd>Ctrl</kbd> — انحناء (أخفّ وأهدأ)</li>''',
'''          <li><kbd>C</kbd> أو <kbd>Ctrl</kbd> — انحناء (أخفّ وأهدأ)</li>
          <li><kbd>F5</kbd> — حفظ سريع · <kbd>F9</kbd> — تحميل سريع · ثلاث خانات حفظ + حفظ تلقائي دوري</li>''')

# ------------------------------------------------------------------ E5
# enterScene: restore enemy death/hp from the position memory
rep('''      const mem=G.flags.pos&&G.flags.pos[key];
      if(mem&&!opt.reset){copy.x=mem.x;copy.y=mem.y;}''',
'''      const mem=G.flags.pos&&G.flags.pos[key];
      if(mem&&!opt.reset){copy.x=mem.x;copy.y=mem.y;
        if(mem.dead)copy.dead=true;
        if(mem.hp!=null)copy.hp=mem.hp;}''')

# ------------------------------------------------------------------ E6
# updateEnts: write the position memory BEFORE the dead-check so dead
# enemies keep a {x,y,dead:true,hp} entry (else they resurrect on load)
rep('''  for(const e of s.entsLive){
    if(e.dead)continue;
    e.t=(e.t||0)+dt;''',
'''  for(const e of s.entsLive){
    /* remember positions & deaths (persisted via G.flags.pos -> saveGame) */
    if(e.key){G.flags.pos=G.flags.pos||{};
      G.flags.pos[e.key]={x:e.x,y:e.y,dead:!!e.dead};if(e.hp!=null)G.flags.pos[e.key].hp=e.hp;}
    if(e.dead)continue;
    e.t=(e.t||0)+dt;''')

# ------------------------------------------------------------------ E7
# drop the old (post-dead-check) writer
rep('''    /* remember positions */
    if(e.key){G.flags.pos=G.flags.pos||{};G.flags.pos[e.key]={x:e.x,y:e.y};}
''', '')

# ------------------------------------------------------------------ E8
# slot helpers + new saveGame/hasSave/loadGame
rep('''function saveGame(auto){
  try{
    const s=G.scene;
    if(s)G.lastSafe=s.safe||G.lastSafe;
    const used={};
    for(const sc of Object.values(SCENES))
      for(const it of sc.ints)if(it.used||it.locked===false)(used[sc.id]=used[sc.id]||{})[it.id]=it.used?'u':'l';
    const doors={};
    for(const sc of Object.values(SCENES))
      for(const d of sc.doors)if(d.open||!d.locked)(doors[sc.id]=doors[sc.id]||{})[d.id]=1;
    const data={
      v:1,sceneId:G.sceneId,px:G.player.x,py:G.player.y,hp:G.player.hp,rad:G.player.rad,
      bat:G.player.bat,sta:G.player.sta,flash:G.player.flash,
      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,story:G.story,docs:G.docs,tapes:G.tapes,syms:G.syms,
      notes:G.notes.slice(0,40),visits:G.visits,trust:G.trust,objective:G.objective,objSub:G.objSub,
      stats:G.stats,lastSafe:G.lastSafe,used,doors,mapUnreliable:G.mapUnreliable,radio:G.radio,
      time:Math.floor(G.time)
    };
    localStorage.setItem(SAVEKEY,JSON.stringify(data));
    if(!auto)toast('تم الحفظ','SAVED');
  }catch(e){}
}
function hasSave(){try{return !!localStorage.getItem(SAVEKEY);}catch(e){return false;}}
function loadGame(){
  try{
    const raw=localStorage.getItem(SAVEKEY);if(!raw)return false;
    const d=JSON.parse(raw);
    buildAllScenes();
    G.player=newPlayer();
    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},story:d.story||null,docs:d.docs||[],
      tapes:d.tapes||[],syms:d.syms||[],notes:d.notes||[],visits:d.visits||{},trust:d.trust||0,
      stats:d.stats||G.stats,lastSafe:d.lastSafe,mapUnreliable:d.mapUnreliable,radio:d.radio,time:d.time||0});
    G.player.x=d.px;G.player.y=d.py;G.player.hp=d.hp==null?3:d.hp;G.player.rad=d.rad||0;
    G.player.bat=d.bat==null?CFG.batMax:d.bat;G.player.flash=!!d.flash;
    /* restore used/doors */
    for(const sid in d.used){const sc=SCENES[sid];if(!sc)continue;
      for(const it of sc.ints){const v=d.used[sid][it.id];if(v==='u')it.used=true;}}
    for(const sid in d.doors){const sc=SCENES[sid];if(!sc)continue;
      for(const dd of sc.doors){if(d.doors[sid][dd.id]){dd.open=true;dd.locked=false;}}}
    G.started=true;G.over=false;
    enterScene(d.sceneId,{x:d.px,y:d.py},{silent:true});
    setObjective(d.objective||'—',d.objSub||'');
    return true;
  }catch(e){console.warn(e);return false;}
}''',
'''/* =====================================================================
   SAVE / LOAD SYSTEM (Phase 12) — autosave + quicksave + manual slots
   slots: 'auto' (SAVEKEY — autosave/quicksave) | '1'..'3' (manual)
   ===================================================================== */
const SAVE_SLOTS=['1','2','3'];
function slotKey(slot){return slot==='auto'?SAVEKEY:SAVEKEY+'_s'+slot;}
function readSlot(slot){try{const raw=localStorage.getItem(slotKey(slot));if(!raw)return null;
  const d=JSON.parse(raw);d._slot=slot;d._ts=d.ts||0;return d;}catch(e){return null;}}
function listSaves(){const out=[];
  if(readSlot('auto'))out.push('auto');
  for(const sl of SAVE_SLOTS)if(readSlot(sl))out.push(sl);
  return out;}
function newestSave(){let best=null;
  for(const sl of ['auto'].concat(SAVE_SLOTS)){const d=readSlot(sl);if(d&&(!best||d._ts>best._ts))best=d;}
  return best;}
function deleteSave(slot){try{localStorage.removeItem(slotKey(slot));}catch(e){}}
function saveGame(auto,slot){
  try{
    slot=slot||(auto?'auto':'1');
    const s=G.scene;
    if(s)G.lastSafe=s.safe||G.lastSafe;
    /* snapshot live enemy state (position / death / hp) of the current scene */
    if(s&&s.entsLive){G.flags.pos=G.flags.pos||{};
      for(const e of s.entsLive)if(e.key){
        G.flags.pos[e.key]={x:e.x,y:e.y,dead:!!e.dead};if(e.hp!=null)G.flags.pos[e.key].hp=e.hp;}}
    const used={};
    for(const sc of Object.values(SCENES))
      for(const it of sc.ints)if(it.used||it.locked===false)(used[sc.id]=used[sc.id]||{})[it.id]=it.used?'u':'l';
    const doors={};
    for(const sc of Object.values(SCENES))
      for(const d of sc.doors)if(d.open||!d.locked)(doors[sc.id]=doors[sc.id]||{})[d.id]=1;
    const data={
      v:2,ts:Date.now(),slot,
      sceneId:G.sceneId,px:G.player.x,py:G.player.y,
      face:G.player.face,modelYaw:(G.player.modelYaw==null?0:G.player.modelYaw),
      crouchLock:!!G.player.crouchLock,injured:G.player.injured||0,
      vert:(G.player.py||0),grounded:G.player.grounded!==false,
      hp:G.player.hp,rad:G.player.rad,sta:G.player.sta,
      bat:G.player.bat,flash:G.player.flash,
      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,story:G.story,docs:G.docs,tapes:G.tapes,syms:G.syms,
      notes:G.notes.slice(0,40),visits:G.visits,trust:G.trust,objective:G.objective,objSub:G.objSub,
      stats:G.stats,lastSafe:G.lastSafe,used,doors,mapUnreliable:G.mapUnreliable,radio:G.radio,
      set:(typeof UI!=='undefined'&&UI.SET)?UI.SET:null,
      time:Math.floor(G.time)
    };
    localStorage.setItem(slotKey(slot),JSON.stringify(data));
    if(!auto)toast('تم الحفظ','SAVED · '+(slot==='auto'?'AUTO':'SLOT '+slot));
  }catch(e){}
}
function hasSave(){try{
  if(localStorage.getItem(SAVEKEY))return true;
  for(const sl of SAVE_SLOTS)if(localStorage.getItem(slotKey(sl)))return true;
  return false;}catch(e){return false;}}
function loadGame(slot){
  try{
    const d=slot?readSlot(slot):newestSave();if(!d)return false;
    buildAllScenes();
    G.player=newPlayer();
    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},story:d.story||null,docs:d.docs||[],
      tapes:d.tapes||[],syms:d.syms||[],notes:d.notes||[],visits:d.visits||{},trust:d.trust||0,
      stats:d.stats||G.stats,lastSafe:d.lastSafe,mapUnreliable:d.mapUnreliable,radio:d.radio,time:d.time||0});
    G.player.x=d.px;G.player.y=d.py;G.player.hp=d.hp==null?3:d.hp;G.player.rad=d.rad||0;
    G.player.bat=d.bat==null?CFG.batMax:d.bat;G.player.flash=!!d.flash;
    G.player.sta=d.sta==null?CFG.staMax:d.sta;
    G.player.face=d.face||0;G.player.modelYaw=(d.modelYaw==null?(d.face||0):d.modelYaw);
    G.player.crouchLock=!!d.crouchLock;G.player.injured=d.injured||0;
    G.player.py=d.vert||0;G.player.grounded=d.grounded!==false;
    /* settings travel with the save */
    if(d.set&&typeof UI!=='undefined'&&UI.SET){try{Object.assign(UI.SET,d.set);UI.apply();UI.save();}catch(e){}}
    /* restore used/doors */
    for(const sid in d.used){const sc=SCENES[sid];if(!sc)continue;
      for(const it of sc.ints){const v=d.used[sid][it.id];if(v==='u')it.used=true;}}
    for(const sid in d.doors){const sc=SCENES[sid];if(!sc)continue;
      for(const dd of sc.doors){if(d.doors[sid][dd.id]){dd.open=true;dd.locked=false;}}}
    G.started=true;G.over=false;
    enterScene(d.sceneId,{x:d.px,y:d.py},{silent:true});
    setObjective(d.objective||'—',d.objSub||'');
    return true;
  }catch(e){console.warn(e);return false;}
}''')

# ------------------------------------------------------------------ E9
# preventDefault for F9 as well
rep('''    if(['Tab','F5','Space'].includes(e.code))e.preventDefault();''',
'''    if(['Tab','F5','F9','Space'].includes(e.code))e.preventDefault();''')

# ------------------------------------------------------------------ E10
# F5 -> quicksave to the auto slot; F9 -> quickload (newest)
rep('''      case 'F5':saveGame(false);break;''',
'''      case 'F5':saveGame(false,'auto');break;
      case 'F9':{if(loadGame()){if(G.paused)togglePause();toast('تم التحميل','QUICK LOADED');}
        else toast('لا يوجد حفظ','NO SAVE TO LOAD');}break;''')

# ------------------------------------------------------------------ E11
# closing the game (tab/window) triggers one last autosave
rep('''  window.addEventListener('blur',()=>{IN.keys={};});''',
'''  window.addEventListener('blur',()=>{IN.keys={};});
  window.addEventListener('beforeunload',()=>{try{if(G.started&&!G.over)saveGame(true);}catch(e){}});''')

# ------------------------------------------------------------------ E12
# UI: slot-aware saveInfo / renderSaveLoad / doSave / doLoad
rep('''  saveInfo(){try{const raw=localStorage.getItem(SAVEKEY);if(!raw)return null;const d=JSON.parse(raw);
    const sc=SCENES[d.sceneId];return {scene:d.sceneId,name:sc?sc.name:d.sceneId,time:d.time||0,hp:d.hp};}catch(e){return null;}},
  renderSaveLoad(){
    const info=UI.saveInfo(),i=$('slInfo'),m=$('slMsg');
    if(i)i.textContent=info?('آخر حفظ: '+info.name+'  ·  HP '+info.hp+'/3  ·  t='+Math.floor(info.time)+'s'):'لا يوجد حفظ بعد.';
    if(m)m.textContent='';
    const ld=$('btnSlLoad');if(ld&&ld.classList)ld.classList.toggle('disabled',!info);
    const sv=$('btnSlSave');if(sv&&sv.classList)sv.classList.toggle('disabled',!G.started||G.over);
  },
  doSave(){if(!G.started||G.over){const m=$('slMsg');if(m)m.textContent='لا يمكن الحفظ الآن.';return false;}
    saveGame(false);UI.renderSaveLoad();const m=$('slMsg');if(m)m.textContent='تم الحفظ.';toast('تم الحفظ','GAME SAVED');return true;},
  doLoad(){const info=UI.saveInfo();if(!info){const m=$('slMsg');if(m)m.textContent='لا يوجد حفظ.';return false;}
    UI.closeSaveLoad();if(G.paused)togglePause();
    if(loadGame()){toast('تم التحميل','GAME LOADED');return true;}return false;},''',
'''  saveInfo(slot){const d=slot?readSlot(slot):newestSave();if(!d)return null;
    const sc=SCENES[d.sceneId];
    return {slot:d._slot,scene:d.sceneId,name:sc?sc.name:d.sceneId,time:d.time||0,hp:(d.hp==null?3:d.hp),ts:d._ts};},
  renderSaveLoad(){
    const m=$('slMsg');if(m)m.textContent='';
    const box=$('slSlots');
    if(box){
      box.innerHTML='';if(box.replaceChildren)box.replaceChildren();
      UI._slBtns={};UI._slRows={};
      const mkRow=(sl,title)=>{
        const d=readSlot(sl);
        const r=el('div','slrow'+(UI.slSel===sl?' sel':''));
        const l=el('div','sllab',title);
        const meta=el('div','slmeta',d?((d.name||d.sceneId)+' · HP '+(d.hp==null?3:d.hp)+'/3 · '+Math.floor(d.time||0)+'s'):'— فارغة —');
        const bs=el('div','slbtns');
        r.appendChild(l);r.appendChild(meta);r.appendChild(bs);box.appendChild(r);
        let bSave=null;
        if(sl!=='auto'){bSave=el('button','btn small','حفظ');
          bSave.onclick=()=>{UI.slSel=sl;UI.doSave(sl);};
          bSave.classList.toggle('disabled',!G.started||G.over);bs.appendChild(bSave);}
        const bLoad=el('button','btn small','تحميل');
        bLoad.onclick=()=>{UI.slSel=sl;UI.doLoad(sl);};
        bLoad.classList.toggle('disabled',!d);bs.appendChild(bLoad);
        const bDel=el('button','btn small','حذف');
        bDel.onclick=()=>{deleteSave(sl);UI.renderSaveLoad();const mm=$('slMsg');if(mm)mm.textContent='تم حذف الخانة.';};
        bDel.classList.toggle('disabled',!d);bs.appendChild(bDel);
        r.onclick=()=>{UI.slSel=sl;UI.renderSaveLoad();};
        UI._slRows[sl]=r;UI._slBtns[sl]={save:bSave,load:bLoad,del:bDel};
      };
      mkRow('auto','حفظ تلقائي');
      for(const sl of SAVE_SLOTS)mkRow(sl,'خانة '+sl);
    }
    const info=UI.saveInfo(UI.slSel),i=$('slInfo');
    if(i)i.textContent=info?('المحدّدة — '+info.name+'  ·  HP '+info.hp+'/3  ·  t='+Math.floor(info.time)+'s'):'لا يوجد حفظ بعد.';
    const ld=$('btnSlLoad');if(ld&&ld.classList)ld.classList.toggle('disabled',!info);
    const sv=$('btnSlSave');if(sv&&sv.classList)sv.classList.toggle('disabled',!G.started||G.over);
  },
  doSave(slot){slot=slot||UI.slSel||'1';
    if(!G.started||G.over){const m=$('slMsg');if(m)m.textContent='لا يمكن الحفظ الآن.';return false;}
    saveGame(false,slot);UI.renderSaveLoad();
    const m=$('slMsg');if(m)m.textContent='تم الحفظ في '+(slot==='auto'?'الحفظ التلقائي':'الخانة '+slot)+'.';
    toast('تم الحفظ','GAME SAVED · '+(slot==='auto'?'AUTO':'SLOT '+slot));return true;},
  doLoad(slot){
    let d=slot?readSlot(slot):null;if(!d)d=newestSave();
    if(!d){const m=$('slMsg');if(m)m.textContent='لا يوجد حفظ.';return false;}
    slot=d._slot;
    UI.closeSaveLoad();if(G.paused)togglePause();
    if(loadGame(slot)){toast('تم التحميل','GAME LOADED · '+(slot==='auto'?'AUTO':'SLOT '+slot));return true;}return false;},''')

# ------------------------------------------------------------------ E13
# UI.init: default selected slot
rep('''    UI._ready=true;''',
'''    if(!UI.slSel)UI.slSel='1';
    UI._ready=true;''')

# ------------------------------------------------------------------ E14
# pause-menu Save button opens the slot panel
rep('''  $('btnSave').onclick=()=>saveGame(false);''',
'''  $('btnSave').onclick=()=>{if(typeof UI!=='undefined'&&UI.openSaveLoad)UI.openSaveLoad('pause');else saveGame(false);};''')

io.open(P, 'w', encoding='utf-8').write(s)
print('PATCH_P12_OK edits=%d bytes=%d' % (n, len(s.encode('utf-8'))))
