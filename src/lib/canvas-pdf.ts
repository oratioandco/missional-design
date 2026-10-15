import { jsPDF } from 'jspdf';
import type { Draft } from './canvas-draft';
import {CANVAS_BOXES,MIN_CANVAS_FONT,canvasAnswer,CanvasFitError,type CanvasVariant} from './canvas-layout';
const INK = '#151412', MUTED='#625c51';
const clean = (text:string) => text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/\t/g,'    ');
async function fontData(path:string) {
 const response=await fetch(path);if(!response.ok)throw Error('The PDF fonts could not load. Please try again.');
 const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(binary);
}
export async function createCanvasPdf(draft:Draft, variant:CanvasVariant, base:string) {
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a3',compress:true,putOnlyUsedFonts:true});
 const fonts=await Promise.all(['mona-sans-pdf.ttf','mona-sans-pdf-semibold.ttf','instrument-serif-pdf.ttf'].map(f=>fontData(`${base}/assets/brand/${f}`)));
 fonts.forEach((font,i)=>{const file=['Mona.ttf','MonaSemibold.ttf','Instrument.ttf'][i];doc.addFileToVFS(file,font);doc.addFont(file,i===2?'Instrument':'Mona',i===1?'bold':'normal');});
 const set=(size=11,bold=false)=>{doc.setFont('Mona',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(INK);};
 set();
 // Detect unsupported glyphs rather than silently dropping a person's answer.
 const cmap=(doc.getFont().metadata as any).cmap?.unicode?.codeMap;
 const all=[draft.project,draft.team,draft.context,...Object.values(draft.answers).flat()].join('');
 const missing=Array.from(new Set(Array.from(clean(all)).filter(c=>!/[\n\r]/.test(c)&&cmap&&!cmap[c.codePointAt(0)!])));
 if(missing.length)throw Error(`The PDF font cannot display ${missing.slice(0,8).join(' ')}. Your answers are safe. Use “Print / Save as PDF” for this draft, or download the editable copy.`);
 doc.setProperties({title:`${draft.project||'Working canvas'} - ${variant.title}`,subject:'One-page filled missional canvas',author:'Missional by Design',creator:'Missional canvas workbook'});
 const lines=(text:string,width:number)=>doc.splitTextToSize(clean(text),width) as string[];
 const fit=(text:string,width:number,height:number,start=11.5)=>{
  for(let size=start;size>=MIN_CANVAS_FONT;size-=.25){set(size);const wrapped=lines(text,width),leading=size*25.4/72*1.3;if(wrapped.length*leading<=height)return {wrapped,size,leading};}
  return null;
 };
 const overflow:string[]=[],labels:string[]=[];
 set(9);doc.setTextColor(MUTED);doc.text('MISSIONAL BY DESIGN / WORKING CANVAS',14,12);
 doc.setFont('Instrument','normal');doc.setFontSize(27);doc.setTextColor(INK);doc.text(`${variant.id==='church'?'Ministry Model Canvas':'Missional Canvas'} / ${variant.title}`,14,26);
 doc.setFontSize(21);doc.text('What really is the good news in our context?',14,38);
 const meta=(text:string,x:number,y:number,width:number,height:number,label:string)=>{
  const fitted=fit(text,width,height,10);
  if(!fitted){overflow.push('metadata');labels.push(label);return;}
  set(fitted.size);doc.text(fitted.wrapped,x,y,{lineHeightFactor:1.3});
 };
 meta(draft.project||'Untitled project',14,48,270,6,'Project or organization');
 set(9);doc.text(`Review: ${draft.reviewDate||'Not set'}`,406,48,{align:'right'});
 meta(`Team: ${draft.team||'Not specified'}`,14,57,140,10,'Team or participants');
 meta(`Context: ${draft.context||'Not yet described'}`,165,57,241,10,'Our context');
 for(const block of variant.blocks){
  const {x,y,width,height}=CANVAS_BOXES[block.number];
  doc.setDrawColor('#c6c0b3');doc.setFillColor(block.number==='03'?'#f3ead3':'#ffffff');doc.rect(x,y,width,height,'FD');
  set(8);doc.setTextColor(MUTED);doc.text(block.number,x+5,y+7);
  set(12,true);const title=lines(block.title,width-10);doc.text(title,x+5,y+14,{lineHeightFactor:1.2});
  const textY=y+16+title.length*5;
  const fitted=fit(canvasAnswer(draft,block.number),width-10,y+height-5-textY);
  if(!fitted){overflow.push(block.number);labels.push(block.title);continue;}
  set(fitted.size);doc.text(fitted.wrapped,x+5,textY,{lineHeightFactor:1.3});
 }
 if(overflow.length)throw new CanvasFitError(overflow,labels);
 set(7);doc.setTextColor(MUTED);
 doc.text('Tobias Treppmann / Oratio&Co, Ministry Model Canvas for churches (2024), adapted from Business Model Canvas. Nonprofit/business: Missional by Design (2026).',14,283);
 doc.text('CC BY-SA 3.0 / creativecommons.org/licenses/by-sa/3.0 / A working expression, open to revision.',14,287);
 return doc;
}
