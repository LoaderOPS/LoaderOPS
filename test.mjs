import assert from 'node:assert/strict';
import {DEFAULTS,calculate,shiftFor,dayTypeFor,isAfternoonSaturday,isMandatoryRestDate,parseRoster,parseCSV} from './core.mjs';
const s=structuredClone(DEFAULTS);
const test=(date,shift,dayType,intervals,manualBreak=0)=>calculate({date,shift,dayType,intervals,manualBreak},s);
const int=(start,end,startOffset=0,endOffset=0)=>({start,end,startOffset,endOffset});
function approx(a,b){assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`)}
for(const [h,expected] of [[1,49681.5],[2,115923.5],[3,182165.5]]){const r=test('2026-11-16','OFF','work',[int('01:00',`${String(1+h).padStart(2,'0')}:00`)]);approx(r.amount,expected)}
for(const [h,expected] of [[7,463694],[8,563057],[9,695541]]){const r=test('2026-11-16','OFF','rest',[int('01:00',`${String(1+h).padStart(2,'0')}:00`)]);approx(r.amount,expected)}
let a=test('2026-11-16','P','work',[int('16:00','00:00',0,1)]);approx(a.gross,8);approx(a.automaticBreak,1);approx(a.net,7);
a=test('2026-11-16','S','work',[int('08:00','16:00')]);approx(a.net,7);approx(a.automaticBreak,1);
a=test('2026-11-16','S','work',[int('08:00','16:00'),int('00:00','03:00',1,1)]);approx(a.gross,11);approx(a.breakHours,2);approx(a.net,9);
a=test('2026-11-16','S','work',[int('08:00','16:00'),int('01:00','03:00',1,1)]);approx(a.automaticBreak,1);approx(a.net,9);
a=test('2026-11-16','P','work',[int('17:30','18:30')]);approx(a.automaticBreak,.5);approx(a.net,.5);
assert.throws(()=>test('2026-11-16','P','work',[int('16:00','19:00'),int('18:00','21:00')]));
assert.equal(shiftFor('2026-11-16',s),'P');
assert.equal(shiftFor('2026-11-23',s),'S');
assert.equal(shiftFor('2026-11-28',s),'OFF');
assert.equal(dayTypeFor('2026-11-28',s),'rest');
assert.equal(shiftFor('2026-12-05',s),'P');
assert.equal(shiftFor('2027-01-09',s),'OFF');
assert.equal(dayTypeFor('2026-11-28',s,{'2026-11-28':{shift:'S',dayType:'work'}}),'rest');
assert.equal(shiftFor('2026-11-28',s,{'2026-11-28':{shift:'S',dayType:'work'}}),'S');
assert.equal(isAfternoonSaturday('2026-11-28',s),true);
const saturdayOT=test('2026-11-28','S','rest',[int('08:00','16:00')]);
approx(saturdayOT.net,7);
approx(saturdayOT.amount,463694);
const roster=parseRoster(parseCSV('Tanggal,Shift,Tipe Hari\n16/11/2026,P,work\n17/11/2026,S,scheduled\n18/11/2026,OFF,rest'));
assert.equal(roster['2026-11-17'].shift,'S');assert.equal(roster['2026-11-18'].dayType,'rest');

// Sunday is always a rest day regardless of shift, rest-day settings, or official roster overrides.
for(const d of ['2026-11-22','2026-11-29','2026-12-06','2027-01-03']){
  assert.equal(isMandatoryRestDate(d,s),true);
  assert.equal(shiftFor(d,s),'OFF');
  assert.equal(dayTypeFor(d,s),'rest');
  const official={[d]:{shift:'P',dayType:'work'}};
  assert.equal(shiftFor(d,s,official),'P');
  assert.equal(dayTypeFor(d,s,official),'rest');
}
const sundayOT=test('2026-11-22','P','rest',[int('08:00','15:00')]);
approx(sundayOT.amount,7*2*s.hourly);
const noSundaySetting={...s,restDays:[]};
assert.equal(dayTypeFor('2026-11-22',noSundaySetting),'rest');
assert.equal(shiftFor('2026-11-22',noSundaySetting),'OFF');

console.log('Pengujian inti, rotasi lintas tahun dan aturan Sabtu shift sore dan Minggu permanen lulus.');

// Two sessions share a single progressive overtime calculation.
const both=test('2026-11-23','S','work',[int('08:00','16:00'),int('01:00','03:00',1,1)]);
approx(both.net,9);approx(both.amount,33121*(1.5+8*2));
// After-shift overtime may run across midnight, without regular shift overlap.
const overnight=test('2026-11-16','P','work',[int('16:00','05:00',0,1)]);
approx(overnight.gross,13);approx(overnight.automaticBreak,1);approx(overnight.net,12);
// Regular shift time must not accidentally become overtime.
assert.throws(()=>test('2026-11-23','S','work',[int('16:00','05:00',0,1)]),/overlaps your scheduled shift/);
console.log('v10 extra scenarios passed.');
