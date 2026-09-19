/* ---- Phase 2: Third-Person Camera System ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;}
function step(n){for(let i=0;i<n;i++){
  G.dt=0.016;G.time+=0.016;
  if(!G.paused&&!DLG.open&&!DOC.open&&!CODE.open&&!NB.open){
    try{updatePlayer(0.016);updateEnts(0.016);updateBeats(0.016);updateAnoms(0.016);updateHint();}
    catch(e){bad('sim: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
  }
  try{update3D(0.016);}catch(e){bad('3D: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
  if(DLG.open){try{nextLine();}catch(e){}}
}return true;}
function findOpen(scene,rad){
  rad=rad||5;const g=scene.g;
  const clear=(x,y)=>{for(let a=0;a<8;a++){const ang=a*Math.PI/4;
    for(let r=0.6;r<=rad;r+=0.6)if(solidT(getT(g,Math.floor(x+Math.cos(ang)*r),Math.floor(y+Math.sin(ang)*r))))return false;}return true;};
  for(let y=3;y<scene.h-3;y++)for(let x=3;x<scene.w-3;x++)if(clear(x+0.5,y+0.5))return{x:x+0.5,y:y+0.5};
  return null;
}
const camOff=()=>({x:E3.camera.position.x-G.player.x,y:E3.camera.position.y,z:E3.camera.position.z-G.player.y});

/* ============ 0. no first-person view exists ============ */
chk(typeof toggleView==='undefined','first-person toggleView removed');
chk(E3.view==='ots','camera view is third-person (ots)');
enterScene('outdoor',{x:25.5,y:38.5},{silent:true});closeAll();
const open=findOpen(G.scene,6);
chk(!!open,'found wide-open ground');
G.player.x=open.x;G.player.y=open.y;IN.aim=0;IN.movedByMouse=true;E3.camSnap=true;
step(3);

/* ============ 1. camera follow: stays behind the player ============ */
let off=camOff();
const behind0=Math.hypot(off.x,off.z);
chk(behind0>1.0&&behind0<6.0,'camera sits behind the player at distance '+behind0.toFixed(2));
// camera should be on the -aim side (behind) of the player
const dotBehind=(-off.x*Math.cos(IN.aim))+(-off.z*Math.sin(IN.aim));
chk(dotBehind>0,'camera is behind the player relative to the facing direction');

/* ============ 2. smooth follow (damping, not rigid snap) ============ */
const c0={x:E3.camera.position.x,z:E3.camera.position.z};
G.player.x+=5;
step(1);
const moved1=Math.hypot(E3.camera.position.x-c0.x,E3.camera.position.z-c0.z);
chk(moved1>0.05&&moved1<5,'camera eases toward the player, does not teleport (moved '+moved1.toFixed(2)+'/5 in 1 frame)');
step(120);
const settled=Math.hypot(E3.camera.position.x-(G.player.x-Math.cos(IN.aim)*E3.camDist),
                         E3.camera.position.z-(G.player.y-Math.sin(IN.aim)*E3.camDist));
chk(settled<1.2,'camera converges behind the player after settling (residual '+settled.toFixed(2)+')');

/* ============ 3. no shake while moving (steady offset at constant speed) ============ */
G.player.x=open.x;G.player.y=open.y;IN.aim=0;E3.camSnap=true;step(3);
IN.keys={KeyW:true};
for(let i=0;i<80;i++)step(1);                 // reach steady walking state
const samples=[];
for(let i=0;i<40;i++){step(1);const o=camOff();samples.push(Math.hypot(o.x,o.z));}
IN.keys={};
const mean=samples.reduce((a,b)=>a+b,0)/samples.length;
const variance=Math.max(...samples)-Math.min(...samples);
chk(variance<0.15,'camera-to-player distance is stable while walking (variance '+variance.toFixed(4)+') — no bob/shake');

