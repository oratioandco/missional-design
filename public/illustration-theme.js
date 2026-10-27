/* Select explicit themed derivatives of our diagrams. Captured app images are untouched. */
(()=>{const root=document.documentElement,system=matchMedia('(prefers-color-scheme: dark)');
 const refresh=()=>{const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&system.matches);
  document.querySelectorAll('img[data-illustration-light]').forEach(image=>{const src=dark?image.dataset.illustrationDark:image.dataset.illustrationLight;if(image.getAttribute('src')!==src)image.setAttribute('src',src)});
 };
 refresh();new MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['data-theme']});system.addEventListener('change',refresh);
})();
