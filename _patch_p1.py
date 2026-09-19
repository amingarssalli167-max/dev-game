# -*- coding: utf-8 -*-
"""Phase 1 — Player Controller foundation.
Adds: vertical physics (gravity + ground detection), smooth third-person
camera follow, body rotation toward movement direction, and an animation
state machine. Nothing is deleted; existing systems stay intact."""
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

# ---- 1) CFG: gravity constant -------------------------------------------
sub("""  hearWalk:4.2, hearSprint:11.5, hearCrouch:1.6,
};""",
"""  hearWalk:4.2, hearSprint:11.5, hearCrouch:1.6,
  gravity:24,                      // units/s^2 (1 unit ~= 1 metre)
  camFollow:0.000015,              // third-person camera damping factor
};""",'CFG gravity + camFollow')

# ---- 2) newPlayer: vertical physics + facing + animation state ----------
sub("""function newPlayer(){
  return {x:22.5,y:23.5,face:0,sta:CFG.staMax,bat:CFG.batMax,flash:true,
    crouch:false,moving:false,rad:0,hp:3,hidden:false,hideId:null,
    sprint:false,injured:0,stepT:0,dmgFlash:0};
}""",
"""function newPlayer(){
  return {x:22.5,y:23.5,face:0,sta:CFG.staMax,bat:CFG.batMax,flash:true,
    crouch:false,moving:false,rad:0,hp:3,hidden:false,hideId:null,
    sprint:false,injured:0,stepT:0,dmgFlash:0,
    /* --- Player Controller foundation --- */
    py:0, vy:0, grounded:true,     // vertical position / velocity / on-ground
    modelYaw:0,                    // body facing (separate from camera aim)
    anim:'idle', moveSpeed:0};     // animation state machine
}""",'newPlayer fields')

# ---- 3) updatePlayer: gravity + ground detection ------------------------
sub("""  if(P.sprint)P.sta=Math.max(0,P.sta-CFG.staDrain*dt);
  else P.sta=Math.min(CFG.staMax,P.sta+CFG.staRegen*dt);
  /* aim — the mouse owns the view direction; movement never drags it around */""",
"""  /* ---- vertical physics: gravity + ground detection ---- */
  P.vy-=CFG.gravity*dt;
  P.py+=P.vy*dt;
  const gh=groundHeight(P.x,P.y);
  if(P.py<=gh){P.py=gh;P.vy=0;P.grounded=true;}
  else P.grounded=false;
  if(P.sprint)P.sta=Math.max(0,P.sta-CFG.staDrain*dt);
  else P.sta=Math.min(CFG.staMax,P.sta+CFG.staRegen*dt);
  /* aim — the mouse owns the view direction; movement never drags it around */""",'gravity + ground')

# ---- 4) updatePlayer: body faces movement + animation state -------------
sub("""  P.face=IN.aim;
  /* flashlight */""",
"""  P.face=IN.aim;
  /* ---- body yaw: face the movement direction while walking, camera-forward
        while idle (classic third-person character controller) ---- */
  if(P.moving&&mag>0.1){
    P.modelYaw=angLerp(P.modelYaw,Math.atan2(iy,ix),1-Math.pow(0.00004,dt));
  }else{
    P.modelYaw=angLerp(P.modelYaw,IN.aim,1-Math.pow(0.002,dt));
  }
  /* ---- animation state + blended move speed ---- */
  P.anim=!P.moving?'idle':(P.sprint?'sprint':(P.crouch?'crouch':'walk'));
  P.moveSpeed=lerp(P.moveSpeed||0,P.moving?sp:0,1-Math.pow(0.0008,dt));
  /* flashlight */""",'body yaw + anim state')

# ---- 5) update3D: eye height includes vertical position -----------------
sub("""  const eye=(P.crouch?1.06:1.64)+(P.hidden?-0.55:0);
  const px=P.x, pz=P.y;""",
"""  const eye=P.py+(P.crouch?1.06:1.64)+(P.hidden?-0.55:0);
  const px=P.x, pz=P.y, py=P.py;""",'eye includes py')

