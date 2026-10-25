document.addEventListener('click',event=>{document.querySelectorAll('.research-menu[open]').forEach(menu=>{if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false;});});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelectorAll('.research-menu[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});}});
