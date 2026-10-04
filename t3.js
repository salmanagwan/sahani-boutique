const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1200,height:850}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8100/nested/x/index.html');await p.waitForTimeout(5000);
await p.screenshot({path:'/tmp/claude-0/pub.png'});console.log(errs);await b.close();})();
