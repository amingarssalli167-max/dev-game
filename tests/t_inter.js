/* ---- Phase 4: Central Interaction System ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;}
/* stand near an interactable and look at it; returns the focused candidate */
function face(c,ox,oy){
  G.player.x=c.x+(ox||0);G.player.y=c.y+(oy==null?0.6:oy);
  IN.aim=Math.atan2(c.y-G.player.y,c.x-G.player.x);
  IN.movedByMouse=true;G.player.hidden=false;
  updateHint();
  return curInt;
}
const SB=()=>SCENES.slice_bld, SL=()=>SCENES.slice;
const find=(s,id)=>s.ints.find(i=>i.id===id);

/* ============ 0. registry exists & is complete ============ */
chk(typeof INTERACT==='object','INTERACT system present');
['register','def','key','prompt','candidates','focus','run'].forEach(fn=>
  chk(typeof INTERACT[fn]==='function','INTERACT.'+fn+'()'));
['door','locked','item','doc','tape','search','hide','terminal','talk','rex','final',
 'examine','device','puzzle'].forEach(t=>chk(!!INTERACT.def(t),'type "'+t+'" registered'));
chk(typeof INTERACT.range==='number'&&typeof INTERACT.gazeAngle==='number','interaction range + gaze cone are tunables');

/* ============ 1. DOOR — look, know, open ============ */
enterScene('slice_bld',SB().spawn,{silent:true});closeAll();
const bath=find(SB(),'sb_bath');
chk(getT(SB().g,12,12)===TL.DOOR,'bathroom door starts closed (DOOR tile)');
let f=face(bath,-0.8,0);                       // stand in the corridor, look east at the door
chk(f&&f.id==='sb_bath','door is focused when you look at it');
chk(INTERACT.key(f)==='E','HUD key for a door is E');
chk(INTERACT.prompt(f).length>0,'HUD prompt for a door is non-empty ("'+INTERACT.prompt(f)+'")');
doInteract();
chk(getT(SB().g,12,12)===TL.F_CONC,'interacting opens the door (DOOR -> F_CONC)');
chk(bath.used===true,'opened door is consumed');

/* ============ 2. READ A NOTE (doc) ============ */
const doc=find(SB(),'doc_slice_apt');
f=face(doc,0,0.6);
chk(f&&f.id==='doc_slice_apt','note is focused');
doInteract();
chk(DOC.open===true,'reading a note opens the document viewer');
chk(doc.used===true,'note is consumed after reading');
closeDoc();closeAll();

/* ============ 3. EXAMINE — inspect an object (re-usable) ============ */
const tv=find(SB(),'sb_tv');
f=face(tv,0,0.6);
chk(f&&f.id==='sb_tv','examinable object is focused');
chk(INTERACT.prompt(f).indexOf('افحص')>=0,'examine prompt offered ("'+INTERACT.prompt(f)+'")');
doInteract();
chk(tv.used!==true,'examine with once:false stays available (re-examinable)');
face(tv,0,0.6);doInteract();
chk(tv.used!==true,'examine can be repeated without error');

/* ============ 4. COLLECT (item) ============ */
const bat=find(SB(),'sb_batt');
f=face(bat,0,0.6);
chk(f&&f.id==='sb_batt','collectible is focused');
const batBefore=G.items.batteries||0;
doInteract();
chk(bat.used===true,'collectible is consumed after pickup');
chk((G.items.batteries||0)>batBefore,'batteries added to inventory');

/* ============ 5. DEVICE — operate / toggle ============ */
const fuse=find(SB(),'sb_fuse');
f=face(fuse,0,0.6);
chk(f&&f.id==='sb_fuse','device is focused');
chk(!fuse.state,'device starts OFF');
chk(INTERACT.prompt(f).indexOf('شغّل')>=0||INTERACT.prompt(f)===fuse.label,'device prompt offers to operate it');
doInteract();
chk(fuse.state===true,'device toggled ON');
chk(G.flags.slicePower===true,'device wrote its state flag');
face(fuse,0,0.6);doInteract();
chk(fuse.state===false,'device toggled OFF (reusable)');

