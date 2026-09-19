# -*- coding: utf-8 -*-
"""Mouse-look controls + removal of the 2.5D renderer (3D only)."""
import re, sys

P='/home/user/chernobyl/index.html'
s=open(P,encoding='utf-8').read()
start=len(s)
log=[]

def sub(x,y,tag=''):
    global s
    if x not in s:
        log.append('MISS '+tag+' :: '+repr(x[:90])); return False
    s=s.replace(x,y,1); log.append('ok   '+tag); return True

# ---------------------------------------------------------------- state
sub("""const IN={keys:{},mx:0,my:0,aim:0,joy:{x:0,y:0},touchLook:false,touch:false,
  down(e){this.keys[e.code]=true;},up(e){this.keys[e.code]=false;}};
const K=c=>!!IN.keys[c];
let mouseInCanvas=false;""",
"""const IN={keys:{},mx:0,my:0,aim:Math.PI/2,joy:{x:0,y:0},touch:false,
  lookX:0,lookY:0,locked:false,dragging:false,sens:1.0,
  down(e){this.keys[e.code]=true;},up(e){this.keys[e.code]=false;}};
const K=c=>!!IN.keys[c];""",'IN state')

# ---------------------------------------------------------------- updatePlayer
sub("""  let ix=0,iy=0;
  if(K('KeyW')||K('ArrowUp'))iy-=1;
  if(K('KeyS')||K('ArrowDown'))iy+=1;
  if(K('KeyA')||K('ArrowLeft'))ix-=1;
  if(K('KeyD')||K('ArrowRight'))ix+=1;
  ix+=IN.joy.x;iy+=IN.joy.y;""",
"""  let ix=0,iy=0;
  if(K('KeyW')||K('ArrowUp'))iy-=1;
  if(K('KeyS')||K('ArrowDown'))iy+=1;
  if(K('KeyA')||K('ArrowLeft'))ix-=1;
  if(K('KeyD')||K('ArrowRight'))ix+=1;
  ix+=IN.joy.x;iy+=IN.joy.y;
  /* camera-relative movement: W = where you look, never where the screen points */
  if(ix||iy){
    const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
    const rx=ix*ca-iy*sa, ry=ix*sa+iy*ca;
    ix=rx;iy=ry;
  }""",'movement relative to view')

sub("""  /* aim */
  if(mouseInCanvas||IN.touchLook){
    const wx=s2wx(IN.mx),wy=s2wy(IN.my);
    if(Math.hypot(wx-P.x,wy-P.y)>0.5)IN.aim=Math.atan2(wy-P.y,wx-P.x);
  }else if(P.moving){
    IN.aim=angLerp(IN.aim,Math.atan2(iy,ix),1-Math.pow(0.001,dt));
  }
  P.face=IN.aim;""",
"""  /* aim — the mouse owns the view direction; movement never drags it around */
  const lookMag=Math.abs(IN.lookX)+Math.abs(IN.lookY);
  if(lookMag>0.02){
    IN.movedByMouse=true;
  }else if(P.moving&&!IN.movedByMouse&&mag>0.3){
    /* touch / no-mouse fallback: face where you walk */
    IN.aim=angLerp(IN.aim,Math.atan2(iy,ix),1-Math.pow(0.002,dt));
  }
  P.face=IN.aim;""",'aim from mouse only')

# ---------------------------------------------------------------- input bindings
old_mouse = """  cv.addEventListener('mousemove',e=>{IN.mx=e.clientX;IN.my=e.clientY;mouseInCanvas=true;});
  cv.addEventListener('mousedown',e=>{
    audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
    if(!G.started||G.over)return;
    if(e.button===0){
      if(DLG.open){nextLine();return;}
      doInteract();
    }else if(e.button===2)toggleFlash();
  });
  cv.addEventListener('contextmenu',e=>e.preventDefault());"""
