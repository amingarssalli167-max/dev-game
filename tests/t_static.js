#!/usr/bin/env node
/* t_static.js — فحوص مصدرية صرفة (بلا متصفح) لإصلاحات DEBUG هذه الجلسة.
 * التشغيل: node tests/t_static.js
 * يفشل (exit 1) إذا غاب أي إصلاح أو تكرر بطريقة خاطئة. */
const fs=require('fs'),path=require('path');
const S=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let pass=0,fail=0;
function chk(name,needle,count){
  const c=S.split(needle).length-1;
  if(c===count){console.log('PASS  '+name+'  (×'+c+')');pass++;}
  else{console.log('FAIL  '+name+'  وجد ×'+c+' والمتوقع ×'+count);fail++;}
}
console.log('== t_static: إصلاحات الجلسة حاضرة في index.html ==');

/* 1) ROOT CAUSE #1: نسخ إطار العالم #cv إلى الطبقة المرئية #fx في renderPost */
chk('blit العالم cv→fx في renderPost','fctx.drawImage(cv,0,0,VW,VH);',1);

/* 2) حواجز NaN بعد E3.frame++ في update3D (aim/pitchT/pitch/camDist) */
chk('حارس NaN aim','if(!isFinite(IN.aim))IN.aim=0;',1);
chk('حارس NaN pitchT','if(!isFinite(E3.pitchT))E3.pitchT=-0.05;',1);
chk('حارس NaN pitch','if(!isFinite(E3.pitch))E3.pitch=E3.pitchT;',1);
chk('حارس NaN camDist','if(!isFinite(E3.camDist))E3.camDist=CFG.camDistDefault;',1);

/* 3) addLook يرفض dx/dy غير finite */
chk('addLook يرفض غير finite','if(!isFinite(dx)||!isFinite(dy))return;',1);

/* 4) ROOT CAUSE #2: تصحيح اتجاه المثلثات (winding) — 8 مواضع */
chk('أرضية تواجه الأعلى','B.quad(fm,[x,0,y+1],[x+w,0,y+1],[x+w,0,y],[x,0,y],q);',1);
chk('سياج شرقي','else if(dx===1&&dy===0)B.quad(mat,[x+1,y1,y],[x+1,y1,y+1],[x+1,y0,y+1],[x+1,y0,y],0.95);',1);
chk('سياج غربي','else B.quad(mat,[x,y1,y+1],[x,y1,y],[x,y0,y],[x,y0,y+1],0.95);',1);
chk('جدار شرقي','{dx:1,dy:0,q:(a,b2)=>[[x+1,b2,y],[x+1,b2,y+1],[x+1,a,y+1],[x+1,a,y]],sh:0.90},',1);
chk('جدار غربي','{dx:-1,dy:0,q:(a,b2)=>[[x,b2,y+1],[x,b2,y],[x,a,y],[x,a,y+1]],sh:0.80},',1);
chk('سطح يواجه الأعلى',"B.quad(inf.roof?'roof':'concrete',[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[x,h,y],0.78);",1);
chk('سقف داخلي يواجه الأسفل',"B.quad('plaster',[x,h,y],[x+1,h,y],[x+1,h,y+1],[x,h,y+1],0.60);",1);
chk('ماء يطابق normal العلوي','P.push(wc[0],0.07,wc[1]+1, wc[0]+1,0.07,wc[1]+1, wc[0]+1,0.07,wc[1], wc[0],0.07,wc[1]);',1);

/* 5) معايرة الإضاءة الفيزيائية (THREE r160 useLegacyLights=false) */
chk('كشّاف: شدة 2000/مدى 60/decay 1.3','new THREE.SpotLight(0xffecc8,2000,60,0.54,0.5,1.3);',1);
chk('كشّاف: fi=2000*pw','let fi=2000*pw*(0.96+Math.random()*0.08);',1);
chk('كشّاف: تصويب 4.5م','E3.flashTarget.position.set(ox+dirX*4.5,ty,oz+dirZ*4.5);',1);
chk('قمر 0.38','(s.indoor?0:0.38);',1);
chk('برك الضوء 220/1.5','pl.intensity=Math.max(0,(L.a||0.2)*220*a);',1);
chk('توهج النار 70','light:{c:0xff8a2a,i:70,d:9}',1);

/* 6) كونسول نظيف: favicon */
chk('favicon data-URI','<link rel="icon" href="data:,">',1);

/* 7) إصلاح Third-Person Camera: مدار كروي حقيقي بلا تدوير العالم */
chk('مدار كروي (cos(pitch) أفقيًا + sin(pitch) رأسيًا)',
    'const cp=Math.cos(E3.pitch);\n  const dx=px-ca*dist*cp-sa*side;',1);
chk('lookAt نحو اللاعب (وليس نقطة تدور على 3.2م)',
    'cam.lookAt(px+ca*0.55,py+eye*0.92,pz+sa*0.55);',1);
chk('حارس الأرضية: الكاميرا لا تغوص تحت y=0.18','cy=Math.max(cy,0.18);',1);
chk('الجسم يحمل اتجاهه عند السكون','/* idle: the body HOLDS its facing — only movement rotates the character */',1);
chk('انتظار لا دوران للعالم أبدًا (لا يوجد world.rotation يتبع الماوس)',
    'E3.world.rotation.y=',0);

/* 7b) إصلاح انقلاب العالم: لا كتابة في cam.rotation بعد lookAt إطلاقًا */
chk('لا يوجد أي cam.rotation.z= بعد lookAt (مصدر الانقلاب 180°)','cam.rotation.z=',0);
chk('تحذير التوثيق بجوار lookAt','NEVER touch cam.rotation after lookAt',1);
chk('اهتزاز roll عبر rotateZ المحلي المحدود','cam.rotateZ(cam.shakeX*0.0016);',1);

/* 7) ثوابت القصة الحرجة لم تُمسّ */
chk('كشف ملف نهاية الجزء الأول','PROJECT ZERO WAS CREATED TO REPRODUCE HIM',2);
chk('SUBJECT ALEXEI VOLKOV','VOLKOV, ALEXEI',2);

console.log('== النتيجة: PASS '+pass+' / FAIL '+fail+' ==');
process.exit(fail?1:0);
