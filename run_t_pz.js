/* Minimal THREE stub — exercises the 3D code paths (geometry, scene graph,
   per-frame updates) in Node without WebGL. */
let _id=1;
class V3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  length(){return Math.hypot(this.x,this.y,this.z);}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}}
class Col{constructor(c){this.set(c);}
  set(c){this.v=c;
    if(Array.isArray(c)){this.r=c[0];this.g=c[1];this.b=c[2];}
    else{this.r=((c>>16)&255)/255;this.g=((c>>8)&255)/255;this.b=(c&255)/255;}
    return this;}
  setHex(h){return this.set(h);}
  setRGB(r,g,b){this.v=[r,g,b];this.r=r;this.g=g;this.b=b;return this;}
  getHex(){return (Math.round(this.r*255)<<16|Math.round(this.g*255)<<8|Math.round(this.b*255))>>>0;}}
class Obj3D{
  constructor(){this.id=_id++;this.children=[];this.position=new V3();this.rotation={x:0,y:0,z:0,order:'XYZ'};
    this.scale={x:1,y:1,z:1,setScalar(v){this.x=this.y=this.z=v;return this;}};
    this.userData={};this.visible=true;this.parent=null;this.matrixAutoUpdate=true;}
  add(o){if(o){this.children.push(o);o.parent=this;}return this;}
  remove(o){const i=this.children.indexOf(o);if(i>=0)this.children.splice(i,1);return this;}
  traverse(f){f(this);this.children.forEach(c=>c.traverse&&c.traverse(f));}
  lookAt(){return this;}
  updateMatrix(){}
  updateProjectionMatrix(){}
}
class Scene extends Obj3D{constructor(){super();this.fog=null;this.background=null;}}
class Group extends Obj3D{}
class Camera extends Obj3D{constructor(){super();this.fov=70;this.aspect=1;this.near=0.1;this.far=100;}}
class PerspectiveCamera extends Camera{constructor(f,a,n,fa){super();this.fov=f;this.aspect=a;this.near=n;this.far=fa;}}
class Light extends Obj3D{constructor(c,i,d){super();this.color=new Col(c);this.intensity=i==null?1:i;
  this.distance=d||0;this.castShadow=false;this.shadow={mapSize:{width:512,height:512},camera:{},bias:0,map:null};}
  set target(o){this._t=o;} get target(){return this._t;}}
class PointLight extends Light{}
class DirectionalLight extends Light{}
class SpotLight extends Light{constructor(c,i,d,a,p,dec){super(c,i,d);this.angle=a;this.penumbra=p;this.decay=dec;}}
class HemisphereLight extends Light{constructor(sk,gr,i){super(sk,i,0);this.groundColor=new Col(gr);}}
class AmbientLight extends Light{}
class FogExp2{constructor(c,d){this.color=new Col(c);this.density=d;}}
class BufferGeometry{
  constructor(){this.attributes={};this.index=null;this.groups=[];}
  setAttribute(n,a){this.attributes[n]=a;return this;}
  setIndex(i){this.index=i;return this;}
  addGroup(st,c,m){this.groups.push({start:st,count:c,materialIndex:m});return this;}
  computeBoundingSphere(){this.boundingSphere={radius:10,center:new V3()};}
  dispose(){this._disposed=true;}
}
class Float32BufferAttribute{constructor(arr,item){this.array=Float32Array.from(arr);this.itemSize=item;this.count=arr.length/item;}}
class BoxGeometry extends BufferGeometry{constructor(w=1,h=1,d=1){super();this.p={w,h,d};}}
class PlaneGeometry extends BufferGeometry{constructor(w=1,h=1){super();this.p={w,h};}}
class CylinderGeometry extends BufferGeometry{constructor(rt=1,rb=1,h=1,s=8){super();this.p={rt,rb,h,s};}}
class TorusGeometry extends BufferGeometry{constructor(r=1,t=.1,a=8,b=8){super();this.p={r,t};}}
class CapsuleGeometry extends BufferGeometry{constructor(r=1,l=1,a=4,b=8){super();this.p={r,l};}}
class Material{constructor(o={}){Object.assign(this,o);this.id=_id++;this.userData={};
  if(this.color===undefined)this.color=new Col(0xffffff);}
  dispose(){this._disposed=true;}}
class MeshLambertMaterial extends Material{}
class MeshBasicMaterial extends Material{}
class Mesh extends Obj3D{constructor(g,m){super();this.geometry=g;this.material=m;
  this.castShadow=false;this.receiveShadow=false;}}
class Texture{constructor(){this.offset={x:0,y:0};this.wrapS=0;this.wrapT=0;this.anisotropy=1;this.id=_id++;}
  dispose(){this._disposed=true;}}
class CanvasTexture extends Texture{constructor(c){super();this.image=c;}}
class WebGLRenderer{
  constructor(o={}){this.domElement=(o&&o.canvas)||{style:{}};this.shadowMap={enabled:false,type:0};
    this.info={render:{calls:0,triangles:0}};this.renderCount=0;this.opts=o||{};}
  setPixelRatio(v){this.pr=v;} setSize(w,h,u){this.w=w;this.h=h;this.us=u;}
  render(sc,cam){this.renderCount++;this.lastScene=sc;this.lastCam=cam;}
  dispose(){}
}
class Raycaster{constructor(){this.ray={origin:new V3(),direction:new V3()};}
  set(){} intersectObjects(){return [];}}
class Euler{constructor(){this.x=this.y=this.z=0;}}
const THREE={
  REVISION:160,
  Scene,Group,Mesh,Object3D:Obj3D,PerspectiveCamera,Camera,
  WebGLRenderer,Raycaster,Euler,
  BoxGeometry,PlaneGeometry,CylinderGeometry,TorusGeometry,CapsuleGeometry,
  BufferGeometry,Float32BufferAttribute,
  MeshLambertMaterial,MeshBasicMaterial,
  PointLight,DirectionalLight,SpotLight,HemisphereLight,AmbientLight,
  FogExp2,CanvasTexture,Texture,
  Vector3:V3,Color:Col,
  SRGBColorSpace:'srgb',
  RepeatWrapping:1000,ClampToEdgeWrapping:1001,
  DoubleSide:2,FrontSide:0,BackSide:1,
  AdditiveBlending:2,NormalBlending:1,
  PCFSoftShadowMap:2,ACESFilmicToneMapping:4,
  MathUtils:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),lerp:(a,b,t)=>a+(b-a)*t},
};
global.THREE=THREE;
/* DOM/browser harness for running the game in Node */
const __els={};
function __mkCtx(c){
  const noop=()=>{};
  return {canvas:c,
    save:noop,restore:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,arcTo:noop,
    rect:noop,roundRect:noop,fill:noop,stroke:noop,clip:noop,fillRect:noop,strokeRect:noop,clearRect:noop,
    fillText:noop,strokeText:noop,translate:noop,rotate:noop,scale:noop,transform:noop,setTransform:noop,resetTransform:noop,
    quadraticCurveTo:noop,bezierCurveTo:noop,ellipse:noop,drawImage:noop,putImageData:noop,setLineDash:noop,
    createLinearGradient:()=>({addColorStop:noop}),
    createRadialGradient:()=>({addColorStop:noop}),
    createPattern:()=>({setTransform:noop}),
    createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(Math.max(4,(w|0)*(h|0)*4))}),
    getImageData:(x,y,w,h)=>({width:w|0,height:h|0,data:new Uint8ClampedArray(Math.max(4,(w|0)*(h|0)*4))}),
    measureText:(t)=>({width:(t?String(t).length:0)*7}),
    isPointInPath:()=>false,
    globalAlpha:1,globalCompositeOperation:'source-over',
    fillStyle:'#000',strokeStyle:'#000',lineWidth:1,lineCap:'butt',lineJoin:'miter',
    font:'12px sans-serif',textAlign:'start',textBaseline:'alphabetic',direction:'ltr',
    shadowBlur:0,shadowColor:'transparent',shadowOffsetX:0,shadowOffsetY:0,
    imageSmoothingEnabled:true,filter:'none',miterLimit:10,lineDashOffset:0};
}
function __base(id){
  return {id,style:{setProperty:()=>{},removeProperty:()=>{},display:'',width:'',height:'',opacity:''},
    classList:{_s:new Set(),add(...a){a.forEach(x=>this._s.add(x));},remove(...a){a.forEach(x=>this._s.delete(x));},
      toggle(x,f){if(f===undefined)f=!this._s.has(x);f?this._s.add(x):this._s.delete(x);return f;},
      contains(x){return this._s.has(x);}},
    dataset:{},children:[],_listeners:{},_text:'',_html:'',
    get textContent(){return this._text;},set textContent(v){this._text=String(v);},
    get innerHTML(){return this._html;},set innerHTML(v){this._html=String(v);},
    get innerText(){return this._text;},set innerText(v){this._text=String(v);},
    value:'',checked:false,disabled:false,hidden:false,width:300,height:150,title:'',
    appendChild(o){this.children.push(o);return o;},removeChild(o){},insertBefore(o){this.children.push(o);return o;},
    remove(){},replaceChildren(){this.children=[];},
    querySelector(sel){const k='_q'+sel;if(!this[k])this[k]=__mkEl('q');return this[k];},
    querySelectorAll(){return [];},
    addEventListener(t,f){(this._listeners[t]=this._listeners[t]||[]).push(f);},
    removeEventListener(){},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k];},
    getBoundingClientRect(){return {left:0,top:0,width:this.width||300,height:this.height||150,right:300,bottom:150};},
    focus(){},blur(){},click(){},scrollIntoView(){},
    requestPointerLock(){document.pointerLockElement=this;},
    getContext(k){if(!this._ctx)this._ctx=__mkCtx(this);return this._ctx;}};
}
function __mkCanvas(id){const c=__base(id);c.tagName='CANVAS';c.width=960;c.height=540;return c;}
function __mkEl(id){const e=__base(id);e.tagName='DIV';return e;}
const __canvasIds=new Set(['cv','fx','gl']);
const __ids=("btn2D btn3D btnCam btnCodeClear btnCodeClose btnCont btnDocClose btnHelp btnHelpBack btnMode "
 +"btnNbClose btnNew btnPauseHelp btnQ btnQuit btnResume btnSave code codeHint codePick codeSlots codeSub "
 +"codeTitle cross cv dlg dlgCont dlgOpts dlgTxt dlgWho doc docBody docKind docNote docTitle end endBody "
 +"endBtns endKind endTitle fade flashmsg fx gl help hint hud inter menu nb nbBody noGL obj pause pauseStats "
 +"stick stickNub sub toast touch vBat vRad vSta vitals").split(' ');
__ids.forEach(id=>{__els[id]=__canvasIds.has(id)?__mkCanvas(id):__mkEl(id);});
/* overlays that start hidden in the real markup */
['help','pause','doc','dlg','code','nb','end','touch','noGL','flashmsg','mode3d']
  .forEach(id=>{if(__els[id])__els[id].classList.add('hide');});
const document={
  getElementById:id=>__els[id]||(__els[id]=__mkEl(id)),
  createElement:tag=>{
    const e=(tag==='canvas')?__mkCanvas('created'):__mkEl('created');
    e.tagName=String(tag).toUpperCase();
    if(tag==='canvas'){e.width=128;e.height=128;}
    return e;
  },
  querySelectorAll:()=>[],querySelector:()=>null,
  body:__mkEl('body'),documentElement:__mkEl('html'),
  addEventListener(t,f){(document._l=document._l||{})[t]=(document._l[t]||[]).concat(f);},
  removeEventListener(){},
  exitPointerLock(){document.pointerLockElement=null;},
  pointerLockElement:null,
  _l:{},
};
const __store={};
const localStorage={getItem:k=>(k in __store?__store[k]:null),setItem:(k,v)=>{__store[k]=String(v);},
  removeItem:k=>{delete __store[k];},clear:()=>{for(const k in __store)delete __store[k];}};
const navigator={userAgent:'node-test',language:'ar',maxTouchPoints:0,vibrate(){},
  getGamepads:()=>[],clipboard:{writeText:()=>Promise.resolve()}};
const performance={now:()=>Date.now()};
const window={innerWidth:1280,innerHeight:720,devicePixelRatio:1,
  addEventListener(t,f){(window._l=window._l||{})[t]=(window._l[t]||[]).concat(f);},
  removeEventListener(){},
  AudioContext:null,webkitAudioContext:null,
  speechSynthesis:{speak(){},cancel(){},getVoices:()=>[]},
  requestAnimationFrame:()=>0,cancelAnimationFrame(){},
  location:{href:'http://test/',reload(){}},_l:{}};
const requestAnimationFrame=()=>0;
const cancelAnimationFrame=()=>{};
const AudioContext=null, webkitAudioContext=null;
global.document=document;global.window=window;global.localStorage=localStorage;
global.navigator=navigator;global.performance=performance;
global.requestAnimationFrame=requestAnimationFrame;global.cancelAnimationFrame=cancelAnimationFrame;
global.self=window;global.addEventListener=window.addEventListener;
global.__els=__els;global.__fire=(id,t,ev)=>{const e=__els[id];if(!e||!e._listeners[t])return 0;
  e._listeners[t].forEach(f=>f(Object.assign({preventDefault(){},target:e},ev)));return e._listeners[t].length;};
global.__fireDoc=(t,ev)=>{const l=(document._l||{})[t]||[];l.forEach(f=>f(Object.assign({preventDefault(){}},ev)));return l.length;};
global.__fireWin=(t,ev)=>{const l=(window._l||{})[t]||[];l.forEach(f=>f(Object.assign({preventDefault(){}},ev)));return l.length;};
"use strict";
/* =====================================================================
   CHERNOBYL: ECHOES OF ZERO — Part 1: THE FALL
   Playable vertical slice. Single-file engine.
   ===================================================================== */

/* ------------------------------ utils ------------------------------ */
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const angLerp=(a,b,t)=>{let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;return a+d*t;};
const TAU=Math.PI*2;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash2(x,y,s){let h=x*374761393+y*668265263+s*1442695040;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967295;}
function vnoise(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi,s),b=hash2(xi+1,yi,s),c=hash2(xi,yi+1,s),d=hash2(xi+1,yi+1,s);
  return lerp(lerp(a,b,u),lerp(c,d,u),v);}
function fbm(x,y,s){let t=0,a=.5,f=1;for(let i=0;i<4;i++){t+=a*vnoise(x*f,y*f,s+i*17);f*=2;a*=.5;}return t;}
const pick=(rnd,arr)=>arr[Math.floor(rnd()*arr.length)];
function $(id){return document.getElementById(id);}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}

/* ------------------------------ config ------------------------------ */
const T=32;                       // tile size (px)
const CFG={
  walk:2.35, sprint:4.15, crouch:1.25,   // tiles / sec
  staMax:100, staDrain:19, staRegen:11,
  batMax:100, batDrain:1.35,
  fovCone:0.72,                    // flashlight half-angle (rad)
  fovRange:15.2,                   // tiles
  ambientOut:0.90, ambientIn:0.955,
  creatureWalk:1.72, creatureChase:3.45,
  sightRange:11.5, sightAngle:1.15,
  hearWalk:4.2, hearSprint:11.5, hearCrouch:1.6,
  gravity:24,                      // units/s^2 (1 unit ~= 1 metre)
  camFollow:0.000012,              // third-person camera damping (smaller = smoother)
  camDistDefault:2.7,              // distance behind the player
  camDistMin:1.3, camDistMax:5.5,  // adjustable zoom range (mouse wheel)
  camPitchMin:-0.55, camPitchMax:0.80,   // vertical camera limits (radians)
  camShoulder:0.62,                // over-the-shoulder side offset
};
const SYMS=[
  {id:'atom', name:'الذرة', svg:'<svg viewBox="0 0 40 40" fill="none" stroke="#9fd4c9" stroke-width="1.6"><circle cx="20" cy="20" r="3"/><ellipse cx="20" cy="20" rx="16" ry="7"/><ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(120 20 20)"/></svg>'},
  {id:'wave', name:'الموجة', svg:'<svg viewBox="0 0 40 40" fill="none" stroke="#9fd4c9" stroke-width="1.6"><path d="M2 20 Q7 8 12 20 T22 20 T32 20 T42 20"/><circle cx="20" cy="31" r="2.4"/></svg>'},
  {id:'eye',  name:'العين',  svg:'<svg viewBox="0 0 40 40" fill="none" stroke="#9fd4c9" stroke-width="1.6"><path d="M3 20 Q20 6 37 20 Q20 34 3 20Z"/><circle cx="20" cy="20" r="5.4"/><circle cx="20" cy="20" r="1.8" fill="#9fd4c9"/></svg>'},
  {id:'zero', name:'صفر',   svg:'<svg viewBox="0 0 40 40" fill="none" stroke="#c9a227" stroke-width="1.6"><circle cx="20" cy="20" r="15"/><path d="M9 31 L31 9"/><circle cx="20" cy="20" r="4"/></svg>'},
];
const SYM_ORDER=['atom','wave','zero','eye']; // child -> school -> kindergarten -> basement

/* ------------------------------ state ------------------------------ */
const G={
  running:false, paused:false, over:false, time:0, dt:0, last:0,
  sceneId:null, scenes:{}, scene:null,
  echo:0,          // 0..1 -> which layer bleeds through
  layer:1,
  flags:{},        // story flags
  items:{},        // key -> count/true
  pz:{},           // puzzle progress: id -> {done:[stepIds]}
  evt:{done:{},cd:{}},  // event manager state (fired once-flags + cooldowns)
  story:null,      // Story System state (Phase 10): {chapter,obj,doneObj,doneEvt,vars,complete,log}
  docs:[], tapes:[], notes:[], syms:[],
  objective:'', objSub:'',
  visits:{},       // sceneId -> visit count
  trust:0,         // nika trust (hidden)
  stats:{deaths:0, hidden:0, anomalies:0, docs:0, walk:0, events:0},
  mapUnreliable:false,
  radio:false, radioT:0,
  shakeT:0, shakeA:0,
  distort:0, grain:0.05, whiteout:0,
  subtitleT:0,
  showVitals:0,
  lastSafe:null,
};

/* ------------------------------ input ------------------------------ */
const IN={keys:{},mx:0,my:0,aim:Math.PI/2,joy:{x:0,y:0},touch:false,
  lookX:0,lookY:0,locked:false,dragging:false,sens:1.0,
  down(e){this.keys[e.code]=true;},up(e){this.keys[e.code]=false;}};
const K=c=>!!IN.keys[c];

/* ------------------------------ audio ------------------------------ */
const A={ctx:null,master:null,on:true,ready:false,wind:null,rad:null,heart:0,voices:true};
function audioInit(){
  if(A.ctx)return;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
  A.ctx=new AC();
  A.master=A.ctx.createGain(); A.master.gain.value=0.85; A.master.connect(A.ctx.destination);
  // wind bed
  const len=A.ctx.sampleRate*4, buf=A.ctx.createBuffer(1,len,A.ctx.sampleRate), d=buf.getChannelData(0);
  let last=0; for(let i=0;i<len;i++){const w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.2;}
  const src=A.ctx.createBufferSource(); src.buffer=buf; src.loop=true;
  const lp=A.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=420;
  const gn=A.ctx.createGain(); gn.gain.value=0.0;
  const lfo=A.ctx.createOscillator(); lfo.frequency.value=0.07;
  const lg=A.ctx.createGain(); lg.gain.value=0.05; lfo.connect(lg); lg.connect(gn.gain);
  src.connect(lp); lp.connect(gn); gn.connect(A.master); src.start(); lfo.start();
  A.wind={g:gn,f:lp};
  // indoor hum
  const o=A.ctx.createOscillator(); o.type='sine'; o.frequency.value=52;
  const og=A.ctx.createGain(); og.gain.value=0; o.connect(og); og.connect(A.master); o.start();
  A.hum=og;
  A.ready=true;
}
function noiseBurst(dur,freq,q,vol,type){
  if(!A.ready||!A.on)return; const c=A.ctx,t=c.currentTime;
  const len=Math.max(1,Math.floor(c.sampleRate*dur));
  const b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const s=c.createBufferSource();s.buffer=b;
  const f=c.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;
  const g=c.createGain();g.gain.value=vol;g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(A.master);s.start(t);
}
function tone(freq,dur,vol,type,ramp){
  if(!A.ready||!A.on)return;const c=A.ctx,t=c.currentTime;
  const o=c.createOscillator();o.type=type||'sine';o.frequency.value=freq;
  const g=c.createGain();g.gain.value=0;
  g.gain.linearRampToValueAtTime(vol,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(A.master);o.start(t);o.stop(t+dur+0.05);
  if(ramp)o.frequency.exponentialRampToValueAtTime(ramp,t+dur);
}
const SFX={
  step(sprint){noiseBurst(sprint?0.13:0.09, sprint?260:190, 0.8, sprint?0.10:0.055);},
  click(){noiseBurst(0.012,4200,2,0.075);},
  pickup(){tone(660,0.09,0.05,'triangle');setTimeout(()=>tone(880,0.12,0.045,'triangle'),70);},
  deny(){tone(150,0.16,0.07,'square');},
  door(){noiseBurst(0.5,180,0.6,0.09);tone(70,0.4,0.05,'sine');},
  radio(){noiseBurst(0.5,1400,0.7,0.05,'bandpass');},
  beep(){tone(1180,0.06,0.05,'square');},
  dread(){tone(46,2.4,0.10,'sine');tone(69,2.4,0.05,'sine');},
  sting(){noiseBurst(0.9,90,0.4,0.20);tone(1200,0.35,0.09,'sawtooth',180);},
  heart(){tone(52,0.16,0.16,'sine');setTimeout(()=>tone(46,0.13,0.11,'sine'),150);},
  bark(){noiseBurst(0.10,700,1.4,0.14);setTimeout(()=>noiseBurst(0.09,620,1.4,0.11),130);},
  whisper(){noiseBurst(1.1,1800,3.5,0.035,'bandpass');},
  glitch(){noiseBurst(0.22,3000,1.2,0.07);tone(220,0.2,0.05,'square',90);},
  write(){noiseBurst(0.05,2600,2,0.03);},
};
function speak(text,pitch,rate,vol){
  if(!A.voices||!window.speechSynthesis)return;
  try{
    const u=new SpeechSynthesisUtterance(text);
    u.lang='en-US';u.pitch=pitch||1;u.rate=rate||0.92;u.volume=vol==null?0.75:vol;
    const vs=speechSynthesis.getVoices();
    if(vs&&vs.length){const en=vs.find(v=>/en/i.test(v.lang));if(en)u.voice=en;}
    speechSynthesis.speak(u);
  }catch(e){}
}
/* ------------------------------ tiles ------------------------------ */
const TL={WALL:1,ROOF:2,DOOR:3,LOCKDOOR:4,GLASS:5,FENCE:6,TREE:7,DEAD:8,RUB:9,
  F_CONC:20,F_WOOD:21,F_TILE:22,F_DIRT:23,F_LAB:24,F_METAL:25,ROAD:26,GRASS:27,WATER:28,SNOW:29,CELL:30};
const SOLID=new Set([TL.WALL,TL.ROOF,TL.GLASS,TL.FENCE,TL.TREE,TL.DEAD,TL.RUB,TL.DOOR,TL.LOCKDOOR,TL.WATER,TL.CELL]);
function solidT(t){return SOLID.has(t);}
/* floor base colours */
const TCOL={
  [TL.WALL]:'#3a3f42',[TL.ROOF]:'#2b2f33',[TL.DOOR]:'#4a3b2a',[TL.LOCKDOOR]:'#40332a',
  [TL.GLASS]:'#2c3b41',[TL.FENCE]:'#3d4245',[TL.TREE]:'#2b3327',[TL.DEAD]:'#3a3129',[TL.RUB]:'#3b3a37',
  [TL.F_CONC]:'#4b4f52',[TL.F_WOOD]:'#5a4b39',[TL.F_TILE]:'#59615f',[TL.F_DIRT]:'#4a4137',
  [TL.F_LAB]:'#4e565a',[TL.F_METAL]:'#454b50',[TL.ROAD]:'#33363a',[TL.GRASS]:'#39422f',
  [TL.WATER]:'#1d2a2c',[TL.SNOW]:'#6e767c',[TL.CELL]:'#3f464a'
};

/* ------------------------------ grid helpers ------------------------------ */
function makeGrid(w,h,fill){const g=new Uint8Array(w*h);if(fill)g.fill(fill);return g;}
const idx=(g,x,y)=>y*g.w+x;
function getT(g,x,y){if(x<0||y<0||x>=g.w||y>=g.h)return TL.WALL;return g.d[y*g.w+x];}
function setT(g,x,y,t){if(x<0||y<0||x>=g.w||y>=g.h)return;g.d[y*g.w+x]=t;}
function walkable(g,x,y){return !solidT(getT(g,x,y));}
function rect(g,x,y,w,h,t){for(let j=0;j<h;j++)for(let i=0;i<w;i++)setT(g,x+i,y+j,t);}
function box(g,x,y,w,h,t){rect(g,x,y,w,1,t);rect(g,x,y+h-1,w,1,t);rect(g,x,y,1,h,t);rect(g,x+w-1,y,1,h,t);}
function room(g,x,y,w,h,floor){
  box(g,x-1,y-1,w+2,h+2,TL.WALL);
  rect(g,x,y,w,h,floor);
}
function doorAt(g,x,y){setT(g,x,y,TL.DOOR);}
function noiseFill(g,seed,pairs,x0,y0,x1,y1){
  x0=x0||0;y0=y0||0;x1=x1==null?g.w:x1;y1=y1==null?g.h:y1;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const n=fbm(x*0.09,y*0.09,seed);
    for(let i=0;i<pairs.length;i+=2){if(n<pairs[i+1]){setT(g,x,y,pairs[i]);break;}}
  }
}
function scatterSpr(s,rnd,list,count,x0,y0,x1,y1,avoidSolid){
  let n=0,guard=0;
  while(n<count&&guard<count*80){
    guard++;
    const x=x0+rnd()*(x1-x0),y=y0+rnd()*(y1-y0);
    const tx=Math.floor(x),ty=Math.floor(y);
    if(solidT(getT(s.g,tx,ty))!==!!avoidSolid)continue;
    let ok=true;
    for(const o of s.sprites)if(dist(o.x,o.y,x,y)<(o.sp||1.1)){ok=false;break;}
    if(!ok)continue;
    s.sprites.push({x,y,type:list[Math.floor(rnd()*list.length)]});
    n++;
  }
}

/* sprite defs: r = collision radius (tiles, 0 = no collision), l = draw layer (0 ground,1 tall) */
const SPR={
  tree:{r:.34,l:1},dead:{r:.3,l:1},bush:{r:.24,l:1},
  car:{r:.9,l:1},bus:{r:1.3,l:1},lamp:{r:.14,l:1},bench:{r:.5,l:1},
  wreck:{r:1.5,l:1},fire:{r:.4,l:1},crate:{r:.42,l:1},sign:{r:.1,l:1},
  wheel:{r:0,l:1},slide:{r:.6,l:1},statue:{r:.4,l:1},pole:{r:.12,l:1},
  sofa:{r:.7,l:1},tv:{r:.35,l:1},table:{r:.5,l:1},chair:{r:.25,l:1},bed:{r:.75,l:1},
  wardrobe:{r:.55,l:1},drawer:{r:.4,l:1},shelf:{r:.4,l:1},toilet:{r:.3,l:1},sink:{r:.3,l:1},
  tub:{r:.6,l:1},stove:{r:.45,l:1},desk:{r:.45,l:1},locker:{r:.4,l:1},board:{r:.2,l:1},
  piano:{r:.7,l:1},cot:{r:.4,l:1},toybox:{r:.45,l:1},panel:{r:.4,l:1},transformer:{r:.7,l:1},
  gurney:{r:.6,l:1},cabinet:{r:.4,l:1},operating:{r:.6,l:1},bodybag:{r:.4,l:0},boiler:{r:.8,l:1},
  pipes:{r:0,l:1},cellbed:{r:.5,l:1},monitor:{r:.4,l:1},tank:{r:.6,l:1},archive:{r:.5,l:1},
  debris:{r:0,l:0},puddle:{r:0,l:0},paper:{r:0,l:0},snowpile:{r:0,l:0},blood:{r:0,l:0},
  grass2:{r:0,l:0},crack:{r:0,l:0},tapeplayer:{r:.2,l:1},box:{r:.4,l:1},
  radio:{r:.2,l:1},plant:{r:.25,l:1},mirror:{r:.1,l:1},
};

/* ------------------------------ scene factory ------------------------------ */
function newScene(id,w,h,base,opts){
  opts=opts||{};
  const g={w,h,d:makeGrid(w,h,base)};
  return {id,g,w,h,sprites:[],doors:[],ents:[],ints:[],lights:[],cs:opts.indoor?1:0.5,
    radZones:[],spawn:opts.spawn||{x:w/2,y:h/2},indoor:!!opts.indoor,
    name:opts.name||id,amb:opts.amb,cache:null,dirty:true,shifted:{},visits:0,
    dark:opts.dark==null?1:opts.dark,safe:opts.safe||null,tag:opts.tag||''};
}
function addInt(s,o){o.id=o.id||(o.type+'_'+Math.floor(o.x)+'_'+Math.floor(o.y));s.ints.push(o);return o;}
function addDoor(s,x,y,to,toSpawn,opt){
  opt=opt||{};
  const d={type:'door',x,y,to,spawn:toSpawn,locked:!!opt.locked,need:opt.need||null,
    label:opt.label||'الباب',msg:opt.msg||'',id:opt.id||('door_'+x+'_'+y),oneWay:!!opt.oneWay,
    power:!!opt.power,open:false};
  s.doors.push(d);
  setT(s.g,x,y,TL.DOOR);
  addInt(s,d);
  return d;
}
function addItem(s,x,y,key,label,opt){
  opt=opt||{};
  return addInt(s,{type:'item',x,y,key,label,id:opt.id||('item_'+key),once:true,
    note:opt.note,sprite:opt.sprite||'paper'});
}

/* =====================================================================
   ENV — Environment System (Phase 3)
   ---------------------------------------------------------------------
   A reusable, data-driven builder for psychological-horror spaces.
   It writes into the SAME tile grid the rest of the engine already uses,
   so collision, AI flow-field navigation, anomalies, save/load and the
   3D mesh keep working with zero changes elsewhere.

   Structures are carved "solid-first": fill a footprint with wall, then
   punch floor pockets (rooms / corridors) and door openings. That makes
   single-thickness walls and doors-on-real-wall-rows the default, which
   is exactly what hand-authored maps keep getting wrong.

   Everything here is ADDITIVE — the nine shipped scenes are untouched.
   Future districts (city / hospital / forest / labs / underground) are
   just more scenes composed from these same primitives.
   ===================================================================== */
const ENV={
  _ambScene:null,_ambTimer:null,

  /* ---------- scene shell ---------- */
  scene(id,w,h,base,opts){
    opts=opts||{};
    const s=newScene(id,w,h,base,opts);
    s.zones=[];                       // named regions {name,x,y,w,h,kind}
    s.atmo=opts.atmo||null;           // {fog,hemi,amb,fogColor,bg}
    s.ambAudio=opts.audio||null;      // {wind,hum,windFreq,events:[{sfx,min,max}]}
    return s;
  },

  /* ---------- terrain ---------- */
  ground(s,type,x0,y0,x1,y1){
    x0=x0||0;y0=y0||0;x1=x1==null?s.w:x1;y1=y1==null?s.h:y1;
    rect(s.g,x0,y0,x1-x0,y1-y0,type);return s;},
  noise(s,seed,bands,x0,y0,x1,y1){noiseFill(s.g,seed,bands,x0,y0,x1,y1);return s;},
  road(s,a,b,w){road(s.g,a,b,w==null?2:w);return s;},
  plaza(s,x,y,w,h,type){rect(s.g,x,y,w,h,type||TL.F_CONC);
    s.zones.push({name:'plaza',x:x,y:y,w:w,h:h,kind:'open'});return s;},
  border(s,type){box(s.g,0,0,s.w,s.h,type||TL.WALL);return s;},

  /* ---------- structures (solid-first carving) ---------- */
  /* sealed exterior volume — reads as a building block from the street */
  block(s,x,y,w,h,opts){
    opts=opts||{};
    rect(s.g,x,y,w,h,opts.fill||TL.ROOF);
    box(s.g,x,y,w,h,TL.WALL);
    if(opts.label)s.sprites.push({x:x+w/2,y:y-0.6,type:'sign',text:opts.label});
    s.zones.push({name:opts.name||'building',x:x,y:y,w:w,h:h,kind:'solid'});
    return s;},

  /* enterable interior: shell + carved rooms/corridors + openings + doors.
     def={x,y,w,h,floor,
          corridors:[{x,y,w,h,floor,name}], rooms:[{x,y,w,h,floor,name}],
          walls:[{x,y,w,h}], openings:[{x,y,floor}], doors:[{x,y,...}]}
     Room/corridor coords are ABSOLUTE grid tiles. Leave >=1 wall tile between
     adjacent floor pockets, or they merge (validate() reports merges). */
  interior(s,def){
    rect(s.g,def.x,def.y,def.w,def.h,TL.WALL);                       // 1. solid footprint
    const cf=def.floor||TL.F_CONC;
    (def.corridors||[]).forEach(c=>{rect(s.g,c.x,c.y,c.w,c.h,c.floor||cf);
      if(c.name)s.zones.push({name:c.name,x:c.x,y:c.y,w:c.w,h:c.h,kind:'corridor'});});
    (def.rooms||[]).forEach(r=>{rect(s.g,r.x,r.y,r.w,r.h,r.floor||cf);
      if(r.name)s.zones.push({name:r.name,x:r.x,y:r.y,w:r.w,h:r.h,kind:'room'});});
    (def.walls||[]).forEach(wl=>rect(s.g,wl.x,wl.y,wl.w,wl.h,TL.WALL));      // partitions
    (def.openings||[]).forEach(o=>setT(s.g,o.x,o.y,o.floor||TL.F_CONC));     // open doorway
    (def.doors||[]).forEach(d=>ENV.door(s,d.x,d.y,d));                       // real doors
    return s;},

  /* a door: scene-link (opt.to) or in-scene openable passage */
  door(s,x,y,opt){
    opt=opt||{};
    if(opt.to)return addDoor(s,x,y,opt.to,opt.spawn,opt);
    setT(s.g,x,y,opt.locked?TL.LOCKDOOR:TL.DOOR);
    const d={type:'door',x:x,y:y,to:null,locked:!!opt.locked,need:opt.need||null,
      label:opt.label||'باب',msg:opt.msg||'',id:opt.id||('door_'+x+'_'+y),
      static:!!opt.static,inScene:true,open:false};
    s.ints.push(d);            // interactable only — NOT in s.doors (keeps save/load clean)
    return s;},

  /* ---------- atmosphere: realistic lighting + dark/bright zones ---------- */
  atmo(s,a){s.atmo=Object.assign(s.atmo||{},a);return s;},
  light(s,L){s.lights.push(L);return s;},
  /* bright pool: street lamp, window spill, fire */
  bright(s,x,y,r,color,a,flick){
    s.lights.push({x:x,y:y,r:r,c:color||'rgba(255,206,140,',a:a==null?0.16:a,flick:flick||0.06});
    s.zones.push({name:'bright',x:x-r,y:y-r,w:r*2,h:r*2,kind:'light'});return s;},
  /* explicitly dark region (recorded for validation / mood) */
  dark(s,x,y,w,h,name){s.zones.push({name:name||'dark',x:x,y:y,w:w,h:h,kind:'dark'});return s;},

  /* ---------- ambient audio zone ---------- */
  audio(s,a){s.ambAudio=Object.assign(s.ambAudio||{},a);return s;},
  startAmbient(s){
    if(!A.ready||!A.on)return;
    const au=s.ambAudio;if(!au||!au.events||!au.events.length){ENV._ambScene=null;return;}
    if(ENV._ambScene===s.id)return;
    ENV._ambScene=s.id;
    clearTimeout(ENV._ambTimer);
    const tick=()=>{
      if(ENV._ambScene!==s.id||G.sceneId!==s.id||!A.ready)return;
      const ev=au.events[(Math.random()*au.events.length)|0];
      const min=ev.min||8,max=ev.max||20;
      ENV._ambTimer=setTimeout(tick,(min+Math.random()*(max-min))*1000);
      if(G.paused||G.over||!G.started||!A.on)return;
      ENV.ambientSfx(ev.sfx);
    };
    ENV._ambTimer=setTimeout(tick,(au.events[0].min||8)*1000);
  },
  /* subtle, non-jump-scare ambience (design rule: horror via uncertainty) */
  ambientSfx(kind){
    if(!A.ready||!A.on)return;
    const t=A.ctx.currentTime;
    if(kind==='drip'){noiseBurst(0.05,1800,3,0.020,'bandpass');setTimeout(()=>noiseBurst(0.04,1500,3,0.014),180);}
    else if(kind==='creak'){tone(70+Math.random()*40,0.7,0.022,'sine',50);noiseBurst(0.5,240,1.2,0.018);}
    else if(kind==='distant'){noiseBurst(1.2,160,0.5,0.020);tone(48,1.6,0.020,'sine');}
    else if(kind==='metal'){noiseBurst(0.3,900,2,0.020);}
    else if(kind==='gust'&&A.wind){A.wind.g.gain.linearRampToValueAtTime(0.46,t+1.4);
      setTimeout(()=>{if(A.ready&&A.wind)A.wind.g.gain.linearRampToValueAtTime(G.scene&&G.scene.ambAudio?G.scene.ambAudio.wind:0.2,A.ctx.currentTime+1.6);},2600);}
  },

  /* ---------- props ---------- */
  prop(s,x,y,type,opts){const o={x:x,y:y,type:type};if(opts)Object.assign(o,opts);s.sprites.push(o);return s;},
  scatter(s,types,n,x0,y0,x1,y1,opts){
    opts=opts||{};scatterSpr(s,mulberry32(opts.seed||1234),types,n,x0,y0,x1,y1,opts.avoidSolid);return s;},
  hide(s,x,y,label,id){return addInt(s,{type:'hide',x:x,y:y,label:label||'اختبئ',id:id||('hide_'+x+'_'+y)});},

  /* ---------- navigation / validation ---------- */
  /* flood-fill navigable tiles from (sx,sy). Doors count as passable (openable);
     LOCKDOOR does not (needs a key). Used for nav-readiness + tests. */
  reachable(s,sx,sy){
    const W=s.w,H=s.h,seen=new Uint8Array(W*H),q=[];
    const pass=(x,y)=>{const t=getT(s.g,x,y);return t===TL.DOOR||!solidT(t);};
    const push=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return;const i=y*W+x;if(seen[i]||!pass(x,y))return;seen[i]=1;q.push(i);};
    push(Math.floor(sx),Math.floor(sy));
    for(let k=0;k<q.length;k++){const i=q[k],x=i%W,y=(i/W)|0;push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1);}
    return seen;},
  /* full integrity report — nav-readiness, spawn safety, door/interactable reach */
  validate(s,spawn){
    const problems=[],sp=spawn||s.spawn,W=s.w;
    const pass=(x,y)=>{const t=getT(s.g,x,y);return t===TL.DOOR||!solidT(t);};
    if(!pass(Math.floor(sp.x),Math.floor(sp.y)))problems.push('spawn is inside a solid tile');
    const seen=ENV.reachable(s,sp.x,sp.y);
    for(const d of s.doors){
      const near=[[1,0],[-1,0],[0,1],[0,-1]].some(p=>{const x=d.x+p[0],y=d.y+p[1];
        return x>=0&&y>=0&&x<s.w&&y<s.h&&seen[y*W+x];});
      if(!near)problems.push('door '+(d.id||d.x+','+d.y)+' unreachable');
    }
    for(const it of s.ints){
      if(it.type==='locked')continue;
      const x=Math.floor(it.x),y=Math.floor(it.y);
      if(x<0||y<0||x>=s.w||y>=s.h)continue;
      if(!seen[y*W+x])problems.push('interactable '+(it.id||it.type)+' unreachable');
    }
    let nav=0,reach=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++)if(pass(x,y)){nav++;if(seen[y*W+x])reach++;}
    if(reach<nav)problems.push((nav-reach)+' navigable tiles sealed off from spawn');
    return {ok:problems.length===0,problems:problems,nav:nav,reach:reach,seen:seen};},
};

/* =====================================================================
   SCENES
   ===================================================================== */
const SCENES={};

/* ---------- APARTMENT (building 16) ---------- */
function buildApartment(){
  const s=newScene('apartment',26,20,TL.WALL,{indoor:true,name:'شقة 16 — الطابق الأرضي',
    spawn:{x:5.5,y:16.5},safe:{scene:'apartment',x:5.5,y:16.5}});
  const g=s.g;
  room(g,2,2,9,7,TL.F_WOOD);      // living
  room(g,13,2,7,7,TL.F_WOOD);     // child room
  room(g,2,12,7,6,TL.F_TILE);     // kitchen
  room(g,11,12,7,6,TL.F_WOOD);    // bedroom
  room(g,20,12,4,6,TL.F_TILE);    // bathroom
  rect(g,2,10,22,2,TL.F_CONC);    // hallway
  rect(g,11,9,2,3,TL.F_CONC);     // living <-> hall link
  setT(g,5,9,TL.DOOR);            // living -> hall
  setT(g,14,9,TL.DOOR);           // child -> hall
  setT(g,5,11,TL.DOOR);           // kitchen -> hall
  setT(g,14,11,TL.DOOR);          // bedroom -> hall
  setT(g,21,11,TL.DOOR);          // bathroom -> hall (locked)
  // entrance
  setT(g,5,18,TL.DOOR);
  addDoor(s,5,18,'outdoor',{x:39.5,y:49.6},{label:'الخروج إلى الشارع',id:'apt_exit'});
  /* --- props --- */
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  P(3.4,3.2,'sofa');P(6.6,3.0,'tv');P(8.4,4.2,'shelf');P(4.6,6.0,'table');P(3.2,7.6,'plant');
  P(14.2,3.0,'bed');P(18.6,3.0,'wardrobe');P(16.2,6.2,'toybox');P(14.0,7.6,'chair');
  P(3.0,13.0,'stove');P(5.6,13.0,'sink');P(7.2,16.4,'table');P(3.0,16.6,'drawer');
  P(12.0,13.2,'bed');P(16.4,13.0,'wardrobe');P(16.4,16.6,'drawer');
  P(21.0,13.2,'tub');P(22.6,16.4,'toilet');P(21.0,16.6,'sink');
  P(2.6,10.9,'wardrobe');           // hallway wardrobe = hiding spot
  /* --- lights --- */
  s.lights.push({x:5.5,y:4.5,r:5.0,c:'rgba(255,214,150,',a:.10,flick:.05});
  s.lights.push({x:16,y:4.5,r:3.4,c:'rgba(200,220,255,',a:.06,flick:.02});
  /* --- interactables --- */
  addInt(s,{type:'hide',x:2.6,y:10.9,label:'اختبئ داخل الخزانة',id:'apt_hide1'});
  addInt(s,{type:'hide',x:16.4,y:13.0,label:'اختبئ داخل الخزانة',id:'apt_hide2'});
  addInt(s,{type:'doc',x:4.6,y:6.0,id:'doc_photo_family',label:'صورة عائلية',doc:'photo_family',sprite:'paper'});
  addInt(s,{type:'doc',x:7.2,y:16.4,id:'doc_diary',label:'دفتر يوميات',doc:'diary',sprite:'paper'});
  addInt(s,{type:'item',x:3.0,y:16.6,key:'key_bath',label:'درج المطبخ — مفتاح صغير',id:'it_key_bath',
    note:'مفتاح حمّام. لا أعرف لماذا يُقفل الناس حمّاماتهم في مدينة مهجورة.',sprite:'paper'});
  addInt(s,{type:'item',x:16.4,y:16.6,key:'batteries',label:'بطاريات',id:'it_batt1',sprite:'box',
    note:'بطاريات للكشاف. ما زالت تعمل.'});
  addInt(s,{type:'item',x:6.6,y:3.0,key:'tapeplayer',label:'مشغّل أشرطة',id:'it_player',sprite:'tapeplayer',
    note:'مشغّل أشرطة سوفيتي. يعمل بالكهرباء… أو بالبطاريات.'});
  addInt(s,{type:'search',x:14.2,y:3.0,id:'apt_underbed',label:'ابحث تحت السرير',
    give:'tape1',once:true,needFlag:null,
    text:'لوحة خشبية مفكوكة خلف السرير. خلفها شريط.'});
  addInt(s,{type:'doc',x:16.2,y:6.2,id:'doc_drawing',label:'رسمة طفل',doc:'drawing',sprite:'paper',
    onTake:()=>giveSym('atom')});
  addInt(s,{type:'doc',x:21.0,y:16.6,id:'doc_bath_note',label:'ورقة على المغسلة',doc:'bath_note',sprite:'paper',
    locked:true,need:'key_bath',once:true});
  s.doors.push({type:'door',x:21,y:11,to:null,locked:true,need:'key_bath',label:'باب الحمّام (مقفل)',
    id:'apt_bath_door',static:true,open:false});
  s.ints.push(s.doors[s.doors.length-1]);
  /* memory-layer room: child room changes on revisit */
  s.shiftFn=aptShift;
  return s;
}
function aptShift(s,n){
  const g=s.g;
  if(n>=2&&!s.shifted.child){
    s.shifted.child=true;
    s.sprites.push({x:15.4,y:5.0,type:'toybox'});
    s.sprites.push({x:18.2,y:7.4,type:'chair'});
    addInt(s,{type:'doc',x:18.2,y:7.4,id:'doc_extra_photo',label:'صورة لم تكن هنا',doc:'extra_photo',sprite:'paper'});
    s.lights.push({x:16,y:5,r:3.2,c:'rgba(255,226,170,',a:.16,flick:.14,memory:true});
  }
}

/* ---------- SCHOOL ---------- */
function buildSchool(){
  const s=newScene('school',34,24,TL.WALL,{indoor:true,name:'المدرسة الثانوية',
    spawn:{x:30.5,y:19.5},safe:{scene:'school',x:30.5,y:19.5}});
  const g=s.g;
  room(g,4,3,7,6,TL.F_WOOD);         // classroom1 (NW)
  room(g,12,3,7,6,TL.F_WOOD);        // classroom2
  room(g,20,3,7,6,TL.F_WOOD);        // staff room
  room(g,29,3,4,6,TL.F_WOOD);        // classroom3
  room(g,2,15,6,6,TL.F_WOOD);        // Block C (hidden room)
  room(g,11,15,12,7,TL.F_WOOD);      // gym
  room(g,25,15,3,4,TL.F_WOOD);       // storage
  room(g,27,17,6,5,TL.F_TILE);       // entrance hall
  rect(g,4,10,26,3,TL.F_CONC);       // main corridor rows 10-12 (walls 9 & 13)
  rect(g,29,12,2,6,TL.F_CONC);       // hall -> corridor
  rect(g,28,10,3,8,TL.F_CONC);       // corridor <-> hall link (through both walls)
  doorAt(g,7,9);doorAt(g,15,9);doorAt(g,23,9);doorAt(g,30,9);   // classrooms (their south wall = row 9)
  setT(g,15,13,TL.DOOR);             // corridor -> gym (wall row 13)
  setT(g,25,16,TL.DOOR);             // corridor -> storage (wall col 24 is corridor floor)
  setT(g,5,12,TL.WALL);              // block-C doorway: solid until shifted
  s.blockC={x:5,y:12};
  setT(g,30,22,TL.DOOR);             // entrance to street
  addDoor(s,30,22,'outdoor',{x:52.5,y:45.6},{label:'الخروج إلى الشارع',id:'school_exit'});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  for(let i=0;i<4;i++){P(5.4+i*1.5,4.6,'desk');P(5.4+i*1.5,6.6,'desk');}
  P(5,8.2,'board');P(10.2,4.2,'shelf');
  for(let i=0;i<4;i++){P(13.4+i*1.5,4.6,'desk');P(13.4+i*1.5,6.6,'desk');}
  P(13,8.2,'board');
  P(21.4,4.4,'desk');P(23.4,4.4,'desk');P(25.4,4.4,'shelf');P(21.4,7.4,'table');P(25.6,7.6,'cabinet');
  P(30.4,4.6,'desk');P(31.8,6.6,'desk');P(30,8.2,'board');
  P(28.2,18.4,'locker');P(28.2,20.4,'locker');P(32.4,18.4,'bench');P(31.4,21.2,'debris');
  P(13,17,'piano');P(17,16,'bench');P(20,19,'toybox');
  P(26,16.4,'shelf');P(26,17.8,'crate');
  P(3,16,'wardrobe');P(3,20,'toybox');P(7,18,'table');
  s.lights.push({x:16,y:11.5,r:6,c:'rgba(210,225,235,',a:.05,flick:.06});
  s.lights.push({x:29,y:19,r:4.5,c:'rgba(255,220,170,',a:.07,flick:.03});
  addInt(s,{type:'hide',x:3,y:16,label:'اختبئ داخل الخزانة',id:'sch_hide1'});
  addInt(s,{type:'hide',x:28.2,y:18.4,label:'اختبئ داخل الخزانة',id:'sch_hide2'});
  addInt(s,{type:'doc',x:21.4,y:7.4,id:'doc_school_photo',label:'صورة قديمة (ثلاثة مبانٍ)',doc:'school_photo',sprite:'paper'});
  addInt(s,{type:'doc',x:25.6,y:7.6,id:'doc_zone_map',label:'خريطة المنطقة',doc:'zone_map',sprite:'paper',
    onTake:()=>{giveSym('eye');G.flags.knowSubstation=true;setObjective('اذهب إلى محطة التحويل الكهربائية جنوب شرق المدينة','الخريطة تُظهر منشأة صغيرة خارج الخرائط الرسمية.');}});
  addInt(s,{type:'doc',x:26,y:16.4,id:'doc_evac',label:'سجلّ الإخلاء',doc:'evac',sprite:'paper'});
  addInt(s,{type:'search',x:3,y:20,id:'sch_toybox',label:'صندوق الألعاب',text:'دمى، دفاتر، ورائحة غبار عمرها أربعون سنة.',once:true});
  s.shiftFn=schoolShift;
  /* entities */
  s.ents.push({type:'creature',kind:'failed',x:15,y:18,patrol:[[13,17],[21,20],[17,16]],state:'patrol',hp:1});
  s.ents.push({type:'nika',x:31,y:18,id:'nika'});
  return s;
}
function schoolShift(s,n){
  if(!s.shifted.blockC&&G.flags.blockCOpen){
    s.shifted.blockC=true;
    room(s.g,2,15,6,6,TL.F_WOOD);
    setT(s.g,5,12,TL.F_CONC);
    s.sprites.push({x:5,y:16,type:'shelf'});
    s.sprites.push({x:3.4,y:19,type:'monitor'});
    addInt(s,{type:'doc',x:5,y:16,id:'doc_blockc',label:'لوحة معدنية على الرف',doc:'blockc',sprite:'paper',
      onTake:()=>giveSym('wave')});
    return;
  }
  if(n>=2&&!s.shifted.corridor){
    s.shifted.corridor=true;
    /* corridor becomes longer: new door appears in a wall that had none */
    setT(s.g,10,10,TL.DOOR);
    s.lights.push({x:10,y:11,r:3,c:'rgba(180,210,255,',a:.07,flick:.2});
    s.sprites.push({x:10.6,y:12.4,type:'paper'});
  }
}

/* ---------- KINDERGARTEN ---------- */
function buildKinder(){
  const s=newScene('kindergarten',22,16,TL.WALL,{indoor:true,name:'روضة الأطفال',
    spawn:{x:4.5,y:13.5},indoorAmb:.96,safe:{scene:'kindergarten',x:4.5,y:13.5}});
  const g=s.g;
  room(g,2,6,6,6,TL.F_WOOD);      // playroom (NW) — north wall row 5 = kitchen south wall
  room(g,10,2,8,6,TL.F_WOOD);     // bedroom (NE)
  room(g,2,2,6,3,TL.F_TILE);      // kitchen (N) — south wall row 4
  room(g,10,10,8,4,TL.F_WOOD);    // main hall (S)
  rect(g,8,7,2,7,TL.F_CONC);      // vertical corridor
  rect(g,2,12,8,2,TL.F_CONC);     // entry corridor
  setT(g,8,9,TL.DOOR);            // playroom -> corridor (playroom east wall col 8)
  setT(g,9,4,TL.DOOR);            // corridor -> bedroom (bedroom west wall col 9)
  setT(g,5,5,TL.DOOR);            // kitchen -> playroom (shared wall row 5)
  setT(g,4,14,TL.DOOR);
  addDoor(s,4,14,'outdoor',{x:45.5,y:37.6},{label:'الخروج',id:'kinder_exit'});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  P(3,8,'toybox');P(6.4,8,'piano');P(3,11,'cot');P(6.4,11,'cot');
  P(11,3,'cot');P(13,3,'cot');P(15,3,'cot');P(11,6,'cot');P(13,6,'cot');P(16.6,3,'wardrobe');
  P(3,3,'stove');P(6,3,'sink');P(3.4,5,'drawer');
  P(11,12,'table');P(14,12,'chair');P(16.6,13,'shelf');P(12,13.4,'toybox');
  s.lights.push({x:13,y:12,r:4,c:'rgba(255,225,180,',a:.07,flick:.05});
  addInt(s,{type:'hide',x:16.6,y:3,label:'اختبئ داخل الخزانة',id:'kin_hide1'});
  addInt(s,{type:'search',x:6.4,y:8,id:'kin_musicbox',label:'صندوق الموسيقى',once:true,
    give:'sym_zero',text:'صندوق موسيقى خشبي. في قاعدته لوحة نحاسية محفورة.',
    onTake:()=>giveSym('zero')});
  addInt(s,{type:'doc',x:3.4,y:3.4,id:'doc_kinder_note',label:'ملاحظة المعلّمة',doc:'kinder_note',sprite:'paper'});
  addInt(s,{type:'item',x:16.6,y:13,key:'medkit',label:'حقيبة إسعاف',id:'it_med1',sprite:'box'});
  s.ents.push({type:'psy',x:13,y:5,id:'kin_psy'});
  return s;
}

/* ---------- SUBSTATION ---------- */
function buildSubstation(){
  const s=newScene('substation',22,18,TL.GRASS,{name:'محطة التحويل الكهربائية',
    spawn:{x:11,y:16},indoor:true,safe:{scene:'substation',x:11,y:16}});
  const g=s.g;
  rect(g,0,0,22,18,TL.GRASS);
  box(g,0,0,22,18,TL.FENCE);
  rect(g,8,15,4,3,TL.F_METAL);   // gate area floor
  setT(g,11,17,TL.DOOR);
  addDoor(s,11,17,'outdoor',{x:90.5,y:66.6},{label:'الخروج',id:'sub_exit'});
  room(g,2,2,10,6,TL.F_CONC);    // control room
  room(g,14,2,6,6,TL.F_CONC);    // shed
  setT(g,7,8,TL.DOOR);setT(g,16,8,TL.DOOR);
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  P(3.4,3.4,'panel');P(5.4,3.4,'monitor');P(9,3.4,'cabinet');P(3.4,6.6,'table');P(9.4,6.8,'crate');
  P(15,3.4,'transformer');P(18,3.4,'transformer');P(15,6.6,'locker');P(18.4,6.6,'crate');
  P(6,12,'transformer');P(14,12,'transformer');P(10,10.4,'puddle');P(4,14,'debris');
  s.lights.push({x:7,y:5,r:4,c:'rgba(200,225,255,',a:.06,flick:.12});
  addInt(s,{type:'hide',x:15,y:6.6,label:'اختبئ داخل الخزانة',id:'sub_hide1'});
  addInt(s,{type:'terminal',x:3.4,y:3.4,id:'sub_panel',label:'لوحة التحكم',
    code:['atom','wave','eye'],reward:'power',
    hint:'ثلاثة رموز. الصورة القديمة في غرفة المدرّسين ترتّبها.'});
  addInt(s,{type:'search',x:15,y:6.6,id:'sub_locker',label:'خزانة معدنية (مقفلة)',once:true,needFlag:'power',
    give:'tape2',keycard:true,text:'الخزانة فُتحت بعد عودة التيار. بداخلها بطاقة وشريط.',
    onTake:()=>{G.items.keycard=true;toast('حصلت على: بطاقة الوصول','KEYCARD — BLACK SITE-4');}});
  addInt(s,{type:'doc',x:3.4,y:6.6,id:'doc_shift_log',label:'سجلّ الورديات',doc:'shift_log',sprite:'paper'});
  s.ents.push({type:'creature',kind:'failed',x:16,y:13,patrol:[[5,13],[17,13],[11,10]],state:'patrol'});
  return s;
}

/* ---------- HOSPITAL GROUND ---------- */
function buildHospital(){
  const s=newScene('hospital',34,24,TL.WALL,{indoor:true,name:'مستشفى بريبيات — الطابق الأرضي',
    spawn:{x:16.5,y:21.5},safe:{scene:'hospital',x:16.5,y:21.5}});
  const g=s.g;
  room(g,13,18,7,5,TL.F_TILE);      // entrance hall
  rect(g,5,11,26,3,TL.F_TILE);      // main corridor (rows 11-13)
  rect(g,16,14,2,4,TL.F_TILE);      // hall -> corridor
  room(g,5,3,8,7,TL.F_TILE);        // ward A
  room(g,15,3,7,7,TL.F_TILE);       // ward B / theatre
  room(g,24,3,7,7,TL.F_TILE);       // ward C
  room(g,5,15,8,7,TL.F_TILE);       // maternity
  room(g,25,15,6,7,TL.F_TILE);      // records
  doorAt(g,8,10);doorAt(g,18,10);doorAt(g,27,10);   // wards (wall row 10)
  doorAt(g,8,14);doorAt(g,27,14);                    // maternity / records (corridor south wall = row 14)
  setT(g,30,13,TL.LOCKDOOR);        // basement door
  setT(g,16,23,TL.DOOR);
  addDoor(s,16,23,'outdoor',{x:98.5,y:50.6},{label:'الخروج',id:'hosp_exit'});
  const d=addDoor(s,30,13,'basement',{x:16.5,y:3.5},
    {label:'باب القبو — يحتاج بطاقة والتيار',id:'hosp_base_door',locked:true,need:'keycard',power:true});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  for(let i=0;i<4;i++){P(6.4+i*1.9,4.6,'gurney');P(6.4+i*1.9,7.6,'gurney');}
  P(16.4,4.4,'operating');P(19,4.4,'cabinet');P(20.4,7.6,'monitor');P(16.4,8,'gurney');
  for(let i=0;i<3;i++){P(25.4+i*2,4.6,'bed');P(25.4+i*2,7.6,'bed');}
  for(let i=0;i<3;i++){P(6.4+i*2.2,17.6,'bed');}
  P(6.4,20.6,'cot');P(9,20.6,'cot');P(11.4,20.6,'cabinet');
  P(26.4,17.4,'shelf');P(26.4,19,'shelf');P(26.4,20.6,'archive');P(29.4,17.4,'archive');P(29.4,20.6,'table');
  P(14,19,'bench');P(19,19,'locker');P(15,21.4,'debris');
  s.lights.push({x:16,y:12.5,r:6,c:'rgba(215,230,240,',a:.05,flick:.09});
  s.lights.push({x:18,y:6,r:4,c:'rgba(255,240,220,',a:.07,flick:.03});
  addInt(s,{type:'hide',x:19,y:19,label:'اختبئ داخل الخزانة',id:'hos_hide1'});
  addInt(s,{type:'hide',x:6.4,y:20.6,label:'اختبئ تحت السرير',id:'hos_hide2'});
  addInt(s,{type:'doc',x:29.4,y:20.6,id:'doc_patient',label:'ملف مريضة — 1986',doc:'patient',sprite:'paper'});
  addInt(s,{type:'doc',x:11.4,y:20.6,id:'doc_maternity',label:'سجلّ الولادة',doc:'maternity',sprite:'paper'});
  addInt(s,{type:'search',x:26.4,y:20.6,id:'hos_archive',label:'أرشيف',once:true,text:'ملفات مكرّرة. الاسم نفسه في ثلاثة ملفات مختلفة.'});
  s.ents.push({type:'creature',kind:'failed',x:27,y:12,patrol:[[28,12],[8,12],[20,12]],state:'patrol'});
  s.ents.push({type:'creature',kind:'retained',x:8,y:6,patrol:[[7,5],[11,8],[7,8]],state:'patrol'});
  return s;
}

/* ---------- HOSPITAL BASEMENT ---------- */
function buildBasement(){
  const s=newScene('basement',22,16,TL.WALL,{indoor:true,name:'قبو المستشفى',
    spawn:{x:16.5,y:3.5},safe:{scene:'basement',x:16.5,y:3.5}});
  const g=s.g;
  rect(g,3,3,16,3,TL.F_CONC);        // main corridor
  room(g,2,7,6,6,TL.F_TILE);         // morgue
  room(g,9,7,5,6,TL.F_CONC);         // boiler
  room(g,15,7,5,6,TL.F_CONC);        // storage
  doorAt(g,5,6);doorAt(g,11,6);doorAt(g,17,6);
  setT(g,19,4,TL.LOCKDOOR);          // elevator (corridor end wall)
  addDoor(s,16,2,'hospital',{x:30.5,y:14.5},{label:'الصعود إلى المستشفى',id:'base_up'});
  setT(g,3,4,TL.DOOR);
  addDoor(s,3,4,'tunnels',{x:3.5,y:20.5},{label:'دَرَجٌ ينزل في الظلام',id:'base_stairs'});
  addDoor(s,19,4,'tunnels',{x:3.5,y:3.5},{label:'المصعد — ينزل إلى الأسفل',id:'base_elev',locked:true,need:'archkey'});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  P(3,4,'bodybag');P(6,4,'bodybag');P(9,5,'pipes');P(14,4,'pipes');
  P(3,9,'bodybag');P(5,9,'bodybag');P(3,11.6,'cabinet');P(6.6,11.6,'gurney');
  P(10,9,'boiler');P(12.4,11.6,'pipes');
  P(16,9,'shelf');P(18.6,9,'crate');P(16,11.6,'archive');P(18.6,11.6,'box');
  s.lights.push({x:11,y:4,r:5,c:'rgba(255,190,150,',a:.07,flick:.16});
  s.lights.push({x:10,y:10,r:3.5,c:'rgba(255,140,80,',a:.10,flick:.22});
  addInt(s,{type:'hide',x:16,y:9,label:'اختبئ خلف الرفوف',id:'bas_hide1'});
  addInt(s,{type:'search',x:5,y:9,id:'bas_bags',label:'أكياس الجثث',once:true,
    text:'ثلاثة أكياس. اثنان فارغان. الثالث… فارغ أيضًا، لكنه دافئ.',
    onTake:()=>{G.echo=Math.max(G.echo,.35);SFX.dread();}});
  addInt(s,{type:'doc',x:16,y:11.6,id:'doc_echo1',label:'ملف — PROJECT ECHO',doc:'echo1',sprite:'paper',
    onTake:()=>giveSym('eye')});
  s.ents.push({type:'creature',kind:'failed',x:11,y:11,patrol:[[4,11],[17,11],[11,9]],state:'patrol'});
  s.shiftFn=(sc,n)=>{if(n>=2&&!sc.shifted.bags){sc.shifted.bags=true;
    sc.sprites.push({x:7.6,y:9,type:'bodybag'});}};
  return s;
}

/* ---------- TUNNELS ---------- */
function buildTunnels(){
  const s=newScene('tunnels',42,24,TL.WALL,{indoor:true,name:'الأنفاق',
    spawn:{x:3.5,y:3.5},safe:{scene:'tunnels',x:3.5,y:3.5}});
  const g=s.g;
  rect(g,2,2,38,4,TL.F_METAL);          // main corridor
  rect(g,4,6,4,7,TL.F_METAL);           // south spur -> observation
  setT(g,5,6,TL.F_METAL);                // spur mouth
  room(g,2,13,9,7,TL.F_LAB);            // observation (north wall row 12)
  rect(g,14,6,4,8,TL.F_METAL);          // north spur -> lab
  setT(g,15,6,TL.F_METAL);setT(g,16,6,TL.F_METAL);   // spur mouth
  room(g,11,13,11,8,TL.F_LAB);          // lab (north wall row 12)
  room(g,28,13,10,7,TL.F_LAB);          // archive (west wall col 27)
  rect(g,22,16,6,3,TL.F_METAL);         // link lab -> archive (carved last)
  doorAt(g,5,12);doorAt(g,15,12);
  addDoor(s,2,3,'basement',{x:19.5,y:4.5},{label:'العودة إلى القبو',id:'tun_up'});
  addDoor(s,27,17,'blacksite',{x:3.5,y:9.5},{label:'الباب المدرّع — الأرشيف',id:'tun_arch',locked:true,need:'archkey'});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  for(let i=0;i<12;i++)P(3+i*3,2.4,'pipes');
  P(6,4.6,'debris');P(20,4.6,'crate');P(30,4.4,'puddle');P(36,4.6,'fire');
  P(3,14,'cellbed');P(3,17,'cellbed');P(6.6,14,'monitor');P(9,17,'tank');P(5,19,'blood');
  P(12,15,'monitor');P(15,15,'tank');P(18,15,'monitor');P(12,19,'table');P(20,19,'cabinet');
  P(29,14,'archive');P(29,17,'archive');P(32,14,'archive');P(32,17,'archive');P(35,14,'archive');P(35,17,'archive');
  P(36.6,19,'table');
  s.lights.push({x:10,y:4,r:5,c:'rgba(255,90,60,',a:.10,flick:.2});
  s.lights.push({x:26,y:4,r:5,c:'rgba(255,90,60,',a:.09,flick:.14});
  s.lights.push({x:6,y:16,r:4,c:'rgba(140,200,255,',a:.06,flick:.1});
  addInt(s,{type:'hide',x:20,y:19,label:'اختبئ خلف الخزائن',id:'tun_hide1'});
  addInt(s,{type:'doc',x:12,y:19,id:'doc_obs',label:'شاشة المراقبة',doc:'obs_log',sprite:'paper'});
  addInt(s,{type:'item',x:3,y:17,key:'archkey',label:'مفتاح الأرشيف (على السرير)',id:'it_archkey',sprite:'paper',
    note:'مفتاح مدرّع. عليه ختم: АРХИВ.'});
  addInt(s,{type:'search',x:15,y:15,id:'tun_tank',label:'خزان',once:true,
    text:'سائل عكر. شيء ما كان هنا لفترة طويلة. ليس الآن.',
    onTake:()=>{G.echo=Math.max(G.echo,.6);SFX.dread();}});
  s.ents.push({type:'creature',kind:'retained',x:24,y:4,patrol:[[10,4],[34,4],[20,4]],state:'patrol'});
  s.ents.push({type:'creature',kind:'failed',x:6,y:17,patrol:[[4,15],[9,19],[4,19]],state:'patrol'});
  s.ents.push({type:'psy',x:30,y:4,id:'tun_psy'});
  return s;
}

/* ---------- BLACK SITE-4 : ARCHIVE ---------- */
function buildBlacksite(){
  const s=newScene('blacksite',20,16,TL.WALL,{indoor:true,name:'BLACK SITE-4 — الأرشيف',
    spawn:{x:3.5,y:9.5},safe:{scene:'blacksite',x:3.5,y:9.5}});
  const g=s.g;
  rect(g,2,2,16,12,TL.F_LAB);
  box(g,2,2,16,12,TL.WALL);
  rect(g,2,7,16,3,TL.F_METAL);
  setT(g,2,8,TL.LOCKDOOR);
  addDoor(s,2,8,'tunnels',{x:23.5,y:17.5},{label:'العودة إلى الأنفاق',id:'bs_exit'});
  const P=(x,y,t)=>s.sprites.push({x,y,type:t});
  for(let i=0;i<5;i++){P(4+i*2.6,3.4,'archive');P(4+i*2.6,12.4,'archive');}
  P(9,8,'table');P(15,8,'monitor');P(6,8,'tapeplayer');
  s.lights.push({x:10,y:8,r:6,c:'rgba(255,240,210,',a:.13,flick:.06});
  s.lights.push({x:15,y:8,r:3,c:'rgba(120,200,255,',a:.10,flick:.2});
  addInt(s,{type:'doc',x:6,y:8,id:'doc_echo2',label:'ملف — PROJECT ECHO (نسخة كاملة)',doc:'echo2',sprite:'paper',
    onTake:()=>{G.flags.echo2=true;}});
  addInt(s,{type:'doc',x:15,y:8,id:'doc_zero1',label:'ملف — PROJECT ZERO',doc:'zero1',sprite:'paper'});
  addInt(s,{type:'search',x:4,y:3.4,id:'bs_cab1',label:'خزانة ملفات A–D',once:true,text:'فارغة. أُفرغت بعجلة.'});
  addInt(s,{type:'search',x:6.6,y:3.4,id:'bs_cab2',label:'خزانة ملفات E–K',once:true,text:'ملف طبي باسم ELENA VOLKOVA. ممزّق.'});
  addInt(s,{type:'search',x:9.2,y:3.4,id:'bs_cab3',label:'خزانة ملفات L–R',once:true,text:'تقارير عن "Retention". أرقام تتناقض مع نفسها.'});
  addInt(s,{type:'final',x:9,y:8,id:'bs_final',label:'ملف على الطاولة',once:true,need:'allDocs'});
  addInt(s,{type:'tape',x:16.4,y:12.4,id:'bs_tape3',label:'شريط — ELENA',tape:'tape3',once:true});
  s.ents.push({type:'subject01',x:14,y:11,id:'s01'});
  return s;
}

/* =====================================================================
   OUTDOOR — the Zone
   ===================================================================== */
const BLDS=[
 {id:'b_apt',   x:36,y:42,w:12,h:8, scene:'apartment',   dx:3, dy:9, sx:39, sy:50, label:'مبنى سكني 16'},
 {id:'b_shop',  x:52,y:42,w:8, h:6, dx:3, dy:7, label:'متجر', deco:true},
 {id:'b_kind',  x:42,y:30,w:10,h:7, scene:'kindergarten',dx:3, dy:8, sx:45, sy:38, label:'روضة الأطفال'},
 {id:'b_hotel', x:58,y:30,w:8, h:8, dx:4, dy:9, label:'فندق بوليسيا', deco:true},
 {id:'b_palace',x:24,y:30,w:14,h:10,dx:6, dy:11,label:'قصر الثقافة', deco:true},
 {id:'b_pool',  x:22,y:58,w:12,h:8, dx:5, dy:9, label:'مسبح لازورني', deco:true},
 {id:'b_school',x:48,y:38,w:14,h:8, scene:'school',      dx:28,dy:23,sx:52, sy:46, label:'المدرسة الثانوية'},
 {id:'b_hosp',  x:92,y:38,w:16,h:12,scene:'hospital',    dx:16,dy:23,sx:98, sy:51, label:'مستشفى بريبيات'},
 {id:'b_ind',   x:102,y:70,w:10,h:8, dx:5,dy:9, label:'منشأة صناعية', deco:true},
];
const WHEEL={x:33,y:50,r:7};

function buildOutdoor(){
  const W=160,H=120;
  const s=newScene('outdoor',W,H,TL.GRASS,{name:'منطقة الاستبعاد',spawn:{x:22.5,y:23.5},
    safe:{scene:'outdoor',x:22.5,y:23.5}});
  const g=s.g,rnd=mulberry32(9137);
  /* base terrain */
  noiseFill(g,11,[[TL.GRASS,0.44],[TL.F_DIRT,0.55],[TL.RUB,0.60],[TL.GRASS,1.01]]);
  /* water: river/puddle basin SW */
  for(let y=78;y<H;y++)for(let x=0;x<52;x++){
    const n=fbm(x*0.05,y*0.05,77);
    if(n>0.56-(y-78)*0.012)setT(g,x,y,TL.WATER);
  }
  /* RED FOREST band */
  for(let y=0;y<16;y++)for(let x=0;x<W;x++){
    const n=fbm(x*0.07,y*0.07,5);
    if(n>0.40)setT(g,x,y,TL.F_DIRT);
    if(n>0.30&&n<0.40)setT(g,x,y,TL.RUB);
  }
  /* ROADS */
  const roadPts=[[24,24],[28,30],[30,48],[60,48],[100,50],[120,52],[132,54]];
  for(let i=0;i<roadPts.length-1;i++)road(g,roadPts[i],roadPts[i+1],2);
  road(g,[30,48],[30,52],[2]);
  road(g,[30,52],[36,55],[2]);
  road(g,[36,55],[60,55],[2]);
  road(g,[60,55],[60,48],[2]);
  road(g,[36,55],[34,60],[2]);
  road(g,[100,50],[100,62],[2]);
  road(g,[100,62],[90,66],[2]);
  road(g,[90,66],[104,66],[2]);
  road(g,[30,48],[30,40],[2]);
  road(g,[30,40],[44,40],[2]);
  road(g,[44,40],[44,46],[2]);
  /* crash clearing */
  for(let y=14;y<32;y++)for(let x=12;x<34;x++){
    if(dist(x,y,22.5,23.5)<10.5)setT(g,x,y,TL.F_DIRT);
  }
  for(let y=21;y<27;y++)for(let x=19;x<27;x++)setT(g,x,y,TL.F_DIRT);
  rect(g,19,26,8,3,TL.RUB);
  /* forest: groves, never walls */
  const isClear=(x,y)=>{
    if(dist(x,y,60,48)<30)return true;
    if(dist(x,y,22.5,23.5)<12)return true;
    if(dist(x,y,33,50)<14)return true;
    if(dist(x,y,90,66)<17)return true;
    if(dist(x,y,30,34)<8)return true;
    for(const b of BLDS)if(x>b.x-5&&x<b.x+b.w+5&&y>b.y-5&&y<b.y+b.h+7)return true;
    return false;
  };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=getT(g,x,y);
    if(t!==TL.GRASS&&t!==TL.F_DIRT)continue;
    if(isClear(x,y)){
      if(hash2(x,y,9)>0.986&&dist(x,y,60,48)>18)setT(g,x,y,TL.RUB);
      continue;
    }
    const n=fbm(x*0.10,y*0.10,31),n2=hash2(x,y,9);
    const red=y<16;
    const th=red?0.60:0.605;
    if(n>th){
      setT(g,x,y,(red&&n2<0.45)?TL.DEAD:TL.TREE);
    }else if(n2>0.972)setT(g,x,y,TL.RUB);
  }
  /* snow patches that shouldn't be there (Layer 3) */
  for(let i=0;i<26;i++){
    const x=Math.floor(rnd()*W),y=Math.floor(rnd()*H);
    if(getT(g,x,y)===TL.GRASS)setT(g,x,y,TL.SNOW);
  }
  /* buildings */
  for(const b of BLDS){
    rect(g,b.x,b.y,b.w,b.h,TL.ROOF);
    box(g,b.x,b.y,b.w,b.h,TL.WALL);
    if(b.scene){
      const dx=b.x+b.dx,dy=b.y+b.h-1;
      setT(g,dx,dy,TL.DOOR);
      addDoor(s,dx,dy,b.scene,{x:b.sx,y:b.sy},{label:'ادخل — '+b.label,id:'od_'+b.id});
    }else{
      const dx=b.x+b.dx,dy=b.y+b.h;
      addInt(s,{type:'locked',x:dx+0.5,y:dy+1.2,label:b.label,
        msg:'الباب مسدود من الداخل. شيء ما سقط خلفه منذ زمن.'});
      s.sprites.push({x:dx+0.5,y:dy+0.3,type:'debris'});
      for(let j=1;j<=3;j++)for(let i=-1;i<=1;i++){
        const t=getT(g,dx+i,dy+j);
        if(t===TL.TREE||t===TL.DEAD||t===TL.RUB||t===TL.FENCE||t===TL.WATER)setT(g,dx+i,dy+j,TL.F_DIRT);
      }
    }
    s.sprites.push({x:b.x+b.w/2,y:b.y-0.6,type:'sign',text:b.label});
  }
  /* pavement / approach in front of every building */
  for(const b of BLDS){
    for(let x=b.x-1;x<=b.x+b.w;x++){
      for(let y=b.y+b.h+1;y<=b.y+b.h+2;y++){
        const t=getT(g,x,y);
        if(t===TL.TREE||t===TL.DEAD||t===TL.RUB||t===TL.WATER||t===TL.FENCE)setT(g,x,y,TL.F_DIRT);
      }
    }
    if(b.deco){
      const dx=b.x+b.dx;
      for(let j=0;j<=2;j++){
        const t=getT(g,dx,b.y+b.h+j);
        if(t!==TL.WATER&&t!==TL.DOOR)setT(g,dx,b.y+b.h+j,TL.F_CONC);
      }
    }
  }
  /* sidewalks: grass next to any road becomes walkable ground */
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(getT(g,x,y)!==TL.GRASS)continue;
    let near=false;
    for(let j=-1;j<=1&&!near;j++)for(let i=-1;i<=1;i++){
      const t=getT(g,x+i,y+j);
      if(t===TL.ROAD||t===TL.F_CONC){near=true;break;}
    }
    if(near)setT(g,x,y,TL.F_DIRT);
  }
  /* checkpoint yard */
  rect(g,25,30,10,8,TL.F_CONC);
  road(g,[30,38],[30,48],1);
  rect(g,29,36,3,4,TL.ROAD);
  /* substation compound */
  rect(g,84,60,14,12,TL.F_DIRT);
  box(g,84,60,14,12,TL.FENCE);
  setT(g,90,71,TL.DOOR);
  addDoor(s,90,71,'substation',{x:11,y:16},{label:'محطة التحويل',id:'od_sub'});
  s.sprites.push({x:91,y:59.2,type:'sign',text:'محطة التحويل'});
  for(let i=0;i<5;i++)s.sprites.push({x:86+i*2.4,y:64,type:'transformer'});
  /* FERRIS WHEEL */
  s.sprites.push({x:WHEEL.x,y:WHEEL.y,type:'wheel',r:WHEEL.r});
  for(let a=0;a<TAU;a+=TAU/16){
    const rx=WHEEL.x+Math.cos(a)*WHEEL.r,ry=WHEEL.y+Math.sin(a)*WHEEL.r;
    if(!walkable(g,Math.floor(rx),Math.floor(ry)))continue;
    if(hash2(Math.floor(rx),Math.floor(ry),4)<0.25)setT(g,Math.floor(rx),Math.floor(ry),TL.RUB);
  }
  /* plaza */
  rect(g,28,56,14,3,TL.F_CONC);
  s.sprites.push({x:29,y:57.4,type:'bench'});s.sprites.push({x:40,y:57.4,type:'bench'});
  s.sprites.push({x:34.6,y:53.4,type:'slide'});
  /* crash site props */
  s.sprites.push({x:22.5,y:22.5,type:'wreck'});
  s.sprites.push({x:24.6,y:20.4,type:'fire'});
  s.sprites.push({x:20.2,y:24.6,type:'fire'});
  s.sprites.push({x:26.4,y:24.2,type:'debris'});
  s.sprites.push({x:19,y:20,type:'debris'});
  s.lights.push({x:22.5,y:22.5,r:8,c:'rgba(255,150,60,',a:.46,flick:.35,fire:true});
  s.lights.push({x:24.6,y:20.4,r:3.4,c:'rgba(255,120,40,',a:.34,flick:.4,fire:true});
  /* checkpoint */
  rect(g,28,32,6,4,TL.F_CONC);
  s.sprites.push({x:29,y:34,type:'crate'});s.sprites.push({x:32,y:34,type:'fire'});
  s.sprites.push({x:30.6,y:31.4,type:'fence'});
  s.lights.push({x:31,y:34,r:6,c:'rgba(255,210,170,',a:.22,flick:.25,fire:true});
  /* street lamps along roads */
  const lampPts=[[30,44],[30,50],[40,48],[52,48],[64,48],[76,49],[88,50],[96,54],[36,55],[48,55],[60,52],[30,36],[44,42],[100,58],[92,64]];
  lampPts.forEach((p,i)=>{
    if(!walkable(g,p[0],p[1]))return;
    s.sprites.push({x:p[0]+0.5,y:p[1]+0.5,type:'lamp'});
    if(i%3!==0)s.lights.push({x:p[0]+0.5,y:p[1]+0.5,r:5.4,c:'rgba(255,206,140,',a:.13,flick:.08,broken:i%5===0});
  });
  /* cars / rubble / bushes */
  scatterSpr(s,rnd,['car'],26,18,26,140,100,true);
  scatterSpr(s,rnd,['bus'],3,26,44,120,60,true);
  scatterSpr(s,rnd,['bush','grass2'],90,16,16,150,110,true);
  scatterSpr(s,rnd,['debris','paper','puddle','crate'],130,16,26,150,100,true);
  scatterSpr(s,rnd,['bench'],10,26,40,120,60,true);
  /* reactor glow far east */
  s.lights.push({x:152,y:44,r:22,c:'rgba(255,90,50,',a:.10,flick:.05});
  /* radiation zones */
  s.radZones.push({x:22,y:22,r:10,v:.55});
  s.radZones.push({x:80,y:8,r:44,v:.35,rect:true,y0:0,y1:16,x0:0,x1:160});
  s.radZones.push({x:90,y:66,r:10,v:.3});
  s.radZones.push({x:150,y:48,r:14,v:.5});
  s.radZones.push({x:33,y:50,r:4,v:.15});
  /* entities */
  s.ents.push({type:'soldier',x:18,y:30,patrol:[[16,26],[26,30],[18,34]],state:'patrol'});
  s.ents.push({type:'soldier',x:26.5,y:36.5,patrol:[[26,31],[33,36],[26,37]],state:'patrol'});
  s.ents.push({type:'soldier',x:31.5,y:42.5,patrol:[[30,39],[30,46],[31,43]],state:'patrol'});
  s.ents.push({type:'creature',kind:'failed',x:34,y:26,patrol:[[30,22],[40,30],[28,30]],state:'patrol',wounded:true});
  s.ents.push({type:'creature',kind:'failed',x:62,y:52,patrol:[[46,52],[70,52],[60,58]],state:'patrol'});
  s.ents.push({type:'creature',kind:'failed',x:44.5,y:48.5,patrol:[[41,48],[50,47],[44,52]],state:'patrol'});
  s.ents.push({type:'creature',kind:'retained',x:86,y:52,patrol:[[76,50],[100,54],[86,58]],state:'patrol'});
  s.ents.push({type:'rex',x:WHEEL.x+1.4,y:WHEEL.y+WHEEL.r+1.6,id:'rex'});
  s.ents.push({type:'psy',x:56,y:56,id:'od_psy'});
  s.ents.push({type:'psy',x:40,y:36,id:'od_psy2'});
  /* safety pass: clear a patch around every doorway / approachable object */
  const clearAt=(cx,cy,rad)=>{
    for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){
      const x=Math.floor(cx)+i,y=Math.floor(cy)+j;
      const t=getT(g,x,y);
      if(t===TL.TREE||t===TL.DEAD||t===TL.RUB||t===TL.WATER||t===TL.SNOW)setT(g,x,y,TL.F_DIRT);
    }
  };
  for(const d of s.doors){
    for(let j=0;j<3;j++)for(let i=-1;i<2;i++){
      const x=d.x+i,y=d.y+1+j;
      if(solidT(getT(g,x,y))&&getT(g,x,y)!==TL.WATER)setT(g,x,y,TL.F_DIRT);
    }
    clearAt(d.x,d.y+2,2);
  }
  for(const it of s.ints){
    if(it.type!=='locked')continue;
    clearAt(it.x,it.y,2);
    clearAt(it.x,it.y+2,2);
  }
  /* guaranteed approach: carve a walkable corridor from every entrance to open ground */
  {
    const reach=new Uint8Array(W*H);
    const q=[];
    for(const d of s.doors){
      for(let j=1;j<=3;j++)for(let i=-1;i<=1;i++){
        const x=d.x+i,y=d.y+j;
        if(x<1||y<1||x>=W-1||y>=H-1)continue;
        if(walkable(g,x,y)&&!reach[y*W+x]){reach[y*W+x]=1;q.push([x,y]);}
      }
    }
    for(let qi=0;qi<q.length;qi++){
      const [x,y]=q[qi];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,ny=y+dy;
        if(nx<1||ny<1||nx>=W-1||ny>=H-1)continue;
        const i=ny*W+nx;if(reach[i]||!walkable(g,nx,ny))continue;
        reach[i]=1;q.push([nx,ny]);
      }
    }
    for(const it of s.ints){
      if(it.type!=='locked')continue;
      let cx=Math.floor(it.x),cy=Math.floor(it.y),guard=0;
      while(guard++<80){
        if(cx<2||cy<2||cx>=W-2||cy>=H-2)break;
        if(reach[cy*W+cx])break;
        const t=getT(g,cx,cy);
        if(t!==TL.WATER)setT(g,cx,cy,TL.F_CONC);
        reach[cy*W+cx]=1;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx=cx+dx,ny=cy+dy;
          if(walkable(g,nx,ny)&&!reach[ny*W+nx]){reach[ny*W+nx]=1;q.push([nx,ny]);}
        }
        cy++;
      }
    }
    for(let qi=0;qi<q.length;qi++){
      const [x,y]=q[qi];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,ny=y+dy;
        if(nx<1||ny<1||nx>=W-1||ny>=H-1)continue;
        const i=ny*W+nx;if(reach[i]||!walkable(g,nx,ny))continue;
        reach[i]=1;q.push([nx,ny]);
      }
    }
  }
  /* safety pass: nothing spawns inside geometry */
  const findFree=(x,y)=>{
    for(let r=0;r<9;r++)for(let a=0;a<16;a++){
      const nx=Math.floor(x+Math.cos(a/16*TAU)*r),ny=Math.floor(y+Math.sin(a/16*TAU)*r);
      if(walkable(g,nx,ny))return[nx+0.5,ny+0.5];
    }
    return [x,y];
  };
  for(const e of s.ents){
    if(!walkable(g,Math.floor(e.x),Math.floor(e.y))){const f=findFree(e.x,e.y);e.x=f[0];e.y=f[1];}
    if(e.patrol)e.patrol=e.patrol.map(pt=>{
      if(walkable(g,pt[0],pt[1]))return pt;
      clearAt(pt[0],pt[1],1);
      return walkable(g,pt[0],pt[1])?pt:findFree(pt[0],pt[1]).map(Math.floor);
    });
  }
  for(const sp2 of s.sprites){
    if(sp2.type==='wreck'||sp2.type==='fire'){
      const tx=Math.floor(sp2.x),ty=Math.floor(sp2.y);
      if(getT(g,tx,ty)===TL.F_DIRT)setT(g,tx,ty,TL.RUB);
    }
  }
  s.shiftFn=(sc,n)=>{
    if(G.flags.cityEntered&&!sc.shifted.snow){sc.shifted.snow=true;
      for(let i=0;i<120;i++){const x=Math.floor(rnd()*W),y=Math.floor(rnd()*H);
        if(getT(g,x,y)===TL.GRASS||getT(g,x,y)===TL.ROAD)setT(g,x,y,TL.SNOW);}
    }
    if(G.flags.echo2&&!sc.shifted.gate){sc.shifted.gate=true;
      /* a path that was not there */
      road(g,[60,55],[60,64],[1]);road(g,[60,64],[84,66],[1]);
    }
  };
  return s;
}
function road(g,a,b,w){
  let[x0,y0]=a,[x1,y1]=b;
  const sx=Math.sign(x1-x0),sy=Math.sign(y1-y0);
  let x=x0,y=y0,guard=0;
  while(guard++<4000){
    for(let j=-w;j<=w;j++)for(let i=-w;i<=w;i++){
      const t=getT(g,x+i,y+j);
      if(t===TL.WATER||t===TL.ROOF)continue;
      setT(g,x+i,y+j,TL.ROAD);
    }
    if(x===x1&&y===y1)break;
    if(x!==x1&&(y===y1||hash2(x,y,2)<0.5))x+=sx; else if(y!==y1)y+=sy; else break;
  }
}

/* =====================================================================
   VERTICAL SLICE — "قطاع اختبار" (Phase 3 test district)
   A small, complete cross-section of an abandoned city block, built
   entirely from the ENV API to prove the system before the full map:
     slice      = exterior street (bright spine + dark alley + courtyard)
     slice_bld  = one enterable building interior (rooms/corridor/doors)
   Navigation-ready, collision-complete, lit with dark & bright zones,
   fog + per-scene ambience. Scales to city/hospital/forest/labs/underground.
   ===================================================================== */
function buildSlice(){
  const W=44,H=36;
  const s=ENV.scene('slice',W,H,TL.GRASS,{name:'قطاع اختبار — وسط المدينة',
    spawn:{x:21.5,y:17.5},safe:{scene:'slice',x:21.5,y:17.5},
    atmo:{fog:0.060,hemi:0.13,amb:0.040,fogColor:0x070a0e,bg:0x070a0e},
    audio:{wind:0.34,hum:0.0,windFreq:430,
      events:[{sfx:'gust',min:12,max:26},{sfx:'distant',min:16,max:34},{sfx:'metal',min:20,max:40}]}});
  const g=s.g;
  /* --- ground: overgrown, uneven, irradiated-looking --- */
  ENV.noise(s,41,[[TL.GRASS,0.50],[TL.F_DIRT,0.72],[TL.RUB,0.80],[TL.GRASS,1.01]]);
  /* --- main street = the bright spine of the slice --- */
  ENV.road(s,[3,17],[40,17],2);
  ENV.plaza(s,3,14,38,1,TL.F_CONC);          // north sidewalk
  ENV.plaza(s,3,20,38,1,TL.F_CONC);          // south sidewalk
  /* --- apartment block (enterable) --- */
  ENV.block(s,7,5,11,8,{label:'مبنى سكني ٤',name:'apt'});
  ENV.plaza(s,11,13,3,2,TL.F_CONC);          // approach
  ENV.door(s,12,12,{to:'slice_bld',spawn:{x:10.5,y:13.5},label:'ادخل — المبنى السكني',id:'slice_apt_door'});
  /* --- shop (sealed / deco) --- */
  ENV.block(s,25,5,9,7,{label:'متجر «بريبات»',name:'shop'});
  addInt(s,{type:'locked',x:29.5,y:12.6,label:'متجر',msg:'الواجهة مغلقة بألواح خشبية من الداخل.'});
  s.sprites.push({x:29.5,y:12.2,type:'debris'});
  /* --- courtyard (mixed light, south) --- */
  ENV.plaza(s,13,22,18,9,TL.F_CONC);
  /* --- alley (dark passage linking street -> courtyard) --- */
  rect(g,13,20,2,3,TL.F_DIRT);
  rect(g,12,20,1,2,TL.RUB);rect(g,15,20,1,2,TL.RUB);
  ENV.dark(s,12,20,4,4,'الزقاق');
  /* --- rubble wall + gate out of the district (connects to the main game) --- */
  rect(g,13,31,18,1,TL.RUB);
  ENV.door(s,22,31,{to:'outdoor',spawn:{x:25.5,y:25.5},label:'اترك القطاع — موقع التحطّم',id:'slice_exit'});
  /* --- lighting: bright street lamps vs dark corners --- */
  [[6,14],[16,20],[26,14],[36,20]].forEach((p,i)=>{
    ENV.prop(s,p[0]+0.5,p[1]+0.5,'lamp');
    if(i%2===0)ENV.bright(s,p[0]+0.5,p[1]+0.5,6.0,'rgba(255,206,140,',0.15,0.07);
    else ENV.light(s,{x:p[0]+0.5,y:p[1]+0.5,r:5.0,c:'rgba(255,206,140,',a:0.10,flick:0.05,broken:i===3});
  });
  ENV.bright(s,22,26,5.0,'rgba(210,225,235,',0.07,0.04);   // pale courtyard light
  ENV.dark(s,7,5,11,8,'ظل المبنى');
  /* --- props: a city that left in a hurry --- */
  ENV.prop(s,18,16.4,'car');ENV.prop(s,33,17.6,'car');ENV.prop(s,9,18.4,'bus');
  ENV.prop(s,16,25,'bench');ENV.prop(s,27,25,'bench');ENV.prop(s,21,27,'statue');
  ENV.prop(s,12,23,'dead');ENV.prop(s,31,29,'dead');ENV.prop(s,8,29,'tree');
  ENV.scatter(s,['debris','paper','puddle','crate'],40,4,14,40,31,{seed:7,avoidSolid:true});
  ENV.scatter(s,['bush','grass2'],26,4,21,40,31,{seed:9,avoidSolid:true});
  ENV.scatter(s,['car'],5,4,21,40,30,{seed:11,avoidSolid:true});
  /* --- a couple of environment-storytelling interactables --- */
  addInt(s,{type:'doc',x:21.4,y:27.4,id:'doc_slice_note',label:'ورقة تحت الحجر',doc:'photo_family',sprite:'paper'});
  ENV.hide(s,16.4,25.4,'اختبئ خلف المقعد','slice_hide1');
  /* --- exit sign so the tester knows the loop is closed --- */
  s.sprites.push({x:22.5,y:30.4,type:'sign',text:'القطاع ← المدينة'});
  return s;
}
function buildSliceInterior(){
  const s=ENV.scene('slice_bld',22,18,TL.WALL,{indoor:true,name:'المبنى السكني — الطابق الأرضي',
    spawn:{x:10.5,y:13.5},safe:{scene:'slice_bld',x:10.5,y:13.5},
    atmo:{fog:0.095,hemi:0.055,amb:0.020,fogColor:0x030406,bg:0x030406},
    audio:{wind:0.05,hum:0.035,windFreq:240,
      events:[{sfx:'drip',min:6,max:16},{sfx:'creak',min:12,max:28}]}});
  /* solid-first interior: corridor spine + four rooms, open doorways + one real door */
  ENV.interior(s,{x:2,y:2,w:18,h:14,floor:TL.F_WOOD,
    corridors:[{x:9,y:4,w:3,h:11,floor:TL.F_CONC,name:'الممر'}],
    rooms:[
      {x:4,y:4,w:4,h:5,floor:TL.F_WOOD,name:'غرفة المعيشة'},
      {x:13,y:4,w:5,h:5,floor:TL.F_WOOD,name:'غرفة النوم'},
      {x:4,y:11,w:4,h:4,floor:TL.F_TILE,name:'المطبخ'},
      {x:13,y:11,w:5,h:4,floor:TL.F_TILE,name:'الحمّام'}],
    openings:[{x:8,y:6},{x:12,y:6},{x:8,y:12}],          // living / bedroom / kitchen
    doors:[
      {x:12,y:12,label:'باب الحمّام',id:'sb_bath'},        // one real openable door
      {x:10,y:15,to:'slice',spawn:{x:12.5,y:13.5},label:'اخرج إلى الشارع',id:'sb_exit'}]});
  /* --- props --- */
  const P=(x,y,t)=>s.sprites.push({x:x,y:y,type:t});
  P(5,5,'sofa');P(7,7.4,'table');P(4.6,8,'tv');P(7.4,4.6,'plant');
  P(14,5,'bed');P(17,5,'wardrobe');P(15,8,'drawer');
  P(5,12,'stove');P(7,12,'sink');P(5,14,'table');
  P(14,12,'tub');P(17,14,'toilet');P(14,14,'sink');
  P(10,5,'debris');P(10,11,'paper');P(9,8,'crate');
  /* --- lighting: one warm bulb (bright) vs pitch-dark kitchen/bath --- */
  ENV.bright(s,5.5,6,3.6,'rgba(255,214,150,',0.12,0.09);          // living room lamp
  ENV.light(s,{x:10,y:8,r:3.0,c:'rgba(200,220,255,',a:0.05,flick:0.18}); // dying corridor bulb
  ENV.dark(s,4,11,4,4,'المطبخ');ENV.dark(s,13,11,5,4,'الحمّام');
  /* --- interactables: hide spot, a document, batteries --- */
  ENV.hide(s,17,5,'اختبئ داخل الخزانة','sb_hide1');
  addInt(s,{type:'doc',x:7,y:7.4,id:'doc_slice_apt',label:'مذكرة على الطاولة',doc:'diary',sprite:'paper'});
  addInt(s,{type:'item',x:5,y:14,key:'batteries',label:'بطاريات',id:'sb_batt',sprite:'box',
    note:'بطاريات للكشاف. ما زالت تعمل.'});
  /* --- Phase 4: demonstrate the generic reusable interaction types --- */
  addInt(s,{type:'examine',x:4.6,y:8,id:'sb_tv',label:'افحص التلفاز',once:false,
    text:'شاشة ميتة منذ أربعين سنة. انعكاسك فيها يتأخّر جزءًا من الثانية.'});
  addInt(s,{type:'device',x:9.4,y:8,id:'sb_fuse',label:'صندوق الفيوزات',flag:'slicePower',
    onMsg:'عاد التيار. لمبة الممر تطنّ وتضيء.',offMsg:'انقطع التيار. الممر مظلم مجددًا.',
    onUse:(c,on)=>{ if(on)s.lights.push({x:10,y:8,r:3.4,c:'rgba(200,220,255,',a:0.10,flick:0.1}); }});
  /* --- Phase 5: a few test pickups for the Inventory System --- */
  addInt(s,{type:'item',x:6,y:6,key:'scrap',label:'خردة معدنية',id:'sb_scrap',sprite:'box',
    note:'خردة معدنية. تُدمج مع القماش من الحقيبة (I).'});
  addInt(s,{type:'item',x:16,y:6,key:'cloth',label:'قطعة قماش',id:'sb_cloth',sprite:'box',
    note:'قطعة قماش متينة. تُدمج مع الخردة (I).'});
  addInt(s,{type:'item',x:6,y:13,key:'medkit',label:'حقيبة إسعاف',id:'sb_med',sprite:'box',
    note:'حقيبة إسعاف. استعملها بـ Q أو من الحقيبة (I).'});
  /* --- Phase 6: the demo puzzle chain (multi-step, world-bound) --- */
  P(4.5,6,'paper');P(16,7,'box');P(5,13,'cabinet');
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'clue_drawing',x:4.5,y:6,id:'pz_drawing',label:'افحص الرسم على الحائط'});
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'lockbox',x:16,y:7,id:'pz_lockbox_node',label:'الصندوق المقفل'});
  addInt(s,{type:'puzzle',puzzle:'pz_lockbox',step:'cabinet',x:5,y:13,id:'pz_cabinet_node',label:'خزانة المطبخ'});
  return s;
}

/* ------------------------------ build all ------------------------------ */
function buildAllScenes(){
  SCENES.slice=buildSlice();
  SCENES.slice_bld=buildSliceInterior();
  SCENES.outdoor=buildOutdoor();
  SCENES.apartment=buildApartment();
  SCENES.school=buildSchool();
  SCENES.kindergarten=buildKinder();
  SCENES.substation=buildSubstation();
  SCENES.hospital=buildHospital();
  SCENES.basement=buildBasement();
  SCENES.tunnels=buildTunnels();
  SCENES.blacksite=buildBlacksite();
  SCENES.ai_arena=buildAIArena();
}
/* =====================================================================
   CANVAS / CAMERA / RENDER
   ===================================================================== */
const cv=$('cv'),ctx=cv.getContext('2d');
const fx=$('fx'),fctx=fx.getContext('2d');
let VW=0,VH=0,DPR=1;
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,1.35);
  VW=window.innerWidth;VH=window.innerHeight;
  for(const c of [cv,fx]){c.width=Math.floor(VW*DPR);c.height=Math.floor(VH*DPR);}
  fx.style.width=VW+'px';fx.style.height=VH+'px';
  /* the 2D canvas stays hidden; it only holds the mirrored WebGL frame for post-FX */
  cv.style.width=VW+'px';cv.style.height=VH+'px';cv.style.display='none';
  if(typeof E3!=='undefined'&&E3.ok&&E3.renderer){
    E3.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,E3.quality===2?1.4:(E3.quality===1?1:0.75)));
    E3.renderer.setSize(VW,VH,true);
    if(E3.camera){E3.camera.aspect=VW/VH;E3.camera.updateProjectionMatrix();}
  }
}
window.addEventListener('resize',resize);

const cam={x:0,y:0,zoom:1,shakeX:0,shakeY:0,fov:0};
function shake(a,t){G.shakeA=Math.max(G.shakeA,a);G.shakeT=Math.max(G.shakeT,t);}
const w2sx=x=>(x*T-cam.x)*cam.zoom+VW/2+cam.shakeX;
const w2sy=y=>(y*T-cam.y)*cam.zoom+VH/2+cam.shakeY;

/* ---------------- tile cache ---------------- */
const caches={};
function n01(x,y){return hash2(x,y,1234);}

/* ---------------- visibility / LOS ---------------- */
function losClear(s,x0,y0,x1,y1){
  const dx=x1-x0,dy=y1-y0;const steps=Math.ceil(Math.hypot(dx,dy)*3);
  for(let i=1;i<steps;i++){
    const t=i/steps,x=x0+dx*t,y=y0+dy*t;
    if(solidT(getT(s.g,Math.floor(x),Math.floor(y))))return false;
  }
  return true;
}
function rayDist(s,ox,oy,ang,maxD){
  const dx=Math.cos(ang),dy=Math.sin(ang);
  let x=ox,y=oy,t=0;const step=0.055;
  while(t<maxD){
    t+=step;x+=dx*step;y+=dy*step;
    if(solidT(getT(s.g,Math.floor(x),Math.floor(y))))return t;
  }
  return maxD;
}
function solidAt(s,x,y,r){
  r=r||0.30;
  if(solidT(getT(s.g,Math.floor(x),Math.floor(y))))return true;
  const pts=[[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r],[x-r,y],[x+r,y],[x,y-r],[x,y+r]];
  for(const p of pts){
    if(solidT(getT(s.g,Math.floor(p[0]),Math.floor(p[1]))))return true;
    for(const sp of s.sprites){
      const d=SPR[sp.type];if(!d||!d.r)continue;
      if(sp.type==='wheel'){
        const dd=dist(p[0],p[1],sp.x,sp.y),rr=sp.r||7;
        if(dd<1.5||Math.abs(dd-rr)<0.6)return true;
        continue;
      }
      if(dist(p[0],p[1],sp.x,sp.y)<d.r*0.85)return true;
    }
  }
  return false;
}
function moveEnt(s,e,dx,dy,r){
  r=r||0.30;
  if(!solidAt(s,e.x+dx,e.y,r))e.x+=dx;
  if(!solidAt(s,e.x,e.y+dy,r))e.y+=dy;
}

/* ---------------- sprite drawing ---------------- */

/* ---------------- entities ---------------- */

/* ---------------- player ---------------- */

/* ---------------- lighting ---------------- */

/* ---------------- main render ---------------- */

/* ---------------- particles ---------------- */
const PART=[];
function renderParticles(){
  const s=G.scene;if(!s)return;
  const want=s.indoor?26:70;
  while(PART.length<want)PART.push(newP());
  while(PART.length>want)PART.pop();
  ctx.save();
  for(const p of PART){
    p.x+=p.vx*G.dt;p.y+=p.vy*G.dt;p.t-=G.dt;
    if(p.t<=0){Object.assign(p,newP());}
    const sx=(p.x-cam.x)*cam.zoom+VW/2+cam.shakeX, sy=(p.y-cam.y)*cam.zoom+VH/2+cam.shakeY;
    if(sx<-20||sx>VW+20||sy<-20||sy>VH+20)continue;
    ctx.globalAlpha=p.a;
    ctx.fillStyle=p.c;
    if(p.snow){ctx.fillRect(sx,sy,p.r,p.r);}
    else{ctx.beginPath();ctx.arc(sx,sy,p.r*cam.zoom,0,TAU);ctx.fill();}
  }
  ctx.restore();
  function newP(){
    const snow=!s.indoor&&G.flags.snow;
    return {x:cam.x+(Math.random()-0.5)*(VW/cam.zoom/T+6),
      y:cam.y+(Math.random()-0.5)*(VH/cam.zoom/T+6),
      vx:snow?(12+Math.random()*20)/T:(Math.random()-0.5)*0.25,
      vy:snow?(24+Math.random()*26)/T:(Math.random()-0.5)*0.18,
      r:snow?1.3:Math.random()*1.5+0.4,a:snow?0.5:Math.random()*0.16+0.03,
      c:snow?'rgba(220,232,238,1)':'rgba(200,210,215,1)',t:6+Math.random()*10,snow};
  }
}
/* =====================================================================
   CONTENT — documents & tapes
   ===================================================================== */
const DOCS={
 photo_family:{kind:'PHOTOGRAPH',title:'Family photograph',body:
`PRIPYAT — 1984
The Petrenko family. Three people, one dog.
On the back, in pencil:

   "before everything"

Apartment 16. The door was open.
Nobody locks a door in a city with no people.
Unless they planned to come back.`},
 diary:{kind:'PAPERBACK DIARY',title:'Diary — I. Petrenko',body:
`26.04.1986
They say the reactor is on fire. My wife says it is
only steam. The children were sent home from school.

27.04.1986
Buses. Hundreds of buses. Three days, they say.
We will be back in three days.

01.05.1986 (added later, different pen)
Nobody came back.
The woman in apartment 16 - Elena - she knew.
She was already gone before the buses came.
She left the door open.`},
 drawing:{kind:"CHILD'S DRAWING",title:'Drawing',body:
`Crayon on paper. A house. A sun with too many eyes.
A tall figure with no face standing behind the house.

Written under it, in a child's hand:

   "he comes when I sleep"

In the corner, carefully drawn, a symbol:
an atom.

It is not a drawing a child invents.
It is a drawing a child copies.`},
 bath_note:{kind:'HANDWRITTEN NOTE',title:'Note in the bathroom',body:
`Elena's handwriting. The paper is dry.
In forty years, nothing here should still be dry.

   "If he ever comes back, he will look for a key.
    I left our marks along the way he walked
    as a child:

      his room  ->  the school  ->  the kindergarten
                                  ->  and then down.

    In that order. Not the order he remembers."

There is no signature. There is no date.
The ink is new.`},
 school_photo:{kind:'PHOTOGRAPH',title:'Three buildings',body:
`Black and white. A schoolyard, 1985.
Three buildings visible. Someone scratched a symbol
into the emulsion next to each one:

   [ left ]   school        ->  WAVE
   [ centre ] apartments    ->  ATOM
   [ right ]  power station ->  EYE

Under the photo, typed:

   "PANEL ACCEPTS THREE. LEFT TO RIGHT."

Someone used this photograph as a key.`},
 zone_map:{kind:'MAP',title:'District map',body:
`A civil-defence map of the district.
Standard issue. Almost.

One facility has been added by hand, in red ink,
south-east of the city, outside every official plan:

   "ПОДСТАНЦИЯ / SUBSTATION"

A note in the margin:

   "not on any map. if it is on a map, it is the
    wrong map."

The red ink is still wet.`},
 evac:{kind:'SCHOOL LOG',title:'Evacuation record',body:
`SCHOOL No. 3 - EVACUATION LOG
27.04.1986

11:40  children assembled in the yard
12:05  buses arrived
12:30  building cleared
12:35  staff departed

Total evacuated: 412
Total present that morning: 413

The last line is written twice.
The second time, the number is different.`},
 blockc:{kind:'METAL PLATE',title:'Block C',body:
`A brass plate, unscrewed from something larger:

   BLACK SITE-4
   BLOCK C  /  OBSERVATION

   PROPERTY OF PROJECT ZERO

Behind it, a symbol has been pressed into the metal:
a wave.

The screws are on the floor.
They were removed from the inside.`},
 shift_log:{kind:'SHIFT LOG',title:'Substation shift log',body:
`03/11  22:00  load nominal
03/11  23:40  load spike - sector 7 (no sector 7)
04/11  00:15  convoy arrived. no manifest.
04/11  01:00  crates moved below.
04/11  01:30  they were not crates.

Note: panel codes changed without authorisation.
Note: the panel accepted a code that is not on the list.
Note: I am the only one on shift.
Note: I have written these notes four times.`},
 echo1:{kind:'CLASSIFIED — ECHO',title:'PROJECT ECHO',body:
`MINISTRY OF HEALTH / DIRECTORATE 9
PROJECT ECHO  -  FILE 001

SUBJECT OF STUDY:
  retention of human consciousness under
  conditions of extreme stress, radiation and
  sensory deprivation.

FINDINGS:
  memory is not storage. memory is reconstruction.
  fear does not degrade the subject.
  fear ORGANISES the subject.

ATTACHED: staff list (redacted)
  ....... VOLKOVA, E. - lead, cognitive retention
  the name is redacted four times.
  each time, a different length.

A small plate was stapled to this file.
It is engraved with an eye.`},
 obs_log:{kind:'SURVEILLANCE',title:'Observation log',body:
`CHAMBER 3 - SEALED 1986
POWER: OFF     AIR: STALE     CAMERA: ACTIVE

the camera is active.
there is no power in this corridor.

LOG:
  03:11  subject enters frame
  03:11  subject looks at camera
  03:12  subject leaves frame
  03:12  subject enters frame
  03:12  subject looks at camera
  ...
  (the log continues for 40 years)
  ...
  03:11  subject enters frame

There is no subject in chamber 3.
Chamber 3 has been open since you arrived.`},
 echo2:{kind:'CLASSIFIED — ECHO',title:'PROJECT ECHO (complete)',body:
`PROJECT ECHO  -  FULL TEXT (declassified copy)

ECHO was not a weapon programme.
ECHO was an attempt to answer one question:

   what remains of a person when memory,
   fear and perception can be edited?

The answer was written in 1987 and then buried:

   "the subject does not degrade.
    the subject ADAPTS.
    adaptation is indistinguishable from
    a second personality."

Lead researcher: VOLKOVA, E.
Reason for termination of ECHO:
   "researcher refused to continue after
    the birth of her son."`},
 zero1:{kind:'CLASSIFIED — ZERO',title:'PROJECT ZERO',body:
`PROJECT ZERO - SUBJECT INDEX

  01   designator: ZERO       status: ACTIVE (uncontrolled)
  02-09                        status: TERMINATED
  N-07 "NIKA"                 cognitive retention 97%
  N-11                         cognitive retention 41%
  N-19                         cognitive retention 0%

OBJECTIVE:
  reproduce the properties observed in the
  ORIGINAL subject.

NOTE (handwritten, unsigned):
  "we are not building him.
   we are building something that can
   remember being him."

  see also: VOLKOV, A.  ->  status: ORIGINAL`},
 patient:{kind:'MEDICAL FILE',title:'Patient — 1986',body:
`MSCh-126  /  PRIpyat hospital
PATIENT: VOLKOVA, ELENA
DATE: 27.04.1986

ADMISSION: acute radiation exposure,
           14 weeks pregnant.

TREATMENT: none authorised.
           transferred by unmarked vehicle
           within six hours.

NOTE BY ATTENDING PHYSICIAN:
  "she was not afraid of the dose.
   she was afraid of what the dose
   would do to the child.
   she said the child had already
   been examined.
   the child had not been born."`},
 maternity:{kind:'MATERNITY LOG',title:'Maternity log',body:
`MATERNITY WARD - LOG

1986: 41 births recorded.
1987: 0
1988: 0
...
2026: 1

The last entry is in fresh ink.
It has no name, only a number:

   00`},
 final_file:{kind:'ARCHIVE — TOP SHELF',title:'SUBJECT FILE',body:
`BLACK SITE-4  /  ARCHIVE  /  SHELF 0

  SUBJECT:      VOLKOV, ALEXEI
  DESIGNATION:  00
  DOB:          1986

  STATUS:       NOT CREATED
  STATUS:       NOT MODIFIED
  STATUS:       ORIGINAL

  NOTES:
    subject has never been inside this facility.
    (the note is crossed out)
    subject has never been inside this facility.
    (the note is crossed out)
    subject was here before the facility.

  PROJECT ZERO WAS CREATED TO REPRODUCE HIM.

The folder is warm.
Somebody was holding it a moment ago.`},
};
const TAPES={
 tape1:{title:'TAPE 1 — ELENA',who:'ELENA (recording)',pitch:0.8,rate:0.86,body:
`[static]

"...if he ever comes back...
 ...do not let him trust what he remembers.
 The city is not what they did to it.
 The city is what it learned.
 Alexei, if this is you—
 [signal collapses]
 ...you were never supposed to—
[END OF TAPE]`},
 tape2:{title:'TAPE 2 — ELENA',who:'ELENA (recording)',pitch:0.75,rate:0.84,body:
`"The archive under the hospital is the last clean copy.
 The terminal takes four marks, in the order I walked:
 his room, the school, the kindergarten, then down.
 Not the order you remember. The order I walked.

 There is a girl down there. Designation N-07.
 They will tell you she is a subject.
 She is the only one of them who is still—
 [tape damage]
 —she has not aged. I have checked. Twice."`},
 tape3:{title:'TAPE 3 — ELENA?',who:'ELENA (?)',pitch:0.6,rate:0.78,body:
`"I was never pregnant.
 I never had a son.
 Whoever you are, stop looking for me.
 [pause]
 Alexei.
 [pause]
 That was not me.
 That was not me.
 That was not—
[END OF TAPE]`},
};
const RADIO_LINES=[
 {t:'...volk-7, respond. Volk-7, this is Rota-2. Your aircraft is on fire. Volk-7—',who:'RADIO'},
 {t:'Pripyat, Pripyat, this is checkpoint two. Nobody is on that road. There is nobody on any road.',who:'RADIO'},
 {t:'[numbers station] four. one. nine. four. one. nine. zero. zero. zero.',who:'RADIO'},
 {t:'...you were here before you were born...',who:'???'},
 {t:'Alexei. Alexei. Alexei. [the same voice, three times, three different rooms]',who:'RADIO'},
 {t:'[a child counting, backwards, in Russian]',who:'???'},
 {t:'This is a recording. This is a recording. This is a—',who:'RADIO'},
];

/* =====================================================================
   PLAYER / SCENE FLOW
   ===================================================================== */
function newPlayer(){
  return {x:22.5,y:23.5,face:0,sta:CFG.staMax,bat:CFG.batMax,flash:true,
    crouch:false,moving:false,rad:0,hp:3,hidden:false,hideId:null,
    sprint:false,injured:0,stepT:0,dmgFlash:0,
    /* --- Player Controller foundation --- */
    py:0, vy:0, grounded:true,     // vertical position / velocity / on-ground
    modelYaw:0,                    // body facing (separate from camera aim)
    anim:'idle', moveSpeed:0};     // animation state machine
}
function enterScene(id,sp,opt){
  opt=opt||{};
  const s=SCENES[id];if(!s)return;
  G.sceneId=id;G.scene=s;
  G.player.x=sp.x;G.player.y=sp.y;
  cam.x=sp.x*T;cam.y=sp.y*T;
  G.visits[id]=(G.visits[id]||0)+1;
  s.visits=G.visits[id];
  /* persistent entity state */
  s.entsLive=s.ents.map(e=>{
    const copy=Object.assign({},e);
    copy.face=0;copy.alert=0;copy.state=e.state||'patrol';copy.pi=0;copy.moving=false;
    copy.vis=0;copy.t=0;copy.nextT=0;copy.stare=0;
    if(copy.type==='creature'||copy.type==='soldier'){
      const key=id+':'+Math.round(e.x)+'_'+Math.round(e.y);
      const mem=G.flags.pos&&G.flags.pos[key];
      if(mem&&!opt.reset){copy.x=mem.x;copy.y=mem.y;
        if(mem.dead)copy.dead=true;
        if(mem.hp!=null)copy.hp=mem.hp;}
      copy.key=key;copy.torch=copy.type==='soldier';
    }
    return copy;
  });
  /* door tile states */
  for(const d of s.doors){
    if(d.open)setT(s.g,d.x,d.y,TL.F_CONC);
    else if(d.locked&&!d.static)setT(s.g,d.x,d.y,TL.LOCKDOOR);
  }
  /* companions / story actors follow between scenes */
  if(G.flags.rex){
    if(['tunnels','basement','blacksite'].includes(id)){
      if(!s.entsLive.some(e=>e.type==='rex')&&id!=='outdoor')
        setTimeout(()=>subtitle('ركس','يقف عند الباب. لا يدخل. ينظر إليك مرة واحدة، ثم إلى الظلام خلفك.'),900);
    }else if(!s.entsLive.some(e=>e.type==='rex')){
      s.entsLive.push({type:'rex',x:sp.x+0.8,y:sp.y+0.8,joined:true,face:0,vis:1,t:0,t2:4,stare:0});
    }
  }
  if(G.flags.nikaMet&&!['school','tunnels'].includes(id)){
    for(const e of s.entsLive)if(e.type==='nika')e.gone=true;
  }
  s.dirty=true;
  if(s.shiftFn)s.shiftFn(s,s.visits);
  s.dirty=true;
  PARTICLES_RESET();
  if(typeof E3!=='undefined')E3.builtFor=null;
  if(typeof EVT!=='undefined')EVT.onEnter(id);
  if(typeof STORY!=='undefined')STORY.onEnter(id);
  if(!opt.silent){
    toast(s.name,id.toUpperCase()+(G.visits[id]>1?'  —  الزيارة '+num(G.visits[id]):''));
    if(G.visits[id]===2)note('عدت إلى '+s.name+'. شيء ما مختلف.','revisit');
  }
  updateHint();
  audioBed();
}
function PARTICLES_RESET(){PART.length=0;}
function num(n){return ['','الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة'][n]||n;}

function setObjective(t,sub){
  G.objective=t;G.objSub=sub||'';
  const o=$('obj');o.querySelector('.txt').textContent=t;
  o.style.opacity=1;
  clearTimeout(o._t);o._t=setTimeout(()=>{o.style.opacity=.45;},7000);
}
let toastT=0;
function toast(t,s,dur){
  const e=$('toast');
  e.querySelector('.t').textContent=t;
  e.querySelector('.s').textContent=s||'';
  e.style.opacity=1;clearTimeout(e._t);
  e._t=setTimeout(()=>e.style.opacity=0,dur||3600);
}
function flashMsg(t,dur){
  const e=$('flashmsg');e.textContent=t;e.style.transition='opacity .5s';e.style.opacity=1;
  clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0;},dur||1800);
}
function note(t,tag){
  G.notes.unshift({t,tag:tag||'',time:Math.floor(G.time)});
  if(G.notes.length>60)G.notes.pop();
}
function subtitle(who,txt,dur){
  const e=$('sub');
  if(typeof UI!=='undefined'&&!UI.SET.subtitles){e.style.opacity=0;G.subtitleT=0;return;}
  e.querySelector('.who').textContent=who||'';
  e.querySelector('.txt').textContent=txt;
  e.style.opacity=1;G.subtitleT=dur||4.2;
}
/* =====================================================================
   INVENTORY SYSTEM (Phase 5) — modular & data-driven.
   ITEMS   : id -> definition {name,desc,icon,type,stack,max,use,onPickup}
   RECIPES : combine rules {in:[a,b], out, qty}
   INV     : the single API the game uses. State lives in G.items (already saved).
   Adding an item = one defItem(...) call. No engine changes ever.
   ===================================================================== */
const ITEMS={};
function defItem(d){ITEMS[d.id]=d;return d;}
const RECIPES=[];
function defRecipe(r){RECIPES.push(r);return r;}
const ITEM_TYPES={consumable:'قابل للاستهلاك',tool:'أداة',key:'مفتاح',material:'مادة',misc:'متنوع'};

/* --- the few items that already exist in the game get real definitions --- */
defItem({id:'medkit',name:'حقيبة إسعاف',type:'consumable',stack:true,max:3,icon:'✚',
  desc:'ضمادات ومضاد إشعاع بسيط. يخفّف التلوّث ويستعيد إصابة واحدة.',
  use(){const P=G.player;P.rad=Math.max(0,P.rad-45);P.hp=Math.min(3,P.hp+1);
    toast('استخدمت حقيبة الإسعاف','RAD -45 / HP +1');SFX.pickup();return{ok:true};}});
defItem({id:'batteries',name:'بطاريات',type:'consumable',stack:true,max:6,icon:'▮',
  desc:'بطاريات للكشاف. تُعيد شحن مصباح اليد عند الاستخدام.',
  onPickup(){G.player.bat=Math.min(CFG.batMax,G.player.bat+45);},
  use(){G.player.bat=Math.min(CFG.batMax,G.player.bat+45);
    toast('استخدمت البطاريات','BATTERY +45%');SFX.pickup();return{ok:true};}});
defItem({id:'tapeplayer',name:'مشغّل الأشرطة',type:'tool',stack:false,icon:'▣',
  desc:'مسجّل شرائط قديم. يشغّل الأشرطة التي تجدها في المدينة.'});
defItem({id:'keycard',name:'بطاقة الوصول',type:'key',stack:false,icon:'▭',
  desc:'بطاقة BLACK SITE-4. تفتح الأبواب المقفلة تحت الأرض.'});
defItem({id:'archkey',name:'مفتاح الأرشيف',type:'key',stack:false,icon:'⚿',
  desc:'مفتاح ثقيل. لوحة المصعد تطلبه بالاسم: ARKHIV KEY.'});
defItem({id:'key_bath',name:'مفتاح الحمّام',type:'key',stack:false,icon:'⚿',
  desc:'مفتاح صغير صدئ.'});
defItem({id:'lockbox_key',name:'مفتاح صغير صدئ',type:'key',stack:false,icon:'⚿',
  desc:'مفتاح من صندوق غرفة النوم. يفتح خزانة المطبخ.'});

/* --- a few TEST items: two materials + one combine result --- */
defItem({id:'scrap',name:'خردة معدنية',type:'material',stack:true,max:9,icon:'⚙',
  desc:'قطعة معدنية ملتوية. تصلح للتجميع.'});
defItem({id:'cloth',name:'قطعة قماش',type:'material',stack:true,max:9,icon:'▨',
  desc:'قماش متّسخ لكنه متين.'});
defItem({id:'repair_kit',name:'عدّة إصلاح',type:'consumable',stack:true,max:3,icon:'🧰',
  desc:'نتيجة دمج خردة وقماش. تستعيد بعض التحمّل.',
  use(){G.player.sta=Math.min(CFG.staMax,G.player.sta+50);
    toast('استخدمت عدّة الإصلاح','STAMINA +50');SFX.pickup();return{ok:true};}});
defRecipe({in:['scrap','cloth'],out:'repair_kit',qty:1,name:'عدّة إصلاح'});

const INV={
  /* ---- queries ---- */
  def(id){return ITEMS[id]||null;},
  meta(id){return ITEMS[id]||{id:id,name:itemName(id),desc:'',icon:'•',type:'misc',stack:false};},
  isItem(k){return !k.startsWith('doc_')&&!/^tape\d/.test(k);},   // docs & tape1/2/3 have their own tabs
  count(id){const v=G.items[id];return v==null?0:(v===true?1:(v|0));},
  has(id){return INV.count(id)>0;},
  list(){return Object.keys(G.items).filter(INV.isItem).map(id=>({id:id,qty:INV.count(id),def:INV.meta(id)}));},
  /* ---- pickup ---- */
  add(id,n){
    n=(n==null||n===true)?1:(n|0);
    const d=ITEMS[id];
    if(d&&d.stack){let q=INV.count(id)+n;if(d.max)q=Math.min(d.max,q);G.items[id]=q;}
    else G.items[id]=n>1?n:true;
    if(d&&d.onPickup)try{d.onPickup(n);}catch(e){}
    INV.onChange();return id;
  },
  /* ---- remove / drop ---- */
  remove(id,n){
    n=(n==null)?1:(n|0);
    const d=ITEMS[id];
    if(d&&d.stack){let q=INV.count(id)-n;if(q<=0)delete G.items[id];else G.items[id]=q;}
    else delete G.items[id];
    INV.onChange();return !INV.has(id);
  },
  /* ---- use ---- */
  canUse(id){const d=ITEMS[id];return INV.has(id)&&!!(d&&d.use);},
  use(id){
    if(!INV.has(id))return{ok:false,msg:'هذا العنصر غير متوفر.'};
    const d=ITEMS[id];
    if(!d||!d.use)return{ok:false,msg:'لا يمكن استخدام «'+INV.meta(id).name+'».'};
    let r;try{r=d.use()||{ok:true};}catch(e){r={ok:false,msg:'تعذّر الاستخدام.'};}
    if(r.ok!==false&&d.consumable!==false&&d.stack)INV.remove(id,1);
    INV.onChange();return r;
  },
  /* ---- combine ---- */
  recipesFor(id){return RECIPES.filter(r=>r.in.indexOf(id)>=0&&r.in.every(x=>INV.has(x)));},
  canCombine(id){return INV.recipesFor(id).length>0;},
  combine(a,b){
    const want=[a,b].slice().sort().join('+');
    const r=RECIPES.find(rc=>rc.in.slice().sort().join('+')===want);
    if(!r)return{ok:false,msg:'لا وصفة لهذا الدمج.'};
    if(!r.in.every(x=>INV.has(x)))return{ok:false,msg:'مكوّن ناقص.'};
    r.in.forEach(x=>INV.remove(x,1));
    INV.add(r.out,r.qty||1);
    toast('دمج: '+INV.meta(r.out).name,'COMBINED');SFX.pickup();
    INV.onChange();return{ok:true,out:r.out};
  },
  onChange(){try{if(INVUI.open)renderInv();}catch(e){}}
};

/* legacy pickup/has helpers now delegate to the registry (behavior preserved) */
function addItemKey(key,n){return INV.add(key,n);}
function hasItem(k){return INV.has(k);}
function giveSym(id){
  if(G.syms.includes(id))return;
  G.syms.push(id);
  const s=SYMS.find(x=>x.id===id);
  flashMsg('رمز جديد — '+(s?s.name:id),2400);
  tone(520,0.2,0.05,'triangle');setTimeout(()=>tone(780,0.3,0.05,'triangle'),140);
  note('وجدت رمز «'+(s?s.name:id)+'». أربعة رموز في المدينة.','symbol');
  setObjective('اجمع الرموز الأربعة','طفل ← مدرسة ← روضة ← تحت الأرض');
}

/* =====================================================================
   INTERACTION SYSTEM (Phase 4) — central, modular, data-driven
   ---------------------------------------------------------------------
   One registry maps an interactable's `type` to a definition:
     { key, prompt(c), run(c) }
   Nothing else in the engine needs a per-door / per-item branch again.
   To add a new kind of interactable you ONLY call INTERACT.register(...)
   and author data — updateHint()/doInteract() never change.

   Flow:  look (gaze cone + line of sight)  ->  focus  ->  prompt  ->  run
   ===================================================================== */
const INTERACT={
  range:2.4,          // max interaction distance (tiles)
  gazeAngle:0.95,     // half-cone (rad) that counts as "looking at" it
  types:{},           // type -> {key,prompt,run}

  register(type,def){INTERACT.types[type]=def;return def;},
  def(type){return INTERACT.types[type];},
  key(c){const d=INTERACT.types[c&&c.type];return (d&&d.key)||'E';},
  prompt(c){
    const d=INTERACT.types[c&&c.type];
    if(d&&d.prompt){const p=d.prompt(c);if(p!=null)return p;}
    return (c&&c.label)||'تفاعل';
  },
  /* every interactable currently in scope (placed ints + live entity verbs) */
  candidates(s){
    const out=[];
    for(const it of s.ints)if(!it.used)out.push(it);
    for(const en of s.entsLive||[]){
      if(en.type==='nika'&&en.vis>0.3)out.push({type:'talk',x:en.x,y:en.y,ent:en,label:'تحدّث'});
      if(en.type==='rex'&&!en.joined)out.push({type:'rex',x:en.x,y:en.y,ent:en,label:'نادِه'});
    }
    return out;
  },
  /* resolve what the player is focused on: prefer the candidate inside the
     gaze cone WITH line of sight; otherwise fall back to the nearest in range
     (keeps touch / no-mouse play and existing content working). */
  focus(){
    const P=G.player,s=G.scene;
    if(!P||!s||P.hidden)return null;
    const R=INTERACT.range;
    let inCone=null,any=null;
    for(const c of INTERACT.candidates(s)){
      const d=dist(P.x,P.y,c.x,c.y);
      if(d>R)continue;
      const a=Math.atan2(c.y-P.y,c.x-P.x);
      const da=Math.abs(((a-IN.aim+Math.PI*3)%TAU)-Math.PI);
      const los=losClear(s,P.x,P.y,c.x,c.y);
      const score=d+da*1.5+(los?0:1.2);          // lower = better
      const rec={c:c,score:score};
      if(!any||score<any.score)any=rec;
      if(da<INTERACT.gazeAngle&&los&&(!inCone||score<inCone.score))inCone=rec;
    }
    const pick=inCone||any;
    return pick?pick.c:null;
  },
  /* dispatch */
  run(c){
    const d=INTERACT.types[c&&c.type];
    if(!d||!d.run){SFX.deny();subtitle('','لا يمكن التفاعل مع هذا.');return false;}
    d.run(c);
    return true;
  },
};

/* ---- built-in interactable types (all game content is pure data) ---- */
INTERACT.register('door',{key:'E',
  prompt(c){
    if(c.locked){
      if(c.power&&!G.flags.power)return 'مقفل — لا يوجد تيار';
      if(c.need==='echo2'&&!G.flags.echo2)return 'مقفل — المصعد لا يستجيب';
      if(c.need&&!hasItem(c.need))return 'مقفل — تحتاج: '+itemName(c.need);
    }
    return c.to==='outdoor'?'اخرج':(c.label||'ادخل');
  },
  run(c){
    if(c.locked){
      if(c.power&&!G.flags.power){SFX.deny();subtitle('','«لا يوجد تيار.» لوحة على الباب: BASEMENT — POWER REQUIRED');return;}
      if(c.need==='archkey'&&!hasItem('archkey')){SFX.deny();subtitle('','المصعد لا يستجيب. لوحة بجانبه: ACCESS — ARKHIV KEY.');return;}
      if(c.need==='allDocs'){SFX.deny();return;}
      if(c.need&&!hasItem(c.need)){SFX.deny();subtitle('','مقفل. تحتاج: '+itemName(c.need));return;}
      if(c.need){c.locked=false;subtitle('','استخدمت: '+itemName(c.need));SFX.door();}
    }
    if(c.to){c.open=true;SFX.door();transition(c.to,c.spawn);}
    else if(c.static){
      c.used=true;c.locked=false;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
      subtitle('','القفل فتح. الباب كان مقفلًا من الخارج — وهذا غريب.');
      note('فتحت بابًا كان مقفلًا من الخارج. من الداخل لا يوجد قفل.','anomaly');
    }else{
      c.open=true;c.used=true;setT(G.scene.g,c.x,c.y,TL.F_CONC);G.scene.dirty=true;SFX.door();
      subtitle('','فتحت الباب.');
    }
  }});
INTERACT.register('locked',{key:'E',
  prompt(c){return c.label||'مغلق';},
  run(c){SFX.deny();subtitle('',c.msg||'مغلق.');}});
INTERACT.register('item',{key:'E',
  prompt(c){return c.label||'التقط';},
  run(c){
    addItemKey(c.key);c.used=true;SFX.pickup();
    toast('التقطت: '+c.label,itemName(c.key));
    if(c.note)note(c.note,'item');
    if(c.onTake)c.onTake();
    if(c.key==='tapeplayer'){G.flags.hasPlayer=true;note('مشغّل أشرطة. الآن يمكنني سماع ما تركوه.','item');}
    if(c.key==='archkey'){setObjective('عُد إلى المصعد في قبو المستشفى','المفتاح مدرّع وعليه ختم АРХИВ.');}
    if(c.key==='keycard'){setObjective('عد إلى المستشفى — باب القبو','البطاقة تعمل الآن مع التيّار.');}
  }});
INTERACT.register('doc',{key:'E',
  prompt(c){
    if(c.locked&&c.need&&!hasItem(c.need))return (c.label||'اقرأ')+' — تحتاج: '+itemName(c.need);
    return c.label||'اقرأ';
  },
  run(c){
    if(c.locked&&c.need&&!hasItem(c.need)){SFX.deny();subtitle('','تحتاج: '+itemName(c.need));return;}
    if(c.locked&&c.need){c.locked=false;}
    openDoc(c.doc);c.used=true;G.stats.docs++;
    if(c.onTake)c.onTake();
  }});
INTERACT.register('tape',{key:'E',
  prompt(c){return c.label||'استمع';},
  run(c){c.used=true;playTape(c.tape);}});
INTERACT.register('search',{key:'E',
  prompt(c){return c.label||'ابحث';},
  run(c){
    if(c.needFlag&&!G.flags[c.needFlag]){SFX.deny();subtitle('','مقفل. لا يفتح بدون تيار.');return;}
    c.used=true;SFX.write();
    subtitle('',c.text||'لا شيء.');
    if(c.give==='tape1')playTape('tape1');
    if(c.give==='tape2')playTape('tape2');
    if(c.keycard){addItemKey('keycard');}
    if(c.onTake)c.onTake();
  }});
INTERACT.register('hide',{key:'H',
  prompt(c){return c.label||'اختبئ';},
  run(c){hideAt(c);}});
INTERACT.register('terminal',{key:'E',
  prompt(c){return c.label||'لوحة تحكم';},
  run(c){openCode(c);}});
INTERACT.register('talk',{key:'E',
  prompt(c){return c.label||'تحدّث';},
  run(c){talkNika(c.ent);}});
INTERACT.register('rex',{key:'E',
  prompt(c){return c.label||'نادِه';},
  run(c){joinRex(c.ent);}});
INTERACT.register('final',{key:'E',
  prompt(c){
    if(!hasItem('doc_echo2')||!hasItem('doc_zero1')||!G.syms.length)return 'ملف على الطاولة — ليس بعد';
    return c.label||'اقرأ الملف';
  },
  run(c){tryFinal(c);}});

/* ---- NEW generic reusable types (no per-object code needed) ---- */
/* examine: inspect an object, read a description, optional one-shot reward */
INTERACT.register('examine',{key:'E',
  prompt(c){return c.label||'افحص';},
  run(c){
    SFX.write();
    subtitle('',c.text||'لا شيء مميز.');
    if(c.once!==false)c.used=true;
    if(c.give)addItemKey(c.give);
    if(c.flag)G.flags[c.flag]=true;
    if(c.onExamine)c.onExamine(c);
  }});
/* device: any operable machine — switch / valve / console / generator.
   Data-driven: {state,flag,onUse(c,state),power,need,onMsg,offMsg} */
INTERACT.register('device',{key:'E',
  prompt(c){
    if(c.power&&!G.flags.power)return (c.label||'جهاز')+' — لا يوجد تيار';
    if(c.locked&&c.need&&!hasItem(c.need))return (c.label||'جهاز')+' — تحتاج: '+itemName(c.need);
    return c.state?(c.offLabel||'أوقف التشغيل'):(c.onLabel||c.label||'شغّل');
  },
  run(c){
    if(c.power&&!G.flags.power){SFX.deny();subtitle('','لا يوجد تيار. الجهاز ميت.');return;}
    if(c.locked&&c.need&&!hasItem(c.need)){SFX.deny();subtitle('','تحتاج: '+itemName(c.need));return;}
    if(c.locked&&c.need)c.locked=false;
    c.state=!c.state;
    SFX.beep();tone(c.state?660:300,0.12,0.05,'square');
    subtitle('',c.state?(c.onMsg||'شغّلت الجهاز.'):(c.offMsg||'أوقفت الجهاز.'));
    if(c.flag)G.flags[c.flag]=c.state;
    if(c.onUse)c.onUse(c,c.state);
    if(G.scene)G.scene.dirty=true;
  }});
/* =====================================================================
   PUZZLE FRAMEWORK (Phase 6) — multi-step, world-bound, data-driven.
   A puzzle is an ORDERED CHAIN of steps that live in the world. Each step is
   a node the player interacts with ({type:'puzzle',puzzle,step}). Nodes gate on
   items / flags / previous steps, so one puzzle spans rooms & scenes and ties
   into exploration + story (clue -> location -> puzzle -> reward -> unlock ->
   clue -> back -> event).  Adding a puzzle = one defPuzzle({...}) + a few nodes.
   The engine never changes.
   ---------------------------------------------------------------------
   step  : { id, kind:'inspect'|'code'|'answer'|'sequence', label, question,
             hint, solution, options, len, clue, wrongMsg,
             require:{items:[],flags:[],steps:[]},
             reward:{item,qty,flag,sym,echo,info,clue,objective:[t,sub],event,toast},
             onSolve(step) }
   puzzle: { id, name, steps:[...], onComplete() }
   ===================================================================== */
const PZUI={open:false,id:null,sid:null,input:[],sel:null,msg:'',solved:false};
const PUZZLES={};
function defPuzzle(p){PUZZLES[p.id]=p;return p;}
const PZ={
  def(id){return PUZZLES[id]||null;},
  state(id){if(!G.pz)G.pz={};if(!G.pz[id])G.pz[id]={done:[]};return G.pz[id];},
  step(id,sid){const p=PUZZLES[id];return p?p.steps.find(s=>s.id===sid):null;},
  stepSolved(id,sid){const st=G.pz&&G.pz[id];return !!(st&&st.done.indexOf(sid)>=0);},
  solved(id){const p=PUZZLES[id];return !!p&&p.steps.every(s=>PZ.stepSolved(id,s.id));},
  requireMet(id,s){
    const rq=(s&&s.require)||{};
    if(rq.items)for(const it of rq.items)if(!INV.has(it))return{ok:false,kind:'item',id:it};
    if(rq.flags)for(const f of rq.flags)if(!G.flags[f])return{ok:false,kind:'flag',id:f};
    if(rq.steps)for(const sid of rq.steps)if(!PZ.stepSolved(id,sid))return{ok:false,kind:'step',id:sid};
    return{ok:true};
  },
  nodeState(id,sid){
    const s=PZ.step(id,sid);if(!s)return null;
    if(PZ.stepSolved(id,sid))return 'solved';
    return PZ.requireMet(id,s).ok?'active':'locked';
  },
  /* entry point used by the 'puzzle' interaction type */
  node(c){
    const id=c.puzzle,sid=c.step;
    if(!PUZZLES[id]){SFX.deny();subtitle('','[لغز غير معرّف]');return;}
    const st=PZ.nodeState(id,sid);
    if(st==='solved'){SFX.deny();subtitle('',c.solvedMsg||'أنجزت هذا بالفعل.');return;}
    if(st==='locked'){
      const rq=PZ.requireMet(id,PZ.step(id,sid));SFX.deny();
      if(rq.kind==='item')subtitle('','مقفل. تحتاج: '+itemName(rq.id));
      else subtitle('',c.lockedMsg||'يبدو أن هناك ما يجب اكتشافه هنا أولًا.');
      return;
    }
    PZ.open(id,sid);
  },
  /* ---- panel ---- */
  open(id,sid){PZUI.id=id;PZUI.sid=sid;PZUI.input=[];PZUI.sel=null;PZUI.msg='';PZUI.solved=false;
    PZUI.open=true;$('pz').classList.remove('hide');renderPz();SFX.beep();},
  close(){$('pz').classList.add('hide');PZUI.open=false;updateHint();},
  check(s){
    if(!s)return false;
    if(s.kind==='inspect')return true;
    if(s.kind==='code')return PZUI.input.join('')===String(s.solution);
    if(s.kind==='answer')return PZUI.sel!=null&&PZUI.sel===s.solution;
    if(s.kind==='sequence')return PZUI.input.length===(s.solution||[]).length&&PZUI.input.every((v,i)=>v===s.solution[i]);
    return false;
  },
  submit(){
    const s=PZ.step(PZUI.id,PZUI.sid);if(!s||PZUI.solved)return;
    if(PZ.check(s)){PZUI.solved=true;PZUI.msg='';SFX.write();renderPz();}
    else{SFX.deny();shake(3,.3);PZUI.msg=s.wrongMsg||'خطأ. فكّر في الدليل.';renderPz();
      G.noiseEvent={r:9};note('أخطأت في «'+((PUZZLES[PZUI.id]||{}).name||'لغز')+'». شيء ما سمع الصوت.','anomaly');}
  },
  advance(){
    const id=PZUI.id,s=PZ.step(id,PZUI.sid);if(!s||!PZUI.solved)return;
    const st=PZ.state(id);if(st.done.indexOf(s.id)<0)st.done.push(s.id);
    PZ.reward(s.reward);
    if(s.onSolve)try{s.onSolve(s);}catch(e){}
    if(PZ.solved(id)&&PUZZLES[id].onComplete)try{PUZZLES[id].onComplete();}catch(e){}
    PZ.close();
  },
  reward(r){
    if(!r)return;
    if(r.flag)G.flags[r.flag]=true;
    if(r.item)INV.add(r.item,r.qty||1);
    if(r.sym)giveSym(r.sym);
    if(r.echo!=null)G.echo=Math.max(G.echo,r.echo);
    if(r.info)note(r.info,'puzzle');
    if(r.clue){flashMsg(r.clue,3600);note(r.clue,'puzzle');}
    if(r.objective)setObjective(r.objective[0],r.objective[1]);
    if(r.toast)toast(r.toast[0],r.toast[1]);
    if(r.event){try{triggerAnomaly(r.event);}catch(e){}}
    if(r.evt){try{EVT.fire(r.evt,{trigger:'puzzle'});}catch(e){}}
    if(r.onReward){try{r.onReward();}catch(e){}}
  }
};
function renderPz(){
  const root=$('pzBody');if(!root)return;
  const id=PZUI.id,p=PZ.def(id),s=PZ.step(id,PZUI.sid);
  if(!p||!s){PZ.close();return;}
  const doneN=PZ.state(id).done.length,total=p.steps.length;
  $('pzTitle').textContent=p.name||'لغز';
  $('pzStep').textContent='الخطوة '+(doneN+1)+' من '+total;
  root.innerHTML='';if(typeof root.replaceChildren==='function'){try{root.replaceChildren();}catch(e){}}
  if(PZUI.solved){
    root.appendChild(el('div','pzClue',s.clue||'تمّ الحل.'));
    const b=el('button','btn','تابع');b.onclick=()=>PZ.advance();root.appendChild(b);
    return;
  }
  if(s.question)root.appendChild(el('div','pzQ',s.question));
  if(s.kind==='code'){
    const len=s.len||String(s.solution).length;
    const disp=el('div','pzCode');
    for(let i=0;i<len;i++)disp.appendChild(el('span','pzDigit',PZUI.input[i]||'·'));
    root.appendChild(disp);
    const pad=el('div','pzPad');
    const press=n=>{if(PZUI.input.length<len){PZUI.input.push(String(n));SFX.beep();renderPz();}};
    ['1','2','3','4','5','6','7','8','9'].forEach(n=>{const b=el('button','pzKey',n);b.onclick=()=>press(n);pad.appendChild(b);});
    const bdel=el('button','pzKey','⌫');bdel.onclick=()=>{PZUI.input.pop();renderPz();};pad.appendChild(bdel);
    const b0=el('button','pzKey','0');b0.onclick=()=>press('0');pad.appendChild(b0);
    root.appendChild(pad);
  } else if(s.kind==='answer'||s.kind==='sequence'){
    if(s.kind==='sequence'){
      const seq=el('div','pzSeq');
      PZUI.input.forEach(v=>{const o=(s.options||[]).find(x=>x.id===v);seq.appendChild(el('span','pzChip',o?o.label:v));});
      root.appendChild(seq);
    }
    const opts=el('div','pzOpts');
    (s.options||[]).forEach(o=>{
      const used=s.kind==='sequence'&&PZUI.input.indexOf(o.id)>=0;
      const sel=s.kind==='answer'&&PZUI.sel===o.id;
      const b=el('button','pzOpt'+(sel?' sel':'')+(used?' used':''),o.label);
      b.onclick=()=>{
        if(s.kind==='answer'){PZUI.sel=o.id;SFX.beep();renderPz();}
        else{if(used||PZUI.input.length>=(s.solution||[]).length)return;PZUI.input.push(o.id);SFX.beep();renderPz();}
      };
      opts.appendChild(b);
    });
    root.appendChild(opts);
  }
  if(s.hint)root.appendChild(el('div','pzHint',s.hint));
  if(PZUI.msg)root.appendChild(el('div','pzMsg',PZUI.msg));
  const len=s.len||String(s.solution||'').length;
  const ready=s.kind==='inspect'
    ||(s.kind==='code'&&PZUI.input.length>=len)
    ||(s.kind==='answer'&&PZUI.sel!=null)
    ||(s.kind==='sequence'&&PZUI.input.length===(s.solution||[]).length);
  const cb=el('button','btn'+(ready?'':' disabled'),'تحقّق');
  cb.onclick=()=>{if(!ready){SFX.deny();return;}PZ.submit();};
  root.appendChild(cb);
}

/* ---- the ONE demo puzzle that proves the framework end-to-end ---- */
defPuzzle({
  id:'pz_lockbox',name:'صندوق الشقّة',
  steps:[
    {id:'clue_drawing',kind:'inspect',label:'افحص الرسم على الحائط',
      question:'رسم طفل بالفحم: شمس صغيرة، وتحتها ثلاثة أرقام محفورة في الجص: ٣ - ١ - ٤. وكلمة «الصندوق».',
      hint:'احفظ الأرقام.',
      clue:'الأرقام ٣-١-٤. هناك صندوق مقفل في غرفة النوم.',
      reward:{flag:'pz_drawing',info:'رسم الطفل: ٣-١-٤ ← صندوق غرفة النوم.',
        objective:['افتح الصندوق المقفل','غرفة النوم — المبنى السكني']}},
    {id:'lockbox',kind:'code',len:3,solution:'314',label:'الصندوق المقفل',
      question:'صندوق معدني بلوحة أرقام من ثلاثة منازل.',
      hint:'الأرقام من رسم الطفل في غرفة المعيشة.',
      wrongMsg:'لا ينفتح. الأرقام خطأ.',
      clue:'انفتح الصندوق: بداخله مفتاح صغير صدئ.',
      require:{steps:['clue_drawing']},
      reward:{item:'lockbox_key',info:'مفتاح الصندوق ← خزانة المطبخ.',
        objective:['افتح خزانة المطبخ','المطبخ — تحتاج المفتاح الصغير']}},
    {id:'cabinet',kind:'answer',solution:'sun',label:'خزانة المطبخ',
      question:'فتحت الخزانة بالمفتاح الصغير: بالداخل ثلاث علب صدئة — واحدة عليها شمس، واثنتان عليهما هلال ونجمة.',
      options:[{id:'moon',label:'العلبة عليها هلال'},{id:'sun',label:'العلبة عليها شمس'},{id:'star',label:'العلبة عليها نجمة'}],
      hint:'في الرسم كان الطفل يحمل شمسًا.',
      wrongMsg:'العلبة فارغة.',
      clue:'داخل علبة الشمس صورة قديمة لعائلة أمام هذا المبنى. على الظهر بخطٍّ مطبعي: «SUBJECT N-07». ينطفئ الضوء وتسمع همهمة من الشارع.',
      require:{items:['lockbox_key']},
      reward:{flag:'pz_cabinet',echo:0.4,info:'الصورة: SUBJECT N-07 ← عُد إلى الشارع.',
        objective:['عُد إلى الشارع','شيء ما تغيّر خارج المبنى']}}
  ],
  onComplete(){
    G.echo=Math.max(G.echo,0.45);
    flashMsg('همهمة في الشارع…',3000);
    note('انتهى «صندوق الشقّة». الشارع خلفك لم يعد كما كان.','story');
    try{triggerAnomaly('static');}catch(e){}
    try{EVT.fire('lockbox_aftermath',{trigger:'puzzle'});}catch(e){}
  }
});

/* puzzle: routes framework nodes to PZ; keeps the old activation hook as fallback */
INTERACT.register('puzzle',{key:'E',
  prompt(c){
    if(c.puzzle&&PUZZLES[c.puzzle]){
      const st=PZ.nodeState(c.puzzle,c.step);
      if(st==='solved')return (c.label||'لغز')+' — تمّ';
      if(st==='locked'){const rq=PZ.requireMet(c.puzzle,PZ.step(c.puzzle,c.step));
        if(rq.kind==='item')return (c.label||'لغز')+' — تحتاج '+itemName(rq.id);
        return (c.label||'لغز')+' — ليس بعد';}
    }
    return c.label||'لغز';
  },
  run(c){
    if(c.puzzle&&PUZZLES[c.puzzle]){PZ.node(c);return;}
    if(c.solved){SFX.deny();subtitle('','حللت هذا اللغز بالفعل.');return;}
    if(c.onActivate){c.onActivate(c);return;}
    if(c.code&&typeof openCode==='function'){openCode(c);return;}
    SFX.beep();
    subtitle('','[نظام الألغاز جاهز — المحتوى لم يُضف بعد]');
    note('وجدت لغزًا. النظام جاهز للتفعيل.','puzzle');
  }});

let curInt=null;
function updateHint(){
  const e=$('inter'),P=G.player,s=G.scene;
  if(!P||!s||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open){e.style.opacity=0;curInt=null;return;}
  const c=INTERACT.focus();
  curInt=c;
  if(c){
    e.style.opacity=1;
    e.querySelector('.k').textContent=INTERACT.key(c);
    e.querySelector('.d').textContent=INTERACT.prompt(c);
  }else e.style.opacity=0;
}
function itemName(k){
  if(ITEMS[k])return ITEMS[k].name;
  return {key_bath:'مفتاح الحمّام',keycard:'بطاقة الوصول',archkey:'مفتاح الأرشيف',
    tapeplayer:'مشغّل الأشرطة',batteries:'بطاريات',medkit:'حقيبة إسعاف'}[k]||k;
}
function doInteract(){
  const P=G.player;
  if(P.hidden){unhide();return;}
  const c=curInt;if(!c)return;
  if(dist(P.x,P.y,c.x,c.y)>INTERACT.range+0.2)return;
  INTERACT.run(c);
  if(typeof ANIM!=='undefined')ANIM.playInteraction(c);
  updateHint();
}
function tryFinal(c){
  if(!hasItem('doc_echo2')||!hasItem('doc_zero1')){
    SFX.deny();subtitle('','طاولة عليها ملف واحد. بقية الغرفة ما زالت مغلقة في رأسي.');return;
  }
  c.used=true;
  openDoc('final_file');
  G.flags.finalRead=true;
  setTimeout(()=>{if(G.flags.finalRead&&!G.over)showEnding();},1400);
}

/* ---------------- hide ---------------- */
function hideAt(c){
  const P=G.player;
  P.hidden=true;P.hideId=c.id;P.hideX=c.x;P.hideY=c.y;
  G.stats.hidden++;
  subtitle('','أنت مختبئ. لا تتنفّس بصوت عالٍ.');
  SFX.door();
  for(const e of G.scene.entsLive||[]){
    if((e.type==='creature'||e.type==='soldier')&&e.state==='chase'){
      if(dist(e.x,e.y,P.x,P.y)<7){e.state='investigate';e.ix=P.x+ (Math.random()-0.5)*2;e.iy=P.y+(Math.random()-0.5)*2;e.alert=0.6;}
    }
  }
  updateHint();
}
function unhide(){
  const P=G.player;
  P.hidden=false;P.hideId=null;
  subtitle('','خرجت.');
  updateHint();
}

/* ---------------- scene transition ---------------- */
function transition(id,sp,opt){
  const f=$('fade');
  f.style.opacity=1;
  setTimeout(()=>{
    enterScene(id,sp,opt);
    saveGame(true);
    f.style.opacity=0;
  },430);
}
/* =====================================================================
   ANIMATION SYSTEM (Phase 9) — a layered Animation State Machine for the
   player. Read-only on the Player Controller (it only reads P.*).
   ---------------------------------------------------------------------
   BASE layer  : idle / walk / run / sprint — selected from the *blended*
                 movement speed (P.moveSpeed) and CROSS-FADED over baseDur so
                 gaits never snap. The walk-cycle phase is accumulated from the
                 real speed (strideFreq) so feet don't slide and amplitude is
                 speed-linked.
   OVERLAY     : one-shot states (start / stop / turn / interact / pickup /
                 inspect / damage / death) played as weighted poses on top of
                 the base, each with an ease in/out envelope -> no abrupt cuts.
   The renderer reads ANIM.pose (a flat channel vector) every frame.
   ===================================================================== */
function locoPose(ampK,leanK,armK){
  return function(ph,ctx){
    const sp=ctx.speed||0,cr=ctx.crouch||0,p=ANIM.zero();
    const amp=clamp(sp*0.22*ampK,0,1.05)*(1-0.35*cr);
    const sn=Math.sin(ph);
    const lean=clamp(sp*0.032*leanK,0,0.28)*(1-0.45*cr);
    const bob=Math.abs(sn)*sp*0.012*(1-0.30*cr);
    p.legL=sn*amp;p.legR=-sn*amp;p.armL=-sn*amp*armK;p.armR=sn*amp*armK;
    p.torsoLean=lean;p.torsoY=bob;p.headY=bob*0.6;p.crouch=cr;p.scaleY=1-0.14*cr;
    return p;
  };
}
const ANIM={
  CH:['legL','legR','armL','armR','torsoLean','torsoTwist','torsoY','headY','headTilt','crouch','scaleY','rootY','rootRoll'],
  states:{},
  base:'idle',basePrev:null,baseT:1,baseDur:0.26,
  over:null,phase:0,speed01:0,dead:false,pose:null,
  _crouch:0,_prevHp:3,_prevYaw:0,_prevMoving:false,_prevSpeed:0,_turnCd:0,_ready:false,
  smooth(x){x=clamp(x,0,1);return x*x*(3-2*x);},
  zero(){const p={};for(const c of ANIM.CH)p[c]=0;p.scaleY=1;return p;},
  strideFreq(sp){return clamp(2.4+(sp||0)*2.6,0,16);},
  def(o){o.dur=o.dur||0.4;o.loop=!!o.loop;o.layer=o.layer||'upper';o.prio=o.prio||1;ANIM.states[o.name]=o;return o;},
  init(P){ANIM.base='idle';ANIM.basePrev=null;ANIM.baseT=1;ANIM.over=null;ANIM.phase=0;ANIM.speed01=0;
    ANIM.dead=false;ANIM._crouch=(P&&P.crouch)?1:0;ANIM._prevHp=P?P.hp:3;ANIM._prevYaw=P?(P.modelYaw||0):0;
    ANIM._prevMoving=false;ANIM._prevSpeed=0;ANIM._turnCd=0;ANIM.pose=ANIM.sampleBase('idle',{speed:0,crouch:ANIM._crouch});ANIM._ready=true;},
  play(name,opt){
    const st=ANIM.states[name];if(!st)return false;
    const cur=ANIM.over?ANIM.states[ANIM.over.name]:null;
    if(cur&&cur.latch)return false;            // death cannot be interrupted
    if(cur&&cur.prio>st.prio)return false;     // a higher-priority one-shot keeps playing
    ANIM.over={name:name,t:0,dur:(opt&&opt.dur)||st.dur,dir:(opt&&opt.dir)||1};
    return true;
  },
  playInteraction(c){const t=c&&c.type;
    if(t==='item')return ANIM.play('pickup');
    if(t==='examine'||t==='doc')return ANIM.play('inspect');
    return ANIM.play('interact');},
  selectBase(P,sp){if(ANIM.dead)return 'idle';if(sp<0.3)return 'idle';if(sp<2.8)return 'walk';if(sp<3.6)return 'run';return 'sprint';},
  sampleBase(name,ctx){const st=ANIM.states[name];return (st&&st.pose)?st.pose(ANIM.phase,ctx):ANIM.zero();},
  lerpPose(a,b,k){const o={};for(const c of ANIM.CH)o[c]=(a[c]||0)+((b[c]||0)-(a[c]||0))*k;return o;},
  applyOver(base,o,w){const out={};for(const c of ANIM.CH)out[c]=base[c]||0;
    for(const c of ANIM.CH){if(o&&o[c]!==undefined)out[c]=(base[c]||0)+(o[c]-(base[c]||0))*w;}return out;},
  envelope(st,u){return st.env?st.env(u):Math.sin(Math.PI*clamp(u,0,1));},
  update(dt,P){
    if(!P)return;
    if(!ANIM._ready)ANIM.init(P);
    if(ANIM.dead&&P.hp>0){ANIM.dead=false;ANIM.over=null;ANIM.base='idle';ANIM.basePrev=null;ANIM.baseT=1;}  // respawn
    const sp=P.moveSpeed||0;
    ANIM.speed01=clamp(sp/CFG.sprint,0,1);
    ANIM.phase=(ANIM.phase+dt*ANIM.strideFreq(sp))%1e6;
    ANIM._crouch+=((P.crouch?1:0)-ANIM._crouch)*(1-Math.pow(0.0009,dt));   // smooth crouch (no snap)
    const ctx={speed:sp,sprint:!!P.sprint,crouch:ANIM._crouch,injured:P.injured>0,dt:dt};
    /* base FSM + crossfade */
    const want=ANIM.selectBase(P,sp);
    if(want!==ANIM.base){ANIM.basePrev=ANIM.base;ANIM.base=want;ANIM.baseT=0;}
    if(ANIM.baseT<ANIM.baseDur)ANIM.baseT=Math.min(ANIM.baseDur,ANIM.baseT+dt);
    /* one-shot auto-triggers, derived purely from P (no controller edits) */
    ANIM._turnCd-=dt;
    if(!ANIM.dead){
      if(P.moving&&!ANIM._prevMoving&&sp>0.15)ANIM.play('start');
      else if(!P.moving&&ANIM._prevMoving&&ANIM._prevSpeed>0.4)ANIM.play('stop');
      const raw=((P.modelYaw-ANIM._prevYaw+Math.PI*3)%TAU)-Math.PI;
      if(dt>0&&Math.abs(raw)/dt>2.4&&ANIM._turnCd<=0&&sp>0.2){ANIM.play('turn',{dir:raw<0?-1:1});ANIM._turnCd=0.35;}
      if(P.hp<ANIM._prevHp){if(P.hp<=0){ANIM.dead=true;ANIM.play('death');}else ANIM.play('damage');}
    }
    ANIM._prevHp=P.hp;ANIM._prevYaw=P.modelYaw;ANIM._prevMoving=!!P.moving;ANIM._prevSpeed=sp;
    /* advance overlay */
    if(ANIM.over){const ost=ANIM.states[ANIM.over.name];ANIM.over.t+=dt;
      if(ANIM.over.t>=ANIM.over.dur){if(ost.latch)ANIM.over.t=ANIM.over.dur;else ANIM.over=null;}}
    /* compose: base (cross-faded) + overlay (enveloped) */
    let base=ANIM.sampleBase(ANIM.base,ctx);
    if(ANIM.basePrev&&ANIM.baseT<ANIM.baseDur)base=ANIM.lerpPose(ANIM.sampleBase(ANIM.basePrev,ctx),base,ANIM.smooth(ANIM.baseT/ANIM.baseDur));
    let pose=base;
    if(ANIM.over){const ost=ANIM.states[ANIM.over.name];
      pose=ANIM.applyOver(base,ost.pose?ost.pose(clamp(ANIM.over.t/ANIM.over.dur,0,1),ctx,ANIM.over):{},ANIM.envelope(ost,clamp(ANIM.over.t/ANIM.over.dur,0,1)));}
    ANIM.pose=pose;
  },
};
/* ---- base locomotion states ---- */
ANIM.def({name:'idle',loop:true,layer:'base',pose:function(ph,ctx){const cr=ctx.crouch||0,br=Math.sin(G.time*1.6)*0.035,p=ANIM.zero();
  p.armL=br*0.25;p.armR=-br*0.25;p.torsoLean=0.02;p.torsoY=br;p.headY=br*0.6;p.headTilt=Math.sin(G.time*0.7)*0.03;p.crouch=cr;p.scaleY=1-0.14*cr;return p;}});
ANIM.def({name:'walk',loop:true,layer:'base',pose:locoPose(1.00,1.00,0.85)});
ANIM.def({name:'run',loop:true,layer:'base',pose:locoPose(1.16,1.35,0.95)});
ANIM.def({name:'sprint',loop:true,layer:'base',pose:locoPose(1.32,1.75,1.05)});
/* ---- one-shot overlays ---- */
ANIM.def({name:'start',dur:0.34,layer:'upper',prio:2,pose:function(u){const w=Math.sin(Math.PI*u);return {torsoLean:-0.20*w,torsoY:-0.05*w,armL:0.45*w,armR:-0.45*w};}});
ANIM.def({name:'stop',dur:0.32,layer:'upper',prio:2,pose:function(u){const w=Math.sin(Math.PI*u);return {torsoLean:0.16*w,torsoY:-0.04*w,armL:-0.22*w,armR:0.22*w};}});
ANIM.def({name:'turn',dur:0.30,layer:'upper',prio:2,pose:function(u,ctx,over){const w=Math.sin(Math.PI*u),d=(over&&over.dir)||1;return {torsoTwist:d*0.45*w,headTilt:d*0.16*w};}});
ANIM.def({name:'interact',dur:0.60,layer:'upper',prio:3,pose:function(u){const w=Math.sin(Math.PI*u);return {armR:-1.25*w,armL:-0.30*w,torsoLean:0.10*w,headTilt:0.12*w};}});
ANIM.def({name:'pickup',dur:0.85,layer:'upper',prio:3,pose:function(u){const bend=Math.sin(Math.PI*u),grab=Math.sin(Math.PI*clamp((u-0.2)/0.5,0,1));return {torsoLean:0.50*bend,torsoY:-0.16*bend,headTilt:0.34*bend,armL:-0.85*grab,armR:-0.85*grab};}});
ANIM.def({name:'inspect',dur:1.30,layer:'upper',prio:3,env:function(u){if(u<0.16)return ANIM.smooth(u/0.16);if(u>0.84)return ANIM.smooth((1-u)/0.16);return 1;},pose:function(u){return {armL:-1.05,armR:-1.05,headTilt:0.30,torsoLean:0.06};}});
ANIM.def({name:'damage',dur:0.45,layer:'full',prio:4,pose:function(u){const w=Math.sin(Math.PI*u);return {torsoLean:-0.34*w,headTilt:-0.40*w,armL:0.70*w,armR:0.70*w,legL:-0.28*w,legR:0.20*w,rootY:-0.06*w,torsoTwist:0.18*w};}});
ANIM.def({name:'death',dur:1.10,layer:'full',prio:5,latch:true,env:function(u){return ANIM.smooth(clamp(u/0.85,0,1));},pose:function(u){const k=ANIM.smooth(clamp(u,0,1));return {rootY:-0.72*k,rootRoll:1.35*k,torsoLean:0.30*k,headTilt:0.50*k,legL:0.50*k,legR:-0.25*k,armL:0.90*k,armR:0.60*k,crouch:0.30*k,scaleY:1-0.10*k};}});

/* =====================================================================
   UPDATE — player
   ===================================================================== */
function updatePlayer(dt){
  const P=G.player,s=G.scene;if(!P||!s)return;
  let ix=0,iy=0;
  if(K('KeyW')||K('ArrowUp'))iy-=1;
  if(K('KeyS')||K('ArrowDown'))iy+=1;
  if(K('KeyA')||K('ArrowLeft'))ix-=1;
  if(K('KeyD')||K('ArrowRight'))ix+=1;
  ix+=IN.joy.x;iy+=IN.joy.y;
  /* camera-relative movement: W walks where you look, A/D strafe, never off-axis.
     world forward = (cos a, sin a), world right = (-sin a, sy a -> cos a);
     screen input is +x right / +y down, so forward = -iy and right = +ix. */
  if(ix||iy){
    const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
    const sx=ix,sy=iy;
    ix=-sy*ca-sx*sa;
    iy=-sy*sa+sx*ca;
  }
  const mag=Math.hypot(ix,iy);
  if(mag>1){ix/=mag;iy/=mag;}
  P.sprint=(K('ShiftLeft')||K('ShiftRight'))&&mag>0.1&&P.sta>2&&!P.crouch;
  P.crouch=K('KeyC')||K('ControlLeft')||P.crouchLock;
  if(P.hidden){
    P.moving=false;
    P.x=lerp(P.x,P.hideX,0.2);P.y=lerp(P.y,P.hideY,0.2);
    P.sta=Math.min(CFG.staMax,P.sta+CFG.staRegen*dt*1.4);
    return;
  }
  let sp=CFG.walk;
  if(P.crouch)sp=CFG.crouch; else if(P.sprint)sp=CFG.sprint;
  if(P.injured>0)sp*=0.78;
  P.moving=mag>0.1;
  if(P.moving){
    moveEnt(s,P,ix*sp*dt,iy*sp*dt,0.30);
    G.stats.walk+=sp*dt;
    P.stepT-=dt*sp*(P.crouch?0.6:1);
    if(P.stepT<=0){
      P.stepT=P.crouch?1.5:(P.sprint?0.72:1.05);
      SFX.step(P.sprint&&!P.crouch);
    }
  }
  /* ---- vertical physics: gravity + ground detection ---- */
  P.vy-=CFG.gravity*dt;
  P.py+=P.vy*dt;
  const gh=groundHeight(P.x,P.y);
  if(P.py<=gh){P.py=gh;P.vy=0;P.grounded=true;}
  else P.grounded=false;
  if(P.sprint)P.sta=Math.max(0,P.sta-CFG.staDrain*dt);
  else P.sta=Math.min(CFG.staMax,P.sta+CFG.staRegen*dt);
  /* aim — the mouse owns the view direction; movement never drags it around */
  const lookMag=Math.abs(IN.lookX)+Math.abs(IN.lookY);
  if(lookMag>0.02){
    IN.movedByMouse=true;
  }else if(P.moving&&!IN.movedByMouse&&mag>0.3){
    /* touch / no-mouse fallback: face where you walk */
    IN.aim=angLerp(IN.aim,Math.atan2(iy,ix),1-Math.pow(0.002,dt));
  }
  P.face=IN.aim;
  /* ---- body yaw: face the movement direction while walking, camera-forward
        while idle (classic third-person character controller) ---- */
  if(P.moving&&mag>0.1){
    P.modelYaw=angLerp(P.modelYaw,Math.atan2(iy,ix),1-Math.pow(0.00004,dt));
  }else{
    P.modelYaw=angLerp(P.modelYaw,IN.aim,1-Math.pow(0.002,dt));
  }
  /* ---- animation state + blended move speed ---- */
  P.anim=!P.moving?'idle':(P.sprint?'sprint':(P.crouch?'crouch':'walk'));
  P.moveSpeed=lerp(P.moveSpeed||0,P.moving?sp:0,1-Math.pow(0.0008,dt));
  /* flashlight */
  if(P.flash){
    P.bat=Math.max(0,P.bat-CFG.batDrain*dt*(P.sprint?1.2:1));
    if(P.bat<=0){P.flash=false;toast('الكشاف انطفأ','BATTERY DEAD');SFX.glitch();}
  }
  /* radiation */
  let rv=0;
  for(const z of s.radZones){
    if(z.rect){
      if(P.x>z.x0&&P.x<z.x1&&P.y>z.y0&&P.y<z.y1)rv=Math.max(rv,z.v);
    }else{
      const d=dist(P.x,P.y,z.x,z.y);
      if(d<z.r)rv=Math.max(rv,z.v*(1-d/z.r));
    }
  }
  G.radLevel=rv;
  if(rv>0.02){
    P.rad=Math.min(100,P.rad+rv*dt*1.5);
    geigerTick(dt,rv);
  }else{
    P.rad=Math.max(0,P.rad-dt*0.25);
  }
  if(P.rad>=100&&!G.over)die('الإشعاع ابتلعك. لا أحد سيجدك هنا.','RADIATION');
  if(P.injured>0)P.injured-=dt;
  if(P.dmgFlash>0)P.dmgFlash-=dt;
  /* vitals display */
  const hot=P.sta<45||P.bat<30||P.rad>18||P.hp<3||P.injured>0;
  G.showVitals=hot?2.5:Math.max(0,G.showVitals-dt);
  $('vitals').classList.toggle('hot',G.showVitals>0);
  $('vSta').style.width=(P.sta/CFG.staMax*100)+'%';
  $('vBat').style.width=(P.bat/CFG.batMax*100)+'%';
  $('vRad').style.width=(P.rad)+'%';
  $('vRad').style.background=P.rad>55?'#a4453a':'#8fa3ab';
  if(typeof UI!=='undefined')UI.healthPips(P.hp);
}
let geigT=0;
function geigerTick(dt,rv){
  geigT-=dt;
  if(geigT<=0){
    geigT=clamp(0.42-rv*0.55,0.03,0.5)*(0.6+Math.random()*0.8);
    SFX.click();
  }
}

/* =====================================================================
   UPDATE — entities
   ===================================================================== */
let flow=null,flowT=0,flowScene=null;
/* =====================================================================
   ENEMY AI FRAMEWORK (Phase 8) — a modular finite-state machine.
   ---------------------------------------------------------------------
   AI.states     : reusable behavior blocks { name, enter, think, act, exit }
   AI.archetypes : an enemy = DATA (which tunables + speeds + thresholds)
   AI.drive()    : perceive -> think -> act, with transitions (called by updateEnts)
   Detection (sight: range+angle+LOS), audio awareness (entHear), distance checks,
   and flow-field navigation are shared services. Adding an enemy = AI.archetype({...});
   adding a behavior = AI.state({...}). Nothing lives in the Player Controller.
   States: idle, patrol, investigate, search, chase, attack, lose, return.
   ===================================================================== */
const AI={
  states:{}, archetypes:{}, debug:true,
  state(def){AI.states[def.name]=def;return def;},
  archetype(a){AI.archetypes[a.id]=a;return a;},
  /* ---- blackboard ---- */
  init(e){
    const a=AI.archetypes[e.arch]||AI.archetypes.stalker;
    e.ai={arch:a,state:null,prev:null,alert:0,lastKnown:null,lastSeen:null,
      vis:0,hear:0,dist:0,canSee:false,lostT:0,searchT:0,invT:0,idleT:0,loseT:0,scanT:0,
      attackCd:0,stateT:0,patrolIdx:(e.pi|0)||0,ix:e.x,iy:e.y,stuckT:0};
    AI.enter(e,a.initial||'patrol');
    return e.ai;
  },
  enter(e,name){
    const ai=e.ai,cur=AI.states[ai.state];
    if(cur&&cur.exit){try{cur.exit(e,ai);}catch(x){}}
    ai.prev=ai.state;ai.state=name;ai.stateT=0;
    const st=AI.states[name];if(st&&st.enter){try{st.enter(e,ai);}catch(x){}}
  },
  go(e,name){if(e.ai&&e.ai.state!==name)AI.enter(e,name);},
  /* ---- shared perception: detection + audio + distance ---- */
  perceive(e,ai,s,P,dt){
    const a=ai.arch;
    const vis=P.hidden?0:AI.see(e,ai,s,P);
    const hear=AI.hear(e,ai,s,P);
    ai.vis=vis;ai.hear=hear;ai.dist=dist(e.x,e.y,P.x,P.y);ai.canSee=vis>0;
    const gain=vis*(a.alertGainSee!=null?a.alertGainSee:1.5)+hear*(a.alertGainHear!=null?a.alertGainHear:1.1)
      +(P.flash&&vis>0?(a.flashBonus||0.3):0);
    if(gain>0){ai.alert=Math.min(a.alertMax||1.6,ai.alert+dt*gain);
      if(vis>0||hear>=(a.hearLoc!=null?a.hearLoc:0.2))ai.lastKnown={x:P.x,y:P.y,t:G.time};}
    else ai.alert=Math.max(0,ai.alert-dt*(a.alertDecay||0.42));
    return ai;
  },
  see(e,ai,s,P){
    const a=ai.arch,range=(a.sight&&a.sight.range)||CFG.sightRange;
    const d=dist(e.x,e.y,P.x,P.y);if(d>range)return 0;
    const ang=Math.atan2(P.y-e.y,P.x-e.x);
    let da=Math.abs(((ang-e.face+Math.PI*3)%TAU)-Math.PI);
    const half=(a.sight&&a.sight.angle)||CFG.sightAngle;
    if(da>half&&d>1.6)return 0;
    if(!losClear(s,e.x,e.y,P.x,P.y))return 0;
    return clamp(1.25-d/range,0.15,1);
  },
  hear(e,ai,s,P){return entHear(s,e,P.x,P.y);},
  /* ---- shared navigation (flow field + collision) ---- */
  moveTo(e,ai,s,tx,ty,speed,dt){
    if(!(speed>0)){e.moving=false;return null;}
    computeFlowIfNeeded(s,tx,ty);
    let ang=flowDir(s,e);
    if(ang==null||ang===-1)ang=Math.atan2(ty-e.y,tx-e.x);
    e.face=angLerp(e.face,ang,1-Math.pow(0.004,dt));
    const r=(ai.arch&&ai.arch.radius)||0.32;
    const dx=Math.cos(ang)*speed*dt,dy=Math.sin(ang)*speed*dt,bx=e.x,by=e.y;
    moveEnt(s,e,dx,dy,r);
    if(Math.abs(e.x-bx)<1e-5&&Math.abs(e.y-by)<1e-5){
      /* blocked: slip toward the tile centre so the body clears wall corners, then jiggle */
      ai.stuckT+=dt;
      const cx=Math.floor(e.x)+0.5,cy=Math.floor(e.y)+0.5,cd=Math.hypot(cx-e.x,cy-e.y);
      if(cd>0.06){const ca=Math.atan2(cy-e.y,cx-e.x);moveEnt(s,e,Math.cos(ca)*speed*dt,Math.sin(ca)*speed*dt,r);}
      else{const ra=Math.random()*TAU;moveEnt(s,e,Math.cos(ra)*speed*dt,Math.sin(ra)*speed*dt,r);}
    }else ai.stuckT=0;
    e.moving=true;return ang;
  },
  faceTo(e,ai,tx,ty,dt,rate){e.face=angLerp(e.face,Math.atan2(ty-e.y,tx-e.x),1-Math.pow(rate||0.005,dt));},
  scan(e,ai,dt){ai.scanT-=dt;if(ai.scanT<=0){ai.scanT=0.6+Math.random()*0.7;
    AI.faceTo(e,ai,e.x+Math.cos(ai.face+1.3)*3,e.y+Math.sin(ai.face+1.3)*3,dt,0.02);}},
  speed(ai,name){const sp=ai.arch.speed||{};return sp[name]!=null?sp[name]:(sp.patrol||CFG.creatureWalk);},
  patrolPoints(e,ai){if(e.patrol&&e.patrol.length)return e.patrol;
    const a=ai.arch;if(a.patrol&&a.patrol.points)return a.patrol.points;return [[e.x,e.y]];},
  searchPoints(e,ai){const r=(ai.arch.search&&ai.arch.search.radius)||4;
    const cx=ai.lastKnown?ai.lastKnown.x:e.x,cy=ai.lastKnown?ai.lastKnown.y:e.y,pts=[];
    for(let i=0;i<4;i++){const a=Math.random()*TAU;pts.push([cx+Math.cos(a)*r*(0.4+Math.random()*0.6),cy+Math.sin(a)*r*(0.4+Math.random()*0.6)]);}
    return pts;},
  /* perception-driven jump used by low-alert states */
  react(e,ai){const a=ai.arch,chaseT=a.chaseAlert!=null?a.chaseAlert:1.0,invT=a.investigateAlert!=null?a.investigateAlert:0.3;
    if(ai.alert>=chaseT&&(ai.canSee||ai.lastKnown))return 'chase';
    if(ai.alert>=invT&&ai.lastKnown)return 'investigate';
    return null;},
  attack(e,ai,s,P){const a=ai.arch;if(a.attack&&a.attack.onHit)a.attack.onHit(e,ai,P);else hitPlayer(e);},
  /* ---- the driver ---- */
  drive(e,dt,s,P){
    if(!e.ai)AI.init(e);
    const ai=e.ai;ai.stateT+=dt;if(ai.attackCd>0)ai.attackCd-=dt;
    AI.perceive(e,ai,s,P,dt);
    let st=AI.states[ai.state];
    if(!st){AI.enter(e,ai.arch.initial||'patrol');st=AI.states[ai.state];}
    let next=null;
    if(st&&st.think){try{next=st.think(e,ai,s,P,dt);}catch(x){}}
    if(next&&next!==ai.state){AI.enter(e,next);st=AI.states[ai.state];}
    if(st&&st.act){try{st.act(e,ai,s,P,dt);}catch(x){}}
    if(AI.debug&&G.sceneId==='ai_arena'){const d=$('aidebug');
      if(d){d.style.opacity=1;
        d.textContent='AI '+(ai.arch.id||'')+' : '+ai.state.toUpperCase()+'   alert '+ai.alert.toFixed(2)
          +'   dist '+ai.dist.toFixed(1)+(ai.canSee?'   [SEE]':'')+(ai.hear>0.01?'   [HEAR '+ai.hear.toFixed(2)+']':'');}}
  },
};

/* ---------------- the eight reusable states ---------------- */
AI.state({name:'idle',
  enter(e,ai){ai.idleT=(ai.arch.idle&&ai.arch.idle.time)||(1.4+Math.random()*2);e.moving=false;},
  think(e,ai,s,P,dt){const r=AI.react(e,ai);if(r)return r;ai.idleT-=dt;AI.scan(e,ai,dt);
    if(ai.idleT<=0)return 'patrol';return null;},
  act(e,ai,s,P,dt){e.moving=false;}});

AI.state({name:'patrol',
  enter(e,ai){e.moving=true;},
  think(e,ai,s,P,dt){return AI.react(e,ai);},
  act(e,ai,s,P,dt){const pts=AI.patrolPoints(e,ai);if(!pts.length){e.moving=false;return;}
    let tg=pts[ai.patrolIdx%pts.length];
    if(dist(e.x,e.y,tg[0],tg[1])<((ai.arch.patrol&&ai.arch.patrol.reach)||1.1)){ai.patrolIdx=(ai.patrolIdx+1)%pts.length;tg=pts[ai.patrolIdx%pts.length];}
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'patrol'),dt);}});

AI.state({name:'investigate',
  enter(e,ai){const lk=ai.lastKnown;ai.ix=lk?lk.x+(Math.random()-0.5)*1.5:e.x;ai.iy=lk?lk.y+(Math.random()-0.5)*1.5:e.y;
    ai.invT=(ai.arch.investigate&&ai.arch.investigate.time)||7;},
  think(e,ai,s,P,dt){const a=ai.arch;if(ai.alert>=(a.chaseAlert!=null?a.chaseAlert:1.0)&&(ai.canSee||ai.lastKnown))return 'chase';
    ai.invT-=dt;if(dist(e.x,e.y,ai.ix,ai.iy)<1.0||ai.invT<=0)return 'search';return null;},
  act(e,ai,s,P,dt){AI.moveTo(e,ai,s,ai.ix,ai.iy,AI.speed(ai,'investigate'),dt);}});

AI.state({name:'search',
  enter(e,ai){ai.searchT=(ai.arch.search&&ai.arch.search.time)||6;ai.searchPts=AI.searchPoints(e,ai);ai.sIdx=0;},
  think(e,ai,s,P,dt){const a=ai.arch,chaseT=a.chaseAlert!=null?a.chaseAlert:1.0;
    if(ai.alert>=chaseT&&(ai.canSee||ai.lastKnown))return 'chase';
    if(ai.lastKnown&&(G.time-ai.lastKnown.t)<1.0&&ai.alert>=(a.investigateAlert||0.3))return 'investigate';
    ai.searchT-=dt;if(ai.searchT<=0)return 'return';return null;},
  act(e,ai,s,P,dt){AI.scan(e,ai,dt);const pts=ai.searchPts||[];
    if(!pts.length){e.moving=false;return;}
    let tg=pts[ai.sIdx%pts.length];
    if(dist(e.x,e.y,tg[0],tg[1])<1.0){ai.sIdx=(ai.sIdx+1)%pts.length;tg=pts[ai.sIdx%pts.length];}
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'search')||AI.speed(ai,'investigate')*0.7,dt);}});

AI.state({name:'chase',
  enter(e,ai){if(ai.lastKnown)ai.lastSeen={x:ai.lastKnown.x,y:ai.lastKnown.y};ai.lostT=0;
    if(ai.arch.onChase){try{ai.arch.onChase(e,ai);}catch(x){}}},
  think(e,ai,s,P,dt){const a=ai.arch;
    if(ai.canSee)ai.lastSeen={x:P.x,y:P.y};
    if(!P.hidden&&ai.dist<=((a.attack&&a.attack.range)||0.95))return 'attack';
    if(ai.alert<=(a.loseAlert!=null?a.loseAlert:0.18)){ai.lostT+=dt;if(ai.lostT>0.45)return 'lose';}else ai.lostT=0;
    return null;},
  act(e,ai,s,P,dt){const tx=ai.canSee?P.x:(ai.lastSeen?ai.lastSeen.x:e.x),ty=ai.canSee?P.y:(ai.lastSeen?ai.lastSeen.y:e.y);
    AI.moveTo(e,ai,s,tx,ty,AI.speed(ai,'chase'),dt);
    if(!ai.canSee&&ai.lastSeen&&dist(e.x,e.y,ai.lastSeen.x,ai.lastSeen.y)<1.1)AI.go(e,'lose');}});

AI.state({name:'attack',
  enter(e,ai){ai.attackCd=Math.max(ai.attackCd,0.25);},
  think(e,ai,s,P,dt){const a=ai.arch,rng=(a.attack&&a.attack.range)||0.95;
    if(ai.alert<=(a.loseAlert!=null?a.loseAlert:0.18))return 'lose';
    if(P.hidden||ai.dist>rng*1.3)return 'chase';return null;},
  act(e,ai,s,P,dt){AI.faceTo(e,ai,P.x,P.y,dt,0.002);e.moving=false;
    const a=ai.arch,rng=(a.attack&&a.attack.range)||0.95;
    if(ai.attackCd<=0&&!P.hidden&&ai.dist<=rng+0.25){ai.attackCd=(a.attack&&a.attack.cooldown)||1.4;AI.attack(e,ai,s,P);}}});

AI.state({name:'lose',
  enter(e,ai){ai.loseT=(ai.arch.lose&&ai.arch.lose.time)||1.0;
    if(ai.arch.onLose){try{ai.arch.onLose(e,ai);}catch(x){}}},
  think(e,ai,s,P,dt){const a=ai.arch;if(ai.canSee&&ai.alert>=(a.chaseAlert!=null?a.chaseAlert:1.0))return 'chase';
    ai.loseT-=dt;if(ai.loseT<=0)return 'search';return null;},
  act(e,ai,s,P,dt){e.moving=false;AI.scan(e,ai,dt);}});

AI.state({name:'return',
  enter(e,ai){const pts=AI.patrolPoints(e,ai);let bi=0,bd=1e9;
    for(let i=0;i<pts.length;i++){const d=dist(e.x,e.y,pts[i][0],pts[i][1]);if(d<bd){bd=d;bi=i;}}
    ai.patrolIdx=bi;},
  think(e,ai,s,P,dt){const r=AI.react(e,ai);if(r)return r;
    const pts=AI.patrolPoints(e,ai),tg=pts[ai.patrolIdx%pts.length]||[e.x,e.y];
    if(dist(e.x,e.y,tg[0],tg[1])<1.3)return 'patrol';return null;},
  act(e,ai,s,P,dt){const pts=AI.patrolPoints(e,ai),tg=pts[ai.patrolIdx%pts.length]||[e.x,e.y];
    AI.moveTo(e,ai,s,tg[0],tg[1],AI.speed(ai,'return')||AI.speed(ai,'patrol'),dt);}});

/* ---------------- the ONE prototype enemy (data only) ---------------- */
AI.archetype({
  id:'stalker', initial:'patrol',
  sight:{range:12,angle:1.2},
  speed:{idle:0,patrol:1.6,investigate:2.3,search:1.6,chase:3.4,return:1.9,attack:0},
  alertGainSee:1.7, alertGainHear:1.25, alertDecay:0.40, alertMax:1.6, flashBonus:0.3,
  investigateAlert:0.30, chaseAlert:1.0, loseAlert:0.18, hearLoc:0.2,
  idle:{time:2}, investigate:{time:7}, search:{time:6,radius:4.5}, lose:{time:1.0},
  patrol:{reach:1.1}, attack:{range:1.05,cooldown:1.5,damage:1}, radius:0.34,
  onChase(e,ai){subtitle('','رآك. يتحرّك نحوك بسرعة.');SFX.dread();},
  onLose(e,ai){subtitle('','فقد أثرك. يتلفّت باحثًا.');}
});

/* ---------------- separate AI test arena ---------------- */
function buildAIArena(){
  const s=ENV.scene('ai_arena',26,20,TL.WALL,{indoor:true,name:'منطقة اختبار الذكاء الاصطناعي',
    spawn:{x:3.5,y:10.5},safe:{scene:'ai_arena',x:3.5,y:10.5},
    atmo:{fog:0.055,hemi:0.11,amb:0.045,fogColor:0x06090c,bg:0x06090c},
    audio:{wind:0.04,hum:0.05,windFreq:200,events:[{sfx:'creak',min:14,max:30}]}});
  const g=s.g;
  rect(g,1,1,24,18,TL.F_CONC);
  /* cover blocks: break line-of-sight and force the flow-field to route around */
  rect(g,8,4,2,5,TL.WALL);rect(g,8,12,2,5,TL.WALL);
  rect(g,13,8,3,2,TL.WALL);rect(g,19,3,2,4,TL.WALL);rect(g,19,14,2,4,TL.WALL);
  s.sprites.push({x:5,y:5,type:'crate'},{x:5,y:15,type:'crate'},{x:22,y:10,type:'debris'});
  ENV.light(s,{x:13,y:10,r:9,c:'rgba(200,220,255,',a:0.09,flick:0.04});
  ENV.bright(s,3.5,10.5,4.0,'rgba(255,214,150,',0.10,0.05);
  /* ONE prototype enemy on the framework */
  s.ents.push({type:'ai',arch:'stalker',x:18,y:10,face:Math.PI,id:'proto',hp:1,
    patrol:[[18,4],[18,16],[11,16],[11,4]]});
  /* a hiding spot to test detection-drop / lose-target */
  ENV.hide(s,3,16,'اختبئ خلف الصناديق','ai_hide');
  return s;
}

function computeFlow(s,tx,ty){
  const w=s.g.w,h=s.g.h;
  if(!flow||flowScene!==s.id||flow.length!==w*h){flow=new Int16Array(w*h);flowScene=s.id;}
  flow.fill(-1);
  const q=[ty*w+tx];flow[ty*w+tx]=0;
  for(let qi=0;qi<q.length;qi++){
    const c=q[qi],cx=c%w,cy=(c/w)|0,d=flow[c];
    const nb=[[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]];
    for(const n of nb){
      const nx=n[0],ny=n[1];
      if(nx<0||ny<0||nx>=w||ny>=h)continue;
      const ni=ny*w+nx;
      if(flow[ni]!==-1)continue;
      if(solidT(s.g.d[ni]))continue;
      flow[ni]=d+1;q.push(ni);
    }
  }
  return flow;
}
function flowDir(s,e){
  const w=s.g.w,h=s.g.h;
  const cx=clamp(Math.floor(e.x),0,w-1),cy=clamp(Math.floor(e.y),0,h-1);
  let best=-1,bd=1e9;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
    if(!i&&!j)continue;
    const nx=cx+i,ny=cy+j;
    if(nx<0||ny<0||nx>=w||ny>=h)continue;
    const v=flow[ny*w+nx];
    if(v<0)continue;
    if(i&&j&&(solidT(getT(s.g,cx+i,cy))||solidT(getT(s.g,cx,cy+j))))continue;
    if(v<bd){bd=v;best=Math.atan2(j,i);}
  }
  return best;
}
function entSee(s,e,px,py){
  const d=dist(e.x,e.y,px,py);
  const range=(e.sight||CFG.sightRange)*(e.kind==='retained'?1.15:1);
  if(d>range)return 0;
  const a=Math.atan2(py-e.y,px-e.x);
  let da=Math.abs(((a-e.face+Math.PI*3)%TAU)-Math.PI);
  if(da>CFG.sightAngle&&d>1.6)return 0;
  if(!losClear(s,e.x,e.y,px,py))return 0;
  return clamp(1.25-d/range,0.15,1);
}
function entHear(s,e,px,py){
  const P=G.player;
  let r=0;
  if(P.hidden)r=0.4;
  else if(P.sprint&&!P.crouch)r=CFG.hearSprint;
  else if(P.crouch)r=CFG.hearCrouch;
  else if(P.moving)r=CFG.hearWalk;
  if(G.noiseEvent){r=Math.max(r,G.noiseEvent.r);G.noiseEvent=null;}
  if(!r)return 0;
  const d=dist(e.x,e.y,px,py);
  return d<r?clamp(1-d/r,0.2,1):0;
}
function updateEnts(dt){
  const s=G.scene,P=G.player;if(!s||!s.entsLive)return;
  for(const e of s.entsLive){
    /* remember positions & deaths (persisted via G.flags.pos -> saveGame) */
    if(e.key){G.flags.pos=G.flags.pos||{};
      G.flags.pos[e.key]={x:e.x,y:e.y,dead:!!e.dead};if(e.hp!=null)G.flags.pos[e.key].hp=e.hp;}
    if(e.dead)continue;
    e.t=(e.t||0)+dt;
    if(e.type==='creature'||e.type==='soldier')updateHunter(dt,s,e,P);
    else if(e.type==='rex')updateRex(dt,s,e,P);
    else if(e.type==='nika')updateNika(dt,s,e,P);
    else if(e.type==='psy')updatePsy(dt,s,e,P);
    else if(e.type==='subject01')updateS01(dt,s,e,P);
    else if(e.type==='ai')AI.drive(e,dt,s,P);
  }
  /* heartbeat when hunted */
  let threat=0;
  for(const e of s.entsLive)if((e.type==='creature'||e.type==='soldier')&&e.state==='chase')
    threat=Math.max(threat,clamp(1-dist(e.x,e.y,P.x,P.y)/12,0,1));
  for(const e of s.entsLive)if(e.type==='ai'&&e.ai&&(e.ai.state==='chase'||e.ai.state==='attack'))
    threat=Math.max(threat,clamp(1-dist(e.x,e.y,P.x,P.y)/12,0,1));
  G.threat=threat;
  if(threat>0.05){
    G.heartT=(G.heartT||0)-dt*(0.5+threat);
    if(G.heartT<=0){G.heartT=1.1-threat*0.5;SFX.heart();}
  }
}
function updateHunter(dt,s,e,P){
  const vis=P.hidden?0:entSee(s,e,P.x,P.y);
  const hear=entHear(s,e,P.x,P.y);
  const lightBonus=(P.flash&&vis>0)?0.35:0;
  if(vis>0||hear>0){
    e.alert=Math.min(1.6,e.alert+dt*(vis*1.5+hear*1.1+lightBonus));
    e.face=angLerp(e.face,Math.atan2(P.y-e.y,P.x-e.x),1-Math.pow(0.002,dt));
    if(e.alert>=1&&e.state!=='chase'){
      e.state='chase';e.lastSeen={x:P.x,y:P.y};
      if(e.type==='creature'){SFX.sting();shake(6,0.5);
        subtitle('',e.kind==='retained'?'شيء ما تغيّر في طريقة حركته. إنه يعرف أين أنت.':'صرخة قريبة. جافة. ليست لحيوان.');}
      else {subtitle('','— هناك! أوقفه!');SFX.beep();}
    }
  }else{
    e.alert=Math.max(0,e.alert-dt*0.42);
    if(e.alert<=0.02&&e.state==='chase'){e.state='investigate';e.ix=e.lastSeen?e.lastSeen.x:e.x;e.iy=e.lastSeen?e.lastSeen.y:e.y;e.it=6;}
  }
  let sp=0,tx=0,ty=0,useFlow=false;
  if(e.state==='chase'){
    sp=(e.type==='soldier'?CFG.creatureChase*0.92:CFG.creatureChase*(e.kind==='retained'?1.08:1))*(e.wounded?0.72:1);
    if(vis>0){e.lastSeen={x:P.x,y:P.y};tx=P.x;ty=P.y;}
    else if(e.lastSeen){tx=e.lastSeen.x;ty=e.lastSeen.y;}
    useFlow=true;
    if(e.lastSeen&&dist(e.x,e.y,e.lastSeen.x,e.lastSeen.y)<1.1&&vis<=0){
      e.state='investigate';e.it=5;e.ix=e.lastSeen.x+(Math.random()-0.5)*4;e.iy=e.lastSeen.y+(Math.random()-0.5)*4;
    }
    /* catch */
    if(!P.hidden&&dist(e.x,e.y,P.x,P.y)<0.85){
      if(e.type==='soldier')captured();else hitPlayer(e);
    }
  }else if(e.state==='investigate'){
    sp=(e.type==='soldier'?CFG.creatureWalk*1.1:CFG.creatureWalk*1.25);
    tx=e.ix;ty=e.iy;useFlow=true;
    e.it=(e.it||4)-dt;
    if(dist(e.x,e.y,tx,ty)<1.0||e.it<=0){
      if(e.type==='creature'&&e.kind==='retained'&&G.stats.hidden>1&&Math.random()<0.5){
        /* retained subjects learn: check your hiding spots */
        const hs=(s.ints||[]).filter(i=>i.type==='hide');
        if(hs.length){const h=hs[Math.floor(Math.random()*hs.length)];e.ix=h.x;e.iy=h.y;e.it=6;
          if(dist(e.x,e.y,h.x,h.y)<14)subtitle('','خطوات تتوقف أمام مكان اعتدت الاختباء فيه.');}
        else e.state='patrol';
      }else e.state='patrol';
    }
  }else{
    /* patrol */
    sp=(e.type==='soldier'?CFG.creatureWalk*0.9:CFG.creatureWalk)*(e.wounded?0.6:1);
    const pts=e.patrol||[[e.x,e.y]];
    const tg=pts[e.pi%pts.length];
    tx=tg[0];ty=tg[1];useFlow=true;
    if(dist(e.x,e.y,tx,ty)<1.2)e.pi=(e.pi+1)%pts.length;
    if(e.alert>0.02&&e.alert<1){e.state=e.state;}
  }
  if(sp>0){
    let ang;
    if(useFlow&&flow){
      computeFlowIfNeeded(s,tx,ty);
      ang=flowDir(s,e);
    }
    if(ang==null||ang===-1)ang=Math.atan2(ty-e.y,tx-e.x);
    e.face=angLerp(e.face,ang,1-Math.pow(0.004,dt));
    const dx=Math.cos(ang)*sp*dt,dy=Math.sin(ang)*sp*dt;
    const bx=e.x,by=e.y;
    moveEnt(s,e,dx,dy,0.32);
    if(Math.abs(e.x-bx)<1e-4&&Math.abs(e.y-by)<1e-4){
      /* stuck: sidestep */
      moveEnt(s,e,Math.cos(ang+1.6)*sp*dt,Math.sin(ang+1.6)*sp*dt,0.32);
    }
    e.moving=true;
    e.stepT=(e.stepT||0)-dt;
    if(e.stepT<=0){e.stepT=0.62;
      if(dist(e.x,e.y,P.x,P.y)<13)noiseBurst(0.07,150,0.7,0.035);}
  }else e.moving=false;
}
let flowTarget=null;
function computeFlowIfNeeded(s,tx,ty){
  const k=Math.floor(tx)+'_'+Math.floor(ty);
  if(flowTarget!==k||flowScene!==s.id){
    computeFlow(s,clamp(Math.floor(tx),0,s.w-1),clamp(Math.floor(ty),0,s.h-1));
    flowTarget=k;
  }
}
function hitPlayer(e){
  const P=G.player;
  if(G.over)return;
  P.hp--;P.injured=8;P.dmgFlash=0.7;
  shake(16,0.7);SFX.sting();
  G.whiteout=0.5;
  if(P.hp<=0){
    die(e.kind==='retained'?'أمسك بك. لم يقاومك أحد بهذه الطريقة من قبل. آخر ما رأيته كان وجهك… من الخلف.':'وقع عليك. لم يكن سريعًا. لم يكن بطيئًا. كان دقيقًا.','CAUGHT');
  }else{
    subtitle('','أُصبت. ('+P.hp+' متبقٍ) — ابتعد، الآن.');
    /* knock away */
    const a=Math.atan2(P.y-e.y,P.x-e.x);
    moveEnt(G.scene,P,Math.cos(a)*1.4,Math.sin(a)*1.4,0.3);
    e.state='investigate';e.alert=0.4;e.it=3;e.ix=e.x;e.iy=e.y;
  }
}
function updateRex(dt,s,e,P){
  if(!e.joined){
    e.moving=false;
    e.stare=0;
    /* psychological indicator */
    e.t2=(e.t2||0)-dt;
    if(e.t2<=0){
      e.t2=6+Math.random()*10;
      const nearPsy=(s.entsLive||[]).some(o=>(o.type==='psy'||o.type==='subject01')&&dist(o.x,o.y,e.x,e.y)<16);
      const nearHidden=(s.entsLive||[]).some(o=>(o.type==='creature')&&o.state!=='patrol'&&dist(o.x,o.y,e.x,e.y)<18);
      if(nearPsy||nearHidden||G.echo>0.4){
        e.stare=Math.random()*TAU;e.stareT=2.4+Math.random()*3;
        if(Math.random()<0.6&&dist(e.x,e.y,P.x,P.y)<16){SFX.bark();
          subtitle('ركس','ينبح على مكان فارغ. شعره واقف.');}
      }
    }
    if(e.stareT>0){e.stareT-=dt;}else e.stare=0;
    return;
  }
  /* follow */
  const d=dist(e.x,e.y,P.x,P.y);
  e.moving=false;e.stare=0;
  if(d>2.4){
    const sp=d>7?CFG.sprint*0.95:CFG.walk*1.02;
    const a=Math.atan2(P.y-e.y,P.x-e.x);
    computeFlowIfNeeded(s,P.x,P.y);
    let ang=flowDir(s,e);if(ang==null||ang===-1)ang=a;
    e.face=angLerp(e.face,ang,1-Math.pow(0.003,dt));
    const bx=e.x,by=e.y;
    moveEnt(s,e,Math.cos(ang)*sp*dt,Math.sin(ang)*sp*dt,0.26);
    if(Math.abs(e.x-bx)<1e-4&&Math.abs(e.y-by)<1e-4)moveEnt(s,e,Math.cos(ang+1.4)*sp*dt,Math.sin(ang+1.4)*sp*dt,0.26);
    e.moving=true;
  }else{
    e.face=angLerp(e.face,Math.atan2(P.y-e.y,P.x-e.x),1-Math.pow(0.02,dt));
  }
  /* warning */
  e.t2=(e.t2||0)-dt;
  if(e.t2<=0){
    e.t2=5+Math.random()*7;
    const threat=(s.entsLive||[]).find(o=>(o.type==='creature'||o.type==='soldier')&&dist(o.x,o.y,P.x,P.y)<13&&o.state!=='patrol');
    if(threat){
      e.stare=Math.atan2(threat.y-e.y,threat.x-e.x);e.stareT=3;
      SFX.bark();
      note('ركس ينظر إلى مكان لا أرى فيه شيئًا. ثم ينظر إليّ.','rex');
    }
    const psy=(s.entsLive||[]).find(o=>(o.type==='psy'||o.type==='subject01')&&dist(o.x,o.y,P.x,P.y)<16);
    if(psy){e.stare=Math.atan2(psy.y-e.y,psy.x-e.x);e.stareT=4;
      if(Math.random()<0.5)SFX.whisper();}
  }
  if(e.stareT>0)e.stareT-=dt;else e.stare=0;
}
function joinRex(e){
  if(e.joined)return;
  e.joined=true;G.flags.rex=true;
  SFX.bark();
  toast('ركس انضم إليك','COMPANION — مؤشر نفسي وبيئي');
  note('كلب. ضلوع بارزة. لا يخاف مني، وهذا غريب. سأسمّيه ركس.','rex');
  subtitle('ركس','يقترب. يشمّ يدك. ثم ينظر خلفك — إلى مكان فارغ — ويعود للنظر إليك.');
  G.trust++;
}
function updateNika(dt,s,e,P){
  if(e.gone){e.vis=0;return;}
  const d=dist(e.x,e.y,P.x,P.y);
  const target=d<12?1:0;
  e.vis=lerp(e.vis||0,target,dt*1.6);
  e.moving=false;
  if(d<12)e.face=angLerp(e.face||0,Math.atan2(P.y-e.y,P.x-e.x),1-Math.pow(0.05,dt));
  if(!G.flags.nikaMet&&d<9&&!DLG.open&&G.sceneId==='school'){
    startNikaSchool(e);
  }
  if(G.flags.nikaMet&&G.sceneId==='tunnels'&&!G.flags.nikaTunnels&&d<10){
    G.flags.nikaTunnels=true;
    talkNikaTunnels(e);
  }
}
function updatePsy(dt,s,e,P){
  const d=dist(e.x,e.y,P.x,P.y);
  const a=Math.atan2(e.y-P.y,e.x-P.x);
  let da=Math.abs(((a-IN.aim+Math.PI*3)%TAU)-Math.PI);
  const edge=(da>0.9&&da<2.2&&d<15&&d>4)?1:0;
  const target=edge*(0.35+G.echo*0.65)*(G.flags.psyEnabled?1:0.55);
  e.vis=lerp(e.vis||0,target,dt*(target>0?1.4:3.2));
  if(e.vis>0.3&&(e.seenT||0)<=0){
    e.seenT=18+Math.random()*30;
    G.stats.anomalies++;
    if(Math.random()<0.5)SFX.whisper();
    if(Math.random()<0.3)triggerAnomaly('shadow');
  }
  if(e.seenT>0)e.seenT-=dt;
}
function updateS01(dt,s,e,P){
  if(!G.flags.s01Seen){e.vis=lerp(e.vis||0,0,dt*3);return;}
  const d=dist(e.x,e.y,P.x,P.y);
  const a=Math.atan2(e.y-P.y,e.x-P.x);
  let da=Math.abs(((a-IN.aim+Math.PI*3)%TAU)-Math.PI);
  let target=0;
  if(G.flags.s01Phase===1)target=(da>1.0&&d<14)?0.9:0;
  e.vis=lerp(e.vis||0,target,dt*(target>0?2.4:6));
  if(G.flags.s01Phase===1&&e.vis>0.6&&(e.t3||0)<=0){
    e.t3=1;SFX.dread();shake(3,1.2);
    subtitle('','شيء ما يقف في الغرفة. لا يتنفّس. ينتظر أن تنظر.');
  }
  if(e.t3>0)e.t3-=dt*0.14;
}

/* =====================================================================
   ANOMALIES — Layers 2/3/4
   ===================================================================== */
const ANOMS=[
 {id:'footsteps',w:3,f:()=>{SFX.step(false);setTimeout(()=>SFX.step(false),420);
   subtitle('','خطوات خلفك. عندما تستدير: لا أحد.');}},
 {id:'child',w:2,f:()=>{SFX.whisper();speak('one two three',1.7,0.7,0.35);
   subtitle('','صوت طفل يعدّ. من مكان فارغ.');}},
 {id:'radio',w:2,f:()=>{SFX.radio();const l=RADIO_LINES[Math.floor(Math.random()*RADIO_LINES.length)];
   subtitle(l.who,l.t);}},
 {id:'light',w:3,f:()=>{G.distort=Math.max(G.distort,.5);SFX.glitch();
   for(const L of G.scene.lights)L.flick=Math.min(.6,(L.flick||0)+.35);
   subtitle('','الإضاءة تتغيّر. ثم تعود. كما لو أن أحدًا ضغط مفتاحًا في غرفة أخرى.');}},
 {id:'whisper',w:3,f:()=>{SFX.whisper();
   const w=['you were here before you were born','do not trust what you remember','not created','he is awake','Alexei'];
   speak(w[Math.floor(Math.random()*w.length)],0.7,0.72,0.3);
   subtitle('','همسة قريبة جدًا من أذنك.');}},
 {id:'door',w:2,f:()=>{SFX.door();shake(2,.4);
   subtitle('','باب يُغلق في مكان ما من المبنى.');}},
 {id:'breath',w:2,f:()=>{noiseBurst(1.4,320,.6,.05);
   subtitle('','تنفّسك. لكن الإيقاع ليس إيقاعك.');}},
 {id:'snow',w:2,f:()=>{G.flags.snow=!G.flags.snow;PART.length=0;
   subtitle('',G.flags.snow?'بدأ الثلج يتساقط. داخل المبنى.':'توقّف الثلج. لا أثر له على الأرض.');}},
 {id:'shadow',w:2,f:()=>{SFX.dread();
   subtitle('','ظلّ عبر في طرف نظرك. الكاميرا لم تتبعه.');}},
 {id:'static',w:1,f:()=>{G.distort=1;G.grain=.22;SFX.glitch();shake(4,.35);
   setTimeout(()=>{G.grain=.05;},700);}},
 {id:'number',w:1,f:()=>{
   const s=G.scene;const signs=s.sprites.filter(sp=>sp.type==='sign');
   if(signs.length){const sg=signs[Math.floor(Math.random()*signs.length)];
     sg._orig=sg._orig||sg.text;sg.text=['16','00','01','N-07','ZERO'][Math.floor(Math.random()*5)];
     s.dirty=true;setTimeout(()=>{sg.text=sg._orig;s.dirty=true;},9000);
     subtitle('','رقم على لافتة تغيّر. ثم عاد.');}
   else subtitle('','رقم على باب تغيّر. ثم عاد.');}},
 {id:'rexlook',w:2,f:()=>{const r=(G.scene.entsLive||[]).find(e=>e.type==='rex');
   if(r&&r.joined){r.stare=Math.random()*TAU;r.stareT=5;SFX.bark();
     subtitle('ركس','ينظر إلى زاوية فارغة. لا يتحرك.');}
   else {SFX.whisper();subtitle('','شعرت أن أحدًا ينظر إليك من زاوية الغرفة.');}}},
 {id:'memory',w:2,f:()=>{if(!G.scene.indoor)return;
   G.echo=Math.min(1,G.echo+0.08);
   for(const L of G.scene.lights)L.memory=true;
   G.scene.lights.push({x:G.player.x+2,y:G.player.y-2,r:3.6,c:'rgba(255,222,170,',a:.18,flick:.1,memory:true});
   setTimeout(()=>{const L=G.scene.lights[G.scene.lights.length-1];if(L&&L.memory)G.scene.lights.pop();
     for(const l of G.scene.lights)l.memory=false;},14000);
   SFX.dread();
   subtitle('','الغرفة مضاءة. الكهرباء مقطوعة منذ أربعين سنة.');}},
 {id:'corridor',w:1,f:()=>{G.distort=.8;SFX.dread();
   subtitle('','الممر أمامك أطول مما كان. لا تلتفت.');}},
];
let anomT=24;
function updateAnoms(dt){
  anomT-=dt;
  if(anomT<=0){
    const chance=0.18+G.echo*0.85+(G.scene&&G.scene.indoor?0.12:0);
    anomT=18+Math.random()*26-G.echo*10;
    if(Math.random()<chance)triggerAnomaly();
  }
  /* echo creeps up with knowledge */
  const target=clamp(0.06+G.syms.length*0.06+G.docs.length*0.03+(G.flags.echo2?0.3:0)+(G.flags.basement?0.14:0),0,0.95);
  G.echo=lerp(G.echo,target,dt*0.05);
  G.layer=1+(G.echo>0.2?1:0)+(G.echo>0.5?1:0)+(G.echo>0.78?1:0);
  G.grain=lerp(G.grain,0.045+G.echo*0.05,dt);
}
function triggerAnomaly(id){
  const pool=id?ANOMS.filter(a=>a.id===id):ANOMS;
  let tot=0;for(const a of pool)tot+=a.w;
  let r=Math.random()*tot;
  for(const a of pool){r-=a.w;if(r<=0){a.f();G.stats.anomalies++;
    if(Math.random()<0.45)note('شيء غير طبيعي: '+a.id,'anomaly');return;}}
}

/* =====================================================================
   PSYCHOLOGICAL HORROR EVENT MANAGER (Phase 7) — central & data-driven.
   Horror is not "an enemy spawns". Nothing here lives in the Player
   Controller: the loop calls EVT.update(dt); enterScene calls EVT.onEnter(id);
   story / puzzle progression calls EVT.fire(id) (or reward.evt).
   ---------------------------------------------------------------------
   An EVENT is pure data:
     { id, kind:'fake'|'real',                 // fake = no lasting world/progression effect
       weight, cooldown, once, random,         // random-pool tuning
       scene:'id'|['ids'], enter:'id'|['ids'], region:{x,y,r},
       when(ctx)->bool,                         // gate on story/puzzle/echo/flags
       beats:[{at:0, effects:{...}, run(ctx)}], // timed sequence (appear -> vanish)
       effects:{...},                           // shorthand for a single immediate beat
       onFire(ctx) }
   EFFECTS are composed from a library (EVT.FX). To add an event you ONLY call
   defEvent({...}) — the engine never changes.
   ===================================================================== */
const EVENTS={};
function defEvent(e){EVENTS[e.id]=e;return e;}
const EVT={
  _queue:[], _rndT:10, randInterval:16,
  REAL:['spawn','despawn','door','mutate','flag'],   // world / progression mutating effects
  /* ---------------- effect library ---------------- */
  FX:{
    text(p){ if(!p)return;
      if(p.subtitle!=null)subtitle(p.who||'',p.subtitle,p.dur);
      if(p.flash)flashMsg(p.flash,p.flashDur||2400);
      if(p.note)note(p.note,p.tag||'event');
      if(p.toast)toast(p.toast,p.toastSub||''); },
    fx(p){ if(!p)return;
      if(p.distort!=null)G.distort=Math.max(G.distort||0,p.distort);
      if(p.grain!=null)G.grain=p.grain;
      if(p.whiteout!=null)G.whiteout=Math.max(G.whiteout||0,p.whiteout);
      if(p.shake)shake(p.shake[0],p.shake[1]); },
    echo(p){ const v=typeof p==='number'?p:(p.set!=null?p.set:(G.echo||0)+(p.add||0));G.echo=clamp(v,0,1); },
    sound(p){ if(!p)return;
      if(p.sfx&&SFX[p.sfx])SFX[p.sfx]();
      if(p.tone)tone(p.tone[0],p.tone[1],p.tone[2],p.tone[3]||'sine',p.tone[4]);
      if(p.noise)noiseBurst(p.noise[0],p.noise[1],p.noise[2],p.noise[3],p.noise[4]);
      if(p.speak){const sp=Array.isArray(p.speak)?p.speak:[p.speak];speak(sp[0],sp[1],sp[2],sp[3]);} },
    light(p){ const s=G.scene;if(!s||!p)return; s.atmo=s.atmo||{};
      const keys=['fog','hemi','amb','fogColor','bg'];
      if(p.save){ s._atmoPrev=s._atmoPrev||{}; keys.forEach(k=>{if(p[k]!=null&&s._atmoPrev[k]==null)s._atmoPrev[k]=s.atmo[k];}); }
      keys.forEach(k=>{if(p[k]!=null)s.atmo[k]=p[k];});
      if(p.flick!=null)for(const L of s.lights)L.flick=Math.min(.7,(L.flick||0)+p.flick);
      EVT._applyAtmo(s); },
    lightRestore(){ const s=G.scene;if(!s||!s._atmoPrev)return;
      Object.assign(s.atmo,s._atmoPrev);s._atmoPrev=null;EVT._applyAtmo(s); },
    spawn(p){ const s=G.scene;if(!s||!p)return;
      const sp={x:p.x,y:p.y,type:p.type||'statue'};sp._evt=p.tag||'evt';s.sprites.push(sp);EVT.rebuild(); },
    despawn(p){ const s=G.scene;if(!s)return;const tag=(p&&p.tag)||p;
      s.sprites=s.sprites.filter(sp=>sp._evt!==tag);EVT.rebuild(); },
    door(p){ const s=G.scene;if(!s||!p)return;
      const d=(s.doors||[]).find(x=>x.id===p.id)||(s.ints||[]).find(x=>x.id===p.id);if(!d)return;
      if(p.vanish){ setT(s.g,d.x,d.y,TL.WALL);d._gone=true;d.used=true; }
      else{ if(p.open!=null){d.open=p.open;setT(s.g,d.x,d.y,p.open?TL.F_CONC:(d.locked?TL.LOCKDOOR:TL.DOOR));}
            if(p.locked!=null){d.locked=p.locked;if(p.open==null)setT(s.g,d.x,d.y,p.locked?TL.LOCKDOOR:TL.DOOR);} }
      EVT.rebuild(); },
    mutate(p){ const s=G.scene;if(!s||!p)return;
      if(p.tiles)p.tiles.forEach(t=>setT(s.g,t[0],t[1],t[2]));
      if(p.shift){s.shifted=s.shifted||{};Object.assign(s.shifted,p.shift);}
      if(p.addSprites)p.addSprites.forEach(sp=>s.sprites.push(Object.assign({},sp)));
      EVT.rebuild(); },
    flag(p){ if(typeof p==='string')G.flags[p]=true; else if(p)Object.assign(G.flags,p); },
    objective(p){ if(p)setObjective(p[0],p[1]); },
    threat(p){ const v=typeof p==='number'?p:(p&&p.set)||0;G.threat=Math.max(G.threat||0,v);if(p&&p.noise)G.noiseEvent={r:p.noise}; },
    anomaly(p){ triggerAnomaly(typeof p==='string'?p:(p&&p.id)); },
    run(p,ctx,e){ if(typeof p==='function')p(ctx,e); else if(p&&typeof p.fn==='function')p.fn(ctx,e); },
  },
  _applyAtmo(s){ if(typeof E3==='undefined'||!E3.ok||!s)return; const AT=s.atmo||{};
    if(AT.fog!=null)E3.scene.fog.density=AT.fog;
    if(AT.hemi!=null)E3.hemi.intensity=AT.hemi;
    if(AT.amb!=null)E3.amb.intensity=AT.amb;
    if(AT.fogColor!=null)E3.scene.fog.color.set(AT.fogColor);
    if(AT.bg!=null)E3.scene.background=new THREE.Color(AT.bg); },
  rebuild(){ const s=G.scene;if(s)s.dirty=true; if(typeof E3!=='undefined')E3.builtFor=null; },
  isReal(e){ if(!e)return false; if(e.kind==='real')return true; if(e.kind==='fake')return false;
    const beats=e.beats||(e.effects?[{effects:e.effects}]:[]);
    return beats.some(b=>b.effects&&Object.keys(b.effects).some(k=>EVT.REAL.indexOf(k)>=0)); },
  /* ---------------- state ---------------- */
  st(){ if(!G.evt)G.evt={done:{},cd:{}}; if(!G.evt.done)G.evt.done={}; if(!G.evt.cd)G.evt.cd={}; return G.evt; },
  fired(id){ return !!EVT.st().done[id]; },
  eligible(e,ctx){ const st=EVT.st();
    if(e.once&&st.done[e.id])return false;
    if(e.cooldown&&st.cd[e.id]!=null&&G.time<st.cd[e.id])return false;
    if(e.scene){const list=[].concat(e.scene);if(list.indexOf(G.sceneId)<0)return false;}
    if(e.when){let w;try{w=e.when(ctx||{});}catch(x){w=false;}if(!w)return false;}
    return true; },
  /* ---------------- fire ---------------- */
  fire(id,ctx){ const e=EVENTS[id];if(!e)return false;ctx=ctx||{};
    if(!EVT.eligible(e,ctx))return false;
    const st=EVT.st();if(e.once)st.done[id]=true;if(e.cooldown)st.cd[id]=G.time+e.cooldown;
    G.stats.events=(G.stats.events||0)+1;
    const beats=e.beats||(e.effects?[{at:0,effects:e.effects}]:[]);
    for(const b of beats){const at=b.at||0;
      if(at<=0)EVT.applyBeat(e,b,ctx);else EVT._queue.push({t:G.time+at,e:e,b:b,ctx:ctx});}
    if(e.onFire){try{e.onFire(ctx);}catch(x){}}
    return true; },
  applyBeat(e,b,ctx){ const fx=(b&&b.effects)||{};
    for(const k in fx){const fn=EVT.FX[k];if(fn){try{fn(fx[k],ctx,e);}catch(x){}}}
    if(b&&b.run){try{b.run(ctx,e);}catch(x){}} },
  /* ---------------- triggers (loop / scene entry) ---------------- */
  update(dt){ if(!G.started||G.over)return;
    for(let i=EVT._queue.length-1;i>=0;i--){const q=EVT._queue[i];
      if(G.time>=q.t){EVT.applyBeat(q.e,q.b,q.ctx);EVT._queue.splice(i,1);}}
    const s=G.scene;if(!s||!G.player)return;
    for(const id in EVENTS){const e=EVENTS[id];
      if(e.region&&(!e.scene||[].concat(e.scene).indexOf(G.sceneId)>=0)){
        if(dist(G.player.x,G.player.y,e.region.x,e.region.y)<=e.region.r&&EVT.eligible(e,{trigger:'region'}))
          EVT.fire(id,{trigger:'region'});}}
    EVT._rndT-=dt;
    if(EVT._rndT<=0){EVT._rndT=EVT.randInterval*(0.7+Math.random()*0.6);
      if(Math.random()<0.10+G.echo*0.5){
        const pool=Object.keys(EVENTS).filter(id=>EVENTS[id].random&&EVT.eligible(EVENTS[id],{trigger:'random'}));
        if(pool.length){let tot=0;for(const id of pool)tot+=(EVENTS[id].weight||1);
          let r=Math.random()*tot;
          for(const id of pool){r-=(EVENTS[id].weight||1);if(r<=0){EVT.fire(id,{trigger:'random'});break;}}}}}
  },
  onEnter(sceneId){ for(const id in EVENTS){const e=EVENTS[id];
      if(e.enter&&[].concat(e.enter).indexOf(sceneId)>=0&&EVT.eligible(e,{trigger:'enter'}))
        EVT.fire(id,{trigger:'enter'});} },
  clearQueue(){ EVT._queue.length=0; },
};

/* ---------------- built-in events (data only — one per horror category) ---------------- */
/* REAL + story/puzzle-linked: fires the instant the lockbox puzzle is solved. */
defEvent({id:'lockbox_aftermath',kind:'real',once:true,
  beats:[
    {at:0,effects:{
      flag:{slice_changed:true},
      light:{save:true,hemi:0.030,amb:0.011,fog:0.115,flick:0.3},
      sound:{sfx:'dread'},
      fx:{distort:0.55,shake:[3,0.5]},
      echo:{add:0.06},
      text:{subtitle:'الجدران تنفّست. الضوء في الممر صار أثقل. شيء ما في الشقّة أعاد ترتيب نفسه.',
            flash:'الشقّة تغيّرت',note:'بعد «صندوق الشقّة»: الممر صار مختلفًا. اخرج ثم عُد.',tag:'story'}}},
    {at:5,effects:{sound:{sfx:'door'},fx:{distort:0.3},
      text:{subtitle:'باب يُغلق في مكان ما من الشقّة. لست متأكدًا أنه كان مفتوحًا.'}}},
  ]});
/* REAL + enter-triggered + story-gated: the change is there every time you come back (and after load). */
defEvent({id:'evt_slice_changed',kind:'real',enter:'slice_bld',
  when:()=>!!G.flags.slice_changed&&!(G.scene&&G.scene.shifted&&G.scene.shifted.hallChanged),
  effects:{
    door:{id:'sb_bath',vanish:true},
    mutate:{shift:{hallChanged:true},addSprites:[{x:10,y:6,type:'statue',_evt:'hall_figure'}]},
    light:{hemi:0.030,amb:0.012,fog:0.112},
    text:{subtitle:'عدت إلى الشقّة. الممر تغيّر: تمثال لم يكن هنا، وباب الحمّام صار حائطًا مصمتًا.',
          note:'الشقّة تتغيّر كلما عدت إليها. هذا لم يكن هنا من قبل.',tag:'story'}}});
/* FAKE + region-triggered: a figure appears at the end of the street, then is gone (appear -> vanish). */
defEvent({id:'evt_street_apparition',kind:'fake',once:true,scene:'slice',region:{x:33,y:17,r:3.5},
  beats:[
    {at:0,effects:{spawn:{x:37.5,y:17.5,type:'statue',tag:'street_fig'},sound:{sfx:'dread'},
      text:{subtitle:'في آخر الشارع شيء يقف. بعيد. لا يتحرّك.'}}},
    {at:4.5,effects:{despawn:{tag:'street_fig'},fx:{distort:0.3},
      text:{subtitle:'رمشتَ. اختفى. لا أثر له على الأرض.'}}},
  ]});
/* FAKE + random: a door slams somewhere far away (distant sound). */
defEvent({id:'evt_distant_door',kind:'fake',random:true,weight:3,cooldown:35,
  effects:{sound:{sfx:'door'},text:{subtitle:'باب يُغلق في مكان ما بعيدًا. ليس في هذا المبنى.'}}});
/* FAKE + random: the lights surge then settle (lighting change). */
defEvent({id:'evt_light_surge',kind:'fake',random:true,weight:2,cooldown:40,scene:['slice_bld','apartment','hospital','school'],
  beats:[
    {at:0,effects:{light:{save:true,hemi:0.16,amb:0.07,flick:0.4},sound:{sfx:'glitch'},
      text:{subtitle:'الإضاءة ترتفع فجأة — كأن أحدًا ضغط مفتاحًا في غرفة أخرى.'}}},
    {at:2.5,effects:{lightRestore:{},fx:{distort:0.2}}},
  ]});
/* FAKE + random: the ambience itself changes (wind dies, a hum rises). */
defEvent({id:'evt_amb_shift',kind:'fake',random:true,weight:2,cooldown:45,
  effects:{sound:{noise:[1.6,90,0.7,0.05,'lowpass'],sfx:'dread'},
    text:{subtitle:'صوت المدينة تغيّر. الريح توقّفت، وبقي طنين خافت تحت الأرض.'}}});
/* FAKE + random: a whisper right by your ear. */
defEvent({id:'evt_whisper',kind:'fake',random:true,weight:2,cooldown:50,
  effects:{sound:{sfx:'whisper',speak:['you were here before',0.7,0.7,0.3]},echo:{add:0.03},
    text:{subtitle:'همسة قريبة جدًا من أذنك. لا أحد هناك.'}}});

/* =====================================================================
   STORY BEATS
   ===================================================================== */
function once(k){if(G.flags[k])return false;G.flags[k]=true;return true;}
function updateBeats(dt){
  const P=G.player,s=G.scene;
  if(G.over||!G.started)return;
  if(G.sceneId==='outdoor'&&P.y>44&&P.x>26&&once('cityEntered')){
    G.flags.cityEntered=true;
    toast('بريبيات','PRIPYAT — 51.406°N 30.054°E');
    subtitle('','المدينة التي غادرها الجميع قبل أن يولد. الشوارع نظيفة من الناس، لا من الوقت.');
    setObjective('ابحث عن مأوى — المدينة أمامك','لاحظ: الأرقام، الأبواب، ما لا يتطابق.');
    note('وصلت إلى بريبيات. عدّاد جايجر لا يتوقف.','story');
    if(s.shiftFn)s.shiftFn(s,s.visits);
    s.dirty=true;
  }
  if(!G.flags.tapePlayerHint&&hasItem('tape1')&&!hasItem('tapeplayer')){
    G.flags.tapePlayerHint=true;
    toast('شريط… بلا مشغّل','تحتاج مشغّل أشرطة. ابحث في الشقق.');
    setObjective('ابحث عن مشغّل أشرطة في الشقة','التسجيل باسم إيلينا.');
  }
  if(!G.flags.tapeReady&&hasItem('tape1')&&hasItem('tapeplayer')){
    G.flags.tapeReady=true;
    toast('افتح الدفتر واستمع إلى الشريط','Tab ← الأشرطة');
    playTape('tape1');
  }
  if(!G.flags.radioHint&&G.docs.includes('doc_echo1')){
    G.flags.radioHint=true;
    toast('الراديو يعمل الآن','اضغط R');
    G.radio=true;
  }
  if(G.flags.power&&!G.flags.powerBeat){
    G.flags.powerBeat=true;
    toast('عاد التيّار','POWER RESTORED');
    flashMsg('التيّار عاد إلى المدينة',2600);
    for(const sc of Object.values(SCENES)){
      for(const L of sc.lights)if(L.broken)L.broken=false;
      sc.dirty=true;
    }
    SFX.dread();
    note('كل مصابيح الشوارع اشتغلت في اللحظة نفسها. بعد أربعين سنة.','story');
    setObjective('عد إلى المستشفى — باب القبو','البطاقة + التيّار.');
  }
  if(G.sceneId==='basement'&&once('basement')){
    G.echo=Math.max(G.echo,0.35);
    subtitle('','الهواء هنا مُصفّى. أحدٌ ما بدّل الفلاتر هذا الأسبوع.');
    setObjective('ابحث في القبو عن طريق أعمق','ملفات، مفاتيح، ومصعد.');
  }
  if(G.sceneId==='tunnels'&&once('tunnels')){
    G.echo=Math.max(G.echo,0.55);
    SFX.dread();
    subtitle('','الأنفاق أوسع من المدينة التي فوقها.');
    setObjective('اعبر الأنفاق وصولًا إلى الأرشيف','ARKHIV — المفتاح الذي فتح المصعد يفتح المزيد.');
  }
  if(G.sceneId==='blacksite'&&once('blacksite')){
    G.echo=Math.max(G.echo,0.78);
    G.flags.s01Seen=true;G.flags.s01Phase=1;
    SFX.dread();shake(5,1.6);G.distort=1;
    setTimeout(()=>{
      subtitle('','في طرف الغرفة، شيء يقف. لا يتنفّس. لا يتحرك. يعرف اسمك.');
      speak('Alexei',0.55,0.6,0.4);
    },1800);
    setTimeout(()=>{G.flags.s01Phase=0;},14000);
    setObjective('اقرأ الملفات على الطاولة','ECHO. ZERO. ثم الملف الأخير.');
  }
  /* ferris wheel memory flash */
  if(G.sceneId==='outdoor'&&dist(P.x,P.y,WHEEL.x,WHEEL.y)<11&&!G.flags.wheelSeen){
    G.flags.wheelSeen=true;
    memoryFlash();
  }
}
function memoryFlash(){
  G.distort=1;G.whiteout=0.9;SFX.dread();shake(8,1.2);
  flashMsg('— 1986 —',2200);
  subtitle('','غرفة طفل. ضوء برتقالي. يد تكتب على ورق. أنت تعرف هذه اليد.',6);
  speak('you were here before you were born',0.7,0.7,0.35);
  G.echo=Math.min(1,G.echo+0.12);
  G.flags.psyEnabled=true;
  note('رأيت غرفة من طفولتي. كنت فوق العجلة. الغرفة كانت تحت الأرض.','memory');
  setTimeout(()=>{G.whiteout=0;},900);
}

/* =====================================================================
   DIALOGUE
   ===================================================================== */
const DLG={open:false,q:[],i:0,typing:false,txt:'',full:'',cb:null};
function dialogue(lines,cb){
  DLG.open=true;DLG.q=lines;DLG.i=0;DLG.cb=cb||null;
  $('dlg').classList.remove('hide');
  showLine();
}
function showLine(){
  const L=DLG.q[DLG.i];
  if(!L){closeDlg();return;}
  $('dlgWho').textContent=L.who||'';
  DLG.full=L.t;DLG.txt='';DLG.typing=true;
  $('dlgOpts').innerHTML='';
  $('dlgCont').style.opacity=L.opts?0:1;
  if(L.sfx==='whisper')SFX.whisper();
  if(L.speak)speak(L.speak,L.pitch||1,L.rate||0.9,0.6);
  typeTick();
}
let typeTimer=null;
function typeTick(){
  clearInterval(typeTimer);
  typeTimer=setInterval(()=>{
    if(!DLG.open){clearInterval(typeTimer);return;}
    DLG.txt=DLG.full.slice(0,DLG.txt.length+1);
    $('dlgTxt').textContent=DLG.txt;
    if(DLG.txt.length%3===0)SFX.write();
    if(DLG.txt.length>=DLG.full.length){
      clearInterval(typeTimer);DLG.typing=false;
      const L=DLG.q[DLG.i];
      if(L&&L.opts){
        const box=$('dlgOpts');
        L.opts.forEach((o,i)=>{
          const b=el('button','opt',(i+1)+'. '+o.t);
          b.onclick=()=>{if(o.f)o.f();nextLine();};
          box.appendChild(b);
        });
      }
    }
  },22);
}
function nextLine(){
  const L=DLG.q[DLG.i];
  if(DLG.typing){DLG.txt=DLG.full;$('dlgTxt').textContent=DLG.full;DLG.typing=false;clearInterval(typeTimer);
    if(L&&L.opts){const box=$('dlgOpts');box.innerHTML='';
      L.opts.forEach((o,i)=>{const b=el('button','opt',(i+1)+'. '+o.t);b.onclick=()=>{if(o.f)o.f();nextLine();};box.appendChild(b);});}
    return;}
  if(L&&L.opts)return;
  DLG.i++;showLine();
}
function closeDlg(){
  DLG.open=false;$('dlg').classList.add('hide');
  clearInterval(typeTimer);
  if(DLG.cb){const c=DLG.cb;DLG.cb=null;c();}
  updateHint();
}
function startNikaSchool(e){
  if(DLG.open)return;
  G.flags.nikaMet=true;
  e.vis=1;
  SFX.whisper();
  dialogue([
   {who:'???',t:'لا تقترب أكثر.',sfx:'whisper'},
   {who:'ALEXEI',t:'…طفلة؟ ماذا تفعل طفلة في مدرسة مهجورة منذ أربعين سنة؟'},
   {who:'NIKA',t:'أنا لست في مدرسة مهجورة. أنت في مدرسة مهجورة.',speak:'I am not in an abandoned school. You are.'},
   {who:'NIKA',t:'الكتلة C ليست مقفلة. هي فقط… ليست هنا بعد.',speak:'Block C is not locked. It is just not here yet.'},
   {who:'NIKA',t:'عُد إلى المكان الذي دخلت منه. ثم ادخل مرة أخرى. ستجدها.',speak:'Go back to where you came in. Then come in again. You will find it.'},
   {who:'ALEXEI',t:'من أنتِ؟'},
   {who:'NIKA',t:'إيلينا قالت إنك ستسأل هذا السؤال.',speak:'Elena said you would ask that.'},
   {who:'ALEXEI',t:'كيف تعرفين اسم أمي؟',opts:[
     {t:'«أنتِ تعرفينها؟»',f:()=>{G.trust+=1;note('نِيكا تعرف إيلينا. لم تُجب.','nika');}},
     {t:'«أنتِ لستِ حقيقية.»',f:()=>{G.trust-=1;note('قلت لها إنها ليست حقيقية. ضحكت بطريقة ليست لضحكة طفل.','nika');}},
     {t:'(اصمت)',f:()=>{G.trust+=2;note('صمتُّ. أحيانًا الصمت هو السؤال الصحيح.','nika');}}
   ]},
   {who:'NIKA',t:'You were here before you were born.',speak:'You were here before you were born',pitch:1.5,rate:0.7},
   {who:'',t:'عندما ترفع عينيك، لا تكون هناك.'},
  ],()=>{
    e.gone=true;
    G.flags.blockCOpen=true;
    G.echo=Math.max(G.echo,0.22);
    G.flags.psyEnabled=true;
    setObjective('عُد إلى مدخل المدرسة… ثم ادخل مرة أخرى','الكتلة C «ليست هنا بعد».');
    note('الكتلة C. الباب الذي في الممر الغربي لم يكن بابًا. الآن قد يكون.','story');
    triggerAnomaly('light');
    saveGame(true);
  });
}
function talkNika(e){
  if(G.sceneId==='school'&&!G.flags.nikaMet){startNikaSchool(e);return;}
  if(G.sceneId==='tunnels'){talkNikaTunnels(e);return;}
  dialogue([{who:'NIKA',t:'لا شيء لأقوله الآن. امشِ. سأكون في المكان الذي لا تنظر إليه.'}]);
}
function talkNikaTunnels(e){
  if(DLG.open)return;
  dialogue([
   {who:'NIKA',t:'لقد نزلت.',speak:'You came down.'},
   {who:'ALEXEI',t:'كيف سبقتِني إلى هنا؟'},
   {who:'NIKA',t:'لم أسبقك. أنا هنا منذ قبل أن تُبنى الأنفاق.'},
   {who:'NIKA',t:'الغرفة التي في النهاية اسمها الأرشيف. فيها ملف واحد لم يُمزَّق.',speak:'The room at the end is called the archive.'},
   {who:'ALEXEI',t:'لماذا تساعدينني؟',opts:[
     {t:'«لأنك تعرفينني.»',f:()=>{G.trust++;note('قلت لها إنها تعرفني. لم تُنكر.','nika');}},
     {t:'«لأنك خائفة أيضًا.»',f:()=>{G.trust+=2;note('لأول مرة لم تنظر بعيدًا.','nika');}},
    ]},
   {who:'NIKA',t:'أنا لست خائفة. أنا مُحتفَظة. Cognitive retention: 97%. هذا ما كتبوه عني.',speak:'I am not afraid. I am retained.'},
   {who:'NIKA',t:'وهناك واحد آخر. Subject 01. لا تنظر إليه طويلًا. هو يتعلّم من الطريقة التي تنظر بها.'},
  ],()=>{e.gone=true;});
}

/* =====================================================================
   DOC / TAPE / CODE / NOTEBOOK UI
   ===================================================================== */
const DOC={open:false};
function openDoc(key){
  const d=DOCS[key];if(!d)return;
  DOC.open=true;
  $('docKind').textContent=d.kind||'DOCUMENT';
  $('docTitle').textContent=d.title||'';
  $('docBody').textContent=d.body;
  $('doc').classList.remove('hide');
  $('docNote').textContent='أُضيف إلى الدفتر (Tab).';
  if(!G.docs.includes('doc_'+key)){G.docs.push('doc_'+key);G.items['doc_'+key]=true;}
  SFX.write();
  if(key==='final_file')G.flags.readFinal=true;
  if(key==='echo2')G.flags.echo2=true;
}
function closeDoc(){$('doc').classList.add('hide');DOC.open=false;updateHint();}

const TAPE={open:false,t:0};
function playTape(id){
  const t=TAPES[id];if(!t)return;
  if(id!=='tape1'&&!hasItem('tapeplayer')&&id!=='tape3'){
    toast('تحتاج مشغّل أشرطة','TAPE PLAYER');SFX.deny();return;
  }
  if(!hasItem(id)){G.items[id]=true;G.tapes.push(id);}
  SFX.radio();
  subtitle(t.who,t.title,3);
  setTimeout(()=>{
    subtitle(t.who,t.body.split('\n').filter(l=>l.trim())[0],8);
    speak(t.body.replace(/[\[\]\.\-]/g,' ').replace(/\s+/g,' ').slice(0,420),t.pitch,t.rate,0.72);
  },1600);
  note('استمعت إلى: '+t.title,'tape');
  if(id==='tape1'){
    G.flags.playedTape1=true;
    G.echo=Math.max(G.echo,0.18);
    setObjective('ابحث عن مشغّل أشرطة — أو عن بقية الأشرطة','إيلينا تركت أكثر من تسجيل.');
    triggerAnomaly('radio');
  }
  if(id==='tape2'){
    setObjective('انزل إلى قبو المستشفى','أربعة رموز بترتيب مشيها: غرفته ← المدرسة ← الروضة ← تحت.');
    G.flags.knowOrder=true;
  }
  if(id==='tape3'){
    G.echo=Math.min(1,G.echo+0.2);
    triggerAnomaly('whisper');
    note('التسجيل الثالث يقول إنها لم تكن حاملًا أبدًا. التسجيل الأول يقول العكس. كلاهما بصوتها.','story');
  }
}
function playRadio(){
  if(!G.radio){toast('الراديو صامت','لا إشارة بعد.');SFX.deny();return;}
  SFX.radio();
  const l=RADIO_LINES[Math.floor(Math.random()*RADIO_LINES.length)];
  subtitle(l.who,l.t,6);
  if(Math.random()<0.5)speak(l.t.replace(/[\[\]]/g,''),0.8,0.9,0.5);
  if(Math.random()<0.25){G.echo=Math.min(1,G.echo+0.04);triggerAnomaly('static');}
}

const CODE={open:false,ent:null,slots:[],pool:[]};
function openCode(ent){
  CODE.open=true;CODE.ent=ent;CODE.slots=[];
  $('codeTitle').textContent=ent.id==='sub_panel'?'SUBSTATION PANEL':'ARCHIVE TERMINAL';
  $('codeSub').textContent=ent.id==='sub_panel'?'لوحة التحكم — ثلاثة رموز':'الباب المدرّع — أربعة رموز';
  $('codeHint').textContent=ent.hint||'';
  $('code').classList.remove('hide');
  renderCode();
  SFX.beep();
}
function renderCode(){
  const need=CODE.ent.id==='sub_panel'?3:4;
  const slots=$('codeSlots');slots.innerHTML='';
  for(let i=0;i<need;i++){
    const d=el('div','slot'+(CODE.slots[i]?' filled':''));
    const s=SYMS.find(x=>x.id===CODE.slots[i]);
    d.innerHTML=s?s.svg:'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" stroke="#33414a" fill="none"/></svg>';
    slots.appendChild(d);
  }
  const p=$('codePick');p.innerHTML='';
  SYMS.forEach(s=>{
    const b=el('div','pick'+(CODE.slots.includes(s.id)?' used':''));
    b.innerHTML=s.svg;b.title=s.name;
    b.onclick=()=>{
      if(CODE.slots.includes(s.id))return;
      if(CODE.slots.length>=need)return;
      CODE.slots.push(s.id);SFX.beep();renderCode();
      if(CODE.slots.length>=need)setTimeout(checkCode,260);
    };
    p.appendChild(b);
  });
}
function checkCode(){
  const need=CODE.ent.id==='sub_panel'?['atom','wave','eye']:SYM_ORDER;
  const ok=CODE.slots.length===need.length&&CODE.slots.every((v,i)=>v===need[i]);
  if(ok){
    SFX.door();tone(440,.2,.06,'triangle');setTimeout(()=>tone(660,.3,.06,'triangle'),160);
    closeCode();
    if(CODE.ent.id==='sub_panel'){
      G.flags.power=true;CODE.ent.used=true;
      toast('عاد التيّار','POWER RESTORED');
      flashMsg('التيّار عاد',2400);
      note('لوحة المحطة قبلت الرموز. المدينة كلها اشتعلت لثانية.','story');
    }else{
      CODE.ent.used=true;CODE.ent.locked=false;
      toast('فُتح الباب المدرّع','BLACK SITE-4');
      G.echo=Math.max(G.echo,0.7);
    }
  }else{
    SFX.deny();shake(3,.3);
    $('codeHint').textContent='مرفوض. الترتيب خطأ. (فكّر: أين وجدت كل رمز؟)';
    CODE.slots=[];renderCode();
    G.noiseEvent={r:9};
    note('أدخلت رموزًا خاطئة. شيء ما في المبنى سمع الصوت.','anomaly');
  }
}
function closeCode(){$('code').classList.add('hide');CODE.open=false;updateHint();}

const NB={open:false,tab:'obj'};
function openNb(){
  NB.open=true;$('nb').classList.remove('hide');renderNb();
}
function closeNb(){$('nb').classList.add('hide');NB.open=false;updateHint();}
/* ===== Inventory UI (Phase 5) ===== */
const INVUI={open:false,sel:null};
function openInv(){
  if(!G.started||G.over)return;
  if(NB.open)closeNb();
  if(!INVUI.sel||!INV.has(INVUI.sel)){const l=INV.list();INVUI.sel=l.length?l[0].id:null;}
  INVUI.open=true;$('inv').classList.remove('hide');renderInv();
}
function closeInv(){$('inv').classList.add('hide');INVUI.open=false;updateHint();}
function toggleInv(){INVUI.open?closeInv():openInv();}
function renderInv(){
  const grid=$('invGrid'),det=$('invDetail');if(!grid||!det)return;
  grid.innerHTML='';det.innerHTML='';
  const items=INV.list();
  if(INVUI.sel&&!INV.has(INVUI.sel))INVUI.sel=items.length?items[0].id:null;
  if(!items.length){grid.innerHTML='<div class="invEmpty">الحقيبة فارغة.</div>';}
  items.forEach(it=>{
    const s=el('div','slot'+(INVUI.sel===it.id?' sel':''));
    s.innerHTML='<span class="ic"></span>'+(it.qty>1?'<span class="q"></span>':'');
    s.querySelector('.ic').textContent=it.def.icon||'•';
    if(it.qty>1)s.querySelector('.q').textContent='×'+it.qty;
    s.title=it.def.name;
    s.onclick=()=>{INVUI.sel=it.id;renderInv();};
    grid.appendChild(s);
  });
  const id=INVUI.sel;
  if(!id){det.innerHTML='<div class="invEmpty">اختر عنصرًا من الحقيبة.</div>';return;}
  const d=INV.meta(id),qty=INV.count(id);
  det.innerHTML='<div class="nm"></div><div class="ty"></div><div class="ds"></div><div class="acts"></div>';
  det.querySelector('.nm').textContent=d.name+(qty>1?'  ×'+qty:'');
  det.querySelector('.ty').textContent=(ITEM_TYPES[d.type]||d.type||'متنوع')+(d.stack?'  •  قابل للتكديس':'  •  غير قابل للتكديس');
  det.querySelector('.ds').textContent=d.desc||'لا وصف.';
  const acts=det.querySelector('.acts');
  if(INV.canUse(id)){const b=el('button','btn small','استخدام');
    b.onclick=()=>{const r=INV.use(id);if(r.ok===false){SFX.deny();subtitle('',r.msg||'');}renderInv();};acts.appendChild(b);}
  const rec=INV.recipesFor(id)[0];
  if(rec){const other=rec.in.find(x=>x!==id)||rec.in[0];
    const b=el('button','btn small','دمج ← '+INV.meta(rec.out).name);
    b.onclick=()=>{const r=INV.combine(id,other);if(r.ok===false){SFX.deny();subtitle('',r.msg||'');}
      if(r.ok)INVUI.sel=r.out;renderInv();};acts.appendChild(b);}
  const rm=el('button','btn small','إزالة');
  rm.onclick=()=>{INV.remove(id,1);INVUI.sel=null;renderInv();};acts.appendChild(rm);
}
function renderNb(){
  document.querySelectorAll('#nbTabs .tab').forEach(t=>t.classList.toggle('on',t.dataset.t===NB.tab));
  const b=$('nbBody');b.innerHTML='';
  if(NB.tab==='obj'){
    const pr=(typeof STORY!=='undefined')?STORY.progress():null;
    if(pr&&pr.chapter){
      b.appendChild(entry(pr.title||'الفصل',pr.subtitle||''));
      pr.objectives.forEach(o=>{ if(!o.revealed)return;
        b.appendChild(entry((o.done?'✓ ':o.active?'▶ ':'· ')+o.text, o.done?'مكتملة':(o.hint||''))); });
      if(pr.complete)b.appendChild(entry('— انتهى الفصل —','يتبع…'));
    }
    b.appendChild(entry('الهدف الحالي',G.objective||'—'));
    if(G.objSub)b.appendChild(entry('',G.objSub));
    b.appendChild(entry('المكان',G.scene?G.scene.name:'—') );
    b.appendChild(entry('الحالة','الطبقة: '+['','REALITY','MEMORY','PSYCHOLOGICAL','ZERO'][G.layer]+
      '   •   الإصابات: '+G.player.hp+'/3   •   البطارية: '+Math.round(G.player.bat)+'%'));
    const inv=INV.list();
    b.appendChild(entry('الحقيبة',inv.length?inv.map(it=>it.def.name+(it.qty>1?' ×'+it.qty:'')).join('  •  '):'فارغة تقريبًا.'));
  }
  if(NB.tab==='files'){
    if(!G.docs.length)b.appendChild(entry('لا ملفات','لم تجمع أي مستند بعد.'));
    G.docs.forEach(dk=>{
      const key=dk.replace('doc_','');const d=DOCS[key];if(!d)return;
      const e=entry(d.title,d.kind+' — انقر للفتح');
      e.style.cursor='pointer';e.onclick=()=>{openDoc(key);closeNb();};
      b.appendChild(e);
    });
  }
  if(NB.tab==='tapes'){
    if(!G.tapes.length)b.appendChild(entry('لا أشرطة',hasItem('tapeplayer')?'تحتاج أشرطة.':'تحتاج مشغّل أشرطة أولًا.'));
    G.tapes.forEach(tk=>{
      const t=TAPES[tk];if(!t)return;
      const e=entry(t.title,t.body.split('\n')[0]);
      e.style.cursor='pointer';e.onclick=()=>{closeNb();playTape(tk);};
      b.appendChild(e);
    });
  }
  if(NB.tab==='sym'){
    const row=el('div','symrow');
    SYMS.forEach(s=>{
      const has=G.syms.includes(s.id);
      const d=el('div','sym'+(has?'':' empty'),s.svg+'<div class="n">'+(has?s.name:'؟؟؟')+'</div>');
      row.appendChild(d);
    });
    b.appendChild(row);
    b.appendChild(entry('الترتيب',G.flags.knowOrder?
      '«غرفته ← المدرسة ← الروضة ← ثم تحت» — إيلينا':'لم تجد بعد ما يشرح الترتيب. (ورقة في مكان ما في شقة)'));
  }
  if(NB.tab==='map'){
    const c=el('canvas');c.width=760;c.height=380;c.style.width='100%';c.style.border='1px solid #1e262c';
    b.appendChild(c);drawMap(c);
    b.appendChild(entry('',G.mapUnreliable?'الخريطة لا تتطابق مع المكان. أنت متأكد أنك رسمتها بشكل صحيح.':'الخريطة تُرسم تلقائيًا للأماكن التي زرتها.'));
  }
  if(NB.tab==='log'){
    if(!G.notes.length)b.appendChild(entry('فارغ',''));
    G.notes.slice(0,40).forEach(n=>b.appendChild(entry(n.tag==='anomaly'?'⚠ '+n.t:n.t,n.tag)));
  }
}
function entry(h,bd){
  const e=el('div','entry');
  e.innerHTML='<div class="h"></div><div class="b"></div>';
  e.querySelector('.h').textContent=h;
  e.querySelector('.b').textContent=bd||'';
  return e;
}
function drawMap(c){
  const x=c.getContext('2d');const s=G.scene;if(!s)return;
  x.fillStyle='#080b0e';x.fillRect(0,0,c.width,c.height);
  const sc=Math.min(c.width/(s.w+4),c.height/(s.h+4));
  const ox=(c.width-s.w*sc)/2,oy=(c.height-s.h*sc)/2;
  for(let ty=0;ty<s.h;ty++)for(let tx=0;tx<s.w;tx++){
    const t=s.g.d[ty*s.w+tx];
    let col=null;
    if(t===TL.WALL||t===TL.ROOF||t===TL.CELL)col='#2c3439';
    else if(t===TL.FENCE)col='#39423f';
    else if(t===TL.DOOR)col='#7a6a3a';
    else if(t===TL.LOCKDOOR)col='#7a3a30';
    else if(t===TL.TREE||t===TL.DEAD)col='#1e2a1c';
    else if(t===TL.WATER)col='#16282c';
    else if(t===TL.ROAD)col='#25282b';
    else col='#191d20';
    x.fillStyle=col;
    let dx=0,dy=0;
    if(G.mapUnreliable&&hash2(tx,ty,9)>0.965){dx=(hash2(tx,ty,3)-0.5)*sc*3;dy=(hash2(tx,ty,4)-0.5)*sc*3;}
    x.fillRect(ox+tx*sc+dx,oy+ty*sc+dy,sc+0.5,sc+0.5);
  }
  /* doors / objectives */
  for(const d of s.doors){
    x.fillStyle=d.locked?'#a4453a':'#c9a227';
    x.fillRect(ox+d.x*sc-1,oy+d.y*sc-1,sc+2,sc+2);
  }
  for(const it of s.ints){
    if(it.used)continue;
    if(['doc','tape','item','terminal','final','search'].includes(it.type)){
      x.fillStyle='rgba(150,200,210,.5)';x.fillRect(ox+it.x*sc,oy+it.y*sc,Math.max(1.5,sc*0.6),Math.max(1.5,sc*0.6));
    }
  }
  /* player */
  const px=ox+G.player.x*sc,py=oy+G.player.y*sc;
  x.save();x.translate(px,py);x.rotate(IN.aim);
  x.fillStyle='#e8eef2';x.beginPath();x.moveTo(6,0);x.lineTo(-4,4);x.lineTo(-4,-4);x.closePath();x.fill();
  x.restore();
  /* entities you are aware of */
  for(const e of s.entsLive||[]){
    if(e.dead)continue;
    if(e.type==='rex'){x.fillStyle='#a4813a';x.fillRect(px-2+ (e.x-G.player.x)*sc,py-2+(e.y-G.player.y)*sc,4,4);}
    if(e.type==='nika'&&e.vis>0.3){x.fillStyle='#8fb0b8';x.fillRect(ox+e.x*sc-2,oy+e.y*sc-2,4,4);}
  }
  x.fillStyle='#68747b';x.font='11px Tahoma';x.textAlign='left';
  x.fillText(s.name,10,c.height-12);
}
/* =====================================================================
   POST FX
   ===================================================================== */
function renderPost(dt){
  const P=G.player;
  fctx.setTransform(1,0,0,1,0,0);
  fctx.clearRect(0,0,fx.width,fx.height);
  fctx.setTransform(DPR,0,0,DPR,0,0);
  /* damage / threat vignette */
  const dmg=clamp((P.dmgFlash||0)*0.75+(3-P.hp)*0.11+(G.threat||0)*0.30,0,0.85);
  if(dmg>0.02){
    const g=fctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*0.18,VW/2,VH/2,Math.max(VW,VH)*0.72);
    g.addColorStop(0,'rgba(120,10,10,0)');
    g.addColorStop(1,'rgba(120,10,10,'+dmg.toFixed(3)+')');
    fctx.fillStyle=g;fctx.fillRect(0,0,VW,VH);
  }
  /* radiation */
  if(P.rad>12){
    const a=clamp((P.rad-12)/150,0,0.3);
    fctx.fillStyle='rgba(120,160,60,'+a.toFixed(3)+')';
    fctx.globalCompositeOperation='overlay';fctx.fillRect(0,0,VW,VH);
    fctx.globalCompositeOperation='source-over';
  }
  /* memory layer tint */
  if(G.echo>0.3){
    fctx.fillStyle='rgba(190,150,80,'+((G.echo-0.3)*0.10).toFixed(3)+')';
    fctx.globalCompositeOperation='overlay';fctx.fillRect(0,0,VW,VH);
    fctx.globalCompositeOperation='source-over';
  }
  /* distortion: tear + chromatic */
  if(G.distort>0.01){
    const n=Math.floor(G.distort*7);
    for(let i=0;i<n;i++){
      const y=Math.random()*VH,h=4+Math.random()*26,dx=(Math.random()-0.5)*70*G.distort;
      try{fctx.drawImage(cv,0,y*DPR,fx.width,h*DPR,dx,y,VW,h);}catch(e){}
    }
    fctx.globalCompositeOperation='screen';fctx.globalAlpha=0.13*G.distort;
    try{
      fctx.drawImage(cv,-4*G.distort,0);
      fctx.drawImage(cv,4*G.distort,0);
    }catch(e){}
    fctx.globalAlpha=1;fctx.globalCompositeOperation='source-over';
    G.distort=Math.max(0,G.distort-dt*0.9);
  }
  /* grain */
  if(typeof UI==='undefined'||UI.SET.grain){
  const gc=grainCanvas();
  fctx.globalAlpha=G.grain;
  fctx.globalCompositeOperation='overlay';
  const pat=fctx.createPattern(gc,'repeat');
  fctx.save();fctx.translate(-(Math.random()*64|0),-(Math.random()*64|0));
  fctx.fillStyle=pat;fctx.fillRect(0,0,VW+64,VH+64);fctx.restore();
  fctx.globalAlpha=1;fctx.globalCompositeOperation='source-over';
  }
  /* scanlines */
  fctx.globalAlpha=0.05+G.echo*0.03;
  fctx.fillStyle='#000';
  for(let y=0;y<VH;y+=3)fctx.fillRect(0,y,VW,1);
  fctx.globalAlpha=1;
  /* whiteout */
  if(G.whiteout>0.01){
    fctx.fillStyle='rgba(230,238,240,'+clamp(G.whiteout,0,1).toFixed(3)+')';
    fctx.fillRect(0,0,VW,VH);
    G.whiteout=Math.max(0,G.whiteout-dt*1.1);
  }
  /* hidden overlay */
  if(P.hidden){
    fctx.fillStyle='rgba(0,0,0,.55)';fctx.fillRect(0,0,VW,VH);
    fctx.strokeStyle='rgba(150,170,175,.25)';fctx.lineWidth=2;
    for(let i=0;i<7;i++){const y=VH*(0.12+i*0.12);fctx.beginPath();fctx.moveTo(0,y);fctx.lineTo(VW,y);fctx.stroke();}
    fctx.fillStyle='rgba(200,215,220,.5)';fctx.font='12px Tahoma';fctx.textAlign='center';
    fctx.fillText('مختبئ — اضغط H للخروج',VW/2,VH-40);
  }
}
let _gc=null,_gt=0;
function grainCanvas(){
  if(!_gc){_gc=document.createElement('canvas');_gc.width=_gc.height=64;}
  if(G.time-_gt<0.06)return _gc;
  _gt=G.time;
  const g=_gc.getContext('2d'),d=g.createImageData(64,64);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}
  g.putImageData(d,0,0);
  return _gc;
}

/* =====================================================================
   DEATH / ENDING
   ===================================================================== */
function die(text,kind){
  if(G.over)return;
  G.over=true;G.stats.deaths++;
  SFX.sting();shake(20,1.2);
  G.whiteout=0.6;
  const f=$('fade');f.style.opacity=1;
  setTimeout(()=>{
    $('endKind').textContent=kind||'TERMINATED';
    $('endTitle').textContent='لم ينجُ أحد';
    $('endBody').innerHTML='<p>'+text+'</p><p class="dim" style="margin-top:12px">'+
      'الإحصائيات: وفيات '+G.stats.deaths+' • مستندات '+G.docs.length+' • رموز '+G.syms.length+
      ' • حالات غير طبيعية '+G.stats.anomalies+'</p>';
    const b=$('endBtns');b.innerHTML='';
    const r=el('button','btn','استيقظ عند آخر مكان آمن');
    r.onclick=()=>{$('end').classList.add('hide');respawn();};
    b.appendChild(r);
    const m=el('button','btn warn','القائمة الرئيسية');
    m.onclick=()=>location.reload();
    b.appendChild(m);
    $('end').classList.remove('hide');
    f.style.opacity=0;
  },1400);
}
function captured(){
  if(G.over)return;
  G.over=true;G.stats.deaths++;
  SFX.sting();G.whiteout=1;
  const f=$('fade');f.style.opacity=1;
  setTimeout(()=>{
    $('endKind').textContent='CAPTURED';
    $('endTitle').textContent='أمسكوا بك';
    $('endBody').innerHTML='<p>جنود. ليسوا من وحدتك. لا يتكلمون الروسية التي تعرفها.</p>'+
      '<p class="dim" style="margin-top:12px">ألقوك عند حافة الغابة. تركوك حيًا — وهذا قرار، ليس رحمة.</p>';
    const b=$('endBtns');b.innerHTML='';
    const r=el('button','btn','انهض — عُد إلى موقع التحطّم');
    r.onclick=()=>{$('end').classList.add('hide');respawn(true);};
    b.appendChild(r);
    $('end').classList.remove('hide');
    f.style.opacity=0;
  },1500);
}
function respawn(forest){
  G.over=false;
  const P=G.player;
  P.hp=3;P.rad=Math.min(P.rad,25);P.sta=CFG.staMax;P.injured=6;P.hidden=false;P.dmgFlash=0;
  G.threat=0;G.distort=0;G.whiteout=0;
  let safe=G.lastSafe||(G.scene&&G.scene.safe)||{scene:'outdoor',x:22.5,y:23.5};
  if(forest)safe={scene:'outdoor',x:22.5,y:23.5};
  enterScene(safe.scene,{x:safe.x,y:safe.y},{silent:true});
  for(const e of G.scene.entsLive)if(e.type==='creature'||e.type==='soldier'){e.state='patrol';e.alert=0;}
  toast('نجوت… هذه المرة','المدينة أعادتك إلى المكان الذي شعرت فيه بالأمان.');
  updateHint();
}
function showEnding(){
  G.over=true;
  SFX.dread();
  const f=$('fade');f.style.opacity=1;
  setTimeout(()=>{
    $('endKind').textContent='PART 1 — THE FALL';
    $('endTitle').textContent='STATUS: ORIGINAL';
    $('endBody').innerHTML=
     '<pre class="mono" style="text-align:left;direction:ltr;color:#c3cdd3;font-size:13.5px;line-height:2">'+
     'SUBJECT:      VOLKOV, ALEXEI\nDESIGNATION:  00\n\nSTATUS:       NOT CREATED\nSTATUS:       NOT MODIFIED\nSTATUS:       ORIGINAL\n\nPROJECT ZERO WAS CREATED TO REPRODUCE HIM.'+
     '</pre>'+
     '<p style="margin-top:16px">الغرفة باردة. الملف دافئ.</p>'+
     '<p>خلفك، في الظلام، شيء ما يقف بصبر من يعرفك منذ وقت طويل.</p>'+
     '<h3>آخر قرار</h3>';
    const b=$('endBtns');b.innerHTML='';
    const opts=[
      {t:'خذ الملف واخرج',f:()=>epilogue('escape')},
      {t:'اترك الملف. اذهب أعمق.',f:()=>epilogue('deep')},
      {t:'اسأل الغرفة: «من أنا؟»',f:()=>epilogue('ask')},
    ];
    opts.forEach(o=>{const bt=el('button','btn',o.t);bt.onclick=o.f;b.appendChild(bt);});
    $('end').classList.remove('hide');
    f.style.opacity=0;
  },2200);
}
function epilogue(kind){
  SFX.dread();
  const trust=G.trust,txt={
   escape:'خرجت من الأرشيف وملفّك تحت سترتك.\n\nخلفك، لم يتبعك أحد.\nهذا أسوأ ما في الأمر.\n\n'+
     (trust>=2?'صوت نِيكا في الراديو، مرة واحدة: «ستعود. كلهم يعودون.»':''),
   deep:'مشيت أعمق في الأنفاق، حيث لا تصل الخرائط.\n\nكل باب فتحته كان مفتوحًا من الداخل.\n\n'+
     'في آخر ممر، وجدت غرفة طفل.\nمضاءة. الكهرباء مقطوعة منذ أربعين سنة.',
   ask:'«من أنا؟»\n\nلم يجب أحد.\nلكن الملف على الطاولة تغيّر بينما كنت تنظر إليه.\n\n'+
     'STATUS: ORIGINAL\nSTATUS: ORIGINAL\nSTATUS: ORIGINAL\nSTATUS: —'
  }[kind];
  $('endKind').textContent='ENDING — '+(kind==='escape'?'A / ESCAPE':kind==='deep'?'D / ZERO':'E / ORIGINAL');
  $('endTitle').textContent='نهاية الجزء الأول';
  $('endBody').innerHTML='<pre style="white-space:pre-wrap;font-size:15px;line-height:2;color:#c3cdd3;font-family:inherit">'+
    (kind==='escape'?txt[0]+txt[1]:txt)+'</pre>'+
    '<hr><p class="dim">قرار نِيكا: ثقة '+trust+' • حالات غير طبيعية لاحظتها: '+G.stats.anomalies+
    ' • مستندات: '+G.docs.length+'/17 • وفيات: '+G.stats.deaths+'</p>'+
    '<p class="tag mono" style="margin-top:14px;letter-spacing:.2em">"THE CITY REMEMBERS."</p>'+
    '<p class="dim" style="margin-top:6px">What if the thing they were trying to create... already existed?</p>'+
    '<p style="margin-top:14px">PART 2 — CHERNOBYL: PROJECT ZERO</p>';
  const b=$('endBtns');b.innerHTML='';
  const bt=el('button','btn','القائمة الرئيسية');bt.onclick=()=>location.reload();b.appendChild(bt);
  const bt2=el('button','btn small','العب مرة أخرى من التحطّم');bt2.onclick=()=>{localStorage.removeItem(SAVEKEY);location.reload();};b.appendChild(bt2);
  speak('The city remembers',0.6,0.75,0.5);
}

/* =====================================================================
   SAVE / LOAD
   ===================================================================== */
const SAVEKEY='chernobyl_echoes_zero_v1';
/* =====================================================================
   STORY SYSTEM (Phase 10) — a modular, data-driven Story State Machine.
   The narrative is NOT one blob; it is composed of registries:
     CHAPTERS   : ordered quest chains  {id,title,subtitle,intro,objectives[],events[],outro,onComplete}
     STORYEVTS  : narrative beats fired by condition/trigger {id,once,scene,when,effects,run}
     Objectives : quests with when(ctx) completion + onStart/onComplete/toast/note/world
     Dialogues  : reuse the existing dialogue() engine (data = arrays of lines)
     Flags      : reuse G.flags (saved) + G.story.vars for chapter-local state
     World      : STORY.world rules mutate scenes on enter as progress changes
   State lives in G.story (saved/loaded). The engine only READS the player/scene.
   Add a chapter = defChapter({...});  add a beat = defStoryEvent({...});
   add a world rule = STORY.defWorld({...}).  Nothing is hard-wired.
   ===================================================================== */
const CHAPTERS={};
const STORYEVTS={};
function defChapter(c){CHAPTERS[c.id]=c;return c;}
function defStoryEvent(e){STORYEVTS[e.id]=e;return e;}
function defaultStory(){return {chapter:null,started:{},obj:null,doneObj:{},doneEvt:{},vars:{},complete:{},log:[]};}
const STORY={
  world:[],
  defWorld(w){STORY.world.push(w);return w;},
  ctx(){return {P:G.player,scene:G.scene,sceneId:G.sceneId,flags:G.flags,visits:G.visits,items:G.items,
    story:G.story,echo:G.echo,layer:G.layer,time:G.time,
    has:hasItem,visited:id=>(G.visits[id]||0)>0,done:id=>!!(G.story&&G.story.doneObj[id]),
    var:k=>G.story?G.story.vars[k]:undefined};},
  chapter(){return (G.story&&CHAPTERS[G.story.chapter])||null;},
  log(k,id){if(!G.story)return;G.story.log.push({k:k,id:id,t:Math.floor(G.time)});if(G.story.log.length>80)G.story.log.shift();},
  flag(k,v){G.flags[k]=(v===undefined?true:v);},
  has(k){return !!G.flags[k];},
  setVar(k,v){if(G.story)G.story.vars[k]=v;},
  getVar(k){return G.story?G.story.vars[k]:undefined;},
  /* ---- lifecycle ---- */
  start(chId){
    const ch=CHAPTERS[chId];if(!ch)return false;
    if(!G.story)G.story=defaultStory();
    if(G.story.started[chId])return false;
    G.story.started[chId]=true;G.story.chapter=chId;G.story.complete[chId]=false;
    STORY.log('chapter',chId);
    const it=ch.intro;
    if(it){
      if(it.card)flashMsg(it.card,it.cardDur||2600);
      if(it.title)toast(it.title,it.subtitle||('CHAPTER — '+chId.toUpperCase()));
      if(it.note)note(it.note,'story');
      if(it.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(it.lines);},it.delay||1200);
    }
    STORY._refreshActive(ch);
    STORY.onEnter(G.sceneId);
    return true;
  },
  _setActive(ch,o){
    G.story.obj=o.id;STORY.log('obj',o.id);
    if(o.text)setObjective(o.text,o.sub||'');
    if(o.setFlag)G.flags[o.setFlag]=true;
    if(o.onStart){try{o.onStart(STORY.ctx());}catch(e){}}
  },
  _refreshActive(ch){
    for(const o of ch.objectives){ if(!G.story.doneObj[o.id]){ if(G.story.obj!==o.id)STORY._setActive(ch,o); return; } }
    STORY._chapterComplete(ch);
  },
  activeObjective(){const ch=STORY.chapter();if(!ch||!G.story)return null;
    return ch.objectives.find(o=>o.id===G.story.obj)||null;},
  complete(objId){
    const ch=STORY.chapter();if(!ch)return false;
    const o=ch.objectives.find(x=>x.id===objId);if(!o||G.story.doneObj[objId])return false;
    G.story.doneObj[objId]=true;STORY.log('done',objId);
    if(o.onComplete){try{o.onComplete(STORY.ctx());}catch(e){}}
    if(o.flag)G.flags[o.flag]=true;
    if(o.note)note(o.note,'story');
    if(o.toast)toast(o.toast[0],o.toast[1]);
    if(o.world){try{o.world(G.scene);}catch(e){}}
    STORY._refreshActive(ch);
    return true;
  },
  _chapterComplete(ch){
    if(G.story.complete[ch.id])return;
    G.story.obj=null;G.story.complete[ch.id]=true;STORY.log('complete',ch.id);
    const o=ch.outro;
    if(o){
      if(o.note)note(o.note,'story');
      if(o.card)setTimeout(()=>flashMsg(o.card,o.cardDur||2800),o.cardDelay||600);
      if(o.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(o.lines);},o.delay||1600);
      if(o.objective)setTimeout(()=>{if(!G.over)setObjective(o.objective[0],o.objective[1]);},o.objDelay||5200);
    }
    if(ch.onComplete){try{ch.onComplete(STORY.ctx());}catch(e){}}
  },
  /* ---- narrative beats ---- */
  trigger(evtId,ctxArg){
    const e=STORYEVTS[evtId];if(!e||!G.story)return false;
    if(e.once&&G.story.doneEvt[evtId])return false;
    const ctx=ctxArg||STORY.ctx();
    if(e.scene&&e.scene!==G.sceneId)return false;
    if(e.when){let ok=false;try{ok=!!e.when(ctx);}catch(x){ok=false;}if(!ok)return false;}
    G.story.doneEvt[evtId]=true;STORY.log('evt',evtId);
    STORY._runEffects(e,ctx);
    return true;
  },
  _runEffects(e,ctx){
    const fx=e.effects||{};
    if(fx.flag)for(const k in fx.flag)G.flags[k]=fx.flag[k];
    if(fx.var)for(const k in fx.var)G.story.vars[k]=fx.var[k];
    if(fx.echo!=null)G.echo=Math.max(G.echo,fx.echo);
    if(fx.item)addItemKey(fx.item);
    if(fx.sfx&&SFX[fx.sfx])SFX[fx.sfx]();
    if(fx.subtitle)subtitle(fx.subtitle[0]||'',fx.subtitle[1]||fx.subtitle);
    if(fx.toast)toast(fx.toast[0],fx.toast[1]);
    if(fx.note)note(fx.note,'story');
    if(fx.world&&G.scene){try{fx.world(G.scene);}catch(x){}}
    if(fx.objective)setObjective(fx.objective[0],fx.objective[1]);
    if(fx.lines)setTimeout(()=>{if(!G.over&&!DLG.open)dialogue(fx.lines,e.run?()=>{try{e.run(ctx);}catch(x){}}:undefined);},fx.delay||300);
    else if(e.run){try{e.run(ctx);}catch(x){}}
  },
  /* ---- per-frame driver: quest progression + eligible beats ---- */
  update(dt){
    if(!G.started||G.over||G.sceneId==='ai_arena')return;
    if(!G.story)G.story=defaultStory();
    if(!G.story.chapter){STORY.start('ch1');}
    const ch=STORY.chapter();if(!ch)return;
    const ctx=STORY.ctx();
    /* auto-complete any objective whose condition is now met (order-safe, no soft-lock) */
    for(const o of ch.objectives){
      if(G.story.doneObj[o.id]||!o.when)continue;
      let done=false;try{done=!!o.when(ctx);}catch(e){}
      if(done)STORY.complete(o.id);
    }
    /* fire eligible chapter beats */
    if(ch.events)for(const id of ch.events){
      const e=STORYEVTS[id];if(!e||(e.once&&G.story.doneEvt[id]))continue;
      if(e.scene&&e.scene!==G.sceneId)continue;
      let ok=true;try{ok=e.when?!!e.when(ctx):true;}catch(x){ok=false;}
      if(ok)STORY.trigger(id,ctx);
    }
  },
  /* ---- on scene enter: apply persistent world-state that depends on progress ---- */
  onEnter(sceneId){
    if(!G.story)return;
    for(const w of STORY.world){
      if(w.scene&&w.scene!==sceneId)continue;
      if(G.story.vars['__w_'+w.id])continue;
      const ctx=STORY.ctx();let ok=true;try{ok=w.when?!!w.when(ctx):true;}catch(e){ok=false;}
      if(ok&&G.scene){try{w.apply(G.scene,ctx);G.story.vars['__w_'+w.id]=1;G.scene.dirty=true;}catch(e){}}
    }
  },
  /* ---- quest-progress view (notebook) ---- */
  progress(){
    const out={chapter:null,title:'',subtitle:'',objectives:[],complete:false};
    const ch=STORY.chapter();if(!ch)return out;
    out.chapter=ch.id;out.title=ch.title||'';out.subtitle=ch.subtitle||'';out.complete=!!G.story.complete[ch.id];
    for(const o of ch.objectives){
      const done=!!G.story.doneObj[o.id],active=(!done&&G.story.obj===o.id);
      out.objectives.push({id:o.id,text:o.text||'',hint:o.hint||'',done:done,active:active,revealed:done||active});
    }
    return out;
  },
};

/* =====================================================================
   CHAPTER 1 — «السقوط / THE FALL» · 2026
   Alexei's aircraft comes down near the Zone; he reaches Pripyat, explores,
   finds a trace of his mother, and arrives at the hospital where the first
   impossible thing happens. The past (1986) and the project are only HINTED.
   (Chapters 2+ — the underground — are intentionally NOT written yet.)
   ===================================================================== */
defChapter({
  id:'ch1',
  title:'الفصل الأول — السقوط',
  subtitle:'CHAPTER I · THE FALL · 2026 · PRIPYAT',
  intro:{
    card:'الفصل الأول — السقوط',cardDur:2800,
    note:'تحطّمت طائرتي شمال منطقة الحظر. الحرب خلف الدخان، وأمامي مدينة قالوا إنها ماتت سنة 1986.',
    delay:4200,
    lines:[
      {who:'ALEXEI',t:'المحرّك مات على ارتفاع أربعة آلاف متر. لم يكن صاروخًا. شيءٌ ما سحب الطائرة إلى الأسفل.'},
      {who:'ALEXEI',t:'الخريطة تقول: منطقة حظر. لا أحد هنا منذ أربعين سنة.'},
      {who:'ALEXEI',t:'إذن لماذا بعض أضواء المدينة ما زالت مضاءة؟',sfx:'whisper'},
    ]
  },
  objectives:[
    {id:'ch1_reach_city',
     text:'اترك الحطام واتجه جنوبًا إلى المدينة',sub:'الدخان خلفك. لا تعود إليه.',
     hint:'اخرج من الغابة إلى الشارع.',
     when:c=>!!G.flags.cityEntered||(G.visits.slice>0),
     toast:['بريبيات','51.406°N 30.054°E'],
     note:'وصلت إلى بريبيات. عدّاد جايجر لا يتوقّف، لكن المدينة تبدو… معتَنى بها.',
     flag:'ch1_city'},
    {id:'ch1_shelter',
     text:'ابحث عن مأوى — ادخل أحد المباني',sub:'الليل يقترب. شيءٌ ما يتحرّك بين العمارات.',
     hint:'جرّب أبواب الشقق والمتاجر.',
     when:c=>(G.visits.slice_bld>0)||(G.visits.apartment>0),
     flag:'ch1_inside'},
    {id:'ch1_trace',
     text:'ابحث عن أثر — أحدهم ترك شيئًا هنا',sub:'تسجيلٌ باسم «إيلينا». ابحث في الشقق.',
     hint:'مشغّل أشرطة أو شريط. في الشقق.',
     when:c=>hasItem('tapeplayer')||hasItem('tape1')||!!G.flags.tapeReady,
     toast:['إيلينا','اسمٌ تعرفه'],
     note:'«إيلينا». هذا اسم أمي. لماذا يوجد تسجيلٌ لها في مدينةٍ ماتت قبل أن أولد؟',
     flag:'ch1_elena'},
    {id:'ch1_hospital',
     text:'اتجه إلى المستشفى',sub:'المبنى الوحيد الذي ما زال التيّار يصل إليه.',
     hint:'اتبع الكابلات/الضوء.',
     when:c=>(G.visits.hospital>0),
     flag:'ch1_hospital'},
    {id:'ch1_anomaly',
     text:'اكتشف ما يحدث — اعثر على أول شذوذ في المستشفى',sub:'أربعون سنة من الهجر… لكن شيئًا هنا يعمل.',
     hint:'افحص المبنى. شيءٌ ما لا يتطابق.',
     when:c=>!!G.flags.ch1_anomalySeen},
  ],
  events:['ch1_city_echo','ch1_hospital_anomaly'],
  outro:{
    note:'تحت المستشفى، المصعد لا يصعد. ينزل فقط. وفي السجلّ اسمٌ مألوف: VOLKOVA.',
    card:'— 1986 —',cardDur:2600,cardDelay:800,
    delay:2000,
    lines:[
      {who:'ALEXEI',t:'سجلّ المستشفى، سنة 1986. مريضة: VOLKOVA، إيلينا. هذا… اسم أمي.'},
      {who:'???',t:'أنت متأخّرٌ أربعين سنةً، يا كابتن.',sfx:'whisper',speak:'You are forty years late, captain.'},
      {who:'ALEXEI',t:'مَن قال هذا؟ …المصعد. المصعد يعمل. لم يلمسه أحد منذ 1986.'},
      {who:'ALEXEI',t:'الأزرار كلها مطفأة إلّا واحدًا. ينزل. لا يوجد زرٌّ للصعود.'},
    ],
    objective:['انزل — المستشفى ليست النهاية','الفصل الثاني: ما تحت بريبيات (قريبًا)'],
    objDelay:6200
  },
  onComplete:()=>{G.flags.ch1_complete=true;}
});

/* ---- Chapter 1 narrative beats ---- */
defStoryEvent({id:'ch1_city_echo',once:true,scene:'slice',
  when:c=>(G.visits.slice>0)&&!!G.flags.cityEntered,
  effects:{echo:0.10,
    subtitle:['','لافتة سوفياتية: «مجدًا للعمّال». وتحتها، بخطٍّ حديثٍ وحبرٍ لم يجفّ: «لا تنزل».'],
    note:'تحذيرٌ كُتب حديثًا على لافتة من سنة 1986. أحدٌ ما ما زال يكتب هنا.'}});
defStoryEvent({id:'ch1_hospital_anomaly',once:true,scene:'hospital',
  when:c=>(G.visits.hospital>0)&&!!G.flags.ch1_hospital,
  effects:{echo:0.30,sfx:'dread',flag:{ch1_anomalySeen:true},
    subtitle:['','في آخر الرواق: مصعدٌ يعمل. لوحة الطوابق تُظهر −2. لا يوجد طابق −2 في أيّ مخطّط.'],
    note:'المستشفى: مصعدٌ يعمل وحده وينزل إلى طابقٍ غير موجود. هذا أول شيءٍ لا أستطيع تفسيره.',
    world:function(s){let n=0;for(const L of (s.lights||[])){if(n<2){L.flick=(L.flick||0)+0.10;n++;}}}}});

/* ---- Chapter 1 world-state: the city reacts to what you learn ---- */
STORY.defWorld({id:'w_ch1_wake',scene:'slice',
  when:c=>!!G.flags.ch1_anomalySeen&&!G.flags.power,
  apply:function(s){let n=0;for(const L of (s.lights||[]))if(L.broken&&n<3){L.broken=false;n++;}
    if(n){subtitle('','بعدما رأيت المصعد، أضاءت ثلاثة مصابيح شارعٍ من تلقاء نفسها.');
      note('ثلاثة مصابيح اشتغلت في بريبيات بعد شذوذ المستشفى. التيّار مقطوعٌ منذ 1986.','story');}}});

/* =====================================================================
   SAVE / LOAD SYSTEM (Phase 12) — autosave + quicksave + manual slots
   slots: 'auto' (SAVEKEY — autosave/quicksave) | '1'..'3' (manual)
   ===================================================================== */
const SAVE_SLOTS=['1','2','3'];
function slotKey(slot){return slot==='auto'?SAVEKEY:SAVEKEY+'_s'+slot;}
function readSlot(slot){try{const raw=localStorage.getItem(slotKey(slot));if(!raw)return null;
  const d=JSON.parse(raw);d._slot=slot;d._ts=d.ts||0;return d;}catch(e){return null;}}
function listSaves(){const out=[];
  if(readSlot('auto'))out.push('auto');
  for(const sl of SAVE_SLOTS)if(readSlot(sl))out.push(sl);
  return out;}
function newestSave(){let best=null;
  for(const sl of ['auto'].concat(SAVE_SLOTS)){const d=readSlot(sl);if(d&&(!best||d._ts>best._ts))best=d;}
  return best;}
function deleteSave(slot){try{localStorage.removeItem(slotKey(slot));}catch(e){}}
function saveGame(auto,slot){
  try{
    slot=slot||(auto?'auto':'1');
    /* strictly increasing timestamps -> newestSave() is unambiguous even
       when two saves land in the same millisecond */
    const ts=Math.max(Date.now(),(saveGame._ts||0)+1);saveGame._ts=ts;
    const s=G.scene;
    if(s)G.lastSafe=s.safe||G.lastSafe;
    /* snapshot live enemy state (position / death / hp) of the current scene */
    if(s&&s.entsLive){G.flags.pos=G.flags.pos||{};
      for(const e of s.entsLive)if(e.key){
        G.flags.pos[e.key]={x:e.x,y:e.y,dead:!!e.dead};if(e.hp!=null)G.flags.pos[e.key].hp=e.hp;}}
    const used={};
    for(const sc of Object.values(SCENES))
      for(const it of sc.ints)if(it.used||it.locked===false)(used[sc.id]=used[sc.id]||{})[it.id]=it.used?'u':'l';
    const doors={};
    for(const sc of Object.values(SCENES))
      for(const d of sc.doors)if(d.open||!d.locked)(doors[sc.id]=doors[sc.id]||{})[d.id]=1;
    const data={
      v:2,ts,slot,
      sceneId:G.sceneId,px:G.player.x,py:G.player.y,
      face:G.player.face,modelYaw:(G.player.modelYaw==null?0:G.player.modelYaw),
      crouchLock:!!G.player.crouchLock,injured:G.player.injured||0,
      vert:(G.player.py||0),grounded:G.player.grounded!==false,
      hp:G.player.hp,rad:G.player.rad,sta:G.player.sta,
      bat:G.player.bat,flash:G.player.flash,
      echo:G.echo,flags:G.flags,items:G.items,pz:G.pz,evt:G.evt,story:G.story,docs:G.docs,tapes:G.tapes,syms:G.syms,
      notes:G.notes.slice(0,40),visits:G.visits,trust:G.trust,objective:G.objective,objSub:G.objSub,
      stats:G.stats,lastSafe:G.lastSafe,used,doors,mapUnreliable:G.mapUnreliable,radio:G.radio,
      set:(typeof UI!=='undefined'&&UI.SET)?UI.SET:null,
      time:Math.floor(G.time)
    };
    localStorage.setItem(slotKey(slot),JSON.stringify(data));
    if(!auto)toast('تم الحفظ','SAVED · '+(slot==='auto'?'AUTO':'SLOT '+slot));
  }catch(e){}
}
function hasSave(){try{
  if(localStorage.getItem(SAVEKEY))return true;
  for(const sl of SAVE_SLOTS)if(localStorage.getItem(slotKey(sl)))return true;
  return false;}catch(e){return false;}}
function loadGame(slot){
  try{
    const d=slot?readSlot(slot):newestSave();if(!d)return false;
    buildAllScenes();
    G.player=newPlayer();
    Object.assign(G,{echo:d.echo||0,flags:d.flags||{},items:d.items||{},pz:d.pz||{},evt:d.evt||{done:{},cd:{}},story:d.story||null,docs:d.docs||[],
      tapes:d.tapes||[],syms:d.syms||[],notes:d.notes||[],visits:d.visits||{},trust:d.trust||0,
      stats:d.stats||G.stats,lastSafe:d.lastSafe,mapUnreliable:d.mapUnreliable,radio:d.radio,time:d.time||0});
    G.player.x=d.px;G.player.y=d.py;G.player.hp=d.hp==null?3:d.hp;G.player.rad=d.rad||0;
    G.player.bat=d.bat==null?CFG.batMax:d.bat;G.player.flash=!!d.flash;
    G.player.sta=d.sta==null?CFG.staMax:d.sta;
    G.player.face=d.face||0;G.player.modelYaw=(d.modelYaw==null?(d.face||0):d.modelYaw);
    G.player.crouchLock=!!d.crouchLock;G.player.injured=d.injured||0;
    G.player.py=d.vert||0;G.player.grounded=d.grounded!==false;
    /* settings travel with the save */
    if(d.set&&typeof UI!=='undefined'&&UI.SET){try{Object.assign(UI.SET,d.set);UI.apply();UI.save();}catch(e){}}
    /* restore used/doors */
    for(const sid in d.used){const sc=SCENES[sid];if(!sc)continue;
      for(const it of sc.ints){const v=d.used[sid][it.id];if(v==='u')it.used=true;}}
    for(const sid in d.doors){const sc=SCENES[sid];if(!sc)continue;
      for(const dd of sc.doors){if(d.doors[sid][dd.id]){dd.open=true;dd.locked=false;}}}
    G.started=true;G.over=false;
    enterScene(d.sceneId,{x:d.px,y:d.py},{silent:true});
    setObjective(d.objective||'—',d.objSub||'');
    return true;
  }catch(e){console.warn(e);return false;}
}

/* =====================================================================
   AUDIO BED
   ===================================================================== */
function audioDynamic(dt){
  if(!A.ready||!A.on)return;
  const t=A.ctx.currentTime,th=G.threat||0;
  try{
    A.wind.f.frequency.setTargetAtTime((G.scene&&G.scene.indoor?250:470)+th*420,t,0.4);
    A.master.gain.setTargetAtTime(G.paused?0.25:0.85+th*0.12,t,0.5);
  }catch(e){}
}
function audioBed(){
  if(!A.ready)return;
  const s=G.scene;if(!s)return;
  const t=A.ctx.currentTime,au=s.ambAudio||{};
  A.wind.g.gain.linearRampToValueAtTime(au.wind!=null?au.wind:(s.indoor?0.05:0.30),t+1.6);
  A.wind.f.frequency.linearRampToValueAtTime(au.windFreq||(s.indoor?260:520),t+1.6);
  A.hum.gain.linearRampToValueAtTime(au.hum!=null?au.hum:(s.indoor?0.035:0.0),t+1.6);
  ENV.startAmbient(s);
}

/* =====================================================================
   INPUT
   ===================================================================== */
function bindInput(){
  window.addEventListener('keydown',e=>{
    if(['Tab','F5','F9','Space'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    IN.down(e);
    audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
    if(DLG.open){if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter')nextLine();
      const L=DLG.q[DLG.i];
      if(L&&L.opts&&/^Digit[1-4]$/.test(e.code)){
        const i=+e.code.slice(5)-1;if(L.opts[i]){if(L.opts[i].f)L.opts[i].f();nextLine();}}
      return;}
    if(DOC.open){if(e.code==='KeyE'||e.code==='Escape')closeDoc();return;}
    if(CODE.open){if(e.code==='Escape')closeCode();return;}
    if(PZUI.open){if(e.code==='Escape')PZ.close();return;}
    if(INVUI.open){if(e.code==='KeyI'||e.code==='Escape'||e.code==='Tab')closeInv();return;}
    if(NB.open){if(e.code==='Tab'||e.code==='KeyJ'||e.code==='Escape')closeNb();return;}
    if(typeof UI!=='undefined'&&UI.slOpen){if(e.code==='Escape')UI.closeSaveLoad();return;}
    if(typeof UI!=='undefined'&&UI.setOpen){if(e.code==='Escape')UI.closeSettings();return;}
    if(!G.started){return;}
    switch(e.code){
      case 'KeyE':case 'Space':doInteract();break;
      case 'KeyH':{
        const P=G.player;
        if(P.hidden){unhide();break;}
        const h=(G.scene.ints||[]).find(i=>i.type==='hide'&&!i.used&&dist(i.x,i.y,P.x,P.y)<2.2);
        if(h)hideAt(h);else{SFX.deny();subtitle('','لا مكان للاختباء هنا.');}
        break;}
      case 'KeyF':toggleFlash();break;
      case 'KeyR':playRadio();break;
      case 'KeyC':case 'ControlLeft':G.player.crouchLock=!G.player.crouchLock;break;
      case 'KeyQ':{const r=INV.use('medkit');if(r.ok===false){SFX.deny();subtitle('',r.msg||'لا توجد حقيبة إسعاف.');}}break;
      case 'KeyI':toggleInv();break;
      case 'Tab':case 'KeyJ':openNb();break;
      case 'Escape':togglePause();break;
      case 'F5':saveGame(false,'auto');break;
      case 'F9':{if(loadGame()){if(G.paused)togglePause();toast('تم التحميل','QUICK LOADED');}
        else toast('لا يوجد حفظ','NO SAVE TO LOAD');}break;
      case 'KeyM':openNb();NB.tab='map';renderNb();break;
      case 'KeyV':resetCam();break;
      case 'KeyG':cycleQuality();break;
    }
  });
  window.addEventListener('keyup',e=>IN.up(e));
  window.addEventListener('blur',()=>{IN.keys={};});
  window.addEventListener('beforeunload',()=>{try{if(G.started&&!G.over)saveGame(true);}catch(e){}});
  /* ---- mouse look: pointer lock + drag fallback ---- */
  const glc=$('gl');
  const addLook=(dx,dy)=>{
    if(!dx&&!dy)return;
    IN.lookX+=clamp(dx,-260,260);
    IN.lookY+=clamp(dy,-260,260);
    if(!IN.locked){IN.mx+=dx;IN.my+=dy;}
  };
  /* the mouse owns the view direction — raw deltas, no dead zone, no snapping.
     Ignored while an overlay/menu is up so reading never spins the camera. */
  const uiBusy=()=>!G.started||G.over||G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open||
    !$('help').classList.contains('hide');
  document.addEventListener('mousemove',e=>{if(!uiBusy())addLook(e.movementX||0,e.movementY||0);});
  const lockOn=()=>{IN.locked=true;};
  const lockOff=()=>{IN.locked=false;};
  document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement===glc||document.pointerLockElement===cv)lockOn();else lockOff();
  });
  document.addEventListener('pointerlockerror',()=>lockOff());
  const wantLock=()=>{
    const t=glc||cv;
    if(!t||IN.locked||!t.requestPointerLock)return;
    try{t.requestPointerLock();}catch(err){}
  };
  glc.addEventListener('mousedown',e=>{
    audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
    if(!G.started||G.over||G.paused)return;
    if(!IN.locked){wantLock();return;}
    if(e.button===0){if(DLG.open)nextLine();else doInteract();}
    else if(e.button===2)toggleFlash();
  });
  glc.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('blur',()=>{IN.lookX=IN.lookY=0;});
  addEventListener('beforeunload',()=>{if(document.exitPointerLock)try{document.exitPointerLock();}catch(e){}});
  /* touch */
  if('ontouchstart' in window||navigator.maxTouchPoints>0){
    IN.touch=true;$('touch').classList.remove('hide');
    const st=$('stick'),nub=$('stickNub');
    let sid=null,cx=0,cy=0;
    st.addEventListener('touchstart',e=>{e.preventDefault();audioInit();
      const t=e.changedTouches[0];sid=t.identifier;const r=st.getBoundingClientRect();
      cx=r.left+r.width/2;cy=r.top+r.height/2;},{passive:false});
    st.addEventListener('touchmove',e=>{e.preventDefault();
      for(const t of e.changedTouches)if(t.identifier===sid){
        let dx=(t.clientX-cx)/52,dy=(t.clientY-cy)/52;
        const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}
        IN.joy.x=dx;IN.joy.y=dy;
        nub.style.transform='translate('+(dx*26)+'px,'+(dy*26)+'px)';}},{passive:false});
    const end=e=>{for(const t of e.changedTouches)if(t.identifier===sid){sid=null;IN.joy.x=IN.joy.y=0;nub.style.transform='';}};
    st.addEventListener('touchend',end);st.addEventListener('touchcancel',end);
    let lookId=null,lx=0,ly=0;
    glc.addEventListener('touchstart',e=>{
      audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
      const t=e.changedTouches[0];
      if(t.clientX>VW*0.32&&lookId===null){lookId=t.identifier;lx=t.clientX;ly=t.clientY;}
    },{passive:true});
    glc.addEventListener('touchmove',e=>{
      for(const t of e.changedTouches)if(t.identifier===lookId){
        addLook((t.clientX-lx)*1.5,(t.clientY-ly)*1.5);lx=t.clientX;ly=t.clientY;}
    },{passive:true});
    const lend=e=>{for(const t of e.changedTouches)if(t.identifier===lookId)lookId=null;};
    glc.addEventListener('touchend',lend,{passive:true});
    glc.addEventListener('touchcancel',lend,{passive:true});
    const bind=(id,fn)=>{const b=$(id);b.addEventListener('touchstart',e=>{e.preventDefault();fn();},{passive:false});};
    bind('tbE',()=>{if(DLG.open)nextLine();else doInteract();});
    bind('tbF',toggleFlash);
    bind('tbC',()=>{G.player.crouchLock=!G.player.crouchLock;});
    bind('tbN',()=>{NB.open?closeNb():openNb();});
    bind('tbI',()=>{INVUI.open?closeInv():openInv();});
  }
  /* UI buttons */
  $('dlg').addEventListener('click',e=>{if(e.target.classList.contains('opt'))return;nextLine();});
  $('btnDocClose').onclick=closeDoc;
  $('btnNbClose').onclick=closeNb;
  $('btnInvClose').onclick=closeInv;
  $('btnPzClose').onclick=()=>PZ.close();
  $('btnCodeClose').onclick=closeCode;
  $('btnCodeClear').onclick=()=>{CODE.slots=[];renderCode();};
  document.querySelectorAll('#nbTabs .tab').forEach(t=>t.onclick=()=>{NB.tab=t.dataset.t;renderNb();});
}
function toggleFlash(){
  const P=G.player;
  if(P.bat<=0){SFX.deny();toast('البطارية فارغة','BATTERY DEAD');return;}
  P.flash=!P.flash;
  tone(P.flash?880:520,0.05,0.03,'square');
  if(P.flash)note('أشعلت الكشاف.','');
}
function togglePause(){
  if(!G.started)return;
  G.paused=!G.paused;
  $('pause').classList.toggle('hide',!G.paused);
  if(G.paused){
    $('pauseStats').textContent='الطبقة: '+['','REALITY','MEMORY','PSYCHOLOGICAL','ZERO'][G.layer]+
      '  •  مستندات: '+G.docs.length+'  •  رموز: '+G.syms.length+'  •  وفيات: '+G.stats.deaths;
    if(typeof UI!=='undefined')UI.applyVolume();else if(A.ready)A.master.gain.value=0.25;
  }else if(typeof UI!=='undefined')UI.applyVolume();else if(A.ready)A.master.gain.value=0.85;
}

/* =====================================================================
   UI SYSTEM (Phase 11) — a minimal, contextual horror HUD + panels.
   - HUD auto-hide: the whole HUD fades out when the player is idle and
     safe, and fades back on any input/threat/prompt/subtitle (immersion).
   - Settings (persisted): sensitivity, volume, subtitles, grain, quality,
     camera distance, HUD auto-hide — applied live to the engine.
   - Save/Load panel: manual save + load with last-save info.
   - Health pips: minimal status shown with the vitals only when relevant.
   The UI only reads game state; it never mutates gameplay systems.
   ===================================================================== */
const SETKEY='chernobyl_settings_v1';
const UI={
  SET:{sens:1.0,volume:0.85,subtitles:true,grain:true,quality:2,camDist:2.7,hudAuto:true},
  DEF:{sens:1.0,volume:0.85,subtitles:true,grain:true,quality:2,camDist:2.7,hudAuto:true},
  setOpen:false, slOpen:false, _ret:'pause',
  hudA:1, actT:99, _lastObj:null, _ready:false,
  load(){try{const raw=localStorage.getItem(SETKEY);if(raw){const d=JSON.parse(raw);
    for(const k in UI.DEF)if(d[k]!==undefined)UI.SET[k]=d[k];}}catch(e){}return UI.SET;},
  save(){try{localStorage.setItem(SETKEY,JSON.stringify(UI.SET));}catch(e){}return true;},
  reset(){for(const k in UI.DEF)UI.SET[k]=UI.DEF[k];UI.save();UI.apply();},
  apply(){
    IN.sens=clamp(UI.SET.sens,0.3,2.5);
    if(typeof E3!=='undefined')E3.quality=clamp(UI.SET.quality|0,0,2);
    if(typeof applyQuality==='function'){try{applyQuality();}catch(e){}}
    if(typeof E3!=='undefined'&&UI.SET.camDist)E3.camDist=clamp(UI.SET.camDist,CFG.camDistMin,CFG.camDistMax);
    UI.applyVolume();
    if(typeof syncModeUI==='function'){try{syncModeUI();}catch(e){}}
  },
  applyVolume(){if(typeof A!=='undefined'&&A.ready&&A.master)A.master.gain.value=clamp(UI.SET.volume,0,1)*(G.paused?0.3:1);},
  init(){
    UI.load();UI.apply();
    const sc=$('btnSetClose');if(sc)sc.onclick=()=>UI.closeSettings();
    const sr=$('btnSetReset');if(sr)sr.onclick=()=>{UI.reset();UI.renderSettings();toast('تمت استعادة الإعدادات الافتراضية','SETTINGS RESET');};
    const ss=$('btnSlSave');if(ss)ss.onclick=()=>UI.doSave();
    const ll=$('btnSlLoad');if(ll)ll.onclick=()=>UI.doLoad();
    const lc=$('btnSlClose');if(lc)lc.onclick=()=>UI.closeSaveLoad();
    if(!UI.slSel)UI.slSel='1';
    UI._ready=true;
  },
  healthPips(hp){const e=$('vHp');if(!e||!e.children)return;
    for(let i=0;i<e.children.length;i++){const c=e.children[i];if(c&&c.classList)c.classList.toggle('off',i>=(hp|0));}},
  openSettings(from){UI._ret=from||'pause';UI.setOpen=true;
    $('pause').classList.add('hide');$('menu').classList.add('hide');
    UI.renderSettings();$('settings').classList.remove('hide');},
  closeSettings(){$('settings').classList.add('hide');UI.setOpen=false;
    if(UI._ret==='menu')$('menu').classList.remove('hide');else $('pause').classList.remove('hide');},
  renderSettings(){
    const b=$('setBody');if(!b)return;b.innerHTML='';if(b.replaceChildren)b.replaceChildren();
    const row=(label,desc,ctrl)=>{const r=el('div','setrow');
      const l=el('div','');l.innerHTML='<div class="sl">'+label+'</div><div class="sd">'+desc+'</div>';
      r.appendChild(l);r.appendChild(ctrl);b.appendChild(r);return r;};
    const slider=(key,min,max,step,fmt)=>{const inp=el('input');inp.type='range';inp.min=String(min);inp.max=String(max);inp.step=String(step);
      inp.value=String(UI.SET[key]);const v=el('span','val',fmt(UI.SET[key]));
      const wrap=el('div','');wrap.style.display='flex';wrap.style.alignItems='center';wrap.style.gap='10px';
      wrap.appendChild(inp);wrap.appendChild(v);
      inp.addEventListener('input',()=>{UI.SET[key]=clamp(parseFloat(inp.value)||min,min,max);v.textContent=fmt(UI.SET[key]);UI.apply();UI.save();});
      return wrap;};
    const toggle=(key,onLbl,offLbl)=>{const bt=el('button','toggle'+(UI.SET[key]?' on':''),UI.SET[key]?onLbl:offLbl);
      bt.onclick=()=>{UI.SET[key]=!UI.SET[key];bt.classList.toggle('on',UI.SET[key]);bt.textContent=UI.SET[key]?onLbl:offLbl;UI.apply();UI.save();};
      return bt;};
    row('حساسية الفأرة','Mouse sensitivity',slider('sens',0.3,2.5,0.05,x=>x.toFixed(2)));
    row('مستوى الصوت','Master volume',slider('volume',0,1,0.05,x=>Math.round(x*100)+'%'));
    row('مسافة الكاميرا','Camera distance',slider('camDist',CFG.camDistMin,CFG.camDistMax,0.1,x=>x.toFixed(1)));
    const q=el('button','toggle on',['منخفضة','متوسطة','عالية'][clamp(UI.SET.quality|0,0,2)]);
    q.onclick=()=>{UI.SET.quality=(UI.SET.quality+1)%3;q.textContent=['منخفضة','متوسطة','عالية'][UI.SET.quality];UI.apply();UI.save();};
    row('الجودة','Render quality',q);
    row('الترجمات','Subtitles',toggle('subtitles','مفعّلة','مطفأة'));
    row('حبيبات الفيلم','Film grain',toggle('grain','مفعّلة','مطفأة'));
    row('إخفاء الواجهة تلقائيًا','Hide HUD when idle',toggle('hudAuto','مفعّل','معطّل'));
  },
  openSaveLoad(from){UI._ret=from||'pause';UI.slOpen=true;
    $('pause').classList.add('hide');$('menu').classList.add('hide');
    UI.renderSaveLoad();$('saveload').classList.remove('hide');},
  closeSaveLoad(){$('saveload').classList.add('hide');UI.slOpen=false;
    if(UI._ret==='menu')$('menu').classList.remove('hide');else $('pause').classList.remove('hide');},
  saveInfo(slot){const d=slot?readSlot(slot):newestSave();if(!d)return null;
    const sc=SCENES[d.sceneId];
    return {slot:d._slot,scene:d.sceneId,name:sc?sc.name:d.sceneId,time:d.time||0,hp:(d.hp==null?3:d.hp),ts:d._ts};},
  renderSaveLoad(){
    const m=$('slMsg');if(m)m.textContent='';
    const box=$('slSlots');
    if(box){
      box.innerHTML='';if(box.replaceChildren)box.replaceChildren();
      UI._slBtns={};UI._slRows={};
      const mkRow=(sl,title)=>{
        const d=readSlot(sl);
        const r=el('div','slrow'+(UI.slSel===sl?' sel':''));
        const l=el('div','sllab',title);
        const meta=el('div','slmeta',d?((d.name||d.sceneId)+' · HP '+(d.hp==null?3:d.hp)+'/3 · '+Math.floor(d.time||0)+'s'):'— فارغة —');
        const bs=el('div','slbtns');
        r.appendChild(l);r.appendChild(meta);r.appendChild(bs);box.appendChild(r);
        let bSave=null;
        if(sl!=='auto'){bSave=el('button','btn small','حفظ');
          bSave.onclick=()=>{UI.slSel=sl;UI.doSave(sl);};
          bSave.classList.toggle('disabled',!G.started||G.over);bs.appendChild(bSave);}
        const bLoad=el('button','btn small','تحميل');
        bLoad.onclick=()=>{UI.slSel=sl;UI.doLoad(sl);};
        bLoad.classList.toggle('disabled',!d);bs.appendChild(bLoad);
        const bDel=el('button','btn small','حذف');
        bDel.onclick=()=>{deleteSave(sl);UI.renderSaveLoad();const mm=$('slMsg');if(mm)mm.textContent='تم حذف الخانة.';};
        bDel.classList.toggle('disabled',!d);bs.appendChild(bDel);
        r.onclick=()=>{UI.slSel=sl;UI.renderSaveLoad();};
        UI._slRows[sl]=r;UI._slBtns[sl]={save:bSave,load:bLoad,del:bDel};
      };
      mkRow('auto','حفظ تلقائي');
      for(const sl of SAVE_SLOTS)mkRow(sl,'خانة '+sl);
    }
    const info=UI.saveInfo(UI.slSel),i=$('slInfo');
    if(i)i.textContent=info?('المحدّدة — '+info.name+'  ·  HP '+info.hp+'/3  ·  t='+Math.floor(info.time)+'s'):'لا يوجد حفظ بعد.';
    const ld=$('btnSlLoad');if(ld&&ld.classList)ld.classList.toggle('disabled',!info);
    const sv=$('btnSlSave');if(sv&&sv.classList)sv.classList.toggle('disabled',!G.started||G.over);
  },
  doSave(slot){slot=slot||UI.slSel||'1';
    if(!G.started||G.over){const m=$('slMsg');if(m)m.textContent='لا يمكن الحفظ الآن.';return false;}
    saveGame(false,slot);UI.renderSaveLoad();
    const m=$('slMsg');if(m)m.textContent='تم الحفظ في '+(slot==='auto'?'الحفظ التلقائي':'الخانة '+slot)+'.';
    toast('تم الحفظ','GAME SAVED · '+(slot==='auto'?'AUTO':'SLOT '+slot));return true;},
  doLoad(slot){
    let d=slot?readSlot(slot):null;if(!d)d=newestSave();
    if(!d){const m=$('slMsg');if(m)m.textContent='لا يوجد حفظ.';return false;}
    slot=d._slot;
    UI.closeSaveLoad();if(G.paused)togglePause();
    if(loadGame(slot)){toast('تم التحميل','GAME LOADED · '+(slot==='auto'?'AUTO':'SLOT '+slot));return true;}return false;},
  update(dt){
    if(!G.started||G.over)return;
    const P=G.player;
    let act=0;
    if(IN.keys){for(const k in IN.keys){if(IN.keys[k]){act=1;break;}}}
    if(IN.joy&&(IN.joy.x||IN.joy.y))act=1;
    if(Math.abs(IN.lookX||0)+Math.abs(IN.lookY||0)>0.6)act=1;
    if(P&&(P.moving||P.sprint||P.injured>0||P.dmgFlash>0))act=1;
    if(G.threat>0.05)act=1;
    if(G.subtitleT>0)act=1;
    if(typeof curInt!=='undefined'&&curInt)act=1;
    if(DLG.open||DOC.open||NB.open||INVUI.open||CODE.open||PZUI.open||UI.setOpen||UI.slOpen)act=1;
    if(G.objective!==UI._lastObj){UI._lastObj=G.objective;act=1;}
    if(act||!UI.SET.hudAuto)UI.actT=UI.SET.hudAuto?2.6:1e9;else UI.actT=Math.max(0,UI.actT-dt);
    const target=UI.actT>0?1:0;
    UI.hudA+=(target-UI.hudA)*(1-Math.pow(0.0009,dt));
    if(UI.hudA<0.002)UI.hudA=0;if(UI.hudA>0.998)UI.hudA=1;
    const h=$('hud');if(h&&h.style)h.style.opacity=UI.hudA.toFixed(3);
  },
};

/* =====================================================================
   LOOP / BOOT
   ===================================================================== */
let acc=0;
function loop(ts){
  requestAnimationFrame(loop);
  if(!G.last)G.last=ts;
  let dt=(ts-G.last)/1000;G.last=ts;
  if(dt>0.05)dt=0.05;
  G.dt=dt;
  if(!G.started){renderMenuBg(dt);return;}
  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open||INVUI.open||PZUI.open){
    G.time+=dt*0.15;
    if(G.scene&&G.player&&E3.ok){
      if(G.shakeT>0){G.shakeT-=dt*0.15;const a=G.shakeA*(G.shakeT>0?G.shakeT:0);
        cam.shakeX=(Math.random()*2-1)*a;cam.shakeY=(Math.random()*2-1)*a;}
      update3D(dt*0.25);mirror3D();renderPost(dt);
    }
    return;
  }
  G.time+=dt;
  updatePlayer(dt);
  if(typeof ANIM!=='undefined')ANIM.update(dt,G.player);
  updateEnts(dt);
  updateBeats(dt);
  updateAnoms(dt);
  if(typeof EVT!=='undefined')EVT.update(dt);
  if(typeof STORY!=='undefined')STORY.update(dt);
  if(G.subtitleT>0){G.subtitleT-=dt;if(G.subtitleT<=0)$('sub').style.opacity=0;}
  updateHint();
  if(typeof UI!=='undefined')UI.update(dt);
  render3D();renderPost(dt);
  audioDynamic(dt);
  acc+=dt;if(acc>25){acc=0;saveGame(true);}
}
function renderMenuBg(dt){
  G.time+=dt;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle='#05070a';ctx.fillRect(0,0,VW,VH);
  /* slow drifting zone silhouette */
  const t=G.time*0.06;
  ctx.save();
  for(let i=0;i<26;i++){
    const x=((i*137+t*90)%(VW+300))-150;
    const y=VH*0.45+Math.sin(i*1.7)*VH*0.16;
    ctx.fillStyle='rgba(30,38,42,'+(0.25+0.2*Math.sin(i+t)).toFixed(3)+')';
    ctx.fillRect(x,y,18+((i*29)%40),VH);
  }
  ctx.restore();
  const g=ctx.createRadialGradient(VW*0.75,VH*0.35,10,VW*0.75,VH*0.35,VW*0.5);
  g.addColorStop(0,'rgba(255,90,40,.10)');g.addColorStop(1,'rgba(255,90,40,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  fctx.setTransform(1,0,0,1,0,0);fctx.clearRect(0,0,fx.width,fx.height);
  fctx.setTransform(DPR,0,0,DPR,0,0);
  fctx.globalAlpha=0.06;
  const pat=fctx.createPattern(grainCanvas(),'repeat');
  fctx.fillStyle=pat;fctx.fillRect(0,0,VW,VH);
  fctx.globalAlpha=1;
}
function startGame(fresh){
  audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
  if(!fresh&&loadGame()){
    $('menu').classList.add('hide');$('hud').classList.remove('hide');
    E3.builtFor=null;
    G.started=true;toast('تم تحميل الحفظ','WELCOME BACK');
    return;
  }
  buildAllScenes();
  G.player=newPlayer();
  G.sceneId='outdoor';
  $('menu').classList.add('hide');
  $('hud').classList.remove('hide');
  E3.builtFor=null;
  G.started=true;
  const f=$('fade');f.style.opacity=1;
  enterScene('outdoor',{x:25.5,y:25.5},{silent:true});
  G.visits.outdoor=1;
  /* opening */
  setTimeout(()=>{f.style.opacity=0;},400);
  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';
  setTimeout(()=>{
    toast('26 أبريل… لا. 2026.','Exclusion Zone');
    subtitle('','طائرتك سقطت. الدخان خلفك. شيء ما في الغابة يتحرك.',6);
  },1200);
  setTimeout(()=>{
    setObjective('ابتعد عن الدخان — اتجه جنوبًا','جنود يقتربون. لا تقاتل. اختبئ.');
    note('سقطت قرب تشيرنوبل. الحرب في مكان آخر، لكن الطائرات تسقط هنا.','story');
    toast('اضغط داخل الشاشة لقفل الفأرة','الماوس = النظر • WASD = الحركة باتجاه نظرك • Tab = الدفتر');
  },6000);
  setTimeout(()=>{
    subtitle('RADIO','— Volk-7, respond. Volk-7, this is Rota-2. Your aircraft is on fire.',7);
    SFX.radio();speak('Volk seven, respond. Your aircraft is on fire.',0.85,0.95,0.5);
    G.radio=true;
  },13000);
  G.flags.psyEnabled=false;
  saveGame(true);
}
/* Enter the Phase-3 environment vertical slice directly (test/preview). */
function startSliceTest(){
  audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
  buildAllScenes();
  G.player=newPlayer();
  G.sceneId='slice';
  $('menu').classList.add('hide');$('hud').classList.remove('hide');
  E3.builtFor=null;G.started=true;G.over=false;
  const f=$('fade');f.style.opacity=1;
  enterScene('slice',SCENES.slice.spawn,{silent:true});
  G.visits.slice=1;
  setTimeout(()=>{f.style.opacity=0;},400);
  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';
  toast('قطاع اختبار — البيئة','ENVIRONMENT VERTICAL SLICE');
  setObjective('اختبر البيئة: امشِ في الشارع، ادخل المبنى، لاحظ الإضاءة والضباب','WASD حركة • الفأرة نظر • E تفاعل/أبواب • F كشاف');
  note('قطاع اختبار صغير يمثل جزءًا من مدينة مهجورة. مبني بالكامل عبر نظام البيئة (ENV).','env');
  saveGame(true);
}
function startAITest(){
  audioInit();if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();
  buildAllScenes();
  G.player=newPlayer();
  G.sceneId='ai_arena';
  $('menu').classList.add('hide');$('hud').classList.remove('hide');
  E3.builtFor=null;G.started=true;G.over=false;
  const f=$('fade');f.style.opacity=1;
  enterScene('ai_arena',SCENES.ai_arena.spawn,{silent:true});
  G.visits.ai_arena=1;
  setTimeout(()=>{f.style.opacity=0;},400);
  IN.movedByMouse=false;E3.pitchT=-0.05;E3.pitch=-0.05;
  E3.camDist=CFG.camDistDefault;E3.camSnap=true;E3.view='ots';
  toast('منطقة اختبار الذكاء الاصطناعي','ENEMY AI PROTOTYPE — STALKER');
  setObjective('اختبر الذكاء الاصطناعي: تحرّك ليراك/يسمعك، ثم اختبئ ليفقدك ويعود للدورية',
    'حالة العدو تظهر أعلى اليمين • WASD حركة • Shift عدو • Ctrl انحناء • H اختباء');
  note('منطقة اختبار منفصلة لعدو واحد (Prototype) مبني على إطار الذكاء الاصطناعي (AI).','ai');
  saveGame(true);
}
function boot(){
  resize();
  bindInput();
  $('btnQ').onclick=cycleQuality;
  $('btnCam2').onclick=()=>{resetCam();};
  const bs=$('btnSlice');if(bs)bs.onclick=()=>startSliceTest();
  const ba=$('btnAI');if(ba)ba.onclick=()=>startAITest();
  const glz=$('gl');
  if(glz)glz.addEventListener('wheel',e=>{
    if(!G.started||G.over||G.paused)return;
    e.preventDefault();
    const d=clamp(E3.camDist+(e.deltaY>0?0.3:-0.3),CFG.camDistMin,CFG.camDistMax);
    if(d!==E3.camDist){E3.camDist=d;}
  },{passive:false});
  const se=$('sens');
  if(se){se.value=String(IN.sens);
    se.addEventListener('input',()=>{IN.sens=clamp(parseFloat(se.value)||1,0.3,2.5);});
    se.addEventListener('mousedown',e=>e.stopPropagation());}
  if(!E3.ok)init3D();
  if(!E3.ok){
    $('noGL').classList.remove('hide');
    const b=$('btnNew'),c=$('btnCont'),m=$('btnMode');
    if(b)b.disabled=true;if(c)c.disabled=true;if(m)m.disabled=true;
  }
  syncModeUI();
  $('btnNew').onclick=()=>startGame(true);
  $('btnCont').onclick=()=>startGame(false);
  $('btnHelp').onclick=()=>{$('menu').classList.add('hide');$('help').classList.remove('hide');};
  $('btnHelpBack').onclick=()=>{$('help').classList.add('hide');$('menu').classList.remove('hide');};
  $('btnPauseHelp').onclick=()=>{$('pause').classList.add('hide');$('help').classList.remove('hide');
    $('btnHelpBack').onclick=()=>{$('help').classList.add('hide');$('pause').classList.remove('hide');};};
  $('btnResume').onclick=togglePause;
  $('btnSave').onclick=()=>{if(typeof UI!=='undefined'&&UI.openSaveLoad)UI.openSaveLoad('pause');else saveGame(false);};
  $('btnQuit').onclick=()=>location.reload();
  if(typeof UI!=='undefined'){
    UI.init();
    const bset=$('btnSettings');if(bset)bset.onclick=()=>UI.openSettings('pause');
    const bload=$('btnLoad');if(bload)bload.onclick=()=>UI.openSaveLoad('pause');
    const bmset=$('btnSetM');if(bmset)bmset.onclick=()=>UI.openSettings('menu');
  }
  const bc=$('btnCont');
  if(hasSave()){bc.style.opacity=1;bc.title='متابعة آخر حفظ';}
  else{bc.style.opacity=.35;bc.title='لا يوجد حفظ';}
  if(window.speechSynthesis){try{speechSynthesis.getVoices();}catch(e){}}
  applyQuality();
  syncModeUI();
  $('hint').innerHTML='<kbd>WASD</kbd> حركة باتجاه نظرك &nbsp; <b>الماوس</b> للنظر &nbsp; <kbd>E</kbd> تفاعل (انظر إلى العنصر) &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';
  requestAnimationFrame(loop);
}
/* THREE ENGINE MARKER */
/* =====================================================================
   3D ENGINE  (Three.js r160, vendored locally — no CDN at runtime)
   The tile grid stays the single source of truth: collision, AI,
   pathfinding, anomalies and story are unchanged. Only the
   presentation layer becomes real 3D.
   ===================================================================== */
const E3={
  pitchT:-0.05, movedByMouse:false,
  ok:false, renderer:null, scene:null, camera:null, world:null,
  sprites:[], poolLights:[], flash:null, flashTarget:null,
  yaw:Math.PI/2, pitch:-0.04, bob:0, quality:2, view:'ots', camSnap:true,
  camDist:2.7,
  builtFor:null, waterMat:null, wheel:null, wheelGondolas:[],
  soldierTorch:null, charRig:null, disposables:[], frame:0, focusRing:null
};

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
  t.colorSpace=(THREE.SRGBColorSpace||3001);
  t.needsUpdate=true;
  TEXCACHE[k]=t;return t;
}
function getTexAlpha(key,size){
  const k='a_'+key+'@'+(size||128);
  if(TEXCACHE[k])return TEXCACHE[k];
  const c=texCanvas(size||128,TEXDEF[key]||TEXDEF.treeA);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  t.colorSpace=(THREE.SRGBColorSpace||3001);
  t.needsUpdate=true;
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
  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:7,d:8}},
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
  const t=new THREE.CanvasTexture(c);t.colorSpace=(THREE.SRGBColorSpace||3001);
  SIGNTEX[k]=t;return t;
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
  if(e.type==='ai')return rigHumanoid({scale:1.03,cloth:0x37474a,skin:0x6f6154,dark:0x232d2f,eyes:0xff5a3c,hunch:true});
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
    const glc=$('gl')||document.createElement('canvas');
    E3.glCanvas=glc;
    E3.renderer=new THREE.WebGLRenderer({canvas:glc,antialias:E3.quality>1,powerPreference:'high-performance',
      alpha:false,depth:true,stencil:false,preserveDrawingBuffer:true});
  }catch(err){E3.lastErr=String(err&&err.message||err);return false;}
  const R=E3.renderer;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,E3.quality===2?1.4:(E3.quality===1?1:0.75)));
  R.setSize(VW,VH,false);
  R.shadowMap.enabled=E3.quality>0;
  R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.outputColorSpace=(THREE.SRGBColorSpace||3001);
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
  E3.moon=new THREE.DirectionalLight(0x93a7c4,0);
  E3.moon.position.set(-26,34,-18);
  E3.moon.castShadow=false;
  E3.scene.add(E3.moon);
  E3.flash=new THREE.SpotLight(0xffecc8,15,34,0.54,0.5,1.6);
  E3.flash.castShadow=E3.quality>0;
  E3.flash.shadow.mapSize.width=E3.flash.shadow.mapSize.height=E3.quality>1?1024:512;
  E3.flash.shadow.camera.near=0.3;E3.flash.shadow.camera.far=28;
  E3.flash.shadow.camera.fov=62;
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
  if(!E3.ok)return;
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
  /* atmosphere — per-scene override (ENV.atmo) else indoor/outdoor default */
  const AT=s.atmo||{};
  E3.scene.fog.density=AT.fog!=null?AT.fog:(s.indoor?0.075:0.040);
  E3.hemi.intensity=AT.hemi!=null?AT.hemi:(s.indoor?0.11:0.38);
  E3.amb.intensity=AT.amb!=null?AT.amb:(s.indoor?0.045:0.10);
  const BG=AT.bg!=null?AT.bg:(s.indoor?0x0a0d13:0x161c26);
  if(E3.moon){const mi=AT.moon!=null?AT.moon:(s.indoor?0:0.24);
    E3.moon.intensity=mi;E3.moon.visible=mi>0;}
  E3.scene.background=new THREE.Color(BG);
  E3.scene.fog.color.set(AT.fogColor!=null?AT.fogColor:BG);
  E3.yaw=IN.aim;
  E3.camSnap=true;
}

/* ---------------- per-frame 3D update ---------------- */
/* Player Controller foundation: ground level under (x,z).
   The shipped world is flat (every floor sits at y=0); this single hook is
   where future stairs / multi-storey / falling terrain will plug in. */
function groundHeight(x,z){
  const s=G.scene;
  if(!s)return 0;
  return 0;
}
function solidAt3(x,y,h){
  const s=G.scene;if(!s)return true;
  return solidT(getT(s.g,Math.floor(x),Math.floor(y)));
}
function update3D(dt){
  const s=G.scene,P=G.player;
  if(!E3.ok)return;
  if(!s||!P){
    E3.renderer.render(E3.scene,E3.camera);
    IN.lookX=IN.lookY=0;
    return;
  }
  build3D(false);
  if(!E3.world)return;
  E3.frame++;
  /* ---- mouse look: raw deltas orbit the camera around the player ---- */
  if(IN.lookX||IN.lookY){
    const k=0.0025*IN.sens;
    IN.aim=((IN.aim-IN.lookX*k)%TAU+TAU)%TAU;
    E3.pitchT=clamp(E3.pitchT+IN.lookY*0.0019*IN.sens,CFG.camPitchMin,CFG.camPitchMax);
    IN.lookX=0;IN.lookY=0;
  }
  /* smooth vertical interpolation toward the clamped pitch target */
  E3.pitch=lerp(E3.pitch,E3.pitchT,1-Math.pow(0.00002,dt));
  P.face=IN.aim;
  /* ---- third-person camera: behind the player's back (no first-person) ---- */
  const eye=P.py+(P.crouch?1.06:1.64);          // player eye height above feet
  const px=P.x, pz=P.y, py=P.py;
  const cam=E3.camera;
  const ca=Math.cos(IN.aim),sa=Math.sin(IN.aim);
  const dist=P.hidden?0.45:E3.camDist;          // pull in tight while hiding
  const side=CFG.camShoulder;
  const up=1.95+(dist-CFG.camDistDefault)*0.16; // height eases with distance
  /* desired orbit position: behind + over the right shoulder + above */
  const dx=px-ca*dist-sa*side;
  const dz=pz-sa*dist+ca*side;
  const dy=py+up;
  /* camera collision: march from the player's head toward the desired spot and
     stop just before the first solid sample -> the camera never enters a wall */
  const hx=px, hy=py+eye*0.92, hz=pz;
  let cx=dx,cy=dy,cz=dz;
  const steps=16;
  for(let i=1;i<=steps;i++){
    const t=i/steps;
    if(solidAt3(lerp(hx,dx,t),lerp(hz,dz,t),lerp(hy,dy,t))){
      const k=(i-1)/steps;                 // stop at the last safe sample
      cx=lerp(hx,dx,k);cy=lerp(hy,dy,k);cz=lerp(hz,dz,k);
      break;
    }
  }
  /* final safety: never rest inside a wall — retreat to the player's head */
  if(solidAt3(cx,cz,cy)){cx=hx;cy=hy;cz=hz;}
  /* smooth interpolation: damp the position toward the collision-adjusted target
     (frame-rate independent). No head-bob -> the camera is stable while moving. */
  if(E3.camSnap){cam.position.set(cx,cy,cz);E3.camSnap=false;}
  else{
    const fk=1-Math.pow(CFG.camFollow,dt);
    cam.position.x=lerp(cam.position.x,cx,fk);
    cam.position.y=lerp(cam.position.y,cy,fk);
    cam.position.z=lerp(cam.position.z,cz,fk);
    if(solidAt3(cam.position.x,cam.position.z,cam.position.y))cam.position.set(cx,cy,cz);
  }
  /* orientation: look at a point ahead of the player (over-the-shoulder framing) */
  const lookY=py+eye*0.92-E3.pitch*2.4;
  cam.lookAt(px+ca*3.2,lookY,pz+sa*3.2);
  cam.rotation.z=0;                              // no roll, no movement shake
  cam.fov=68;
  /* screen shake (replaces the old 2D camera update) */
  if(G.shakeT>0){
    G.shakeT-=dt;
    const a=G.shakeA*(G.shakeT>0?G.shakeT:0);
    cam.shakeX=(Math.random()*2-1)*a;cam.shakeY=(Math.random()*2-1)*a;
  }else{cam.shakeX=cam.shakeY=0;}
  if(cam.shakeX||cam.shakeY){
    cam.position.x+=cam.shakeX*0.022;
    cam.position.y+=cam.shakeY*0.022;
    cam.rotation.z+=cam.shakeX*0.0016;
    /* screen shake must never push the camera into a wall */
    if(solidAt3(cam.position.x,cam.position.z,cam.position.y))cam.position.set(cx,cy,cz);
  }
  cam.updateProjectionMatrix();
  /* ---- flashlight ---- */
  const fl=E3.flash;
  if(P.flash&&P.bat>0&&!P.hidden){
    const dirX=Math.cos(IN.aim),dirZ=Math.sin(IN.aim);
    const ox=px+dirX*0.35, oz=pz+dirZ*0.35, oy=eye-0.18;
    fl.position.set(ox,oy,oz);
    /* aim at the GROUND a few steps ahead — the cone must light the walkable
       surface, not the horizon (night navigation stays readable) */
    const ty=clamp(0.35+(0.06-E3.pitch)*3.0,0.1,2.2);
    E3.flashTarget.position.set(ox+dirX*6.5,ty,oz+dirZ*6.5);
    const pw=0.55+0.45*(P.bat/CFG.batMax);
    let fi=15*pw*(0.96+Math.random()*0.08);
    if(P.bat<CFG.batMax*0.2)fi*=0.5+0.5*Math.abs(Math.sin(G.time*7.3));  // dying battery
    fl.intensity=fi;
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
      pl.distance=Math.max(4,L.r*1.7);
      pl.intensity=Math.max(0,(L.a||0.2)*26*a);
      pl.decay=1.9;
      pl.castShadow=false;
    }else{
      const e=c.torch;
      pl.position.set(e.x,1.55,e.y);
      pl.color.setHex(0xffe6bb);
      pl.distance=13;
      pl.intensity=5.5+Math.random()*0.9;
      pl.decay=1.9;
    }
  }
  /* ---- sprites ---- */
  const cullD=54;
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
  pr.visible=!P.hidden&&!P.dead;
  if(pr.visible){
    /* hide the body only if the camera is pulled uncomfortably close */
    const cd=cam.position.distanceTo?cam.position.distanceTo(pr.position):99;
    if(cd<0.9)pr.visible=false;
  }
  /* ---- Animation System (Phase 9): apply the blended pose from the FSM ---- */
  const ap=(typeof ANIM!=='undefined'&&ANIM.pose)?ANIM.pose:null;
  pr.position.set(P.x,py+(ap?(ap.rootY||0):0),P.y);
  pr.rotation.y=-(P.modelYaw!=null?P.modelYaw:IN.aim)-Math.PI/2;
  pr.rotation.z=ap?(ap.rootRoll||0):0;
  if(ap){
    const aCr=ap.crouch||0;
    if(pu.legs){pu.legs[0].rotation.x=ap.legL||0;pu.legs[1].rotation.x=ap.legR||0;}
    if(pu.arms){pu.arms[0].rotation.x=ap.armL||0;pu.arms[1].rotation.x=ap.armR||0;}
    if(pu.torso){pu.torso.rotation.x=-(ap.torsoLean||0);pu.torso.rotation.y=ap.torsoTwist||0;
      pu.torso.position.y=1.20+(ap.torsoY||0)-0.24*aCr;}
    if(pu.head){pu.head.position.y=1.75+(ap.headY||0)-0.24*aCr;pu.head.rotation.x=ap.headTilt||0;}
    pr.scale.y=(ap.scaleY!=null?ap.scaleY:1);
  }else{
    /* fallback (ANIM not ready): the original simple cycle */
    const st=P.anim||'idle';
    let amp=0,freq=0,armAmp=0;
    if(st==='walk'){amp=0.55;freq=9.0;armAmp=0.50;}
    else if(st==='sprint'){amp=0.85;freq=13.5;armAmp=0.75;}
    else if(st==='crouch'){amp=0.40;freq=6.5;armAmp=0.35;}
    const breath=st==='idle'?Math.sin(G.time*1.6)*0.035:0;
    const pw=amp>0?Math.sin(G.time*freq)*amp:breath;
    if(pu.legs){pu.legs[0].rotation.x=pw;pu.legs[1].rotation.x=-pw;}
    if(pu.arms){pu.arms[0].rotation.x=-pw*armAmp;pu.arms[1].rotation.x=pw*armAmp;}
    const crouchDrop=P.crouch?-0.24:0;
    if(pu.torso)pu.torso.position.y=1.20+crouchDrop+Math.abs(pw)*0.03+breath*0.5;
    if(pu.head)pu.head.position.y=1.75+crouchDrop+breath*0.5;
    pr.scale.y=P.crouch?0.86:1;
  }
  /* memory layer tint */
  const fogC=E3.scene.fog.color;
  if(G.echo>0.35){
    const k=(G.echo-0.35)*0.5;
    fogC.setRGB(0.02+k*0.10,0.024+k*0.06,0.035+k*0.02);
  }
  /* ---- interaction focus indicator: a glowing ring on what you can use ---- */
  if(!E3.focusRing){
    E3.focusRing=new THREE.Mesh(new THREE.TorusGeometry(0.46,0.05,6,26),
      new THREE.MeshBasicMaterial({color:new THREE.Color(0x9fe8d8),transparent:true,opacity:0,
        blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    E3.focusRing.rotation.x=Math.PI/2;E3.focusRing.visible=false;
    E3.scene.add(E3.focusRing);
  }
  const fr=E3.focusRing;
  const fc=(typeof curInt!=='undefined')?curInt:null;
  if(fc&&!P.hidden&&!G.paused&&!G.over){
    const rx=fc.type==='door'?fc.x+0.5:fc.x, rz=fc.type==='door'?fc.y+0.5:fc.y;
    fr.visible=true;
    fr.position.set(rx,0.13+Math.sin(G.time*3)*0.02,rz);
    const pulse=0.5+0.5*Math.sin(G.time*4);
    fr.material.opacity=0.28+0.24*pulse;
    fr.scale.setScalar(1+0.07*pulse);
  }else{fr.visible=false;fr.material.opacity=0;}
  E3.renderer.render(E3.scene,E3.camera);
}
function render3D(){
  if(!E3.ok)return;
  update3D(G.dt||0.016);
  note3DFrame();
  mirror3D();
}
/* auto quality: protect slow devices from the 3D renderer */
function note3DFrame(){
  const d=G.dt||0.016;
  if(d<=0||d>0.12)return;
  E3.ftSum=(E3.ftSum||0)+d;E3.ftN=(E3.ftN||0)+1;
  if(E3.ftN<90)return;
  const fps=E3.ftN/E3.ftSum;
  E3.ftSum=0;E3.ftN=0;
  if(fps<25&&E3.quality>0){
    E3.quality--;applyQuality();syncModeUI();
    toast('خُفّضت الجودة تلقائيًا','قياس ≈ '+Math.round(fps)+' إطار/ث — اضغط G للتغيير');
  }else if(fps>57&&E3.quality<2&&(E3.ftGood=(E3.ftGood||0)+1)>=4){
    E3.ftGood=0;E3.quality++;applyQuality();syncModeUI();
    toast('رُفعت الجودة','الأداء يسمح — '+['منخفضة','متوسطة','عالية'][E3.quality]);
  }else if(fps<=57){E3.ftGood=0;}
}
function syncModeUI(){
  $('btnQ').textContent='الجودة: '+['منخفضة','متوسطة','عالية'][E3.quality];
  const b=$('btnCam2');
  if(b)b.textContent='كاميرا: خلف الظهر • المسافة '+E3.camDist.toFixed(1);
}
function mirror3D(){
  try{
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.drawImage(E3.renderer.domElement,0,0,cv.width,cv.height);
  }catch(e){}
}
function resetCam(){
  E3.camDist=CFG.camDistDefault;
  E3.pitchT=clamp(E3.pitchT,CFG.camPitchMin,CFG.camPitchMax);
  E3.camSnap=true;
  syncModeUI();
  toast('أُعيد ضبط الكاميرا','خلف الظهر • المسافة '+E3.camDist.toFixed(1)+' • عجلة الفأرة للتقريب/التبعيد');
}
function cycleQuality(){
  E3.quality=(E3.quality+1)%3;
  applyQuality();
  syncModeUI();
  const n=['منخفضة','متوسطة','عالية'][E3.quality];
  toast('الجودة: '+n,E3.quality===0?'بدون ظلال — أسرع':'ظلال '+((E3.quality>1)?'1024':'512'));
}

boot();/* ---- Phase 6: Puzzle Framework ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;INVUI.open=false;PZUI.open=false;G.paused=false;}
function face(c,ox,oy){
  G.player.x=c.x+(ox||0);G.player.y=c.y+(oy==null?0.6:oy);
  IN.aim=Math.atan2(c.y-G.player.y,c.x-G.player.x);
  IN.movedByMouse=true;G.player.hidden=false;updateHint();return curInt;
}
const SB=()=>SCENES.slice_bld;
const node=sid=>SB().ints.find(i=>i.step===sid&&i.puzzle==='pz_lockbox');
const body=()=>$('pzBody');
const kids=()=>body().children.slice();
const byClass=c=>kids().find(x=>x.className===c);
const byText=t=>kids().find(x=>(x.innerHTML||'').indexOf(t)>=0);
function reset(){G.pz={};G.flags={};G.items={};G.echo=0;closeAll();}

/* ============ 0. framework surface ============ */
chk(typeof PUZZLES==='object','PUZZLES registry present');
chk(typeof defPuzzle==='function','defPuzzle() present');
chk(typeof PZUI==='object','PZUI state present');
['def','state','step','stepSolved','solved','requireMet','nodeState','node','open','close','check','submit','advance','reward']
  .forEach(fn=>chk(typeof PZ[fn]==='function','PZ.'+fn+'()'));

/* ============ 1. demo puzzle is registered with a multi-step chain ============ */
const lp=PZ.def('pz_lockbox');
chk(!!lp,'demo puzzle "pz_lockbox" registered');
chk(lp.steps.length===3,'demo puzzle has 3 chained steps');
chk(lp.steps.map(s=>s.id).join(',')==='clue_drawing,lockbox,cabinet','step order is the chain');
chk(lp.steps[0].kind==='inspect'&&lp.steps[1].kind==='code'&&lp.steps[2].kind==='answer','steps use different mechanics');
chk(!!lp.onComplete,'puzzle has an onComplete event hook');

/* ============ 2. world-bound nodes exist ============ */
chk(!!node('clue_drawing')&&!!node('lockbox')&&!!node('cabinet'),'all three chain nodes are placed in the world (slice_bld)');
chk(node('clue_drawing').type==='puzzle','nodes are interactables of type "puzzle"');

/* ============ 3. gating: clue first, then code, then item-locked cabinet ============ */
reset();
chk(PZ.nodeState('pz_lockbox','clue_drawing')==='active','step 1 (clue) is active at start');
chk(PZ.nodeState('pz_lockbox','lockbox')==='locked','step 2 (code) is locked before the clue is found');
chk(PZ.nodeState('pz_lockbox','cabinet')==='locked','step 3 (cabinet) is locked before the key exists');
chk(PZ.requireMet('pz_lockbox',PZ.step('pz_lockbox','cabinet')).kind==='item','cabinet is gated by an ITEM (item unlocks location C)');
chk(PZ.requireMet('pz_lockbox',PZ.step('pz_lockbox','lockbox')).kind==='step','lockbox is gated by a previous STEP');

/* ============ 4. locked node refuses & explains (in-world) ============ */
enterScene('slice_bld',SB().spawn,{silent:true});reset();
face(node('cabinet'),0,0.6);
chk(INTERACT.prompt(curInt).indexOf('تحتاج')>=0,'locked node prompt says what it needs ("'+INTERACT.prompt(curInt)+'")');
doInteract();
chk(PZUI.open===false,'interacting with a locked node does not open the puzzle');
face(node('lockbox'),0,0.6);
chk(INTERACT.prompt(curInt).indexOf('ليس بعد')>=0,'step-locked node prompt says "not yet"');

/* ============ 5. STEP 1 — find clue A (inspect) via world interaction ============ */
face(node('clue_drawing'),0,0.6);
chk(curInt&&curInt.step==='clue_drawing','clue node is focusable');
doInteract();
chk(PZUI.open===true&&PZUI.sid==='clue_drawing','interacting opens the puzzle panel at the clue step');
chk(byText('تحقّق'),'panel renders a check action');
PZ.submit();
chk(PZUI.solved===true,'inspect step solves on submit');
chk(byClass('pzClue'),'solved step reveals its clue text');
chk(!!byText('تابع'),'a continue button follows the clue');
PZ.advance();
chk(PZ.stepSolved('pz_lockbox','clue_drawing'),'clue step recorded as solved');
chk(G.flags.pz_drawing===true,'clue reward flag applied');
chk((G.objective||'').indexOf('الصندوق')>=0,'clue reward set the next objective (points to location B)');
chk(PZUI.open===false,'panel closed after advancing');

/* ============ 6. STEP 2 — puzzle B (code) : wrong then right ============ */
chk(PZ.nodeState('pz_lockbox','lockbox')==='active','code step unlocked after the clue');
PZ.open('pz_lockbox','lockbox');
chk(!!byClass('pzPad'),'code step renders a keypad');
chk(!!byClass('pzCode'),'code step renders digit slots');
/* click keypad: 0 0 0 -> wrong */
function press(d){const pad=byClass('pzPad');pad.children.slice().find(x=>x.innerHTML===d).onclick();}
press('0');press('0');press('0');
chk(PZUI.input.join('')==='000','keypad clicks build the entered code');
PZ.submit();
chk(PZUI.solved===false,'wrong code does not solve');
chk(!!byClass('pzMsg'),'wrong code shows a failure message');
chk(!PZ.stepSolved('pz_lockbox','lockbox'),'wrong code did not mark the step solved');
/* now the right code 314 */
PZ.open('pz_lockbox','lockbox');
press('3');press('1');press('4');
PZ.submit();
chk(PZUI.solved===true,'correct code solves the step');
PZ.advance();
chk(PZ.stepSolved('pz_lockbox','lockbox'),'code step recorded solved');
chk(INV.has('lockbox_key'),'solving puzzle B gave the KEY item (reward)');
chk((G.objective||'').indexOf('المطبخ')>=0,'reward pointed to location C (kitchen)');

/* ============ 7. STEP 3 — location C unlocked by the item, answer mechanic, final event ============ */
chk(PZ.nodeState('pz_lockbox','cabinet')==='active','cabinet unlocked once the key is held');
const echoBefore=G.echo,anomBefore=G.stats.anomalies;
PZ.open('pz_lockbox','cabinet');
chk(!!byClass('pzOpts'),'answer step renders options');
/* wrong option */
byClass('pzOpts').children.slice().find(x=>x.innerHTML.indexOf('هلال')>=0).onclick();
chk(PZUI.sel==='moon','clicking an option selects it');
PZ.submit();
chk(PZUI.solved===false,'wrong answer does not solve');
/* right option */
PZ.open('pz_lockbox','cabinet');
byClass('pzOpts').children.slice().find(x=>x.innerHTML.indexOf('شمس')>=0).onclick();
PZ.submit();
chk(PZUI.solved===true,'correct answer solves the final step');
PZ.advance();
chk(PZ.solved('pz_lockbox')===true,'whole puzzle chain is solved');
chk(G.flags.pz_cabinet===true,'final step reward flag applied');
chk(G.echo>=0.45,'onComplete fired a world event (echo bumped)');
chk((G.objective||'').indexOf('الشارع')>=0,'final clue leads back to an earlier location (the street)');

/* ============ 8. solved nodes report "done" in-world ============ */
face(node('clue_drawing'),0,0.6);
chk(INTERACT.prompt(curInt).indexOf('تمّ')>=0,'a solved node prompt shows "done"');
doInteract();
chk(PZUI.open===false,'a solved node does not re-open the puzzle');

/* ============ 9. MODULARITY — add a brand-new puzzle (new mechanic) with zero engine edits ============ */
reset();
defPuzzle({id:'pz_test',name:'لغز اختبار',steps:[
  {id:'seq',kind:'sequence',solution:['a','b'],question:'رتّب الرمزين',clue:'تمّ الترتيب',
   options:[{id:'a',label:'أول'},{id:'b',label:'ثان'},{id:'c',label:'ثالث'}],
   reward:{flag:'pzTestDone',item:'batteries'}}
]});
chk(!!PZ.def('pz_test'),'a newly registered puzzle exists');
PZ.node({puzzle:'pz_test',step:'seq'});
chk(PZUI.open&&PZUI.id==='pz_test','new puzzle opens through the same node() entry point');
chk(!!byClass('pzSeq')||!!byClass('pzOpts'),'sequence step renders its picker');
const opts=byClass('pzOpts');
opts.children.slice().find(x=>x.innerHTML==='أول').onclick();
byClass('pzOpts').children.slice().find(x=>x.innerHTML==='ثان').onclick();
chk(PZUI.input.join(',')==='a,b','sequence input recorded in order');
PZ.submit();
chk(PZUI.solved===true,'custom sequence puzzle solved');
PZ.advance();
chk(G.flags.pzTestDone===true&&INV.has('batteries'),'custom puzzle reward applied (flag + item)');
chk(PZ.solved('pz_test'),'custom puzzle fully solved');

/* ============ 10. SAVE / LOAD persists puzzle progress ============ */
reset();
enterScene('slice_bld',SB().spawn,{silent:true});
PZ.node(node('clue_drawing'));PZ.submit();PZ.advance();      // solve step 1
chk(PZ.stepSolved('pz_lockbox','clue_drawing'),'step solved before saving');
saveGame(true);
const raw=localStorage.getItem(SAVEKEY);
chk(raw&&raw.indexOf('clue_drawing')>=0,'save data contains puzzle progress');
G.pz={};                                                       // wipe live progress
loadGame();
chk(PZ.stepSolved('pz_lockbox','clue_drawing'),'puzzle progress restored from save');
chk(PZ.nodeState('pz_lockbox','lockbox')==='active','restored progress re-unlocks the next step');

console.log(fails?('\n'+fails+' FAILURES'):'\nPUZZLE FRAMEWORK SUITE OK');
