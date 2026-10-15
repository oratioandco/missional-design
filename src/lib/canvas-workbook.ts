import {CanvasFitError} from './canvas-layout';
import {fillCanvasPrint} from './canvas-print';
import data from '../data/missional-canvases.json';
import {blankDraft,validateDraft,hasContent,answeredBlocks,fileStem,STORAGE_KEY,VARIANTS,type Draft,type VariantId} from './canvas-draft';
const root=document.querySelector<HTMLElement>('#canvas-workbook');
if(root) init(root);
function init(root:HTMLElement){
 const drafts=Object.fromEntries(VARIANTS.map(id=>[id,blankDraft(id)])) as Record<VariantId,Draft>;
 let selected:VariantId='church',step=0,writing=false,storageSafe=true,storageAvailable=true;
 const status=document.querySelector<HTMLElement>('#draft-status')!;
 const $=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const message=(text:string,error=false)=>{for(const target of [status,$('#export-status')]){target.textContent=text;target.dataset.error=String(error);}};
 const variant=()=>data.variants.find(v=>v.id===selected)!;
 function save(){
  drafts[selected].updatedAt=new Date().toISOString();
  if(!storageSafe){message('Existing local drafts could not be read. Your changes are only in this tab; download an editable copy before leaving.',true);return;}
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(drafts));storageAvailable=true;message('Saved in this browser.');}
  catch{storageAvailable=false;message('This browser could not save your progress. Download an editable copy before leaving.',true);}
 }
 try{
  const saved=localStorage.getItem(STORAGE_KEY);
  if(saved){const parsed=JSON.parse(saved);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();
   for(const id of VARIANTS)if(parsed[id]){const candidate=validateDraft(parsed[id],data.variants.find(v=>v.id===id)!.blocks);if(candidate.variant!==id)throw Error();drafts[id]=candidate;}
  }
 }catch{storageSafe=false;$('#replace-local').hidden=false;message('Existing local drafts could not be read and have been left untouched. Download an editable copy of any new work before leaving.',true);}
 function fill(){const draft=drafts[selected];
  for(const key of ['project','team','context','reviewDate'] as const)$<HTMLInputElement|HTMLTextAreaElement>(`[name="${key}"]`).value=draft[key];
  const panel=$(`[data-writing-variant="${selected}"]`);
  panel.querySelectorAll<HTMLTextAreaElement>('[data-question]').forEach(el=>el.value=draft.answers[el.dataset.block!]?.[Number(el.dataset.question)]||'');
 }
 function progress(){const draft=drafts[selected];$('#writing-progress').textContent=`${answeredBlocks(draft)} of 9 sections started`;
  root.querySelectorAll<HTMLElement>('[data-writing-step]').forEach(el=>{const n=Number(el.dataset.writingStep);const block=variant().blocks[n];const started=!!block&&!!draft.answers[block.number]?.some(a=>a.trim());const marker=el.querySelector<HTMLElement>('.section-state');if(marker)marker.dataset.started=String(started);if(block)el.setAttribute('aria-label',`${block.number} ${block.title}${started?', started':''}`);});
 }
 function review(){const draft=drafts[selected];const target=$('#review-answers');target.replaceChildren();$('#review-count').textContent=`${answeredBlocks(draft)} of 9 sections started. The PDF places the answers you have written inside the nine canvas blocks.`;
  for(const [i,block] of variant().blocks.entries()){
   const section=document.createElement('section');section.className='review-block';const h=document.createElement('h4');h.textContent=`${block.number} / ${block.title}`;section.append(h);

   const dl=document.createElement('dl');block.questions.forEach((q,j)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=q;dd.textContent=draft.answers[block.number]?.[j]||'Not yet explored.';dl.append(dt,dd);});section.append(dl);
   const edit=document.createElement('a');edit.href='#canvas-workbook';edit.textContent=`Edit ${block.title}`;edit.addEventListener('click',event=>{event.preventDefault();showStep(i,true);});section.append(edit);target.append(section);
  }
 }
 function showStep(next:number,focus=false){step=next;
  root.querySelectorAll<HTMLElement>('[data-writing-variant]').forEach(panel=>{panel.hidden=panel.dataset.writingVariant!==selected;panel.querySelectorAll<HTMLElement>('[data-answer-step]').forEach(el=>el.hidden=Number(el.dataset.answerStep)!==step);});
  root.querySelectorAll<HTMLElement>('[data-writing-step]').forEach(el=>{if(Number(el.dataset.writingStep)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('#canvas-review').hidden=step!==9;$('#previous-section').hidden=step===0;$('#next-section').hidden=step===9;$('#next-section').textContent=step===8?'Review & download':'Next section';
  if(step===9)review();progress();
  if(focus){const heading=step===9?$('#review-title'):$(`[data-writing-variant="${selected}"] [data-answer-step="${step}"] h3`);heading.focus();heading.scrollIntoView({block:'start',behavior:'instant' as ScrollBehavior});}
 }
 function mode(on:boolean){writing=on;root.hidden=!on;document.querySelectorAll<HTMLElement>('.family-variant').forEach(el=>el.hidden=on||el.id!==selected);document.querySelectorAll<HTMLElement>('[data-canvas-mode]').forEach(el=>el.setAttribute('aria-pressed',String((el.dataset.canvasMode==='write')===on)));if(on){fill();showStep(step);}}
 function choose(){const request=location.hash.slice(1).split('-block-')[0];if(VARIANTS.includes(request as VariantId)&&request!==selected){selected=request as VariantId;step=0;fill();}mode(writing);}
 addEventListener('hashchange',choose);choose();fill();showStep(0);
 document.querySelectorAll<HTMLButtonElement>('[data-canvas-mode]').forEach(button=>button.addEventListener('click',()=>{mode(button.dataset.canvasMode==='write');if(writing){root.scrollIntoView({block:'start'});$('#workbook-title').setAttribute('tabindex','-1');$('#workbook-title').focus({preventScroll:true});}}));
 root.addEventListener('input',event=>{const el=event.target as HTMLInputElement|HTMLTextAreaElement;const draft=drafts[selected];
  if(['project','team','context','reviewDate'].includes(el.name))(draft as any)[el.name]=el.value;
  else if(el.dataset.question!==undefined){const number=el.dataset.block!;draft.answers[number]??=Array(variant().blocks.find(b=>b.number===number)!.questions.length).fill('');draft.answers[number][Number(el.dataset.question)]=el.value;}
  else return;
  save();progress();
 });
 root.querySelectorAll<HTMLButtonElement>('[data-writing-step]').forEach(el=>el.addEventListener('click',()=>showStep(Number(el.dataset.writingStep),true)));
 $('#previous-section').addEventListener('click',()=>showStep(Math.max(0,step-1),true));$('#next-section').addEventListener('click',()=>showStep(Math.min(9,step+1),true));
 function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 $('#download-canvas-json').addEventListener('click',()=>download(new Blob([JSON.stringify(drafts[selected],null,2)+'\n'],{type:'application/json'}),fileStem(drafts[selected])+'.json'));
 $('#import-canvas').addEventListener('click',()=>$<HTMLInputElement>('#canvas-file').click());
 $('#canvas-file').addEventListener('change',async()=>{const input=$<HTMLInputElement>('#canvas-file'),file=input.files?.[0];if(!file)return;
  try{if(file.size>2_000_000)throw Error('This file is too large. Choose an editable canvas copy under 2 MB.');const parsed=JSON.parse(await file.text());const incoming=validateDraft(parsed,data.variants.find(v=>v.id===parsed?.variant)?.blocks||[]);
   if(hasContent(drafts[incoming.variant])&&!confirm(`Replace the existing ${data.variants.find(v=>v.id===incoming.variant)!.title} draft? Download a backup first if you want to keep it.`)){message('Import cancelled. Your existing draft is unchanged.');return;}
   selected=incoming.variant;drafts[selected]=incoming;location.hash=selected;fill();showStep(0);mode(true);save();
  }catch(error){message(error instanceof SyntaxError?'This file is not valid JSON. Your draft is unchanged.':(error as Error).message,true);}finally{input.value='';}
 });
 $('#clear-canvas').addEventListener('click',()=>{if(!confirm('Clear this version’s draft? Download an editable copy first if you want to keep it.'))return;drafts[selected]=blankDraft(selected);fill();showStep(0,true);save();});
 $('#replace-local').addEventListener('click',()=>{if(!confirm('Replace the unreadable local drafts? They cannot be recovered from this browser afterwards.'))return;storageSafe=true;$('#replace-local').hidden=true;save();});
 $('#download-canvas-pdf').addEventListener('click',async()=>{const button=$<HTMLButtonElement>('#download-canvas-pdf');button.disabled=true;button.textContent='Preparing PDF…';
  $('#fit-actions').replaceChildren();
  try{const snapshot=JSON.parse(JSON.stringify(drafts[selected])) as Draft;const selectedVariant=data.variants.find(v=>v.id===snapshot.variant)!;const {createCanvasPdf}=await import('./canvas-pdf');const base=import.meta.env.BASE_URL.replace(/\/$/,'');const doc=await createCanvasPdf(snapshot,selectedVariant,base);download(doc.output('blob'),fileStem(snapshot)+'.pdf');message('PDF downloaded. Keep an editable copy too, so you can return to this work.');}
  catch(error){message((error as Error).message||'The PDF could not be created. Your answers are safe; download an editable copy and try again.',true);
   if(error instanceof CanvasFitError){for(const number of Array.from(new Set(error.blocks))){const button=document.createElement('button');button.type='button';const index=variant().blocks.findIndex(b=>b.number===number);button.textContent=index>=0?'Edit '+variant().blocks[index].title:'Edit project details';button.addEventListener('click',()=>{if(index>=0)showStep(index,true);else{$<HTMLInputElement>('[name=project]').focus();$('[name=project]').scrollIntoView({block:'center'});}});$('#fit-actions').append(button);}}
  }finally{button.disabled=false;button.textContent='Download filled PDF';}
 });
 $('#print-canvas').addEventListener('click',()=>{
  const win=window.open('','_blank');if(!win){message('Allow the print window to open, then try again.',true);return;}
  fillCanvasPrint(win,drafts[selected],variant());
 });
 addEventListener('beforeunload',event=>{if(writing&&hasContent(drafts[selected])&&(!storageSafe||!storageAvailable)){event.preventDefault();event.returnValue='';}});
 if(storageSafe)message(hasContent(drafts[selected])?'Your local draft is ready to continue.':'Ready when you are. Progress saves in this browser as you write.');
}
