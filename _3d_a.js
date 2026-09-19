/* =====================================================================
   3D ENGINE  (Three.js r160, vendored locally — no CDN at runtime)
   The tile grid stays the single source of truth: collision, AI,
   pathfinding, anomalies and story are unchanged. Only the
   presentation layer becomes real 3D.
   ===================================================================== */
const E3={
  ok:false, renderer:null, scene:null, camera:null, world:null,
  sprites:[], poolLights:[], flash:null, flashTarget:null,
  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots',
  builtFor:null, waterMat:null, wheel:null, wheelGondolas:[],
  soldierTorch:null, charRig:null, disposables:[], frame:0
};
G.mode3d=false;

/* ---------------- procedural textures ---------------- */
function texCanvas(size,fn){
  const c=document.createElement('canvas');c.width=c.height=size;
  fn(c.getContext('2d'),size);return c;
}
function speck(x,size,n,cols,rmax){
  for(let i=0;i<n;i++){
    x.fillStyle=cols[(Math.random()*cols.length)|0];
    const r=Math.random()*(rmax||2)+0.4;
    x.globalAlpha=0.15+Math.random()*0.5;
    x.beginPath();x.arc(Math.random()*size,Math.random()*size,r,0,TAU);x.fill();
  }
  x.globalAlpha=1;
}
function cracks(x,size,n,col){
  x.strokeStyle=col;x.lineWidth=1;
  for(let i=0;i<n;i++){
    let px=Math.random()*size,py=Math.random()*size;
    x.beginPath();x.moveTo(px,py);
    for(let k=0;k<5;k++){px+=(Math.random()-0.5)*26;py+=(Math.random()-0.5)*26;x.lineTo(px,py);}
    x.globalAlpha=0.25+Math.random()*0.4;x.stroke();
  }
  x.globalAlpha=1;
}
const TEXDEF={
  concrete:(x,s)=>{x.fillStyle='#7d8184';x.fillRect(0,0,s,s);
    speck(x,s,900,['#6b6f72','#8d9194','#5f6365','#9a9ea0'],2.2);cracks(x,s,7,'#4e5255');
    x.fillStyle='rgba(0,0,0,.16)';x.fillRect(0,s-3,s,3);
    x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,0,s,2);},
  concreteDark:(x,s)=>{x.fillStyle='#585d61';x.fillRect(0,0,s,s);
    speck(x,s,800,['#4a4e52','#666b6e','#3f4346'],2.2);cracks(x,s,9,'#34383b');
    x.fillStyle='rgba(90,60,40,.10)';x.fillRect(0,s*0.6,s,s*0.4);},
  plaster:(x,s)=>{x.fillStyle='#8b8779';x.fillRect(0,0,s,s);
    speck(x,s,700,['#7d796c','#989486','#6e6a5e'],2);cracks(x,s,5,'#5d5a50');
    x.fillStyle='rgba(70,90,60,.10)';x.fillRect(0,s*0.7,s,s*0.3);},
  metal:(x,s)=>{x.fillStyle='#6a7175';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=8){x.fillStyle=i%16?'rgba(255,255,255,.045)':'rgba(0,0,0,.10)';x.fillRect(0,i,s,4);}
    speck(x,s,400,['#585f63','#7b8286'],1.6);
    x.fillStyle='rgba(120,70,40,.20)';x.fillRect(0,s*0.75,s,s*0.25);},
  wood:(x,s)=>{x.fillStyle='#6b563a';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=11){x.fillStyle='rgba(0,0,0,.16)';x.fillRect(0,i,s,2);
      x.fillStyle='rgba(255,235,200,.05)';x.fillRect(0,i+3,s,3);}
    speck(x,s,300,['#5b4830','#7a6444'],1.8);},
  woodDark:(x,s)=>{x.fillStyle='#4b3c28';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=9){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,i,s,2);}
    speck(x,s,260,['#3e3121','#584630'],1.6);},
  ceramic:(x,s)=>{x.fillStyle='#8d9492';x.fillRect(0,0,s,s);
    x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;
    for(let i=0;i<=s;i+=s/4){x.beginPath();x.moveTo(i,0);x.lineTo(i,s);x.moveTo(0,i);x.lineTo(s,i);x.stroke();}
    speck(x,s,260,['#7d8482','#9ba2a0'],1.4);},
  lab:(x,s)=>{x.fillStyle='#9aa3a6';x.fillRect(0,0,s,s);
    x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=2;x.strokeRect(1,1,s-2,s-2);
    speck(x,s,200,['#8b9497','#a8b1b4'],1.2);},
  dirt:(x,s)=>{x.fillStyle='#5b5142';x.fillRect(0,0,s,s);
    speck(x,s,1200,['#4c4335','#6a5f4d','#3f382c','#776b56'],2.6);cracks(x,s,4,'#3a342a');},
  grass:(x,s)=>{x.fillStyle='#4a5636';x.fillRect(0,0,s,s);
    speck(x,s,1400,['#3f4a2e','#57643f','#354025','#63704a','#4d5a37'],2.2);
    x.strokeStyle='rgba(120,140,80,.18)';x.lineWidth=1;
    for(let i=0;i<90;i++){const px=Math.random()*s,py=Math.random()*s;
      x.beginPath();x.moveTo(px,py);x.lineTo(px+(Math.random()-0.5)*3,py-4-Math.random()*4);x.stroke();}},
  asphalt:(x,s)=>{x.fillStyle='#3c3f42';x.fillRect(0,0,s,s);
    speck(x,s,1100,['#33363a','#474b4e','#2b2e31'],1.8);cracks(x,s,10,'#26292c');},
  rubble:(x,s)=>{x.fillStyle='#57534c';x.fillRect(0,0,s,s);
    for(let i=0;i<70;i++){x.fillStyle=['#6b665e','#454139','#7d776c','#3a3730'][(Math.random()*4)|0];
      const w=3+Math.random()*9;
      x.save();x.translate(Math.random()*s,Math.random()*s);x.rotate(Math.random()*3);
      x.fillRect(-w/2,-w/3,w,w*0.66);x.restore();}
    speck(x,s,500,['#4a463e','#635e55'],1.6);},
  snow:(x,s)=>{x.fillStyle='#a9b2b6';x.fillRect(0,0,s,s);speck(x,s,700,['#c3cbce','#98a1a5','#d5dbdd'],2);},
  roof:(x,s)=>{x.fillStyle='#4a4e51';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=16){x.fillStyle='rgba(0,0,0,.20)';x.fillRect(0,i,s,3);}
    speck(x,s,600,['#414548','#565a5d'],2);
    x.fillStyle='rgba(90,110,80,.14)';
    for(let i=0;i<14;i++)x.fillRect(Math.random()*s,Math.random()*s,6+Math.random()*10,4+Math.random()*8);},
  door:(x,s)=>{x.fillStyle='#5d4a30';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=9){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,i,s,2);}
    x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=3;
    x.strokeRect(6,6,s-12,s*0.42);x.strokeRect(6,s*0.55,s-12,s*0.38);
    x.fillStyle='#b09a63';x.beginPath();x.arc(s-18,s*0.52,3.4,0,TAU);x.fill();},
  doorLock:(x,s)=>{x.fillStyle='#4b3b28';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=9){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,i,s,2);}
    x.fillStyle='#7b3a30';x.fillRect(s*0.3,s*0.44,s*0.4,s*0.14);},
  glass:(x,s)=>{x.fillStyle='#2c3b40';x.fillRect(0,0,s,s);
    x.strokeStyle='#1d272a';x.lineWidth=4;x.strokeRect(2,2,s-4,s-4);
    x.beginPath();x.moveTo(s/2,2);x.lineTo(s/2,s-2);x.moveTo(2,s/2);x.lineTo(s-2,s/2);x.stroke();
    x.fillStyle='rgba(160,200,210,.10)';x.fillRect(6,6,s*0.3,s*0.3);},
  water:(x,s)=>{x.fillStyle='#1d2f31';x.fillRect(0,0,s,s);
    for(let i=0;i<26;i++){x.strokeStyle='rgba(150,200,205,'+(0.04+Math.random()*0.08)+')';
      x.lineWidth=1+Math.random()*2;x.beginPath();
      const y=Math.random()*s;x.moveTo(0,y);x.bezierCurveTo(s*0.3,y-6,s*0.6,y+6,s,y);x.stroke();}},
  bark:(x,s)=>{x.fillStyle='#4a3d2c';x.fillRect(0,0,s,s);
    for(let i=0;i<s;i+=7){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(i,0,2,s);}
    speck(x,s,400,['#3d3224','#574833'],1.6);},
  machine:(x,s)=>{x.fillStyle='#5d666a';x.fillRect(0,0,s,s);
    x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2;x.strokeRect(3,3,s-6,s-6);
    x.fillStyle='rgba(0,0,0,.18)';x.fillRect(8,8,s-16,10);
    speck(x,s,300,['#4e565a','#6d767a'],1.6);},
  /* billboard sheets (alpha) */
  treeA:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#3a2f22';x.fillRect(s*0.45,s*0.52,s*0.10,s*0.48);
    const blobs=[[0.5,0.30,0.30],[0.33,0.42,0.22],[0.68,0.42,0.21],[0.5,0.52,0.24],[0.40,0.24,0.16],[0.62,0.26,0.15]];
    blobs.forEach((b,i)=>{
      x.fillStyle=i%2?'#2b361f':'#333f25';
      x.beginPath();x.arc(b[0]*s,b[1]*s,b[2]*s,0,TAU);x.fill();});
    x.fillStyle='rgba(120,150,90,.12)';
    x.beginPath();x.arc(s*0.44,s*0.24,s*0.16,0,TAU);x.fill();},
  treeDead:(x,s)=>{x.clearRect(0,0,s,s);
    x.strokeStyle='#4a3a2c';x.lineWidth=s*0.055;x.lineCap='round';
    x.beginPath();x.moveTo(s*0.5,s);x.lineTo(s*0.47,s*0.34);x.stroke();
    x.lineWidth=s*0.03;
    const br=[[0.47,0.55,0.24,0.36],[0.48,0.46,0.74,0.30],[0.47,0.38,0.30,0.20],[0.47,0.34,0.62,0.16]];
    br.forEach(b=>{x.beginPath();x.moveTo(b[0]*s,b[1]*s);x.lineTo(b[2]*s,b[3]*s);x.stroke();});
    x.fillStyle='rgba(150,80,40,.10)';x.beginPath();x.arc(s*0.5,s*0.3,s*0.26,0,TAU);x.fill();},
  bush:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#39452b';x.beginPath();x.ellipse(s*0.5,s*0.66,s*0.40,s*0.26,0,0,TAU);x.fill();
    x.fillStyle='#465433';x.beginPath();x.ellipse(s*0.38,s*0.60,s*0.22,s*0.16,0,0,TAU);x.fill();
    x.strokeStyle='rgba(120,140,80,.35)';x.lineWidth=1.4;
    for(let i=0;i<16;i++){const px=s*(0.2+Math.random()*0.6);
      x.beginPath();x.moveTo(px,s*0.7);x.lineTo(px+(Math.random()-0.5)*8,s*(0.36+Math.random()*0.2));x.stroke();}},
  car:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#3f3a30';x.fillRect(s*0.06,s*0.52,s*0.88,s*0.26);
    x.fillStyle='#4a4437';x.fillRect(s*0.24,s*0.32,s*0.5,s*0.22);
    x.fillStyle='rgba(140,170,180,.22)';x.fillRect(s*0.27,s*0.35,s*0.2,s*0.15);x.fillRect(s*0.51,s*0.35,s*0.2,s*0.15);
    x.fillStyle='#15161a';x.beginPath();x.arc(s*0.25,s*0.80,s*0.10,0,TAU);x.arc(s*0.75,s*0.80,s*0.10,0,TAU);x.fill();
    x.fillStyle='rgba(120,70,40,.30)';x.fillRect(s*0.06,s*0.66,s*0.88,s*0.06);},
  bus:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#4d4a35';x.fillRect(s*0.04,s*0.28,s*0.92,s*0.50);
    x.fillStyle='rgba(150,180,190,.16)';
    for(let i=0;i<5;i++)x.fillRect(s*(0.09+i*0.17),s*0.34,s*0.12,s*0.16);
    x.fillStyle='#15161a';x.beginPath();x.arc(s*0.22,s*0.82,s*0.09,0,TAU);x.arc(s*0.78,s*0.82,s*0.09,0,TAU);x.fill();
    x.fillStyle='rgba(0,0,0,.35)';x.fillRect(s*0.04,s*0.62,s*0.92,s*0.04);},
  lamp:(x,s)=>{x.clearRect(0,0,s,s);
    x.strokeStyle='#3d4348';x.lineWidth=s*0.035;x.lineCap='round';
    x.beginPath();x.moveTo(s*0.5,s);x.lineTo(s*0.5,s*0.14);x.stroke();
    x.lineWidth=s*0.025;x.beginPath();x.moveTo(s*0.5,s*0.14);x.lineTo(s*0.66,s*0.10);x.stroke();
    x.fillStyle='#6a6e63';x.fillRect(s*0.60,s*0.08,s*0.14,s*0.06);},
  bench:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#4b3c2c';x.fillRect(s*0.1,s*0.44,s*0.8,s*0.10);
    x.fillRect(s*0.1,s*0.24,s*0.8,s*0.08);
    x.fillStyle='#2c2620';x.fillRect(s*0.16,s*0.54,s*0.06,s*0.30);x.fillRect(s*0.78,s*0.54,s*0.06,s*0.30);},
  fire:(x,s)=>{x.clearRect(0,0,s,s);
    const g=x.createRadialGradient(s*0.5,s*0.62,2,s*0.5,s*0.62,s*0.46);
    g.addColorStop(0,'rgba(255,240,190,.95)');g.addColorStop(0.35,'rgba(255,150,40,.65)');
    g.addColorStop(1,'rgba(255,80,10,0)');
    x.fillStyle=g;x.beginPath();x.arc(s*0.5,s*0.62,s*0.46,0,TAU);x.fill();
    x.fillStyle='rgba(255,220,150,.7)';
    x.beginPath();x.moveTo(s*0.5,s*0.16);x.lineTo(s*0.62,s*0.62);x.lineTo(s*0.38,s*0.62);x.closePath();x.fill();},
  sign:(x,s)=>{x.clearRect(0,0,s,s);
    x.strokeStyle='#4a5054';x.lineWidth=s*0.03;x.beginPath();x.moveTo(s*0.5,s);x.lineTo(s*0.5,s*0.42);x.stroke();
    x.fillStyle='rgba(18,24,26,.95)';x.fillRect(s*0.06,s*0.14,s*0.88,s*0.30);
    x.strokeStyle='#5d6a70';x.lineWidth=1.5;x.strokeRect(s*0.06,s*0.14,s*0.88,s*0.30);},
  slide:(x,s)=>{x.clearRect(0,0,s,s);
    x.strokeStyle='#6a6a52';x.lineWidth=s*0.05;x.lineCap='round';
    x.beginPath();x.moveTo(s*0.16,s*0.9);x.lineTo(s*0.3,s*0.24);x.lineTo(s*0.7,s*0.24);x.lineTo(s*0.86,s*0.9);x.stroke();
    x.strokeStyle='#7d6a45';x.lineWidth=s*0.07;
    x.beginPath();x.moveTo(s*0.32,s*0.28);x.lineTo(s*0.8,s*0.86);x.stroke();},
  statue:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#4d5154';x.fillRect(s*0.34,s*0.3,s*0.32,s*0.62);
    x.fillStyle='#5a5f63';x.beginPath();x.arc(s*0.5,s*0.22,s*0.13,0,TAU);x.fill();
    x.fillStyle='#3f4346';x.fillRect(s*0.24,s*0.88,s*0.52,s*0.10);},
  wreck:(x,s)=>{x.clearRect(0,0,s,s);
    x.save();x.translate(s*0.5,s*0.62);x.rotate(-0.3);
    x.fillStyle='#2f3236';x.beginPath();
    x.moveTo(-s*0.46,-s*0.06);x.lineTo(s*0.36,-s*0.16);x.lineTo(s*0.42,s*0.06);x.lineTo(-s*0.42,s*0.16);x.closePath();x.fill();
    x.fillStyle='#3b3f44';x.beginPath();
    x.moveTo(-s*0.04,-s*0.14);x.lineTo(s*0.10,-s*0.46);x.lineTo(s*0.22,-s*0.44);x.lineTo(s*0.14,-s*0.12);x.closePath();x.fill();
    x.fillStyle='#24272a';x.fillRect(-s*0.36,-s*0.02,s*0.3,s*0.1);
    x.restore();},
  debris:(x,s)=>{x.clearRect(0,0,s,s);
    for(let i=0;i<9;i++){x.fillStyle=['#5b564d','#413d36','#6b665c'][(Math.random()*3)|0];
      x.save();x.translate(Math.random()*s,Math.random()*s);x.rotate(Math.random()*3);
      x.fillRect(-4,-2,8,4);x.restore();}},
  puddle:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='rgba(70,100,105,.55)';x.beginPath();x.ellipse(s*0.5,s*0.5,s*0.44,s*0.3,0,0,TAU);x.fill();
    x.fillStyle='rgba(170,210,215,.14)';x.beginPath();x.ellipse(s*0.42,s*0.44,s*0.18,s*0.09,0,0,TAU);x.fill();},
  blood:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='rgba(64,20,18,.72)';x.beginPath();x.ellipse(s*0.46,s*0.52,s*0.38,s*0.26,0,0,TAU);x.fill();
    x.fillStyle='rgba(40,12,12,.6)';x.beginPath();x.ellipse(s*0.72,s*0.66,s*0.16,s*0.1,0,0,TAU);x.fill();},
  paper:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='rgba(214,208,188,.8)';x.save();x.translate(s*0.5,s*0.5);x.rotate(0.4);
    x.fillRect(-s*0.16,-s*0.11,s*0.32,s*0.22);x.restore();},
  snowpile:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='rgba(226,234,238,.5)';x.beginPath();x.ellipse(s*0.5,s*0.6,s*0.4,s*0.2,0,0,TAU);x.fill();},
  grass2:(x,s)=>{x.clearRect(0,0,s,s);
    x.strokeStyle='rgba(110,130,74,.75)';x.lineWidth=2;
    for(let i=0;i<22;i++){const px=s*(0.15+Math.random()*0.7);
      x.beginPath();x.moveTo(px,s*0.86);x.lineTo(px+(Math.random()-0.5)*10,s*(0.3+Math.random()*0.3));x.stroke();}},
  crack:(x,s)=>{x.clearRect(0,0,s,s);cracks(x,s,6,'rgba(0,0,0,.5)');},
  silhouette:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#07080a';
    x.beginPath();x.ellipse(s*0.5,s*0.62,s*0.19,s*0.36,0,0,TAU);x.fill();
    x.beginPath();x.arc(s*0.52,s*0.20,s*0.11,0,TAU);x.fill();
    x.strokeStyle='#07080a';x.lineWidth=s*0.07;x.lineCap='round';
    x.beginPath();x.moveTo(s*0.36,s*0.44);x.lineTo(s*0.24,s*0.78);
    x.moveTo(s*0.66,s*0.44);x.lineTo(s*0.78,s*0.78);
    x.moveTo(s*0.44,s*0.9);x.lineTo(s*0.42,s);x.moveTo(s*0.58,s*0.9);x.lineTo(s*0.6,s);x.stroke();},
  silhouetteTall:(x,s)=>{x.clearRect(0,0,s,s);
    x.fillStyle='#050607';
    x.beginPath();x.ellipse(s*0.5,s*0.58,s*0.16,s*0.42,0,0,TAU);x.fill();
    x.beginPath();x.arc(s*0.52,s*0.13,s*0.10,0,TAU);x.fill();
    x.strokeStyle='#050607';x.lineWidth=s*0.06;x.lineCap='round';
    x.beginPath();x.moveTo(s*0.38,s*0.36);x.lineTo(s*0.22,s*0.72);
    x.moveTo(s*0.66,s*0.36);x.lineTo(s*0.82,s*0.72);
    x.moveTo(s*0.45,s*0.92);x.lineTo(s*0.43,s);x.moveTo(s*0.57,s*0.92);x.lineTo(s*0.59,s);x.stroke();
    x.fillStyle='rgba(255,240,220,.9)';
    x.beginPath();x.arc(s*0.485,s*0.125,2.2,0,TAU);x.arc(s*0.555,s*0.125,2.2,0,TAU);x.fill();},
};
const TEXCACHE={};
function getTex(key,size){
  const k=key+'@'+(size||128);
  if(TEXCACHE[k])return TEXCACHE[k];
  const c=texCanvas(size||128,TEXDEF[key]||TEXDEF.concrete);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;
  TEXCACHE[k]=t;return t;
}
function getTexAlpha(key,size){
  const k='a_'+key+'@'+(size||128);
  if(TEXCACHE[k])return TEXCACHE[k];
  const c=texCanvas(size||128,TEXDEF[key]||TEXDEF.treeA);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  TEXCACHE[k]=t;return t;
}
const MATDEF={
  concrete:{tex:'concrete',col:'#b9bcc0'},
  concreteDark:{tex:'concreteDark',col:'#a8acb0'},
  plaster:{tex:'plaster',col:'#c3bfb2'},
  metal:{tex:'metal',col:'#aeb6ba'},
  wood:{tex:'wood',col:'#c0a67e'},
  woodDark:{tex:'woodDark',col:'#b39a78'},
  ceramic:{tex:'ceramic',col:'#c2c8c6'},
  lab:{tex:'lab',col:'#c6ced1'},
  dirt:{tex:'dirt',col:'#a99b83'},
  grass:{tex:'grass',col:'#9fae83'},
  asphalt:{tex:'asphalt',col:'#9ea2a6'},
  rubble:{tex:'rubble',col:'#a49e93'},
  snow:{tex:'snow',col:'#dfe5e8'},
  roof:{tex:'roof',col:'#9aa0a4'},
  door:{tex:'door',col:'#c9bda6'},
  doorLock:{tex:'doorLock',col:'#bfb2a0'},
  glass:{tex:'glass',col:'#8fa8ae'},
  bark:{tex:'bark',col:'#a08a68'},
  machine:{tex:'machine',col:'#aeb6ba'},
};
const MATS={};
function getMat(key){
  if(MATS[key]){MATS[key].vertexColors=true;return MATS[key];}
  const d=MATDEF[key]||MATDEF.concrete;
  const m=new THREE.MeshLambertMaterial({map:getTex(d.tex),color:new THREE.Color(d.col),vertexColors:true});
  MATS[key]=m;return m;
}
const WALLH=3.2, ROOFH=5.6;
function tileInfo(t){
  switch(t){
    case TL.WALL:return {mat:'concrete',h:WALLH};
    case TL.ROOF:return {mat:'roof',h:ROOFH,roof:true};
    case TL.CELL:return {mat:'concreteDark',h:WALLH};
    case TL.GLASS:return {mat:'glass',h:WALLH};
    case TL.DOOR:return {mat:'door',h:WALLH,door:true};
    case TL.LOCKDOOR:return {mat:'doorLock',h:WALLH,door:true};
    case TL.FENCE:return {mat:'metal',h:1.7,fence:true};
    default:return null;
  }
}
function floorMat(t){
  switch(t){
    case TL.F_CONC:return 'concreteDark';
    case TL.F_WOOD:return 'wood';
    case TL.F_TILE:return 'ceramic';
    case TL.F_DIRT:return 'dirt';
    case TL.F_LAB:return 'lab';
    case TL.F_METAL:return 'metal';
    case TL.ROAD:return 'asphalt';
    case TL.GRASS:return 'grass';
    case TL.SNOW:return 'snow';
    case TL.RUB:return 'rubble';
    case TL.DEAD:return 'dirt';
    default:return null;
  }
}

