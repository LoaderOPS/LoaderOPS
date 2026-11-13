export const DEFAULTS={salary:5730100,hourly:33121,weekday:[1.5,2],rest:[2,3,4],restThreshold:7,rotationStart:'2026-11-16',firstShift:'P',restDays:[0],reminderTime:'20:30',reminderEnabled:false,jhtPercent:2,jpnPercent:1,ptkp:'TK/0',extraTaxableIncome:0,pphOverrides:{}};
export const DAY_TYPES={work:'Workday',scheduled:'Extra workday',rest:'Weekly rest day',holiday:'Public holiday'};
export const SHIFTS={P:'Morning · 08:00–16:00',S:'Afternoon · 16:00–00:00',OFF:'Off'};
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'IDR',minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
export function dateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export const localDate=key=>new Date(`${key}T12:00:00`);
export function addDays(key,n){const d=localDate(key);d.setDate(d.getDate()+n);return dateKey(d)}
export function dayDifference(a,b){return Math.round((Date.UTC(...a.split('-').map((v,i)=>i===1?Number(v)-1:Number(v)))-Date.UTC(...b.split('-').map((v,i)=>i===1?Number(v)-1:Number(v))))/86400000)}
export function rotationShift(date,settings){
  const weeks=Math.floor(dayDifference(date,settings.rotationStart)/7);
  return Math.abs(weeks)%2===0?settings.firstShift:(settings.firstShift==='P'?'S':'P')
}
export function isAfternoonSaturday(date,settings){
  return localDate(date).getDay()===6&&rotationShift(date,settings)==='S'
}
export function isMandatoryRestDate(date,settings){
  return localDate(date).getDay()===0||isAfternoonSaturday(date,settings)
}
export function shiftFor(date,settings,roster={}){
  if(roster[date]?.shift)return roster[date].shift;
  if(isMandatoryRestDate(date,settings))return 'OFF';
  if(settings.restDays?.includes(localDate(date).getDay()))return 'OFF';
  return rotationShift(date,settings)
}
export function dayTypeFor(date,settings,roster={},holidays={}){
  if(holidays[date]||roster[date]?.dayType==='holiday')return 'holiday';
  // Every Sunday and Saturday during an afternoon rotation are fixed rest days.
  // An official roster indicating work does not change the overtime category.
  if(isMandatoryRestDate(date,settings))return 'rest';
  if(roster[date]?.dayType)return roster[date].dayType;
  if(roster[date]?.shift==='OFF')return 'rest';
  if(settings.restDays?.includes(localDate(date).getDay())&&!roster[date]?.shift)return 'rest';
  return 'work'
}
export function parseLocal(date,time,offset=0){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Invalid date or time');const [h,m]=time.split(':').map(Number);const d=localDate(addDays(date,offset));d.setHours(h,m,0,0);return d.getTime()}
export function overlap(a,b,c,d){return Math.max(0,Math.min(b,d)-Math.max(a,c))}
export function standardBreakWindows(workDate,shift){const ans=[];if(shift==='P')ans.push([parseLocal(workDate,'18:00'),parseLocal(workDate,'19:00')]);if(shift==='S'){ans.push([parseLocal(workDate,'12:00'),parseLocal(workDate,'13:00')]);ans.push([parseLocal(workDate,'00:00',1),parseLocal(workDate,'01:00',1)])}return ans}
export function calculate(record,settings){const intervals=record.intervals||[];let segments=[];for(const it of intervals){const start=parseLocal(record.date,it.start,it.startOffset||0),end=parseLocal(record.date,it.end,it.endOffset||0);if(end<=start)throw Error('End time must be after start time. Select +1 day if it crosses midnight');if(end-start>36*3600000)throw Error('An interval cannot exceed 36 hours');segments.push([start,end])}
// Workday overtime must never include regular paid shift time.
if((record.dayType==='work'||record.dayType==='scheduled')&&record.shift!=='OFF'){
 const shiftStart=parseLocal(record.date,record.shift==='P'?'08:00':'16:00');
 const shiftEnd=parseLocal(record.date,record.shift==='P'?'16:00':'00:00',record.shift==='S'?1:0);
 for(const [a,b] of segments)if(overlap(a,b,shiftStart,shiftEnd)>0)throw Error('Overtime overlaps your scheduled shift. Record only time before or after your shift.');
}
segments.sort((a,b)=>a[0]-b[0]);for(let i=1;i<segments.length;i++)if(segments[i][0]<segments[i-1][1])throw Error('Overtime intervals overlap');
const gross=segments.reduce((s,[a,b])=>s+(b-a)/60000,0);let breakDeduct=0;const breaks=[];for(const [a,b] of standardBreakWindows(record.date,record.shift)){const mins=segments.reduce((sum,[x,y])=>sum+overlap(x,y,a,b)/60000,0);if(mins>0){breakDeduct+=mins;breaks.push({label:`${new Date(a).getHours().toString().padStart(2,'0')}:00–${new Date(b).getHours().toString().padStart(2,'0')}:00`,minutes:mins})}}
const manual=Number(record.manualBreak||0);if(!Number.isFinite(manual)||manual<0)throw Error('Invalid manual break adjustment');const totalBreak=Math.min(gross,Math.max(0,breakDeduct+manual));const net=Math.max(0,gross-totalBreak)/60;
const rate=Number(record.rateSnapshot??settings.hourly);if(!Number.isFinite(rate)||rate<0)throw Error('Invalid hourly rate');const type=record.dayType||'work';const multipliers=record.ruleSnapshot||{weekday:settings.weekday,rest:settings.rest,restThreshold:settings.restThreshold};const [first,sub]=multipliers.weekday;const [restA,restB,restC]=multipliers.rest;const threshold=Number(multipliers.restThreshold);const bands=[];let remaining=net;const band=(limit,m,label)=>{const qty=Math.min(remaining,limit);if(qty>1e-9){bands.push({label,hours:qty,multiplier:Number(m),amount:qty*Number(m)*rate});remaining-=qty}};
if(type==='work'||type==='scheduled'){band(1,first,'First hour');band(Infinity,sub,'Subsequent hours')}else{band(threshold,restA,`Hours 1–${threshold}`);band(1,restB,`Hour ${threshold+1}`);band(Infinity,restC,`Hour ${threshold+2} onward`)}
return {gross:gross/60,automaticBreak:breakDeduct/60,manualBreak:manual/60,breakHours:totalBreak/60,net,rate,dayType:type,breaks,bands,amount:bands.reduce((s,b)=>s+b.amount,0)} }
// Explicit opt-in for new Before & After records. Historical records without
// calculationMode retain their original combined method until intentionally edited.
export function calculateBySession(record,settings){
  if(record.calculationMode!=='separate' || (record.intervals||[]).length<2)
    return calculate(record,settings);
  // Validate the full set first: do not allow session overlaps or regular-shift overlap.
  calculate({...record,manualBreak:0},settings);
  const rate=Number(record.rateSnapshot??settings.hourly);
  const inputManual=Number(record.manualBreak||0);
  if(!Number.isFinite(inputManual)||inputManual<0)throw Error('Invalid manual break adjustment');
  let manualLeft=inputManual;
  let gross=0,automaticBreak=0,manualBreak=0,breakHours=0,net=0,amount=0;
  const breaks=[],bands=[],sessions=[];
  for(let i=0;i<record.intervals.length;i++){
    const interval=record.intervals[i];
    const preliminary=calculate({...record,intervals:[interval],manualBreak:0},settings);
    // Deduct manual break time from the first session with payable time remaining,
    // carrying any remaining deduction forward to the next session.
    const applied=Math.min(manualLeft,preliminary.net*60);
    manualLeft-=applied;
    const result=calculate({...record,intervals:[interval],manualBreak:applied},settings);
    const label=record.shift==='OFF'?`Session ${i+1}`:
      (record.intervals.length===2?(i===0?'Before Shift':'After Shift'):`Session ${i+1}`);
    sessions.push({label,interval,...result});
    gross+=result.gross;automaticBreak+=result.automaticBreak;
    manualBreak+=result.manualBreak;breakHours+=result.breakHours;
    net+=result.net;amount+=result.amount;
    breaks.push(...result.breaks.map(b=>({...b,session:label})));
    bands.push(...result.bands.map(b=>({...b,label:`${label} · ${b.label}`})));
  }
  return {gross,automaticBreak,manualBreak,breakHours,net,amount,rate,
    dayType:record.dayType||'work',breaks,bands,sessions,calculationMode:'separate'};
}
export function normalizeShift(v){const a=String(v??'').trim().toUpperCase();if(['P','PAGI','1','SHIFT 1','SHIFT PAGI','MORNING','08:00-16:00','08.00-16.00'].includes(a))return'P';if(['S','SORE','2','SHIFT 2','SHIFT SORE','AFTERNOON','16:00-00:00','16.00-00.00','16:00-24:00','16.00-24.00'].includes(a))return'S';if(['OFF','LIBUR','L','X','REST','HOLIDAY','CUTI','-'].includes(a))return'OFF';return null}
export function parseCSV(text){let out=[],row=[],v='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(!quoted&&(',;\t'.includes(c))){row.push(v);v=''}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(v);if(row.some(x=>x.trim()))out.push(row);row=[];v=''}else v+=c}row.push(v);if(row.some(x=>x.trim()))out.push(row);return out}
export function parseDate(v){if(typeof v==='number'&&v>30000&&v<100000)return new Date(Date.UTC(1899,11,30)+v*86400000).toISOString().slice(0,10);let s=String(v??'').trim();if(/^\d{4}-\d\d-\d\d$/.test(s)){if(dateKey(localDate(s))===s)return s;return null}let m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(!m)return null;const d=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return dateKey(localDate(d))===d?d:null}
export function parseRoster(rows){const headers=(rows[0]||[]).map(x=>String(x).trim().toLowerCase());const di=headers.findIndex(s=>/^(date|tanggal|tgl)$/.test(s));const si=headers.findIndex(s=>/^(shift|jadwal|roster|kode shift)$/.test(s));const ti=headers.findIndex(s=>/^(tipe hari|day.type|kategori hari|day_type)$/.test(s));if(di<0||si<0)throw Error('Roster must include Date and Shift columns.');const data={},errors=[];for(let k=1;k<rows.length;k++){const r=rows[k];if(!r.some(x=>String(x).trim()))continue;const d=parseDate(r[di]),s=normalizeShift(r[si]);if(!d||!s||data[d]){errors.push(k+1);continue}let dayType=ti>=0?String(r[ti]).toLowerCase().trim():'';dayType=({'kerja':'work','work':'work','tambahan':'scheduled','scheduled':'scheduled','istirahat':'rest','rest':'rest','libur':'holiday','holiday':'holiday'})[dayType]||undefined;data[d]={shift:s,...(dayType?{dayType}:{}),source:'import'} }if(errors.length)throw Error('Invalid or duplicate data at rows: '+errors.slice(0,12).join(', '));if(!Object.keys(data).length)throw Error('Roster is empty');return data}

// Official PP 58/2023 — monthly effective withholding rates, category A (TK/0, TK/1, K/0).
// Each entry is an inclusive upper bound and its rate; last is Infinity.
export const TER_A = [
[5400000,0],[5650000,.0025],[5950000,.005],[6300000,.0075],[6750000,.01],
[7500000,.0125],[8550000,.015],[9650000,.0175],[10050000,.02],
[10350000,.0225],[10700000,.025],[11050000,.03],[11600000,.035],
[12500000,.04],[13750000,.05],[15100000,.06],[16950000,.07],
[19750000,.08],[24150000,.09],[26450000,.10],[28000000,.11],
[30050000,.12],[32400000,.13],[35400000,.14],[39100000,.15],
[43850000,.16],[47800000,.17],[51400000,.18],[56300000,.19],
[62200000,.20],[68600000,.21],[77500000,.22],[89000000,.23],
[103000000,.24],[125000000,.25],[157000000,.26],[206000000,.27],
[337000000,.28],[454000000,.29],[550000000,.30],[695000000,.31],
[910000000,.32],[1400000000,.33],[Infinity,.34]
];
export function terCategoryARate(gross){
 if(!Number.isFinite(gross)||gross<0)throw Error('Invalid taxable gross');
 return TER_A.find(([upper])=>gross<=upper)[1];
}
// periodKey is the month in which the cutoff ENDS (e.g. 2026-12 => 2026-11-16…2026-12-15).
export function payrollPeriodForDate(date){
 const [y,m,d]=date.split('-').map(Number);
 if(d<=15)return `${y}-${String(m).padStart(2,'0')}`;
 return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}`;
}
export function payrollRange(periodKey){
 const [year,month]=periodKey.split('-').map(Number);
 const y=month===1?year-1:year,m=month===1?12:month-1;
 return {start:`${y}-${String(m).padStart(2,'0')}-16`,end:`${year}-${String(month).padStart(2,'0')}-15`};
}
export function computePayroll(settings, overtimeAmount, {manualPph=null}={}){
 const salary=Number(settings.salary||0), overtime=Number(overtimeAmount||0);
 const gross=salary+overtime;
 const extraTaxable=Number(settings.extraTaxableIncome||0);
 const taxableGross=gross+extraTaxable;
 const jht= Math.round(salary*Number(settings.jhtPercent??2)/100);
 const jpn= Math.round(salary*Number(settings.jpnPercent??1)/100);
 const terRate=terCategoryARate(taxableGross);
 const terEstimated=Math.round(taxableGross*terRate);
 const override=manualPph===null||manualPph===''?null:Number(manualPph);
 if(override!==null&&(!Number.isFinite(override)||override<0))throw Error('Invalid PPh 21 override');
 const pph21=override??terEstimated;
 return {salary,overtime,gross,extraTaxable,taxableGross,jht,jpn,terRate,terEstimated,pph21,totalDeductions:jht+jpn+pph21,takeHome:gross-jht-jpn-pph21,isManual:override!==null};
}
