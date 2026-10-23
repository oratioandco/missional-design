// Light/dark switch: remembers an explicit choice (shared with missional.design as "mbd-theme"; "theme" is kept
// in step because the working examples read it); otherwise the page follows the system setting.
// Stills of the working examples carry a dark version in data-dark; the switch swaps them with the theme.
(()=>{const bs=document.querySelectorAll('[data-theme-toggle]');
const mq=matchMedia('(prefers-color-scheme: dark)');
const dark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':mq.matches};
const stills=()=>{const d=dark();document.querySelectorAll('img[data-dark]').forEach(i=>{if(!i.dataset.light)i.dataset.light=i.getAttribute('src');const want=d?i.dataset.dark:i.dataset.light;if(i.getAttribute('src')!==want)i.setAttribute('src',want)})};
const label=()=>{const d=dark();bs.forEach(b=>{b.textContent=d?'Light':'Dark';b.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')})};
const sync=()=>{label();stills()};sync();mq.addEventListener('change',sync);
addEventListener('storage',e=>{if(e.key==='mbd-theme'&&(e.newValue==='light'||e.newValue==='dark')){document.documentElement.dataset.theme=e.newValue;sync()}});
bs.forEach(b=>b.addEventListener('click',()=>{const t=dark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('mbd-theme',t);localStorage.setItem('theme',t)}catch(e){}sync()}));})();