/* ---------------- geometry buckets ---------------- */
function Buckets(){this.b={};this.order=[];}
Buckets.prototype.get=function(k){
  if(!this.b[k]){this.b[k]={p:[],n:[],u:[],c:[]};this.order.push(k);}
  return this.b[k];
};
Buckets.prototype.quad=function(k,a,b,c,d,col){
  const B=this.get(k);
  B.p.push(a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2], d[0],d[1],d[2]);
  const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
  let nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];
  const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;
  for(let i=0;i<4;i++)B.n.push(nx,ny,nz);
  const w=Math.max(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),0.001);
  const h=Math.max(Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2]),0.001);
  B.u.push(0,0, w,0, w,h, 0,h);
  for(let i=0;i<4;i++)B.c.push(col,col,col);
};
Buckets.prototype.mesh=function(){
  const keys=this.order.filter(k=>this.b[k].p.length);
  if(!keys.length)return null;
  const g=new THREE.BufferGeometry();
  const P=[],N=[],U=[],C=[],idx=[];let base=0;const groups=[];
  keys.forEach((k,mi)=>{
    const B=this.b[k],n=B.p.length/3;
    for(let i=0;i<B.p.length;i++)P.push(B.p[i]);
    for(let i=0;i<B.n.length;i++)N.push(B.n[i]);
    for(let i=0;i<B.u.length;i++)U.push(B.u[i]);
    for(let i=0;i<B.c.length;i++)C.push(B.c[i]);
    const start=idx.length;
    for(let q=0;q<n;q+=4)idx.push(base+q,base+q+1,base+q+2, base+q,base+q+2,base+q+3);
    groups.push({start:start,count:idx.length-start,mi:mi});
    base+=n;
  });
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setIndex(idx);
  groups.forEach(gr=>g.addGroup(gr.start,gr.count,gr.mi));
  g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,keys.map(k=>getMat(k)));
  mesh.receiveShadow=true;mesh.castShadow=true;
  mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  return mesh;
};

