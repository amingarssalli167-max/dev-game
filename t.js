/* ---- mouse-look / camera-relative movement / 3D-only regression ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
chk(E3.ok===true,'boot() starts the 3D engine');
chk(typeof setMode3D==='undefined','2.5D mode switch is gone');
chk(typeof render==='undefined','2D world renderer deleted');
chk(typeof renderLight==='undefined','2D light renderer deleted');
chk(typeof drawSprite==='undefined','2D sprite renderer deleted');
chk(typeof tileCache==='undefined','2D tile cache deleted');
chk(typeof camUpdate==='undefined','2D camera update deleted');

startGame(true);
closeOverlays();
function closeOverlays(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;}
function step(n){
  for(let i=0;i<n;i++){
    G.dt=0.016;G.time+=0.016;
    if(!G.paused&&!DLG.open&&!DOC.open&&!CODE.open&&!NB.open){
      try{updatePlayer(0.016);updateEnts(0.016);updateBeats(0.016);updateAnoms(0.016);updateHint();}
      catch(e){bad('sim: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
    }
    try{update3D(0.016);}catch(e){bad('3D: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
    if(DLG.open){try{nextLine();}catch(e){}}
  }
  return true;
}
chk(step(60),'60 frames after start');

/* ---------------- mouse look ---------------- */
const glEl=__els.gl;
chk((glEl._listeners.mousedown||[]).length>0,'mouse-look + click bound to the WebGL canvas');
chk((document._l.mousemove||[]).length>0,'document mousemove (look) bound');
chk((document._l.pointerlockchange||[]).length>0,'pointerlockchange bound');

const a0=IN.aim;
__fireDoc('mousemove',{movementX:120,movementY:0,clientX:700,clientY:360});
step(3);
chk(IN.aim<a0,'moving the mouse right turns the view right ('+a0.toFixed(3)+' -> '+IN.aim.toFixed(3)+')');
const a1=IN.aim;
__fireDoc('mousemove',{movementX:-240,movementY:0,clientX:600,clientY:360});
step(3);
chk(IN.aim>a1,'moving the mouse left turns the view left ('+a1.toFixed(3)+' -> '+IN.aim.toFixed(3)+')');

E3.pitchT=0;
__fireDoc('mousemove',{movementX:0,movementY:-400,clientX:600,clientY:200});
step(6);
chk(E3.pitchT<-0.3,'looking up raises the view ('+E3.pitchT.toFixed(2)+')');
__fireDoc('mousemove',{movementX:0,movementY:4000,clientX:600,clientY:600});
step(6);
chk(E3.pitchT>0.2,'looking down lowers the view ('+E3.pitchT.toFixed(2)+')');
__fireDoc('mousemove',{movementX:0,movementY:-40000,clientX:600,clientY:10});
step(6);
chk(E3.pitchT<=-0.45&&E3.pitchT>=-0.55,'vertical look is clamped ('+E3.pitchT.toFixed(2)+')');

/* full 360 wrap */
let prev=IN.aim,wrapped=false;
for(let i=0;i<400;i++){
  __fireDoc('mousemove',{movementX:40,movementY:0});
  step(1);
  if(Math.abs(IN.aim-prev)>3)wrapped=true;
  if(IN.aim<0||IN.aim>=Math.PI*2){bad('aim left [0,2pi): '+IN.aim);break;}
  prev=IN.aim;
}
chk(wrapped,'yaw wraps cleanly through 360° with no sign flip');

/* pointer lock */
__fire('gl','mousedown',{button:0});
chk(document.pointerLockElement===glEl,'clicking the screen locks the pointer');
__fireDoc('pointerlockchange',{});
chk(IN.locked===true,'IN.locked set after pointerlockchange');

