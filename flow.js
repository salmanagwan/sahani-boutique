const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8099/order/create',{waitUntil:'networkidle'});await p.waitForTimeout(2600);
await p.getByPlaceholder(/Priya/).fill('Ananya Kapoor');
await p.screenshot({path:'/tmp/claude-0/c0.png'});
for (let i=1;i<5;i++){await p.getByText('Continue',{exact:true}).click();await p.waitForTimeout(700);await p.screenshot({path:`/tmp/claude-0/c${i}.png`});}
console.log(errs);await b.close();})();