# ---- 6) update3D: smooth third-person camera follow ---------------------
sub("""  }else{
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
    const lookY=eye-0.10-E3.pitch*2.2;
    cam.lookAt(px+ca*3.4,lookY,pz+sa*3.4);
    cam.rotation.z+=P.injured>0?Math.sin(G.time*2.2)*0.035:bobX*0.10;
    cam.fov=68;
  }""",
"""  }else{
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
  }""",'smooth camera follow')

# ---- 7) update3D: rig position + animation state machine ----------------
sub("""  pr.position.set(P.x,0,P.y);
  pr.rotation.y=-IN.aim-Math.PI/2;
  const pw=P.moving?Math.sin(G.time*(P.sprint?14:9.5))*0.65:0;
  if(pu.legs){pu.legs[0].rotation.x=pw;pu.legs[1].rotation.x=-pw;}
  if(pu.arms){pu.arms[0].rotation.x=-pw*0.5;pu.arms[1].rotation.x=pw*0.5;}
  if(pu.torso)pu.torso.position.y=1.20+(P.crouch?-0.24:0)+Math.abs(pw)*0.03;
  if(pu.head)pu.head.position.y=1.75+(P.crouch?-0.24:0);
  pr.scale.y=P.crouch?0.86:1;""",
"""  pr.position.set(P.x,py,P.y);
  pr.rotation.y=-(P.modelYaw!=null?P.modelYaw:IN.aim)-Math.PI/2;
  /* ---- animation state machine: idle / walk / sprint / crouch ---- */
  const st=P.anim||'idle';
  let amp=0,freq=0,armAmp=0;
  if(st==='walk'){amp=0.55;freq=9.0;armAmp=0.50;}
  else if(st==='sprint'){amp=0.85;freq=13.5;armAmp=0.75;}
  else if(st==='crouch'){amp=0.40;freq=6.5;armAmp=0.35;}
  const breath=st==='idle'?Math.sin(G.time*1.6)*0.035:0;
  const pw=amp>0?Math.sin(G.time*freq)*amp:breath;
  if(pu.legs){pu.legs[0].rotation.x=pw;pu.legs[1].rotation.x=-pw;}
  if(pu.arms){pu.arms[0].rotation.x=-pw*armAmp;pu.arms[1].rotation.x=pw*armAmp;}
  const crouchDrop=P.crouch?-0.24:0;
  if(pu.torso)pu.torso.position.y=1.20+crouchDrop+Math.abs(pw)*0.03+breath*0.5;
  if(pu.head)pu.head.position.y=1.75+crouchDrop+breath*0.5;
  pr.scale.y=P.crouch?0.86:1;""",'rig + animation states')

# ---- 8) groundHeight helper (vertical-world hook) -----------------------
sub("""function solidAt3(x,y,h){""",
"""/* Player Controller foundation: ground level under (x,z).
   The shipped world is flat (every floor sits at y=0); this single hook is
   where future stairs / multi-storey / falling terrain will plug in. */
function groundHeight(x,z){
  const s=G.scene;
  if(!s)return 0;
  return 0;
}
function solidAt3(x,y,h){""",'groundHeight helper')

# ---- 9) E3 state: camSnap flag ------------------------------------------
sub("""  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots',""",
"""  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots', camSnap:true,""",'E3 camSnap field')

# ---- 10) snap camera on scene rebuild -----------------------------------
sub("""  E3.scene.fog.color.set(s.indoor?0x030406:0x05070c);
  E3.yaw=IN.aim;
}""",
"""  E3.scene.fog.color.set(s.indoor?0x030406:0x05070c);
  E3.yaw=IN.aim;
  E3.camSnap=true;
}""",'build3D camSnap')

# ---- 11) snap camera on view toggle -------------------------------------
sub("""function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  E3.pitchT=E3.view==='fps'?0:clamp(E3.pitchT,-0.50,0.72);
  syncModeUI();""",
"""function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  E3.pitchT=E3.view==='fps'?0:clamp(E3.pitchT,-0.50,0.72);
  E3.camSnap=true;
  syncModeUI();""",'toggleView camSnap')

open(P,'w',encoding='utf-8').write(s)
js=re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open('/tmp/game.js','w',encoding='utf-8').write(js)
for l in log: print(l)
print('bytes %d -> %d'%(start,len(s)))
print('MISSES:',sum(1 for l in log if l.startswith('MISS') or l.startswith('AMBIG')))
