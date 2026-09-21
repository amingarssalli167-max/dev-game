/* ---- Phase 5: Inventory System ---- */
let fails=0;
const ok=m=>console.log('  ok  '+m);
const bad=m=>{console.log('FAIL  '+m);fails++;};
const chk=(c,m)=>c?ok(m):bad(m);

boot();
startGame(true);
function closeAll(){DLG.open=false;DOC.open=false;CODE.open=false;NB.open=false;INVUI.open=false;G.paused=false;}
function face(c,ox,oy){
  G.player.x=c.x+(ox||0);G.player.y=c.y+(oy==null?0.6:oy);
  IN.aim=Math.atan2(c.y-G.player.y,c.x-G.player.x);
  IN.movedByMouse=true;G.player.hidden=false;updateHint();return curInt;
}
const SB=()=>SCENES.slice_bld;
const find=(s,id)=>s.ints.find(i=>i.id===id);
const grid=()=>$('invGrid'), det=()=>$('invDetail'), acts=()=>det().querySelector('.acts');
function renderClean(){grid().children.length=0;acts().children.length=0;renderInv();}
function btn(label){return acts().children.slice().find(b=>(b.innerHTML||'').indexOf(label)>=0);}

/* ============ 0. registry + module surface ============ */
chk(typeof ITEMS==='object','ITEMS registry present');
chk(typeof INV==='object','INV module present');
['def','meta','count','has','list','add','remove','use','combine','canUse','canCombine','recipesFor']
  .forEach(fn=>chk(typeof INV[fn]==='function','INV.'+fn+'()'));
chk(Array.isArray(RECIPES)&&typeof defItem==='function'&&typeof defRecipe==='function','defItem/defRecipe/RECIPES present');

/* ============ 1. item definition shape (id/name/desc/icon/type/stack) ============ */
const mk=INV.def('medkit');
chk(!!mk,'medkit definition registered');
['id','name','desc','icon','type'].forEach(f=>chk(mk[f]!=null&&mk[f]!=='','medkit has field "'+f+'"'));
chk(mk.stack===true,'medkit is stackable');
chk(ITEM_TYPES[mk.type]!=null,'item type "'+mk.type+'" has a label');
chk(INV.def('keycard').stack===false,'keycard is non-stackable');
chk(INV.meta('unknown_thing').name!=null,'meta() falls back gracefully for unknown ids');

/* ============ 2. PICKUP -> INVENTORY (stackable + non-stackable) ============ */
G.items={};
INV.add('scrap');                 chk(INV.count('scrap')===1,'pickup stackable -> qty 1');
INV.add('scrap',2);               chk(INV.count('scrap')===3,'pickup stackable again -> qty stacks (3)');
INV.add('scrap',99);              chk(INV.count('scrap')===9,'stack respects max cap (9)');
INV.add('keycard');               chk(G.items.keycard===true&&INV.has('keycard'),'pickup non-stackable -> held');
INV.add('keycard');               chk(G.items.keycard===true,'non-stackable does not stack');
chk(INV.list().some(it=>it.id==='scrap'&&it.qty===9),'INV.list() reports the stack');
/* legacy API still works & delegates */
G.items={};addItemKey('batteries');
chk(INV.count('batteries')===1,'legacy addItemKey() delegates to INV.add');
chk(hasItem('batteries')===true,'legacy hasItem() delegates to INV.has');

/* ============ 3. USE ============ */
G.items={};
INV.add('medkit');
G.player.hp=1;G.player.rad=60;
let r=INV.use('medkit');
chk(r.ok===true,'use() returns ok');
chk(G.player.hp===2&&G.player.rad===15,'use() applied the medkit effect (hp+1, rad-45)');
chk(INV.count('medkit')===0,'consumable use() consumed one');
/* non-usable item */
INV.add('keycard');
r=INV.use('keycard');
chk(r.ok===false,'use() refuses an item with no use handler');
chk(INV.has('keycard'),'refused use did not consume the item');
/* missing item */
chk(INV.use('does_not_exist').ok===false,'use() of a missing item fails cleanly');

/* ============ 4. REMOVE ============ */
G.items={};
INV.add('scrap',3);
INV.remove('scrap');      chk(INV.count('scrap')===2,'remove() decrements a stack');
INV.remove('scrap',2);    chk(INV.count('scrap')===0&&!INV.has('scrap'),'remove() empties the stack');
chk(!('scrap' in G.items),'fully removed key is deleted from state');
INV.add('keycard');INV.remove('keycard');
chk(!INV.has('keycard'),'remove() drops a non-stackable');

/* ============ 5. COMBINE ============ */
G.items={};
INV.add('scrap');INV.add('cloth');
chk(INV.canCombine('scrap')===true,'combine available when both ingredients held');
chk(INV.recipesFor('scrap').length===1,'recipesFor() finds the recipe');
r=INV.combine('scrap','cloth');
chk(r.ok===true&&r.out==='repair_kit','combine() produced the output item');
chk(INV.has('repair_kit'),'output is now in the inventory');
chk(!INV.has('scrap')&&!INV.has('cloth'),'combine() consumed both ingredients');
/* combine without ingredients fails */
G.items={};INV.add('scrap');
chk(INV.canCombine('scrap')===false,'combine not offered when an ingredient is missing');
chk(INV.combine('scrap','cloth').ok===false,'combine() fails cleanly with a missing ingredient');
chk(INV.combine('scrap','keycard').ok===false,'combine() rejects an unknown pair');
/* use the combined result */
G.items={};INV.add('repair_kit');G.player.sta=10;
INV.use('repair_kit');
chk(G.player.sta===Math.min(CFG.staMax,60),'combined item is usable (stamina restored)');

