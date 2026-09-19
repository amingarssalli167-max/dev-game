# -*- coding: utf-8 -*-
# Phase 11 — UI System: minimal auto-hiding HUD + health pips + settings
# (persisted) + save/load panel. Additive; no rewrites.
import io
p='/home/user/chernobyl/index.html'
s=io.open(p,encoding='utf-8').read()
n=0
def rep(old,new,label):
    global s,n
    c=s.count(old)
    assert c==1, 'ANCHOR [%s] count=%d'%(label,c)
    s=s.replace(old,new,1); n+=1

# ---------------------------------------------------------------- 1. CSS
rep('  #hint.dim{opacity:.32}',
'''  #hint.dim{opacity:.32}
  /* --- Phase 11: UI system (health pips, settings, save/load) --- */
  .hp{display:flex;gap:4px;justify-content:center;margin-top:6px}
  .hp i{width:10px;height:10px;display:block;background:#a4453a;border:1px solid #6b2a22;box-shadow:0 0 6px rgba(160,60,50,.4)}
  .hp i.off{background:#241a19;border-color:#3a2b27;box-shadow:none}
  #settings .panel,#saveload .panel{max-width:560px}
  .setrow{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:9px 2px;border-bottom:1px solid #1b2228}
  .setrow .sl{font-size:14px;color:#c3ced4}
  .setrow .sd{font-size:11px;color:#68757c;margin-top:2px}
  .setrow input[type=range]{width:170px;accent-color:#7fa8b0}
  .setrow .val{font:12px monospace;color:#8fb6bd;min-width:46px;text-align:left;direction:ltr}
  .toggle{padding:6px 16px;border:1px solid #2c3a41;background:#141a1f;color:#9fb0b7;cursor:pointer;font-size:13px}
  .toggle.on{border-color:#4d7d84;color:#bfe6dd;background:#16232a}
  #slInfo{font:12px monospace;color:#8fa3ab;direction:ltr}''','css')

# ---------------------------------------------------------------- 2. vitals: health pips
rep('''  <div id="vitals">
    <div class="vit"><div class="lbl">التحمّل</div><div class="bar"><i id="vSta"></i></div></div>''',
'''  <div id="vitals">
    <div class="vit"><div class="lbl">الحالة</div><div class="hp" id="vHp"><i></i><i></i><i></i></div></div>
    <div class="vit"><div class="lbl">التحمّل</div><div class="bar"><i id="vSta"></i></div></div>''','vitals-hp')

# ---------------------------------------------------------------- 3. settings + saveload overlays
rep('<!-- dialogue -->\n<div id="dlg" class="hide">',
'''<!-- settings -->
<div id="settings" class="ov hide">
  <div class="panel">
    <h2>الإعدادات</h2>
    <div id="setBody" class="scroll"></div>
    <div class="btnrow">
      <button class="btn" id="btnSetReset">استعادة الافتراضي</button>
      <button class="btn" id="btnSetClose">رجوع</button>
    </div>
  </div>
</div>
<!-- save / load -->
<div id="saveload" class="ov hide">
  <div class="panel">
    <h2>الحفظ والتحميل</h2>
    <p style="color:#8fa3ab;font-size:13px;margin:4px 0 10px">حفظ واحد — يُستبدل في كل مرة.</p>
    <div id="slInfo" class="note">…</div>
    <div class="btnrow">
      <button class="btn" id="btnSlSave">حفظ الآن</button>
      <button class="btn" id="btnSlLoad">تحميل</button>
      <button class="btn" id="btnSlClose">رجوع</button>
    </div>
    <p id="slMsg" style="min-height:16px;color:#9ad0c0;font-size:12px;margin-top:8px"></p>
  </div>
</div>
<!-- dialogue -->
<div id="dlg" class="hide">''','overlays')

# ---------------------------------------------------------------- 4. pause buttons
rep('''      <button class="btn" id="btnResume">متابعة</button>
      <button class="btn" id="btnSave">حفظ</button>
      <button class="btn" id="btnPauseHelp">التحكم</button>''',
'''      <button class="btn" id="btnResume">متابعة</button>
      <button class="btn" id="btnSettings">الإعدادات</button>
      <button class="btn" id="btnSave">حفظ</button>
      <button class="btn" id="btnLoad">تحميل</button>
      <button class="btn" id="btnPauseHelp">التحكم</button>''','pause-btns')

# ---------------------------------------------------------------- 5. menu settings button
rep('''      <button class="btn" id="btnHelp">التحكم والفكرة</button>
      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>''',
'''      <button class="btn" id="btnHelp">التحكم والفكرة</button>
      <button class="btn" id="btnSetM">الإعدادات</button>
      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>''','menu-btn')

