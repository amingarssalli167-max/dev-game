# -*- coding: utf-8 -*-
"""Phase 2 — dedicated Third-Person Camera System.
Removes the first-person view (user wants behind-the-back only), adds an
adjustable camera distance (mouse wheel), removes movement head-bob so the
camera never shakes while walking, improves wall collision, and keeps smooth
frame-rate-independent interpolation. The player movement system is untouched."""
import re

P='/home/user/chernobyl/index.html'
s=open(P,encoding='utf-8').read()
start=len(s)
log=[]

def sub(x,y,tag):
    global s
    if x not in s:
        log.append('MISS '+tag); return False
    if s.count(x)>1:
        log.append('AMBIG(%d) %s'%(s.count(x),tag)); return False
    s=s.replace(x,y,1); log.append('ok   '+tag); return True

# ---- 1) CFG: camera tuning constants ------------------------------------
sub("""  gravity:24,                      // units/s^2 (1 unit ~= 1 metre)
  camFollow:0.000015,              // third-person camera damping factor
};""",
"""  gravity:24,                      // units/s^2 (1 unit ~= 1 metre)
  camFollow:0.000012,              // third-person camera damping (smaller = smoother)
  camDistDefault:2.7,              // distance behind the player
  camDistMin:1.3, camDistMax:5.5,  // adjustable zoom range (mouse wheel)
  camPitchMin:-0.55, camPitchMax:0.80,   // vertical camera limits (radians)
  camShoulder:0.62,                // over-the-shoulder side offset
};""",'CFG camera constants')

# ---- 2) E3: camera distance state ---------------------------------------
sub("""  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots', camSnap:true,""",
"""  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots', camSnap:true,
  camDist:2.7,""",'E3 camDist')

# ---- 3) the camera itself: mouse-look + head-bob + fps/ots branch --------
old_cam = """  /* ---- mouse look: raw deltas, no lag, no drift ---- */
  const fps=(E3.view==='fps');
  if(IN.lookX||IN.lookY){
    const k=(fps?0.0021:0.0025)*IN.sens;
    IN.aim=((IN.aim-IN.lookX*k)%TAU+TAU)%TAU;
    E3.pitchT=clamp(E3.pitchT+IN.lookY*(fps?0.0024:0.0019)*IN.sens,
      fps?-0.85:-0.50, fps?0.85:0.72);
    IN.lookX=0;IN.lookY=0;
  }
  E3.pitch=lerp(E3.pitch,E3.pitchT,1-Math.pow(0.00002,dt));
  P.face=IN.aim;
  /* ---- head bob ---- */
  const spd=P.moving?(P.sprint?2.0:(P.crouch?0.7:1.15)):0;
  E3.bob+=dt*9.2*spd;
  const bobY=Math.sin(E3.bob*2)*0.035*spd, bobX=Math.cos(E3.bob)*0.028*spd;
  const eye=P.py+(P.crouch?1.06:1.64)+(P.hidden?-0.55:0);
  const px=P.x, pz=P.y, py=P.py;
  const cam=E3.camera;
  if(E3.view==='fps'||P.hidden){
    cam.position.set(px+bobX*0.4, eye+bobY, pz);
    cam.rotation.order='YXZ';
    cam.rotation.y=-IN.aim-Math.PI/2;
    cam.rotation.x=-E3.pitch;
    cam.rotation.z=P.injured>0?Math.sin(G.time*2.2)*0.03:0;
    cam.fov=74;
  }else{
    const back=2.45,side=0.68,up=2.06;
    const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
    /* desired camera position: behind + above the player */
    let dx=px-ca*back-sa*side;
    let dz=pz-sa*back+ca*side;
    let dy=py+up+bobY*0.5;
    /* camera collision: pull the desired position in along the ray */
    let cx=dx,cy=dy,cz=dz;
    for(let i=1;i<=10;i++){
      const t=i/10;
      const sx=lerp(px,dx,t),sz=lerp(pz,dz,t),sy=lerp(eye+0.15,dy,t);
      if(solidAt3(sx,sz,sy)){
        const k=Math.max(0.2,t-0.1);
        cx=lerp(px,dx,k);cy=lerp(eye+0.15,dy,k);cz=lerp(pz,dz,k);break;}
    }
    /* smooth follow: damp toward the collision-adjusted target */
    if(E3.camSnap){cam.position.set(cx,cy,cz);E3.camSnap=false;}
    else{
      const fk=1-Math.pow(CFG.camFollow,dt);
      cam.position.x=lerp(cam.position.x,cx,fk);
      cam.position.y=lerp(cam.position.y,cy,fk);
      cam.position.z=lerp(cam.position.z,cz,fk);
      /* never let smoothing push the camera through a wall */
      if(solidAt3(cam.position.x,cam.position.z,cam.position.y))cam.position.set(cx,cy,cz);
    }
    const lookY=eye-0.10-E3.pitch*2.2;
    cam.lookAt(px+ca*3.4,lookY,pz+sa*3.4);
    cam.rotation.z+=P.injured>0?Math.sin(G.time*2.2)*0.035:bobX*0.10;
    cam.fov=68;
  }"""
