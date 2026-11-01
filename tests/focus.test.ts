import {describe,it,expect} from 'vitest'
import {DEFAULT_SETTINGS,startActive,remainingMs,finishSession,completeIfDue,endEarly,sanitizeActive,todayFocusSec,completedFocusToday,streakDays,dayKey,FocusState,FocusSession} from '../src/lib/focusTimer'
import {sessionToRow,rowToSession} from '../src/repositories/mappers'
const T0=new Date(2026,9,14,9,0,0).getTime()
const SESSION_ID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const DUPLICATE_ID='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const fs=(o:Partial<FocusState>={}):FocusState=>({active:null,summary:null,sessions:[],settings:DEFAULT_SETTINGS,...o})
const S=(id:string,at:number,o:Partial<FocusSession>={}):FocusSession=>({id,type:'focus',status:'completed',plannedSec:1500,actualSec:1500,startedAt:at-1500000,endedAt:at,...o})
describe('timer engine',()=>{
 it('remaining is derived from timestamps (inactive tab gains no time)',()=>{const a=startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID);expect(remainingMs(a,T0)).toBe(1500000);expect(remainingMs(a,T0+600000)).toBe(900000);expect(remainingMs(a,T0+9e9)).toBe(0)})
 it('paused state keeps its remainder regardless of wall clock',()=>{const a={...startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID),endsAt:null,pausedLeftMs:700000};expect(remainingMs(a,T0+1e9)).toBe(700000)})
 it('completion happens exactly once',()=>{const a=startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID);const r1=completeIfDue(fs({active:a}),T0+1500000);expect(r1.session?.status).toBe('completed');expect(r1.session?.actualSec).toBe(1500)
  const r2=completeIfDue(r1.focus,T0+1500001);expect(r2.session).toBeNull();expect(r2.focus.sessions).toHaveLength(1)})
 it('not due yet -> no completion',()=>expect(completeIfDue(fs({active:startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID)}),T0+1000).session).toBeNull())
 it('duplicate session id is never recorded twice',()=>{const a=startActive({type:'focus'},DEFAULT_SETTINGS,T0,DUPLICATE_ID);const r=completeIfDue(fs({active:a,sessions:[S(DUPLICATE_ID,T0)]}),T0+1500000);expect(r.session).toBeNull();expect(r.focus.sessions).toHaveLength(1)})
 it('late recovery records the planned end time',()=>{const a=startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID);expect(completeIfDue(fs({active:a}),T0+99999999).session?.endedAt).toBe(T0+1500000)})
 it('interrupted session records real elapsed time; <60s is dropped',()=>{const a=startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID)
  const r=endEarly(fs({active:a}),T0+600000)!;expect(r.recorded?.status).toBe('interrupted');expect(r.recorded?.actualSec).toBe(600)
  const q=endEarly(fs({active:a}),T0+30000)!;expect(q.recorded).toBeNull();expect(q.focus.sessions).toHaveLength(0);expect(q.focus.active).toBeNull()})
 it('interrupted from paused uses the paused remainder',()=>{const a={...startActive({type:'focus'},DEFAULT_SETTINGS,T0,SESSION_ID),endsAt:null,pausedLeftMs:1200000};expect(finishSession(a,T0+5e9,'interrupted').actualSec).toBe(300)})
 it('sanitizes invalid persisted state',()=>{expect(sanitizeActive(null)).toBeNull();expect(sanitizeActive({id:'x',type:'focus',plannedMs:-1,startedAt:1,endsAt:2,pausedLeftMs:null})).toBeNull();expect(sanitizeActive({id:'x',type:'focus',plannedMs:1000,startedAt:1,endsAt:null,pausedLeftMs:null})).toBeNull();expect(sanitizeActive({id:'x',type:'focus',plannedMs:1000,startedAt:1,endsAt:5,pausedLeftMs:null})?.endsAt).toBe(5)})
})
describe('statistics',()=>{
 const now=T0+3600000
 it('today totals count actual focus time only (no breaks)',()=>{const ss=[S('a',T0),S('b',T0+1000,{status:'interrupted',actualSec:600}),S('c',T0+2000,{type:'short_break',actualSec:300}),S('old',T0-86400000)];expect(todayFocusSec(ss,now)).toBe(2100);expect(completedFocusToday(ss,now)).toBe(1)})
 it('streak counts consecutive days and ignores interrupted sessions',()=>{const d=86400000;expect(streakDays([S('a',T0),S('b',T0-d),S('c',T0-2*d)],now)).toBe(3);expect(streakDays([S('b',T0-d)],now)).toBe(1);expect(streakDays([S('b',T0-2*d)],now)).toBe(0);expect(streakDays([S('a',T0,{status:'interrupted'})],now)).toBe(0);expect(dayKey(T0)).toBe('2026-10-14')})
})
describe('session mapping',()=>{it('round-trips and is DB-valid',()=>{const s=S('11111111-1111-1111-1111-111111111111',T0,{taskId:'t1'});const r=sessionToRow(s);expect(r.minutes).toBeGreaterThan(0);expect('user_id' in r).toBe(false);expect(rowToSession(r)).toEqual(s)})
 it('legacy rows without new columns map safely',()=>{const s=rowToSession({id:'x',minutes:25,ended_at:new Date(T0).toISOString()});expect(s.type).toBe('focus');expect(s.status).toBe('completed');expect(s.actualSec).toBe(1500)})})
