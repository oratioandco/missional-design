import{r as d,j as N,R as j}from"./chunk-CMtuD2zS.js";var l={exports:{}},u={},w;function H(){return w||(w=1,function(e){Object.defineProperty(e,"__esModule",{value:!0});function a(r){for(var t=0,n,i=0,s=r.length;s>=4;++i,s-=4)n=r.charCodeAt(i)&255|(r.charCodeAt(++i)&255)<<8|(r.charCodeAt(++i)&255)<<16|(r.charCodeAt(++i)&255)<<24,n=(n&65535)*1540483477+((n>>>16)*59797<<16),n^=n>>>24,t=(n&65535)*1540483477+((n>>>16)*59797<<16)^(t&65535)*1540483477+((t>>>16)*59797<<16);switch(s){case 3:t^=(r.charCodeAt(i+2)&255)<<16;case 2:t^=(r.charCodeAt(i+1)&255)<<8;case 1:t^=r.charCodeAt(i)&255,t=(t&65535)*1540483477+((t>>>16)*59797<<16)}return t^=t>>>13,t=(t&65535)*1540483477+((t>>>16)*59797<<16),((t^t>>>15)>>>0).toString(36)}e.default=a}(u)),u}var C;function b(){return C||(C=1,l.exports=H()),l.exports}b();var h={},_;function R(){return _||(_=1,h._default=b().default),h}R();var z="data-ws-tag",g=e=>e[z];const I="div",M=d.forwardRef(({tag:e,...a},r)=>{const t=g(a)??e??I;return d.createElement(t,{...a,ref:r})});M.displayName="Box";const L="div",$=d.forwardRef(({tag:e,...a},r)=>{const t=g(a)??e??L;return d.createElement(t,{...a,ref:r})});$.displayName="Text";const D="h1",k=d.forwardRef(({tag:e,...a},r)=>{const t=g(a)??e??D;return d.createElement(t,{...a,ref:r})});k.displayName="Heading";var q=[16,32,48,64,96,128,256,384],m=[640,750,828,1080,1200,1920,2048,3840],o=[...q,...m],V=(e,a)=>{if(a){const n=/(^|\s)(1?\d?\d)vw/g,i=[];for(let s;s=n.exec(a);s)i.push(Number.parseInt(s[2],10));if(i.length){const s=Math.min(...i)*.01;return{widths:o.filter(c=>c>=m[0]*s),kind:"w"}}return{widths:o,kind:"w"}}if(e==null)return{widths:m,kind:"w"};const r=2;let t=o.findIndex(n=>n>=r*e);return t=t<0?o.length:t,{widths:o.slice(0,t+1),kind:"w"}},T=({src:e,width:a,quality:r,sizes:t,loader:n})=>{const{widths:i,kind:s}=V(a,t);return{sizes:!t&&s==="w"?"100vw":t,srcSet:i.map((c,f)=>`${n({src:e,quality:r,width:c})} ${s==="w"?c:f+1}${s}`).join(", "),src:n({src:e,quality:r,width:i[i.length-1]})}},E=e=>{if(typeof e=="number")return Math.round(e);if(typeof e=="string"){const a=Number.parseFloat(e);if(!Number.isNaN(a))return Math.round(a)}},U="(min-width: 1280px) 50vw, 100vw",F=80,Z=e=>{try{return new URL(e),!0}catch{return!1}},O=e=>{const a=E(e.width),r=Math.max(Math.min(E(e.quality)??F,100),0);if(e.src!=null&&e.src!==""){if(e.src.startsWith("data:"))return{src:e.src};if(e.srcSet==null&&e.optimize){const n=e.sizes??(e.width==null?U:void 0);return T({src:e.src,width:a,quality:r,sizes:n,loader:e.loader})}const t={src:Z(e.src)?e.src:e.loader({src:e.src,format:"raw"})};return e.srcSet!=null&&(t.srcSet=e.srcSet),e.sizes!=null&&(t.sizes=e.sizes),t}},y=d.forwardRef(({quality:e,loader:a,optimize:r=!0,loading:t="lazy",decoding:n="async",...i},s)=>{const c=O({src:i.src,srcSet:i.srcSet,sizes:i.sizes,width:i.width,quality:e,loader:a,optimize:r})??{src:W};return N.jsx("img",{alt:"",...i,...c,decoding:n,loading:t,ref:s})});y.displayName="Image";var W=`data:image/svg+xml;base64,${btoa(`<svg
  width="140"
  height="140"
  viewBox="0 0 600 600"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  >
  <rect width="600" height="600" fill="#DFE3E6" />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M450 170H150C141.716 170 135 176.716 135 185V415C135 423.284 141.716 430 150 430H450C458.284 430 465 423.284 465 415V185C465 176.716 458.284 170 450 170ZM150 145C127.909 145 110 162.909 110 185V415C110 437.091 127.909 455 150 455H450C472.091 455 490 437.091 490 415V185C490 162.909 472.091 145 450 145H150Z"
    fill="#C1C8CD"
  />
  <path
    d="M237.135 235.012C237.135 255.723 220.345 272.512 199.635 272.512C178.924 272.512 162.135 255.723 162.135 235.012C162.135 214.301 178.924 197.512 199.635 197.512C220.345 197.512 237.135 214.301 237.135 235.012Z"
    fill="#C1C8CD"
  />
  <path
    d="M160 405V367.205L221.609 306.364L256.552 338.628L358.161 234L440 316.043V405H160Z"
    fill="#C1C8CD"
  />
</svg>`)}`;const B=d.forwardRef(({loading:e="lazy",width:a,height:r,optimize:t=!0,decoding:n,$webstudio$canvasOnly$assetId:i,...s},c)=>{const f=String(s.src??""),{imageLoader:A,renderer:S}=d.useContext(j);let v=n,x=f;return S==="canvas"&&(e="eager",v="sync",x=i??f,a!==void 0&&r!==void 0&&Number.isNaN(a)&&Number.isNaN(r)&&(t=!1,a=void 0,r=void 0)),N.jsx(y,{loading:e,decoding:v,optimize:t,width:a,height:r,...s,loader:A,src:f,ref:c},x)});B.displayName="Image";export{$ as a,k as d,M as n,B as y};
