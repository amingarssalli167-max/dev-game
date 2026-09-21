boot();startGame(true);
enterScene('outdoor',{x:25.5,y:38.5},{silent:true});
DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;
for(let i=0;i<10;i++){G.time+=0.016;updatePlayer(0.016);update3D(0.016);}
const P=G.player,g=G.scene.g;
const clear=(x,y)=>{for(let a=0;a<8;a++){const ang=a*Math.PI/4;
  for(let r=0.6;r<=3;r+=0.6)if(solidT(getT(g,Math.floor(x+Math.cos(ang)*r),Math.floor(y+Math.sin(ang)*r))))return false;}return true;};
let px0=-1,py0=-1;
for(let y=2;y<G.scene.h-2&&px0<0;y++)for(let x=2;x<G.scene.w-2;x++)if(clear(x+0.5,y+0.5)){px0=x+0.5;py0=y+0.5;break;}
console.log('open ground',px0,py0);
function probe(aim,keys){
  IN.aim=aim;IN.lookX=IN.lookY=0;IN.movedByMouse=true;
  P.x=px0;P.y=py0;P.hidden=false;P.sta=100;P.injured=0;P.crouchLock=false;
  const sx=P.x,sy=P.y;
  IN.keys={};keys.forEach(k=>IN.keys[k]=true);
  let first=null;
  for(let i=0;i<30;i++){
    updatePlayer(0.05);
    if(i===0)first={dx:P.x-sx,dy:P.y-sy,aim:IN.aim};
  }
  IN.keys={};
  return {dx:P.x-sx,dy:P.y-sy,first};
}
const r=probe(0,['KeyW']);
console.log('aim=0 W ->',r.dx.toFixed(3),r.dy.toFixed(3),'first frame',JSON.stringify(r.first));
const r2=probe(0,['KeyD']);
console.log('aim=0 D ->',r2.dx.toFixed(3),r2.dy.toFixed(3));
const r3=probe(-Math.PI/2,['KeyW']);
console.log('aim=-pi/2 W ->',r3.dx.toFixed(3),r3.dy.toFixed(3));
console.log('IN.joy',JSON.stringify(IN.joy),'IN.aim',IN.aim);