# ---------------------------------------------------------------- 6. subtitle gate
rep('''function subtitle(who,txt,dur){
  const e=$('sub');
  e.querySelector('.who').textContent=who||'';''',
'''function subtitle(who,txt,dur){
  const e=$('sub');
  if(typeof UI!=='undefined'&&!UI.SET.subtitles){e.style.opacity=0;G.subtitleT=0;return;}
  e.querySelector('.who').textContent=who||'';''','subtitle-gate')

# ---------------------------------------------------------------- 7. grain gate
rep('''  /* grain */
  const gc=grainCanvas();
  fctx.globalAlpha=G.grain;
  fctx.globalCompositeOperation='overlay';
  const pat=fctx.createPattern(gc,'repeat');
  fctx.save();fctx.translate(-(Math.random()*64|0),-(Math.random()*64|0));
  fctx.fillStyle=pat;fctx.fillRect(0,0,VW+64,VH+64);fctx.restore();
  fctx.globalAlpha=1;fctx.globalCompositeOperation='source-over';''',
'''  /* grain */
  if(typeof UI==='undefined'||UI.SET.grain){
  const gc=grainCanvas();
  fctx.globalAlpha=G.grain;
  fctx.globalCompositeOperation='overlay';
  const pat=fctx.createPattern(gc,'repeat');
  fctx.save();fctx.translate(-(Math.random()*64|0),-(Math.random()*64|0));
  fctx.fillStyle=pat;fctx.fillRect(0,0,VW+64,VH+64);fctx.restore();
  fctx.globalAlpha=1;fctx.globalCompositeOperation='source-over';
  }''','grain-gate')

# ---------------------------------------------------------------- 8. vitals hot incl. health + pips
rep('''  const hot=P.sta<45||P.bat<30||P.rad>18;
  G.showVitals=hot?2.5:Math.max(0,G.showVitals-dt);
  $('vitals').classList.toggle('hot',G.showVitals>0);
  $('vSta').style.width=(P.sta/CFG.staMax*100)+'%';
  $('vBat').style.width=(P.bat/CFG.batMax*100)+'%';
  $('vRad').style.width=(P.rad)+'%';
  $('vRad').style.background=P.rad>55?'#a4453a':'#8fa3ab';''',
'''  const hot=P.sta<45||P.bat<30||P.rad>18||P.hp<3||P.injured>0;
  G.showVitals=hot?2.5:Math.max(0,G.showVitals-dt);
  $('vitals').classList.toggle('hot',G.showVitals>0);
  $('vSta').style.width=(P.sta/CFG.staMax*100)+'%';
  $('vBat').style.width=(P.bat/CFG.batMax*100)+'%';
  $('vRad').style.width=(P.rad)+'%';
  $('vRad').style.background=P.rad>55?'#a4453a':'#8fa3ab';
  if(typeof UI!=='undefined')UI.healthPips(P.hp);''','vitals-hot')

# ---------------------------------------------------------------- 9. togglePause volume via UI
rep('''    if(A.ready)A.master.gain.value=0.25;
  }else if(A.ready)A.master.gain.value=0.85;''',
'''    if(typeof UI!=='undefined')UI.applyVolume();else if(A.ready)A.master.gain.value=0.25;
  }else if(typeof UI!=='undefined')UI.applyVolume();else if(A.ready)A.master.gain.value=0.85;''','pause-volume')

