import {AlertTriangle,Check} from 'lucide-react'
import {format,parseISO} from 'date-fns'
import {id as idl} from 'date-fns/locale'
import {Block,duration,toMin,fmt} from '../../lib/time'
import {HOUR_PX,conflictIds,layoutColumns,fmtDur} from '../../lib/schedule'
import {catColor} from '../../lib/categories'
import type {Task} from '../../stores/useStore'
import {Button} from '../ui'
interface P{dates:string[];selected:string;blocks:Block[];tasks:Task[];startMin:number;endMin:number;today:string;nowMin:number;periodLabel:string
 onSelectBlock:(b:Block)=>void;onSlot:(date:string,startMin:number)=>void;onPickDate:(d:string)=>void;onAdd:()=>void}
export default function Grid(p:P){
 const n=p.dates.length,H=(p.endMin-p.startMin)/60*HOUR_PX,tpl=`56px repeat(${n},minmax(${n>1?110:0}px,1fr))`
 const hours:number[]=[];for(let m=p.startMin;m<p.endMin;m+=60)hours.push(m)
 const inRange=p.blocks.filter(b=>p.dates.includes(b.date)),conf=conflictIds(inRange),empty=inRange.length===0
 return <div className="card !p-0"><div className="max-h-[70vh] overflow-auto" tabIndex={0} aria-label="Kalender jadwal"><div style={{minWidth:n>1?56+n*110:undefined}}>
  <div className="sticky top-0 z-20 grid border-b border-line bg-surface" style={{gridTemplateColumns:tpl}}><div className="sticky left-0 bg-surface"/>
   {p.dates.map(d=>{const dt=parseISO(d),isT=d===p.today,isS=d===p.selected
    return <button key={d} type="button" onClick={()=>p.onPickDate(d)} aria-label={`Buka ${format(dt,'EEEE d MMMM',{locale:idl})}`} aria-current={isT?'date':undefined} className={`py-2 text-center text-xs transition-colors hover:bg-elevated focus-visible:outline focus-visible:outline-2 ${isS?'bg-elevated':''}`}>
     <span className="block text-muted">{format(dt,'EEE',{locale:idl})}</span><span className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isT?'bg-brand-violet text-white':''}`}>{format(dt,'d')}</span></button>})}</div>
  <div className="relative grid" style={{gridTemplateColumns:tpl}}>
   <div className="sticky left-0 z-10 border-r border-line bg-surface" style={{height:H}}>{hours.map((m,i)=><span key={m} className={`absolute right-1 text-[10px] text-muted ${i?'-translate-y-1/2':''}`} style={{top:i*HOUR_PX+(i?0:2)}}>{fmt(m)}</span>)}</div>
   {p.dates.map(d=>{const day=inRange.filter(b=>b.date===d),lay=layoutColumns(day),showNow=d===p.today&&p.nowMin>=p.startMin&&p.nowMin<=p.endMin
    return <div key={d} className="relative cursor-cell border-l border-line first:border-l-0" style={{height:H}} title="Klik area kosong untuk menambah blok"
     onClick={e=>{if(e.target!==e.currentTarget)return;p.onSlot(d,p.startMin+Math.floor(e.nativeEvent.offsetY/HOUR_PX)*60)}}>
     {hours.map((m,i)=><div key={m} className="pointer-events-none absolute inset-x-0 border-t border-line" style={{top:i*HOUR_PX}}/>)}
     {day.map(b=>{const L=lay.get(b.id)!,bc=catColor(b.category),dur=duration(b),h=Math.max(dur/60*HOUR_PX,22),isC=conf.has(b.id),active=!b.done&&d===p.today&&toMin(b.start)<=p.nowMin&&p.nowMin<toMin(b.end),task=p.tasks.find(t=>t.id===b.taskId)
      return <button key={b.id} type="button" onClick={()=>p.onSelectBlock(b)} aria-label={`${b.title}, ${b.start} sampai ${b.end}${b.done?', selesai':active?', sedang berlangsung':''}${isC?', bentrok':''}`}
       className={`absolute overflow-hidden rounded-lg px-2 py-1 text-left text-xs text-ink transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-violet ${b.done?'opacity-60':''} ${isC?'ring-2 ring-amber-500':active?'ring-2 ring-accent':''}`}
       style={{top:(toMin(b.start)-p.startMin)/60*HOUR_PX+1,height:h-2,left:`calc(${L.col*100/L.cols}% + 2px)`,width:`calc(${100/L.cols}% - 4px)`,background:`${bc}26`,borderLeft:`3px solid ${bc}`}}>
       <span className={`flex items-center gap-1 font-medium ${b.done?'line-through':''}`}>{b.done&&<Check size={12} className="shrink-0"/>}{isC&&<AlertTriangle size={12} className="shrink-0 text-amber-600 dark:text-amber-400"/>}<span className="truncate">{b.title}</span></span>
       {h>=40&&<span className="block truncate text-muted">{b.start}–{b.end} · {fmtDur(dur)}</span>}{h>=64&&<span className="block truncate text-muted">{b.category}{task&&` · ${task.title}`}</span>}</button>})}
     {showNow&&<div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{top:(p.nowMin-p.startMin)/60*HOUR_PX}} aria-hidden><span className="-ml-1 h-2 w-2 rounded-full bg-red-500"/><span className="h-px flex-1 bg-red-500"/></div>}</div>})}
   {empty&&<div className="pointer-events-none absolute left-14 right-0 top-6 flex flex-col items-center gap-2 px-4 text-center"><p className="text-sm text-muted">Belum ada blok waktu pada {p.periodLabel}.</p><Button className="pointer-events-auto" onClick={p.onAdd}>Tambah Blok Pertama</Button></div>}</div></div></div></div>}
