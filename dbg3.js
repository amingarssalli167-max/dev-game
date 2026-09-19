boot();startGame(true);
DLG.open=false;G.paused=false;
for(let i=0;i<5;i++){G.time+=0.016;update3D(0.016);}
console.log('view',E3.view,'sens',IN.sens,'pitchT',E3.pitchT);
E3.pitchT=0;
IN.lookX=0;IN.lookY=-260;
console.log('before update3D lookY',IN.lookY);
update3D(0.016);
console.log('after one update3D pitchT',E3.pitchT,'lookY',IN.lookY);
console.log('manual formula:', 0-(-260*0.0019*1));
