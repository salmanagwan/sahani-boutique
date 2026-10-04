const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:900,height:850}});
await p.goto('http://localhost:8100/host.html');await p.waitForTimeout(6000);
await p.mouse.click(500,530);await p.waitForTimeout(1500);
const f=p.frames()[1];console.log('frame url',f.url());
console.log(await f.evaluate(()=>location.pathname+' | '+document.body.innerText.slice(0,70).replace(/\n/g,' | ')));
await p.screenshot({path:'/tmp/claude-0/host.png'});await b.close();})();
