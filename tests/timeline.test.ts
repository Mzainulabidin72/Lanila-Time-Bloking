import {describe,it,expect} from 'vitest'
import {buildTimeline} from '../src/lib/timeline'
import {weekDates} from '../src/lib/time'
import {isEmail,passwordStrength} from '../src/lib/validate'
const b=(id:string,start:string,end:string)=>({id,title:id,date:'2026-10-14',start,end,category:'x',done:false})
describe('timeline',()=>{
 it('shows free gaps >=15 min and a now marker',()=>{
  const r=buildTimeline([b('a','08:00','09:00'),b('b','10:00','11:00')],9*60+30)
  expect(r.filter(x=>x.kind==='free').length).toBeGreaterThanOrEqual(2)
  expect(r.findIndex(x=>x.kind==='now')).toBeGreaterThan(r.findIndex(x=>x.kind==='block'))})
 it('no free row for tiny gaps',()=>expect(buildTimeline([b('a','06:00','09:00'),b('b','09:10','22:00')],null).some(x=>x.kind==='free')).toBe(false))
 it('week starts on Monday',()=>{const w=weekDates('2026-10-14');expect(w[0]).toBe('2026-10-12');expect(w[6]).toBe('2026-10-18')})
})
describe('validate',()=>{
 it('email',()=>{expect(isEmail('a@b.co')).toBe(true);expect(isEmail('nope')).toBe(false)})
 it('strength grows',()=>expect(passwordStrength('Abcdef1!xyz').score).toBeGreaterThan(passwordStrength('abc').score))
})
