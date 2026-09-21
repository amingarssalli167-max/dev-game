/* ---- Phase 7: Psychological Horror Event Manager ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);
const SB=()=>SCENES.slice_bld, SL=()=>SCENES.slice;
function fresh(scene,t){G.evt={done:{},cd:{}};G.flags={};G.items={};G.echo=0;G.threat=0;G.distort=0;
  EVT.clearQueue();EVT._rndT=9999;G.time=(t==null?100:t);
  enterScene(scene||'slice_bld',(scene==='slice'?SL():SB()).spawn,{silent:true});
  SB()._atmoPrev=null;SL()._atmoPrev=null;}
function cleanScene(s){s.shifted={};s.sprites=s.sprites.filter(x=>!x._evt);}

/* ============ 0. framework surface ============ */
chk(typeof EVENTS==='object','EVENTS registry present');
chk(typeof defEvent==='function','defEvent() present');
['fire','update','onEnter','eligible','applyBeat','isReal','st','fired','rebuild','clearQueue']
  .forEach(fn=>chk(typeof EVT[fn]==='function','EVT.'+fn+'()'));
['text','fx','echo','sound','light','lightRestore','spawn','despawn','door','mutate','flag','objective','threat','anomaly','run']
  .forEach(k=>chk(typeof EVT.FX[k]==='function','EVT.FX.'+k+'()'));

/* ============ 1. built-in events cover the horror categories ============ */
['lockbox_aftermath','evt_slice_changed','evt_street_apparition','evt_distant_door','evt_light_surge','evt_amb_shift','evt_whisper']
  .forEach(id=>chk(!!EVENTS[id],'built-in event "'+id+'" registered'));

/* ============ 2. fake vs real classification ============ */
chk(EVT.isReal(EVENTS.lockbox_aftermath)===true,'lockbox_aftermath = REAL');
chk(EVT.isReal(EVENTS.evt_slice_changed)===true,'evt_slice_changed = REAL');
chk(EVT.isReal(EVENTS.evt_distant_door)===false,'evt_distant_door = FAKE');
chk(EVT.isReal(EVENTS.evt_whisper)===false,'evt_whisper = FAKE');
chk(EVT.isReal(EVENTS.evt_light_surge)===false,'evt_light_surge = FAKE');
chk(EVT.isReal(EVENTS.evt_street_apparition)===false,'apparition labeled FAKE (it reverts)');

/* ============ 3. explicit fire (story/puzzle control) applies effects ============ */
fresh('slice_bld',100);
const ev0=G.stats.events||0;
chk(EVT.fire('evt_distant_door',{trigger:'story'})===true,'EVT.fire() fires an eligible event');
chk((G.stats.events||0)>ev0,'fired event is counted');
chk($('sub').querySelector('.txt').textContent.length>0,'a text effect reached the HUD subtitle');

/* ============ 4. gating: once / cooldown / when() / scene ============ */
defEvent({id:'t_once',kind:'fake',once:true,effects:{text:{subtitle:'once'}}});
fresh('slice_bld',0);
chk(EVT.fire('t_once')===true,'once-event fires the first time');
chk(EVT.fire('t_once')===false,'once-event is blocked afterwards');
chk(EVT.fired('t_once')===true,'fired() reports a once-event');

defEvent({id:'t_cd',kind:'fake',cooldown:30,effects:{text:{subtitle:'cd'}}});
fresh('slice_bld',0);
chk(EVT.fire('t_cd')===true,'cooldown event fires');
chk(EVT.fire('t_cd')===false,'cooldown blocks an immediate re-fire');
G.time=31;chk(EVT.fire('t_cd')===true,'cooldown expires after its interval');

defEvent({id:'t_when',kind:'fake',when:()=>!!G.flags.storyReady,effects:{text:{subtitle:'w'}}});
fresh('slice_bld',0);
chk(EVT.fire('t_when')===false,'when() gate blocks the event before story progress');
G.flags.storyReady=true;
chk(EVT.fire('t_when')===true,'when() gate opens after story progress (progression-controlled)');

defEvent({id:'t_scene',kind:'fake',scene:'slice_bld',effects:{text:{subtitle:'s'}}});
fresh('slice',0);
chk(EVT.fire('t_scene')===false,'scene-gated event blocked in the wrong scene');
fresh('slice_bld',0);
chk(EVT.fire('t_scene')===true,'scene-gated event fires in the right scene');

/* ============ 5. multi-beat scheduling (timed sequence) ============ */
defEvent({id:'t_beats',kind:'fake',beats:[
  {at:0,effects:{echo:{set:0.30},text:{subtitle:'b0'}}},
  {at:5,effects:{echo:{set:0.60},text:{subtitle:'b1'}}}]});
