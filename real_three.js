/* real three.min.js (r160 UMD) loaded in Node; WebGLRenderer faked (no GL).
   Everything else — Color, lights, fog, scene graph, camera math — is REAL,
   so this run catches stub-vs-browser drift. */
const __T=require('/home/user/chernobyl/three.min.js');
global.THREE=Object.assign({},__T);
global.THREE.WebGLRenderer=class{
  constructor(o){this.domElement={width:300,height:300,style:{},addEventListener(){}};this.shadowMap={};}
  setPixelRatio(){}setSize(){}render(){}dispose(){}};
