/* /research/landscape/: poster fit/zoom/pan, product chooser, practices table filter, record search.
   Adapted from the landscape viewer (map-template.html) and views.html. Without JavaScript the poster shows at
   full size in its scroll box and every record, table and text list stays readable. */
(function(){
 'use strict';
 var $=function(s){return document.querySelector(s)};
 // ---------------------------------------------------------------- records
 function openRecord(id,focus){
  var d=document.getElementById('p-'+id);if(!d||d.tagName!=='DETAILS')return;
  d.hidden=false;d.open=true;d.classList.add('flash');setTimeout(function(){d.classList.remove('flash')},1600);
  var q=$('#rec-q');if(q&&q.value){q.value='';filterRecords()}
  d.scrollIntoView({block:'start'});if(focus!==false)d.querySelector('summary').focus({preventScroll:true});
  if(history.replaceState)history.replaceState(null,'','#p-'+id);
 }
 function openHash(){var h=location.hash.slice(1);if(h.indexOf('p-')===0)openRecord(h.slice(2),false)}
 var rq=$('#rec-q'),rs=$('#rec-status'),recs=[].slice.call(document.querySelectorAll('details.rec'));
 function filterRecords(){var t=rq.value.trim().toLowerCase(),n=0;recs.forEach(function(d){var ok=!t||d.dataset.name.indexOf(t)>-1;d.hidden=!ok;if(ok)n++});rs.textContent=n+(n===1?' product':' products')}
 if(rq)rq.addEventListener('input',filterRecords);
 addEventListener('hashchange',openHash);
 // Logos in the views link to #p-id; open the record rather than only jumping to a closed summary.
 document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href^="#p-"]');if(!a||a.closest('#ls-viewer'))return;ev.preventDefault();openRecord(a.getAttribute('href').slice(3))});
 // ---------------------------------------------------------------- chooser
 var sc=$('#ls-scope'),pr=$('#ls-product'),cs=$('#ls-cstatus'),all=pr?[].slice.call(pr.options):[];
 function fill(){var v=sc.value,rows=all.filter(function(o){return v==='all'||o.dataset.scope===v});pr.replaceChildren.apply(pr,rows);cs.textContent=rows.length+(rows.length===1?' product':' products')+' in the list. The poster keeps the complete landscape.'}
 if(sc){sc.addEventListener('change',fill);$('#ls-chooser').addEventListener('submit',function(ev){ev.preventDefault();if(pr.value)openRecord(pr.value)})}
 // ---------------------------------------------------------------- poster viewer
 var viewer=$('#ls-viewer'),poster=$('#ls-poster');
 if(viewer&&poster){
  var PW=parseFloat(poster.style.width),PH=parseFloat(poster.style.height),zoom=1,scale=1,x=0,y=0,drag=null,moved=false;
  viewer.classList.add('js');
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var draw=function(){var w=viewer.clientWidth,h=viewer.clientHeight;scale=Math.min(w/PW,h/PH)*zoom;var sw=PW*scale,sh=PH*scale;
   x=sw>w?clamp(x,w-sw,0):(w-sw)/2;y=sh>h?clamp(y,h-sh,0):(h-sh)/2;poster.style.transform='translate('+x+'px,'+y+'px) scale('+scale+')';
   $('#ls-zs').textContent=Math.round(zoom*100)+'%';$('#ls-out').disabled=zoom<=1;$('#ls-in').disabled=zoom>=8};
  var changeZoom=function(next,cx,cy){cx=cx===undefined?viewer.clientWidth/2:cx;cy=cy===undefined?viewer.clientHeight/2:cy;var old=scale;zoom=clamp(next,1,8);
   var ns=Math.min(viewer.clientWidth/PW,viewer.clientHeight/PH)*zoom;x=cx-(cx-x)*ns/old;y=cy-(cy-y)*ns/old;draw()};
  $('#ls-fit').addEventListener('click',function(){zoom=1;x=0;y=0;draw()});
  $('#ls-in').addEventListener('click',function(){changeZoom(zoom*1.5)});
  $('#ls-out').addEventListener('click',function(){changeZoom(zoom/1.5)});
  if(window.ResizeObserver)new ResizeObserver(draw).observe(viewer);else addEventListener('resize',draw);draw();
  viewer.addEventListener('pointerdown',function(e){if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:x,oy:y};moved=false;viewer.classList.add('dragging')});
  viewer.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.abs(dx)+Math.abs(dy)>5){moved=true;viewer.setPointerCapture(e.pointerId);x=drag.ox+dx;y=drag.oy+dy;draw()}});
  var end=function(){drag=null;viewer.classList.remove('dragging')};viewer.addEventListener('pointerup',end);viewer.addEventListener('pointercancel',end);
  viewer.addEventListener('click',function(e){var a=e.target.closest('a[data-app]');if(moved){e.preventDefault();moved=false;return}if(a){e.preventDefault();openRecord(a.dataset.app)}});
  // Keyboard: a focused logo inside the enlarged poster is brought into view.
  viewer.addEventListener('focusin',function(e){var a=e.target.closest&&e.target.closest('a[data-app]');if(!a||zoom===1)return;var r=a.getBoundingClientRect(),v=viewer.getBoundingClientRect();
   if(r.left<v.left||r.right>v.right||r.top<v.top||r.bottom>v.bottom){x+=v.left+v.width/2-(r.left+r.width/2);y+=v.top+v.height/2-(r.top+r.height/2);draw()}});
  viewer.addEventListener('keydown',function(e){if(e.target!==viewer)return;var d={ArrowLeft:[80,0],ArrowRight:[-80,0],ArrowUp:[0,80],ArrowDown:[0,-80]}[e.key];
   if(d){e.preventDefault();x+=d[0];y+=d[1];draw()}else if(e.key==='+'||e.key==='='){e.preventDefault();changeZoom(zoom*1.5)}else if(e.key==='-'){e.preventDefault();changeZoom(zoom/1.5)}else if(e.key==='0'){e.preventDefault();zoom=1;draw()}});
  viewer.addEventListener('wheel',function(e){if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();var r=viewer.getBoundingClientRect();changeZoom(zoom*Math.exp(-e.deltaY*.005),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 }
 // ---------------------------------------------------------------- practices table (view 2)
 var body=$('#pt-body');
 if(body){
  var q=$('#pt-q'),k=$('#pt-k'),so=$('#pt-sort'),st=$('#pt-status');
  var rows=[].slice.call(body.querySelectorAll('tr.pr')),grps=[].slice.call(body.querySelectorAll('tr.grp')),orig=[].slice.call(body.children);
  var apply=function(){var t=q.value.trim().toLowerCase(),kk=k.value,o=so.value,n=0;
   rows.forEach(function(r){var ok=(!t||r.dataset.name.indexOf(t)>-1)&&(!kk||(' '+r.dataset.has+' ').indexOf(' '+kk+' ')>-1);r.hidden=!ok;if(ok)n++});
   document.querySelectorAll('.pt td.dot').forEach(function(c){c.classList.toggle('hl',!!kk&&c.dataset.k===kk)});
   document.querySelectorAll('.colbtn').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.k===kk?'true':'false')});
   if(o==='fam'){orig.forEach(function(r){body.appendChild(r)});grps.forEach(function(g){var f=g.dataset.fam;g.hidden=!rows.some(function(r){return r.dataset.fam===f&&!r.hidden})})}
   else{grps.forEach(function(g){g.hidden=true});rows.slice().sort(function(a,b){return (a.dataset.last-b.dataset.last)||(o==='n'?(b.dataset.n-a.dataset.n)||a.dataset.name.localeCompare(b.dataset.name):a.dataset.name.localeCompare(b.dataset.name))}).forEach(function(r){body.appendChild(r)})}
   st.textContent=n+(n===1?' product':' products')+(kk?' state '+k.options[k.selectedIndex].text.toLowerCase():'')};
  [q,k,so].forEach(function(x){x.addEventListener('input',apply)});
  document.querySelectorAll('.colbtn').forEach(function(x){x.addEventListener('click',function(){k.value=k.value===x.dataset.k?'':x.dataset.k;apply()})});
 }
 var initial=new URLSearchParams(location.search).get('app');if(initial)openRecord(initial,false);else openHash();
})();
