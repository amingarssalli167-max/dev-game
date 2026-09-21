/* ---------------- 3D props / billboards ---------------- */
const SPR3={
  tree:{k:'bb',t:'treeA',w:3.5,h:4.9},
  dead:{k:'bb',t:'treeDead',w:3.1,h:4.5},
  bush:{k:'bb',t:'bush',w:1.35,h:0.95},
  grass2:{k:'bb',t:'grass2',w:1.0,h:0.6},
  car:{k:'bb',t:'car',w:3.9,h:1.75},
  bus:{k:'bb',t:'bus',w:7.4,h:3.1},
  lamp:{k:'bb',t:'lamp',w:1.5,h:5.4},
  bench:{k:'bb',t:'bench',w:1.9,h:1.05},
  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:9,d:8}},
  sign:{k:'bb',t:'sign',w:2.3,h:1.9,text:true},
  slide:{k:'bb',t:'slide',w:2.4,h:2.1},
  statue:{k:'bb',t:'statue',w:1.5,h:2.9},
  wreck:{k:'bb',t:'wreck',w:7.5,h:3.4},
  debris:{k:'flat',t:'debris',w:1.5,h:1.5},
  puddle:{k:'flat',t:'puddle',w:1.9,h:1.9},
  blood:{k:'flat',t:'blood',w:1.8,h:1.8},
  paper:{k:'flat',t:'paper',w:0.55,h:0.55},
  snowpile:{k:'flat',t:'snowpile',w:1.6,h:1.6},
  crack:{k:'flat',t:'crack',w:1.4,h:1.4},
  wheel:{k:'wheel'},
  sofa:{k:'box',w:2.0,h:0.85,d:0.9,c:0x4a4238,back:{h:0.62,c:0x574c3f}},
  tv:{k:'box',w:0.66,h:0.6,d:0.55,c:0x2b2f31,screen:{c:0x9fc4cc,e:0.16}},
  table:{k:'box',w:1.4,h:0.74,d:0.85,c:0x57482f,top:0.07},
  desk:{k:'box',w:1.2,h:0.74,d:0.65,c:0x57482f,top:0.07},
  chair:{k:'box',w:0.5,h:0.46,d:0.5,c:0x4a3d29,back:{h:0.5,c:0x4a3d29}},
  bed:{k:'box',w:2.0,h:0.55,d:1.0,c:0x4e4a42,top:{c:0x8b8578,h:0.12}},
  cot:{k:'box',w:1.2,h:0.42,d:0.62,c:0x5a5347,top:{c:0x7d7566,h:0.08}},
  wardrobe:{k:'box',w:1.15,h:2.15,d:0.6,c:0x4b3f2e},
  locker:{k:'box',w:0.85,h:1.9,d:0.5,c:0x3f4a44},
  cabinet:{k:'box',w:0.9,h:1.75,d:0.5,c:0x4b3f2e},
  shelf:{k:'box',w:1.0,h:1.8,d:0.42,c:0x54452f},
  archive:{k:'box',w:1.0,h:1.95,d:0.62,c:0x4a4f52},
  drawer:{k:'box',w:0.8,h:0.72,d:0.5,c:0x4f4331},
  stove:{k:'box',w:0.9,h:0.9,d:0.7,c:0x5e6467},
  sink:{k:'box',w:0.8,h:0.85,d:0.55,c:0x6d7477},
  toilet:{k:'box',w:0.55,h:0.75,d:0.65,c:0x7d8487},
  tub:{k:'box',w:1.7,h:0.6,d:0.8,c:0x6d7477},
  board:{k:'box',w:2.4,h:1.2,d:0.09,c:0x2c3a30,y:1.45},
  piano:{k:'box',w:1.6,h:1.35,d:0.7,c:0x2f2a24},
  toybox:{k:'box',w:1.0,h:0.6,d:0.7,c:0x5d4a3a},
  crate:{k:'box',w:0.85,h:0.85,d:0.85,c:0x4c4234},
  box:{k:'box',w:0.55,h:0.4,d:0.45,c:0x5a4c39},
  gurney:{k:'box',w:1.9,h:0.75,d:0.75,c:0x585f62,top:{c:0x767d80,h:0.08}},
  operating:{k:'box',w:2.0,h:0.9,d:0.95,c:0x5a6164,lamp:{c:0xdff0f5,e:0.5}},
  boiler:{k:'box',w:2.2,h:2.5,d:1.7,c:0x3e4447,glow:{c:0xff7a2a,e:1.5}},
  transformer:{k:'box',w:1.6,h:2.1,d:1.3,c:0x41484c},
  panel:{k:'box',w:1.5,h:1.9,d:0.4,c:0x2f3538,screen:{c:0x8fd0a0,e:0.45}},
  monitor:{k:'box',w:0.62,h:0.55,d:0.55,c:0x2b3134,screen:{c:0x7fd8b0,e:0.5}},
  tank:{k:'box',w:1.1,h:2.1,d:1.1,c:0x4a6a66,tr:0.55},
  cellbed:{k:'box',w:1.9,h:0.5,d:0.9,c:0x4a4f52},
  tapeplayer:{k:'box',w:0.5,h:0.26,d:0.36,c:0x3f4447},
  radio:{k:'box',w:0.34,h:0.44,d:0.2,c:0x3a3f3c},
  plant:{k:'box',w:0.5,h:0.75,d:0.5,c:0x3f4a30},
  pipes:{k:'pipes'},
  bodybag:{k:'bag'},
  mirror:{k:'box',w:0.7,h:1.1,d:0.06,c:0x9fb6bc,y:1.4},
};
const MATCACHE={};
function solidMat(color,opts){
  opts=opts||{};
  const k=color+'|'+(opts.e||0)+'|'+(opts.tr||0);
  if(MATCACHE[k])return MATCACHE[k];
  const m=new THREE.MeshLambertMaterial({color:new THREE.Color(color)});
  if(opts.e)m.emissive=new THREE.Color(opts.e);
  if(opts.tr){m.transparent=true;m.opacity=opts.tr;}
  MATCACHE[k]=m;return m;
}
const BILLMAT={};
function billMat(texKey,add){
  const k=texKey+(add?'+':'');
  if(BILLMAT[k])return BILLMAT[k];
  const m=new THREE.MeshBasicMaterial({map:getTexAlpha(texKey,128),transparent:true,
    alphaTest:add?0.01:0.42,side:THREE.DoubleSide,depthWrite:!add,fog:true});
  if(add)m.blending=THREE.AdditiveBlending;
  BILLMAT[k]=m;return m;
}
const SIGNTEX={};
function signTex(text){
  const k=text||'?';
  if(SIGNTEX[k])return SIGNTEX[k];
  const c=texCanvas(256,(x,s)=>{
    x.clearRect(0,0,s,s);
    x.strokeStyle='#4a5054';x.lineWidth=6;
    x.beginPath();x.moveTo(s*0.5,s);x.lineTo(s*0.5,s*0.44);x.stroke();
    x.fillStyle='rgba(16,22,24,.96)';x.fillRect(s*0.05,s*0.10,s*0.90,s*0.34);
    x.strokeStyle='#66757c';x.lineWidth=3;x.strokeRect(s*0.05,s*0.10,s*0.90,s*0.34);
    x.fillStyle='#c3d0d6';x.font='22px Tahoma,sans-serif';x.textAlign='center';x.direction='rtl';
    x.fillText(k,s*0.5,s*0.32, s*0.82);
  });
  const t=new THREE.CanvasTexture(c);SIGNTEX[k]=t;return t;
}
function makeBoxProp(d){
  const g=new THREE.Group();
  const w=d.w,h=d.h,dp=d.d,y0=d.y||0;
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,dp),solidMat(d.c||0x555a5d,{tr:d.tr}));
  body.position.y=y0+h/2;body.castShadow=true;body.receiveShadow=true;
  g.add(body);
  const add=(mw,mh,md,mat,ox,oy,oz)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(mw,mh,md),mat);
    m.position.set(ox,oy,oz);m.castShadow=true;g.add(m);return m;
  };
  if(d.top){
    const t=typeof d.top==='object'?d.top:{c:(d.c||0x555a5d)+0x101010,h:0.08};
    add(w*1.02,t.h,dp*1.02,solidMat(t.c),0,y0+h+t.h/2,0);
  }
  if(d.back)add(w*0.98,d.back.h,dp*0.28,solidMat(d.back.c||d.c),0,y0+h+d.back.h/2,-dp*0.36);
  if(d.screen)add(w*0.72,h*0.5,0.03,solidMat(d.screen.c,{e:d.screen.e||0.3}),0,y0+h*0.6,dp/2+0.02);
  if(d.glow)add(w*0.3,h*0.18,0.04,solidMat(d.glow.c,{e:d.glow.e||1}),0,y0+h*0.42,dp/2+0.02);
  if(d.lamp){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.0,6),solidMat(0x3a4043));
    p.position.set(0,y0+h+0.5,0);g.add(p);
    const head=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.1,10),solidMat(d.lamp.c,{e:d.lamp.e||0.4}));
    head.position.set(0,y0+h+1.0,0);g.add(head);
  }
  return g;
}
function makePipes(){
  const g=new THREE.Group();
  const m=solidMat(0x454c50);
  for(let i=0;i<2;i++){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,2.1,7),m);
    p.rotation.z=Math.PI/2;p.position.set(0,2.3-i*0.42,0);p.castShadow=true;g.add(p);
  }
  const v=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,1.5,7),m);
  v.position.set(0.5,1.6,0);v.castShadow=true;g.add(v);
  return g;
}
function makeBag(){
  const g=new THREE.Group();
  const m=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.28,1.2,4,8):new THREE.BoxGeometry(0.6,0.5,1.7),
    solidMat(0x4d5154));
  m.rotation.x=Math.PI/2;m.position.y=0.28;m.castShadow=true;m.receiveShadow=true;
  g.add(m);return g;
}
function makeWheel(sp){
  const g=new THREE.Group();
  const R=(sp.r||7)*0.92;
  const rim=new THREE.Group();
  const m=solidMat(0x6b7a70);
  const t1=new THREE.Mesh(new THREE.TorusGeometry(R,0.14,6,40),m);
  const t2=new THREE.Mesh(new THREE.TorusGeometry(R*0.86,0.08,5,32),m);
  rim.add(t1);rim.add(t2);
  for(let i=0;i<16;i++){
    const a=i*TAU/16;
    const sp2=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,R,4),solidMat(0x59655c));
    sp2.position.set(Math.cos(a)*R/2,Math.sin(a)*R/2,0);
    sp2.rotation.z=a+Math.PI/2;rim.add(sp2);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.85,1.05),solidMat(i%4===0?0x8a6a3a:0x5c6a63));
    cab.position.set(Math.cos(a)*R,Math.sin(a)*R,0);
    cab.castShadow=true;
    rim.add(cab);E3.wheelGondolas.push({o:cab,a:a});
  }
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.5,10),solidMat(0x4a544e));
  hub.rotation.x=Math.PI/2;rim.add(hub);
  g.add(rim);
  const legM=solidMat(0x4b544f);
  [-1,1].forEach(sx=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.28,Math.hypot(R,R*0.2),6),legM);
    leg.position.set(sx*R*0.42,R/2-0.2,0);
    leg.rotation.z=sx*0.42;leg.castShadow=true;g.add(leg);
  });
  rim.position.y=R+0.4;
  g.rotation.y=0;
  E3.wheel={rim:rim,R:R};
  return g;
}
function makeBillboard(d,sp){
  let mat;
  if(d.text){
    mat=new THREE.MeshBasicMaterial({map:signTex(sp.text||''),transparent:true,alphaTest:0.4,
      side:THREE.DoubleSide,depthWrite:false,fog:true});
    E3.disposables.push(mat);
  }else mat=billMat(d.t,d.add);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(d.w,d.h),mat);
  m.position.y=d.h/2-(d.k==='flat'?0.48:0);
  if(d.k==='flat'){m.rotation.x=-Math.PI/2;m.position.y=0.035;}
  m.userData.bb=(d.k==='bb');
  m.userData.add=!!d.add;
  if(d.light){
    const L=new THREE.PointLight(d.light.c,d.light.i,d.light.d,2);
    L.position.y=d.h*0.45;m.add(L);m.userData.light=L;m.userData.lightBase=d.light.i;
  }
  return m;
}