new_mouse = """  /* ---- mouse look: pointer lock + drag fallback ---- */
  const glc=$('gl');
  const addLook=(dx,dy)=>{
    if(!dx&&!dy)return;
    IN.lookX+=clamp(dx,-260,260);
    IN.lookY+=clamp(dy,-260,260);
    if(!IN.locked){IN.mx+=dx;IN.my+=dy;}
  };
  /* the mouse owns the view direction — raw deltas, no dead zone, no snapping */
  document.addEventListener('mousemove',e=>addLook(e.movementX||0,e.movementY||0));
  const lockOn=()=>{IN.locked=true;$('cross').classList.add('lk');};
  const lockOff=()=>{IN.locked=false;$('cross').classList.remove('lk');};
  document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement===glc||document.pointerLockElement===cv)lockOn();else lockOff();
  });
  document.addEventListener('pointerlockerror',()=>lockOff());
  const wantLock=()=>{
    const t=glc||cv;
    if(!t||IN.locked||!t.requestPointerLock)return;
    try{t.requestPointerLock();}catch(err){}
  };
  glc.addEventListener('mousedown',e=>{
    audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
    if(!G.started||G.over||G.paused)return;
    if(!IN.locked){wantLock();return;}
    if(e.button===0){if(DLG.open)nextLine();else doInteract();}
    else if(e.button===2)toggleFlash();
  });
  glc.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('blur',()=>{IN.lookX=IN.lookY=0;});
  addEventListener('beforeunload',()=>{if(document.exitPointerLock)try{document.exitPointerLock();}catch(e){}});"""
sub(old_mouse,new_mouse,'mouse look bindings')

sub("""    cv.addEventListener('touchstart',e=>{
      audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
      const t=e.changedTouches[0];
      if(t.clientX>VW*0.35){IN.mx=t.clientX;IN.my=t.clientY;IN.touchLook=true;mouseInCanvas=true;}
    },{passive:true});
    cv.addEventListener('touchmove',e=>{
      const t=e.changedTouches[0];
      if(t.clientX>VW*0.3){IN.mx=t.clientX;IN.my=t.clientY;IN.touchLook=true;}
    },{passive:true});""",
"""    let lookId=null,lx=0,ly=0;
    glc.addEventListener('touchstart',e=>{
      audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
      const t=e.changedTouches[0];
      if(t.clientX>VW*0.32&&lookId===null){lookId=t.identifier;lx=t.clientX;ly=t.clientY;}
    },{passive:true});
    glc.addEventListener('touchmove',e=>{
      for(const t of e.changedTouches)if(t.identifier===lookId){
        addLook((t.clientX-lx)*1.5,(t.clientY-ly)*1.5);lx=t.clientX;ly=t.clientY;}
    },{passive:true});
    const lend=e=>{for(const t of e.changedTouches)if(t.identifier===lookId)lookId=null;};
    glc.addEventListener('touchend',lend,{passive:true});
    glc.addEventListener('touchcancel',lend,{passive:true});""",'touch look')

sub("""      case 'KeyV':if(G.mode3d)toggleView();else toast('اضغط B أولًا لتشغيل 3D','');break;
      case 'KeyB':setMode3D(!G.mode3d);break;
      case 'KeyG':cycleQuality();break;""",
"""      case 'KeyV':toggleView();break;
      case 'KeyG':cycleQuality();break;""",'keys V/G (B removed)')

sub("""function togglePause(){""","""function togglePause(){""",'noop-anchor')

# ---------------------------------------------------------------- loop
sub("""  if(!G.started){renderMenuBg(dt);return;}
  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open){
    G.time+=dt*0.15;
    if(G.scene){
      if(G.mode3d&&E3.ok){update3D(dt*0.25);mirror3D();}
      else render();
      renderPost(dt);
    }
    return;
  }""",
"""  if(!G.started){renderMenuBg(dt);return;}
  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open){
    G.time+=dt*0.15;
    if(G.scene&&G.player&&E3.ok){
      if(G.shakeT>0){G.shakeT-=dt*0.15;const a=G.shakeA*(G.shakeT>0?G.shakeT:0);
        cam.shakeX=(Math.random()*2-1)*a;cam.shakeY=(Math.random()*2-1)*a;}
      update3D(dt*0.25);mirror3D();renderPost(dt);
    }
    return;
  }""",'loop paused branch')

