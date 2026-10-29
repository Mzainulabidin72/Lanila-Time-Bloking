import {describe,it,expect} from 'vitest'
import {metrics,applyFilters,sortTasks,groupTasks,emptyInfo,isOverdue,DEFAULT_FILTERS} from '../src/lib/tasks'
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
 it('empty messages depend on filter',()=>{expect(emptyInfo(DEFAULT_FILTERS,0).title).toBe('Belum ada tugas');expect(emptyInfo(DEFAULT_FILTERS,3).title).toBe('Semua tugas sudah selesai.');expect(emptyInfo({...DEFAULT_FILTERS,status:'today'},3).title).toBe('Tidak ada tugas yang jatuh tempo hari ini.');expect(emptyInfo({...DEFAULT_FILTERS,q:'x'},3).kind).toBe('nomatch')})
})
