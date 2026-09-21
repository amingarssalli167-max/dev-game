import re
P='/home/user/chernobyl/index.html'
s=open(P,encoding='utf-8').read()
orig=s

subs=[
# 1) dedicated WebGL canvas (a canvas cannot host both a 2D and a WebGL context)
("""<canvas id="cv"></canvas>
<canvas id="fx"></canvas>""",
 """<canvas id="cv"></canvas>
<canvas id="gl" style="display:none"></canvas>
<canvas id="fx"></canvas>"""),

# 2) use it
("""    E3.renderer=new THREE.WebGLRenderer({canvas:cv,antialias:E3.quality>1,powerPreference:'high-performance'});""",
 """    const glc=$('gl')||document.createElement('canvas');
    E3.glCanvas=glc;
    E3.renderer=new THREE.WebGLRenderer({canvas:glc,antialias:E3.quality>1,powerPreference:'high-performance',
      alpha:false,depth:true,stencil:false,preserveDrawingBuffer:true});"""),

# 3) resize gl canvas too
("""  if(typeof E3!=='undefined'&&E3.ok&&E3.renderer){
    E3.renderer.setSize(VW,VH,false);""",
 """  if(typeof E3!=='undefined'&&E3.ok&&E3.renderer){
    E3.renderer.setSize(VW,VH,false);
    if(E3.glCanvas){E3.glCanvas.style.width=VW+'px';E3.glCanvas.style.height=VH+'px';}"""),

# 4) shadow camera fov + exposure
("""  E3.flash.shadow.camera.near=0.3;E3.flash.shadow.camera.far=28;
  E3.flash.shadow.bias=-0.0016;""",
 """  E3.flash.shadow.camera.near=0.3;E3.flash.shadow.camera.far=28;
  E3.flash.shadow.camera.fov=62;
  E3.flash.shadow.bias=-0.0016;"""),

# 5) dimmer, moodier light units (three.js physical-ish attenuation)
("""    fl.intensity=26*pw*(0.97+Math.random()*0.06);""",
 """    fl.intensity=11*pw*(0.96+Math.random()*0.08);"""),
("""  E3.flash=new THREE.SpotLight(0xfff0d2,26,30,0.50,0.42,1.7);""",
 """  E3.flash=new THREE.SpotLight(0xffecc8,11,30,0.46,0.45,1.7);"""),
("""      pl.intensity=Math.max(0,(L.a||0.2)*46*a);""",
 """      pl.intensity=Math.max(0,(L.a||0.2)*26*a);
      pl.decay=1.9;"""),
("""      pl.distance=13;
      pl.intensity=9+Math.random()*1.5;""",
 """      pl.distance=13;
      pl.intensity=5.5+Math.random()*0.9;
      pl.decay=1.9;"""),
("""      pl.distance=Math.max(4,L.r*1.5);""",
 """      pl.distance=Math.max(4,L.r*1.7);"""),
("""  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:9,d:8}},""",
 """  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:5,d:8}},"""),

# 6) never render Alexei's own body into the first-person camera
("""  pr.visible=(E3.view!=='fps')&&!P.hidden;""",
 """  pr.visible=(E3.view!=='fps')&&!P.hidden&&!P.dead;
  if(pr.visible&&E3.view==='ots'){
    const cd=cam.position.distanceTo?cam.position.distanceTo(pr.position):0;
    pr.visible=cd>1.15;
  }"""),

# 7) mode switch: swap canvases
("""    G.mode3d=true;E3.builtFor=null;
    build3D(true);
    applyQuality();""",
 """    G.mode3d=true;E3.builtFor=null;
    build3D(true);
    applyQuality();
    showCanvas3D(true);"""),
("""    G.mode3d=false;
    if(E3.ok){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);}""",
 """    G.mode3d=false;
    showCanvas3D(false);
    if(E3.ok){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);}"""),
("""  /* try 3D first, fall back to the 2.5D renderer */
  if(init3D()){G.mode3d=true;applyQuality();}""",
 """  /* try 3D first, fall back to the 2.5D renderer */
  if(init3D()){G.mode3d=true;applyQuality();showCanvas3D(true);}"""),

# 8) helper
("""function mirror3D(){""",
 """function showCanvas3D(on){
  const g=$('gl');if(!g)return;
  g.style.display=on?'block':'none';
  cv.style.display=on?'none':'block';
}
function mirror3D(){"""),

# 9) quality button label matches the default
("""<button id="btnQ">الجودة: عالية</button>""",
 """<button id="btnQ">الجودة: متوسطة</button>"""),

# 10) renderPost must not double-draw when 3D is on: mirror already put the frame on cv
("""function render3D(){
  if(!E3.ok||!G.mode3d)return;
  update3D(G.dt||0.016);
  mirror3D();
}""",
 """function render3D(){
  if(!E3.ok||!G.mode3d)return;
  update3D(G.dt||0.016);
  mirror3D();
}
function renderMenu3D(){
  if(!E3.ok||!G.mode3d||!G.scene)return;
  update3D(0.016);
}"""),
]
miss=0
for x,y in subs:
    if x not in s:
        miss+=1;print('MISS:',repr(x[:70]))
    else:
        s=s.replace(x,y,1)

open(P,'w',encoding='utf-8').write(s)
js=re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open('/tmp/game.js','w',encoding='utf-8').write(js)
print('patched, misses:',miss,'bytes',len(s))
