
// Motivation-only rotating welcome card; intentionally no savings goals or progress tracking.
const MOTIVATIONS=[
  {
    "icon": "✈️",
    "quote": "One day, you will see in person the places you used to admire on your phone.",
    "note": "Dreaming of going abroad"
  },
  {
    "icon": "🕋",
    "quote": "May the small steps you take today lead to the Holy Land one day.",
    "note": "A prayer for Umrah"
  },
  {
    "icon": "🌱",
    "quote": "Not every result is visible today. Something good may be growing quietly.",
    "note": "Trust the process"
  },
  {
    "icon": "🌍",
    "quote": "The world is vast. May you have the chance to explore it with your own eyes.",
    "note": "Explore the world"
  },
  {
    "icon": "💙",
    "quote": "You are allowed to be tired. Your dreams should never cost you your well-being.",
    "note": "Take care of yourself"
  },
  {
    "icon": "✨",
    "quote": "One day, you will be grateful that you kept trying.",
    "note": "Keep moving forward"
  },
  {
    "icon": "🧳",
    "quote": "A passport, a suitcase, and a boarding pass—may they become part of your story.",
    "note": "Your travel dreams"
  },
  {
    "icon": "🤲",
    "quote": "May your earnings bring blessings, peace, and the pilgrimage you hope to make.",
    "note": "Faith and gratitude"
  },
  {
    "icon": "🌤️",
    "quote": "A difficult day does not mean you will have a difficult future.",
    "note": "New hope"
  },
  {
    "icon": "⭐",
    "quote": "There are still many kinds of happiness waiting for you. Give life a chance.",
    "note": "Look ahead"
  },
  {
    "icon": "🌿",
    "quote": "Growth does not have to be fast. Sometimes, not giving up is enough.",
    "note": "Small steps"
  },
  {
    "icon": "🛫",
    "quote": "A dream of traveling far begins with believing that you can.",
    "note": "Dream boldly"
  },
  {
    "icon": "🕊️",
    "quote": "May today’s tiredness turn into tomorrow’s unexpected good news.",
    "note": "A little prayer"
  },
  {
    "icon": "🌅",
    "quote": "You are not behind. You are living your own journey, at your own pace.",
    "note": "Your own timeline"
  },
  {
    "icon": "💫",
    "quote": "What feels far away today may become a beautiful memory someday.",
    "note": "Hold on to hope"
  },
  {
    "icon": "🌏",
    "quote": "Imagine the day you say: I really made it here.",
    "note": "Your dream journey"
  },
  {
    "icon": "🕋",
    "quote": "May you one day make your prayers in front of the Kaaba.",
    "note": "A dream of Umrah"
  },
  {
    "icon": "📖",
    "quote": "Your story is not over. There are many beautiful chapters yet to come.",
    "note": "Your life story"
  },
  {
    "icon": "🌷",
    "quote": "You do not have to prove yourself to everyone. Follow the path that matters to you.",
    "note": "For yourself"
  },
  {
    "icon": "💪",
    "quote": "Hard work matters, but coming home with a peaceful heart matters too.",
    "note": "Find balance"
  },
  {
    "icon": "🚀",
    "quote": "Big dreams do not demand big steps every single day.",
    "note": "Stay consistent"
  },
  {
    "icon": "☀️",
    "quote": "Each new day offers another small chance to move toward what you love.",
    "note": "Morning encouragement"
  },
  {
    "icon": "🧭",
    "quote": "Focus on your direction, not how quickly other people are moving.",
    "note": "Your own path"
  },
  {
    "icon": "🌙",
    "quote": "If today has been long, give yourself permission to rest.",
    "note": "Evening reminder"
  },
  {
    "icon": "🌊",
    "quote": "Courage is not the absence of fear. It is trying even when the outcome is uncertain.",
    "note": "Be brave"
  },
  {
    "icon": "🎒",
    "quote": "May your list of dream destinations become a collection of travel stories.",
    "note": "New adventures"
  },
  {
    "icon": "🤍",
    "quote": "May your work be a source of blessing, not a reason to lose your happiness.",
    "note": "Meaningful work"
  },
  {
    "icon": "🌟",
    "quote": "Maybe not today. But there is nothing wrong with preparing for your moment.",
    "note": "Prepare for opportunity"
  },
  {
    "icon": "🪴",
    "quote": "You are nurturing your hopes. Remember to nurture yourself too.",
    "note": "Self-care"
  },
  {
    "icon": "🏞️",
    "quote": "There are sunrises in places you have not discovered yet.",
    "note": "See the world"
  },
  {
    "icon": "🕌",
    "quote": "May your intention to worship be made easy at the right time.",
    "note": "A prayer for Umrah"
  },
  {
    "icon": "💌",
    "quote": "Remember to notice the little things that make you happy, too.",
    "note": "Enjoy life"
  },
  {
    "icon": "🗺️",
    "quote": "It is okay if the route changes. A meaningful destination is still worth pursuing.",
    "note": "Keep growing"
  },
  {
    "icon": "🍃",
    "quote": "Resting is not falling behind. It is how you find the strength to continue.",
    "note": "Rest well"
  },
  {
    "icon": "✨",
    "quote": "May you someday live the life you once only prayed for.",
    "note": "Dreams and prayers"
  },
  {
    "icon": "💙",
    "quote": "Thank you for trying today. Tomorrow, begin again with a lighter heart.",
    "note": "Be kind to yourself"
  }
];
let motivationIndex=0;
function showMotivation(index){
 motivationIndex=(index+MOTIVATIONS.length)%MOTIVATIONS.length;
 const m=MOTIVATIONS[motivationIndex];
 document.getElementById('motivationIcon').textContent=m.icon;
 document.getElementById('motivationQuote').textContent=m.quote;
 document.getElementById('motivationNote').textContent=m.note;
 document.getElementById('motivationCounter').textContent=String(motivationIndex+1).padStart(2,'0')+' / '+String(MOTIVATIONS.length).padStart(2,'0');
 // No pagination dots or expensive DOM work on every quote change.
}
function initMotivation(){
 const dots=document.getElementById('motivationDots');

 showMotivation(Math.floor(Math.random()*MOTIVATIONS.length));
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  window.setInterval(()=>{if(!document.hidden&&document.getElementById('dashboard').classList.contains('active'))showMotivation(motivationIndex+1)},5500);
 }
}