/* ============ 6. MODULARITY — new item + recipe, zero engine edits ============ */
defItem({id:'t_a',name:'مادة أ',type:'material',stack:true,max:5,icon:'A',desc:'اختبار'});
defItem({id:'t_b',name:'مادة ب',type:'material',stack:true,max:5,icon:'B',desc:'اختبار'});
defItem({id:'t_out',name:'نتيجة',type:'consumable',stack:true,icon:'O',desc:'اختبار',
  use(){G.flags.tOut=(G.flags.tOut||0)+1;return{ok:true};}});
defRecipe({in:['t_a','t_b'],out:'t_out',qty:2});
G.items={};G.flags.tOut=0;
INV.add('t_a');INV.add('t_b');
chk(INV.canCombine('t_a'),'custom recipe detected via the registry');
r=INV.combine('t_a','t_b');
chk(r.ok&&INV.count('t_out')===2,'custom combine produced qty 2');
INV.use('t_out');
chk(G.flags.tOut===1,'custom item use handler ran');
chk(INV.meta('t_a').name==='مادة أ','custom item metadata resolves');

/* ============ 7. WORLD PICKUPS exist & integrate (Pickup via interaction) ============ */
chk(!!find(SB(),'sb_scrap')&&!!find(SB(),'sb_cloth')&&!!find(SB(),'sb_med'),'slice_bld has the test pickups');
G.items={};
enterScene('slice_bld',SB().spawn,{silent:true});closeAll();
const med=find(SB(),'sb_med');
med.used=false;delete G.items.medkit;
face(med,0,0.6);
chk(curInt&&curInt.id==='sb_med','world medkit is focusable');
doInteract();
chk(INV.has('medkit'),'interacting with a world item picks it up into the inventory');
chk(med.used===true,'world pickup is consumed from the scene');

/* ============ 8. SAVE / LOAD round-trip ============ */
G.items={};
INV.add('medkit');INV.add('scrap',2);INV.add('keycard');
saveGame(true);
const savedRaw=localStorage.getItem(SAVEKEY);
chk(savedRaw&&savedRaw.indexOf('scrap')>=0,'save data contains inventory state');
G.items={junk:true};                      // corrupt the live state
const loaded=loadGame();
chk(loaded===true,'loadGame() succeeded');
chk(INV.count('medkit')===1&&INV.count('scrap')===2&&INV.has('keycard'),'inventory restored from save');
chk(!INV.has('junk'),'stale item not resurrected');

/* ============ 9. INVENTORY UI ============ */
G.items={};
INV.add('medkit');INV.add('scrap',2);INV.add('cloth');
openInv();
chk(INVUI.open===true,'openInv() opens the inventory');
chk(!$('inv').classList.contains('hide'),'inventory overlay is shown');
renderClean();
chk(grid().children.length===3,'UI renders one slot per distinct item (3)');
const scrapSlot=grid().children.slice().find(s=>s.querySelector('.ic').textContent==='⚙');
chk(!!scrapSlot,'a slot shows its item icon');
chk(scrapSlot&&scrapSlot.querySelector('.q').textContent==='×2','stackable slot shows its quantity (×2)');
/* select medkit -> detail + use button */
INVUI.sel='medkit';renderClean();
chk(det().querySelector('.nm').textContent.indexOf('حقيبة إسعاف')>=0,'detail pane shows the selected item name');
chk(det().querySelector('.ty').textContent.indexOf('قابل للاستهلاك')>=0,'detail pane shows the item type');
chk(det().querySelector('.ds').textContent.length>0,'detail pane shows the description');
chk(!!btn('استخدام'),'Use button rendered for a usable item');
chk(!!btn('إزالة'),'Remove button rendered');
chk(!btn('دمج'),'no Combine button when no recipe applies');
/* click Use through the UI */
G.player.hp=1;G.player.rad=50;
btn('استخدام').onclick();
chk(G.player.hp===2&&INV.count('medkit')===0,'clicking Use in the UI applies effect + consumes');
/* select scrap (has cloth present) -> combine button */
INVUI.sel='scrap';renderClean();
chk(!!btn('دمج'),'Combine button rendered when a recipe is available');
btn('دمج').onclick();
chk(INV.has('repair_kit')&&!INV.has('cloth')&&INV.count('scrap')===1,'clicking Combine in the UI crafts the result (one of each consumed)');
/* remove through the UI */
INVUI.sel='repair_kit';renderClean();
btn('إزالة').onclick();
chk(!INV.has('repair_kit'),'clicking Remove in the UI drops the item');
/* empty state */
G.items={};INVUI.sel=null;renderClean();
chk(grid().children.length===0&&grid().innerHTML.indexOf('فارغة')>=0,'empty inventory shows an empty-state message');
/* close */
closeInv();
chk(INVUI.open===false&&$('inv').classList.contains('hide'),'closeInv() hides the inventory');

/* ============ 10. full required flow: Pickup -> Inventory -> Use -> Remove ============ */
G.items={};G.player.hp=1;G.player.rad=80;
INV.add('medkit');                                   // Pickup
chk(INV.has('medkit'),'[flow] pickup: item acquired');
openInv();renderClean();                             // Inventory
chk(grid().children.length===1&&INVUI.sel==='medkit','[flow] inventory: item is listed & selectable');
INVUI.sel='medkit';renderClean();btn('استخدام').onclick();   // Use
chk(G.player.hp===2&&G.player.rad===35,'[flow] use: effect applied');
chk(INV.count('medkit')===0,'[flow] use: consumable spent');
INV.add('keycard');INVUI.sel='keycard';renderClean();btn('إزالة').onclick();  // Remove
chk(!INV.has('keycard'),'[flow] remove: item removed from inventory');
closeInv();

console.log(fails?('\n'+fails+' FAILURES'):'\nINVENTORY SYSTEM SUITE OK');
