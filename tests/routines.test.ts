import {describe,it,expect} from 'vitest'
import {Routine,overlapPairs,previewApply,notesFor,datesForWeek,datesAhead,filterRoutines,routineStats,validateRoutine} from '../src/lib/routines'
import {routineToRow,rowToRoutine,blockToRow,rowToBlock} from '../src/repositories/mappers'
import type {Block} from '../src/lib/time'
const RB=(id:string,title:string,start:string,end:string)=>({id,title,start,end,category:'Deep Work'})
const R:Routine={id:'r1',name:'Pagi Produktif',category:'Pagi Produktif',color:'#10B981',weekdays:[1,2,3],startDate:'2026-10-01',endDate:'2026-12-31',blocks:[RB('a','Olahraga','06:00','07:00'),RB('b','Deep work','09:00','11:00')]}
const B=(id:string,start:string,end:string,o:Partial<Block>={}):Block=>({id,title:id,date:'2026-10-14',start,end,category:'x',done:false,...o})
describe('routine logic',()=>{
 it('detects overlapping activities (warning pairs)',()=>expect(overlapPairs([RB('1','a','09:00','10:00'),RB('2','b','09:30','10:30'),RB('3','c','10:30','11:00')])).toEqual([[0,1]]))
 it('validates dates range and basics',()=>{expect(validateRoutine({name:'x',blocks:R.blocks,startDate:'2026-12-01',endDate:'2026-11-01'})).toMatch(/Tanggal akhir/);expect(validateRoutine({name:'x',blocks:R.blocks})).toBeNull()})
 it('stats: count, total duration, span',()=>expect(routineStats(R)).toEqual({count:2,totalMin:180,start:'06:00',end:'11:00'}))
 it('preview flags conflicts without touching anything',()=>{const ex=[B('m','10:00','10:30')];const p=previewApply(R,'2026-10-14',ex);expect(p[0].conflicts).toHaveLength(0);expect(p[1].conflicts.map(c=>c.id)).toEqual(['m']);expect(p[1].duplicate).toBe(false);expect(ex).toHaveLength(1)})
 it('re-applying is detected as duplicate (by source id or identical title+time), and is not a conflict',()=>{
  const bySource=previewApply(R,'2026-10-14',[B('x','06:00','07:00',{title:'renamed',routineId:'r1',routineBlockId:'a'})]);expect(bySource[0].duplicate).toBe(true);expect(bySource[0].conflicts).toHaveLength(0)
  const byMatch=previewApply(R,'2026-10-14',[B('y','09:00','11:00',{title:'Deep work'})]);expect(byMatch[1].duplicate).toBe(true);expect(byMatch[1].conflicts).toHaveLength(0)
  expect(previewApply(R,'2026-10-15',[B('x','06:00','07:00',{routineId:'r1',routineBlockId:'a'})])[0].duplicate).toBe(false)})
 it('notes warn about weekday and date range, never block',()=>{expect(notesFor(R,'2026-10-14')).toEqual([]);expect(notesFor(R,'2026-10-18')).toHaveLength(1);expect(notesFor(R,'2027-01-05').length).toBeGreaterThan(0)})
 it('date helpers respect recurring weekdays',()=>{expect(datesForWeek('2026-10-14',[1,3])).toEqual(['2026-10-12','2026-10-14']);expect(datesForWeek('2026-10-14',[])).toHaveLength(7);expect(datesAhead('2026-10-14',7,[3,4])).toEqual(['2026-10-14','2026-10-15'])})
 it('filters by search (name, description, activity), status and category',()=>{const rs:Routine[]=[R,{...R,id:'r2',name:'Malam',category:'Rutinitas Malam',active:false,blocks:[RB('z','Baca buku','21:00','22:00')]}]
  const f=(o:object)=>filterRoutines(rs,{q:'',status:'all',category:'',...o}).map(r=>r.id)
  expect(f({})).toEqual(['r1','r2']);expect(f({status:'active'})).toEqual(['r1']);expect(f({status:'inactive'})).toEqual(['r2']);expect(f({q:'baca'})).toEqual(['r2']);expect(f({category:'Pagi Produktif'})).toEqual(['r1'])})
 it('legacy routines (no new fields) count as active',()=>expect(filterRoutines([{id:'o',name:'Lama',weekdays:[],blocks:[]}],{q:'',status:'active',category:''})).toHaveLength(1))
})
describe('routine mapping',()=>{
 it('round-trips new fields and never sends user_id',()=>{const row=routineToRow({...R,active:false,lastAppliedAt:Date.UTC(2026,9,14)});expect('user_id' in row).toBe(false);expect(row.active).toBe(false);expect(rowToRoutine(row)).toMatchObject({category:'Pagi Produktif',color:'#10B981',active:false,startDate:'2026-10-01',endDate:'2026-12-31',lastAppliedAt:Date.UTC(2026,9,14)})})
 it('old rows default to active; blocks carry routine source',()=>{expect(rowToRoutine({id:'x',name:'n',weekdays:[],blocks:[]}).active).toBe(true);const r=blockToRow(B('a','09:00','10:00',{routineId:'r1',routineBlockId:'a'}));expect(r.routine_id).toBe('r1');expect(rowToBlock({...r,start_time:'09:00:00',end_time:'10:00:00'}).routineBlockId).toBe('a')})
})
