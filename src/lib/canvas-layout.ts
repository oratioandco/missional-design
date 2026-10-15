import type {Draft} from './canvas-draft';
export type CanvasVariant={id:string;title:string;status:string;blocks:{number:string;title:string;questions:string[]}[]};
export const CANVAS_BOXES:Record<string,{x:number;y:number;width:number;height:number}>={
 '02':{x:14,y:70,width:78.4,height:145},'05':{x:92.4,y:70,width:78.4,height:72.5},'07':{x:92.4,y:142.5,width:78.4,height:72.5},
 '03':{x:170.8,y:70,width:78.4,height:145},'04':{x:249.2,y:70,width:78.4,height:72.5},'06':{x:249.2,y:142.5,width:78.4,height:72.5},
 '01':{x:327.6,y:70,width:78.4,height:145},'08':{x:14,y:215,width:196,height:60},'09':{x:210,y:215,width:196,height:60},
};
export const MIN_CANVAS_FONT=9;
export function canvasEntries(draft:Draft,block:CanvasVariant['blocks'][number]){
 return block.questions.map((question,index)=>({question,answer:draft.answers[block.number]?.[index]?.trim()||'Not yet explored.'}));
}
export class CanvasFitError extends Error {
 constructor(public blocks:string[],public labels:string[]){super(`Too much text for a readable one-page canvas in: ${labels.join(', ')}. Shorten those answers and try again. Your draft is unchanged; nothing has been cut off.`);this.name='CanvasFitError';}
}
