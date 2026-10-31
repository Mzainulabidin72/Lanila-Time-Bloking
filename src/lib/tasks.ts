import {addDays,format,parseISO} from 'date-fns'
import type {Task} from '../stores/useStore'
export type StatusFilter='all'|'active'|'open'|'doing'|'done'|'overdue'|'today'
export type SortKey='pr'|'due'|'new'|'alpha'|'est'
export type GroupMode='list'|'priority'|'due'
export interface Filters{q:string;status:StatusFilter;priority:''|Task['priority'];due:''|'none'|'week';project:string}
export const DEFAULT_FILTERS:Filters={q:'',status:'active',priority:'',due:'',project:''}
export const STATUS_LABEL:Record<Task['status'],string>={inbox:'Belum selesai',todo:'Belum selesai',doing:'Sedang dikerjakan',done:'Selesai'}
const PR={high:0,mid:1,low:2}
export const isDone=(t:Task)=>t.status==='done'
/** Overdue = NOT completed, has a due date strictly before today. */
export const isOverdue=(t:Task,today:string)=>!isDone(t)&&!!t.due&&t.due<today
export const isDueToday=(t:Task,today:string)=>!isDone(t)&&t.due===today
/** Summary metrics always use ALL tasks, never the filtered list. */
export const metrics=(tasks:Task[],today:string)=>({active:tasks.filter(t=>!isDone(t)).length,dueToday:tasks.filter(t=>isDueToday(t,today)).length,overdue:tasks.filter(t=>isOverdue(t,today)).length,done:tasks.filter(isDone).length})
const plus7=(today:string)=>format(addDays(parseISO(today),7),'yyyy-MM-dd')
export function applyFilters(tasks:Task[],f:Filters,today:string){
 const q=f.q.trim().toLowerCase(),wk=plus7(today)
 return tasks.filter(t=>{
  if(q&&!(t.title.toLowerCase().includes(q)||(t.description??'').toLowerCase().includes(q)||(t.notes??'').toLowerCase().includes(q)))return false
  if(f.priority&&t.priority!==f.priority)return false
  if(f.project&&(f.project==='none'?!!t.projectId:t.projectId!==f.project))return false
  if(f.due==='none'&&t.due)return false
  if(f.due==='week'&&!(t.due&&t.due>=today&&t.due<=wk))return false
  switch(f.status){case 'active':return !isDone(t);case 'open':return t.status==='todo'||t.status==='inbox';case 'doing':return t.status==='doing';case 'done':return isDone(t);case 'overdue':return isOverdue(t,today);case 'today':return isDueToday(t,today);default:return true}})}
const dueCmp=(a:Task,b:Task)=>(a.due??'9999').localeCompare(b.due??'9999')
const tie=(a:Task,b:Task)=>a.title.localeCompare(b.title,'id')
/** pr: high>mid>low, then due (none last), then title. due: due asc then priority. est: shortest first. */
export function sortTasks(tasks:Task[],key:SortKey){
 return [...tasks].sort((a,b)=>{switch(key){
  case 'pr':return PR[a.priority]-PR[b.priority]||dueCmp(a,b)||tie(a,b)
  case 'due':return dueCmp(a,b)||PR[a.priority]-PR[b.priority]||tie(a,b)
  case 'new':return (b.createdAt??0)-(a.createdAt??0)||tie(a,b)
  case 'alpha':return tie(a,b)
  default:return a.est-b.est||PR[a.priority]-PR[b.priority]||tie(a,b)}})}
export interface Group{key:string;label:string;items:Task[]}
export function groupTasks(tasks:Task[],mode:GroupMode,today:string):Group[]{
 if(mode==='list')return [{key:'all',label:'',items:tasks}]
 const wk=plus7(today)
 const defs:[string,string,(t:Task)=>boolean][]=mode==='priority'
  ?[['high','Prioritas Tinggi',t=>t.priority==='high'],['mid','Prioritas Sedang',t=>t.priority==='mid'],['low','Prioritas Rendah',t=>t.priority==='low']]
  :[['overdue','Terlambat',t=>isOverdue(t,today)],['today','Hari ini',t=>isDueToday(t,today)],['week','7 hari ke depan',t=>!isDone(t)&&!!t.due&&t.due>today&&t.due<=wk],['later','Nanti',t=>!isDone(t)&&!!t.due&&t.due>wk],['none','Tanpa tenggat',t=>!isDone(t)&&!t.due],['done','Selesai',isDone]]
 return defs.map(([key,label,fn])=>({key,label,items:tasks.filter(fn)})).filter(g=>g.items.length>0)}
export function emptyInfo(f:Filters,total:number):{title:string;text?:string;kind:'none'|'nomatch'|'status'}{
 if(total===0)return {kind:'none',title:'Belum ada tugas',text:'Tambahkan tugas pertamamu dan atur waktu untuk menyelesaikannya.'}
 if(f.q.trim()||f.priority||f.due||f.project)return {kind:'nomatch',title:'Tidak ada tugas yang cocok',text:'Coba ubah kata kunci atau filter.'}
 const m:Record<StatusFilter,string>={all:'Belum ada tugas.',active:'Semua tugas sudah selesai.',open:'Tidak ada tugas yang belum dikerjakan.',doing:'Belum ada tugas yang sedang dikerjakan.',done:'Belum ada tugas yang selesai.',overdue:'Tidak ada tugas yang terlambat.',today:'Tidak ada tugas yang jatuh tempo hari ini.'}
 return {kind:'status',title:m[f.status]}}
