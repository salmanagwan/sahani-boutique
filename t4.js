const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const mode of ['noop','none']){
const p=await b.newPage({viewport:{width:430,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
if(mode!=='none') await p.addInitScript(m=>{const H=history;const f=m==='none'?null:m==='throw'?function(){throw new DOMException('blocked','SecurityError')}:function(){};
const origR=H.replaceState.bind(H);let first=true;H.pushState=f;H.replaceState=function(...a){if(first){first=false;return origR(...a)}return f(...a)}},mode);
await p.goto('http://localhost:8100/nested/x/index.html');await p.waitForTimeout(4500);
await p.getByText('Fatima Al-Rashid').first().click();await p.waitForTimeout(1500);
const txt=await p.evaluate(()=>document.body.innerText.slice(0,80).replace(/\n/g,' | '));console.log(mode,'=>',txt,errs);}
await b.close();})();
