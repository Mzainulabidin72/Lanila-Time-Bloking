import {describe,it,expect} from 'vitest'
import {validateBlock,findConflicts,duration,remainingMs,Block} from '../src/lib/time'
const b=(id:string,start:string,end:string):Block=>({id,title:id,date:'2026-10-14',start,end,category:'x',done:false})
describe('time',()=>{
  it('rejects end<=start',()=>{expect(validateBlock({date:'2026-10-14',start:'10:00',end:'09:00'})).toBeTruthy();expect(validateBlock({date:'2026-10-14',start:'10:00',end:'10:00'})).toBeTruthy()})
  it('rejects invalid date',()=>expect(validateBlock({date:'2026-13-45',start:'09:00',end:'10:00'})).toBeTruthy())
  it('accepts valid',()=>expect(validateBlock({date:'2026-10-14',start:'09:00',end:'10:30'})).toBeNull())
  it('computes duration',()=>expect(duration(b('a','09:00','10:30'))).toBe(90))
  it('detects overlap but not adjacency',()=>{
    expect(findConflicts([b('a','09:00','10:00')],b('n','09:30','10:30'))).toHaveLength(1)
    expect(findConflicts([b('a','09:00','10:00')],b('n','10:00','11:00'))).toHaveLength(0)})
  it('remaining time from timestamps',()=>{expect(remainingMs(10_000,4_000)).toBe(6000);expect(remainingMs(1,5)).toBe(0)})
})