/* ============ 6. PUZZLE — activation hook only (no full puzzle yet) ============ */
let activated=false;
const pz={type:'puzzle',x:10,y:6,id:'test_puzzle',label:'لغز تجريبي',onActivate:()=>{activated=true;}};
SB().ints.push(pz);
f=face(pz,0,0.6);
chk(f&&f.id==='test_puzzle','puzzle hook is focusable');
doInteract();
chk(activated===true,'puzzle onActivate hook fired (system ready; content deferred)');

/* ============ 7. MODULARITY — register a brand-new type, zero engine edits ============ */
INTERACT.register('testvalve',{key:'F',
  prompt(c){return c.label||'صمام';},
  run(c){c.used=true;G.flags.testValve=(G.flags.testValve||0)+1;}});
const valve={type:'testvalve',x:9,y:10,id:'test_valve',label:'صمام اختبار'};
SB().ints.push(valve);
f=face(valve,0,0.6);
chk(f&&f.id==='test_valve','a newly registered type is focusable with no core changes');
chk(INTERACT.key(f)==='F','custom type supplies its own HUD key');
doInteract();
chk(G.flags.testValve===1&&valve.used===true,'custom type handler ran through the registry');

/* ============ 8. GAZE — look direction selects among several candidates ============ */
enterScene('slice',SL().spawn,{silent:true});closeAll();
SL().ints.push({type:'examine',x:20,y:17,id:'gaze_w',label:'غرب',once:false,text:'w'});
SL().ints.push({type:'examine',x:24,y:17,id:'gaze_e',label:'شرق',once:false,text:'e'});
G.player.x=22;G.player.y=17;G.player.hidden=false;
IN.aim=Math.PI;updateHint();          // look WEST
chk(curInt&&curInt.id==='gaze_w','gaze picks the element you look at (west)');
IN.aim=0;updateHint();                // look EAST
chk(curInt&&curInt.id==='gaze_e','gaze picks the element you look at (east)');
IN.aim=-Math.PI/2;updateHint();       // look away (north) — proximity fallback
chk(curInt&&(curInt.id==='gaze_w'||curInt.id==='gaze_e'),'proximity fallback when nothing is in the gaze cone');

/* ============ 9. range limit ============ */
G.player.x=22;G.player.y=30;IN.aim=-Math.PI/2;updateHint();
chk(curInt===null||dist(G.player.x,G.player.y,curInt.x,curInt.y)<=INTERACT.range+0.01,
  'nothing is focused beyond the interaction range');

/* ============ 10. scene-link door carries a transition target ============ */
const apt=SL().doors.find(d=>d.id==='slice_apt_door');
chk(apt&&apt.to==='slice_bld','a door definition carries where it leads (data, not code)');

/* ============ 11. 3D focus indicator ============ */
enterScene('slice_bld',SB().spawn,{silent:true});closeAll();
const tv2=find(SB(),'sb_tv');
face(tv2,0,0.6);
G.dt=0.016;update3D(0.016);
chk(!!E3.focusRing,'3D focus indicator created');
chk(E3.focusRing.visible===true,'focus ring visible while an element is focused');
chk(Math.abs(E3.focusRing.position.x-tv2.x)<0.02&&Math.abs(E3.focusRing.position.z-tv2.y)<0.02,
  'focus ring sits on the focused element');
NB.open=true;updateHint();update3D(0.016);
chk(curInt===null,'focus clears while an overlay is open');
chk(E3.focusRing.visible===false,'focus ring hidden when nothing is focused');
NB.open=false;

/* ============ 12. hidden player cannot focus / interact ============ */
G.player.hidden=true;updateHint();
chk(curInt===null,'no interaction focus while hidden');
G.player.hidden=false;

console.log(fails?('\n'+fails+' FAILURES'):'\nINTERACTION SYSTEM SUITE OK');
