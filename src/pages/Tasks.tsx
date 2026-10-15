import {useState} from 'react'
import {useStore,Task} from '../stores/useStore'
export default function Tasks(){
 const {tasks,addTask,setTask,delTask}=useStore();const [title,setTitle]=useState('');const [pr,setPr]=useState<Task['priority']>('mid');const [est,setEst]=useState(30)
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Tugas</h1>
  <form className="card flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();if(!title.trim())return;addTask({id:crypto.randomUUID(),title:title.trim(),status:'todo',priority:pr,est});setTitle('')}}>
   <input aria-label="Judul tugas" placeholder="Tugas baru" className="inp flex-1" value={title} onChange={e=>setTitle(e.target.value)}/>
   <select aria-label="Prioritas" className="inp w-28" value={pr} onChange={e=>setPr(e.target.value as Task['priority'])}><option value="low">Rendah</option><option value="mid">Sedang</option><option value="high">Tinggi</option></select>
   <input aria-label="Estimasi menit" type="number" min={5} step={5} className="inp w-24" value={est} onChange={e=>setEst(Number(e.target.value)||5)}/><button className="btn">Tambah</button></form>
  {tasks.length===0?<p className="text-sm text-slate-500">Belum ada tugas.</p>:<ul className="space-y-2">{tasks.map(t=><li key={t.id} className="card flex items-center gap-3 !p-3">
   <input type="checkbox" aria-label={`Selesai: ${t.title}`} checked={t.status==='done'} onChange={e=>setTask(t.id,{status:e.target.checked?'done':'todo'})}/>
   <span className={`flex-1 text-sm ${t.status==='done'?'line-through opacity-60':''}`}>{t.title}</span><span className="text-xs text-slate-500">{t.priority} · {t.est} mnt</span>
   <button className="text-xs text-red-600" onClick={()=>confirm('Hapus tugas?')&&delTask(t.id)}>Hapus</button></li>)}</ul>}</div>}
