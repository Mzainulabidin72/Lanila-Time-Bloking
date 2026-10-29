export type SessionType='focus'|'short_break'|'long_break'
export type SessionStatus='completed'|'interrupted'
export interface FocusSettings{focusMin:number;shortMin:number;longMin:number;goalMin:number;longEvery:number;sound:boolean}
export const DEFAULT_SETTINGS:FocusSettings={focusMin:25,shortMin:5,longMin:15,goalMin:120,longEvery:4,sound:false}
/** Interrupted sessions shorter than this are NOT recorded (documented rule). */
export const MIN_RECORD_SEC=60
export interface Active{id:string;type:SessionType;taskId?:string;objective?:string;plannedMs:number;startedAt:number;endsAt:number|null;pausedLeftMs:number|null}
export interface FocusSession{id:string;type:SessionType;status:SessionStatus;taskId?:string;objective?:string;plannedSec:number;actualSec:number;startedAt:number;endedAt:number}
export interface FocusState{active:Active|null;summary:FocusSession|null;sessions:FocusSession[];settings:FocusSettings}
export const TYPE_LABEL:Record<SessionType,string>={focus:'Fokus',short_break:'Istirahat Singkat',long_break:'Istirahat Panjang'}
export const minutesFor=(t:SessionType,s:FocusSettings)=>t==='focus'?s.focusMin:t==='short_break'?s.shortMin:s.longMin
/** Remaining time is ALWAYS derived from timestamps (or the stored paused remainder), never from a tick counter. */
export const remainingMs=(a:Active,now:number)=>a.endsAt!=null?Math.max(0,a.endsAt-now):Math.max(0,a.pausedLeftMs??a.plannedMs)
export function startActive(o:{type:SessionType;taskId?:string;objective?:string},s:FocusSettings,now:number,id=crypto.randomUUID()):Active{
 const plannedMs=minutesFor(o.type,s)*60000;return {id,type:o.type,taskId:o.taskId,objective:o.objective,plannedMs,startedAt:now,endsAt:now+plannedMs,pausedLeftMs:null}}
export function finishSession(a:Active,now:number,reason:SessionStatus):FocusSession{
 const done=reason==='completed',left=remainingMs(a,now)
 const actualMs=done?a.plannedMs:Math.max(0,Math.min(a.plannedMs,a.plannedMs-left))
 return {id:a.id,type:a.type,status:reason,taskId:a.taskId,objective:a.objective,plannedSec:Math.round(a.plannedMs/1000),actualSec:Math.round(actualMs/1000),startedAt:a.startedAt,endedAt:done&&a.endsAt!=null?a.endsAt:now}}
/** Idempotent: completes only when due, and never records the same session id twice. */
export function completeIfDue(f:FocusState,now:number):{focus:FocusState;session:FocusSession|null}{
 const a=f.active;if(!a||remainingMs(a,now)>0)return {focus:f,session:null}
 const sess=finishSession(a,now,'completed')
 if(f.sessions.some(x=>x.id===sess.id))return {focus:{...f,active:null},session:null}
 return {focus:{...f,active:null,summary:sess,sessions:[...f.sessions,sess]},session:sess}}
export function endEarly(f:FocusState,now:number):{focus:FocusState;recorded:FocusSession|null;elapsedSec:number}|null{
 const a=f.active;if(!a)return null
 const sess=finishSession(a,now,'interrupted'),rec=sess.actualSec>=MIN_RECORD_SEC&&!f.sessions.some(x=>x.id===sess.id)?sess:null
 return {focus:{...f,active:null,sessions:rec?[...f.sessions,rec]:f.sessions},recorded:rec,elapsedSec:sess.actualSec}}
export function sanitizeActive(a:any):Active|null{
 if(!a||typeof a.id!=='string'||!['focus','short_break','long_break'].includes(a.type))return null
 if(!Number.isFinite(a.plannedMs)||a.plannedMs<=0||!Number.isFinite(a.startedAt))return null
 const run=Number.isFinite(a.endsAt),paused=Number.isFinite(a.pausedLeftMs);if(run===paused)return null
 return {id:a.id,type:a.type,taskId:a.taskId||undefined,objective:a.objective||undefined,plannedMs:a.plannedMs,startedAt:a.startedAt,endsAt:run?a.endsAt:null,pausedLeftMs:paused?a.pausedLeftMs:null}}
export const legacySession=(x:{id?:string;at:number;minutes:number},i:number):FocusSession=>({id:x.id??`legacy-${i}`,type:'focus',status:'completed',plannedSec:x.minutes*60,actualSec:x.minutes*60,startedAt:x.at-x.minutes*60000,endedAt:x.at})
export const dayKey=(ms:number)=>{const d=new Date(ms);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
/** Actual time of focus sessions ended today (completed + interrupted >=1 min). Breaks are excluded. */
export const todayFocusSec=(ss:FocusSession[],now:number)=>ss.filter(s=>s.type==='focus'&&dayKey(s.endedAt)===dayKey(now)).reduce((a,s)=>a+s.actualSec,0)
export const completedFocusToday=(ss:FocusSession[],now:number)=>ss.filter(s=>s.type==='focus'&&s.status==='completed'&&dayKey(s.endedAt)===dayKey(now)).length
/** Consecutive days with >=1 completed focus session, ending today (or yesterday if today has none yet). */
export function streakDays(ss:FocusSession[],now:number){
 const days=new Set(ss.filter(s=>s.type==='focus'&&s.status==='completed').map(s=>dayKey(s.endedAt)));const d=new Date(now)
 if(!days.has(dayKey(d.getTime())))d.setDate(d.getDate()-1)
 let n=0;while(days.has(dayKey(d.getTime()))){n++;d.setDate(d.getDate()-1)};return n}
export const fmtSec=(s:number)=>{const m=Math.floor(s/60),r=s%60;return m?`${m} mnt${r?` ${r} dtk`:''}`:`${r} dtk`}
