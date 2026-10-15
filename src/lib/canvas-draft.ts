export const FORMAT = 'missional-canvas';
export const STORAGE_KEY = 'mbd:canvas-drafts:v1';
export const VARIANTS = ['church', 'nonprofit', 'business'] as const;
export type VariantId = typeof VARIANTS[number];
export interface Draft {
 format: typeof FORMAT; version: 1; variant: VariantId;
 project: string; team: string; context: string; reviewDate: string;
 answers: Record<string, string[]>; summaries: Record<string, string>; updatedAt: string;
}
export function blankDraft(variant: VariantId): Draft {
 return {format: FORMAT,version:1,variant,project:'',team:'',context:'',reviewDate:'',answers:{},summaries:{},updatedAt:''};
}
export function validateDraft(raw: unknown, blocks: {number:string;questions:string[]}[]): Draft {
 if(!raw || typeof raw!=='object') throw Error('Choose a canvas file downloaded from this page.');
 const value = raw as Record<string,unknown>;
 if(value.format!==FORMAT || value.version!==1 || !VARIANTS.includes(value.variant as VariantId)) throw Error('This canvas file has an unsupported format or version.');
 const draft=blankDraft(value.variant as VariantId);
 for(const key of ['project','team','context','reviewDate','updatedAt'] as const) {
  if(typeof value[key]!=='string' || value[key].length>(key==='context'?3000:300)) throw Error('The canvas file contains an invalid '+key+' field.');
  draft[key]=value[key];
 }
 if(draft.reviewDate && (!/^\d{4}-\d{2}-\d{2}$/.test(draft.reviewDate) || !Number.isFinite(Date.parse(draft.reviewDate)) || new Date(draft.reviewDate).toISOString().slice(0,10)!==draft.reviewDate)) throw Error('The review date is invalid.');
 if(!value.answers || typeof value.answers!=='object' || Array.isArray(value.answers) || !value.summaries || typeof value.summaries!=='object' || Array.isArray(value.summaries)) throw Error('The saved answers are invalid.');
 for(const block of blocks) {
  const answer=(value.answers as Record<string,unknown>)[block.number];
  const summary=(value.summaries as Record<string,unknown>)[block.number];
  if(answer!==undefined && (!Array.isArray(answer) || answer.length>block.questions.length || answer.some(a=>typeof a!=='string'||a.length>20000))) throw Error('An answer is invalid or too long.');
  if(summary!==undefined && (typeof summary!=='string'||summary.length>1000)) throw Error('A canvas summary is invalid or too long.');
  draft.answers[block.number]=block.questions.map((_,i)=>(answer as string[]|undefined)?.[i]||'');
  draft.summaries[block.number]=summary as string || '';
 }
 return draft;
}
export function hasContent(draft:Draft) {
 return !!(draft.project||draft.team||draft.context||draft.reviewDate||Object.values(draft.answers).some(a=>a.some(t=>t.trim()))||Object.values(draft.summaries).some(t=>t.trim()));
}
export function answeredBlocks(draft:Draft) {
 return Object.values(draft.answers).filter(a=>a.some(t=>t.trim())).length;
}
export function fileStem(draft:Draft) {
 return ('missional-canvas-'+draft.variant+'-'+(draft.project||'draft')).normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/-+/g,'-').slice(0,100).replace(/-$/,'');
}