new_cam = """  /* ---- mouse look: raw deltas orbit the camera around the player ---- */
  if(IN.lookX||IN.lookY){
    const k=0.0025*IN.sens;
    IN.aim=((IN.aim-IN.lookX*k)%TAU+TAU)%TAU;
    E3.pitchT=clamp(E3.pitchT+IN.lookY*0.0019*IN.sens,CFG.camPitchMin,CFG.camPitchMax);
    IN.lookX=0;IN.lookY=0;
  }
  /* smooth vertical interpolation toward the clamped pitch target */
  E3.pitch=lerp(E3.pitch,E3.pitchT,1-Math.pow(0.00002,dt));
  P.face=IN.aim;
  /* ---- third-person camera: behind the player's back (no first-person) ---- */
  const eye=P.py+(P.crouch?1.06:1.64);          // player eye height above feet
  const px=P.x, pz=P.y, py=P.py;
  const cam=E3.camera;
  const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
  const dist=P.hidden?0.45:E3.camDist;          // pull in tight while hiding
  const side=CFG.camShoulder;
  const up=1.95+(dist-CFG.camDistDefault)*0.16; // height eases with distance
  /* desired orbit position: behind + over the right shoulder + above */
  const dx=px-ca*dist-sa*side;
  const dz=pz-sa*dist+ca*side;
  const dy=py+up;
  /* camera collision: march from the player's head toward the desired spot and
     stop just before the first solid sample -> the camera never enters a wall */
  const hx=px, hy=py+eye*0.92, hz=pz;
  let cx=dx,cy=dy,cz=dz;
  const steps=14;
  for(let i=1;i<=steps;i++){
    const t=i/steps;
    if(solidAt3(lerp(hx,dx,t),lerp(hz,dz,t),lerp(hy,dy,t))){
      const k=Math.max(0.10,(i-1)/steps);
      cx=lerp(hx,dx,k);cy=lerp(hy,dy,k);cz=lerp(hz,dz,k);
      break;
    }
  }
  /* smooth interpolation: damp the position toward the collision-adjusted target
     (frame-rate independent). No head-bob -> the camera is stable while moving. */
  if(E3.camSnap){cam.position.set(cx,cy,cz);E3.camSnap=false;}
  else{
    const fk=1-Math.pow(CFG.camFollow,dt);
    cam.position.x=lerp(cam.position.x,cx,fk);
    cam.position.y=lerp(cam.position.y,cy,fk);
    cam.position.z=lerp(cam.position.z,cz,fk);
    if(solidAt3(cam.position.x,cam.position.z,cam.position.y))cam.position.set(cx,cy,cz);
  }
  /* orientation: look at a point ahead of the player (over-the-shoulder framing) */
  const lookY=py+eye*0.92-E3.pitch*2.4;
  cam.lookAt(px+ca*3.2,lookY,pz+sa*3.2);
  cam.rotation.z=0;                              // no roll, no movement shake
  cam.fov=68;"""
sub(old_cam,new_cam,'third-person camera block')

# ---- 4) flashlight: drop fps references ---------------------------------
sub("""    const ox=(E3.view==='fps')?cam.position.x:px+dirX*0.35;
    const oz=(E3.view==='fps')?cam.position.z:pz+dirZ*0.35;
    const oy=(E3.view==='fps')?cam.position.y-0.08:eye-0.18;
    fl.position.set(ox,oy,oz);
    const pit=(E3.view==='fps')?-E3.pitch:0.06;
    E3.flashTarget.position.set(ox+dirX*6,oy+pit*6,oz+dirZ*6);""",
"""    const ox=px+dirX*0.35, oz=pz+dirZ*0.35, oy=eye-0.18;
    fl.position.set(ox,oy,oz);
    const pit=0.06-E3.pitch;                     // flashlight tilts with the camera
    E3.flashTarget.position.set(ox+dirX*6,oy+pit*6,oz+dirZ*6);""",'flashlight third-person')

# ---- 5) sprite cull distance --------------------------------------------
sub("""  const cullD=E3.view==='fps'?46:54;""",
"""  const cullD=54;""",'cull distance')

