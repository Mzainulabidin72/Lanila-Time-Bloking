import {supabase} from '../lib/supabase'
import type {Block} from '../lib/time'
import type {Task} from '../stores/useStore'
import {blockToRow,rowToBlock,taskToRow,rowToTask,sessionToRow,rowToSession,projectToRow,rowToProject,routineToRow,rowToRoutine} from './mappers'
import type {FocusSession} from '../lib/focusTimer'
import type {Project} from '../lib/projects'
import type {Routine} from '../lib/routines'
const log=(p:PromiseLike<{error:{message:string}|null}>)=>{p.then(({error})=>{if(error)console.error('[supabase]',error.message)})}
// user_id comes from DB default auth.uid() and is enforced by RLS; the client never sends it.
export const remote={
 async fetchAll(){
  if(!supabase)return null
  const [b,t,s,pj,rt]=await Promise.all([supabase.from('tb_time_blocks').select('*').order('block_date').order('start_time'),supabase.from('tb_tasks').select('*').order('created_at'),supabase.from('tb_focus_sessions').select('id,session_type,status,task_id,objective,planned_seconds,actual_seconds,started_at,ended_at,minutes').order('ended_at'),supabase.from('tb_projects').select('*').order('created_at'),supabase.from('tb_routines').select('*').order('created_at')])
  if(b.error)throw b.error;if(t.error)throw t.error;if(s.error)throw s.error;if(pj.error)throw pj.error;if(rt.error)throw rt.error
  return {blocks:(b.data??[]).map(rowToBlock),tasks:(t.data??[]).map(rowToTask),sessions:(s.data??[]).map(rowToSession),projects:(pj.data??[]).map(rowToProject),routines:(rt.data??[]).map(rowToRoutine)}},
 upsertTask:(t:Task)=>{if(supabase)log(supabase.from('tb_tasks').upsert(taskToRow(t)))},
 deleteTask:(id:string)=>{if(supabase)log(supabase.from('tb_tasks').delete().eq('id',id))},
 upsertBlock:(b:Block)=>{if(supabase)log(supabase.from('tb_time_blocks').upsert(blockToRow(b)))},
 deleteBlock:(id:string)=>{if(supabase)log(supabase.from('tb_time_blocks').delete().eq('id',id))},
 upsertProject:(p:Project)=>{if(supabase)log(supabase.from('tb_projects').upsert(projectToRow(p)))},
 deleteProject:(id:string)=>{if(supabase)log(supabase.from('tb_projects').delete().eq('id',id))},
 upsertRoutine:(r:Routine)=>{if(supabase)log(supabase.from('tb_routines').upsert(routineToRow(r)))},
 deleteRoutine:(id:string)=>{if(supabase)log(supabase.from('tb_routines').delete().eq('id',id))},
 upsertSession:(x:FocusSession)=>{if(supabase)log(supabase.from('tb_focus_sessions').upsert(sessionToRow(x)))}} // idempotent by id
