/* ---- Phase 3: Environment System (vertical slice) ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);                       // builds ALL scenes incl. slice + slice_bld
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;}
function step(n){for(let i=0;i<n;i++){
  G.dt=0.016;G.time+=0.016;
  if(!G.paused&&!DLG.open&&!DOC.open&&!CODE.open&&!NB.open){
    try{updatePlayer(0.016);updateEnts(0.016);updateHint();}
    catch(e){bad('sim: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
  }
  try{update3D(0.016);}catch(e){bad('3D: '+e.stack.split('\n').slice(0,2).join(' | '));return false;}
}return true;}
const til=(s,x,y)=>getT(s.g,x,y);

/* ============ 0. ENV API exists ============ */
chk(typeof ENV==='object','ENV environment system present');
['scene','ground','road','plaza','block','interior','door','atmo','bright','dark',
 'audio','prop','scatter','hide','reachable','validate','startAmbient'].forEach(fn=>
  chk(typeof ENV[fn]==='function','ENV.'+fn+'()'));

/* ============ 1. slice scenes registered ============ */
chk(!!SCENES.slice,'SCENES.slice built');
chk(!!SCENES.slice_bld,'SCENES.slice_bld built');
const SL=SCENES.slice, SB=SCENES.slice_bld;
chk(SL.w===44&&SL.h===36,'slice grid is 44x36');
chk(SB.indoor===true,'slice_bld is an interior (indoor) scene');
chk(SL.indoor!==true,'slice street is exterior');

/* ============ 2. validation / navigation-ready ============ */
const vSL=ENV.validate(SL), vSB=ENV.validate(SB);
chk(vSL.ok,'slice validates: '+(vSL.ok?('nav '+vSL.reach+'/'+vSL.nav):vSL.problems.join('; ')));
chk(vSB.ok,'slice_bld validates: '+(vSB.ok?('nav '+vSB.reach+'/'+vSB.nav):vSB.problems.join('; ')));
chk(vSL.reach===vSL.nav,'slice has NO sealed-off areas ('+vSL.reach+'/'+vSL.nav+')');
chk(vSB.reach===vSB.nav,'slice_bld has NO sealed-off rooms ('+vSB.reach+'/'+vSB.nav+')');
chk(!solidT(til(SL,Math.floor(SL.spawn.x),Math.floor(SL.spawn.y))),'slice spawn is walkable');
chk(!solidT(til(SB,Math.floor(SB.spawn.x),Math.floor(SB.spawn.y))),'slice_bld spawn is walkable');

/* ============ 3. AI flow-field navigation works on the slice ============ */
enterScene('slice',SL.spawn,{silent:true});closeAll();
computeFlow(SL,Math.floor(SL.spawn.x),Math.floor(SL.spawn.y));
let reached=0,openStreet=0;
for(let y=14;y<=20;y++)for(let x=4;x<=40;x++){
  const t=til(SL,x,y);
  if(!solidT(t)&&t!==TL.DOOR){openStreet++;if(flow[y*SL.w+x]>=0)reached++;}
}
chk(reached===openStreet,'flow-field reaches every open street tile ('+reached+'/'+openStreet+') — navigation-ready');

/* ============ 4. grid integrity: street = bright spine, blocks = solid ============ */
chk(til(SL,21,17)===TL.ROAD,'main street tile is ROAD');
chk(!solidT(til(SL,21,17)),'street is walkable');
chk(til(SL,12,8)===TL.ROOF,'apartment block interior is solid ROOF (sealed volume)');
chk(solidT(til(SL,12,8)),'building volume blocks movement');
chk(til(SL,7,5)===TL.WALL,'building corner is WALL');
chk(til(SL,12,12)===TL.DOOR,'apartment entrance is a DOOR tile');
chk(til(SL,22,31)===TL.DOOR,'district exit gate is a DOOR tile');
chk(til(SL,13,21)===TL.F_DIRT,'alley floor is dirt');
chk(solidT(til(SL,12,20)),'alley rubble wall is solid');

