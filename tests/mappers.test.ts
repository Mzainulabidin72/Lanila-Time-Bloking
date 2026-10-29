import {describe,it,expect} from 'vitest'
import {blockToRow,rowToBlock,taskToRow,rowToTask} from '../src/repositories/mappers'
describe('mappers',()=>{
 it('round-trips a block and trims seconds from time',()=>{
  const b={id:'1',title:'x',date:'2026-10-14',start:'09:00',end:'10:30',category:'Deep Work',done:false,priority:'mid' as const}
  expect(rowToBlock({...blockToRow(b),start_time:'09:00:00',end_time:'10:30:00'})).toEqual({...b,taskId:undefined})})
 it('never sends user_id from the client',()=>{
  expect('user_id' in blockToRow({id:'1',title:'x',date:'2026-10-14',start:'09:00',end:'10:00',category:'c',done:false})).toBe(false)
  expect('user_id' in taskToRow({id:'1',title:'t',status:'todo',priority:'mid',est:30})).toBe(false)})
 it('maps task est_minutes',()=>expect(rowToTask({id:'1',title:'t',status:'done',priority:'low',est_minutes:45}).est).toBe(45))
})