/* ---------------- movement follows the view ---------------- */
function moveProbe(aimRad,keys,frames){
  IN.aim=aimRad;IN.lookX=IN.lookY=0;IN.movedByMouse=true;
  const P=G.player,g=G.scene.g;
  /* find ground with room to walk in every direction */
  const clear=(x,y)=>{
    for(let a=0;a<8;a++){
      const ang=a*Math.PI/4;
      for(let r=0.6;r<=3.0;r+=0.6)
        if(solidT(getT(g,Math.floor(x+Math.cos(ang)*r),Math.floor(y+Math.sin(ang)*r))))return false;
    }
    return true;
  };
  let fx=-1,fy=-1;
  for(let y=2;y<G.scene.h-2&&fx<0;y++)
    for(let x=2;x<G.scene.w-2;x++)
      if(clear(x+0.5,y+0.5)){fx=x+0.5;fy=y+0.5;break;}
  if(fx<0)throw new Error('no open ground');
  P.x=fx;P.y=fy;P.hidden=false;P.sta=100;P.injured=0;
  IN.aim=aimRad;
  const sx=P.x,sy=P.y;
  IN.keys={};keys.forEach(k=>IN.keys[k]=true);
  for(let i=0;i<frames;i++)updatePlayer(0.05);
  IN.keys={};
  return {dx:P.x-sx,dy:P.y-sy};
}
enterScene('outdoor',{x:25.5,y:38.5},{silent:true});closeOverlays();step(10);
const east=moveProbe(0,['KeyW'],30);
chk(east.dx>0.4&&Math.abs(east.dy)<0.25,'W while facing east walks east (dx='+east.dx.toFixed(2)+', dy='+east.dy.toFixed(2)+')');
const north=moveProbe(-Math.PI/2,['KeyW'],30);
chk(north.dy<-0.4&&Math.abs(north.dx)<0.25,'W while facing north walks north (dx='+north.dx.toFixed(2)+', dy='+north.dy.toFixed(2)+')');
const west=moveProbe(Math.PI,['KeyW'],30);
chk(west.dx<-0.4&&Math.abs(west.dy)<0.25,'W while facing west walks west');
const south=moveProbe(Math.PI/2,['KeyW'],30);
chk(south.dy>0.4&&Math.abs(south.dx)<0.25,'W while facing south walks south');
const strafe=moveProbe(0,['KeyD'],30);
chk(strafe.dy>0.4&&Math.abs(strafe.dx)<0.25,'D while facing east strafes south (screen-right) (dx='+strafe.dx.toFixed(2)+', dy='+strafe.dy.toFixed(2)+')');
const strafe2=moveProbe(0,['KeyA'],30);
chk(strafe2.dy<-0.4&&Math.abs(strafe2.dx)<0.25,'A while facing east strafes north (screen-left)');
const diag=moveProbe(0,['KeyW','KeyD'],30);
chk(diag.dx>0.2&&diag.dy>0.2,'W+D moves diagonally');
const dmag=Math.hypot(diag.dx,diag.dy),wmag=Math.hypot(east.dx,east.dy);
chk(Math.abs(dmag-wmag)<wmag*0.12,'diagonal is not faster than straight ('+dmag.toFixed(2)+' vs '+wmag.toFixed(2)+')');

/* movement must NOT drag the view any more */
IN.aim=1.0;IN.movedByMouse=true;IN.lookX=IN.lookY=0;
IN.keys={KeyW:true,KeyD:true};
for(let i=0;i<60;i++){updatePlayer(0.016);update3D(0.016);}
IN.keys={};
chk(Math.abs(IN.aim-1.0)<1e-9,'holding W+D never rotates the view (no more drift/veering)');

/* ---------------- view toggle ---------------- */
resetCam();chk(E3.view==='ots','camera stays third-person (first-person removed)');
step(20);
chk(E3.playerRig.visible===true,'Alexei visible over the shoulder');
chk(Math.abs(E3.camDist-CFG.camDistDefault)<1e-9,'resetCam restores the default distance');

/* ---------------- camera collision ---------------- */
enterScene('apartment',SCENES.apartment.spawn,{silent:true});closeOverlays();step(20);
let insideWall=0;
for(let i=0;i<200;i++){
  IN.aim=i*0.31;step(1);
  const c=E3.camera.position;
  if(solidAt3(c.x,c.z,c.y))insideWall++;
}
chk(insideWall===0,'over-the-shoulder camera never ends up inside a wall ('+insideWall+'/200)');

/* ---------------- every scene still runs ---------------- */
for(const id of Object.keys(SCENES)){
  enterScene(id,SCENES[id].spawn,{silent:true});closeOverlays();
  const good=step(45);
  let tris=0,meshes=0;
  E3.world.traverse(o=>{if(o.geometry&&o.geometry.index){meshes++;tris+=o.geometry.index.length/3;}});
  chk(good&&tris>0,id.padEnd(13)+' runs in 3D — tris='+tris+' nodes='+meshes+' sprites='+E3.sprites.length);
}

/* ---------------- quality + auto quality ---------------- */
cycleQuality();cycleQuality();cycleQuality();
chk(E3.quality===2,'quality cycles back to high');
E3.quality=2;
for(let i=0;i<200;i++){G.dt=0.05;G.time+=0.05;update3D(0.05);note3DFrame();}
chk(E3.quality<2,'slow frames auto-drop quality -> '+E3.quality);
for(let i=0;i<600;i++){G.dt=0.0165;G.time+=0.0165;update3D(0.0165);note3DFrame();}
chk(E3.quality<=2,'quality stays in range');

/* ---------------- loop paths ---------------- */
try{
  G.dt=0.016;
  loop(1000);loop(1016);loop(1032);
  ok('loop() runs unpaused');
  G.paused=true;loop(1048);loop(1064);G.paused=false;
  ok('loop() runs paused');
  DLG.open=true;loop(1080);DLG.open=false;
  ok('loop() runs during dialogue');
  NB.open=true;loop(1096);NB.open=false;
  ok('loop() runs with the notebook open');
}catch(e){bad('loop: '+e.stack.split('\n').slice(0,2).join(' | '));}

/* ---------------- post-FX over the WebGL frame ---------------- */
try{mirror3D();renderPost(0.016);ok('mirror3D + renderPost over the WebGL frame');}
catch(e){bad('post-fx: '+e.message);}

/* ---------------- death, hide, save/load ---------------- */
try{
  G.player.hp=1;die('test','TEST');step(5);respawn();step(20);ok('death + respawn');
  saveGame(false);chk(hasSave(),'save written');
  loadGame();E3.builtFor=null;step(20);ok('load + resume');
}catch(e){bad('death/save: '+e.stack.split('\n').slice(0,2).join(' | '));}

console.log(fails?('\n'+fails+' FAILURES'):'\nMOUSE-LOOK + 3D-ONLY SUITE OK');