# ---------------------------------------------------------------- 10. UI module
rep('''/* =====================================================================
   LOOP / BOOT
   ===================================================================== */
let acc=0;''',
'''/* =====================================================================
   UI SYSTEM (Phase 11) — a minimal, contextual horror HUD + panels.
   - HUD auto-hide: the whole HUD fades out when the player is idle and
     safe, and fades back on any input/threat/prompt/subtitle (immersion).
   - Settings (persisted): sensitivity, volume, subtitles, grain, quality,
     camera distance, HUD auto-hide — applied live to the engine.
   - Save/Load panel: manual save + load with last-save info.
   - Health pips: minimal status shown with the vitals only when relevant.
   The UI only reads game state; it never mutates gameplay systems.
   ===================================================================== */
const SETKEY='chernobyl_settings_v1';
const UI={
  SET:{sens:1.0,volume:0.85,subtitles:true,grain:true,quality:2,camDist:2.7,hudAuto:true},
  DEF:{sens:1.0,volume:0.85,subtitles:true,grain:true,quality:2,camDist:2.7,hudAuto:true},
  setOpen:false, slOpen:false, _ret:'pause',
  hudA:1, actT:99, _lastObj:null, _ready:false,
  load(){try{const raw=localStorage.getItem(SETKEY);if(raw){const d=JSON.parse(raw);
    for(const k in UI.DEF)if(d[k]!==undefined)UI.SET[k]=d[k];}}catch(e){}return UI.SET;},
  save(){try{localStorage.setItem(SETKEY,JSON.stringify(UI.SET));}catch(e){}return true;},
  reset(){for(const k in UI.DEF)UI.SET[k]=UI.DEF[k];UI.save();UI.apply();},
  apply(){
    IN.sens=clamp(UI.SET.sens,0.3,2.5);
    if(typeof E3!=='undefined')E3.quality=clamp(UI.SET.quality|0,0,2);
    if(typeof applyQuality==='function'){try{applyQuality();}catch(e){}}
    if(typeof E3!=='undefined'&&UI.SET.camDist)E3.camDist=clamp(UI.SET.camDist,CFG.camDistMin,CFG.camDistMax);
    UI.applyVolume();
    if(typeof syncModeUI==='function'){try{syncModeUI();}catch(e){}}
  },
  applyVolume(){if(typeof A!=='undefined'&&A.ready&&A.master)A.master.gain.value=clamp(UI.SET.volume,0,1)*(G.paused?0.3:1);},
  init(){
    UI.load();UI.apply();
    const sc=$('btnSetClose');if(sc)sc.onclick=()=>UI.closeSettings();
    const sr=$('btnSetReset');if(sr)sr.onclick=()=>{UI.reset();UI.renderSettings();toast('تمت استعادة الإعدادات الافتراضية','SETTINGS RESET');};
    const ss=$('btnSlSave');if(ss)ss.onclick=()=>UI.doSave();
    const ll=$('btnSlLoad');if(ll)ll.onclick=()=>UI.doLoad();
    const lc=$('btnSlClose');if(lc)lc.onclick=()=>UI.closeSaveLoad();
    UI._ready=true;
  },
  healthPips(hp){const e=$('vHp');if(!e||!e.children)return;
    for(let i=0;i<e.children.length;i++){const c=e.children[i];if(c&&c.classList)c.classList.toggle('off',i>=(hp|0));}},
  openSettings(from){UI._ret=from||'pause';UI.setOpen=true;
    $('pause').classList.add('hide');$('menu').classList.add('hide');
    UI.renderSettings();$('settings').classList.remove('hide');},
  closeSettings(){$('settings').classList.add('hide');UI.setOpen=false;
    if(UI._ret==='menu')$('menu').classList.remove('hide');else $('pause').classList.remove('hide');},
  renderSettings(){
    const b=$('setBody');if(!b)return;b.innerHTML='';if(b.replaceChildren)b.replaceChildren();
    const row=(label,desc,ctrl)=>{const r=el('div','setrow');
      const l=el('div','');l.innerHTML='<div class="sl">'+label+'</div><div class="sd">'+desc+'</div>';
      r.appendChild(l);r.appendChild(ctrl);b.appendChild(r);return r;};
    const slider=(key,min,max,step,fmt)=>{const inp=el('input');inp.type='range';inp.min=String(min);inp.max=String(max);inp.step=String(step);
      inp.value=String(UI.SET[key]);const v=el('span','val',fmt(UI.SET[key]));
      const wrap=el('div','');wrap.style.display='flex';wrap.style.alignItems='center';wrap.style.gap='10px';
      wrap.appendChild(inp);wrap.appendChild(v);
      inp.addEventListener('input',()=>{UI.SET[key]=clamp(parseFloat(inp.value)||min,min,max);v.textContent=fmt(UI.SET[key]);UI.apply();UI.save();});
      return wrap;};
    const toggle=(key,onLbl,offLbl)=>{const bt=el('button','toggle'+(UI.SET[key]?' on':''),UI.SET[key]?onLbl:offLbl);
      bt.onclick=()=>{UI.SET[key]=!UI.SET[key];bt.classList.toggle('on',UI.SET[key]);bt.textContent=UI.SET[key]?onLbl:offLbl;UI.apply();UI.save();};
      return bt;};
    row('حساسية الفأرة','Mouse sensitivity',slider('sens',0.3,2.5,0.05,x=>x.toFixed(2)));
    row('مستوى الصوت','Master volume',slider('volume',0,1,0.05,x=>Math.round(x*100)+'%'));
    row('مسافة الكاميرا','Camera distance',slider('camDist',CFG.camDistMin,CFG.camDistMax,0.1,x=>x.toFixed(1)));
    const q=el('button','toggle on',['منخفضة','متوسطة','عالية'][clamp(UI.SET.quality|0,0,2)]);
    q.onclick=()=>{UI.SET.quality=(UI.SET.quality+1)%3;q.textContent=['منخفضة','متوسطة','عالية'][UI.SET.quality];UI.apply();UI.save();};
    row('الجودة','Render quality',q);
    row('الترجمات','Subtitles',toggle('subtitles','مفعّلة','مطفأة'));
    row('حبيبات الفيلم','Film grain',toggle('grain','مفعّلة','مطفأة'));
    row('إخفاء الواجهة تلقائيًا','Hide HUD when idle',toggle('hudAuto','مفعّل','معطّل'));
  },
  openSaveLoad(from){UI._ret=from||'pause';UI.slOpen=true;
    $('pause').classList.add('hide');$('menu').classList.add('hide');
    UI.renderSaveLoad();$('saveload').classList.remove('hide');},
  closeSaveLoad(){$('saveload').classList.add('hide');UI.slOpen=false;
    if(UI._ret==='menu')$('menu').classList.remove('hide');else $('pause').classList.remove('hide');},
  saveInfo(){try{const raw=localStorage.getItem(SAVEKEY);if(!raw)return null;const d=JSON.parse(raw);
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
    if(loadGame()){toast('تم التحميل','GAME LOADED');return true;}return false;},
  update(dt){
    if(!G.started||G.over)return;
    const P=G.player;
    let act=0;
    if(IN.keys){for(const k in IN.keys){if(IN.keys[k]){act=1;break;}}}
    if(IN.joy&&(IN.joy.x||IN.joy.y))act=1;
    if(Math.abs(IN.lookX||0)+Math.abs(IN.lookY||0)>0.6)act=1;
    if(P&&(P.moving||P.sprint||P.injured>0||P.dmgFlash>0))act=1;
    if(G.threat>0.05)act=1;
    if(G.subtitleT>0)act=1;
    if(typeof curInt!=='undefined'&&curInt)act=1;
    if(DLG.open||DOC.open||NB.open||INVUI.open||CODE.open||PZUI.open||UI.setOpen||UI.slOpen)act=1;
    if(G.objective!==UI._lastObj){UI._lastObj=G.objective;act=1;}
    if(act||!UI.SET.hudAuto)UI.actT=UI.SET.hudAuto?2.6:1e9;else UI.actT=Math.max(0,UI.actT-dt);
    const target=UI.actT>0?1:0;
    UI.hudA+=(target-UI.hudA)*(1-Math.pow(0.0009,dt));
    if(UI.hudA<0.002)UI.hudA=0;if(UI.hudA>0.998)UI.hudA=1;
    const h=$('hud');if(h&&h.style)h.style.opacity=UI.hudA.toFixed(3);
  },
};

/* =====================================================================
   LOOP / BOOT
   ===================================================================== */
let acc=0;''','ui-module')

