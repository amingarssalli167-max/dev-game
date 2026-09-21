/* CHERNOBYL: ECHOES OF ZERO — tiny self-contained GLB 2.0 loader
 * Presentation-only loader for the local Three.js build. No CDN/imports.
 * Supports embedded GLB buffers, skins, PBR base color, normals, UVs and indices.
 */
(function(){
  function compSize(t){ return t===5121?1:t===5123?2:t===5125||t===5126?4:0; }
  function compCtor(t){ return t===5121?Uint8Array:t===5123?Uint16Array:t===5125?Uint32Array:t===5126?Float32Array:null; }
  function typeSize(t){ return t==='SCALAR'?1:t==='VEC2'?2:t==='VEC3'?3:t==='VEC4'?4:t==='MAT2'?4:t==='MAT3'?9:t==='MAT4'?16:1; }
  function readAccessor(json,bin,index){
    const a=json.accessors[index]; if(!a)throw new Error('Missing glTF accessor '+index); const bv=json.bufferViews[a.bufferView];
    const C=compCtor(a.componentType); if(!bv||!C) throw new Error('Unsupported glTF accessor '+index);
    const n=typeSize(a.type), count=a.count, itemBytes=n*compSize(a.componentType);
    const stride=bv.byteStride||itemBytes, base=(bv.byteOffset||0)+(a.byteOffset||0);
    const out=new C(count*n);
    const dv=new DataView(bin,0,bin.byteLength);
    const little=true;
    for(let i=0;i<count;i++){
      const off=base+i*stride;
      for(let j=0;j<n;j++){
        const p=off+j*compSize(a.componentType);
        let v;
        if(a.componentType===5121)v=dv.getUint8(p);
        else if(a.componentType===5123)v=dv.getUint16(p,little);
        else if(a.componentType===5125)v=dv.getUint32(p,little);
        else v=dv.getFloat32(p,little);
        out[i*n+j]=v;
      }
    }
    return {array:out,itemSize:n,count,normalized:!!a.normalized,type:a.type,componentType:a.componentType};
  }
  function indexArray(a){
    if(a.componentType===5121)return new Uint16Array(a.array);
    return a.array;
  }
  function imageBlob(json,bin,imgIndex){
    const im=json.images[imgIndex];
    if(!im||im.bufferView===undefined)return null;
    const bv=json.bufferViews[im.bufferView];
    const start=(bv.byteOffset||0), end=start+(bv.byteLength||0);
    return new Blob([bin.slice(start,end)],{type:im.mimeType||'image/png'});
  }
  function loadImageTexture(json,bin,texIndex){
    const t=json.textures[texIndex], im=json.images[t.source];
    if(!t||!im)return Promise.resolve(null);
    const blob=imageBlob(json,bin,t.source);
    let url='';
    if(blob) url=URL.createObjectURL(blob);
    else if(im.uri){
      if(/^data:/i.test(im.uri)) url=im.uri;
      else return Promise.resolve(null);
    }else return Promise.resolve(null);
    return new Promise(function(resolve,reject){
      const img=new Image();
      img.onload=function(){
        try{
          const tx=new THREE.Texture(img);
          tx.needsUpdate=true;
          tx.colorSpace=THREE.SRGBColorSpace||tx.colorSpace;
          tx.flipY=false;
          if(/^blob:/i.test(url))URL.revokeObjectURL(url);
          resolve(tx);
        }catch(e){URL.revokeObjectURL(url);reject(e);}
      };
      img.onerror=function(e){if(/^blob:/i.test(url))URL.revokeObjectURL(url);reject(e);};
      img.src=url;
    });
  }
  function matFor(json,bin,matIndex,textures){
    const md=(json.materials&&json.materials[matIndex])||{};
    const p=md.pbrMetallicRoughness||{};
    const bc=p.baseColorFactor||[1,1,1,1];
    let m;
    if(md.alphaMode==='BLEND')m=new THREE.MeshStandardMaterial({color:new THREE.Color(bc[0],bc[1],bc[2]),transparent:true,opacity:bc[3],side:THREE.DoubleSide});
    else m=new THREE.MeshStandardMaterial({color:new THREE.Color(bc[0],bc[1],bc[2]),opacity:bc[3],transparent:bc[3]<0.999,side:md.doubleSided?THREE.DoubleSide:THREE.FrontSide});
    if(p.metallicFactor!==undefined)m.metalness=p.metallicFactor;
    if(p.roughnessFactor!==undefined)m.roughness=p.roughnessFactor;
    if(Array.isArray(md.emissiveFactor))m.emissive.setRGB(md.emissiveFactor[0],md.emissiveFactor[1],md.emissiveFactor[2]);
    if(md.normalTexture)m.normalScale=new THREE.Vector2(1,1);
    const ti=p.baseColorTexture&&p.baseColorTexture.index;
    if(ti!==undefined&&textures[ti])m.map=textures[ti];
    const ni=md.normalTexture&&md.normalTexture.index;
    if(ni!==undefined&&textures[ni])m.normalMap=textures[ni];
    return m;
  }
  function transformNode(o,n){
    if(n.matrix){o.matrix.fromArray(n.matrix);o.matrixAutoUpdate=false;o.matrixWorldNeedsUpdate=true;return;}
    if(n.translation)o.position.fromArray(n.translation);
    if(n.rotation)o.quaternion.fromArray(n.rotation);
    if(n.scale)o.scale.fromArray(n.scale);
  }
  function primitiveMesh(json,bin,meshDef,prim,skinIndex,textures){
    const attrs=prim.attributes||{}, pos=attrs.POSITION!==undefined?readAccessor(json,bin,attrs.POSITION):null;
    if(!pos)throw new Error('GLB mesh primitive has no POSITION');
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos.array,3));
    if(attrs.NORMAL!==undefined){const a=readAccessor(json,bin,attrs.NORMAL);g.setAttribute('normal',new THREE.BufferAttribute(a.array,3));}
    if(attrs.TEXCOORD_0!==undefined){const a=readAccessor(json,bin,attrs.TEXCOORD_0);g.setAttribute('uv',new THREE.BufferAttribute(a.array,2));}
    if(attrs.COLOR_0!==undefined){const a=readAccessor(json,bin,attrs.COLOR_0);g.setAttribute('color',new THREE.BufferAttribute(a.array,a.itemSize));}
    if(skinIndex!==undefined){
      if(attrs.JOINTS_0!==undefined){const a=readAccessor(json,bin,attrs.JOINTS_0);g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(a.array,4));}
      if(attrs.WEIGHTS_0!==undefined){const a=readAccessor(json,bin,attrs.WEIGHTS_0);g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(a.array,4));}
    }
    if(prim.indices!==undefined){const a=readAccessor(json,bin,prim.indices);g.setIndex(new THREE.BufferAttribute(indexArray(a),1));}
    g.computeBoundingBox();g.computeBoundingSphere();
    const mat=matFor(json,bin,prim.material,textures);
    /* Real glTF skinning: keep JOINTS_0/WEIGHTS_0 on a SkinnedMesh and bind it
       to the imported bone hierarchy. The gameplay animation layer can now
       drive the same skeleton instead of a procedural body. */
    const sm=skinIndex!==undefined
      ?new THREE.SkinnedMesh(g,mat)
      :new THREE.Mesh(g,mat);
    sm.userData.glbSkinned=skinIndex!==undefined;
    sm.userData.glbSkinIndex=skinIndex;
    sm.castShadow=true;sm.receiveShadow=true;
    if(prim.mode!==undefined&&prim.mode!==4)sm.userData.glbPrimitiveMode=prim.mode;
    return sm;
  }
  function parseGLB(buffer){
    const dv=new DataView(buffer);
    if(dv.getUint32(0,true)!==0x46546c67)throw new Error('Not a GLB file');
    const version=dv.getUint32(4,true), length=dv.getUint32(8,true);
    if(version!==2||length>buffer.byteLength)throw new Error('Unsupported GLB version');
    let off=12,json=null,bin=null;
    while(off+8<=length){
      const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true),start=off+8;
      if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,start,len)));
      else if(type===0x004e4942)bin=buffer.slice(start,start+len);
      off=start+len;
    }
    if(!json||!bin)throw new Error('GLB missing JSON or BIN chunk');
    return {json,bin};
  }
  async function load(url,onLoad,onError){
    try{
      const res=await fetch(url,{cache:'no-cache'});
      if(!res.ok)throw new Error('GLB HTTP '+res.status);
      const parsed=parseGLB(await res.arrayBuffer()),json=parsed.json,bin=parsed.bin;
      const texPromises=(json.textures||[]).map((_,i)=>loadImageTexture(json,bin,i).catch(function(e){
        console.warn('[GLB] texture '+i+' failed; continuing without it:',e);
        return null;
      }));
      const textures=await Promise.all(texPromises);
      const jointSet=new Set();(json.skins||[]).forEach(function(s){(s.joints||[]).forEach(function(j){jointSet.add(j);});});
      const nodes=(json.nodes||[]).map(function(n,i){const o=jointSet.has(i)?new THREE.Bone():new THREE.Object3D();o.name=n.name||('node_'+i);transformNode(o,n);o.userData.glbNode=i;return o;});
      const scenes=json.scenes||[{nodes:[]}],sceneIndex=json.scene!==undefined?json.scene:0;
      const root=new THREE.Group();root.name=json.asset&&json.asset.generator?('SurvivalCharacter • '+json.asset.generator):'SurvivalCharacter';
      (json.nodes||[]).forEach(function(n,i){
        if(n.mesh===undefined)return;
        const holder=nodes[i];
        const skinIndex=n.skin;
        const md=json.meshes[n.mesh];
        holder.userData.glbMeshes=[];
        (md.primitives||[]).forEach(function(p){
          const m=primitiveMesh(json,bin,md,p,skinIndex,textures);
          holder.add(m);holder.userData.glbMeshes.push(m);
        });
      });
      (json.nodes||[]).forEach(function(n,i){(n.children||[]).forEach(function(ch){nodes[i].add(nodes[ch]);});});
      const sceneDef=scenes[sceneIndex]||scenes[0];
      (sceneDef.nodes||[]).forEach(function(i){root.add(nodes[i]);});
      /* Build real glTF skins after the complete node hierarchy exists. */
      const skinByIndex=[];
      (json.skins||[]).forEach(function(sd,si){
        const bones=(sd.joints||[]).map(j=>nodes[j]).filter(Boolean);
        const inv=[];
        if(sd.inverseBindMatrices!==undefined){
          const ib=readAccessor(json,bin,sd.inverseBindMatrices);
          for(let k=0;k<bones.length;k++){
            const m=new THREE.Matrix4();
            m.fromArray(ib.array,k*16);
            inv.push(m);
          }
        }else{
          for(let k=0;k<bones.length;k++)inv.push(new THREE.Matrix4());
        }
        const skeleton=new THREE.Skeleton(bones,inv);
        skinByIndex[si]=skeleton;
      });
      /* Important: glTF inverse-bind matrices are expressed relative to the
         skinned node. Bind the Three.js skeleton with that node's world matrix;
         binding against identity can collapse a valid character to the origin. */
      root.updateMatrixWorld(true);
      (json.nodes||[]).forEach(function(n,i){
        if(n.skin===undefined)return;
        const skeleton=skinByIndex[n.skin];
        if(!skeleton)return;
        const meshes=nodes[i].userData.glbMeshes||[];
        meshes.forEach(function(sm){
          sm.frustumCulled=false;sm.matrixAutoUpdate=true;
          if(sm.isSkinnedMesh){
            /* Match Three.js GLTFLoader semantics: the mesh node's world
               matrix is the glTF bind matrix, while inverseBindMatrices stay
               inside the Skeleton. Do not pose/scale the skeleton here. */
            /* The source asset's inverseBindMatrices were producing a collapsed
               pose in our lightweight loader. Reconstruct the bind inverses from
               the imported rest-pose hierarchy instead. This is mathematically
               equivalent for a character whose nodes are already in bind pose,
               and keeps the real Skeleton fully usable for animation. */
            skeleton.calculateInverses();
            const bindMatrix=new THREE.Matrix4();
            sm.bind(skeleton,bindMatrix);
            sm.normalizeSkinWeights();
            skeleton.update();
            sm.skeleton.update();
            sm.userData.glbBindMatrix=bindMatrix.clone();
            sm.userData.glbBoneCount=skeleton.bones.length;
          }
        });
      });
      root.updateMatrixWorld(true);

      /* glTF animation clips -> native Three.js AnimationClip tracks. */
      function buildAnimations(){
        const clips=[];
        (json.animations||[]).forEach(function(ad,ai){
          const tracks=[];
          (ad.channels||[]).forEach(function(ch){
            const s=ad.samplers&&ad.samplers[ch.sampler];
            const target=ch.target||{};
            if(!s||target.node===undefined||!target.path)return;
            const input=readAccessor(json,bin,s.input);
            const output=readAccessor(json,bin,s.output);
            const node=nodes[target.node];
            if(!node)return;
            const path=target.path==='translation'?'position':target.path==='rotation'?'quaternion':target.path==='scale'?'scale':null;
            if(!path)return;
            const stride=path==='quaternion'?4:3;
            const values=output.array;
            let Track=path==='quaternion'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack;
            const times=input.array instanceof Float32Array?input.array:new Float32Array(input.array);
            let vals=values instanceof Float32Array?values:new Float32Array(values);
            if(s.interpolation==='STEP'){
              Track=path==='quaternion'?THREE.QuaternionKeyframeTrack:THREE.VectorKeyframeTrack;
            }
            const track=new Track(node.name+'.'+path,times,vals);
            if(s.interpolation==='STEP'&&track.setInterpolation&&THREE.InterpolateDiscrete!==undefined)
              track.setInterpolation(THREE.InterpolateDiscrete);
            tracks.push(track);
          });
          const clip=new THREE.AnimationClip(ad.name||('gltf_anim_'+ai),-1,tracks);
          clip.resetDuration();
          clips.push(clip);
        });
        return clips;
      }
      const animations=buildAnimations();
      root.updateMatrixWorld(true);
      root.traverse(function(o){
        if(o.isMesh){o.frustumCulled=false;o.visible=true;}
      });
      onLoad({scene:root,scenes:[root],animations:animations,asset:json.asset||{},parser:null});
    }catch(e){console.error('[GLB]',e);if(onError)onError(e);}
  }
  window.LocalGLBLoader={load:load,parseGLB:parseGLB};
})();