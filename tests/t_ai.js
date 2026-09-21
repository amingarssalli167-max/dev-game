/* ---- Phase 8: Enemy AI Framework (modular FSM) ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);

const AR=()=>SCENES.ai_arena;
function setP(x,y,o){const p=G.player;p.x=x;p.y=y;p.hidden=false;p.moving=false;p.sprint=false;
  p.crouch=false;p.flash=false;p.hp=3;p.injured=0;p.dmgFlash=0;if(o)Object.assign(p,o);return p;}
function mkAI(x,y,face,arch){
  enterScene('ai_arena',AR().spawn,{silent:true});
  setP(3.5,10.5);G.noiseEvent=null;G.over=false;G.time=100;G.threat=0;
  const en={type:'ai',arch:arch||'stalker',x:x,y:y,face:face||0,id:'t',hp:1,
    patrol:[[18,4],[18,16],[11,16],[11,4]]};
  AI.init(en);return en;
}
function run(en,dt,n){for(let i=0;i<(n||1);i++){G.time+=dt;AI.drive(en,dt,AR(),G.player);}}
function centerSolid(s,x,y){return solidT(getT(s.g,Math.floor(x),Math.floor(y)));}

/* ============ 0. framework surface ============ */
chk(typeof AI==='object','AI framework object present');
['state','archetype','init','enter','go','perceive','see','hear','moveTo','faceTo','scan','speed',
 'react','attack','drive','patrolPoints','searchPoints']
  .forEach(fn=>chk(typeof AI[fn]==='function','AI.'+fn+'() present'));
['idle','patrol','investigate','search','chase','attack','lose','return']
  .forEach(st=>chk(!!AI.states[st],'state "'+st+'" registered'));
['idle','patrol','investigate','search','chase','attack','lose','return']
  .forEach(st=>chk(typeof AI.states[st].think==='function'&&typeof AI.states[st].act==='function',
    'state "'+st+'" has think()+act()'));
chk(!!AI.archetypes.stalker,'prototype archetype "stalker" registered');
chk(AR().ents.filter(e=>e.type==='ai').length===1,'ai_arena ships exactly ONE prototype enemy (not dozens)');
chk(SCENES.ai_arena&&SCENES.ai_arena.g.w===26,'separate AI test arena scene exists (26x20)');

/* ============ 1. blackboard / init / enter / go ============ */
let en=mkAI(18,10,Math.PI);
chk(!!en.ai,'AI.init() builds the entity blackboard');
chk(en.ai.state==='patrol','initial state comes from the archetype (patrol)');
chk(en.ai.arch===AI.archetypes.stalker,'blackboard is linked to its archetype');
chk(en.ai.alert===0&&en.ai.lastKnown===null,'alert/last-known start empty');
AI.go(en,'idle');
chk(en.ai.state==='idle','AI.go() switches state');
chk(en.ai.prev==='patrol','previous state is tracked');
AI.enter(en,'chase');
chk(en.ai.state==='chase'&&en.ai.prev==='idle','AI.enter() switches state + records prev');
AI.go(en,'chase');
chk(en.ai.state==='chase','AI.go() to the current state is a no-op');

/* ============ 2. perception services (detection / audio / distance) ============ */
en=mkAI(10,10,0);
setP(13,10);
chk(AI.see(en,en.ai,AR(),G.player)>0,'see(): a player in front, in range, with LOS is seen');
setP(10,7);
chk(AI.see(en,en.ai,AR(),G.player)===0,'see(): a player outside the view cone is NOT seen');
setP(24,10);
chk(AI.see(en,en.ai,AR(),G.player)===0,'see(): a player beyond sight range is NOT seen (distance check)');
setP(12,10,{moving:true});
chk(AI.hear(en,en.ai,AR(),G.player)>0,'hear(): a moving player within earshot is heard');
setP(12,10,{moving:false});
chk(AI.hear(en,en.ai,AR(),G.player)===0,'hear(): a perfectly still player is silent');
chk(AI.speed(en.ai,'chase')>AI.speed(en.ai,'patrol'),'speeds are data-driven (chase > patrol)');
chk(AI.speed(en.ai,'patrol')===en.ai.arch.speed.patrol,'AI.speed() reads the archetype table');