/* ---------------- characters ---------------- */
function rigHumanoid(opt){
  const g=new THREE.Group();
  const skin=solidMat(opt.skin||0x6d6357),cloth=solidMat(opt.cloth||0x3f4735),
        dark=solidMat(opt.dark||0x2b3129);
  const mk=(w,h,d,mat,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;
  };
  const sc=opt.scale||1;
  const legs=[mk(0.19*sc,0.86*sc,0.21*sc,dark,-0.13*sc,0.43*sc,0),
              mk(0.19*sc,0.86*sc,0.21*sc,dark, 0.13*sc,0.43*sc,0)];
  const torso=mk(0.56*sc,0.74*sc,0.34*sc,cloth,0,1.20*sc,0);
  const arms=[mk(0.15*sc,0.70*sc,0.17*sc,cloth,-0.36*sc,1.22*sc,0),
              mk(0.15*sc,0.70*sc,0.17*sc,cloth, 0.36*sc,1.22*sc,0)];
  const head=mk(0.30*sc,0.32*sc,0.30*sc,skin,0,1.75*sc,0);
  if(opt.hair)mk(0.33*sc,0.14*sc,0.33*sc,solidMat(opt.hair),0,1.90*sc,0);
  if(opt.helmet)mk(0.34*sc,0.16*sc,0.34*sc,solidMat(opt.helmet),0,1.90*sc,0);
  const eyes=[];
  if(opt.eyes){
    const em=solidMat(0xffffff,{e:opt.eyes});
    eyes.push(mk(0.05,0.05,0.02,em,-0.07*sc,1.77*sc,0.16*sc));
    eyes.push(mk(0.05,0.05,0.02,em, 0.07*sc,1.77*sc,0.16*sc));
  }
  let gun=null;
  if(opt.gun){gun=mk(0.07*sc,0.09*sc,0.85*sc,solidMat(0x1d211f),0.20*sc,1.24*sc,0.42*sc);}
  g.userData={legs,arms,torso,head,eyes,gun,sc};
  if(opt.hunch)g.userData.hunch=opt.hunch;
  return g;
}
function rigDog(){
  const g=new THREE.Group();
  const fur=solidMat(0x54432f),dark=solidMat(0x3d3123);
  const mk=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  const legs=[mk(0.1,0.42,0.1,dark,-0.17,0.21,-0.26),mk(0.1,0.42,0.1,dark,0.17,0.21,-0.26),
              mk(0.1,0.42,0.1,dark,-0.17,0.21,0.26),mk(0.1,0.42,0.1,dark,0.17,0.21,0.26)];
  mk(0.36,0.34,0.86,fur,0,0.60,0);
  const head=mk(0.30,0.28,0.34,fur,0,0.76,0.55);
  mk(0.16,0.12,0.2,fur,0,0.70,0.76);
  mk(0.07,0.13,0.05,dark,-0.1,0.92,0.5);mk(0.07,0.13,0.05,dark,0.1,0.92,0.5);
  const tail=mk(0.07,0.07,0.34,dark,0,0.74,-0.55);
  g.userData={legs,head,tail};
  return g;
}
function rigChild(){
  const g=rigHumanoid({scale:0.62,cloth:0x6d6a72,skin:0x8d8478,hair:0x2a2320});
  const aura=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7),
    new THREE.MeshBasicMaterial({map:getTexAlpha('fire',128),transparent:true,opacity:0.10,
      blending:THREE.AdditiveBlending,depthWrite:false,color:new THREE.Color(0x9fc8d2)}));
  aura.position.y=0.75;aura.userData.bb=true;g.add(aura);
  g.userData.aura=aura;
  return g;
}
function makeChar(e){
  if(e.type==='creature'){
    const g=rigHumanoid({scale:e.kind==='retained'?1.1:1.0,
      cloth:e.kind==='retained'?0x4f463d:0x61584e,skin:0x6d6357,dark:0x3b352e,
      eyes:e.kind==='retained'?0xffb070:0xe8d6a8,hunch:true});
    g.userData.creature=true;
    return g;
  }
  if(e.type==='soldier')return rigHumanoid({cloth:0x39402f,skin:0x6b5c4c,dark:0x2c3226,helmet:0x454c38,gun:true});
  if(e.type==='rex')return rigDog();
  if(e.type==='nika')return rigChild();
  if(e.type==='psy'){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.4),billMat('silhouette'));
    m.position.y=1.2;m.userData.bb=true;m.userData.fade=true;return m;
  }
  if(e.type==='subject01'){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.9,3.3),billMat('silhouetteTall'));
    m.position.y=1.65;m.userData.bb=true;m.userData.fade=true;return m;
  }
  return null;
}

