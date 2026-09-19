/* ---- Phase 9: Player Animation System (layered Animation State Machine) ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);

let P;
function fakeP(o){return Object.assign({x:0,y:0,face:0,hp:3,moving:false,sprint:false,crouch:false,
  injured:0,moveSpeed:0,modelYaw:0,hidden:false,sta:100,dead:false},o||{});}
function reset(o){P=fakeP(o);G.over=false;G.time=100;ANIM.init(P);}
function up(dt,n){for(let i=0;i<(n||1);i++){G.time+=dt;ANIM.update(dt,P);}}

const STATES=['idle','walk','run','sprint','start','stop','turn','interact','pickup','inspect','damage','death'];

/* ============ 0. surface ============ */
chk(typeof ANIM==='object','ANIM system object present');
['def','play','playInteraction','selectBase','update','init','sampleBase','lerpPose','applyOver','envelope','zero','smooth','strideFreq']
  .forEach(f=>chk(typeof ANIM[f]==='function','ANIM.'+f+'() present'));
chk(Array.isArray(ANIM.CH)&&ANIM.CH.length>=12,'ANIM.CH pose-channel list present');

/* ============ 1. the 12 requested states ============ */
STATES.forEach(n=>chk(!!ANIM.states[n],'state "'+n+'" registered'));
STATES.forEach(n=>chk(typeof ANIM.states[n].pose==='function','state "'+n+'" has a pose()'));
chk(Object.keys(ANIM.states).length===12,'exactly the 12 requested animation states');
['idle','walk','run','sprint'].forEach(n=>chk(ANIM.states[n].loop===true&&ANIM.states[n].layer==='base',n+' = looping BASE state'));
['start','stop','turn','interact','pickup','inspect','damage'].forEach(n=>chk(!ANIM.states[n].loop&&ANIM.states[n].dur>0,n+' = timed one-shot'));
chk(ANIM.states.death.latch===true,'death latches (holds its final pose)');
chk(ANIM.states.damage.layer==='full'&&ANIM.states.death.layer==='full','damage/death are full-body layers');

/* ============ 2. base selection is driven by movement speed ============ */
chk(ANIM.selectBase({crouch:false},0)==='idle','selectBase: rest -> idle');
chk(ANIM.selectBase({crouch:false},1.25)==='walk','selectBase: crouch speed -> walk');
chk(ANIM.selectBase({crouch:false},2.35)==='walk','selectBase: CFG.walk -> walk');
chk(ANIM.selectBase({crouch:false},3.2)==='run','selectBase: mid speed -> run');
chk(ANIM.selectBase({crouch:false},4.15)==='sprint','selectBase: CFG.sprint -> sprint');

/* ============ 3. animations are linked to movement speed ============ */
chk(ANIM.strideFreq(4.15)>ANIM.strideFreq(2.35),'stride frequency rises with speed (limits foot-sliding)');
chk(ANIM.strideFreq(0)<ANIM.strideFreq(2.35),'stride frequency is lowest at rest');
function peakLeg(speed){reset({moveSpeed:speed,moving:speed>0.1,sprint:speed>3.6});up(1/60,45);
  let mx=0;for(let i=0;i<140;i++){up(1/60,1);mx=Math.max(mx,Math.abs(ANIM.pose.legL));}return mx;}
const peakWalk=peakLeg(2.35),peakSprint=peakLeg(4.15);
chk(peakWalk>0.2,'walking produces a visible leg swing');
chk(peakSprint>peakWalk*1.3,'leg-swing amplitude grows with speed (sprint > walk)');

/* ============ 4. the locomotion FSM follows a speed ramp ============ */
reset({moveSpeed:0,moving:false});up(1/60,30);
chk(ANIM.base==='idle','settles to idle at rest');
P.moveSpeed=2.35;P.moving=true;up(1/60,30);chk(ANIM.base==='walk','idle -> walk');
P.moveSpeed=3.2;up(1/60,30);chk(ANIM.base==='run','walk -> run');
P.moveSpeed=4.15;P.sprint=true;up(1/60,30);chk(ANIM.base==='sprint','run -> sprint');
P.moveSpeed=0;P.moving=false;up(1/60,30);chk(ANIM.base==='idle','sprint -> idle');

