const { chromium } = require('playwright');
const routes = (process.argv[2]||'orders:/').split(',').map(r=>r.split(':'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
for (const [n,u,full] of routes){await p.goto('http://localhost:8099'+u,{waitUntil:'networkidle'});await p.waitForTimeout(2600);await p.screenshot({path:'/tmp/claude-0/'+n+'.png',fullPage:!!full});}
console.log('errors:',errs);await b.close();})();
