import type {Block} from './time'
import {duration} from './time'
import type {Task} from '../stores/useStore'
import type {FocusSession} from './focusTimer'
export interface Project{id:string;name:string;description?:string;color:string;status:'active'|'archived';deadline?:string;createdAt?:number}
export const PROJECT_COLORS=['#7445FF','#3985FF','#10B981','#F59E0B','#F0566B','#06B6D4','#EC4899','#64748B']
/** A block belongs to its own project, otherwise to the project of its linked task. */
export const blockProjectId=(b:Block,tasks:Task[])=>b.projectId??tasks.find(t=>t.id===b.taskId)?.projectId
export function projectStats(p:Project,tasks:Task[],blocks:Block[],sessions:FocusSession[]){
 const pt=tasks.filter(t=>t.projectId===p.id),ids=new Set(pt.map(t=>t.id)),done=pt.filter(t=>t.status==='done').length
 return {tasks:pt,total:pt.length,done,pct:pt.length?Math.round(done/pt.length*100):null as number|null,
  scheduledMin:blocks.filter(b=>blockProjectId(b,tasks)===p.id).reduce((a,b)=>a+duration(b),0),
  focusSec:sessions.filter(s=>s.type==='focus'&&!!s.taskId&&ids.has(s.taskId)).reduce((a,s)=>a+s.actualSec,0)}}
export type ProjectState='active'|'done'|'late'|'archived'
/** archived > done (all tasks done, >=1 task) > late (deadline passed) > active */
export const projectState=(p:Project,st:{total:number;done:number},today:string):ProjectState=>p.status==='archived'?'archived':st.total>0&&st.done===st.total?'done':p.deadline&&p.deadline<today?'late':'active'
export const STATE_LABEL:Record<ProjectState,string>={active:'Aktif',done:'Selesai',late:'Terlambat',archived:'Diarsipkan'}