/* ---------------- engine init ---------------- */
function init3D(){
  if(E3.ok)return true;
  if(typeof THREE==='undefined'){E3.lastErr='three.js missing';return false;}
  try{
    const test=document.createElement('canvas');
    const gl=test.getContext('webgl2')||test.getContext('webgl');
    if(!gl){E3.lastErr='no webgl';return false;}
    E3.renderer=new THREE.WebGLRenderer({canvas:cv,antialias:E3.quality>1,powerPreference:'high-performance'});
  }catch(err){E3.lastErr=String(err&&err.message||err);return false;}
  const R=E3.renderer;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,E3.quality===2?1.4:(E3.quality===1?1:0.75)));
  R.setSize(VW,VH,false);
  R.shadowMap.enabled=E3.quality>0;
  R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.toneMapping=THREE.ACESFilmicToneMapping;
  R.toneMappingExposure=1.06;
  R.autoClear=true;
  E3.scene=new THREE.Scene();
  E3.scene.background=new THREE.Color(0x04060a);
  E3.scene.fog=new THREE.FogExp2(0x04060a,0.055);
  E3.camera=new THREE.PerspectiveCamera(68,VW/VH,0.08,320);
  E3.scene.add(E3.camera);
  E3.hemi=new THREE.HemisphereLight(0x6f8695,0x1b1a15,0.16);
  E3.scene.add(E3.hemi);
  E3.amb=new THREE.AmbientLight(0x9fb2bb,0.05);
  E3.scene.add(E3.amb);
  E3.flash=new THREE.SpotLight(0xfff0d2,26,30,0.50,0.42,1.7);
  E3.flash.castShadow=E3.quality>0;
  E3.flash.shadow.mapSize.width=E3.flash.shadow.mapSize.height=E3.quality>1?1024:512;
  E3.flash.shadow.camera.near=0.3;E3.flash.shadow.camera.far=28;
  E3.flash.shadow.bias=-0.0016;
  E3.flashTarget=new THREE.Object3D();
  E3.scene.add(E3.flashTarget);
  E3.flash.target=E3.flashTarget;
  E3.scene.add(E3.flash);
  for(let i=0;i<6;i++){
    const L=new THREE.PointLight(0xffd9a0,0,10,2);
    L.visible=false;E3.poolLights.push(L);E3.scene.add(L);
  }
  E3.tmpV=new THREE.Vector3();
  E3.ok=true;
  return true;
}
function applyQuality(){
  if(!E3.ok)return;
  const R=E3.renderer;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,E3.quality===2?1.4:(E3.quality===1?1:0.75)));
  R.setSize(VW,VH,false);
  R.shadowMap.enabled=E3.quality>0;
  if(E3.flash){E3.flash.castShadow=E3.quality>0;
    E3.flash.shadow.mapSize.width=E3.flash.shadow.mapSize.height=E3.quality>1?1024:512;
    if(E3.flash.shadow.map){E3.flash.shadow.map.dispose();E3.flash.shadow.map=null;}}
  if(E3.camera){E3.camera.aspect=VW/VH;E3.camera.updateProjectionMatrix();}
}
function disposeWorld(){
  if(!E3.world)return;
  E3.world.traverse(o=>{
    if(o.geometry)o.geometry.dispose();
    if(o.material){
      const ms=Array.isArray(o.material)?o.material:[o.material];
      ms.forEach(m=>{
        if(!m)return;
        if(MATS[m.id]||BILLMAT[m.id]||MATCACHE[m.id])return;
        if(Object.values(MATS).indexOf(m)>=0)return;
        if(Object.values(BILLMAT).indexOf(m)>=0)return;
        if(Object.values(MATCACHE).indexOf(m)>=0)return;
        if(m===E3.waterMat)return;
        m.dispose();
      });
    }
  });
  E3.scene.remove(E3.world);
  if(E3.playerRig){E3.playerRig=null;}
  E3.world=null;E3.sprites.length=0;E3.chars=[];E3.wheel=null;E3.wheelGondolas.length=0;
}
function build3D(force){
  if(!G.mode3d||!E3.ok)return;
  const s=G.scene;if(!s)return;
  const key=s.id+'|'+s.visits+'|'+JSON.stringify(s.shifted||{})+'|'+(s.dirty?1:0);
  if(E3.builtFor===key&&!force)return;
  disposeWorld();
  E3.builtFor=key;
  const root=new THREE.Group();
  const wm=buildWorldMesh(s);
  if(wm.opaque)root.add(wm.opaque);
  if(wm.water)root.add(wm.water);
  /* props */
  E3.sprites=[];
  for(const sp of s.sprites){
    const d=SPR3[sp.type];
    if(!d)continue;
    let o;
    if(d.k==='box')o=makeBoxProp(d);
    else if(d.k==='pipes')o=makePipes();
    else if(d.k==='bag')o=makeBag();
    else if(d.k==='wheel')o=makeWheel(sp);
    else o=makeBillboard(d,sp);
    o.position.set(sp.x+0.5,0,sp.y+0.5);
    if(d.k==='flat')o.position.y=0;
    if(sp.type==='fire'||sp.type==='lamp'||sp.type==='sign'||sp.type==='bush'||sp.type==='grass2')
      o.rotation.y=hash2(Math.floor(sp.x),Math.floor(sp.y),3)*TAU;
    root.add(o);
    E3.sprites.push({o:o,d:d,sp:sp});
  }
  /* characters */
  E3.chars=[];
  for(const e of s.entsLive||[]){
    const o=makeChar(e);
    if(!o)continue;
    o.position.set(e.x,0,e.y);
    root.add(o);
    E3.chars.push({o:o,e:e});
  }
  /* lights */
  E3.lights3=[];
  for(const L of s.lights){
    const col=parseInt((L.c.match(/\d+,\d+,\d+/)||['255,220,170'])[0].split(',').map(v=>(+v).toString(16).padStart(2,'0')).join(''),16);
    E3.lights3.push({x:L.x,y:L.y,r:L.r,a:L.a||0.2,flick:L.flick||0,broken:!!L.broken,memory:!!L.memory,col:col});
  }
  E3.scene.add(root);
  E3.world=root;
  /* atmosphere */
  E3.scene.fog.density=s.indoor?0.085:0.048;
  E3.hemi.intensity=s.indoor?0.085:0.20;
  E3.amb.intensity=s.indoor?0.028:0.05;
  E3.scene.background=new THREE.Color(s.indoor?0x030406:0x05070c);
  E3.scene.fog.color.set(s.indoor?0x030406:0x05070c);
  E3.yaw=IN.aim;
}