sub("""  updateAnoms(dt);
  camUpdate(dt);
  if(G.subtitleT>0)""",
"""  updateAnoms(dt);
  if(G.subtitleT>0)""",'loop: camUpdate removed')

sub("""  if(G.mode3d&&E3.ok){render3D();renderPost(dt);}
  else{render();renderPost(dt);}
  audioDynamic(dt);""",
"""  render3D();renderPost(dt);
  audioDynamic(dt);""",'loop: 3D only')

# ---------------------------------------------------------------- update3D look + camera
sub("""function update3D(dt){
  const s=G.scene,P=G.player;
  if(!s||!P||!E3.ok)return;
  build3D(false);
  if(!E3.world)return;
  E3.frame++;
  /* ---- look direction ---- */
  if(mouseInCanvas||IN.touchLook){
    const halfFov=(E3.camera.fov*Math.PI/180)/2*(VW/VH>1?1:1);
    const nx=(IN.mx-VW/2)/(VW/2),ny=(IN.my-VH/2)/(VH/2);
    if(E3.view==='fps'){
      E3.yaw=IN.aim;
      E3.pitch=clamp(-ny*0.85,-0.95,0.85);
    }else{
      E3.yaw=angLerp(E3.yaw,IN.aim,1-Math.pow(0.0009,dt));
      E3.pitch=lerp(E3.pitch,clamp(-ny*0.55,-0.5,0.5),1-Math.pow(0.002,dt));
    }
  }else{
    E3.yaw=angLerp(E3.yaw,IN.aim,1-Math.pow(0.0009,dt));
    E3.pitch=lerp(E3.pitch,-0.03,dt*2);
  }""",
"""function update3D(dt){
  const s=G.scene,P=G.player;
  if(!E3.ok)return;
  if(!s||!P){
    E3.renderer.render(E3.scene,E3.camera);
    IN.lookX=IN.lookY=0;
    return;
  }
  build3D(false);
  if(!E3.world)return;
  E3.frame++;
  /* ---- mouse look: raw deltas, no lag, no drift ---- */
  const fps=(E3.view==='fps');
  if(IN.lookX||IN.lookY){
    const k=(fps?0.0021:0.0025)*IN.sens;
    IN.aim=((IN.aim-IN.lookX*k)%TAU+TAU)%TAU;
    E3.pitchT=clamp(E3.pitchT+IN.lookY*(fps?0.0026:0.0020)*IN.sens,
      fps?-1.05:-0.44, fps?0.95:0.78);
    IN.lookX=0;IN.lookY=0;
  }
  E3.pitch=lerp(E3.pitch,E3.pitchT,1-Math.pow(0.00002,dt));
  P.face=IN.aim;""",'update3D mouse look')

