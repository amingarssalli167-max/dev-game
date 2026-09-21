# -*- coding: utf-8 -*-
# _patch_p12b.py — Phase 12b: NIGHT VISIBILITY CALIBRATION (hotfix)
# User-reported: screen reads as black. Screenshot analysis: scene renders,
# fires glow (10k warm px), but 91% of pixels sit at luminance 4-64/255.
# Fixes:
#  E1 moonlight (DirectionalLight, outdoor only, no shadows)
#  E2 brighter night defaults (hemi/amb/fog/bg) — dark but readable
#  E3 flashlight: aims at the GROUND ahead (was horizon), stronger, wider,
#     off while hiding, dying-battery flicker
#  E4 crash-site fire lights boosted
#  E5 fire sprite glow light boosted
#  E6 softer vignette (55% -> 42% edge crush)
import io

P = '/home/user/chernobyl/index.html'
s = io.open(P, encoding='utf-8').read()
n = 0

def rep(old, new):
    global s, n
    assert s.count(old) == 1, 'ANCHOR FAIL (%d matches): %r' % (s.count(old), old[:90])
    s = s.replace(old, new)
    n += 1

# ------------------------------------------------------------------ E1
# moonlight
rep('''  E3.amb=new THREE.AmbientLight(0x9fb2bb,0.05);
  E3.scene.add(E3.amb);''',
'''  E3.amb=new THREE.AmbientLight(0x9fb2bb,0.05);
  E3.scene.add(E3.amb);
  E3.moon=new THREE.DirectionalLight(0x93a7c4,0);
  E3.moon.position.set(-26,34,-18);
  E3.moon.castShadow=false;
  E3.scene.add(E3.moon);''')

# ------------------------------------------------------------------ E3a
# flashlight: stronger + wider cone (creation params)
rep("  E3.flash=new THREE.SpotLight(0xffecc8,11,30,0.46,0.45,1.7);",
    "  E3.flash=new THREE.SpotLight(0xffecc8,15,34,0.54,0.5,1.6);")

# ------------------------------------------------------------------ E2
# night defaults: readable dark, lighter fog so silhouettes read, moon per scene
rep('''  const AT=s.atmo||{};
  E3.scene.fog.density=AT.fog!=null?AT.fog:(s.indoor?0.085:0.048);
  E3.hemi.intensity=AT.hemi!=null?AT.hemi:(s.indoor?0.085:0.20);
  E3.amb.intensity=AT.amb!=null?AT.amb:(s.indoor?0.028:0.05);
  const BG=AT.bg!=null?AT.bg:(s.indoor?0x030406:0x05070c);''',
'''  const AT=s.atmo||{};
  E3.scene.fog.density=AT.fog!=null?AT.fog:(s.indoor?0.075:0.040);
  E3.hemi.intensity=AT.hemi!=null?AT.hemi:(s.indoor?0.11:0.38);
  E3.amb.intensity=AT.amb!=null?AT.amb:(s.indoor?0.045:0.10);
  const BG=AT.bg!=null?AT.bg:(s.indoor?0x0a0d13:0x161c26);
  if(E3.moon){const mi=AT.moon!=null?AT.moon:(s.indoor?0:0.24);
    E3.moon.intensity=mi;E3.moon.visible=mi>0;}''')

# ------------------------------------------------------------------ E3b
# flashlight: aim at the ground a few steps ahead; off while hidden; flicker
rep('''  const fl=E3.flash;
  if(P.flash&&P.bat>0){
    const dirX=Math.cos(IN.aim),dirZ=Math.sin(IN.aim);
    const ox=px+dirX*0.35, oz=pz+dirZ*0.35, oy=eye-0.18;
    fl.position.set(ox,oy,oz);
    const pit=0.06-E3.pitch;                     // flashlight tilts with the camera
    E3.flashTarget.position.set(ox+dirX*6,oy+pit*6,oz+dirZ*6);
    const pw=0.55+0.45*(P.bat/CFG.batMax);
    fl.intensity=11*pw*(0.96+Math.random()*0.08);
    fl.visible=true;
  }else{fl.visible=false;fl.intensity=0;}''',
'''  const fl=E3.flash;
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
  }else{fl.visible=false;fl.intensity=0;}''')

# ------------------------------------------------------------------ E4
# crash-site fires glow harder (they are the opening's landmark)
rep("  s.lights.push({x:22.5,y:22.5,r:7,c:'rgba(255,150,60,',a:.30,flick:.35,fire:true});",
    "  s.lights.push({x:22.5,y:22.5,r:8,c:'rgba(255,150,60,',a:.46,flick:.35,fire:true});")
rep("  s.lights.push({x:24.6,y:20.4,r:3.4,c:'rgba(255,120,40,',a:.22,flick:.4,fire:true});",
    "  s.lights.push({x:24.6,y:20.4,r:3.4,c:'rgba(255,120,40,',a:.34,flick:.4,fire:true});")
rep("  s.lights.push({x:31,y:34,r:6,c:'rgba(255,210,170,',a:.16,flick:.25,fire:true});",
    "  s.lights.push({x:31,y:34,r:6,c:'rgba(255,210,170,',a:.22,flick:.25,fire:true});")

# ------------------------------------------------------------------ E5
# fire sprite's own glow light
rep("  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:5,d:8}},",
    "  fire:{k:'bb',t:'fire',w:1.5,h:1.5,add:true,light:{c:0xff8a2a,i:7,d:8}},")

# ------------------------------------------------------------------ E6
# softer vignette: keep the edges dark, stop crushing them to black
rep("  #vig{position:absolute;inset:0;pointer-events:none;z-index:19;\n    background:radial-gradient(120% 100% at 50% 50%,rgba(0,0,0,0) 40%,rgba(0,0,0,.55) 100%)}",
'''  #vig{position:absolute;inset:0;pointer-events:none;z-index:19;
    background:radial-gradient(120% 100% at 50% 50%,rgba(0,0,0,0) 46%,rgba(0,0,0,.42) 100%)}''')

io.open(P, 'w', encoding='utf-8').write(s)
print('PATCH_P12B_OK edits=%d bytes=%d' % (n, len(s.encode('utf-8'))))
