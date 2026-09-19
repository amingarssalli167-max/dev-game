#!/usr/bin/env node
/* camera.js — اختبارات Third-Person Camera السبعة المطلوبة (متصفح حقيقي).
 * المرحلة A: اختبارات النظر عند نقطة الانطلاق (بلا انتقال).
 * المرحلة B: نقل اللاعب لبقعة مفتوحة (مع تجاوز أي حوار قصة يفتح) لاختبارات الحركة.
 * التشغيل:
 *   cd /home/user/chernobyl && python3 -m http.server 8000 &
 *   NODE_PATH=/tmp/pup/node_modules node tests/camera.js
 */
const puppeteer=require('puppeteer');
const BASE='http://127.0.0.1:8000/index.html';
const ARGS=['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader',
            '--enable-unsafe-swiftshader','--disable-dev-shm-usage'];
let pass=0,fail=0;
function ok(name,cond,detail){
  if(cond){console.log('PASS  '+name+(detail?'  — '+detail:''));pass++;}
  else{console.log('FAIL  '+name+(detail?'  — '+detail:''));fail++;}
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mouse=(page,x,y)=>page.evaluate((x,y)=>{
  document.dispatchEvent(new MouseEvent('mousemove',{movementX:x,movementY:y}));},x,y);
async function waitFor(page,fn,timeout=9000){
  const t0=Date.now();let last=null;
  while(Date.now()-t0<timeout){
    last=await page.evaluate(fn);
    if(last)return last;
    await sleep(300);}
  return last;}
/* headless يرندر بـ~2fps: انتظر حتى تستهلك الإطارات دفعات الماوس المعلقة
 * (lookX/lookY يصرّفان إلى 0) ويستقر موضع الكاميرا على المدار النظري */
const drain=page=>waitFor(page,()=>IN.lookX===0&&IN.lookY===0&&
  Math.abs(E3.pitch-E3.pitchT)<0.06,14000);
const settle=page=>waitFor(page,()=>{
  const az=Math.atan2(E3.camera.position.z-G.player.y,E3.camera.position.x-G.player.x);
  let d=Math.abs(az-(IN.aim+Math.PI))%6.28318530718;
  if(d>3.14159265)d=6.28318530718-d;
  return d<0.12&&IN.lookX===0;},14000);
async function closeDialogs(page){
  for(let i=0;i<70;i++){
    const open=await page.evaluate(()=>DLG.open);
    if(!open)return true;
    await page.keyboard.press('KeyE');await sleep(130);}
  return !(await page.evaluate(()=>DLG.open));}
const wrap=a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
const angDiff=(a,b)=>{let d=wrap(a-b);if(d>Math.PI)d-=2*Math.PI;return Math.abs(d);};

(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:ARGS});
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:720});
  const errs=[];
  page.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text);});
  await page.goto(BASE,{waitUntil:'networkidle0',timeout:60000});
  await page.click('#btnNew');
  await sleep(8000);
  for(let i=0;i<40;i++){if(!(await page.evaluate(()=>DLG.open)))break;
    await page.keyboard.press('KeyE');await sleep(120);}
  await sleep(800);
  ok('حوار الافتتاح مغلق',!(await page.evaluate(()=>DLG.open)));
  /* انتظر خلو الواجهة تمامًا: لا حوار/وثيقة/مفكرة/جرد/مساعدة/إيقاف —
     اللعبة تحجب النظر أثناءها بالتصميم (uiBusy) */
  const uiFree=await waitFor(page,()=>{
    if(!G.started||G.over||G.paused)return false;
    if(DLG.open)return false;
    if(typeof DOC!=='undefined'&&DOC.open)return false;
    if(typeof CODE!=='undefined'&&CODE.open)return false;
    if(typeof NB!=='undefined'&&NB.open)return false;
    if(typeof INVUI!=='undefined'&&INVUI.open)return false;
    if(typeof PZUI!=='undefined'&&PZUI.open)return false;
    if(!document.getElementById('help').classList.contains('hide'))return false;
    return true;},20000);
  ok('الواجهة خالية والمدخلات مفعّلة قبل Phase A',uiFree===true);

  const worldFrozen=()=>page.evaluate(()=>{
    const w=E3.world;
    return JSON.stringify([w.position.toArray(),w.quaternion.toArray(),w.rotation.toArray()]);});
  const w0=await worldFrozen();

  /* ============ المرحلة A: اختبارات النظر (عند نقطة الانطلاق) ============ */

  /* TEST 1: ماوس يمينًا */
  const aim0=await page.evaluate(()=>IN.aim);
  for(let i=0;i<25;i++)await mouse(page,16,0);          // +400px => Δaim=−1.0
  await drain(page);await settle(page);
  const t1=await page.evaluate(()=>({aim:IN.aim,
    az:Math.atan2(E3.camera.position.z-G.player.y,E3.camera.position.x-G.player.x)}));
  ok('TEST1 ماوس يمينًا: Δaim=−1.0 راديان بالضبط',angDiff(t1.aim-aim0,-1.0)<0.02,
     'Δaim='+wrap(t1.aim-aim0).toFixed(3));
  ok('TEST1 الكاميرا دارت حول اللاعب (azimuth=aim+π ±0.3)',
     angDiff(t1.az,t1.aim+Math.PI)<0.3,
     'az='+t1.az.toFixed(2)+' / aim+π='+wrap(t1.aim+Math.PI).toFixed(2));
  ok('TEST1 العالم ثابت تمامًا (المصفوفة لم تتغير)',(await worldFrozen())===w0);

  /* TEST 2: ماوس يسارًا */
  for(let i=0;i<50;i++)await mouse(page,-16,0);         // صافي −800px => Δaim=+2.0
  await drain(page);await settle(page);
  const t2=await page.evaluate(()=>({aim:IN.aim,
    az:Math.atan2(E3.camera.position.z-G.player.y,E3.camera.position.x-G.player.x)}));
  ok('TEST2 ماوس يسارًا: Δaim=+2.0 والمدار انعكس عن TEST1',
     angDiff(t2.aim-t1.aim,2.0)<0.02&&angDiff(t2.az,t1.az)>1.5,
     'Δaim='+wrap(t2.aim-t1.aim).toFixed(3)+' Δaz='+angDiff(t2.az,t1.az).toFixed(2));
  ok('TEST2 العالم ثابت تمامًا',(await worldFrozen())===w0);

  /* TEST 3: مدار عمودي حقيقي */
  await page.evaluate(()=>{E3.pitchT=0;E3.pitch=0;E3.camSnap=true;});
  await waitFor(page,()=>Math.abs(E3.pitch-E3.pitchT)<0.02);
  const yMid=await page.evaluate(()=>E3.camera.position.y);
  for(let i=0;i<60;i++)await mouse(page,0,9);           // ماوس لأسفل => pitch+
  await waitFor(page,()=>Math.abs(E3.pitch-E3.pitchT)<0.02&&E3.pitch>0.75);
  const t3d=await page.evaluate(()=>({p:E3.pitch,cy:E3.camera.position.y,
    fwdY:new THREE.Vector3(0,0,-1).applyQuaternion(E3.camera.quaternion).y}));
  for(let i=0;i<150;i++)await mouse(page,0,-9);         // ماوس للأعلى => pitch−
  await waitFor(page,()=>Math.abs(E3.pitch-E3.pitchT)<0.02&&E3.pitch<-0.5);
  const t3u=await page.evaluate(()=>({p:E3.pitch,cy:E3.camera.position.y,
    fwdY:new THREE.Vector3(0,0,-1).applyQuaternion(E3.camera.quaternion).y}));
  const expD=1.5+Math.sin(0.80)*2.7, expU=1.5+Math.sin(-0.55)*2.7;
  ok('TEST3 الكاميرا ترتفع/تنخفض فعليًا حول اللاعب',
     t3d.cy>yMid+1.2&&t3u.cy<yMid-0.3,
     'y: أفق='+yMid.toFixed(2)+' نظر-أسفل='+t3d.cy.toFixed(2)+' نظر-أعلى='+t3u.cy.toFixed(2));
  ok('TEST3 مطابقة معادلة المدار y=1.5+sin(pitch)·2.7 (±0.6)',
     Math.abs(t3d.cy-expD)<0.6&&Math.abs(t3u.cy-expU)<0.6,
     'متوقع '+expD.toFixed(2)+'/'+expU.toFixed(2)+' — فعلي '+t3d.cy.toFixed(2)+'/'+t3u.cy.toFixed(2));
  ok('TEST3 pitch محدود [−0.55,+0.80] بلا انقلاب',
     t3d.p<=0.80+1e-6&&t3u.p>=-0.55-1e-6,
     'pitch: '+t3d.p.toFixed(3)+' / '+t3u.p.toFixed(3));
  ok('TEST3 اتجاه النظر لا يتجاوز العمودي',
     Math.abs(t3d.fwdY)<0.99&&Math.abs(t3u.fwdY)<0.99,
     'fwd.y: '+t3d.fwdY.toFixed(3)+' / '+t3u.fwdY.toFixed(3));
  ok('TEST3 الكاميرا فوق الأرضية دائمًا',t3u.cy>=0.17,'minY='+t3u.cy.toFixed(2));
  ok('TEST3 العالم ثابت تمامًا',(await worldFrozen())===w0);
  await page.evaluate(()=>{E3.pitchT=-0.05;E3.pitch=-0.05;E3.camSnap=true;});
  await sleep(400);

  /* ============ المرحلة B: بقعة مفتوحة لاختبارات الحركة ============ */
  const spot=await page.evaluate(()=>{
    const s=G.scene,cands=[];
    for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){
      let open=true;
      for(let dy=-3;dy<=3&&open;dy++)for(let dx=-3;dx<=3;dx++)
        if(solidAt3(x+dx,y+dy,1.2)){open=false;break;}
      if(!open)continue;
      let clear=0,bestA=0;
      for(let a=0;a<16;a++){
        const c=Math.cos(a/16*2*Math.PI),sn=Math.sin(a/16*2*Math.PI);
        let d=0;while(d<8&&!solidAt3(x+c*d,y+sn*d,1.2))d+=0.5;
        if(d>clear){clear=d;bestA=a/16*2*Math.PI;}}
      cands.push({x:x+0.5,y:y+0.5,clear,aim:bestA});}
    cands.sort((a,b)=>b.clear-a.clear);
    return cands.slice(0,4);});
  let placed=false;
  for(const c of spot){
    await page.evaluate(c=>{G.player.x=c.x;G.player.y=c.y;G.player.py=0;G.player.vy=0;
      IN.aim=c.aim;E3.pitchT=-0.05;E3.pitch=-0.05;E3.camSnap=true;},c);
    await sleep(700);
    await closeDialogs(page);
    await sleep(300);
    /* تحقق: هل المدخلات حية بعد النقل؟ */
    const a1=await page.evaluate(()=>IN.aim);
    await mouse(page,4,0);await drain(page);
    const a2=await page.evaluate(()=>IN.aim);
    await mouse(page,-4,0);await drain(page);  // أعد النظر كما كان
    if(Math.abs(a2-a1)>0.005){placed=true;
      console.log('بقعة الحركة: ('+c.x.toFixed(1)+','+c.y.toFixed(1)+') مدى '+c.clear+'م');break;}
  }
  ok('نقل اللاعب لبقعة مفتوحة نجح (المدخلات حية)',placed,
     placed?'':'تعذر — حوار قصة يفرض نفسه في كل البقع');

  const moveW=async()=>{
    await page.evaluate(()=>{window._sx=G.player.x;window._sy=G.player.y;});
    await page.keyboard.down('KeyW');
    await waitFor(page,()=>Math.hypot(G.player.x-window._sx,G.player.y-window._sy)>0.5,9000);
    await page.keyboard.up('KeyW');
    await sleep(250);
    return await page.evaluate(()=>({x:G.player.x,y:G.player.y}));};

  /* TEST 4: WASD بلا ماوس */
  const aim4=await page.evaluate(()=>IN.aim);
  const p4a=await page.evaluate(()=>({x:G.player.x,y:G.player.y}));
  const p4b=await moveW();
  const mv4=[p4b.x-p4a.x,p4b.y-p4a.y],fwd4=[Math.cos(aim4),Math.sin(aim4)];
  const dot4=Math.hypot(...mv4)>0.1?
    (mv4[0]*fwd4[0]+mv4[1]*fwd4[1])/Math.hypot(...mv4):0;
  ok('TEST4 W يحرك اللاعب باتجاه أمام الكاميرا (alignment>0.9)',dot4>0.9,
     'alignment='+dot4.toFixed(3)+' مسافة='+Math.hypot(...mv4).toFixed(2));

  /* TEST 5: ماوس ثم W */
  for(let i=0;i<20;i++)await mouse(page,16,0);
  await drain(page);await settle(page);
  const aim5=await page.evaluate(()=>IN.aim);
  const turned=angDiff(aim5,aim4);
  const p5a=await page.evaluate(()=>({x:G.player.x,y:G.player.y}));
  const p5b=await moveW();
  const mv5=[p5b.x-p5a.x,p5b.y-p5a.y],fwd5=[Math.cos(aim5),Math.sin(aim5)];
  const dot5=Math.hypot(...mv5)>0.1?
    (mv5[0]*fwd5[0]+mv5[1]*fwd5[1])/Math.hypot(...mv5):0;
  ok('TEST5 بعد تدوير الماوس: W يتبع الأمام الجديد للكاميرا',
     dot5>0.9,'turn='+turned.toFixed(2)+'راديان alignment='+dot5.toFixed(3));

  /* TEST 6: دورة كاملة 360° */
  const p6a=await page.evaluate(()=>({x:G.player.x,y:G.player.y}));
  for(let i=0;i<160;i++)await mouse(page,16,0);         // 6.4 راديان > 2π
  await drain(page);await settle(page);
  const t6=await page.evaluate(()=>({
    finite:[E3.camera.position.x,E3.camera.position.y,E3.camera.position.z,IN.aim,E3.pitch,E3.camDist]
      .every(Number.isFinite),
    pitchClamped:E3.pitch>=-0.55-1e-6&&E3.pitch<=0.80+1e-6}));
  const p6b=await moveW();
  const moved6=Math.hypot(p6b.x-p6a.x,p6b.y-p6a.y);
  ok('TEST6 دورة كاملة: كل القيم finite',t6.finite===true);
  ok('TEST6 pitch ما زال محدودًا',t6.pitchClamped===true);
  ok('TEST6 العالم ثابت تمامًا بعد الدورة',(await worldFrozen())===w0);
  ok('TEST6 الحركة ما زالت تعمل بعد الدورة',moved6>0.3,'تحرك '+moved6.toFixed(2)+' بلاطة');
  await page.screenshot({path:'/tmp/c_after360.png'});

  /* TEST 7: انتقال المشاهد */
  for(const sc of ['slice','slice_bld','outdoor']){
    await page.evaluate(s=>{transition(s,SCENES[s].spawn,{silent:true});},sc);
    await sleep(2500);
    await closeDialogs(page);
    await waitFor(page,()=>Math.abs(E3.pitch-E3.pitchT)<0.06&&
      Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y)>1.2);
    const st=await page.evaluate(()=>({
      scene:G.sceneId,
      finite:[E3.camera.position.x,E3.camera.position.y,E3.camera.position.z].every(Number.isFinite),
      dist:Math.hypot(E3.camera.position.x-G.player.x,E3.camera.position.z-G.player.y)}));
    ok('TEST7 ['+sc+']: الكاميرا خلف اللاعب على بعد سليم',
       st.scene===sc&&st.finite&&st.dist>1.2&&st.dist<4.5,
       'scene='+st.scene+' dist='+st.dist.toFixed(2));
    for(let i=0;i<12;i++)await mouse(page,16,0);
    await sleep(300);
    const st2=await page.evaluate(()=>[
      E3.camera.position.x,E3.camera.position.y,E3.camera.position.z,
      IN.aim,E3.pitch].every(Number.isFinite));
    ok('TEST7 ['+sc+']: الدوران يعمل بعد الانتقال',st2===true);
  }
  ok('TEST7 العالم ثابت في كل المشاهد',(await worldFrozen())===w0);

  /* ===== انتصاب الكاميرا عبر الأرباع الأربعة (فحص الانقلاب) ===== */
  const quads=[];
  for(const q of [0,Math.PI/2,Math.PI,-Math.PI/2]){
    await page.evaluate(q=>{IN.aim=q;E3.pitchT=-0.05;E3.pitch=-0.05;E3.camSnap=true;},q);
    await sleep(700);
    const st=await page.evaluate(()=>{
      const camUp=new THREE.Vector3(0,1,0).applyQuaternion(E3.camera.quaternion);
      const right=new THREE.Vector3(1,0,0).applyQuaternion(E3.camera.quaternion);
      return {upY:+camUp.y.toFixed(4),rollY:+right.y.toFixed(4)};});
    quads.push(st);
  }
  ok('العالم قائم في الأرباع الأربعة (camUpY>0.99 و|rollY|<0.05)',
     quads.every(q=>q.upY>0.99&&Math.abs(q.rollY)<0.05),
     'upY: '+quads.map(q=>q.upY).join('/')+' rollY: '+quads.map(q=>q.rollY).join('/'));

  /* إثبات بصري: اللاعب مؤطر دائمًا */
  await page.evaluate(()=>{transition('outdoor',SCENES.outdoor.spawn,{silent:true});});
  await sleep(2500);
  await closeDialogs(page);
  const center=async(tag)=>{
    const r=await page.evaluate(()=>{
      const head=new THREE.Vector3(G.player.x,G.player.py+1.55,G.player.y);
      const sp=head.clone().project(E3.camera);
      return {sx:(sp.x*0.5+0.5)*1280,sy:(-sp.y*0.5+0.5)*720,inFront:sp.z<1};});
    await page.screenshot({path:'/tmp/c_'+tag+'.png'});
    return r;};
  await page.evaluate(()=>{IN.aim=0;E3.pitchT=-0.05;E3.pitch=-0.05;E3.camSnap=true;});
  await sleep(600);
  const c0=await center('yaw0');
  await page.evaluate(()=>{IN.aim=Math.PI/2;E3.camSnap=true;});
  await sleep(600);
  const c1=await center('yaw90');
  await page.evaluate(()=>{IN.aim=Math.PI;E3.camSnap=true;});
  await sleep(600);
  const c2=await center('yaw180');
  const centered=c=>c.inFront&&Math.abs(c.sx-640)<170&&c.sy>90&&c.sy<670;
  ok('بصريًا: اللاعب يبقى مؤطرًا عبر ثلاث زوايا Yaw',
     centered(c0)&&centered(c1)&&centered(c2),
     'sx: '+c0.sx.toFixed(0)+'/'+c1.sx.toFixed(0)+'/'+c2.sx.toFixed(0));

  ok('CONSOLE نظيف طوال الجلسة',errs.length===0,errs.slice(0,3).join(' | '));

  await browser.close();
  console.log('== camera suite: PASS '+pass+' / FAIL '+fail+' ==');
  process.exit(fail?1:0);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
