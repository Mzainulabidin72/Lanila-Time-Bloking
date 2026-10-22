import type {Block} from '../lib/time'
import type {Task} from '../stores/useStore'
export const blockToRow=(b:Block)=>({id:b.id,title:b.title,block_date:b.date,start_time:b.start,end_time:b.end,category:b.category,done:b.done,task_id:b.taskId??null})
export const rowToBlock=(r:any):Block=>({id:r.id,title:r.title,date:r.block_date,start:String(r.start_time).slice(0,5),end:String(r.end_time).slice(0,5),category:r.category,done:r.done,taskId:r.task_id??undefined})
export const taskToRow=(t:Task)=>({id:t.id,title:t.title,status:t.status,priority:t.priority,est_minutes:t.est,due_date:t.due??null})
export const rowToTask=(r:any):Task=>({id:r.id,title:r.title,status:r.status,priority:r.priority,est:r.est_minutes??30,due:r.due_date??undefined})
