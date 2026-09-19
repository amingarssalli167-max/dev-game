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
