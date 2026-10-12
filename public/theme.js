// Light/dark switch: remembers an explicit choice; otherwise the page follows the system setting.
// Stills of the working examples carry a dark version in data-dark; the switch swaps them with the theme.
(()=>{const b=document.querySelector('.theme-toggle');
const mq=matchMedia('(prefers-color-scheme: dark)');
const dark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':mq.matches};
const stills=()=>{const d=dark();document.querySelectorAll('img[data-dark]').forEach(i=>{if(!i.dataset.light)i.dataset.light=i.getAttribute('src');const want=d?i.dataset.dark:i.dataset.light;if(i.getAttribute('src')!==want)i.setAttribute('src',want)})};
const label=()=>{if(!b)return;const d=dark();b.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme');b.setAttribute('aria-pressed',String(d))};
const sync=()=>{label();stills()};sync();mq.addEventListener('change',sync);
if(b)b.addEventListener('click',()=>{const t=dark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}sync()});})();
