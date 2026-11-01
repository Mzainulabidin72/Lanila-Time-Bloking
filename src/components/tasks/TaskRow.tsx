import {ReactNode,useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {AlertCircle,CalendarCheck,CalendarPlus,CalendarClock,Clock,Copy,Flag,FolderKanban,MoreVertical,Pencil,Play,Trash2,Undo2} from 'lucide-react'
import {format,parseISO} from 'date-fns'
import {id as idl} from 'date-fns/locale'
import type {Task} from '../../stores/useStore'
import type {Block} from '../../lib/time'
import {PRIORITY_LABEL} from '../../lib/categories'
import {isDueToday,isOverdue} from '../../lib/tasks'
import {Badge} from '../ui'
export type QuickField='priority'|'due'|'project'
interface Item{label:string;icon:ReactNode;onClick:()=>void;danger?:boolean}
function RowMenu({items}:{items:Item[]}){
 const [open,setOpen]=useState(false);const r=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(!open)return
  const d=(e:MouseEvent)=>{if(!r.current?.contains(e.target as Node))setOpen(false)},k=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)}
  document.addEventListener('mousedown',d);document.addEventListener('keydown',k);return()=>{document.removeEventListener('mousedown',d);document.removeEventListener('keydown',k)}},[open])
 return <div ref={r} className="relative"><button type="button" aria-label="Aksi lainnya" title="Aksi lainnya" aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(!open)} className="rounded-lg p-2 text-muted hover:bg-elevated focus-visible:outline focus-visible:outline-2"><MoreVertical size={16}/></button>
  {open&&<div role="menu" className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-line bg-surface p-1 shadow-lg">{items.map(i=><button key={i.label} role="menuitem" type="button" onClick={()=>{setOpen(false);i.onClick()}} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-elevated ${i.danger?'text-red-600 dark:text-red-400':''}`}>{i.icon}{i.label}</button>)}</div>}</div>}
export const prTone=(p:Task['priority'])=>p==='high'?'red':p==='mid'?'amber':'green'
export default function TaskRow({task:t,today,project,sched,onToggle,onOpen,onSchedule,onEdit,onDup,onDelete,onStatus,onQuick}:{task:Task;today:string;project?:{name:string;color:string};sched?:{count:number;next:Block};onToggle:()=>void;onOpen:()=>void;onSchedule:()=>void;onEdit:()=>void;onDup:()=>void;onDelete:()=>void;onStatus:(s:Task['status'])=>void;onQuick:(f:QuickField)=>void}){
 const done=t.status==='done',od=isOverdue(t,today),dt=isDueToday(t,today),d=t.due?format(parseISO(t.due),'d MMM',{locale:idl}):null
 const items:Item[]=[{label:'Ubah',icon:<Pencil size={14}/>,onClick:onEdit},{label:'Ubah prioritas',icon:<Flag size={14}/>,onClick:()=>onQuick('priority')},{label:'Ubah tenggat',icon:<CalendarClock size={14}/>,onClick:()=>onQuick('due')},{label:'Ubah proyek',icon:<FolderKanban size={14}/>,onClick:()=>onQuick('project')},
  ...(t.status==='todo'||t.status==='inbox'?[{label:'Mulai dikerjakan',icon:<Play size={14}/>,onClick:()=>onStatus('doing')}]:[]),
  ...(t.status==='doing'?[{label:'Kembalikan ke Belum dimulai',icon:<Undo2 size={14}/>,onClick:()=>onStatus('todo')}]:[]),
  {label:'Duplikat',icon:<Copy size={14}/>,onClick:onDup},{label:'Hapus',icon:<Trash2 size={14}/>,onClick:onDelete,danger:true}]
 return <li className="card flex items-start gap-3 !p-3">
  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" aria-label={done?`Buka kembali: ${t.title}`:`Selesai: ${t.title}`} checked={done} onChange={onToggle}/>
  <div className="min-w-0 flex-1"><button type="button" onClick={onOpen} className={`block max-w-full truncate text-left text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 ${done?'line-through opacity-60':''}`}>{t.title}</button>
   <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
    <Badge tone={prTone(t.priority)}>Prioritas {PRIORITY_LABEL[t.priority]}</Badge>
    {t.status==='doing'&&<Badge tone="violet">Sedang dikerjakan</Badge>}{done&&<Badge tone="green">Selesai</Badge>}
    {d&&<span className={`inline-flex items-center gap-1 ${od?'font-medium text-red-600 dark:text-red-400':dt?'font-medium text-amber-700 dark:text-amber-300':''}`}>{od&&<AlertCircle size={12}/>}{od?`Terlambat · ${d}`:dt?'Hari ini':d}</span>}
    <span className="inline-flex items-center gap-1"><Clock size={12}/>{t.est} mnt</span>
    {project&&<Link to="/proyek" className="inline-flex items-center gap-1 hover:underline"><span className="h-2 w-2 rounded-full" style={{background:project.color}} aria-hidden/>{project.name}</Link>}
    {sched&&<Link to={`/jadwal?tanggal=${sched.next.date}`} title="Buka di Jadwal Saya" className="inline-flex items-center gap-1 hover:underline"><CalendarCheck size={12}/>Terjadwal · {format(parseISO(sched.next.date),'d MMM',{locale:idl})} {sched.next.start}{sched.count>1&&` (+${sched.count-1})`}</Link>}</div></div>
  {!done&&<button type="button" onClick={onSchedule} title={sched?'Jadwalkan sesi tambahan':'Jadwalkan tugas ini'} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-violet/10 px-2 py-1.5 text-xs font-medium text-accent hover:bg-brand-violet/20 focus-visible:outline focus-visible:outline-2"><CalendarPlus size={14}/>Jadwalkan</button>}
  <RowMenu items={items}/></li>}