/* ============ 5. transitions are blended (cross-fade), never snapped ============ */
reset({moveSpeed:2.35,moving:true});up(1/60,45);   /* settle into walk */
P.moveSpeed=4.15;P.sprint=true;                    /* gait change at speed */
up(1/60,1);
chk(ANIM.basePrev==='walk'&&ANIM.base==='sprint','walk -> sprint records a cross-fade source');
chk(ANIM.baseT<ANIM.baseDur,'a cross-fade is active right after the gait change');
chk(ANIM.smooth(ANIM.baseT/ANIM.baseDur)<0.2,'cross-fade weight starts near 0 (eased in, not snapped)');
let maxLeanDelta=0,prevLean=ANIM.pose.torsoLean;
for(let i=0;i<30;i++){up(1/60,1);maxLeanDelta=Math.max(maxLeanDelta,Math.abs(ANIM.pose.torsoLean-prevLean));prevLean=ANIM.pose.torsoLean;}
chk(maxLeanDelta<0.06,'posture (torso lean) changes gradually every frame — no sudden jump');
chk(ANIM.baseT>=ANIM.baseDur,'the cross-fade completes over baseDur');
chk(ANIM.pose.torsoLean>0.18,'...landing on the full speed-linked sprint lean');

/* ============ 6. start / stop movement one-shots ============ */
reset({moveSpeed:0,moving:false});up(1/60,10);
P.moving=true;P.moveSpeed=2.35;up(1/60,1);
chk(ANIM.over&&ANIM.over.name==='start','idle -> moving fires the "start movement" one-shot');
up(1/60,8);
chk(ANIM.pose.torsoLean<0,'"start" leans the body forward into acceleration');
up(1/60,40);
chk(ANIM.over===null,'"start" finishes and returns to the base gait');
reset({moveSpeed:2.35,moving:true});up(1/60,45);
P.moving=false;P.moveSpeed=0;up(1/60,1);
chk(ANIM.over&&ANIM.over.name==='stop','moving -> idle fires the "stop movement" one-shot');

/* ============ 7. turn one-shot ============ */
reset({moveSpeed:2.35,moving:true,modelYaw:0});up(1/60,45);
P.modelYaw=0.6;up(1/60,1);   /* large yaw step in one frame */
chk(ANIM.over&&ANIM.over.name==='turn','a fast turn fires the "turn" one-shot');
chk(ANIM.over&&ANIM.over.dir===1,'turn captures its direction');

/* ============ 8. interact / pickup / inspect (upper-body, layered) ============ */
reset({moveSpeed:2.35,moving:true});up(1/60,45);
chk(ANIM.play('interact')===true,'ANIM.play("interact") is accepted');
let armMin=0,legPeak=0;
for(let i=0;i<25;i++){up(1/60,1);armMin=Math.min(armMin,ANIM.pose.armR);legPeak=Math.max(legPeak,Math.abs(ANIM.pose.legL));}
chk(ANIM.over&&ANIM.over.name==='interact','interact is still playing mid-animation');
chk(armMin<-0.3,'interact raises the reaching arm');
chk(legPeak>0.2,'legs keep walking under the upper-body overlay (layered blend)');
up(1/60,40);chk(ANIM.over===null,'interact ends and returns to the base gait');
reset({});chk(ANIM.playInteraction({type:'item'})&&ANIM.over.name==='pickup','playInteraction(item) -> pickup');
reset({});chk(ANIM.playInteraction({type:'examine'})&&ANIM.over.name==='inspect','playInteraction(examine) -> inspect');
reset({});chk(ANIM.playInteraction({type:'doc'})&&ANIM.over.name==='inspect','playInteraction(doc) -> inspect');
reset({});chk(ANIM.playInteraction({type:'device'})&&ANIM.over.name==='interact','playInteraction(device) -> interact');
/* inspect holds the pose (raise + hold + lower envelope) */
reset({});ANIM.play('inspect');up(1/60,40);
chk(ANIM.over&&ANIM.over.name==='inspect'&&ANIM.pose.armL<-0.8,'inspect raises both arms and holds');

