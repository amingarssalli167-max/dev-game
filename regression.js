#!/usr/bin/env node
/* regression.js — جلسة رجعية كاملة داخل متصفح حقيقي (Chrome headless + SwiftShader).
 * يشغّل اللعبة الفعلية من خادم محلي على المنفذ 8000 ويتحقق من كل معايير القبول.
 *
 * التشغيل (يتطلب puppeteer — مثبت عادة في /tmp/pup):
 *   cd /home/user/chernobyl && python3 -m http.server 8000 &
 *   NODE_PATH=/tmp/pup/node_modules node tests/regression.js
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
  ok('حوار الافتتاح تجاوزه اللاعب',!(await page.evaluate(()=>DLG.open)));

  /* — الكونسول — */
  ok('لا أخطاء JS/كونسول (بعد الإقلاع)',errs.length===0,errs.slice(0,3).join(' | '));

  /* — العالم مرئي (بكسليًا) — */
  const shot=async()=>{const b=await page.screenshot({encoding:'binary'});
    return b.toString('base64');};
  await page.screenshot({path:'/tmp/r_outdoor.png'});
  const met=await page.evaluate(()=>({scene:G.sceneId,ok:E3.ok,
    cam:E3.camera.position.toArray().map(x=>+x.toFixed(1))}));
  ok('المشهد الافتتاحي outdoor',met.scene==='outdoor'&&met.ok===true,JSON.stringify(met));

  /* — الأرضية موجودة وتواجه الأعلى (raycast في outdoor وslice) — */
  const floorOK=await page.evaluate(()=>{
    const rc=new THREE.Raycaster();
    let px=G.player.x,py=G.player.y,sx=px+2,sy=py;
    outer:for(let r0=2;r0<6;r0++)for(let a=0;a<12;a++){
      const x=px+Math.cos(a/12*6.283)*r0,y=py+Math.sin(a/12*6.283)*r0;
      if(!solidAt3(x,y,0.4)){sx=x;sy=y;break outer;}}
    rc.set(new THREE.Vector3(sx,5,sy),new THREE.Vector3(0,-1,0));rc.far=20;
    const h=rc.intersectObjects(E3.scene.children,true)[0];
    if(!h)return false;
    const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);
    return (5-h.distance)<0.6&&n.y>0.9;});
  ok('أرضية outdoor: y≈0 وnormal للأعلى',floorOK===true);

  /* — Mouse Look: رياضيات دقيقة — */
  const a0=await page.evaluate(()=>IN.aim);
  await page.evaluate(()=>{for(let i=0;i<25;i++)
    document.dispatchEvent(new MouseEvent('mousemove',{movementX:16,movementY:0}));});
  /* headless ~2fps: انتظر استهلاك الدفعة المعلقة قبل القياس */
  const _t0=Date.now();
  while(Date.now()-_t0<14000&&!(await page.evaluate(()=>IN.lookX===0&&IN.lookY===0)))
    await sleep(300);
  const a1=await page.evaluate(()=>IN.aim);
  ok('Mouse Look: دلتا aim = −1.000±0.02 راديان',Math.abs((a1-a0)-(-1.0))<0.02,
     (a1-a0).toFixed(3)+' راديان');

  /* — pitch محدود — */
  const drainP=async()=>{const t=Date.now();
    while(Date.now()-t<14000&&!(await page.evaluate(()=>IN.lookX===0&&IN.lookY===0&&
      Math.abs(E3.pitch-E3.pitchT)<0.06)))await sleep(300);};
  await page.evaluate(()=>{for(let i=0;i<80;i++)
    document.dispatchEvent(new MouseEvent('mousemove',{movementX:0,movementY:9}));});
  await drainP();
  const pMax=await page.evaluate(()=>E3.pitch);
  await page.evaluate(()=>{for(let i=0;i<80;i++)
    document.dispatchEvent(new MouseEvent('mousemove',{movementX:0,movementY:-9}));});
  await drainP();
  const pMin=await page.evaluate(()=>E3.pitch);
  ok('pitch ضمن الحدود',pMax<=0.81&&pMin>=-0.56,(+pMax.toFixed(3))+' / '+(+pMin.toFixed(3)));

  /* — WASD — */
  const p0=await page.evaluate(()=>({x:G.player.x,y:G.player.y}));
  await page.keyboard.down('KeyW');await sleep(1500);await page.keyboard.up('KeyW');
  const p1=await page.evaluate(()=>({x:G.player.x,y:G.player.y}));
  const moved=Math.hypot(p1.x-p0.x,p1.y-p0.y);
  ok('WASD يحرك اللاعب',moved>0.3,moved.toFixed(2)+' بلاطة');

  /* — NaN حقن: لا شيء ينكسر — */
  await page.evaluate(()=>{document.dispatchEvent(new MouseEvent('mousemove',
    {movementX:NaN,movementY:Infinity}));});
  await sleep(250);
  const finite=await page.evaluate(()=>[E3.camera.position.x,E3.camera.position.y,
    E3.camera.position.z,IN.aim,E3.pitch,E3.camDist].every(Number.isFinite));
  ok('حقن NaN/Infinity ⇒ كل القيم تبقى finite',finite===true);

  /* — الكشّاف يضيء الأرض أمام اللاعب (مشروع هندسيًا) — */
  await page.evaluate(()=>{transition('slice',SCENES.slice.spawn,{silent:true});});
  await sleep(4000);
  await page.evaluate(()=>{IN.aim=Math.PI/2;E3.pitchT=0.30;E3.camSnap=true;});
  await sleep(700);
  const proj=await page.evaluate(()=>{
    const wp=new THREE.Vector3(G.player.x+Math.cos(IN.aim)*5,0.02,
      G.player.y+Math.sin(IN.aim)*5);
    const sp=wp.clone().project(E3.camera);
    return {x:Math.round((sp.x*0.5+0.5)*1280),y:Math.round((-sp.y*0.5+0.5)*720)};});
  await page.screenshot({path:'/tmp/r_flash_on.png'});
  const flOn=await page.evaluate(()=>E3.flash.visible);
  await page.keyboard.press('KeyF');await sleep(600);
  await page.screenshot({path:'/tmp/r_flash_off.png'});
  const flOff=await page.evaluate(()=>E3.flash.visible);
  await page.keyboard.press('KeyF');
  ok('مفتاح F يبدّل الكشّاف',flOn===true&&flOff===false);
  const lum=await page.evaluate(async()=>{return true;});
  // قياس البكسلات من اللقطات عبر node (أدناه بالـchild_process? — الأبسط: قياس هنا)
  const {execSync}=require('child_process');
  try{
    const py=`from PIL import Image\nimport numpy as np\n`+
      `on=np.asarray(Image.open('/tmp/r_flash_on.png').convert('RGB')).astype(int)\n`+
      `off=np.asarray(Image.open('/tmp/r_flash_off.png').convert('RGB')).astype(int)\n`+
      `def L(a):return a[:,:,0]*0.299+a[:,:,1]*0.587+a[:,:,2]*0.114\n`+
      `Lon,Lo=L(on),L(off)\n`+
      `x,y=${proj.x},${proj.y}\n`+
      `po=Lon[max(0,y-20):y+20,max(0,x-20):x+20].mean()\n`+
      `pf=Lo[max(0,y-20):y+20,max(0,x-20):x+20].mean()\n`+
      `print(f'{po:.1f} {pf:.1f}')`;
    execSync("python3 -c '"+py.replace(/'/g,"'\\''")+"' > /tmp/r_flash.txt");
    const[po,pf]=fs_read().split(' ').map(Number);
    function fs_read(){return require('fs').readFileSync('/tmp/r_flash.txt','utf8').trim();}
    ok('الكشّاف يضيء الأرض 5م أمام اللاعب (Δ≥20)',(po-pf)>=20,
       'ON '+po.toFixed(1)+' / OFF '+pf.toFixed(1));
  }catch(e){ok('الكشّاف: قياس البكسل',false,e.message.slice(0,80));}

  /* — الأرضية في slice + حجب الجدران — */
  const sliceFloor=await page.evaluate(()=>{
    const rc=new THREE.Raycaster();
    let px=G.player.x,py=G.player.y,sx=px+2,sy=py;
    outer:for(let r0=2;r0<6;r0++)for(let a=0;a<12;a++){
      const x=px+Math.cos(a/12*6.283)*r0,y=py+Math.sin(a/12*6.283)*r0;
      if(!solidAt3(x,y,0.4)){sx=x;sy=y;break outer;}}
    rc.set(new THREE.Vector3(sx,5,sy),new THREE.Vector3(0,-1,0));rc.far=20;
    const h=rc.intersectObjects(E3.scene.children,true)[0];
    if(!h)return false;
    const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);
    return (5-h.distance)<0.6&&n.y>0.9;});
  ok('أرضية slice: y≈0 وnormal للأعلى',sliceFloor===true);
  const occl=await page.evaluate(()=>{
    const rc=new THREE.Raycaster();let hits=0;
    for(let a=0;a<8;a++){
      rc.set(new THREE.Vector3(G.player.x,1.4,G.player.y),
        new THREE.Vector3(Math.cos(a*Math.PI/4),0,Math.sin(a*Math.PI/4)));rc.far=40;
      const h=rc.intersectObjects(E3.world.children,true)[0];
      if(h&&h.distance>1.0)hits++;}
    return hits;});
  ok('الجدران تحجب أفقيًا (≥4 من 8 اتجاهات، بعد إصلاح Winding)',occl>=4,occl+'/8');

  /* — انتقال المشاهد + الداخل — */
  await page.evaluate(()=>{transition('slice_bld',SCENES.slice_bld.spawn,{silent:true});});
  await sleep(4000);
  const sb=await page.evaluate(()=>({s:G.sceneId,ok:E3.ok,
    finite:[E3.camera.position.x,E3.camera.position.y,E3.camera.position.z].every(Number.isFinite)}));
  await page.screenshot({path:'/tmp/r_interior.png'});
  ok('انتقال إلى slice_bld (داخلي)',sb.s==='slice_bld'&&sb.ok===true&&sb.finite===true);
  await page.evaluate(()=>{transition('outdoor',SCENES.outdoor.spawn,{silent:true});});
  await sleep(4000);
  const back=await page.evaluate(()=>({s:G.sceneId,ok:E3.ok}));
  ok('العودة إلى outdoor',back.s==='outdoor'&&back.ok===true);

  /* — الكونسول نهائيًا — */
  ok('الكونسول نظيف طوال الجلسة',errs.length===0,errs.slice(0,3).join(' | '));

  await browser.close();
  console.log('== regression: PASS '+pass+' / FAIL '+fail+' ==');
  process.exit(fail?1:0);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