/* react(): the perception -> intent mapping */
en=mkAI(10,10,0);
en.ai.alert=1.6;en.ai.canSee=true;en.ai.lastKnown={x:13,y:10,t:G.time};
chk(AI.react(en,en.ai)==='chase','react(): high alert + contact => chase');
en.ai.alert=0.5;en.ai.canSee=false;
chk(AI.react(en,en.ai)==='investigate','react(): moderate alert + last-known => investigate');
en.ai.alert=0;en.ai.lastKnown=null;
chk(AI.react(en,en.ai)===null,'react(): no stimulus => no transition');

/* ============ 3. idle -> patrol (state timer) ============ */
en=mkAI(18,10,0);
AI.go(en,'idle');
run(en,1/30,30);
chk(en.ai.state==='idle','idle holds while its timer runs');
run(en,1/30,90);
chk(en.ai.state==='patrol','idle -> patrol once the idle timer expires');

/* ============ 4. patrol follows the route ============ */
en=mkAI(18,10,0);
const py0=en.y,pidx0=en.ai.patrolIdx;
run(en,1/60,120);
chk(en.y<py0,'patrol moves the enemy toward its first waypoint');
chk(en.ai.patrolIdx===pidx0,'patrol stays on the current leg until the waypoint is reached');
chk(!centerSolid(AR(),en.x,en.y),'patrol keeps the enemy on walkable floor');
chk(en.ai.state==='patrol','patrol is self-sustaining with no stimulus');

/* ============ 5. sight drives patrol -> chase ============ */
en=mkAI(10,10,0);
en.patrol=[[16,10]];en.ai.patrolIdx=0;   /* patrol leg runs straight at the player */
setP(16,10);
run(en,1/60,90);
chk(en.ai.vis>0&&en.ai.canSee,'enemy sees the player (detection system)');
chk(en.ai.alert>=1.0,'alert climbed to the chase threshold');
chk(en.ai.state==='chase','sight drives patrol -> chase');

/* ============ 6. audio through a wall drives -> investigate (not chase) ============ */
en=mkAI(4,6,0);
setP(9,6,{sprint:true,moving:true});
chk(AI.see(en,en.ai,AR(),G.player)===0,'the cover wall blocks line of sight');
run(en,1/60,70);
chk(en.ai.hear>0,'enemy hears the sprinting player through the wall (audio awareness)');
chk(en.ai.canSee===false,'enemy still cannot see the player');
chk(en.ai.state==='investigate','sound alone escalates patrol -> investigate');
chk(en.ai.lastKnown&&Math.abs(en.ai.lastKnown.x-9)<0.01,'a last-known position is recorded from sound');

/* ============ 7. distance / no stimulus => no detection ============ */
en=mkAI(18,4,Math.PI);
setP(3.5,10.5);
en.ai.alert=0.5;
run(en,1/60,120);
chk(en.ai.vis===0,'a distant, out-of-view player is not seen');
chk(en.ai.hear===0,'a distant, still player is not heard');
chk(en.ai.alert<0.5,'alert decays with no stimulus');
chk(en.ai.state==='patrol','no detection: the enemy keeps patrolling');

/* ============ 8. chase closes the distance ============ */
en=mkAI(10,10,0);
setP(16,10);en.ai.alert=1.6;
const cd0=dist(en.x,en.y,16,10);
run(en,1/60,60);
chk(en.ai.state==='chase','enemy is chasing');
chk(dist(en.x,en.y,G.player.x,G.player.y)<cd0,'chase moves the enemy toward the player');
chk(!centerSolid(AR(),en.x,en.y),'chase navigation stays on walkable floor');

/* ============ 9. attack damages the player, with a cooldown ============ */
en=mkAI(10,10,0);
setP(10.8,10,{hp:3});
en.ai.alert=1.6;en.ai.lastKnown={x:10.8,y:10,t:G.time};
run(en,1/60,70);
chk(G.player.hp<3,'attack lands a hit (player hp decreased)');
chk(G.player.hp===2,'exactly one hit within the attack cooldown window');
chk(en.ai.state==='attack'||en.ai.state==='chase','enemy is attacking/re-engaging after the strike');

/* ============ 10. lose-target: chase -> lose when contact drops ============ */
en=mkAI(10,10,0);
setP(16,10);en.ai.alert=1.6;
run(en,1/60,10);
chk(en.ai.state==='chase','enemy is chasing the visible player');
setP(16,10,{hidden:true,moving:false,sprint:false,crouch:false});
en.ai.alert=0.15;
run(en,1/60,60);
chk(en.ai.state==='lose','chase -> lose once the target is hidden and alert drops below threshold');

