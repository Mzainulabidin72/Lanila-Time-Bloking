import {describe,expect,it} from 'vitest'
import {Project,projectMatchesFilter,projectState,projectStats} from '../src/lib/projects'
import type {Task} from '../src/stores/useStore'

const project:Project={id:'p1',name:'Project',color:'#7445FF',status:'active'}
const task=(id:string,status:Task['status'],projectId='p1'):Task=>({id,title:id,status,priority:'mid',est:30,projectId})

describe('projects',()=>{
 it('calculates progress from tasks associated with this project only',()=>{
  const stats=projectStats(project,[task('done','done'),task('open','todo'),task('other','done','p2')],[],[])
  expect(stats.total).toBe(2)
  expect(stats.done).toBe(1)
  expect(stats.pct).toBe(50)
 })

 it('leaves progress unset for projects without tasks',()=>{
  expect(projectStats(project,[],[],[]).pct).toBeNull()
 })

 it('derives project status from archive state, actual task completion, and deadline',()=>{
  expect(projectState(project,{total:1,done:1},'2026-11-02')).toBe('done')
  expect(projectState({...project,deadline:'2026-11-01'},{total:1,done:0},'2026-11-02')).toBe('late')
  expect(projectState({...project,status:'archived'},{total:1,done:0},'2026-11-02')).toBe('archived')
 })

 it('includes late work in active and separates completed and archived projects in filters',()=>{
  expect(projectMatchesFilter('late','active')).toBe(true)
  expect(projectMatchesFilter('done','active')).toBe(false)
  expect(projectMatchesFilter('done','done')).toBe(true)
  expect(projectMatchesFilter('archived','archived')).toBe(true)
  expect(projectMatchesFilter('late','all')).toBe(true)
 })
})
