document.addEventListener('click',event=>{document.querySelectorAll('.research-menu[open]').forEach(menu=>{if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false;});});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const openMenus=document.querySelectorAll('.research-menu[open]');if(!openMenus.length)return;event.preventDefault();event.stopImmediatePropagation();openMenus.forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});}},true);
(function(){
var mq=window.matchMedia('(max-width:900px)');
function lists(menu){var narrow=mq.matches;menu.querySelectorAll('.pmenu-area-btn').forEach(function(b){var l=document.getElementById(b.getAttribute('aria-controls'));if(!narrow){b.setAttribute('aria-expanded','true');b.tabIndex=-1;l.hidden=false;return;}b.removeAttribute('tabindex');var open=!!l.querySelector('[aria-current]');b.setAttribute('aria-expanded',String(open));l.hidden=!open;});}
function place(menu){var p=menu.querySelector('.pmenu-panel');if(mq.matches){p.style.removeProperty('--pmenu-top');return;}var h=menu.closest('header')||menu;p.style.setProperty('--pmenu-top',Math.max(8,Math.round(h.getBoundingClientRect().bottom))+'px');}
function set(menu,open,focus){var t=menu.querySelector('.pmenu-toggle'),p=menu.querySelector('.pmenu-panel');t.setAttribute('aria-expanded',String(open));p.hidden=!open;menu.classList.toggle('is-open',open);if(open){lists(menu);place(menu);if(focus){var a=p.querySelector('[aria-current="page"]')||p.querySelector('.pmenu-area-btn:not([tabindex="-1"]),.pmenu-area a');if(a)a.focus();}}}
document.querySelectorAll('[data-pmenu]').forEach(function(menu){var t=menu.querySelector('.pmenu-toggle');lists(menu);
 t.addEventListener('click',function(e){set(menu,t.getAttribute('aria-expanded')!=='true',e.detail===0);});
 menu.querySelectorAll('.pmenu-area-btn').forEach(function(b){b.addEventListener('click',function(){if(!mq.matches)return;var l=document.getElementById(b.getAttribute('aria-controls')),o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));l.hidden=!o;});});});
document.addEventListener('click',function(e){document.querySelectorAll('[data-pmenu].is-open').forEach(function(m){if(!m.contains(e.target))set(m,false);});});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;var open=document.querySelectorAll('[data-pmenu].is-open');if(!open.length)return;e.preventDefault();e.stopImmediatePropagation();open.forEach(function(m){set(m,false);m.querySelector('.pmenu-toggle').focus();});},true);
if(mq.addEventListener)mq.addEventListener('change',function(){document.querySelectorAll('[data-pmenu]').forEach(function(m){lists(m);if(m.classList.contains('is-open'))place(m);});});
['resize','scroll'].forEach(function(ev){window.addEventListener(ev,function(){document.querySelectorAll('[data-pmenu].is-open').forEach(place);},{passive:true});});
})();