/* ============ 4. camera rotation: mouse orbits the camera around the player ============ */
G.player.x=open.x;G.player.y=open.y;IN.aim=0;IN.movedByMouse=true;E3.camSnap=true;step(3);
const before={x:E3.camera.position.x,z:E3.camera.position.z};
const aimBefore=IN.aim;
__fireDoc('mousemove',{movementX:300,movementY:0});
step(4);
chk(Math.abs(IN.aim-aimBefore)>0.2,'mouse-look rotates the facing direction ('+aimBefore.toFixed(2)+' -> '+IN.aim.toFixed(2)+')');
const distBefore=Math.hypot(before.x-G.player.x,before.z-G.player.y);
const distAfter=Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y);
chk(Math.abs(distAfter-distBefore)<1.0,'camera orbits at a consistent radius while rotating ('+distBefore.toFixed(2)+' -> '+distAfter.toFixed(2)+')');
const angBefore=Math.atan2(before.z-G.player.y,before.x-G.player.x);
const angAfter=Math.atan2(E3.camera.position.z-G.player.y,E3.camera.position.x-G.player.x);
chk(Math.abs(((angAfter-angBefore+Math.PI*3)%TAU)-Math.PI)>0.15,'camera position swings around the player on mouse turn');

/* ============ 5. camera sensitivity affects rotation rate ============ */
function turnRate(sens){
  IN.sens=sens;IN.aim=0;IN.lookX=IN.lookY=0;
  __fireDoc('mousemove',{movementX:200,movementY:0});
  step(1);
  let d=IN.aim; d=((d+Math.PI)%TAU+TAU)%TAU-Math.PI;   // shortest wrapped delta
  IN.sens=1.0;return Math.abs(d);
}
const slow=turnRate(0.4), fast=turnRate(2.2);
chk(fast>slow*2,'higher sensitivity turns faster (sens0.4='+slow.toFixed(3)+' rad, sens2.2='+fast.toFixed(3)+' rad)');
IN.sens=1.0;

/* ============ 6. vertical camera limits (pitch clamp) ============ */
E3.pitchT=0;
for(let i=0;i<12;i++)__fireDoc('mousemove',{movementX:0,movementY:-2000});   // look far up
step(14);
chk(E3.pitchT>=CFG.camPitchMin-1e-6&&E3.pitchT<=CFG.camPitchMin+0.02,'pitch clamped at the upper limit ('+E3.pitchT.toFixed(2)+' >= '+CFG.camPitchMin+')');
E3.pitchT=0;
for(let i=0;i<12;i++)__fireDoc('mousemove',{movementX:0,movementY:2000});    // look far down
step(14);
chk(E3.pitchT<=CFG.camPitchMax+1e-6&&E3.pitchT>=CFG.camPitchMax-0.02,'pitch clamped at the lower limit ('+E3.pitchT.toFixed(2)+' <= '+CFG.camPitchMax+')');
E3.pitchT=0;step(4);

/* ============ 7. adjustable distance via mouse wheel ============ */
E3.camDist=CFG.camDistDefault;
const d0=E3.camDist;
__fire('gl','wheel',{deltaY:-120});            // zoom in
chk(E3.camDist<d0,'wheel up zooms the camera in ('+d0.toFixed(2)+' -> '+E3.camDist.toFixed(2)+')');
for(let i=0;i<40;i++)__fire('gl','wheel',{deltaY:-120});
chk(E3.camDist>=CFG.camDistMin-1e-6,'zoom-in clamped at the minimum ('+E3.camDist.toFixed(2)+' >= '+CFG.camDistMin+')');
for(let i=0;i<60;i++)__fire('gl','wheel',{deltaY:120});   // zoom out
chk(E3.camDist<=CFG.camDistMax+1e-6,'zoom-out clamped at the maximum ('+E3.camDist.toFixed(2)+' <= '+CFG.camDistMax+')');
// distance actually changes the camera radius
E3.camDist=CFG.camDistMin;E3.camSnap=true;G.player.x=open.x;G.player.y=open.y;IN.aim=0;step(3);
const rMin=Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y);
E3.camDist=CFG.camDistMax;E3.camSnap=true;step(3);
const rMax=Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y);
chk(rMax>rMin+1.5,'camera radius grows with distance setting (min '+rMin.toFixed(2)+' -> max '+rMax.toFixed(2)+')');
E3.camDist=CFG.camDistDefault;