# ---- 6) rig visibility: always third-person -----------------------------
sub("""  pr.visible=(E3.view!=='fps')&&!P.hidden&&!P.dead;
  if(pr.visible&&E3.view==='ots'){
    const cd=cam.position.distanceTo?cam.position.distanceTo(pr.position):0;
    pr.visible=cd>1.15;
  }""",
"""  pr.visible=!P.hidden&&!P.dead;
  if(pr.visible){
    /* hide the body only if the camera is pulled uncomfortably close */
    const cd=cam.position.distanceTo?cam.position.distanceTo(pr.position):99;
    if(cd<0.9)pr.visible=false;
  }""",'rig visibility')

# ---- 7) syncModeUI: no first-person label -------------------------------
sub("""function syncModeUI(){
  $('btnQ').textContent='الجودة: '+['منخفضة','متوسطة','عالية'][E3.quality];
  $('btnCam2').textContent='الكاميرا: '+(E3.view==='ots'?'فوق الكتف':'منظور أول');
  $('cross').classList.toggle('on',E3.view==='fps');
}""",
"""function syncModeUI(){
  $('btnQ').textContent='الجودة: '+['منخفضة','متوسطة','عالية'][E3.quality];
  const b=$('btnCam2');
  if(b)b.textContent='كاميرا: خلف الظهر • المسافة '+E3.camDist.toFixed(1);
}""",'syncModeUI')

# ---- 8) toggleView -> resetCam ------------------------------------------
sub("""function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  E3.pitchT=E3.view==='fps'?0:clamp(E3.pitchT,-0.50,0.72);
  E3.camSnap=true;
  syncModeUI();
  toast(E3.view==='ots'?'كاميرا فوق الكتف القريبة':'منظور الشخص الأول',
    E3.view==='ots'?'كما في وثيقة التصميم — لا ترى كل شيء':'الماوس = النظر، WASD = الحركة باتجاه نظرك');
}""",
"""function resetCam(){
  E3.camDist=CFG.camDistDefault;
  E3.pitchT=clamp(E3.pitchT,CFG.camPitchMin,CFG.camPitchMax);
  E3.camSnap=true;
  syncModeUI();
  toast('أُعيد ضبط الكاميرا','خلف الظهر • المسافة '+E3.camDist.toFixed(1)+' • عجلة الفأرة للتقريب/التبعيد');
}""",'toggleView -> resetCam')

# ---- 9) key binding: V resets the camera (no view toggle) ---------------
sub("""      case 'KeyV':toggleView();break;""",
"""      case 'KeyV':resetCam();break;""",'V key -> resetCam')

# ---- 10) menu button + wheel zoom ---------------------------------------
sub("""  $('btnCam2').onclick=()=>{toggleView();};""",
"""  $('btnCam2').onclick=()=>{resetCam();};
  const glz=$('gl');
  if(glz)glz.addEventListener('wheel',e=>{
    if(!G.started||G.over||G.paused)return;
    e.preventDefault();
    const d=clamp(E3.camDist+(e.deltaY>0?0.3:-0.3),CFG.camDistMin,CFG.camDistMax);
    if(d!==E3.camDist){E3.camDist=d;}
  },{passive:false});""",'btnCam2 + wheel zoom')

# ---- 11) pointer-lock crosshair dot: not needed in third person ---------
sub("""  const lockOn=()=>{IN.locked=true;$('cross').classList.add('lk');};
  const lockOff=()=>{IN.locked=false;$('cross').classList.remove('lk');};""",
"""  const lockOn=()=>{IN.locked=true;};
  const lockOff=()=>{IN.locked=false;};""",'lock handlers (no crosshair)')

# ---- 12) help text -------------------------------------------------------
sub("""          <li><kbd>V</kbd> — تبديل الكاميرا (فوق الكتف / منظور أول)</li>""",
"""          <li><b>عجلة الفأرة</b> — تقريب/تبعيد الكاميرا (المسافة قابلة للتعديل)</li>
          <li><kbd>V</kbd> — إعادة ضبط الكاميرا خلف الظهر</li>""",'help text')

# ---- 13) startGame: reset camera distance on a fresh run ----------------
sub("""  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;""",
"""  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';""",'startGame camera reset')

open(P,'w',encoding='utf-8').write(s)
js=re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open('/tmp/game.js','w',encoding='utf-8').write(js)
for l in log: print(l)
print('bytes %d -> %d'%(start,len(s)))
print('MISSES:',sum(1 for l in log if l.startswith('MISS') or l.startswith('AMBIG')))
