import re, io, sys

P='/home/user/chernobyl/index.html'
s=open(P,encoding='utf-8').read()
a=open('/home/user/chernobyl/_3d_a.js',encoding='utf-8').read()
b=open('/home/user/chernobyl/_3d_b.js',encoding='utf-8').read()

if 'THREE ENGINE MARKER' not in s:
    assert '\nboot();' in s
    s=s.replace('\nboot();', '\n/* THREE ENGINE MARKER */\n'+a+'\n'+b+'\nboot();',1)
    print('inserted 3D engine')
else:
    print('already inserted (skip)')

subs=[
("""  updateHint();
  render();
  renderPost(dt);
  acc+=dt;if(acc>25){acc=0;saveGame(true);}""",
 """  updateHint();
  if(G.mode3d&&E3.ok){render3D();renderPost(dt);}
  else{render();renderPost(dt);}
  audioDynamic(dt);
  acc+=dt;if(acc>25){acc=0;saveGame(true);}"""),

("""  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open){
    G.time+=dt*0.15;
    if(G.scene){render();renderPost(dt);}
    return;
  }""",
 """  if(G.paused||DLG.open||DOC.open||CODE.open||NB.open){
    G.time+=dt*0.15;
    if(G.scene){
      if(G.mode3d&&E3.ok){update3D(dt*0.25);mirror3D();}
      else render();
      renderPost(dt);
    }
    return;
  }"""),

("""  cv.style.width=fx.style.width=VW+'px';cv.style.height=fx.style.height=VH+'px';
}""",
 """  cv.style.width=fx.style.width=VW+'px';cv.style.height=fx.style.height=VH+'px';
  if(typeof E3!=='undefined'&&E3.ok&&E3.renderer){
    E3.renderer.setSize(VW,VH,false);
    if(E3.camera){E3.camera.aspect=VW/VH;E3.camera.updateProjectionMatrix();}
  }
}"""),

("""  PARTICLES_RESET();""",
 """  PARTICLES_RESET();
  if(typeof E3!=='undefined')E3.builtFor=null;"""),

("""      case 'KeyM':openNb();NB.tab='map';renderNb();break;""",
 """      case 'KeyM':openNb();NB.tab='map';renderNb();break;
      case 'KeyV':if(G.mode3d)toggleView();else toast('اضغط B أولًا لتشغيل 3D','');break;
      case 'KeyB':setMode3D(!G.mode3d);break;
      case 'KeyG':cycleQuality();break;"""),

("""function boot(){
  resize();
  bindInput();""",
 """function boot(){
  resize();
  bindInput();
  $('btn3D').onclick=()=>setMode3D(true);
  $('btn2D').onclick=()=>setMode3D(false);
  $('btnCam').onclick=()=>{if(G.mode3d)toggleView();else setMode3D(true);};
  $('btnQ').onclick=cycleQuality;
  $('btnMode').onclick=()=>setMode3D(!G.mode3d);"""),

("""  $('hint').innerHTML='<kbd>WASD</kbd>""",
 """  /* 3D is the default engine; 2.5D stays as a fallback / low-end option */
  if(init3D()){G.mode3d=true;applyQuality();}
  else{G.mode3d=false;toast('3D غير متاح على هذا الجهاز','سيتم التشغيل بمحرّك 2.5D');}
  $('btn3D').classList.toggle('on',G.mode3d);
  $('btn2D').classList.toggle('on',!G.mode3d);
  $('btnMode').textContent='المحرّك: '+(G.mode3d?'3D':'2.5D');
  $('hint').innerHTML='<kbd>WASD</kbd>"""),

("""function audioBed(){""",
 """function audioDynamic(dt){
  if(!A.ready||!A.on)return;
  const t=A.ctx.currentTime,th=G.threat||0;
  try{
    A.wind.f.frequency.setTargetAtTime((G.scene&&G.scene.indoor?250:470)+th*420,t,0.4);
    A.master.gain.setTargetAtTime(G.paused?0.25:0.85+th*0.12,t,0.5);
  }catch(e){}
}
function audioBed(){"""),
]
for x,y in subs:
    if x not in s:
        print('MISS:',x[:60].replace('\n','|'));continue
    s=s.replace(x,y,1)

# hint line with the new keys
old_hint="""  $('hint').innerHTML='<kbd>WASD</kbd> حركة &nbsp; <kbd>E</kbd> تفاعل &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>Esc</kbd> إيقاف';"""
new_hint="""  $('hint').innerHTML='<kbd>WASD</kbd> حركة &nbsp; <kbd>E</kbd> تفاعل &nbsp; <kbd>F</kbd> كشاف &nbsp; <kbd>H</kbd> اختباء &nbsp; <kbd>R</kbd> راديو &nbsp; <kbd>Tab</kbd> دفتر &nbsp; <kbd>V</kbd> كاميرا &nbsp; <kbd>B</kbd> 3D/2.5D &nbsp; <kbd>G</kbd> جودة &nbsp; <kbd>Esc</kbd> إيقاف';"""
if old_hint in s:
    s=s.replace(old_hint,new_hint,1)
else:
    print('MISS hint')

# add mirror3D helper right after render3D definition
if 'function mirror3D(' not in s:
    s=s.replace("""function setMode3D(on,silent){""",
"""function mirror3D(){
  try{
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.drawImage(E3.renderer.domElement,0,0,cv.width,cv.height);
  }catch(e){}
}
function setMode3D(on,silent){""",1)
    s=s.replace("""  update3D(G.dt||0.016);
  /* mirror the WebGL frame into the 2D canvas so glitch post-FX still work */
  try{
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.drawImage(E3.renderer.domElement,0,0,cv.width,cv.height);
  }catch(e){}
}""","""  update3D(G.dt||0.016);
  mirror3D();
}""",1)

open(P,'w',encoding='utf-8').write(s)
js=re.search(r'<script>\n(.*)\n</script>', s, re.S).group(1)
open('/tmp/game.js','w',encoding='utf-8').write(js)
print('written bytes',len(s),'js',len(js))
