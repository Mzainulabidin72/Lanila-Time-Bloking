import {Link} from 'react-router-dom'
import {CalendarPlus,Copy,Pencil,RotateCcw,Check,Trash2} from 'lucide-react'
import {useStore,Task} from '../../stores/useStore'
import {PRIORITY_LABEL} from '../../lib/categories'
import {STATUS_LABEL} from '../../lib/tasks'
import {Badge,Button,Modal} from '../ui'
import {useToast} from '../Toast'
export default function TaskDetail({task,onClose,onEdit,onSchedule,onDelete}:{task:Task|null;onClose:()=>void;onEdit:(t:Task)=>void;onSchedule:(t:Task)=>void;onDelete:(t:Task)=>void}){
 const {blocks,projects,setTask,addTask}=useStore();const toast=useToast()
 const rel=task?blocks.filter(b=>b.taskId===task.id).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)):[]
 const done=task?.status==='done',proj=projects.find(p=>p.id===task?.projectId)
 return <Modal open={!!task} onClose={onClose} title="Detail tugas">{task&&<div className="space-y-3">
  <p className={`text-lg font-semibold ${done?'line-through opacity-70':''}`}>{task.title}</p>
  <div className="flex flex-wrap gap-1"><Badge tone={task.priority==='high'?'red':task.priority==='mid'?'amber':'green'}>Prioritas {PRIORITY_LABEL[task.priority]}</Badge><Badge tone={done?'green':task.status==='doing'?'violet':'slate'}>{STATUS_LABEL[task.status]}</Badge></div>
  <p className="text-sm text-muted">{task.startDate&&`Mulai: ${task.startDate} · `}Tenggat: {task.due??'tidak ada'} · Estimasi: {task.est} menit</p>{proj&&<p className="text-sm">Proyek: <Link to="/proyek" className="font-medium underline">{proj.name}</Link></p>}
  {task.description&&<p className="whitespace-pre-wrap text-sm">{task.description}</p>}{task.notes&&<p className="whitespace-pre-wrap text-sm text-muted">Catatan: {task.notes}</p>}
  <div><h3 className="text-sm font-semibold">Blok waktu terkait ({rel.length})</h3>{rel.length===0?<p className="text-xs text-muted">Belum dijadwalkan.</p>:<ul className="mt-1 space-y-1 text-xs">{rel.map(b=><li key={b.id} className="flex justify-between rounded-lg bg-elevated px-2 py-1"><span>{b.date} · {b.start}–{b.end}</span><span className="text-muted">{b.done?'Selesai':'Terjadwal'}</span></li>)}</ul>}</div>
  <div className="flex flex-wrap gap-2">
   <Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>{setTask(task.id,{status:done?'todo':'done'});toast(done?'Tugas dibuka kembali':'Tugas selesai');onClose()}}>{done?<RotateCcw size={14}/>:<Check size={14}/>}{done?'Buka kembali':'Tandai selesai'}</Button>
   {!done&&<Button className="inline-flex items-center gap-1" onClick={()=>onSchedule(task)}><CalendarPlus size={14}/>Jadwalkan</Button>}
   <Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>onEdit(task)}><Pencil size={14}/>Ubah</Button>
   <Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>{addTask({...task,id:crypto.randomUUID(),title:`${task.title} (salinan)`,status:'todo',createdAt:undefined});toast('Tugas diduplikasi');onClose()}}><Copy size={14}/>Duplikat</Button>
   <Button variant="ghost" className="inline-flex items-center gap-1 text-red-600 dark:text-red-400" onClick={()=>onDelete(task)}><Trash2 size={14}/>Hapus</Button></div></div>}</Modal>}
