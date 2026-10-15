import { jsPDF } from 'jspdf';
import type { Draft } from './canvas-draft';
type Variant = {id:string;title:string;status:string;blocks:{number:string;title:string;questions:string[]}[]};
const INK = '#151412', MUTED='#625c51';
const clean = (text:string) => text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/\t/g,'    ');
async function fontData(path:string) {
 const response=await fetch(path);if(!response.ok)throw Error('The PDF fonts could not load. Please try again.');
 const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(binary);
}
export async function createCanvasPdf(draft:Draft, variant:Variant, base:string) {
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a3',compress:true,putOnlyUsedFonts:true});
 const fonts=await Promise.all(['mona-sans-pdf.ttf','mona-sans-pdf-semibold.ttf','instrument-serif-pdf.ttf'].map(f=>fontData(`${base}/assets/brand/${f}`)));
 fonts.forEach((font,i)=>{const file=['Mona.ttf','MonaSemibold.ttf','Instrument.ttf'][i];doc.addFileToVFS(file,font);doc.addFont(file,i===2?'Instrument':'Mona',i===1?'bold':'normal');});
 const set=(size=11,bold=false)=>{doc.setFont('Mona',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(INK);};
 set();
 // Detect unsupported glyphs rather than silently dropping a person's answer.
 const cmap=(doc.getFont().metadata as any).cmap?.unicode?.codeMap;
 const all=[draft.project,draft.team,draft.context,...Object.values(draft.answers).flat(),...Object.values(draft.summaries)].join('');
 const missing=Array.from(new Set(Array.from(clean(all)).filter(c=>!/[\n\r]/.test(c)&&cmap&&!cmap[c.codePointAt(0)!])));
 if(missing.length)throw Error(`The PDF font cannot display ${missing.slice(0,8).join(' ')}. Your answers are safe. Use “Print / Save as PDF” for this draft, or download the editable copy.`);
 doc.setProperties({title:`${draft.project||'Working canvas'} - ${variant.title}`,subject:'Missional canvas and full answers',author:'Missional by Design',creator:'Missional canvas workbook'});
 const lines=(text:string,width:number)=>doc.splitTextToSize(clean(text),width) as string[];
 const excerpt=(text:string,width:number,max:number)=>{const result=lines(text,width);if(result.length<=max)return result;const keep=result.slice(0,max);keep[max-1]=lines(keep[max-1]+'…',width)[0].replace(/\s+\S*$/,'')+'…';return keep;};
 set(9);doc.setTextColor(MUTED);doc.text('MISSIONAL BY DESIGN / WORKING CANVAS',14,14);
 doc.setFont('Instrument','normal');doc.setFontSize(27);doc.setTextColor(INK);doc.text(`${variant.id==='church'?'Ministry Model Canvas':'Missional Canvas'} / ${variant.title}`,14,28);
 doc.setFontSize(21);doc.text('What really is the good news in our context?',14,40);
 set(10,true);doc.text(excerpt(draft.project||'Untitled project',220,1),14,51);set(9);doc.text(`Review: ${draft.reviewDate||'Not set'}`,406,51,{align:'right'});
 doc.setTextColor(MUTED);doc.text(excerpt(draft.context||'Context not yet described',390,2),14,59,{lineHeightFactor:1.4});
 set(8);doc.text('Overview summaries or excerpts. Every question and full answer follows on the next pages.',14,73);
 const x=14,y=79,w=392,h=194,c=w/5,r=76;
 const boxes:Record<string,number[]>={'02':[0,0,1,2*r],'05':[1,0,1,r],'07':[1,r,1,r],'03':[2,0,1,2*r],'04':[3,0,1,r],'06':[3,r,1,r],'01':[4,0,1,2*r],'08':[0,2*r,2.5,h-2*r],'09':[2.5,2*r,2.5,h-2*r]};
 for(const block of variant.blocks){
  const [col,top,cols,height]=boxes[block.number],bx=x+col*c,by=y+top,bw=cols*c;
  doc.setDrawColor('#c6c0b3');doc.setFillColor(block.number==='03'?'#f3ead3':'#ffffff');doc.rect(bx,by,bw,height,'FD');
  set(8);doc.setTextColor(MUTED);doc.text(block.number,bx+5,by+7);
  set(12,true);const title=lines(block.title,bw-10);doc.text(title,bx+5,by+14,{lineHeightFactor:1.2});
  const textY=by+14+title.length*5;set(10.5);
  const text=draft.summaries[block.number]?.trim() || (draft.answers[block.number]||[]).filter(t=>t.trim()).join('\n\n') || 'Not yet explored.';
  doc.text(excerpt(text,bw-10,Math.max(1,Math.floor((by+height-6-textY)/4.8))),bx+5,textY,{lineHeightFactor:1.25});
 }
 let py=0;
 const newPage=()=>{doc.addPage('a4','portrait');set(8);doc.setTextColor(MUTED);doc.text('MISSIONAL BY DESIGN / FULL ANSWERS',18,15);py=29;};
 const ensure=(height:number)=>{if(py+height>274)newPage();};
 const body=(text:string,size=11)=>{set(size);const wrapped=lines(text,174);for(const line of wrapped){ensure(5.6);set(size);doc.text(line,18,py);py+=5.6;}py+=4;};
 const heading=(text:string)=>{set(16,true);const wrapped=lines(text,174);ensure(wrapped.length*7+20);set(16,true);doc.text(wrapped,18,py,{lineHeightFactor:1.2});py+=wrapped.length*7+6;};
 newPage();heading(draft.project||'Our working canvas');body(`${variant.title} / ${variant.status}`,10);
 body(`Team: ${draft.team||'Not specified'}\nRevisit this context: ${draft.reviewDate||'Not set'}`,10);
 if(draft.context){heading('Our context');body(draft.context);}
 for(const block of variant.blocks){
  heading(`${block.number} / ${block.title}`);
  if(draft.summaries[block.number]?.trim()){set(9,true);ensure(18);doc.text('ON THE CANVAS',18,py);py+=6;body(draft.summaries[block.number]);}
  block.questions.forEach((question,i)=>{set(10,true);const q=lines(question,174);ensure(q.length*5+15);set(10,true);doc.text(q,18,py,{lineHeightFactor:1.35});py+=q.length*5+3;body(draft.answers[block.number]?.[i]?.trim()||'Not yet explored.');});
  py+=5;
 }
 heading('Listen. Discern. Act. Revisit.');body('Invite the people affected by this work to correct our assumptions. Read Scripture and pray together. Make one concrete change, then review its faithfulness, effects and unintended costs. Return sooner when the context changes.');
 body('Adapted from Tobias Treppmann / Oratio&Co, Ministry Model Canvas for churches (2024), in turn adapted from the Business Model Canvas. Nonprofit and business adaptations: Missional by Design, 2026. CC BY-SA 3.0. https://creativecommons.org/licenses/by-sa/3.0/',9);
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);const width=doc.internal.pageSize.getWidth(),height=doc.internal.pageSize.getHeight();set(7);doc.setTextColor(MUTED);doc.text(i===1?'Missional by Design / CC BY-SA 3.0 / Church baseline 2024; adaptations 2026':'Missional by Design / A working expression, open to revision',i===1?14:18,height-11);doc.text(`${i} / ${pages}`,width-(i===1?14:18),height-11,{align:'right'});}
 return doc;
}