sub("""    cam.rotation.order='YXZ';
    cam.rotation.y=-E3.yaw-Math.PI/2;
    cam.rotation.x=E3.pitch;
    cam.rotation.z=P.injured>0?Math.sin(G.time*2.2)*0.03:0;
    cam.fov=72;
  }else{
    const back=2.35,side=0.62,up=2.02;
    let cx=px-Math.cos(E3.yaw)*back-Math.sin(E3.yaw)*side;
    let cz=pz-Math.sin(E3.yaw)*back+Math.cos(E3.yaw)*side;
    let cy=up+bobY*0.5;
    /* camera collision: pull in along the ray */
    for(let i=1;i<=10;i++){
      const t=i/10;
      const tx=lerp(px,cx,t),tz=lerp(pz,cz,t),ty=lerp(eye+0.15,cy,t);
      if(solidAt3(tx,tz,ty)){cx=lerp(px,cx,Math.max(0.18,t-0.1));cz=lerp(pz,cz,Math.max(0.18,t-0.1));
        cy=lerp(eye+0.15,cy,Math.max(0.18,t-0.1));break;}
    }
    cam.position.set(cx,cy,cz);
    const lookY=eye-0.12+E3.pitch*1.6;
    const lx=px+Math.cos(E3.yaw)*3.2, lz=pz+Math.sin(E3.yaw)*3.2;
    cam.lookAt(lx,lookY,lz);
    cam.rotation.z+=P.injured>0?Math.sin(G.time*2.2)*0.035:bobX*0.10;
    cam.fov=66;
  }
  cam.updateProjectionMatrix();""",
"""    cam.rotation.order='YXZ';
    cam.rotation.y=-IN.aim-Math.PI/2;
    cam.rotation.x=E3.pitch;
    cam.rotation.z=P.injured>0?Math.sin(G.time*2.2)*0.03:0;
    cam.fov=74;
  }else{
    const back=2.45,side=0.68,up=2.06;
    const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
    let cx=px-ca*back-sa*side;
    let cz=pz-sa*back+ca*side;
    let cy=up+bobY*0.5;
    /* camera collision: pull in along the ray */
    for(let i=1;i<=10;i++){
      const t=i/10;
      const tx=lerp(px,cx,t),tz=lerp(pz,cz,t),ty=lerp(eye+0.15,cy,t);
      if(solidAt3(tx,tz,ty)){
        const k=Math.max(0.2,t-0.1);
        cx=lerp(px,cx,k);cz=lerp(pz,cz,k);cy=lerp(eye+0.15,cy,k);break;}
    }
    cam.position.set(cx,cy,cz);
    const lookY=eye-0.10+E3.pitch*2.2;
    cam.lookAt(px+ca*3.4,lookY,pz+sa*3.4);
    cam.rotation.z+=P.injured>0?Math.sin(G.time*2.2)*0.035:bobX*0.10;
    cam.fov=68;
  }
  /* screen shake (replaces the old 2D camera update) */
  if(G.shakeT>0){
    G.shakeT-=dt;
    const a=G.shakeA*(G.shakeT>0?G.shakeT:0);
    cam.shakeX=(Math.random()*2-1)*a;cam.shakeY=(Math.random()*2-1)*a;
  }else{cam.shakeX=cam.shakeY=0;}
  if(cam.shakeX||cam.shakeY){
    cam.position.x+=cam.shakeX*0.022;
    cam.position.y+=cam.shakeY*0.022;
    cam.rotation.z+=cam.shakeX*0.0016;
  }
  cam.updateProjectionMatrix();""",'update3D camera + shake')

# ---------------------------------------------------------------- mode plumbing
sub("""function render3D(){
  if(!E3.ok||!G.mode3d)return;
  update3D(G.dt||0.016);
  note3DFrame();
  mirror3D();
}""",
"""function render3D(){
  if(!E3.ok)return;
  update3D(G.dt||0.016);
  note3DFrame();
  mirror3D();
}""",'render3D guard')

sub("""function renderMenu3D(){
  if(!E3.ok||!G.mode3d||!G.scene)return;
  update3D(0.016);
}
""","",'renderMenu3D removed')

sub("""function syncModeUI(){
  const m=G.mode3d&&E3.ok;
  $('btn3D').classList.toggle('on',m);
  $('btn2D').classList.toggle('on',!m);
  $('btnMode').textContent='المحرّك: '+(m?'3D':'2.5D');
  $('btnCam2').textContent='الكاميرا: '+(E3.view==='ots'?'فوق الكتف':'منظور أول');
  $('btnCam').textContent='كاميرا: '+(E3.view==='ots'?'فوق الكتف':'منظور أول');
  $('btnQ').textContent='الجودة: '+['منخفضة','متوسطة','عالية'][E3.quality];
  $('cross').classList.toggle('on',m&&E3.view==='fps');
}
function showCanvas3D(on){
  const g=$('gl');if(!g)return;
  g.style.display=on?'block':'none';
  cv.style.display=on?'none':'block';
}""",
"""function syncModeUI(){
  $('btnQ').textContent='الجودة: '+['منخفضة','متوسطة','عالية'][E3.quality];
  $('btnCam2').textContent='الكاميرا: '+(E3.view==='ots'?'فوق الكتف':'منظور أول');
  $('cross').classList.toggle('on',E3.view==='fps');
}""",'syncModeUI / showCanvas3D')

