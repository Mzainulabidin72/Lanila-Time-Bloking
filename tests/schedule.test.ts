import {describe,it,expect} from 'vitest'
import {mergedMinutes,layoutColumns,summarize,conflictPairs,fmtDur} from '../src/lib/schedule'
const b=(id:string,start:string,end:string,date='2026-10-14')=>({id,title:id,date,start,end,category:'x',done:false})
describe('schedule',()=>{
 it('does not double count overlaps',()=>expect(mergedMinutes([b('a','09:00','10:00'),b('b','09:30','11:00')])).toBe(120))
 it('clips to window',()=>expect(mergedMinutes([b('a','05:00','07:00')],360,1320)).toBe(60))
 it('places overlapping blocks side by side',()=>{const m=layoutColumns([b('a','09:00','10:00'),b('b','09:30','10:30'),b('c','11:00','12:00')])
  expect(m.get('a')).toEqual({col:0,cols:2});expect(m.get('b')).toEqual({col:1,cols:2});expect(m.get('c')).toEqual({col:0,cols:1})})
 it('counts conflict pairs on same day only',()=>{expect(conflictPairs([b('a','09:00','10:00'),b('b','09:30','10:30')])).toBe(1);expect(conflictPairs([b('a','09:00','10:00'),b('b','09:00','10:00','2026-10-15')])).toBe(0)})
 it('summarizes a day',()=>{const s=summarize([b('a','09:00','10:00'),b('b','09:30','11:00')],['2026-10-14'],360,1320);expect(s).toEqual({total:120,count:2,conflicts:1,available:960-120})})
 it('formats durations',()=>{expect(fmtDur(90)).toBe('1 j 30 mnt');expect(fmtDur(45)).toBe('45 mnt');expect(fmtDur(120)).toBe('2 j')})
})
