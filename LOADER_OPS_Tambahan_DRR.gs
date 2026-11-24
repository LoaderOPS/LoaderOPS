/** LOADER OPS - DRR Master extension. Paste into a NEW Apps Script file, not into Kode.gs.
 * Uses existing functions db_(), user_(), requireAdmin_(), log_(), rows_(), CFG.
 * CSV import in Index; server always validates imported rows.
 */
const DRR_SHEET_NAME = 'DRR_MASTER';
const DRR_HEADERS = ['BILLING_WEEK','DATE','TYPE','REFERENCE','CTN_DRR','CUSTOMER','IMPORTED_AT','IMPORTED_BY','BATCH_ID'];

function drrSheet_(){
  const ss=db_();let sh=ss.getSheetByName(DRR_SHEET_NAME);
  if(!sh){sh=ss.insertSheet(DRR_SHEET_NAME);sh.getRange(1,1,1,DRR_HEADERS.length).setValues([DRR_HEADERS]);sh.setFrozenRows(1);}
  return sh;
}
function normalizeRefDrr_(s){return String(s||'').trim().toUpperCase().replace(/\s+/g,' ');}
function normDrrDate_(s){
  s=String(s||'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const a=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if(a)return a[3]+'-'+a[2]+'-'+a[1];
  throw Error('Tanggal DRR harus YYYY-MM-DD atau DD/MM/YYYY.');
}
function normDrrType_(s){s=String(s||'').trim().toUpperCase();if(s==='IN'||s==='INBOUND')return 'INBOUND';if(s==='OUT'||s==='OUTBOUND')return 'OUTBOUND';throw Error('Jenis DRR harus INBOUND/OUTBOUND.');}
function getDrrRows(week){
  const u=user_();if(u.role!=='ADMIN'&&u.role!=='SPV'&&u.role!=='BILLING')throw Error('Akses DRR hanya untuk admin/billing.');
  const sh=drrSheet_(),v=sh.getDataRange().getDisplayValues().slice(1);
  const w=String(week||'').trim();
  return v.filter(r=>r[0]&&(!w||r[0]===w)).slice(0,5000).map(r=>({week:r[0],date:r[1],type:r[2],reference:r[3],ctn:Number(r[4]),customer:r[5],batch:r[8]}));
}
function importDrrMaster(payload){
  const u=requireAdmin_(),week=String(payload&&payload.week||'').trim(),items=payload&&payload.rows;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(week))throw Error('Pilih awal periode billing dalam format YYYY-MM-DD.');
  if(!Array.isArray(items)||!items.length||items.length>1000)throw Error('Impor 1 sampai 1000 baris per batch.');
  const clean=items.map((r,i)=>{
    try{
      const d=normDrrDate_(r.date),t=normDrrType_(r.type),ref=normalizeRefDrr_(r.reference),ctn=Number(r.ctn);
      if(!/^[A-Z0-9 -]{4,40}$/.test(ref))throw Error('Nomor kendaraan/container tidak valid');
      if(!Number.isSafeInteger(ctn)||ctn<0||ctn>1000000)throw Error('CTN DRR harus bilangan bulat 0–1.000.000');
      const date=new Date(d+'T12:00:00'),day=date.getDay(),back=(day-5+7)%7,friday=new Date(date);friday.setDate(date.getDate()-back);
      const calculated=Utilities.formatDate(friday,CFG.tz,'yyyy-MM-dd');
      if(calculated!==week)throw Error('Tanggal '+d+' tidak berada dalam minggu Jumat '+week+' (validasi berdasarkan tanggal kalender)');
      return {date:d,type:t,reference:ref,ctn,customer:String(r.customer||'').trim().slice(0,100)};
    }catch(e){throw Error('Baris DRR '+(i+2)+': '+e.message);}
  });
  const sh=drrSheet_(),old=sh.getDataRange().getDisplayValues().slice(1),existing=new Set(old.filter(r=>r[0]===week).map(r=>[r[1],r[2],normalizeRefDrr_(r[3])].join('|')));
  const batch='DRR-'+Utilities.getUuid().slice(0,8),now=new Date(),out=[],seen=new Set();let skipped=0;
  for(const r of clean){const key=[r.date,r.type,r.reference].join('|');if(existing.has(key)||seen.has(key)){skipped++;continue;}seen.add(key);out.push([week,r.date,r.type,r.reference,r.ctn,r.customer,now,u.email,batch]);}
  if(out.length){const lock=LockService.getScriptLock();lock.waitLock(20000);try{sh.getRange(sh.getLastRow()+1,1,out.length,DRR_HEADERS.length).setValues(out);log_(u,'IMPORT_DRR',batch,JSON.stringify({week,imported:out.length,skipped}));}finally{lock.releaseLock();}}
  return {imported:out.length,skipped,batch,week};
}
function getDrrComparison(week){
  const u=user_();if(u.role!=='ADMIN'&&u.role!=='SPV'&&u.role!=='BILLING')throw Error('Hanya admin/billing.');
  const acts=rows_().filter(r=>r.status==='ACTIVE'&&(!week||String(r.billingWeek).slice(0,10)===week));
  const drr=getDrrRows(week),index={};
  for(const r of drr){const key=[r.date,r.type,r.reference].join('|');(index[key]||(index[key]=[])).push(r);}
  return acts.map(r=>{
    const date=String(r.activityAt).slice(0,10),key=[date,r.type,normalizeRefDrr_(r.reference)].join('|'),matches=index[key]||[];
    const match=matches.length===1?matches[0]:null;
    return {...r,ctnDrr:match?match.ctn:null,delta:match?r.ctn-match.ctn:null,matchStatus:matches.length>1?'DUPLIKAT_DRR':!matches.length?'BELUM_ADA_DRR':r.ctn===match.ctn?'SESUAI':'SELISIH'};
  });
}