i=s.index('function setMode3D(')
j=s.index('function toggleView(){',i)
s=s[:i]+s[j:]
log.append('ok   setMode3D deleted')

sub("""function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  syncModeUI();
  toast(E3.view==='ots'?'كاميرا فوق الكتف القريبة':'منظور الشخص الأول',
    E3.view==='ots'?'كما في وثيقة التصميم — لا ترى كل شيء':'رؤية أضيق، رعب أكبر');
}""",
"""function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  E3.pitchT=E3.view==='fps'?0:clamp(E3.pitchT,-0.44,0.78);
  syncModeUI();
  toast(E3.view==='ots'?'كاميرا فوق الكتف القريبة':'منظور الشخص الأول',
    E3.view==='ots'?'كما في وثيقة التصميم — لا ترى كل شيء':'الماوس = النظر، WASD = الحركة باتجاه نظرك');
}""",'toggleView')

sub("""function build3D(force){
  if(!G.mode3d||!E3.ok)return;""",
"""function build3D(force){
  if(!E3.ok)return;""",'build3D guard')

sub("""  ok:false, renderer:null, scene:null, camera:null, world:null,""",
"""  pitchT:-0.05, movedByMouse:false,
  ok:false, renderer:null, scene:null, camera:null, world:null,""",'E3 state fields')

# ---------------------------------------------------------------- boot
sub("""  $('btn3D').onclick=()=>setMode3D(true);
  $('btn2D').onclick=()=>setMode3D(false);
  $('btnCam').onclick=()=>{if(G.mode3d)toggleView();else setMode3D(true);};
  $('btnQ').onclick=cycleQuality;
  $('btnMode').onclick=()=>setMode3D(!G.mode3d);
  $('btnCam2').onclick=()=>{if(!G.mode3d){setMode3D(true);}toggleView();syncModeUI();};
  $('mode3d').classList.remove('hide');
  syncModeUI();""",
"""  $('btnQ').onclick=cycleQuality;
  $('btnCam2').onclick=()=>{toggleView();};
  if(!E3.ok)init3D();
  if(!E3.ok){
    $('noGL').classList.remove('hide');
    const b=$('btnNew'),c=$('btnCont'),m=$('btnMode');
    if(b)b.disabled=true;if(c)c.disabled=true;if(m)m.disabled=true;
  }
  syncModeUI();""",'boot wiring')

sub("""  /* 3D is the default engine; 2.5D stays as a fallback / low-end option */
  if(init3D()){G.mode3d=true;applyQuality();showCanvas3D(true);}
  else{G.mode3d=false;toast('3D غير متاح على هذا الجهاز','سيتم التشغيل بمحرّك 2.5D');}
  syncModeUI();""",
"""  applyQuality();
  syncModeUI();""",'boot init')

sub("""G.mode3d=false;
""","",'G.mode3d removed')

# ---------------------------------------------------------------- HTML / CSS
sub("""  #mode3d{position:absolute;top:16px;left:18px;z-index:22;display:flex;gap:6px;pointer-events:auto}""",
"""  #engbar{position:absolute;top:14px;left:16px;z-index:22;display:flex;gap:6px;pointer-events:auto}
  #engbar button{background:rgba(12,16,20,.6);border:1px solid #2b363e;color:#9fb0b8;font-size:11px;
    padding:5px 9px;cursor:pointer;border-radius:3px;font-family:inherit}
  #engbar button:hover{color:#fff;border-color:#6d858f}
  #engbar button.on{color:#e8eef2;border-color:#7d949e;background:rgba(28,38,44,.8)}
  #noGL{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
    background:rgba(4,6,9,.96);text-align:center;padding:24px}
  #cross.lk{opacity:1}
  #hint.dim{opacity:.32}""",'CSS')

m=re.search(r'  #mode3d button\{.*?\n  #mode3d button\.on\{[^\n]*\n', s, re.S)
if m:
    s=s[:m.start()]+s[m.end():]; log.append('ok   old #mode3d button CSS removed')
else: log.append('MISS old #mode3d button CSS')

