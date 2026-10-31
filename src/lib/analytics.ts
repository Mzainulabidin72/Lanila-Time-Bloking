import {addDays,differenceInCalendarDays,format,parseISO} from 'date-fns'
import {Block,duration} from './time'
import type {Task} from '../stores/useStore'
import {Project,blockProjectId} from './projects'
import {FocusSession,dayKey} from './focusTimer'
export interface Range{from:string;to:string}
const ds=(d:Date)=>format(d,'yyyy-MM-dd')
export function presetRange(k:'7d'|'30d'|'month',today:string):Range{const t=parseISO(today)
 if(k==='7d')return {from:ds(addDays(t,-6)),to:today};if(k==='30d')return {from:ds(addDays(t,-29)),to:today}
 return {from:ds(new Date(t.getFullYear(),t.getMonth(),1)),to:today}}
export function daysIn(r:Range):string[]{const n=differenceInCalendarDays(parseISO(r.to),parseISO(r.from))+1;if(!(n>0))return[];return Array.from({length:Math.min(n,366)},(_,i)=>ds(addDays(parseISO(r.from),i)))}
const tally=(m:Map<string,number>,k:string,v:number)=>m.set(k,(m.get(k)??0)+v)
const sorted=(m:Map<string,number>)=>[...m.entries()].map(([key,min])=>({key,min})).sort((a,b)=>b.min-a.min)
/** planned = sum of block durations; completed = durations of blocks marked done (scheduled time, NOT measured);
 *  focus = actual measured time of focus sessions; task rate = tasks whose due date falls in the range. */
export function analyze(d:{blocks:Block[];tasks:Task[];sessions:FocusSession[];projects:Project[]},r:Range){
 const days=daysIn(r),set=new Set(days),blocks=d.blocks.filter(b=>set.has(b.date))
 const perDay=days.map(date=>{const bs=blocks.filter(b=>b.date===date);return {date,planned:bs.reduce((a,b)=>a+duration(b),0),done:bs.filter(b=>b.done).reduce((a,b)=>a+duration(b),0)}})
 const focus=d.sessions.filter(s=>s.type==='focus'&&set.has(dayKey(s.endedAt)))
 const cat=new Map<string,number>(),proj=new Map<string,number>(),names=new Map(d.projects.map(p=>[p.id,p.name]))
 for(const b of blocks){tally(cat,b.category,duration(b));const pid=blockProjectId(b,d.tasks);tally(proj,pid?names.get(pid)??'Proyek dihapus':'Tanpa proyek',duration(b))}
 const due=d.tasks.filter(t=>t.due&&set.has(t.due)),dueDone=due.filter(t=>t.status==='done').length
 const act=new Map<string,number>();for(const s of focus)if(s.taskId)tally(act,s.taskId,s.actualSec)
 const estVsActual=[...act.entries()].flatMap(([id,sec])=>{const t=d.tasks.find(x=>x.id===id);return t?[{id,title:t.title,est:t.est,actualMin:Math.round(sec/60)}]:[]}).sort((a,b)=>b.actualMin-a.actualMin).slice(0,8)
 const focusSec=focus.reduce((a,s)=>a+s.actualSec,0)
 return {days:days.length,perDay,plannedMin:perDay.reduce((a,x)=>a+x.planned,0),completedMin:perDay.reduce((a,x)=>a+x.done,0),blockCount:blocks.length,
  focusSec,focusCompleted:focus.filter(s=>s.status==='completed').length,avgFocusMin:days.length?Math.round(focusSec/60/days.length):0,
  byCategory:sorted(cat),byProject:sorted(proj),taskRate:due.length?{total:due.length,done:dueDone,pct:Math.round(dueDone/due.length*100)}:null,estVsActual,
  hasData:blocks.length>0||focus.length>0||due.length>0}}
