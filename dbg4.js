boot();startGame(true);
enterScene('outdoor',{x:25.5,y:38.5},{silent:true});
DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;G.paused=false;
for(let i=0;i<10;i++){G.time+=0.016;updatePlayer(0.016);update3D(0.016);}
const P=G.player,g=G.scene.g;
const clear=(x,y)=>{for(let a=0;a<8;a++){const ang=a*Math.PI/4;
  for(let r=0.6;r<=3.0;r+=0.6)if(solidT(getT(g,Math.floor(x+Math.cos(ang)*r),Math.floor(y+Math.sin(ang)*r))))return false;}return true;};
let gx0=-1,gy0=-1;
for(let y=2;y<G.scene.h-2&&gx0<0;y++)for(let x=2;x<G.scene.w-2;x++)if(clear(x+0.5,y+0.5)){gx0=x+0.5;gy0=y+0.5;break;}
console.log('open ground',gx0,gy0,'solid?',solidT(getT(g,Math.floor(gx0),Math.floor(gy0))));
function probe(aim,keys){
  IN.aim=aim;IN.lookX=IN.lookY=0;IN.movedByMouse=true;
  P.x=gx0;P.y=gy0;P.hidden=false;P.sta=100;P.injured=0;P.crouchLock=false;
  IN.aim=aim;
  const sx=P.x,sy=P.y;
  IN.keys={};keys.forEach(k=>IN.keys[k]=true);
  for(let i=0;i<30;i++){updatePlayer(0.05);if(i===0)console.log('   frame0 aim',IN.aim.toFixed(3),'dx',(P.x-sx).toFixed(4),'dy',(P.y-sy).toFixed(4));}
  IN.keys={};
  return {dx:P.x-sx,dy:P.y-sy};
}
console.log('EAST W',JSON.stringify(probe(0,['KeyW'])));
console.log('NORTH W',JSON.stringify(probe(-Math.PI/2,['KeyW'])));
console.log('EAST D',JSON.stringify(probe(0,['KeyD'])));