/* ============ 5. interior carving: single-thick walls, doors on wall rows ============ */
chk(til(SB,10,8)===TL.F_CONC,'corridor spine carved (F_CONC)');
chk(til(SB,5,6)===TL.F_WOOD,'living room floor carved (F_WOOD)');
chk(til(SB,8,6)===TL.F_CONC,'open doorway between living room and corridor is passable');
chk(!solidT(til(SB,8,6)),'open doorway is walkable');
chk(til(SB,8,5)===TL.WALL,'wall beside the doorway is solid (single-thickness partition)');
chk(til(SB,12,12)===TL.DOOR,'bathroom door is a DOOR tile');
chk(til(SB,10,15)===TL.DOOR,'interior entrance/exit is a DOOR tile');
chk(til(SB,2,2)===TL.WALL,'interior footprint border is WALL');
chk(til(SB,0,0)===TL.WALL,'outside the building is solid (base fill)');

/* ============ 6. collision ============ */
chk(solidAt(SL,12.5,8.5,0.3)===true,'collision: building volume is solid');
chk(solidAt(SL,21.5,17.5,0.3)===false,'collision: street is free');
chk(solidAt(SB,5.5,6.5,0.3)===false,'collision: living room floor is free');
chk(solidAt(SB,8.5,5.5,0.3)===true,'collision: interior partition is solid');

/* ============ 7. lighting: bright & dark zones ============ */
const brightZones=SL.zones.filter(z=>z.kind==='light').length;
const darkZones=SL.zones.filter(z=>z.kind==='dark').length;
chk(SL.lights.length>=4,'slice has multiple light sources ('+SL.lights.length+')');
chk(brightZones>=2,'slice has bright zones ('+brightZones+')');
chk(darkZones>=1,'slice has dark zones ('+darkZones+')');
chk(SB.lights.length>=1,'slice_bld has at least one light ('+SB.lights.length+')');
chk(SB.zones.some(z=>z.kind==='dark'),'slice_bld has a dark zone (kitchen/bath)');
chk(SB.zones.some(z=>z.kind==='light'),'slice_bld has a bright zone (living lamp)');
chk(SL.lights.some(L=>L.broken),'slice has a broken/flickering lamp (mood)');

/* ============ 8. atmosphere + fog (per-scene override) ============ */
chk(SL.atmo&&SL.atmo.fog>0,'slice atmosphere set (fog '+SL.atmo.fog+')');
chk(SB.atmo&&SB.atmo.fog>SL.atmo.fog,'interior fog is denser than street ('+SB.atmo.fog+' > '+SL.atmo.fog+')');
chk(SL.atmo.bg!=null&&SL.atmo.fogColor!=null,'slice fog/bg colour authored');

/* ============ 9. ambient audio zones ============ */
chk(SL.ambAudio&&Array.isArray(SL.ambAudio.events)&&SL.ambAudio.events.length,'slice ambient audio events ('+SL.ambAudio.events.length+')');
chk(SB.ambAudio&&SB.ambAudio.events.some(e=>e.sfx==='drip'),'interior has drip ambience');
chk(SL.ambAudio.wind>SB.ambAudio.wind,'street is windier than interior ('+SL.ambAudio.wind+' > '+SB.ambAudio.wind+')');
chk(typeof ENV.ambientSfx==='function','ENV.ambientSfx exists');

/* ============ 10. door links connect the slice into the world ============ */
const aptDoor=SL.doors.find(d=>d.id==='slice_apt_door');
const exitDoor=SL.doors.find(d=>d.id==='slice_exit');
chk(aptDoor&&aptDoor.to==='slice_bld','street door links to the building interior');
chk(exitDoor&&exitDoor.to==='outdoor','district exit links back to the main game (outdoor)');
const sbExit=SB.doors.find(d=>d.id==='sb_exit');
chk(sbExit&&sbExit.to==='slice','interior exit links back to the street (round trip)');
const bathDoor=SB.ints.find(d=>d.id==='sb_bath');
chk(bathDoor&&bathDoor.type==='door'&&bathDoor.to==null,'bathroom is an in-scene openable door');

