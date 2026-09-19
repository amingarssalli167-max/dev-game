/* ---- geometry sanity: every scene builds inside its grid ---- */
let bad=0;const chk=(c,m)=>{console.log((c?'  ok  ':'FAIL  ')+m);if(!c)bad++;};
boot();startGame(true);
function stats(id){
  enterScene(id,SCENES[id].spawn,{silent:true});
  DLG.open=false;G.paused=false;
  E3.builtFor=null;G.time+=0.016;update3D(0.016);
  let idx=0,groups=0,big=0,bb={min:[1e9,1e9,1e9],max:[-1e9,-1e9,-1e9]};
  E3.world.traverse(o=>{
    const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;
    const p=g.attributes.position.array;
    for(let i=0;i<p.length;i+=3)for(let a=0;a<3;a++){
      bb.min[a]=Math.min(bb.min[a],p[i+a]);bb.max[a]=Math.max(bb.max[a],p[i+a]);}
    if(g.groups)groups+=g.groups.length;
    if(g.index)idx+=g.index.length;
    if(p.length/3>500)big++;
  });
  return {idx,groups,big,bb,spr:E3.sprites.length};
}
for(const id of Object.keys(SCENES)){
  const g=stats(id),s=SCENES[id];
  console.log(id.padEnd(12)+' grid '+s.g.w+'x'+s.g.h+
    '  y:['+g.bb.min[1].toFixed(2)+','+g.bb.max[1].toFixed(2)+']'+
    '  x:['+g.bb.min[0].toFixed(1)+','+g.bb.max[0].toFixed(1)+']'+
    '  z:['+g.bb.min[2].toFixed(1)+','+g.bb.max[2].toFixed(1)+']'+
    '  tris '+(g.idx/3|0)+' sprites '+g.spr);
  chk(g.bb.min[1]>=-0.6&&g.bb.min[1]<=0.05,id+' floor at y≈0');
  chk(g.bb.max[1]>1.5&&g.bb.max[1]<12,id+' wall/roof height sane ('+g.bb.max[1].toFixed(2)+')');
  chk(g.bb.max[0]<=s.g.w+0.6&&g.bb.min[0]>=-0.6,id+' x inside grid');
  chk(g.bb.max[2]<=s.g.h+0.6&&g.bb.min[2]>=-0.6,id+' z inside grid');
  chk(g.idx>0&&g.groups>0,id+' indexed geometry, '+g.groups+' material groups');
}
const og=stats('outdoor');
chk(og.big<=4,'outdoor terrain is merged ('+og.big+' big meshes)');
enterScene('outdoor',SCENES.outdoor.spawn,{silent:true});E3.builtFor=null;update3D(0.016);
chk(E3.wheel!=null,'ferris wheel built');
chk(E3.wheelGondolas.length>0,'ferris wheel has '+E3.wheelGondolas.length+' gondolas');
console.log(bad?('\n'+bad+' FAILURES'):'\nGEOMETRY OK');