/* ============ 9. damage reaction ============ */
reset({hp:3,moveSpeed:0,moving:false});up(1/60,5);
P.hp=2;up(1/60,1);
chk(ANIM.over&&ANIM.over.name==='damage','a non-fatal hp drop fires the "damage reaction"');
chk(ANIM.dead===false,'a non-fatal hit is not death');
up(1/60,10);
chk(ANIM.pose.torsoLean<0||ANIM.pose.headTilt<0,'damage recoils the body');
up(1/60,40);
chk(ANIM.over===null,'damage one-shot ends');

/* ============ 10. death state + latch + collapse ============ */
reset({hp:1,moveSpeed:0,moving:false});up(1/60,5);
P.hp=0;up(1/60,1);
chk(ANIM.dead===true,'hp reaching 0 sets the dead flag');
chk(ANIM.over&&ANIM.over.name==='death','a fatal hit fires the "death" state');
up(1/60,130);
chk(ANIM.over&&ANIM.over.name==='death','death latches (does not auto-clear)');
chk(ANIM.pose.rootY<-0.5,'the body collapses to the ground');
chk(Math.abs(ANIM.pose.rootRoll)>1.0,'the body rolls over as it falls');
chk(ANIM.base==='idle','base falls back to idle while the death overlay holds');

/* ============ 11. respawn recovery ============ */
P.hp=3;G.over=false;up(1/60,3);
chk(ANIM.dead===false,'respawn (hp restored) clears the dead flag');
chk(ANIM.over===null,'the death overlay is cleared on respawn');
chk(ANIM.pose.rootY>-0.1,'the body stands back up');

/* ============ 12. crouch is blended, not snapped ============ */
reset({moveSpeed:2.35,moving:true,crouch:false});up(1/60,45);
const standScale=ANIM.pose.scaleY;
P.crouch=true;up(1/60,1);
chk(ANIM.pose.scaleY>0.93,'crouch does not snap the body down in one frame');
up(1/60,60);
chk(ANIM.pose.scaleY<standScale-0.05,'crouch fully lowers the body after the blend');
chk(ANIM.pose.crouch>0.9,'the crouch channel reaches ~1');

/* ============ 13. pose is renderer-safe under stress ============ */
reset({moveSpeed:4.15,moving:true,sprint:true});up(1/60,5);
let present=true,finite=true;
for(const c of ANIM.CH){if(ANIM.pose[c]===undefined)present=false;if(typeof ANIM.pose[c]!=='number'||!isFinite(ANIM.pose[c]))finite=false;}
chk(present,'the pose exposes every channel (renderer-safe)');
chk(finite,'every pose channel is a finite number');
reset({});let threw=false;
try{P.moveSpeed=999;up(1/60,3);P.moveSpeed=-5;up(1/60,3);P.hp=-2;up(1/60,3);P.modelYaw=1e6;up(1/60,3);}catch(e){threw=true;}
chk(!threw,'ANIM.update survives extreme / invalid inputs without throwing');
let nan=false;for(const c of ANIM.CH)if(!isFinite(ANIM.pose[c]))nan=true;
chk(!nan,'no NaN in the pose after stress inputs');

/* ============ 14. integration with the real Player Controller ============ */
enterScene('slice_bld',SCENES.slice_bld.spawn,{silent:true});
G.over=false;G.player.moveSpeed=0;G.player.moving=false;G.player.hp=3;
ANIM.init(G.player);
for(let i=0;i<12;i++){G.time+=1/60;updatePlayer(1/60);ANIM.update(1/60,G.player);}
chk(ANIM.pose&&isFinite(ANIM.pose.legL),'ANIM integrates with the real player controller each frame');
chk(ANIM.base==='idle','the real player at rest resolves to idle');

console.log('\n'+(fails?('FAILURES: '+fails):'ANIMATION SYSTEM SUITE OK')+'  ('+(fails?'FAILED':'all passed')+')');
if(fails)process.exit(1);