sub("""<div id="mode3d" class="hide">
  <button id="btn3D" class="on">3D</button>
  <button id="btn2D">2.5D</button>
  <button id="btnCam">كاميرا: فوق الكتف</button>
  <button id="btnQ">الجودة: عالية</button>
</div>""",
"""<div id="engbar">
  <button id="btnQ">الجودة: عالية</button>
</div>""",'engine bar HTML')

sub("""      <button class="btn" id="btnMode">المحرّك: 3D</button>
      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>""",
"""      <button class="btn" id="btnCam2">الكاميرا: فوق الكتف</button>""",'menu engine button removed')

sub("""<div id="cross"></div>""",
"""<div id="cross"></div>
<div id="noGL" class="hide">
  <div class="panel" style="max-width:560px;text-align:center">
    <h1 style="font-size:22px">WebGL غير متاح</h1>
    <p class="dim" style="margin-top:12px">هذه اللعبة تعمل بمحرّك ثلاثي الأبعاد (WebGL) فقط.<br>
      فعّل تسريع العتاد من إعدادات المتصفح، أو جرّب متصفحًا حديثًا
      (Chrome / Edge / Firefox / Safari).</p>
  </div>
</div>""",'noGL overlay')

sub("""          <li>الفأرة — اتجاه النظر (الكاميرا فوق الكتف)</li>""",
"""          <li><b>الفأرة — النظر</b> (اضغط داخل الشاشة لقفل المؤشر، <kbd>Esc</kbd> لتحريره)</li>""",'help mouse line')
sub("""          <li><kbd>V</kbd> — تبديل الكاميرا (فوق الكتف""",
"""          <li><kbd>V</kbd> — تبديل الكاميرا (فوق الكتف""",'help V line')

sub("""  $('hint').innerHTML='<kbd>WASD</kbd> حركة &nbsp; <kbd>E</kbd> تفاعل &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>B</kbd> 3D/2.5D &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';""",
"""  $('hint').innerHTML='<kbd>WASD</kbd> حركة باتجاه نظرك &nbsp; <b>الماوس</b> للنظر &nbsp; <kbd>E</kbd> تفاعل &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';""",'hint line')

# startGame: pointer-lock hint
sub("""  setTimeout(()=>{
    toast('26 أبريل… لا. 2026.','Exclusion Zone');""",
"""  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  setTimeout(()=>{
    toast('26 أبريل… لا. 2026.','Exclusion Zone');""",'startGame reset look')
sub("""    toast('اضغط Tab للدفتر','H للاختباء • F للكشاف');""",
"""    toast('اضغط داخل الشاشة لقفل الفأرة','الماوس = النظر • WASD = الحركة باتجاه نظرك • Tab = الدفتر');""",'startGame control hint')

# ---------------------------------------------------------------- delete the 2D renderer
def del_fn(name):
    global s
    key='\nfunction '+name+'('
    i=s.find(key)
    if i<0:
        log.append('MISS del '+name); return
    k=s.index('{',i); d=0; j=k
    while j<len(s):
        c=s[j]
        if c=='{': d+=1
        elif c=='}':
            d-=1
            if d==0: break
        j+=1
    e=j+1
    while e<len(s) and s[e] in ' \t': e+=1
    if e<len(s) and s[e]=='\n': e+=1
    s=s[:i+1]+s[e:]
    log.append('ok   deleted function '+name)

for n in ['render','drawSprite','drawEnt','drawPlayer','renderLight','tileCache','camUpdate']:
    del_fn(n)

sub("""const s2wx=x=>(x-VW/2-cam.shakeX)/cam.zoom+cam.x;
const s2wy=y=>(y-VH/2-cam.shakeY)/cam.zoom+cam.y;
""","",'s2wx/s2wy removed')
sub("""const lc=document.createElement('canvas'),lctx=lc.getContext('2d');
""","",'light canvas removed')

open(P,'w',encoding='utf-8').write(s)
js=re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open('/tmp/game.js','w',encoding='utf-8').write(js)
for l in log: print(l)
print('bytes %d -> %d'%(start,len(s)))
