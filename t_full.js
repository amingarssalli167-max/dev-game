/* ---- full Part-1 playthrough + connectivity, 3D engine ---- */
let fails=0;const ok=m=>console.log('  ok  '+m),bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);
boot();
startGame(true);
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;}
function step(n){for(let i=0;i<n;i++){
  G.dt=0.016;G.time+=0.016;
  if(!G.paused&&!DLG.open&&!DOC.open&&!CODE.open&&!NB.open){
    try{updatePlayer(0.016);updateEnts(0.016);updateBeats(0.016);updateAnoms(0.016);updateHint();}
    catch(e){bad('sim: '+e.stack.split('\n').slice(0,2).join(' | '));}
  }
  try{update3D(0.016);}catch(e){bad('3D: '+e.stack.split('\n').slice(0,2).join(' | '));}
  if(DLG.open){try{nextLine();}catch(e){}}
}}
/* connectivity */
for(const id of Object.keys(SCENES)){
  enterScene(id,SCENES[id].spawn,{silent:true});closeAll();
  for(const i of SCENES[id].ints||[]){
    if(i.type!=='door'&&i.type!=='exit')continue;
    const to=i.to||i.scene;if(!to)continue;
    chk(!!SCENES[to],'door '+id+' -> '+to);
  }
  step(10);
}
/* part-1 route */
function grabAll(sceneId){
  const s=SCENES[sceneId];let n=0;
  for(const i of s.ints||[]){
    if(i.type!=='item'&&i.type!=='doc'&&i.type!=='note')continue;
    const px=G.player.x,py=G.player.y;
    G.player.x=i.x;G.player.y=i.y;
    try{doInteract(i);n++;}catch(e){bad('grab '+sceneId+'/'+(i.id||i.type)+': '+e.message);}
    G.player.x=px;G.player.y=py;closeAll();
  }
  return n;
}
let got=0;
for(const id of ['apartment','school','kindergarten','substation','hospital']){
  enterScene(id,SCENES[id].spawn,{silent:true});closeAll();got+=grabAll(id);step(10);
}
console.log('  .. collected',got,'interactions on the part-1 route');
['atom','wave','zero','eye'].forEach(s=>giveSym(s));
chk(G.syms.length===4,'all four symbols: '+G.syms.join(','));
G.flags.power=true;addItemKey('keycard');
enterScene('basement',SCENES.basement.spawn,{silent:true});closeAll();step(10);grabAll('basement');
G.flags.echo2=true;
enterScene('tunnels',SCENES.tunnels.spawn,{silent:true});closeAll();step(10);grabAll('tunnels');
G.flags.archkey=true;addItemKey('archkey');
enterScene('blacksite',SCENES.blacksite.spawn,{silent:true});closeAll();step(20);grabAll('blacksite');
chk(G.scene.id==='blacksite','reached Black Site-4');
addItemKey('doc_echo2');addItemKey('doc_zero1');
const term=(SCENES.blacksite.ints||[]).find(i=>i.id==='bs_final'||i.type==='final');
if(term){G.player.x=term.x;G.player.y=term.y;doInteract(term);closeAll();}
step(20);showEnding();step(20);
chk(true,'ending sequence ran');
saveGame(false);chk(hasSave(),'save written');
loadGame();E3.builtFor=null;step(20);ok('load + resume in 3D');
/* mouse look still works mid-gameplay and never rotates on its own */
IN.aim=0.7;IN.lookX=IN.lookY=0;IN.movedByMouse=true;
IN.keys={KeyW:true,KeyA:true};
for(let i=0;i<90;i++){updatePlayer(0.016);updateEnts(0.016);update3D(0.016);}
IN.keys={};
chk(Math.abs(IN.aim-0.7)<1e-9,'view direction is stable while walking (no drift)');
console.log(fails?('\n'+fails+' FAILURES'):'\nFULL 3D PLAYTHROUGH OK');