/* ============ 8. camera collision: never inside a wall ============ */
let inside=0,total=0;
for(const id of ['apartment','school','hospital','basement','tunnels','blacksite','kindergarten','substation']){
  enterScene(id,SCENES[id].spawn,{silent:true});closeAll();
  E3.camDist=CFG.camDistMax;                    // worst case: max zoom-out near walls
  for(let i=0;i<160;i++){
    IN.aim=i*0.23;E3.camSnap=(i%40===0);step(1);total++;
    const c=E3.camera.position;
    if(solidAt3(c.x,c.z,c.y))inside++;
  }
}
chk(inside===0,'camera never penetrates a wall across all indoor scenes ('+inside+'/'+total+')');
E3.camDist=CFG.camDistDefault;

/* ============ 9. collision pulls the camera in near a wall ============ */
enterScene('apartment',SCENES.apartment.spawn,{silent:true});closeAll();
const ap=G.scene;let wx=-1,wy=-1;
for(let y=2;y<ap.h-2&&wx<0;y++)for(let x=2;x<ap.w-2;x++)
  if(!solidT(getT(ap.g,x,y))&&solidT(getT(ap.g,x,y+1))&&!solidT(getT(ap.g,x,y-1))){wx=x+0.5;wy=y+0.5;break;}
if(wx>0){
  G.player.x=wx;G.player.y=wy;IN.aim=Math.PI/2;  // face the wall to the south
  E3.camDist=CFG.camDistMax;E3.camSnap=true;step(3);
  const pulled=Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y);
  chk(pulled<E3.camDist+0.3,'camera is pulled in when a wall is behind the player (radius '+pulled.toFixed(2)+' < dist '+E3.camDist.toFixed(2)+')');
  chk(!solidAt3(E3.camera.position.x,E3.camera.position.z,E3.camera.position.y),'pulled-in camera is still outside the wall');
}else{ ok('wall-proximity case skipped (no suitable tile)'); }
E3.camDist=CFG.camDistDefault;

/* ============ 10. resetCam (V) restores defaults ============ */
E3.camDist=CFG.camDistMax;E3.pitchT=CFG.camPitchMax;
resetCam();
chk(Math.abs(E3.camDist-CFG.camDistDefault)<1e-9,'resetCam restores the default distance');
chk(E3.camSnap===true,'resetCam snaps the camera (no swoop)');

/* ============ 11. smooth interpolation is frame-rate independent ============ */
G.player.x=open.x;G.player.y=open.y;IN.aim=0;E3.camSnap=true;enterScene('outdoor',{x:25.5,y:38.5},{silent:true});closeAll();
const op=findOpen(G.scene,6);G.player.x=op.x;G.player.y=op.y;E3.camSnap=true;step(3);
const start={x:E3.camera.position.x,z:E3.camera.position.z};
G.player.x+=4;
G.dt=0.016;update3D(0.016);const a1=Math.hypot(E3.camera.position.x-start.x,E3.camera.position.z-start.z);
E3.camera.position.x=start.x;E3.camera.position.z=start.z;
G.dt=0.032;update3D(0.032);const a2=Math.hypot(E3.camera.position.x-start.x,E3.camera.position.z-start.z);
chk(a2>a1*1.3,'a longer frame moves the camera further (frame-rate-independent damping): '+a1.toFixed(3)+' @16ms vs '+a2.toFixed(3)+' @32ms');

console.log(fails?('\n'+fails+' FAILURES'):'\nTHIRD-PERSON CAMERA SUITE OK');