fresh('slice_bld',200);G.echo=0;
EVT.fire('t_beats');
chk(Math.abs(G.echo-0.30)<1e-6,'beat 0 applies immediately');
chk(EVT._queue.length===1,'beat 1 is scheduled, not yet applied');
G.time=204;EVT.update(0.016);
chk(Math.abs(G.echo-0.30)<1e-6,'beat 1 still pending before its time');
G.time=206;EVT.update(0.016);
chk(Math.abs(G.echo-0.60)<1e-6,'beat 1 applies after its delay (driven by EVT.update)');
chk(EVT._queue.length===0,'schedule flushed');

/* ============ 6. region trigger + appear/vanish (FAKE leaves no trace) ============ */
fresh('slice',300);cleanScene(SL());
const sprBefore=SL().sprites.length;
G.player.x=21.5;G.player.y=17.5;EVT.update(0.016);
chk(!EVT.fired('evt_street_apparition'),'region event dormant while the player is far');
G.player.x=33;G.player.y=17;EVT.update(0.016);
chk(EVT.fired('evt_street_apparition'),'region event fires when the player enters the region');
chk(SL().sprites.some(sp=>sp._evt==='street_fig'),'something appeared (sprite spawned)');
G.time=306;EVT.update(0.016);
chk(!SL().sprites.some(sp=>sp._evt==='street_fig'),'it vanished on its later beat');
chk(SL().sprites.length===sprBefore,'FAKE appear/vanish left the world net-unchanged');

/* ============ 7. enter trigger = REAL persistent "changed on return" ============ */
fresh('slice_bld',400);cleanScene(SB());
setT(SB().g,12,12,TL.DOOR);
enterScene('slice_bld',SB().spawn,{silent:true});
chk(SB().shifted.hallChanged!==true,'enter event dormant without the story flag');
G.flags.slice_changed=true;cleanScene(SB());setT(SB().g,12,12,TL.DOOR);
const bathInt=SB().ints.find(i=>i.id==='sb_bath');if(bathInt)bathInt.used=false;
enterScene('slice_bld',SB().spawn,{silent:true});
chk(SB().shifted.hallChanged===true,'enter-triggered REAL event applied a persistent change');
chk(SB().sprites.some(sp=>sp._evt==='hall_figure'),'the room changed on return (a figure is now there)');
chk(getT(SB().g,12,12)===TL.WALL,'a door became a wall (doors are different now)');
const figs=SB().sprites.filter(sp=>sp._evt==='hall_figure').length;
enterScene('slice_bld',SB().spawn,{silent:true});
chk(SB().sprites.filter(sp=>sp._evt==='hall_figure').length===figs,'the change is idempotent on further re-entry');

/* ============ 8. tuned random pool = all FAKE, fires on timer ============ */
fresh('slice_bld',500);G.echo=0.5;
const pool=Object.keys(EVENTS).filter(id=>EVENTS[id].random&&EVT.eligible(EVENTS[id],{trigger:'random'}));
chk(pool.length>=2,'a tuned-random pool of eligible events exists ('+pool.length+')');
chk(pool.every(id=>!EVT.isReal(EVENTS[id])),'every random-pool event is FAKE (no random world mutation)');
const evBefore=G.stats.events||0;
const _r=Math.random;Math.random=()=>0;EVT._rndT=0;
EVT.update(0.016);
Math.random=_r;
chk((G.stats.events||0)>evBefore,'the random scheduler fires an event when its timer elapses');