/* ---------------- world geometry from tiles ---------------- */
function buildWorldMesh(s){
  const B=new Buckets(),g=s.g,W=s.w,H=s.h;
  const tAt=(x,y)=>(x<0||y<0||x>=W||y>=H)?TL.WALL:g.d[y*W+x];
  const openAt=(x,y)=>{
    if(x<0||y<0||x>=W||y>=H)return !s.indoor;
    return !solidT(g.d[y*W+x]);
  };
  const infAt=(x,y)=>tileInfo(tAt(x,y));
  const waterQ=[];
  /* floors (merged runs) */
  for(let y=0;y<H;y++){
    let x=0;
    while(x<W){
      const t=tAt(x,y),fm=floorMat(t);
      if(!fm){if(t===TL.WATER)waterQ.push([x,y]);x++;continue;}
      const brightOf=(xx)=>{
        let ao=1;
        if(!openAt(xx,y-1))ao-=0.13;
        if(!openAt(xx,y+1))ao-=0.13;
        if(!openAt(xx-1,y))ao-=0.10;
        if(!openAt(xx+1,y))ao-=0.10;
        return clamp((0.70+hash2(xx,y,7)*0.32)*ao,0.34,1.05);
      };
      const q=Math.round(brightOf(x)*7)/7;
      let x2=x+1;
      while(x2<W&&floorMat(tAt(x2,y))===fm&&Math.round(brightOf(x2)*7)/7===q)x2++;
      const w=x2-x;
      B.quad(fm,[x,0,y],[x+w,0,y],[x+w,0,y+1],[x,0,y+1],q);
      x=x2;
    }
  }
  /* walls */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=tAt(x,y),inf=tileInfo(t);
    if(!inf)continue;
    const h=inf.h,mat=inf.mat;
    if(inf.fence){
      const faces=[[0,1],[0,-1],[1,0],[-1,0]];
      for(const fd of faces){
        const dx=fd[0],dy=fd[1];
        if(!openAt(x+dx,y+dy))continue;
        for(let r=0;r<3;r++){
          const y0=0.22+r*0.55,y1=y0+0.13;
          if(dx===0&&dy===1)B.quad(mat,[x,y0,y+1],[x+1,y0,y+1],[x+1,y1,y+1],[x,y1,y+1],0.95);
          else if(dx===0&&dy===-1)B.quad(mat,[x+1,y0,y],[x,y0,y],[x,y1,y],[x+1,y1,y],0.95);
          else if(dx===1&&dy===0)B.quad(mat,[x+1,y0,y],[x+1,y0,y+1],[x+1,y1,y+1],[x+1,y1,y],0.95);
          else B.quad(mat,[x,y0,y+1],[x,y0,y],[x,y1,y],[x,y1,y+1],0.95);
        }
      }
      continue;
    }
    const sides=[
      {dx:0,dy:1,q:(a,b2)=>[[x,a,y+1],[x+1,a,y+1],[x+1,b2,y+1],[x,b2,y+1]],sh:0.95},
      {dx:0,dy:-1,q:(a,b2)=>[[x+1,a,y],[x,a,y],[x,b2,y],[x+1,b2,y]],sh:0.86},
      {dx:1,dy:0,q:(a,b2)=>[[x+1,a,y],[x+1,a,y+1],[x+1,b2,y+1],[x+1,b2,y]],sh:0.90},
      {dx:-1,dy:0,q:(a,b2)=>[[x,a,y+1],[x,a,y],[x,b2,y],[x,b2,y+1]],sh:0.80},
    ];
    for(const sd of sides){
      const nb=infAt(x+sd.dx,y+sd.dy);
      if(nb&&!openAt(x+sd.dx,y+sd.dy)){
        if(nb.h<h-0.01){
          const p=sd.q(nb.h,h);
          B.quad(mat,p[0],p[1],p[2],p[3],0.88);
        }
        continue;
      }
      if(openAt(x+sd.dx,y+sd.dy)){
        const p=sd.q(0,h);
        B.quad(mat,p[0],p[1],p[2],p[3],inf.door?1.0:sd.sh);
      }
    }
    if(!s.indoor){
      /* outdoor: cap blocks so buildings read as volumes */
      B.quad(inf.roof?'roof':'concrete',[x,h,y],[x+1,h,y],[x+1,h,y+1],[x,h,y+1],0.78);
    }else if(t===TL.WALL&&openAt(x,y+1)){
      /* indoor: ceiling seen from the room below */
      B.quad('plaster',[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[x,h,y],0.60);
    }
  }
  const out={opaque:B.mesh(),water:null};
  if(waterQ.length){
    const P=[],N=[],U=[],C=[],idx=[];let base=0;
    for(const wc of waterQ){
      P.push(wc[0],0.07,wc[1], wc[0]+1,0.07,wc[1], wc[0]+1,0.07,wc[1]+1, wc[0],0.07,wc[1]+1);
      for(let i=0;i<4;i++){N.push(0,1,0);C.push(1,1,1);}
      U.push(0,0,1,0,1,1,0,1);
      idx.push(base,base+1,base+2,base,base+2,base+3);base+=4;
    }
    const wg=new THREE.BufferGeometry();
    wg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    wg.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    wg.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
    wg.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    wg.setIndex(idx);
    if(!E3.waterMat)E3.waterMat=new THREE.MeshLambertMaterial({map:getTex('water'),
      transparent:true,opacity:0.88,color:new THREE.Color('#8fb6ba'),depthWrite:false});
    out.water=new THREE.Mesh(wg,E3.waterMat);
    out.water.matrixAutoUpdate=false;out.water.updateMatrix();
  }
  return out;
}
