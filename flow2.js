const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});await p.waitForTimeout(900);await p.screenshot({path:'/tmp/claude-0/splash.png'});await p.waitForTimeout(2200);
await p.getByText('New order',{exact:true}).click();await p.waitForTimeout(1200);
await p.getByPlaceholder(/Priya/).fill('Ananya Kapoor');
await p.getByText('Wedding',{exact:true}).click();
await p.getByText('Continue',{exact:true}).click();await p.waitForTimeout(600);
await p.getByText('Choose a designer').click();await p.waitForTimeout(700);await p.screenshot({path:'/tmp/claude-0/f-picker.png'});
await p.getByText('Sabyasachi',{exact:true}).last().click();await p.waitForTimeout(500);
await p.getByPlaceholder(/Lehenga Set/).fill('Bridal Lehenga');
await p.getByPlaceholder('0.00').first().fill('12500');
await p.screenshot({path:'/tmp/claude-0/f-piece.png'});
for(let i=0;i<3;i++){await p.getByText('Continue',{exact:true}).click();await p.waitForTimeout(600);}
await p.screenshot({path:'/tmp/claude-0/f-review.png'});
await p.getByText('Save order',{exact:true}).click();await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/f-after.png'});
console.log(errs);await b.close();})();
