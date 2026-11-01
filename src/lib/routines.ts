import {addDays,format,parseISO} from 'date-fns'
import {Block,findConflicts,validateBlock,toMin,duration,weekDates} from './time'
export interface RoutineBlock{id:string;title:string;start:string;end:string;category:string;description?:string;projectId?:string}
export interface Routine{id:string;name:string;description?:string;category?:string;color?:string;active?:boolean;weekdays:number[];startDate?:string;endDate?:string;lastAppliedAt?:number;blocks:RoutineBlock[]}
export const ROUTINE_CATEGORIES=['Pagi Produktif','Rutinitas Kerja','Belajar & Pengembangan Diri','Olahraga','Rutinitas Malam','Lainnya']
export const ROUTINE_COLOR='#7445FF'
/** 0 = Minggu (JS getDay). Displayed Monday-first. */
export const WEEKDAYS:readonly (readonly [number,string])[]=[[1,'Sen'],[2,'Sel'],[3,'Rab'],[4,'Kam'],[5,'Jum'],[6,'Sab'],[0,'Min']]
export const weekdayOf=(date:string)=>{const [y,m,d]=date.split('-').map(Number);return new Date(y,m-1,d).getDay()}
export const isActive=(r:Routine)=>r.active!==false
export function validateRoutine(r:{name:string;blocks:RoutineBlock[];startDate?:string;endDate?:string}):string|null{
 if(!r.name.trim())return 'Nama rutinitas wajib diisi'
 if(r.blocks.length===0)return 'Tambahkan minimal satu aktivitas'
 for(let i=0;i<r.blocks.length;i++){const b=r.blocks[i];if(!b.title.trim())return `Blok ${i+1}: judul wajib diisi`;const e=validateBlock({date:'2026-01-01',start:b.start,end:b.end});if(e)return `Blok ${i+1}: ${e}`}
 if(r.startDate&&r.endDate&&r.startDate>r.endDate)return 'Tanggal akhir tidak boleh sebelum tanggal mulai'
 return null}
/** Index pairs (0-based) of activities whose time slots overlap. A warning, not an error. */
export function overlapPairs(bs:RoutineBlock[]):[number,number][]{const out:[number,number][]=[]
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++)if(toMin(bs[i].start)<toMin(bs[j].end)&&toMin(bs[j].start)<toMin(bs[i].end))out.push([i,j]);return out}
export function routineStats(r:Routine){const ok=r.blocks.filter(b=>toMin(b.end)>toMin(b.start))
 return {count:r.blocks.length,totalMin:ok.reduce((a,b)=>a+duration(b),0),start:ok.length?ok.map(b=>b.start).sort()[0]:null,end:ok.length?ok.map(b=>b.end).sort().slice(-1)[0]:null}}
export interface PreviewRow{rb:RoutineBlock;conflicts:Block[];duplicate:boolean}
/** Never writes anything. duplicate = this activity was already applied on `date` (same source, or identical title+time). */
export function previewApply(r:Routine,date:string,existing:Block[]):PreviewRow[]{
 return r.blocks.map(rb=>{
  const dups=existing.filter(b=>b.date===date&&((b.routineId===r.id&&b.routineBlockId===rb.id)||(b.title===rb.title&&b.start===rb.start&&b.end===rb.end)))
  const conflicts=findConflicts(existing,{id:'__routine__',date,start:rb.start,end:rb.end}).filter(c=>!dups.includes(c))
  return {rb,conflicts,duplicate:dups.length>0}})}
/** Non-blocking warnings about applying `r` on `date`. */
export function notesFor(r:Routine,date:string):string[]{const n:string[]=[]
 if(r.weekdays.length>0&&!r.weekdays.includes(weekdayOf(date)))n.push('Bukan hari yang dijadwalkan untuk rutinitas ini')
 if((r.startDate&&date<r.startDate)||(r.endDate&&date>r.endDate))n.push('Di luar rentang tanggal rutinitas');return n}
const matches=(d:string,wd:number[])=>wd.length===0||wd.includes(weekdayOf(d))
export const datesForWeek=(anchor:string,wd:number[])=>weekDates(anchor).filter(d=>matches(d,wd))
export const datesAhead=(from:string,n:number,wd:number[])=>Array.from({length:n},(_,i)=>format(addDays(parseISO(from),i),'yyyy-MM-dd')).filter(d=>matches(d,wd))
export function filterRoutines(rs:Routine[],f:{q:string;status:'all'|'active'|'inactive';category:string}){
 const q=f.q.trim().toLowerCase()
 return rs.filter(r=>(!q||r.name.toLowerCase().includes(q)||(r.description??'').toLowerCase().includes(q)||r.blocks.some(b=>b.title.toLowerCase().includes(q)))
  &&(f.status==='all'||(f.status==='active')===isActive(r))&&(!f.category||r.category===f.category))}
