  /** LOADER OPS pilot | DEMO MODE
 * DEMO_MODE is for testing role-specific screens with ONE authorized Google account.
 * Keep Web App access restricted to the owner/admin. Never use this mode for live operations.
 * Script Property ADMIN_EMAIL must contain the real Google account allowed to run this demo.
 */
const DEMO_MODE = true; // Set false before production deployment.
const CFG = {
  tz: 'Asia/Jakarta',
  cutoffHour: 6, // ASSUMPTION: Friday 06:00. Confirm actual first-shift boundary with DSV.
  sheets: { users: 'USERS', activities: 'ACTIVITIES', audit: 'AUDIT_LOG' },
  headers: {
    users: ['EMAIL','NAME','ROLE','TEAM','ACTIVE'],
    activities: ['ID','CREATED_AT','ACTIVITY_AT','TEAM','TYPE','REFERENCE','CTN','CUSTOMER','NOTES','CREATED_BY','BILLING_WEEK_START','BILLING_WEEK_END','STATUS','VOID_AT','REQUEST_ID'],
    audit: ['WHEN','USER','ACTION','ACTIVITY_ID','DETAILS']
  }
};
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('LOADER OPS | DSV Pilot')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function db_() {
  const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw Error('Database belum disiapkan. Jalankan setupDatabase() dari Apps Script.');
  return SpreadsheetApp.openById(id);
}
function sheet_(key) { return db_().getSheetByName(CFG.sheets[key]); }
function email_() { return String(Session.getActiveUser().getEmail()||'').trim().toLowerCase(); }
function assertDemoOwner_(){
  const props=PropertiesService.getScriptProperties();
  const owner=String(props.getProperty('ADMIN_EMAIL')||'').trim().toLowerCase();
  const active=email_();
  if(!owner || !active || active!==owner) throw Error('Mode demo hanya dapat digunakan oleh akun ADMIN_EMAIL yang terdaftar. Pastikan deployment tetap dibatasi untuk akun admin.');
  return active;
}
function setDemoRole(role){
  if(!DEMO_MODE) throw Error('Mode demo tidak aktif.');
  const email=assertDemoOwner_();
  role=String(role||'').toUpperCase();
  const map={ADMIN:{name:'Administrator (DEMO)',role:'ADMIN',team:'ALL'},SPV:{name:'Supervisor (DEMO)',role:'SPV',team:'ALL'},A:{name:'Mijan Team (DEMO)',role:'LOADER',team:'A'},B:{name:'Ompong Team (DEMO)',role:'LOADER',team:'B'},C:{name:'Safar Team (DEMO)',role:'LOADER',team:'C'}};
  if(!map[role]) throw Error('Pilihan role demo tidak valid.');
  CacheService.getUserCache().put('LOADER_OPS_DEMO_ROLE',role,21600);
  return {ok:true,role:role};
}
function user_() {
  const email=email_();
  if(DEMO_MODE){
    assertDemoOwner_();
    const selected=CacheService.getUserCache().get('LOADER_OPS_DEMO_ROLE')||'ADMIN';
    const demo={ADMIN:{name:'Administrator (DEMO)',role:'ADMIN',team:'ALL'},SPV:{name:'Supervisor (DEMO)',role:'SPV',team:'ALL'},A:{name:'Mijan Team (DEMO)',role:'LOADER',team:'A'},B:{name:'Ompong Team (DEMO)',role:'LOADER',team:'B'},C:{name:'Safar Team (DEMO)',role:'LOADER',team:'C'}}[selected];
    return {email,name:demo.name,role:demo.role,team:demo.team,demoMode:true};
  }
  if (!email) throw Error('Identitas Google tidak tersedia. Minta IT menggunakan akses Google Workspace terautentikasi. Jangan mengaktifkan akses publik.');
  const rows=sheet_('users').getDataRange().getValues().slice(1);
  const rec=rows.find(r=>String(r[0]).trim().toLowerCase()===email && String(r[4]).toUpperCase()==='YES');
  if (!rec) throw Error('Akun '+email+' belum diberi akses. Hubungi admin.');
  const role=String(rec[2]).toUpperCase(), team=String(rec[3]).toUpperCase();
  if (!['ADMIN','SPV','LOADER','BILLING'].includes(role)) throw Error('Role tidak valid.');
  return {email,name:String(rec[1]),role,team,demoMode:false};
}
function requireAdmin_(){const u=user_(); if(u.role!=='ADMIN') throw Error('Hanya admin yang memiliki izin.'); return u;}
/** Run only once as sheet owner. Set Script Property ADMIN_EMAIL first. */
function setupDatabase(){
  const props=PropertiesService.getScriptProperties();
  const admin=String(props.getProperty('ADMIN_EMAIL')||'').trim().toLowerCase();
  if (!admin || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(admin)) throw Error('Set Script Property ADMIN_EMAIL ke email Google Workspace admin dahulu.');
  let id=props.getProperty('SPREADSHEET_ID');
  const ss=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('LOADER OPS - Pilot Database');
  Object.keys(CFG.sheets).forEach(key=>{
    let sh=ss.getSheetByName(CFG.sheets[key]);
    if (!sh) sh=ss.insertSheet(CFG.sheets[key]);
    if (sh.getLastRow()===0) {
      sh.getRange(1,1,1,CFG.headers[key].length).setValues([CFG.headers[key]]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,CFG.headers[key].length).setFontWeight('bold').setBackground('#123152').setFontColor('white');
    }
  });
  const users=ss.getSheetByName(CFG.sheets.users);
  const exists=users.getDataRange().getValues().slice(1).some(r=>String(r[0]).toLowerCase()===admin);
  if (!exists) users.appendRow([admin,'Administrator','ADMIN','ALL','YES']);
  props.setProperty('SPREADSHEET_ID',ss.getId());
  Logger.log('Database URL: '+ss.getUrl());
  Logger.log('Add Team users in USERS sheet: ROLE LOADER, TEAM A/B/C, ACTIVE YES. BILLING role is read-only.');
  return ss.getUrl();
}
function bootstrap(){const u=user_(); return {user:u,cutoffHour:CFG.cutoffHour,tz:CFG.tz,demoMode:DEMO_MODE};}
function sanitize_(v,max=150){return String(v==null?'':v).trim().slice(0,max).replace(/[\u0000-\u001f]/g,'');}
function parseLocal_(v){
  const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(v));
  if(!m) throw Error('Tanggal/jam tidak valid.');
  const a=m.slice(1).map(Number), d=new Date(a[0],a[1]-1,a[2],a[3],a[4]);
  if (d.getFullYear()!==a[0]||d.getMonth()!==a[1]-1||d.getDate()!==a[2]||d.getHours()!==a[3]||d.getMinutes()!==a[4]) throw Error('Tanggal/jam tidak valid.');
  const today=new Date(); if(d>new Date(today.getTime()+10*60*1000)) throw Error('Aktivitas tidak boleh jauh di masa depan.');
  return d;
}
function fmt_(d,pattern){return Utilities.formatDate(d,CFG.tz,pattern);}
function week_(d){
  // Effective operating day starts at cutoffHour; weekly start is Friday cutoff.
  const effective=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  if(d.getHours()<CFG.cutoffHour) effective.setDate(effective.getDate()-1);
  const back=(effective.getDay()-5+7)%7;
  const start=new Date(effective.getFullYear(),effective.getMonth(),effective.getDate()-back,CFG.cutoffHour);
  const end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+7,CFG.cutoffHour);
  return {start:fmt_(start,'yyyy-MM-dd HH:mm'),endExclusive:fmt_(end,'yyyy-MM-dd HH:mm')};
}
function log_(u,action,id,details){sheet_('audit').appendRow([new Date(),u.email,action,id,details]);}
function saveActivity(p){
  const u=user_(); if(u.role!=='ADMIN'&&u.role!=='LOADER') throw Error('Hanya admin atau loader yang dapat menginput.');
  const team=sanitize_(p.team,8).toUpperCase(),type=sanitize_(p.type,12).toUpperCase();
  if(!['A','B','C'].includes(team)) throw Error('Team harus A, B, atau C.');
  if(u.role==='LOADER'&&u.team!==team) throw Error('Kamu hanya bisa input untuk Team '+u.team+'.');
  if(!['INBOUND','OUTBOUND'].includes(type)) throw Error('Jenis aktivitas tidak valid.');
  const ref=sanitize_(p.reference,40).toUpperCase().replace(/\s+/g,' ');
  if(!/^[A-Z0-9 -]{4,40}$/.test(ref)) throw Error('Nomor mobil/container harus 4–40 karakter huruf/angka.');
  const ctn=Number(p.ctn);
  if(!Number.isSafeInteger(ctn)||ctn<=0||ctn>1000000) throw Error('CTN harus bilangan bulat positif maksimal 1.000.000.');
  const when=parseLocal_(p.activityAt), cust=sanitize_(p.customer,100), notes=sanitize_(p.notes,500);
  const requestId=sanitize_(p.requestId,100);
  if(!/^[a-zA-Z0-9_-]{10,100}$/.test(requestId)) throw Error('ID pengiriman tidak valid. Muat ulang halaman.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const sh=sheet_('activities');const data=sh.getDataRange().getValues();
    const prior=data.slice(1).find(r=>String(r[14])===requestId);
    if(prior) return {id:String(prior[0]),duplicatedRequest:true};
    const id='ACT-'+Utilities.getUuid().slice(0,13).toUpperCase(), week=week_(when);
    sh.appendRow([id,new Date(),when,team,type,ref,ctn,cust,notes,u.email,week.start,week.endExclusive,'ACTIVE','',requestId]);
    log_(u,'CREATE',id,JSON.stringify({team,type,ref,ctn}));
    return {id,weekStart:week.start,weekEndExclusive:week.endExclusive};
  } finally {lock.releaseLock();}
}
function rows_(){
  const raw=sheet_('activities').getDataRange().getValues();
  return raw.slice(1).filter(r=>r[0]).map(r=>({
    id:String(r[0]),created: r[1] instanceof Date?fmt_(r[1],'yyyy-MM-dd HH:mm'):String(r[1]),
    activityAt: r[2] instanceof Date?fmt_(r[2],'yyyy-MM-dd HH:mm'):String(r[2]),
    team:String(r[3]),type:String(r[4]),reference:String(r[5]),ctn:Number(r[6])||0,
    customer:String(r[7]),notes:String(r[8]),createdBy:String(r[9]),
    billingWeek:String(r[10]),billingEndExclusive:String(r[11]),status:String(r[12])
  }));
}
function listActivities(filter){
  const u=user_(), f=filter||{};
  let items=rows_();
  if(u.role==='LOADER') items=items.filter(r=>r.team===u.team);
  if(f.team && ['A','B','C'].includes(f.team))items=items.filter(r=>r.team===f.team);
  if(f.week)items=items.filter(r=>r.billingWeek.slice(0,10)===f.week);
  if(f.query){const q=String(f.query).toUpperCase().slice(0,60);items=items.filter(r=>(r.reference+' '+r.customer+' '+r.id).toUpperCase().includes(q));}
  return items.sort((a,b)=>b.activityAt.localeCompare(a.activityAt)).slice(0,2000);
}
function voidActivity(id,reason){
  const u=requireAdmin_();id=sanitize_(id,50);reason=sanitize_(reason,300);
  if(reason.length<5) throw Error('Tuliskan alasan pembatalan minimal 5 karakter.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const sh=sheet_('activities'),vals=sh.getDataRange().getValues();
    const i=vals.findIndex((r,k)=>k>0&&String(r[0])===id);
    if(i<1) throw Error('Transaksi tidak ditemukan.');
    if(String(vals[i][12])!=='ACTIVE') throw Error('Transaksi sudah dibatalkan.');
    sh.getRange(i+1,13).setValue('VOID');sh.getRange(i+1,14).setValue(new Date());
    log_(u,'VOID',id,reason);return {ok:true};
  } finally {lock.releaseLock();}

}


