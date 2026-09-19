#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, sys
P = "/home/user/chernobyl/index.html"
s = io.open(P, encoding="utf-8").read()
orig = len(s.encode("utf-8"))
misses = []
def rep(tag, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        misses.append((tag, n)); print("MISS      %-34s found=%d expected=%d" % (tag, n, count)); return
    s = s.replace(old, new); print("ok        %s" % tag)

# ---------- 1. ANIM module + states (before the player-update section) ----------
ANIM_BLOCK = r"""/* =====================================================================
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

"""
rep("ANIM module + states",
    "/* =====================================================================\n   UPDATE — player\n   ===================================================================== */\nfunction updatePlayer(dt){",
    ANIM_BLOCK + "/* =====================================================================\n   UPDATE — player\n   ===================================================================== */\nfunction updatePlayer(dt){")

# ---------- 2. tick ANIM in the loop (after the player controller) ----------
rep("loop tick",
    "  updatePlayer(dt);\n  updateEnts(dt);",
    "  updatePlayer(dt);\n  if(typeof ANIM!=='undefined')ANIM.update(dt,G.player);\n  updateEnts(dt);")

# ---------- 3. interaction one-shots ----------
rep("doInteract hook",
    "  INTERACT.run(c);\n  updateHint();\n}\nfunction tryFinal(c){",
    "  INTERACT.run(c);\n  if(typeof ANIM!=='undefined')ANIM.playInteraction(c);\n  updateHint();\n}\nfunction tryFinal(c){")

# ---------- 4. renderer reads the blended pose (original kept as fallback) ----------
OLD_RENDER = """  pr.position.set(P.x,py,P.y);
  pr.rotation.y=-(P.modelYaw!=null?P.modelYaw:IN.aim)-Math.PI/2;
  /* ---- animation state machine: idle / walk / sprint / crouch ---- */
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
  pr.scale.y=P.crouch?0.86:1;"""
NEW_RENDER = """  /* ---- Animation System (Phase 9): apply the blended pose from the FSM ---- */
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
  }"""
rep("renderer pose apply", OLD_RENDER, NEW_RENDER)

io.open(P, "w", encoding="utf-8").write(s)
print("bytes %d -> %d" % (orig, len(s.encode("utf-8"))))
print("MISSES: %d" % len(misses))
if misses:
    print("FAILED:", misses); sys.exit(1)
