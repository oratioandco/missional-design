const worksheet=document.querySelector<HTMLElement>('[data-principle-worksheet]');
if(worksheet){
 const fields=Array.from(worksheet.querySelectorAll<HTMLTextAreaElement>('textarea'));
 const status=worksheet.querySelector<HTMLElement>('[data-worksheet-status]');
 const syncPrint=()=>{for(const field of fields){const copy=worksheet.querySelector<HTMLElement>(`[data-print-for="${field.id}"]`);if(copy)copy.textContent=field.value;}};
 worksheet.addEventListener('input',syncPrint);window.addEventListener('beforeprint',syncPrint);
 worksheet.querySelector('[data-print]')?.addEventListener('click',()=>{syncPrint();window.print();});
 worksheet.querySelector('[data-download]')?.addEventListener('click',()=>{
  const answers=Object.fromEntries(fields.map(f=>[f.name,f.value]));
  const file=new Blob([JSON.stringify({worksheet:'Missional by Design principle review',version:1,source:'https://missional.design/building-tools/worksheet/',saved_at:new Date().toISOString(),answers},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download='missional-principle-review.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(status)status.textContent='Answers downloaded. Keep the file somewhere private if it contains sensitive information.';
 });
 syncPrint();
}
