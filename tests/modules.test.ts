import {describe,it,expect} from 'vitest'
import {projectStats,projectState,blockProjectId,Project} from '../src/lib/projects'
import {previewApply,validateRoutine,weekdayOf,Routine} from '../src/lib/routines'
import {analyze,presetRange,daysIn} from '../src/lib/analytics'
import {projectToRow,rowToProject,routineToRow,rowToRoutine,taskToRow,blockToRow} from '../src/repositories/mappers'
import type {Task} from '../src/stores/useStore'
import type {Block} from '../src/lib/time'
const T=(id:string,o:Partial<Task>={}):Task=>({id,title:id,status:'todo',priority:'mid',est:30,...o})
const B=(id:string,start:string,end:string,o:Partial<Block>={}):Block=>({id,title:id,date:'2026-10-14',start,end,category:'Deep Work',done:false,...o})
const P:Project={id:'p1',name:'Skripsi',color:'#7445FF',status:'active'}
describe('projects',()=>{
 it('progress counts only the project tasks',()=>{const s=projectStats(P,[T('a',{projectId:'p1',status:'done'}),T('b',{projectId:'p1'}),T('c')],[],[]);expect(s.total).toBe(2);expect(s.pct).toBe(50)})
 it('no tasks -> null progress (not 0%)',()=>expect(projectStats(P,[],[],[]).pct).toBeNull())
 it('block belongs to own project or its task project',()=>{const ts=[T('a',{projectId:'p1'})];expect(blockProjectId(B('x','09:00','10:00',{taskId:'a'}),ts)).toBe('p1');expect(blockProjectId(B('x','09:00','10:00',{projectId:'p2',taskId:'a'}),ts)).toBe('p2')})
 it('scheduled minutes and focus seconds are attributed',()=>{const s=projectStats(P,[T('a',{projectId:'p1'})],[B('x','09:00','10:30',{taskId:'a'}),B('y','11:00','12:00')],[{id:'s',type:'focus',status:'completed',taskId:'a',plannedSec:1500,actualSec:1500,startedAt:0,endedAt:1}]);expect(s.scheduledMin).toBe(90);expect(s.focusSec).toBe(1500)})
 it('state priority: archived > done > late > active',()=>{expect(projectState({...P,status:'archived'},{total:1,done:1},'2026-10-14')).toBe('archived');expect(projectState(P,{total:1,done:1},'2026-10-14')).toBe('done');expect(projectState({...P,deadline:'2026-10-01'},{total:2,done:1},'2026-10-14')).toBe('late');expect(projectState(P,{total:0,done:0},'2026-10-14')).toBe('active')})
})
describe('routines',()=>{
 const R:Routine={id:'r',name:'Pagi',weekdays:[1],blocks:[{id:'1',title:'Olahraga',start:'06:00',end:'07:00',category:'Olahraga'},{id:'2',title:'Deep work',start:'09:00',end:'11:00',category:'Deep Work'}]}
 it('preview reports conflicts without modifying anything',()=>{const ex=[B('m','10:00','10:30')];const p=previewApply(R,'2026-10-14',ex);expect(p[0].conflicts).toHaveLength(0);expect(p[1].conflicts.map(c=>c.id)).toEqual(['m']);expect(ex).toHaveLength(1)})
 it('other dates do not conflict',()=>expect(previewApply(R,'2026-10-15',[B('m','10:00','10:30')])[1].conflicts).toHaveLength(0))
 it('validates name, blocks and times',()=>{expect(validateRoutine({name:'',blocks:R.blocks})).toBeTruthy();expect(validateRoutine({name:'x',blocks:[]})).toBeTruthy();expect(validateRoutine({name:'x',blocks:[{...R.blocks[0],end:'05:00'}]})).toMatch(/Blok 1/);expect(validateRoutine({name:'x',blocks:R.blocks})).toBeNull()})
 it('weekday uses 0=Sunday',()=>{expect(weekdayOf('2026-10-14')).toBe(3);expect(weekdayOf('2026-10-18')).toBe(0)})
})
describe('analytics',()=>{
 const today='2026-10-14',r=presetRange('7d',today)
 it('7d range has 7 days ending today',()=>{expect(daysIn(r)).toHaveLength(7);expect(r.to).toBe(today);expect(r.from).toBe('2026-10-08')})
 it('empty data reports no data (nothing fabricated)',()=>{const a=analyze({blocks:[],tasks:[],sessions:[],projects:[]},r);expect(a.hasData).toBe(false);expect(a.plannedMin).toBe(0);expect(a.taskRate).toBeNull()})
 it('planned vs completed, category and project distribution',()=>{const a=analyze({blocks:[B('a','09:00','10:00',{done:true,taskId:'t'}),B('b','10:00','10:30',{category:'Rapat'}),B('old','09:00','10:00',{date:'2026-09-01'})],tasks:[T('t',{projectId:'p1'})],sessions:[],projects:[P]},r)
  expect(a.plannedMin).toBe(90);expect(a.completedMin).toBe(60);expect(a.byCategory[0]).toEqual({key:'Deep Work',min:60});expect(a.byProject.map(x=>x.key).sort()).toEqual(['Skripsi','Tanpa proyek'])})
 it('task completion uses due dates in range; focus counts only focus sessions in range',()=>{const e=new Date(2026,9,14,10).getTime()
  const a=analyze({blocks:[],tasks:[T('a',{due:'2026-10-10',status:'done'}),T('b',{due:'2026-10-11'}),T('c',{due:'2026-12-01'})],sessions:[{id:'1',type:'focus',status:'completed',plannedSec:1500,actualSec:1500,startedAt:e-1500000,endedAt:e},{id:'2',type:'short_break',status:'completed',plannedSec:300,actualSec:300,startedAt:e,endedAt:e+1}],projects:[]},r)
  expect(a.taskRate).toEqual({total:2,done:1,pct:50});expect(a.focusSec).toBe(1500);expect(a.focusCompleted).toBe(1)})
})
describe('mappers',()=>{
 it('project and routine round-trip; user_id never sent',()=>{const pr=projectToRow({...P,deadline:'2026-12-01'});expect('user_id' in pr).toBe(false);expect(rowToProject(pr).deadline).toBe('2026-12-01')
  const R:Routine={id:'r',name:'x',weekdays:[1,2],blocks:[{id:'1',title:'a',start:'09:00',end:'10:00',category:'c'}]};expect(rowToRoutine(routineToRow(R))).toEqual(R)})
 it('task and block carry project_id',()=>{expect(taskToRow(T('a',{projectId:'p1'})).project_id).toBe('p1');expect(blockToRow(B('a','09:00','10:00')).project_id).toBeNull()})
})
