import {describe,it,expect} from 'vitest'
import {metrics,applyFilters,sortTasks,groupTasks,emptyInfo,isOverdue,scheduleInfo,DEFAULT_FILTERS} from '../src/lib/tasks'
import type {Task} from '../src/stores/useStore'
const T=(id:string,o:Partial<Task>={}):Task=>({id,title:id,status:'todo',priority:'mid',est:30,...o})
const today='2026-10-14'
describe('tasks',()=>{
 it('completed tasks are never overdue',()=>{expect(isOverdue(T('a',{due:'2026-10-01',status:'done'}),today)).toBe(false);expect(isOverdue(T('b',{due:'2026-10-01'}),today)).toBe(true);expect(isOverdue(T('c',{due:today}),today)).toBe(false)})
 it('metrics use all tasks',()=>{const m=metrics([T('a',{due:today}),T('b',{due:'2026-10-01'}),T('c',{status:'done',due:'2026-10-01'}),T('d',{status:'doing'})],today);expect(m).toEqual({active:3,dueToday:1,overdue:1,done:1})})
 it('search matches title and description',()=>{const l=[T('Laporan'),T('x',{description:'kirim laporan ke bos'}),T('y')];expect(applyFilters(l,{...DEFAULT_FILTERS,q:'LAPORAN'},today).map(t=>t.id)).toEqual(['Laporan','x'])})
 it('filters combine',()=>{const l=[T('a',{priority:'high',due:'2026-10-01'}),T('b',{priority:'high'}),T('c',{priority:'low',due:'2026-10-01'})];expect(applyFilters(l,{...DEFAULT_FILTERS,status:'overdue',priority:'high'},today).map(t=>t.id)).toEqual(['a'])})
 it('priority sort: high first, then due, then title',()=>{const l=[T('z',{priority:'low'}),T('b',{priority:'high',due:'2026-10-20'}),T('a',{priority:'high',due:'2026-10-15'}),T('m',{priority:'high'})];expect(sortTasks(l,'pr').map(t=>t.id)).toEqual(['a','b','m','z'])})
 it('due sort puts undated last; est sorts ascending',()=>{expect(sortTasks([T('a'),T('b',{due:'2026-10-15'})],'due').map(t=>t.id)).toEqual(['b','a']);expect(sortTasks([T('a',{est:60}),T('b',{est:15})],'est').map(t=>t.id)).toEqual(['b','a'])})
 it('groups by due',()=>{const g=groupTasks([T('a',{due:'2026-10-01'}),T('b',{due:today}),T('c'),T('d',{status:'done'})],'due',today);expect(g.map(x=>x.key)).toEqual(['overdue','today','none','done'])})
 it('empty messages depend on filter',()=>{expect(emptyInfo(DEFAULT_FILTERS,0).title).toBe('Belum ada tugas');expect(emptyInfo(DEFAULT_FILTERS,3).title).toBe('Semua tugas sudah selesai.');expect(emptyInfo({...DEFAULT_FILTERS,status:'today'},3).title).toBe('Tidak ada tugas yang jatuh tempo hari ini.');expect(emptyInfo({...DEFAULT_FILTERS,q:'x'},3).kind).toBe('search');expect(emptyInfo({...DEFAULT_FILTERS,priority:'high'},3).kind).toBe('filter');expect(emptyInfo({...DEFAULT_FILTERS,status:'done'},3).title).toBe('Belum ada tugas yang selesai')})
 it('due-date range filter combines with other filters and skips undated tasks',()=>{const l=[T('a',{due:'2026-10-10',priority:'high'}),T('b',{due:'2026-10-20',priority:'high'}),T('c',{priority:'high'}),T('d',{due:'2026-10-12',priority:'low'})]
  expect(applyFilters(l,{...DEFAULT_FILTERS,dateFrom:'2026-10-09',dateTo:'2026-10-15',priority:'high'},today).map(t=>t.id)).toEqual(['a'])})
 it('project filter supports none',()=>{const l=[T('a',{projectId:'p'}),T('b')];expect(applyFilters(l,{...DEFAULT_FILTERS,project:'p'},today).map(t=>t.id)).toEqual(['a']);expect(applyFilters(l,{...DEFAULT_FILTERS,project:'none'},today).map(t=>t.id)).toEqual(['b'])})
 it('scheduleInfo picks the next upcoming block, else the latest past one',()=>{const now=new Date(2026,9,14,12).getTime();const B=(id:string,date:string,tid='t')=>({id,title:id,date,start:'09:00',end:'10:00',category:'x',done:false,taskId:tid})
  const m=scheduleInfo([B('past','2026-10-10'),B('soon','2026-10-15'),B('later','2026-10-20'),B('other','2026-10-15','z'),{...B('free','2026-10-15'),taskId:undefined}],now)
  expect(m.get('t')?.next.id).toBe('soon');expect(m.get('t')?.count).toBe(3);expect(scheduleInfo([B('p1','2026-10-01'),B('p2','2026-10-05')],now).get('t')?.next.id).toBe('p2')})
})
