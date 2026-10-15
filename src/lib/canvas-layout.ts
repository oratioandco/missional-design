import type {Draft} from './canvas-draft';
export type CanvasVariant={id:string;title:string;status:string;blocks:{number:string;title:string;questions:string[]}[]};
export const CANVAS_BOXES:Record<string,{x:number;y:number;width:number;height:number}>={
 '02':{x:14,y:70,width:78.4,height:155},'05':{x:92.4,y:70,width:78.4,height:77.5},'07':{x:92.4,y:147.5,width:78.4,height:77.5},
 '03':{x:170.8,y:70,width:78.4,height:155},'04':{x:249.2,y:70,width:78.4,height:77.5},'06':{x:249.2,y:147.5,width:78.4,height:77.5},
 '01':{x:327.6,y:70,width:78.4,height:155},'08':{x:14,y:225,width:196,height:50},'09':{x:210,y:225,width:196,height:50},
};
export const MIN_CANVAS_FONT=9;
export function canvasAnswer(draft:Draft,number:string){
 const answers=(draft.answers[number]||[]).map((text,index)=>({text:text.trim(),index})).filter(a=>a.text);
 return answers.length?answers.map(a=>answers.length>1?`${a.index+1}. ${a.text}`:a.text).join('\n\n'):'Not yet explored.';
}
export class CanvasFitError extends Error {
 constructor(public blocks:string[],public labels:string[]){super(`Too much text for a readable one-page canvas in: ${labels.join(', ')}. Shorten those answers and try again. Your draft is unchanged; nothing has been cut off.`);this.name='CanvasFitError';}
}