import {DEFAULTS,DAY_TYPES,SHIFTS,money,dateKey,localDate,addDays,shiftFor,dayTypeFor,isAfternoonSaturday,isMandatoryRestDate,calculate,calculateBySession,parseCSV,parseRoster,payrollPeriodForDate,payrollRange,computePayroll} from './core.mjs';
const $=id=>document.getElementById(id);const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const today=dateKey(new Date());const month=today.slice(0,7);const currentPayrollPeriod=payrollPeriodForDate(today);const fmt=n=>Number(n||0).toLocaleString('en-GB',{maximumFractionDigits:2});let selectedDate=today,editing=null,pendingImport=null;
const fresh=()=>({settings:structuredClone(DEFAULTS),roster:{},holidays:{},records:[]});let state=fresh();
let cloudClient=null,cloudEnabled=false,cloudTimer=null,cloudBusy=false,cloudLinkedUid=null;
const THEME_KEY='myOTTheme-v17';
function applyTheme(value){const choice=['light','dark','system'].includes(value)?value:'system';const effective=choice==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):choice;document.documentElement.dataset.theme=effective;localStorage.setItem(THEME_KEY,choice);document.querySelectorAll('.theme-buttons [data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===choice)));}

function show(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500)}
const idb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open('MyOTTrackerDB',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('data'))req.result.createObjectStore('data')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
async function readDB(){const db=await idb();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readonly'),r=tx.objectStore('data').get('state');r.onsuccess=()=>{resolve(r.result);db.close()};r.onerror=()=>reject(r.error)})}
async function persist(){const db=await idb();await new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(state,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();render();scheduleCloudBackup()}
function navigate(page){if(page==='settings')settingInputs();document.querySelectorAll('.page').forEach(n=>n.classList.toggle('active',n.id===page));document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('selected',n.dataset.page===page));window.scrollTo({top:0,behavior:'instant'});render()}
function shift(d){return shiftFor(d,state.settings,state.roster)}function daytype(d){return dayTypeFor(d,state.settings,state.roster,state.holidays)}function calc(r){return calculateBySession({...r,dayType:isMandatoryRestDate(r.date,state.settings)&&r.dayType!=='holiday'?'rest':r.dayType},state.settings)}function stats(rows){let h=0,amount=0,gross=0,breaks=0,restHours=0,weekdayHours=0,holidayHours=0;const days=new Set();for(const r of rows){try{const x=calc(r);h+=x.net;gross+=x.gross;breaks+=x.breakHours;amount+=x.amount;days.add(r.date);if(x.dayType==='rest')restHours+=x.net;else if(x.dayType==='holiday')holidayHours+=x.net;else weekdayHours+=x.net}catch{}}return{h,amount,gross,breaks,restHours,weekdayHours,holidayHours,days:days.size}}
function htmlEntry(r,actions=true){let x;try{x=calc(r)}catch(e){return `<div class="item">Error on ${escape(r.date)}: ${escape(e.message)}</div>`}return `<div class="item"><div class="itemhead"><strong>${escape(r.date)} · ${escape(SHIFTS[r.shift])}</strong><strong>${money(x.amount)}</strong></div><div class="muted">${escape(DAY_TYPES[x.dayType])} · ${fmt(x.gross)} gross hours − ${fmt(x.breakHours)} break hours = <b>${fmt(x.net)} net hours</b></div><div class="muted">${r.intervals.map(i=>`${i.start}${i.startOffset?'+1':''}–${i.end}${i.endOffset?'+1':''}`).join(', ')} ${r.notes?' · '+escape(r.notes):''}</div><details><summary>Calculation details${r.calculationMode==='separate'?' · separate sessions':' · original combined method'}</summary>${x.sessions?.length>1?x.sessions.map(s=>`<div class="line"><span>${escape(s.label)} · ${fmt(s.net)} hours</span><b>${money(s.amount)}</b></div>`).join(''): ''}${x.bands.map(b=>`<div class="line"><span>${escape(b.label)}: ${fmt(b.hours)} hours × ${fmt(b.multiplier)} × ${money(x.rate)}</span><b>${money(b.amount)}</b></div>`).join('')}<p class="hint">Automatic break: ${fmt(x.automaticBreak)} hours; extra manual adjustment: ${fmt(x.manualBreak)} hours.</p></details>${actions?`<div class="itembuttons"><button data-edit="${escape(r.id)}">Edit</button><button data-delete="${escape(r.id)}">Delete</button></div>`:''}</div>`}
function inPayroll(date,period){const r=payrollRange(period);return date>=r.start&&date<=r.end}
function payrollRows(period){return state.records.filter(r=>inPayroll(r.date,period))}
function manualTax(period){return state.settings.pphOverrides?.[period]??null}
function payrollInfo(period){const data=stats(payrollRows(period));return {stats:data,calculation:computePayroll(state.settings,data.amount,{manualPph:manualTax(period)})}}
function payrollLines(p,period){
 const rate=(p.terRate*100).toLocaleString('en-US',{maximumFractionDigits:2});
 const lines=[['Monthly salary',money(p.salary)],['Overtime earnings',money(p.overtime)],['Gross earnings (salary + OT)',money(p.gross)],['JHT deduction ('+state.settings.jhtPercent+'%)','− '+money(p.jht)],['JPN deduction ('+state.settings.jpnPercent+'%)','− '+money(p.jpn)],['PPh 21 ('+(p.isManual?'manual':'TER A '+rate+'%')+')','− '+money(p.pph21)],['Total deductions','− '+money(p.totalDeductions)]];
 return lines.map(([label,val])=>`<div class="line"><span>${escape(label)}</span><b>${escape(val)}</b></div>`).join('')+
 `<div class="payroll-takehome"><span>Estimated Take-Home Pay</span><strong>${money(p.takeHome)}</strong></div>`+
 `<p class="hint">Taxable gross for TER: ${money(p.taxableGross)}${p.extraTaxable?' (includes extra taxable reference '+money(p.extraTaxable)+')':''}. ${period.endsWith('-12')?'December tax may require annual reconciliation; use manual PPh 21 from payslip.':'PPh 21 shown as estimated withholding.'} Payroll cutoff ≠ official tax-period assignment. Other employer-paid taxable benefits and deductions may change the actual payslip.</p>`;
}
function renderDashboard(){
 const period=$('dashboardPeriod').value||currentPayrollPeriod,rows=payrollRows(period),s=stats(rows),range=payrollRange(period),p=computePayroll(state.settings,s.amount,{manualPph:manualTax(period)});
 $('todayLabel').textContent=new Intl.DateTimeFormat('en-GB',{dateStyle:'full'}).format(new Date());
 $('homeMoney').textContent=money(s.amount);$('homeMonth').textContent=`${range.start} → ${range.end}`;
 $('homePayroll').innerHTML=payrollLines(p,period);
 $('homeHours').textContent=fmt(s.h)+' hours';$('homeDays').textContent=s.days;
 $('homeDrafts').textContent=rows.filter(r=>r.incomplete).length;$('homeRest').textContent=fmt(s.restHours+s.holidayHours)+' hours';
 $('todayShift').textContent=SHIFTS[shift(today)];$('nextShift').textContent=SHIFTS[shift(addDays(today,7))];$('todayWork').textContent=shift(today)==='P'?'08.00–16.00':shift(today)==='S'?'16.00–00.00':'Off';
 $('recent').innerHTML=rows.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4).map(r=>htmlEntry(r,false)).join('')||'<p class="muted">No overtime entries for this payroll period.</p>';
 const data=[];for(let n=5;n>=0;n--){const d=localDate(`${period}-01`);d.setMonth(d.getMonth()-n);const key=dateKey(d).slice(0,7);data.push({key,amount:stats(payrollRows(key)).amount})}
 const max=Math.max(...data.map(v=>v.amount),1);$('chart').innerHTML=data.map(p=>`<div class="barWrap"><div class="bar" title="${escape(p.key)}: ${money(p.amount)}" style="height:${Math.max(3,105*p.amount/max)}px"></div><small>${escape(p.key.slice(5))}/${escape(p.key.slice(2,4))}</small></div>`).join('');
}
function renderCalendar(){const m=$('calendarMonth').value||month;const [year,mo]=m.split('-').map(Number),first=new Date(year,mo-1,1),count=new Date(year,mo,0).getDate();let out='';for(let i=0;i<first.getDay();i++)out+='<div class="day empty"></div>';for(let d=1;d<=count;d++){const date=`${m}-${String(d).padStart(2,'0')}`,sh=shift(date),type=daytype(date),has=state.records.some(r=>r.date===date);const code=(type==='rest'||type==='holiday'||sh==='OFF')?'off':sh.toLowerCase();out+=`<button class="day ${code} ${has?'hasOT':''} ${date===selectedDate?'selected':''}" data-date="${date}"><b>${d}</b><small>${sh==='OFF'?'Off':sh==='P'?'Morning':'Afternoon'}</small></button>`}$('calendarGrid').innerHTML=out;renderSelectedDay()}
function renderSelectedDay(){const sh=shift(selectedDate),type=daytype(selectedDate),rr=state.records.filter(r=>r.date===selectedDate);$('selectedDay').innerHTML=`<h3>${selectedDate}</h3><p><b>${escape(SHIFTS[sh])}</b> · ${escape(DAY_TYPES[type])}</p><p class="muted">${rr.length?rr.length+' overtime entries':'No entry yet (does not necessarily mean overtime was worked)'}</p>${rr.map(r=>htmlEntry(r,false)).join('')}<div class="two"><label>Change shift<select id="overrideShift"><option value="P" ${sh==='P'?'selected':''}>Morning</option><option value="S" ${sh==='S'?'selected':''}>Afternoon</option><option value="OFF" ${sh==='OFF'?'selected':''}>Off</option></select></label><label>Category<select id="overrideType">${Object.entries(DAY_TYPES).map(([k,v])=>`<option value="${k}" ${type===k?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="actions"><button id="saveOverride">Save schedule</button><button id="addSelected" class="primary">Add overtime for this date</button></div>`}
function renderHistory(){
 const period=$('reportMonth').value||currentPayrollPeriod,q=$('historySearch').value.trim().toLowerCase(),filter=$('historyFilter').value;
 const all=payrollRows(period),rows=all.filter(r=>(filter==='all'||calc(r).dayType===filter)&&[r.date,r.notes||'',SHIFTS[r.shift]].join(' ').toLowerCase().includes(q));
 const s=stats(all),range=payrollRange(period),p=computePayroll(state.settings,s.amount,{manualPph:manualTax(period)});
 let totalDays=0;for(let d=range.start;d<=range.end;d=addDays(d,1)){if(['work','scheduled'].includes(daytype(d)))totalDays++}
 const lines=[['Scheduled workdays',totalDays+' days'],['Days with overtime entries',s.days+' days'],['Workday overtime',fmt(s.weekdayHours)+' hours'],['Rest-day overtime',fmt(s.restHours)+' hours'],['Public holiday overtime',fmt(s.holidayHours)+' hours'],['Gross overtime hours',fmt(s.gross)+' hours'],['Breaks',fmt(s.breaks)+' hours'],['Net overtime',fmt(s.h)+' hours']];
 $('reportTotals').innerHTML=`<h3>Payroll cutoff ${range.start} → ${range.end}</h3>`+lines.map(([k,v])=>`<div class="line"><span>${escape(k)}</span><b>${escape(v)}</b></div>`).join('')+'<h3>Pay estimate</h3>'+payrollLines(p,period);
 const week={};for(const r of all){const d=localDate(r.date),monday=addDays(r.date,-((d.getDay()+6)%7));(week[monday]??=[]).push(r)}
 $('weeklySummary').innerHTML=Object.entries(week).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>`<div class="line"><span>Week of ${k}</span><b>${fmt(stats(v).h)} hours · ${money(stats(v).amount)}</b></div>`).join('')||'<p class="muted">No entries.</p>';
 $('historyList').innerHTML=rows.sort((a,b)=>b.date.localeCompare(a.date)).map(r=>htmlEntry(r)).join('')||'<article><p class="muted">No entries match your filters.</p></article>';
}
function renderWeekendAudit(){
 const issues=[];
 for(const r of state.records){
  const mandatory=isMandatoryRestDate(r.date,state.settings);
  const officialHoliday=Boolean(state.holidays[r.date]||state.roster[r.date]?.dayType==='holiday');
  if(mandatory && !officialHoliday && r.dayType!=='rest')issues.push(`${r.date} · ${DAY_TYPES[r.dayType]||r.dayType} → required weekly rest day`);
  if(officialHoliday && r.dayType!=='holiday')issues.push(`${r.date} · currently ${DAY_TYPES[r.dayType]||r.dayType}; official holiday on roster`);
 }
 const node=$('weekendAuditResults');if(!node)return;
 node.innerHTML=issues.length?`<p class="audit-warning">${issues.length} record(s) need review. Stored amounts have NOT been changed.</p>`+issues.slice(0,20).map(s=>`<div class="audit-warning">${escape(s)}</div>`).join(''):`<p class="audit-ok">✓ No mandatory-rest-day classification conflicts in ${state.records.length} saved record(s).</p>`;
}
let cloudLinked=false;
function cloudStatus(message){$('cloudBackupStatus').textContent=message}
function cloudUI(){
 $('cloudBackupNow').disabled=!cloudLinked;
 $('cloudRestore').disabled=!cloudLinked;
 $('cloudDisconnect').disabled=!cloudLinked;
 $('cloudAuto').disabled=!cloudLinked;
 $('cloudAuto').checked=cloudLinked&&cloudEnabled;
}
async function validateCloudState(data){
 if(!data||!data.settings||!Array.isArray(data.records)||!data.roster||!data.holidays)throw Error('Invalid backup');
 for(const r of data.records)calculate(r,data.settings);
 return data;
}
async function connectCloud(){
 try{
  cloudStatus('Connecting…');
  if(!cloudClient)cloudClient=await import('./cloud-backup.mjs');
  if(!cloudClient.isConfigured()){cloudStatus('Cloud backup requires Firebase setup. See SETUP_FIREBASE.md. Local backups still work.');return}
  const user=await cloudClient.connect();cloudLinked=true;cloudLinkedUid=user.uid;cloudEnabled=false;cloudUI();
  const existing=await cloudClient.getBackup();
  if(existing){cloudStatus(`Connected as ${user.email}. An existing backup is on the cloud. Review restore or explicitly replace it before enabling automatic backup.`)}
  else{cloudStatus(`Connected as ${user.email}. No cloud backup yet. Use Back up now to create your first one.`)}
 }catch(e){cloudStatus(`Connection failed: ${e.message}`);show('Cloud connection failed');cloudLinked=false;cloudUI()}
}
async function doCloudBackup(confirmOverwrite=true){
 if(!cloudLinked||cloudBusy||!navigator.onLine)return;
 cloudBusy=true;
 try{
  if(confirmOverwrite){const existing=await cloudClient.getBackup();if(existing && !confirm('Replace the existing cloud backup with your current local data? Export a JSON backup first.'))return}
  cloudStatus('Uploading secure-connection backup…');
  await cloudClient.saveBackup(state);
  cloudStatus('Cloud backup saved successfully at '+new Date().toLocaleString()+'.');
 }catch(e){cloudStatus('Cloud backup failed: '+e.message);cloudEnabled=false;cloudUI()}
 finally{cloudBusy=false}
}
function scheduleCloudBackup(){
 if(!cloudLinked||!cloudEnabled||!navigator.onLine)return;
 clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>{doCloudBackup(false)},2500);
}
async function cloudRestorePreview(){
 try{
  const backup=await cloudClient.getBackup();if(!backup){show('No cloud backup exists');return}
  const data=await validateCloudState(cloudClient.decodeBackup(backup));
  const message=`Cloud contains ${data.records.length} overtime record(s), ${Object.keys(data.roster).length} roster dates. Local device has ${state.records.length} record(s).\n\nRestore will REPLACE all local records, settings and roster. Download JSON backup first. Continue?`;
  if(!confirm(message))return;
  state={...fresh(),...data,settings:{...DEFAULTS,...data.settings}};
  await persist();settingInputs();show('Cloud backup restored locally');
 }catch(e){show('Cloud restore failed: '+e.message)}
}
function renderHolidays(){$('holidayList').innerHTML=Object.entries(state.holidays).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,name])=>`<div class="line"><span>${escape(d)} · ${escape(name)}</span><button data-holiday-delete="${d}">Delete</button></div>`).join('')||'<p class="muted">No holidays saved.</p>'}
// Render only the visible screen: re-rendering all reports and the full calendar
// on every save or tab switch caused avoidable work on low-end Android phones.
function render(){
 const active=document.querySelector('.page.active')?.id;
 if(active==='dashboard')renderDashboard();
 if(active==='settings'){renderWeekendAudit();renderHolidays();cloudUI();}
 else if(active==='calendar')renderCalendar();
 else if(active==='history')renderHistory();

}

function timeMinutes(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function makeInterval(it={start:'16:00',end:'19:00',startOffset:0,endOffset:0},label='Overtime session'){
 const el=document.createElement('div');el.className='interval';
 el.innerHTML=`<div class="sectionHead"><strong>${escape(label)}</strong></div><div class="two"><label>Start time<input class="start" type="time" required value="${it.start}"></label><label>End time<input class="end" type="time" required value="${it.end}"></label></div><div class="sessionNote muted"></div>`;
 el.dataset.startOffset=String(it.startOffset||0);
 el.querySelectorAll('input').forEach(input=>input.addEventListener('input',updateCalc));
 $('intervals').appendChild(el);return el;
}
function currentInterval(el){
 const start=el.querySelector('.start').value,end=el.querySelector('.end').value;
 const startOffset=+(el.dataset.startOffset||0);
 // Crossing midnight is inferred. A 00:00 end is the next calendar day.
 const endOffset=startOffset+(timeMinutes(end)<=timeMinutes(start)?1:0);
 return{start,end,startOffset,endOffset};
}
function defaultSession(mode,sh){
 if(mode==='before')return sh==='S'?{start:'08:00',end:'16:00',startOffset:0}:{start:'06:00',end:'08:00',startOffset:0};
 if(mode==='after')return sh==='S'?{start:'01:00',end:'03:00',startOffset:1}:{start:'16:00',end:'19:00',startOffset:0};
 return {start:'08:00',end:'12:00',startOffset:0};
}
function createSessions(mode,keep=null){
 const sh=$('otShift').value;
 $('intervals').innerHTML='';
 if(mode==='both'){
  makeInterval(keep?.[0]||defaultSession('before',sh),'Before shift');
  makeInterval(keep?.[1]||defaultSession('after',sh),'After shift');
 }else if(mode==='before'||mode==='after'){
  makeInterval(keep?.[0]||defaultSession(mode,sh),mode==='before'?'Before shift':'After shift');
 }else{
  const arr=keep?.length?keep:[defaultSession('rest',sh)];
  for(const item of arr)makeInterval(item,mode==='rest'?'Rest-day overtime':'Overtime session');
 }
 updateCalc();
}
function setOvertimeMode(mode,keep=null){
 $('overtimeMode').value=mode;
 $('addInterval').hidden=mode!=='rest'&&mode!=='custom';
 createSessions(mode,keep);
}
function entryFromForm(){return{id:$('recordId').value||crypto.randomUUID(),date:$('otDate').value,shift:$('otShift').value,dayType:$('otType').value,intervals:[...$('intervals').children].map(currentInterval),manualBreak:+$('manualBreak').value,calculationMode:'separate',notes:$('otNotes').value.trim()}}
function updateCalc(){try{const r=entryFromForm();if(isMandatoryRestDate(r.date,state.settings)&&r.dayType!=='holiday'){r.dayType='rest';$('otType').value='rest';}const x=calc(r);
 [...$('intervals').children].forEach((el,i)=>{
 const item=r.intervals[i];el.querySelector('.sessionNote').textContent=item.startOffset?`Starts on ${addDays(r.date,item.startOffset)}${item.endOffset>item.startOffset?', ends the following day':''}`:(item.endOffset?'Ends the following day':'Same work date');
 });
 $('liveCalc').innerHTML=`<div class="line"><span>Gross</span><b>${fmt(x.gross)} hours</b></div><div class="line"><span>Automatic breaks</span><b>${fmt(x.automaticBreak)} hours</b></div><div class="line"><span>Total breaks</span><b>${fmt(x.breakHours)} hours</b></div><div class="line"><span>Net overtime</span><b>${fmt(x.net)} hours</b></div>${x.sessions?.length>1?x.sessions.map(s=>`<div class="line"><span><strong>${escape(s.label)}</strong> · ${fmt(s.net)} net hours</span><b>${money(s.amount)}</b></div>`).join(''):''}${x.bands.map(b=>`<div class="line"><span>${escape(b.label)} · ${fmt(b.hours)} × ${fmt(b.multiplier)}</span><b>${money(b.amount)}</b></div>`).join('')}<p>Estimated overtime payment</p><div class="total">${money(x.amount)}</div>`
 }catch(e){$('liveCalc').innerHTML=`<p class="muted">${escape(e.message)}</p>`}}
function autoFormDate(){const date=$('otDate').value;if(!date)return;$('otShift').value=shift(date);$('otType').value=daytype(date);const sh=$('otShift').value;setOvertimeMode(sh==='OFF'?'rest':sh==='S'?'before':'after')}
function clearForm(date=today){editing=null;$('editorTitle').textContent='Add overtime';$('otForm').reset();$('recordId').value='';$('otDate').value=date;$('manualBreak').value='0';autoFormDate()}
function editRecord(id){const r=state.records.find(v=>v.id===id);if(!r)return;editing=id;$('editorTitle').textContent='Edit overtime';$('recordId').value=r.id;$('otDate').value=r.date;$('otShift').value=r.shift;$('otType').value=r.dayType;$('manualBreak').value=r.manualBreak;$('otNotes').value=r.notes||'';
 let mode=r.shift==='OFF'?'rest':r.intervals.length===2?'both':r.intervals.length!==1?'custom':r.shift==='S'?(r.intervals[0].startOffset?'after':'before'):(r.intervals[0].startOffset||timeMinutes(r.intervals[0].start)<480?'before':'after');
 // Preserve old records exactly, including explicit day offsets in legacy entries.
 setOvertimeMode(mode,r.intervals);navigate('add')}
function settingInputs(){const s=state.settings;for(const id of ['jhtPercent','jpnPercent','extraTaxableIncome'])$(id).value=s[id]??(id==='jhtPercent'?2:id==='jpnPercent'?1:0);$('pphOverride').value=s.pphOverrides?.[$('dashboardPeriod').value||currentPayrollPeriod]??'';for(const id of ['salary','hourly','rotationStart','firstShift','restThreshold','reminderTime'])$(id).value=s[id];$('weekday1').value=s.weekday[0];$('weekday2').value=s.weekday[1];$('rest1').value=s.rest[0];$('rest2').value=s.rest[1];$('rest3').value=s.rest[2];$('reminderEnabled').checked=s.reminderEnabled;const names=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];$('restDays').innerHTML=names.map((n,i)=>`<label><input type="checkbox" value="${i}" ${i===0||s.restDays.includes(i)?'checked':''} ${i===0?'disabled':''}> ${n}</label>`).join('')}
function exportDownload(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function csvCell(v){return '"'+String(v??'').replaceAll('"','""')+'"'}
async function readRoster(file){if(!file||file.size>8e6)throw Error('Select a roster file under 8 MB');if(file.name.toLowerCase().endsWith('.csv'))return parseCSV(await file.text());if(!/\.(xlsx|xls)$/i.test(file.name))throw Error('Use a CSV or XLSX file');if(!globalThis.XLSX){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';script.onload=resolve;script.onerror=()=>reject(Error('Excel reader is not available offline yet. Connect once or convert the roster to CSV.'));document.head.appendChild(script)})}const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''})}
function events(){
 document.querySelectorAll('.theme-buttons [data-theme]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.theme)));
 $('cloudConnect').onclick=connectCloud;
 $('cloudBackupNow').onclick=()=>doCloudBackup(true);
 $('cloudRestore').onclick=cloudRestorePreview;
 $('cloudDisconnect').onclick=async()=>{clearTimeout(cloudTimer);cloudEnabled=false;cloudLinked=false;try{await cloudClient?.disconnect()}catch{}cloudUI();cloudStatus('Disconnected. Local data remains available.')};
 $('cloudAuto').onchange=async e=>{if(!cloudLinked){e.target.checked=false;return}if(e.target.checked){const existing=await cloudClient.getBackup().catch(()=>null);if(existing&&!confirm('Enable automatic backup? Your local data will overwrite the existing cloud backup when saved. Export a backup first.')){e.target.checked=false;return}cloudEnabled=true;await doCloudBackup(false)}else{cloudEnabled=false;clearTimeout(cloudTimer)}cloudUI()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>navigate(b.dataset.page));$('calendarMonth').onchange=renderCalendar;$('reportMonth').onchange=renderHistory;$('dashboardPeriod').onchange=renderDashboard;$('historySearch').oninput=renderHistory;$('historyFilter').onchange=renderHistory;$('calendarGrid').onclick=e=>{const b=e.target.closest('[data-date]');if(b){selectedDate=b.dataset.date;renderCalendar()}};$('selectedDay').onclick=async e=>{if(e.target.id==='addSelected'){clearForm(selectedDate);navigate('add')}if(e.target.id==='saveOverride'){state.roster[selectedDate]={shift:$('overrideShift').value,dayType:isMandatoryRestDate(selectedDate,state.settings)&&$('overrideType').value!=='holiday'?'rest':$('overrideType').value,source:'manual'};await persist();show('Schedule updated.')}};$('addInterval').onclick=()=>{makeInterval({start:'08:00',end:'10:00',startOffset:0},'Additional session');updateCalc()};$('overtimeMode').onchange=()=>setOvertimeMode($('overtimeMode').value);$('otDate').onchange=autoFormDate;$('otShift').onchange=()=>setOvertimeMode($('otShift').value==='OFF'?'rest':$('otShift').value==='S'?'before':'after');$('otType').onchange=updateCalc;$('manualBreak').oninput=updateCalc;$('cancelEdit').onclick=()=>clearForm();$('otForm').onsubmit=async e=>{e.preventDefault();try{const r=entryFromForm();if(isMandatoryRestDate(r.date,state.settings)&&r.dayType!=='holiday')r.dayType='rest';if(!r.date||!r.intervals.length)throw Error('Enter a date and an overtime interval');const x=calc(r);if(x.net<=0)throw Error('Net overtime must be greater than zero');if(!editing&&state.records.some(old=>old.date===r.date))throw Error('An overtime entry already exists for this work date. Please edit that entry and select Before & After Shift. Each session is calculated separately.');const idx=state.records.findIndex(old=>old.id===r.id);if(idx>=0&&state.records[idx].intervals?.length>1&&!state.records[idx].calculationMode){const previous=calc(state.records[idx]);if(Math.abs(previous.amount-x.amount)>0.005&&!confirm('This older record used combined overtime multipliers. Saving now will use separate Before/After multipliers and change the estimated amount from '+money(previous.amount)+' to '+money(x.amount)+'. Continue?'))return;}if(idx>=0){r.rateSnapshot=state.records[idx].rateSnapshot;r.ruleSnapshot=state.records[idx].ruleSnapshot;state.records[idx]=r}else{r.rateSnapshot=Number(state.settings.hourly);r.ruleSnapshot={weekday:[...state.settings.weekday],rest:[...state.settings.rest],restThreshold:Number(state.settings.restThreshold)};state.records.push(r)}await persist();clearForm();navigate('history');show('Overtime saved')}catch(err){alert(err.message)}};
$('historyList').onclick=async e=>{const ed=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(ed)editRecord(ed.dataset.edit);if(del&&confirm('Delete this overtime entry?')){state.records=state.records.filter(r=>r.id!==del.dataset.delete);await persist();show('Entry deleted')}};
$('settingsForm').onsubmit=async e=>{e.preventDefault();const s=state.settings;s.salary=+$('salary').value;s.hourly=+$('hourly').value;s.jhtPercent=+$('jhtPercent').value;s.jpnPercent=+$('jpnPercent').value;s.extraTaxableIncome=+$('extraTaxableIncome').value;s.pphOverrides??={};const overridePeriod=$('dashboardPeriod').value||currentPayrollPeriod;if($('pphOverride').value.trim()==='')delete s.pphOverrides[overridePeriod];else s.pphOverrides[overridePeriod]=+$('pphOverride').value;s.weekday=[+$('weekday1').value,+$('weekday2').value];s.rest=[+$('rest1').value,+$('rest2').value,+$('rest3').value];s.restThreshold=+$('restThreshold').value;s.rotationStart=$('rotationStart').value;s.firstShift=$('firstShift').value;s.restDays=[...new Set([0,...$('restDays').querySelectorAll('input:checked')].map(i=>typeof i==='number'?i:+i.value))];s.reminderEnabled=$('reminderEnabled').checked;s.reminderTime=$('reminderTime').value;if(!s.rotationStart||[s.jhtPercent,s.jpnPercent,s.extraTaxableIncome,...Object.values(s.pphOverrides||{})].some(v=>!Number.isFinite(v)||v<0)||s.jhtPercent>100||s.jpnPercent>100||!Number.isFinite(s.hourly)||s.hourly<0||s.restThreshold<1||[...s.weekday,...s.rest].some(v=>!Number.isFinite(v)||v<0)){alert('Check your settings values');return}await persist();show('Settings saved. Existing entries are unchanged.')};$('saveHoliday').onclick=async()=>{const date=$('holidayDate').value,name=$('holidayName').value.trim();if(!date||!name)return show('Enter the holiday date and name');state.holidays[date]=name;await persist();$('holidayName').value='';show('Holiday added')};$('holidayList').onclick=async e=>{const b=e.target.closest('[data-holiday-delete]');if(b&&confirm('Delete this holiday?')){delete state.holidays[b.dataset.holidayDelete];await persist()}};
$('previewRoster').onclick=async()=>{try{const file=$('rosterFile').files[0],rows=await readRoster(file);pendingImport=parseRoster(rows);const dates=Object.keys(pendingImport),overwrites=dates.filter(d=>state.roster[d]).length;$('rosterPreview').innerHTML=`<p><b>${dates.length} valid dates.</b> ${overwrites} dates will replace existing roster entries. Check before confirming.</p>${dates.slice(0,12).map(d=>`<div class="line"><span>${d}</span><b>${SHIFTS[pendingImport[d].shift]}</b></div>`).join('')}<button id="confirmImport" class="primary full">Confirm import</button>`}catch(e){pendingImport=null;$('rosterPreview').textContent='Failed: '+e.message}};$('rosterPreview').onclick=async e=>{if(e.target.id==='confirmImport'&&pendingImport){const count=Object.keys(pendingImport).length;for(const [date,item] of Object.entries(pendingImport)){if(isMandatoryRestDate(date,state.settings)&&item.dayType!=='holiday')item.dayType='rest';}Object.assign(state.roster,pendingImport);pendingImport=null;$('rosterPreview').innerHTML='';await persist();show(count+' roster dates imported')}};
$('exportCSV').onclick=()=>{const m=$('reportMonth').value;const records=payrollRows(m);const header=['Date','Shift','Category','Interval','Gross (hours)','Breaks (hours)','Net (hours)','Hourly rate','Estimate (IDR)','Notes'];const lines=records.map(r=>{const c=calc(r);return[r.date,SHIFTS[r.shift],DAY_TYPES[r.dayType],r.intervals.map(i=>`${i.start}+${i.startOffset}–${i.end}+${i.endOffset}`).join(' | '),c.gross,c.breakHours,c.net,c.rate,c.amount,r.notes].map(csvCell).join(',')});exportDownload(`overtime-report-${m}.csv`,'\ufeff'+[header.map(csvCell).join(','),...lines].join('\r\n'),'text/csv;charset=utf-8')};$('printPDF').onclick=()=>{navigate('history');window.print()};$('backupBtn').onclick=()=>exportDownload(`backup-my-ot-${today}.json`,JSON.stringify(state,null,2),'application/json');$('restoreFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;const data=JSON.parse(await file.text());if(!data.settings||!Array.isArray(data.records)||!data.roster||!data.holidays)throw Error('Invalid backup format');for(const r of data.records)calculate(r,data.settings);if(confirm('Replace all current data with this backup?')){state=data;await persist();settingInputs();show('Backup restored')}}catch(err){alert('Backup restore failed: '+err.message)}e.target.value=''};$('resetSettings').onclick=async()=>{if(confirm('Reset only settings? Overtime history will not be deleted.')){state.settings=structuredClone(DEFAULTS);settingInputs();await persist()}};$('notificationPermission').onclick=async()=>{if(!('Notification'in window))return show('Notifications are unavailable');const p=await Notification.requestPermission();show('Notification permission: '+p)};
}
function checkReminder(){const s=state.settings;if(!s.reminderEnabled)return;const now=new Date(),time=now.toTimeString().slice(0,5);if(time<s.reminderTime)return;const key='reminder-'+today;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');if(!state.records.some(r=>r.date===today)&&shift(today)!=='OFF'){show('Reminder: check if you have overtime to record');if('Notification'in window&&Notification.permission==='granted')new Notification('My OT Tracker',{body:'Check whether you have overtime to record today.'})}}
async function init(){applyTheme(localStorage.getItem(THEME_KEY)||'system');matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(localStorage.getItem(THEME_KEY)==='system')applyTheme('system')});initMotivation();try{const v=await readDB();if(v){state={...fresh(),...v,settings:{...DEFAULTS,...v.settings}}}}catch(e){alert('Local storage is unavailable: '+e.message)}$('calendarMonth').value=month;$('reportMonth').value=currentPayrollPeriod;$('dashboardPeriod').value=currentPayrollPeriod;$('otDate').value=today;events();settingInputs();clearForm();render();document.querySelector('nav [data-page="dashboard"]').classList.add('selected');checkReminder();document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReminder()});$('offlineStatus').textContent=navigator.onLine?'Offline ready':'Offline';window.addEventListener('online',()=>{$('offlineStatus').textContent='Offline ready'});window.addEventListener('offline',()=>{$('offlineStatus').textContent='Offline'});if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
init();
