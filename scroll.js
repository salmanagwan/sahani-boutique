const { chromium } = require('playwright');
const [u, name, ...ys] = process.argv.slice(2);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8099'+u,{waitUntil:'networkidle'});await p.waitForTimeout(2600);
let i=0;for(const y of ys){await p.mouse.move(200,400);await p.mouse.wheel(0,+y);await p.waitForTimeout(500);await p.screenshot({path:`/tmp/claude-0/${name}-${i++}.png`});}
console.log(errs);await b.close();})();
