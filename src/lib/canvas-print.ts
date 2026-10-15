import type {Draft} from './canvas-draft';
import {CANVAS_BOXES,MIN_CANVAS_FONT,canvasAnswer,type CanvasVariant} from './canvas-layout';
export function fillCanvasPrint(win:Window,draft:Draft,variant:CanvasVariant){
 const doc=win.document;doc.title='Missional canvas - '+(draft.project||variant.title);
 const style=doc.createElement('style');style.textContent=`@page{size:A3 landscape;margin:0}*{box-sizing:border-box}body{margin:0;background:#e7e3dc;color:#151412;font:11.5pt/1.3 system-ui,sans-serif}.sheet{position:relative;width:420mm;height:297mm;background:white;margin:0 auto}.label{font:8pt system-ui;letter-spacing:.08em}.positioned{position:absolute;margin:0}.title{font:27pt Georgia,serif}.question{font:21pt Georgia,serif}.meta{font-size:10pt;white-space:pre-wrap;overflow-wrap:anywhere}.box{position:absolute;border:.25mm solid #c6c0b3}.number{position:absolute;top:3mm;left:5mm;font-size:8pt;color:#625c51}.block-title{position:absolute;top:8mm;left:5mm;right:5mm;font:600 12pt/1.2 system-ui;margin:0}.answer{position:absolute;left:5mm;right:5mm;bottom:5mm;margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.foot{font-size:7pt;color:#625c51}.controls{padding:20px;background:#fbfaf7;position:sticky;top:0;z-index:1}.controls button{font:16px system-ui;padding:12px 18px}.controls p{max-width:85ch}.controls [role=alert]{color:#9b251c}@media print{body{background:white}.controls{display:none}.sheet{margin:0;break-inside:avoid}}`;
 doc.head.append(style);
 const add=(tag:string,text:string,parent:HTMLElement,className='')=>{const el=doc.createElement(tag);el.textContent=text;el.className=className;parent.append(el);return el;};
 const controls=add('div','',doc.body,'controls'),hint=add('p','One A3 landscape page. Choose Save as PDF in the print dialog.',controls),button=add('button','Print / Save as PDF',controls) as HTMLButtonElement;button.disabled=true;
 const sheet=add('main','',doc.body,'sheet');
 const place=(tag:string,text:string,x:number,y:number,width:number,cls:string,height?:number)=>{const el=add(tag,text,sheet,'positioned '+cls);Object.assign(el.style,{left:x+'mm',top:y+'mm',width:width+'mm',...(height?{height:height+'mm'}:{})});return el;};
 place('p','MISSIONAL BY DESIGN / WORKING CANVAS',14,8,392,'label');
 place('h1',`${variant.id==='church'?'Ministry Model Canvas':'Missional Canvas'} / ${variant.title}`,14,17,392,'title');
 place('h2','What really is the good news in our context?',14,30,392,'question');
 const pending:{el:HTMLElement;label:string;size:number}[]=[];
 pending.push({el:place('p',draft.project||'Untitled project',14,44,270,'meta',6),label:'Project or organization',size:10});
 place('p',`Review: ${draft.reviewDate||'Not set'}`,300,44,106,'meta').style.textAlign='right';
 pending.push({el:place('p',`Team: ${draft.team||'Not specified'}`,14,53,140,'meta',12),label:'Team or participants',size:10});
 pending.push({el:place('p',`Context: ${draft.context||'Not yet described'}`,165,53,241,'meta',12),label:'Our context',size:10});
 for(const block of variant.blocks){const bounds=CANVAS_BOXES[block.number];const box=add('section','',sheet,'box');Object.assign(box.style,{left:bounds.x+'mm',top:bounds.y+'mm',width:bounds.width+'mm',height:bounds.height+'mm',background:block.number==='03'?'#f3ead3':'white'});add('span',block.number,box,'number');const title=add('h3',block.title,box,'block-title');const answer=add('p',canvasAnswer(draft,block.number),box,'answer');answer.style.top=(title.offsetTop+title.offsetHeight+5*96/25.4)+'px';pending.push({el:answer,label:block.title,size:11.5});}
 place('p','Tobias Treppmann / Oratio&Co, Ministry Model Canvas for churches (2024), adapted from Business Model Canvas. Nonprofit/business: Missional by Design (2026).',14,280,392,'foot');
 place('p','CC BY-SA 3.0 / creativecommons.org/licenses/by-sa/3.0 / A working expression, open to revision.',14,285,392,'foot');
 const overflow:string[]=[];
 for(const item of pending){let fits=false;for(let size=item.size;size>=MIN_CANVAS_FONT;size-=.25){item.el.style.fontSize=size+'pt';if(item.el.scrollHeight<=item.el.clientHeight+1&&item.el.scrollWidth<=item.el.clientWidth+1){fits=true;break;}}if(!fits)overflow.push(item.label);}
 if(overflow.length){hint.textContent=`Too much text for a readable one-page canvas in: ${overflow.join(', ')}. Return to your draft and shorten those answers. Nothing has been cut off.`;hint.setAttribute('role','alert');}else{button.disabled=false;button.addEventListener('click',()=>win.print());}
 win.focus();
}