/* ---------------- per-frame 3D update ---------------- */
function solidAt3(x,y,h){
  const s=G.scene;if(!s)return true;
  return solidT(getT(s.g,Math.floor(x),Math.floor(y)));
}
function update3D(dt){
  const s=G.scene,P=G.player;
  if(!s||!P||!E3.ok)return;
  build3D(false);
  if(!E3.world)return;
  E3.frame++;
  /* ---- look direction ---- */
  if(mouseInCanvas||IN.touchLook){
    const halfFov=(E3.camera.fov*Math.PI/180)/2*(VW/VH>1?1:1);
    const nx=(IN.mx-VW/2)/(VW/2),ny=(IN.my-VH/2)/(VH/2);
    if(E3.view==='fps'){
      E3.yaw=IN.aim;
      E3.pitch=clamp(-ny*0.85,-0.95,0.85);
    }else{
      E3.yaw=angLerp(E3.yaw,IN.aim,1-Math.pow(0.0009,dt));
      E3.pitch=lerp(E3.pitch,clamp(-ny*0.55,-0.5,0.5),1-Math.pow(0.002,dt));
    }
  }else{
    E3.yaw=angLerp(E3.yaw,IN.aim,1-Math.pow(0.0009,dt));
    E3.pitch=lerp(E3.pitch,-0.03,dt*2);
  }
  /* ---- head bob ---- */
  const spd=P.moving?(P.sprint?2.0:(P.crouch?0.7:1.15)):0;
  E3.bob+=dt*9.2*spd;
  const bobY=Math.sin(E3.bob*2)*0.035*spd, bobX=Math.cos(E3.bob)*0.028*spd;
  const eye=(P.crouch?1.06:1.64)+(P.hidden?-0.55:0);
  const px=P.x, pz=P.y;
  const cam=E3.camera;
  if(E3.view==='fps'||P.hidden){
    cam.position.set(px+bobX*0.4, eye+bobY, pz);
    cam.rotation.order='YXZ';
    cam.rotation.y=-E3.yaw-Math.PI/2;
    cam.rotation.x=E3.pitch;
    cam.rotation.z=P.injured>0?Math.sin(G.time*2.2)*0.03:0;
    cam.fov=72;
  }else{
    const back=2.35,side=0.62,up=2.02;
    let cx=px-Math.cos(E3.yaw)*back-Math.sin(E3.yaw)*side;
    let cz=pz-Math.sin(E3.yaw)*back+Math.cos(E3.yaw)*side;
    let cy=up+bobY*0.5;
    /* camera collision: pull in along the ray */
    for(let i=1;i<=10;i++){
      const t=i/10;
      const tx=lerp(px,cx,t),tz=lerp(pz,cz,t),ty=lerp(eye+0.15,cy,t);
      if(solidAt3(tx,tz,ty)){cx=lerp(px,cx,Math.max(0.18,t-0.1));cz=lerp(pz,cz,Math.max(0.18,t-0.1));
        cy=lerp(eye+0.15,cy,Math.max(0.18,t-0.1));break;}
    }
    cam.position.set(cx,cy,cz);
    const lookY=eye-0.12+E3.pitch*1.6;
    const lx=px+Math.cos(E3.yaw)*3.2, lz=pz+Math.sin(E3.yaw)*3.2;
    cam.lookAt(lx,lookY,lz);
    cam.rotation.z+=P.injured>0?Math.sin(G.time*2.2)*0.035:bobX*0.10;
    cam.fov=66;
  }
  cam.updateProjectionMatrix();
  /* ---- flashlight ---- */
  const fl=E3.flash;
  if(P.flash&&P.bat>0){
    const dirX=Math.cos(IN.aim),dirZ=Math.sin(IN.aim);
    const ox=(E3.view==='fps')?cam.position.x:px+dirX*0.35;
    const oz=(E3.view==='fps')?cam.position.z:pz+dirZ*0.35;
    const oy=(E3.view==='fps')?cam.position.y-0.08:eye-0.18;
    fl.position.set(ox,oy,oz);
    const pit=(E3.view==='fps')?E3.pitch:-0.06;
    E3.flashTarget.position.set(ox+dirX*6,oy+pit*6,oz+dirZ*6);
    const pw=0.55+0.45*(P.bat/CFG.batMax);
    fl.intensity=26*pw*(0.97+Math.random()*0.06);
    fl.visible=true;
  }else{fl.visible=false;fl.intensity=0;}
  /* ---- pool lights ---- */
  const cand=[];
  for(const L of E3.lights3||[]){
    if(L.broken&&!G.flags.power)continue;
    if(L.memory&&G.echo<0.15)continue;
    const d=Math.hypot(L.x-px,L.y-pz);
    if(d>L.r+26)continue;
    cand.push({L:L,d:d});
  }
  for(const c of E3.chars){
    if(c.e.type==='soldier'&&c.e.torch){
      const d=Math.hypot(c.e.x-px,c.e.y-pz);
      if(d<26)cand.push({torch:c.e,d:d});
    }
  }
  cand.sort((a,b)=>a.d-b.d);
  for(let i=0;i<E3.poolLights.length;i++){
    const pl=E3.poolLights[i],c=cand[i];
    if(!c){pl.visible=false;pl.intensity=0;continue;}
    pl.visible=true;
    if(c.L){
      const L=c.L;
      let a=1;
      if(L.flick)a=1-L.flick*(0.5+0.5*Math.sin(G.time*(6+L.x)+L.y*3))*(Math.random()<0.05?2.4:1);
      a=clamp(a,0.05,1);
      if(L.memory)a*=clamp(G.echo*1.7,0,1);
      pl.position.set(L.x+0.5,2.35,L.y+0.5);
      pl.color.setHex(L.col||0xffd9a0);
      pl.distance=Math.max(4,L.r*1.5);
      pl.intensity=Math.max(0,(L.a||0.2)*46*a);
      pl.castShadow=false;
    }else{
      const e=c.torch;
      pl.position.set(e.x,1.55,e.y);
      pl.color.setHex(0xffe6bb);
      pl.distance=13;
      pl.intensity=9+Math.random()*1.5;
    }
  }
  /* ---- sprites ---- */
  const cullD=E3.view==='fps'?46:54;
  for(const sp of E3.sprites){
    const o=sp.o,d=sp.d;
    const dx=o.position.x-(px+0.5),dz=o.position.z-(pz+0.5);
    const dd=Math.sqrt(dx*dx+dz*dz);
    o.visible=dd<cullD;
    if(!o.visible)continue;
    if(d.k==='bb')
      o.rotation.y=Math.atan2(cam.position.x-o.position.x,cam.position.z-o.position.z);
    if(o.userData&&o.userData.light){
      const f=0.65+Math.random()*0.6;
      o.userData.light.intensity=o.userData.lightBase*f;
    }
    if(sp.sp.type==='fire'){
      const f=0.85+Math.sin(G.time*11+sp.sp.x)*0.15+Math.random()*0.1;
      o.scale.setScalar(0.9+f*0.25);
    }
  }
  /* ferris wheel */
  if(E3.wheel){
    E3.wheel.rim.rotation.z+=dt*0.055;
    for(const gd of E3.wheelGondolas)gd.o.rotation.z=-E3.wheel.rim.rotation.z+Math.sin(G.time*0.6+gd.a)*0.05;
  }
  /* water shimmer */
  if(E3.waterMat){
    E3.waterMat.map.offset.x=(G.time*0.012)%1;
    E3.waterMat.map.offset.y=(G.time*0.008)%1;
  }
  /* ---- characters ---- */
  for(const c of E3.chars||[]){
    const e=c.e,o=c.o;
    o.position.set(e.x,0,e.y);
    const face=(e.face!=null?e.face:IN.aim);
    o.rotation.y=-face-Math.PI/2;
    const u=o.userData||{};
    if(u.fade){
      const v=(e.vis==null?1:e.vis);
      o.visible=v>0.02;
      if(o.material){o.material.opacity=clamp(v,0,1)*0.92;o.material.transparent=true;}
      if(o.visible)o.rotation.y=Math.atan2(cam.position.x-o.position.x,cam.position.z-o.position.z);
      continue;
    }
    if(e.type==='nika'){
      const v=(e.vis==null?1:e.vis);
      o.visible=!e.gone&&v>0.03;
      o.traverse(ch=>{if(ch.material&&ch.material.transparent)ch.material.opacity=clamp(v,0,1)*0.16;});
      if(u.aura)u.aura.material.opacity=0.06+0.05*Math.sin(G.time*1.5);
      continue;
    }
    if(e.type==='creature'||e.type==='soldier'){
      const walk=e.moving?Math.sin(G.time*(e.state==='chase'?13:8)+e.x)*0.6:0;
      if(u.legs){u.legs[0].rotation.x=walk;u.legs[1].rotation.x=-walk;}
      if(u.arms){u.arms[0].rotation.x=-walk*0.7;u.arms[1].rotation.x=walk*0.7;}
      if(u.torso){
        u.torso.rotation.x=u.hunch?0.42+Math.sin(G.time*2.4)*0.03:(e.moving?Math.sin(G.time*8)*0.05:0);
        u.torso.position.y=(u.hunch?1.06:1.20)*(u.sc||1)+(e.moving?Math.abs(Math.sin(G.time*8))*0.03:0);
      }
      if(u.head){u.head.position.y=(u.hunch?1.52:1.75)*(u.sc||1);
        u.head.rotation.x=u.hunch?0.5:0;}
      if(u.eyes){
        const hot=(e.alert>0.4||e.state==='chase');
        u.eyes.forEach(ey=>{ey.material=solidMat(0xffffff,{e:hot?0xff7a40:0x9a8a6a});});
      }
      if(u.gun)u.gun.visible=true;
      continue;
    }
    if(e.type==='rex'){
      const walk=e.moving?Math.sin(G.time*11+e.x)*0.7:0;
      if(u.legs){u.legs.forEach((l,i)=>l.rotation.x=(i%2?1:-1)*walk);}
      if(u.tail)u.tail.rotation.y=Math.sin(G.time*7)*0.4;
      if(u.head){
        u.head.rotation.y=e.stare?clamp(((e.stare-face+Math.PI*3)%TAU)-Math.PI,-1.1,1.1):Math.sin(G.time*0.8)*0.08;
      }
      continue;
    }
  }
  /* player rig */
  if(!E3.playerRig){
    E3.playerRig=rigHumanoid({cloth:0x3f4735,skin:0x6b5c4c,dark:0x2b3129,gun:true});
    E3.world.add(E3.playerRig);
  }
  if(E3.playerRig.parent!==E3.world)E3.world.add(E3.playerRig);
  const pr=E3.playerRig,pu=pr.userData;
  pr.visible=(E3.view!=='fps')&&!P.hidden;
  pr.position.set(P.x,0,P.y);
  pr.rotation.y=-IN.aim-Math.PI/2;
  const pw=P.moving?Math.sin(G.time*(P.sprint?14:9.5))*0.65:0;
  if(pu.legs){pu.legs[0].rotation.x=pw;pu.legs[1].rotation.x=-pw;}
  if(pu.arms){pu.arms[0].rotation.x=-pw*0.5;pu.arms[1].rotation.x=pw*0.5;}
  if(pu.torso)pu.torso.position.y=1.20+(P.crouch?-0.24:0)+Math.abs(pw)*0.03;
  if(pu.head)pu.head.position.y=1.75+(P.crouch?-0.24:0);
  pr.scale.y=P.crouch?0.86:1;
  /* memory layer tint */
  const fogC=E3.scene.fog.color;
  if(G.echo>0.35){
    const k=(G.echo-0.35)*0.5;
    fogC.setRGB(0.02+k*0.10,0.024+k*0.06,0.035+k*0.02);
  }
  E3.renderer.render(E3.scene,E3.camera);
}
function render3D(){
  if(!E3.ok||!G.mode3d)return;
  update3D(G.dt||0.016);
  /* mirror the WebGL frame into the 2D canvas so glitch post-FX still work */
  try{
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.drawImage(E3.renderer.domElement,0,0,cv.width,cv.height);
  }catch(e){}
}
function setMode3D(on,silent){
  if(on){
    if(!init3D()){
      G.mode3d=false;
      toast('تعذّر تشغيل 3D — تم الرجوع إلى 2.5D',E3.lastErr||'WebGL غير متاح');
      $('btn3D').classList.remove('on');$('btn2D').classList.add('on');
      return;
    }
    G.mode3d=true;E3.builtFor=null;
    build3D(true);
    applyQuality();
    if(!silent)toast('المحرّك ثلاثي الأبعاد','3D — V لتبديل الكاميرا، G للجودة');
  }else{
    G.mode3d=false;
    if(E3.ok){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);}
    if(!silent)toast('المحرّك 2.5D','أخفّ على الأجهزة الضعيفة');
  }
  $('btn3D').classList.toggle('on',G.mode3d);
  $('btn2D').classList.toggle('on',!G.mode3d);
  $('btnMode').textContent='المحرّك: '+(G.mode3d?'3D':'2.5D');
  $('cross').classList.toggle('on',G.mode3d&&E3.view==='fps');
}
function toggleView(){
  E3.view=E3.view==='ots'?'fps':'ots';
  $('btnCam').textContent='كاميرا: '+(E3.view==='ots'?'فوق الكتف':'منظور أول');
  $('cross').classList.toggle('on',G.mode3d&&E3.view==='fps');
  toast(E3.view==='ots'?'كاميرا فوق الكتف القريبة':'منظور الشخص الأول',
    E3.view==='ots'?'كما في وثيقة التصميم — لا ترى كل شيء':'رؤية أضيق، رعب أكبر');
}
function cycleQuality(){
  E3.quality=(E3.quality+1)%3;
  applyQuality();
  const n=['منخفضة','متوسطة','عالية'][E3.quality];
  $('btnQ').textContent='الجودة: '+n;
  toast('الجودة: '+n,E3.quality===0?'بدون ظلال — أسرع':'ظلال '+((E3.quality>1)?'1024':'512'));
}
