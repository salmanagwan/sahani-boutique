const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1200,height:850}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8100/nested/x/index.html');await p.waitForTimeout(4000);
await p.screenshot({path:'/tmp/claude-0/a1.png'});
await p.getByText('Emma Richardson').first().click();await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/claude-0/a2.png'});
// srcdoc
const html=require('fs').readFileSync(process.env.HOME+'/out/sahani-boutique.html','utf8');
const p2=await b.newPage({viewport:{width:430,height:850}});p2.on('pageerror',e=>errs.push('srcdoc:'+e.message));
await p2.setContent('<iframe sandbox="allow-scripts" style="width:100%;height:840px;border:0"></iframe>');
await p2.$eval('iframe',(f,h)=>f.srcdoc=h,html);await p2.waitForTimeout(6000);await p2.screenshot({path:'/tmp/claude-0/a3.png'});
console.log(errs);await b.close();})();
