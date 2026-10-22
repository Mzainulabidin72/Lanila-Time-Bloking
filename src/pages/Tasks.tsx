import {useState} from 'react'
import {useStore,Task} from '../stores/useStore'
import {Button,EmptyState,Field,Modal,Badge} from '../components/ui'
const PR={high:0,mid:1,low:2};const PL={high:'Tinggi',mid:'Sedang',low:'Rendah'}
export default function Tasks(){
 const {tasks,addTask,setTask,delTask}=useStore();const [title,setTitle]=useState('');const [pr,setPr]=useState<Task['priority']>('mid');const [est,setEst]=useState(30);const [due,setDue]=useState('')
 const [flt,setFlt]=useState<'all'|'open'|'done'>('open');const [sort,setSort]=useState<'pr'|'due'>('pr');const [ed,setEd]=useState<Task|null>(null)
 const list=tasks.filter(t=>flt==='all'||(flt==='done')===(t.status==='done')).sort((a,b)=>sort==='pr'?PR[a.priority]-PR[b.priority]:(a.due??'9').localeCompare(b.due??'9'))
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Tugas</h1>
  <form className="card flex flex-wrap items-end gap-2" onSubmit={e=>{e.preventDefault();if(!title.trim())return;addTask({id:crypto.randomUUID(),title:title.trim(),status:'todo',priority:pr,est,due:due||undefined});setTitle('');setDue('')}}>
   <div className="min-w-[10rem] flex-1"><Field label="Tugas baru" id="tt"><input id="tt" className="inp" value={title} onChange={e=>setTitle(e.target.value)}/></Field></div>
   <Field label="Prioritas" id="tp"><select id="tp" className="inp" value={pr} onChange={e=>setPr(e.target.value as Task['priority'])}><option value="low">Rendah</option><option value="mid">Sedang</option><option value="high">Tinggi</option></select></Field>
   <Field label="Tenggat" id="td"><input id="td" type="date" className="inp" value={due} onChange={e=>setDue(e.target.value)}/></Field>
   <Field label="Estimasi (mnt)" id="te"><input id="te" type="number" min={5} step={5} className="inp w-24" value={est} onChange={e=>setEst(Number(e.target.value)||5)}/></Field><Button>Tambah</Button></form>
  <div className="flex flex-wrap gap-3 text-sm"><label>Tampilkan <select className="inp inline w-auto" value={flt} onChange={e=>setFlt(e.target.value as typeof flt)}><option value="open">Belum selesai</option><option value="done">Selesai</option><option value="all">Semua</option></select></label>
   <label>Urutkan <select className="inp inline w-auto" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="pr">Prioritas</option><option value="due">Tenggat</option></select></label></div>
  {list.length===0?<EmptyState title="Tidak ada tugas" text="Tambahkan tugas di atas."/>:<ul className="space-y-2">{list.map(t=><li key={t.id} className="card flex items-center gap-3 !p-3">
   <input type="checkbox" aria-label={`Selesai: ${t.title}`} checked={t.status==='done'} onChange={e=>setTask(t.id,{status:e.target.checked?'done':'todo'})}/>
   <span className={`min-w-0 flex-1 truncate text-sm ${t.status==='done'?'line-through opacity-60':''}`}>{t.title}</span><Badge tone={t.priority==='high'?'red':t.priority==='mid'?'amber':'slate'}>{PL[t.priority]}</Badge><span className="text-xs text-slate-500">{t.due?`${t.due} · `:''}{t.est} mnt</span>
   <button className="text-xs text-brand-violet" onClick={()=>setEd(t)}>Ubah</button><button className="text-xs text-red-600" onClick={()=>confirm('Hapus tugas ini?')&&delTask(t.id)}>Hapus</button></li>)}</ul>}
  <Modal open={!!ed} onClose={()=>setEd(null)} title="Ubah tugas">{ed&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();if(!ed.title.trim())return;setTask(ed.id,{title:ed.title.trim(),priority:ed.priority,due:ed.due||undefined,est:ed.est});setEd(null)}}>
   <Field label="Judul" id="et"><input id="et" className="inp" value={ed.title} onChange={e=>setEd({...ed,title:e.target.value})}/></Field>
   <Field label="Prioritas" id="ep"><select id="ep" className="inp" value={ed.priority} onChange={e=>setEd({...ed,priority:e.target.value as Task['priority']})}><option value="low">Rendah</option><option value="mid">Sedang</option><option value="high">Tinggi</option></select></Field>
   <Field label="Tenggat" id="ed"><input id="ed" type="date" className="inp" value={ed.due??''} onChange={e=>setEd({...ed,due:e.target.value||undefined})}/></Field>
   <Field label="Estimasi (mnt)" id="ee"><input id="ee" type="number" min={5} className="inp" value={ed.est} onChange={e=>setEd({...ed,est:Number(e.target.value)||5})}/></Field>
   <div className="flex gap-2"><Button>Simpan</Button><Button type="button" variant="ghost" onClick={()=>setEd(null)}>Batal</Button></div></form>}</Modal></div>}