# ---------------------------------------------------------------- 11. keydown guards
rep('''    if(NB.open){if(e.code==='Tab'||e.code==='KeyJ'||e.code==='Escape')closeNb();return;}
    if(!G.started){return;}''',
'''    if(NB.open){if(e.code==='Tab'||e.code==='KeyJ'||e.code==='Escape')closeNb();return;}
    if(typeof UI!=='undefined'&&UI.slOpen){if(e.code==='Escape')UI.closeSaveLoad();return;}
    if(typeof UI!=='undefined'&&UI.setOpen){if(e.code==='Escape')UI.closeSettings();return;}
    if(!G.started){return;}''','keydown-guards')

# ---------------------------------------------------------------- 12. boot wiring + UI.init
rep('''  $('btnResume').onclick=togglePause;
  $('btnSave').onclick=()=>saveGame(false);
  $('btnQuit').onclick=()=>location.reload();
  if(!hasSave()){$('btnCont').style.opacity=.35;$('btnCont').title='لا يوجد حفظ';}''',
'''  $('btnResume').onclick=togglePause;
  $('btnSave').onclick=()=>saveGame(false);
  $('btnQuit').onclick=()=>location.reload();
  if(typeof UI!=='undefined'){
    UI.init();
    const bset=$('btnSettings');if(bset)bset.onclick=()=>UI.openSettings('pause');
    const bload=$('btnLoad');if(bload)bload.onclick=()=>UI.openSaveLoad('pause');
    const bmset=$('btnSetM');if(bmset)bmset.onclick=()=>UI.openSettings('menu');
  }
  if(!hasSave()){$('btnCont').style.opacity=.35;$('btnCont').title='لا يوجد حفظ';}''','boot-wiring')

# ---------------------------------------------------------------- 13. loop UI.update
rep('''  updateHint();
  render3D();renderPost(dt);''',
'''  updateHint();
  if(typeof UI!=='undefined')UI.update(dt);
  render3D();renderPost(dt);''','loop-update')

io.open(p,'w',encoding='utf-8').write(s)
print('PATCH_P11_OK edits=%d bytes=%d'%(n,len(s.encode('utf-8'))))