/* ============ 11. props / interactables / hiding ============ */
chk(SL.sprites.some(sp=>sp.type==='lamp'),'street lamps placed');
chk(SL.sprites.some(sp=>sp.type==='car')&&SL.sprites.some(sp=>sp.type==='bus'),'abandoned vehicles placed');
chk(SL.ints.some(i=>i.type==='doc'),'environment-storytelling document placed');
chk(SL.ints.some(i=>i.type==='hide'),'a hiding spot exists on the street');
chk(SB.ints.some(i=>i.type==='hide'),'a hiding spot exists in the building');
chk(SB.ints.some(i=>i.type==='item'),'a usable item exists in the building');
chk(SL.zones.length>0&&SB.zones.length>0,'named zones recorded (slice '+SL.zones.length+', interior '+SB.zones.length+')');

/* ============ 12. 3D mesh builds for both scenes ============ */
function meshStats(sc){
  enterScene(sc.id,sc.spawn,{silent:true});closeAll();
  E3.builtFor=null;step(2);
  let tris=0,nodes=0;
  E3.world.traverse(o=>{nodes++;if(o.geometry&&o.geometry.index){
    const ix=o.geometry.index,arr=ix.array||ix;if(arr&&arr.length)tris+=arr.length/3;}});
  return {tris:tris,nodes:nodes,world:!!E3.world};
}
const mSL=meshStats(SL), mSB=meshStats(SB);
chk(mSL.world&&mSL.tris>500,'slice 3D mesh builds (tris='+Math.round(mSL.tris)+' nodes='+mSL.nodes+')');
chk(mSB.world&&mSB.tris>200,'slice_bld 3D mesh builds (tris='+Math.round(mSB.tris)+' nodes='+mSB.nodes+')');

/* ============ 13. player can walk the slice without entering walls ============ */
enterScene('slice',SL.spawn,{silent:true});closeAll();
G.player.x=SL.spawn.x;G.player.y=SL.spawn.y;E3.camSnap=true;step(2);
IN.aim=0;IN.keys={KeyW:true};let inside=0;
for(let i=0;i<120;i++){step(1);if(solidAt(G.scene,G.player.x,G.player.y,0.3))inside++;}
IN.keys={};
chk(inside===0,'player never clips into geometry while walking the street ('+inside+'/120)');
const moved=Math.hypot(G.player.x-SL.spawn.x,G.player.y-SL.spawn.y);
chk(moved>1,'player actually moves along the street (moved '+moved.toFixed(2)+' tiles)');

/* ============ 14. opening the in-scene bathroom door works ============ */
enterScene('slice_bld',SB.spawn,{silent:true});closeAll();step(2);
const bath=SB.ints.find(d=>d.id==='sb_bath');
chk(til(SB,12,12)===TL.DOOR,'bathroom door starts closed (DOOR tile)');
G.player.x=13.5;G.player.y=12.5;updateHint();
chk(curInt&&curInt.id==='sb_bath','bathroom door is interactable from the corridor side');
doInteract();
chk(til(SB,12,12)===TL.F_CONC,'interacting opens the door (DOOR -> F_CONC)');
chk(!solidT(til(SB,12,12)),'opened door is now passable');

/* ============ 15. the slice loop is closed: street -> interior -> street ============ */
enterScene('slice',SL.spawn,{silent:true});closeAll();
chk(G.sceneId==='slice','on the street');
enterScene('slice_bld',{x:10.5,y:13.5},{silent:true});closeAll();
chk(G.sceneId==='slice_bld','entered the building interior');
enterScene('slice',{x:12.5,y:13.5},{silent:true});closeAll();
chk(G.sceneId==='slice','returned to the street (round trip works)');

console.log(fails?('\n'+fails+' FAILURES'):'\nENVIRONMENT VERTICAL-SLICE SUITE OK');
