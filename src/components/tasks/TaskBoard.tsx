import {useState} from 'react'
import {CalendarPlus,Clock} from 'lucide-react'
import type {Task} from '../../stores/useStore'
import type {Block} from '../../lib/time'
import {PRIORITY_LABEL} from '../../lib/categories'
import {isDueToday,isOverdue} from '../../lib/tasks'
import {Badge} from '../ui'
import {prTone} from './TaskRow'
export type ColKey='todo'|'doing'|'done'
export const COLS:readonly (readonly [ColKey,string])[]=[['todo','Belum Dimulai'],['doing','Sedang Dikerjakan'],['done','Selesai']]
const colOf=(t:Task):ColKey=>t.status==='inbox'?'todo':t.status
interface P{tasks:Task[];today:string;projects:{id:string;name:string;color:string}[];sched:Map<string,{count:number;next:Block}>;onMove:(id:string,to:ColKey)=>void;onOpen:(t:Task)=>void;onSchedule:(t:Task)=>void}
export default function TaskBoard({tasks,today,projects,sched,onMove,onOpen,onSchedule}:P){
 const [over,setOver]=useState<ColKey|null>(null)
 return <div className="grid gap-3 md:grid-cols-3">{COLS.map(([key,label])=>{const items=tasks.filter(t=>colOf(t)===key)
  return <section key={key} aria-label={label} onDragOver={e=>{e.preventDefault();setOver(key)}} onDragLeave={()=>setOver(o=>o===key?null:o)} onDrop={e=>{e.preventDefault();setOver(null);const id=e.dataTransfer.getData('text/plain');if(id)onMove(id,key)}}
   className={`rounded-2xl border bg-elevated/50 p-2 transition-colors ${over===key?'border-accent bg-brand-violet/10':'border-line'}`}>
   <h2 className="mb-2 flex items-center justify-between px-1 text-sm font-semibold">{label}<span className="rounded-full bg-surface px-2 py-0.5 text-xs font-normal text-muted">{items.length}</span></h2>
   {items.length===0?<p className="rounded-xl border border-dashed border-strong p-4 text-center text-xs text-muted">Tidak ada tugas. Seret kartu ke sini atau pakai menu “Pindahkan”.</p>
   :<ul className="space-y-2">{items.map(t=>{const pr=projects.find(p=>p.id===t.projectId),sc=sched.get(t.id),od=isOverdue(t,today),dt=isDueToday(t,today)
    return <li key={t.id} draggable onDragStart={e=>{e.dataTransfer.setData('text/plain',t.id);e.dataTransfer.effectAllowed='move'}} className="cursor-grab space-y-2 rounded-xl border border-line bg-surface p-3 active:cursor-grabbing">
     <button type="button" onClick={()=>onOpen(t)} className={`block w-full text-left text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 ${t.status==='done'?'line-through opacity-60':''}`}>{t.title}</button>
     <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted"><Badge tone={prTone(t.priority)}>Prioritas {PRIORITY_LABEL[t.priority]}</Badge>
      {t.due&&<span className={od?'font-medium text-red-600 dark:text-red-400':dt?'font-medium text-amber-700 dark:text-amber-300':''}>{od?'Terlambat · ':dt?'Hari ini · ':''}{t.due}</span>}
      <span className="inline-flex items-center gap-1"><Clock size={12}/>{t.est} mnt</span>
      {pr&&<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{background:pr.color}} aria-hidden/>{pr.name}</span>}
      {sc&&<span>Terjadwal · {sc.next.date} {sc.next.start}</span>}</div>
     <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`mv-${t.id}`}>Pindahkan {t.title}</label>
      <select id={`mv-${t.id}`} className="inp !py-1 text-xs" value={colOf(t)} onChange={e=>onMove(t.id,e.target.value as ColKey)}>{COLS.map(([k,l])=><option key={k} value={k}>Pindahkan: {l}</option>)}</select>
      {t.status!=='done'&&<button type="button" onClick={()=>onSchedule(t)} aria-label={`Jadwalkan ${t.title}`} title="Jadwalkan" className="shrink-0 rounded-lg p-1.5 text-accent hover:bg-brand-violet/10 focus-visible:outline focus-visible:outline-2"><CalendarPlus size={16}/></button>}</div></li>})}</ul>}</section>})}</div>}