/* ============ 9. effect library ============ */
fresh('slice_bld',600);
G.flags={};EVT.FX.flag({testFlag:true});chk(G.flags.testFlag===true,'FX.flag (object)');
EVT.FX.flag('strFlag');chk(G.flags.strFlag===true,'FX.flag (string)');
G.echo=0;EVT.FX.echo({add:0.2});chk(Math.abs(G.echo-0.2)<1e-6,'FX.echo add');
EVT.FX.echo({set:0.5});chk(G.echo===0.5,'FX.echo set');
EVT.FX.echo(0.7);chk(Math.abs(G.echo-0.7)<1e-6,'FX.echo number');
EVT.FX.objective(['هدف','تحت']);chk(G.objective==='هدف','FX.objective');
G.threat=0;EVT.FX.threat({set:0.6,noise:8});chk(G.threat===0.6&&G.noiseEvent&&G.noiseEvent.r===8,'FX.threat');
G.distort=0;G.grain=0.05;EVT.FX.fx({distort:0.4,grain:0.2,shake:[2,0.3]});chk(G.distort===0.4&&G.grain===0.2,'FX.fx');
EVT.FX.text({subtitle:'مرحبا',note:'نوت',tag:'t'});chk(G.notes[0].t==='نوت','FX.text (note)');
const hemi0=SB().atmo.hemi;
EVT.FX.light({save:true,hemi:0.2});chk(SB().atmo.hemi===0.2,'FX.light changes the atmosphere');
chk(SB()._atmoPrev&&SB()._atmoPrev.hemi===hemi0,'FX.light saved the previous value');
EVT.FX.lightRestore();chk(SB().atmo.hemi===hemi0,'FX.lightRestore reverts the atmosphere');
const n0=SB().sprites.length;
EVT.FX.spawn({x:10,y:10,type:'statue',tag:'t1'});
chk(SB().sprites.length===n0+1&&SB().sprites.some(x=>x._evt==='t1'),'FX.spawn adds a tagged sprite');
EVT.FX.despawn({tag:'t1'});chk(SB().sprites.length===n0,'FX.despawn removes it');
SB().shifted={};EVT.FX.mutate({shift:{m:true},addSprites:[{x:9,y:9,type:'debris',_evt:'m1'}]});
chk(SB().shifted.m===true&&SB().sprites.some(x=>x._evt==='m1'),'FX.mutate shifts the scene + adds sprites');
SB().sprites=SB().sprites.filter(x=>x._evt!=='m1');
let ran=0;EVT.FX.run(()=>{ran++;});chk(ran===1,'FX.run custom hook');
const an0=G.stats.anomalies;EVT.FX.anomaly('static');chk(G.stats.anomalies>an0,'FX.anomaly bridges to the legacy anomaly system');
EVT.FX.sound({sfx:'door',tone:[440,0.1,0.05],noise:[0.2,200,1,0.05],speak:['hi',1,1,0.5]});chk(true,'FX.sound runs without error');

/* ============ 10. FAKE events never mutate world state; REAL events do ============ */
fresh('slice_bld',700);cleanScene(SB());setT(SB().g,12,12,TL.DOOR);
const snap=()=>({spr:SB().sprites.length,fl:Object.keys(G.flags).length,it:Object.keys(G.items).length,bath:getT(SB().g,12,12)});
const b4=snap();
EVT.fire('evt_distant_door');EVT.fire('evt_whisper');
const af=snap();
chk(af.spr===b4.spr&&af.fl===b4.fl&&af.it===b4.it&&af.bath===b4.bath,'FAKE events leave world/progression state untouched');
EVT.fire('lockbox_aftermath');
chk(G.flags.slice_changed===true,'REAL event mutates story state');

/* ============ 11. INTEGRATED demo: puzzle -> event -> changed on return ============ */
fresh('slice_bld',800);cleanScene(SB());setT(SB().g,12,12,TL.DOOR);
const bi=SB().ints.find(i=>i.id==='sb_bath');if(bi){bi.used=false;bi._gone=false;}
G.pz={};
function solveNode(sid,setup){const c=SB().ints.find(i=>i.step===sid);PZ.node(c);if(setup)setup();PZ.submit();PZ.advance();}
solveNode('clue_drawing');
solveNode('lockbox',()=>{PZUI.input=['3','1','4'];});
solveNode('cabinet',()=>{PZUI.sel='sun';});
chk(PZ.solved('pz_lockbox'),'demo puzzle solved');
chk(G.flags.slice_changed===true,'solving the puzzle fired the REAL aftermath event (puzzle -> event link)');
enterScene('slice',SL().spawn,{silent:true});          // leave
enterScene('slice_bld',SB().spawn,{silent:true});       // return
chk(SB().shifted.hallChanged===true,'the change is present when you come back');
chk(SB().sprites.some(x=>x._evt==='hall_figure'),'the hall is different on return');
chk(getT(SB().g,12,12)===TL.WALL,'the door is different on return');

/* ============ 12. save / load persists event state + re-applies real changes ============ */
fresh('slice_bld',900);cleanScene(SB());setT(SB().g,12,12,TL.DOOR);
EVT.fire('lockbox_aftermath');
chk(EVT.fired('lockbox_aftermath'),'once-event marked fired before saving');
saveGame(true);
const raw=localStorage.getItem(SAVEKEY);
chk(raw&&raw.indexOf('lockbox_aftermath')>=0,'save data contains event-manager state');
G.evt={done:{},cd:{}};G.flags={};
loadGame();
chk(G.flags.slice_changed===true,'story flag restored from save');
chk(EVT.fired('lockbox_aftermath'),'once-event stays fired after load (no double-fire)');
chk(SCENES.slice_bld.shifted.hallChanged===true,'the enter-triggered change re-applied during load');
chk(SCENES.slice_bld.sprites.some(x=>x._evt==='hall_figure'),'persistent world change survived save/load');

console.log(fails?('\n'+fails+' FAILURES'):'\nEVENT MANAGER SUITE OK');
