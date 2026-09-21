boot();startGame(true);
enterScene('outdoor',{x:25.5,y:38.5},{silent:true});
DLG.open=false;G.paused=false;
const P=G.player;
P.x=15.5;P.y=15.5;P.hidden=false;
console.log('tile at 15,15 solid?',solidT(getT(G.scene.g,15,15)));
IN.aim=0;IN.lookX=IN.lookY=0;IN.movedByMouse=true;IN.keys={KeyW:true};
const sx=P.x,sy=P.y;
updatePlayer(0.05);
console.log('aim0 W one frame -> dx',(P.x-sx).toFixed(4),'dy',(P.y-sy).toFixed(4));
IN.keys={};
P.x=15.5;P.y=15.5;IN.aim=-Math.PI/2;IN.keys={KeyW:true};
const ax=P.x,ay=P.y;
updatePlayer(0.05);
console.log('aim-pi/2 W one frame -> dx',(P.x-ax).toFixed(4),'dy',(P.y-ay).toFixed(4));
IN.keys={};
/* replicate the formula by hand */
for(const a of [0,-Math.PI/2,Math.PI,Math.PI/2]){
  let ix=0,iy=-1;const ca=Math.cos(a),sa=Math.sin(a);const qx=ix,qy=iy;
  ix=qx*ca-qy*sa;iy=qx*sa+qy*ca;
  console.log('formula aim',a.toFixed(2),'-> ix',ix.toFixed(3),'iy',iy.toFixed(3));
}