/* ============ 11. lose -> search -> return -> patrol (timer chain) ============ */
en=mkAI(10,10,0);setP(16,10,{hidden:true});
AI.enter(en,'lose');en.ai.loseT=0.01;
run(en,1/60,6);
chk(en.ai.state==='search','lose -> search after the lose timer');
AI.enter(en,'search');en.ai.searchT=0;
run(en,1/60,3);
chk(en.ai.state==='return','search -> return when the search time runs out');
en.x=18;en.y=4;AI.enter(en,'return');
run(en,1/60,4);
chk(en.ai.state==='patrol','return -> patrol once a patrol waypoint is reached');

/* ============ 12. re-acquire during search jumps back to chase ============ */
en=mkAI(10,10,0);
AI.enter(en,'search');en.ai.searchT=99;en.ai.searchPts=[[10,10]];en.ai.sIdx=0;  /* hold position */
setP(14,10);en.ai.alert=1.2;   /* spotted again while already suspicious */
run(en,1/60,25);
chk(en.ai.state==='chase','search -> chase when the player is spotted again');

/* ============ 13. flow-field navigation routes AROUND cover ============ */
en=mkAI(4,4,0);
let stuckInWall=false;
for(let i=0;i<420;i++){
  AI.moveTo(en,en.ai,AR(),18,4,3.0,1/60);
  if(centerSolid(AR(),en.x,en.y))stuckInWall=true;
}
chk(en.x>13,'flow-field navigated the enemy around the wall toward a blocked target');
chk(!stuckInWall,'navigation never pushed the enemy into a solid tile');

/* ============ 14. integration: updateEnts dispatch + threat ============ */
enterScene('ai_arena',AR().spawn,{silent:true});
setP(18,5);G.noiseEvent=null;G.over=false;G.time=100;   /* player stands on the patrol path */
const proto=G.scene.entsLive.find(x=>x.type==='ai');
chk(!!proto,'the prototype enemy is live in the scene entity list');
for(let i=0;i<120;i++){G.time+=1/60;updateEnts(1/60);}
chk(proto.ai&&['chase','attack'].indexOf(proto.ai.state)>=0,'updateEnts dispatches the AI driver (enemy pursued the player)');
chk(G.threat>0,'a pursuing AI enemy raises the threat/heartbeat level');

/* ============ 15. modularity: a new enemy is DATA, a new behavior is a small state ============ */
AI.archetype({id:'t_sentry',initial:'idle',sight:{range:8,angle:1.0},
  speed:{idle:0,patrol:1.0,chase:2.5},alertGainSee:2.0,alertDecay:0.5,alertMax:1.6,
  chaseAlert:1.0,investigateAlert:0.4,loseAlert:0.2,attack:{range:1.0,cooldown:1.0}});
const e2={type:'ai',arch:'t_sentry',x:10,y:10,face:0,id:'sentry'};
AI.init(e2);
chk(e2.ai.state==='idle','a new archetype boots into its own initial state (data-driven)');
chk(e2.ai.arch===AI.archetypes.t_sentry,'the new archetype is wired to its enemy');
e2.ai.scanT=999;                 /* freeze the idle head-scan so detection is deterministic */
setP(16,10);
for(let i=0;i<100;i++){G.time+=1/60;AI.drive(e2,1/60,AR(),G.player);}
chk(['chase','attack'].indexOf(e2.ai.state)>=0,'the new enemy reuses the SAME shared states to detect + pursue');
AI.state({name:'t_hello',enter(e,ai){ai.hello=true;},think(){return null;},act(e){e.moving=false;}});
AI.enter(e2,'t_hello');
chk(e2.ai.state==='t_hello'&&e2.ai.hello===true,'a custom state block plugs straight into the FSM (modular)');
delete AI.archetypes.t_sentry;delete AI.states.t_hello;
chk(Object.keys(AI.archetypes).length===1,'cleanup: only the stalker prototype ships in the game');

console.log('\n'+(fails?('FAILURES: '+fails):'ENEMY AI FRAMEWORK SUITE OK')+'  ('+ (fails? 'FAILED':'all passed') +')');
if(fails)process.exit(1);
