import {useState} from 'react'
import {ClipboardList,Plus,Search} from 'lucide-react'
import {useStore} from '../stores/useStore'
import type {Task} from '../stores/useStore'
import {todayStr} from '../lib/time'
import {DEFAULT_FILTERS,Filters,GroupMode,SortKey,applyFilters,emptyInfo,groupTasks,metrics,sortTasks} from '../lib/tasks'
import {Button,EmptyState,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
import TaskForm,{TaskDraft} from '../components/tasks/TaskForm'
import TaskRow from '../components/tasks/TaskRow'
import TaskDetail from '../components/tasks/TaskDetail'
import ScheduleDialog from '../components/tasks/ScheduleDialog'
export default function Tasks(){
 const {tasks,blocks,projects,addTask,setTask,delTask}=useStore();const toast=useToast();const today=todayStr()
 const [f,setF]=useState<Filters>(DEFAULT_FILTERS);const [sort,setSort]=useState<SortKey>('pr');const [mode,setMode]=useState<GroupMode>('list');const [quick,setQuick]=useState('')
 const [draft,setDraft]=useState<TaskDraft|null>(null);const [formOpen,setFormOpen]=useState(false);const [detail,setDetail]=useState<string|null>(null);const [sched,setSched]=useState<Task|null>(null);const [del,setDel]=useState<Task|null>(null)
 const m=metrics(tasks,today),list=sortTasks(applyFilters(tasks,f,today),sort),groups=groupTasks(list,mode,today),empty=emptyInfo(f,tasks.length)
 const filtersOn=!!(f.q||f.priority||f.due||f.project||f.status!=='active')
 const bc=new Map<string,number>();blocks.forEach(b=>{if(b.taskId)bc.set(b.taskId,(bc.get(b.taskId)??0)+1)})
 const openNew=()=>{setDraft({});setFormOpen(true)},edit=(t:Task)=>{setDetail(null);setDraft(t);setFormOpen(true)}
 const toggle=(t:Task)=>{setTask(t.id,{status:t.status==='done'?'todo':'done'});toast(t.status==='done'?'Tugas dibuka kembali':'Tugas selesai')}
 const dup=(t:Task)=>{addTask({...t,id:crypto.randomUUID(),title:`${t.title} (salinan)`,status:'todo',createdAt:undefined});toast('Tugas diduplikasi')}
 const cards=[['Tugas Aktif',m.active,'active','belum selesai'],['Jatuh Tempo Hari Ini',m.dueToday,'today','belum selesai'],['Terlambat',m.overdue,'overdue','belum selesai, lewat tenggat'],['Selesai',m.done,'done','total selesai']] as const
 const sel=<K extends keyof Filters>(k:K,v:Filters[K])=>setF({...f,[k]:v})
 return <div className="mx-auto max-w-5xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Tugas</h1><p className="text-sm text-muted">Kelola prioritas dan ubah rencana menjadi tindakan.</p></div>
   <Button className="inline-flex items-center gap-1" onClick={openNew}><Plus size={16}/>Tambah Tugas</Button></div>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([l,v,k,s])=><button key={l} type="button" aria-pressed={f.status===k} onClick={()=>sel('status',k)} className={`card !p-4 text-left transition-colors hover:bg-elevated focus-visible:outline focus-visible:outline-2 ${f.status===k?'ring-2 ring-accent':''}`}>
   <span className="block text-xs text-muted">{l}</span><span className={`mt-1 block text-xl font-semibold ${k==='overdue'&&v>0?'text-red-600 dark:text-red-400':''}`}>{v}</span><span className="block text-xs text-muted">{s}</span></button>)}</div>
  <form className="flex gap-2" onSubmit={e=>{e.preventDefault();const t=quick.trim();if(!t)return;addTask({id:crypto.randomUUID(),title:t,status:'todo',priority:'mid',est:30});setQuick('');toast('Tugas ditambahkan')}}>
   <input aria-label="Tambah cepat" placeholder="Tambah cepat: ketik judul lalu Enter" className="inp" value={quick} onChange={e=>setQuick(e.target.value)}/><Button variant="ghost" disabled={!quick.trim()}>Tambah</Button></form>
  <div className="flex flex-wrap items-center gap-2">
   <div className="relative min-w-[10rem] flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input aria-label="Cari tugas" placeholder="Cari tugas" className="inp pl-8" value={f.q} onChange={e=>sel('q',e.target.value)}/></div>
   <select aria-label="Filter status" className="inp w-auto" value={f.status} onChange={e=>sel('status',e.target.value as Filters['status'])}><option value="active">Aktif</option><option value="all">Semua</option><option value="open">Belum selesai</option><option value="doing">Sedang dikerjakan</option><option value="done">Selesai</option><option value="overdue">Terlambat</option><option value="today">Jatuh tempo hari ini</option></select>
   <select aria-label="Filter prioritas" className="inp w-auto" value={f.priority} onChange={e=>sel('priority',e.target.value as Filters['priority'])}><option value="">Semua prioritas</option><option value="high">Tinggi</option><option value="mid">Sedang</option><option value="low">Rendah</option></select>
   <select aria-label="Filter tenggat" className="inp w-auto" value={f.due} onChange={e=>sel('due',e.target.value as Filters['due'])}><option value="">Semua tenggat</option><option value="week">7 hari ke depan</option><option value="none">Tanpa tenggat</option></select>
   <select aria-label="Filter proyek" className="inp w-auto max-w-[11rem]" value={f.project} onChange={e=>sel('project',e.target.value)}><option value="">Semua proyek</option><option value="none">Tanpa proyek</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
   <select aria-label="Urutkan" className="inp w-auto" value={sort} onChange={e=>setSort(e.target.value as SortKey)}><option value="pr">Urut: Prioritas</option><option value="due">Urut: Tenggat</option><option value="new">Urut: Terbaru</option><option value="alpha">Urut: Judul A–Z</option><option value="est">Urut: Durasi terpendek</option></select>
   <select aria-label="Tampilan" className="inp w-auto" value={mode} onChange={e=>setMode(e.target.value as GroupMode)}><option value="list">Tampilan: Daftar</option><option value="priority">Kelompok: Prioritas</option><option value="due">Kelompok: Tenggat</option></select>
   {filtersOn&&<Button variant="ghost" onClick={()=>setF(DEFAULT_FILTERS)}>Reset Filter</Button>}</div>
  <p className="text-xs text-muted" aria-live="polite">Menampilkan {list.length} dari {tasks.length} tugas</p>
  {list.length===0?(empty.kind==='none'?<EmptyState title={empty.title} text={empty.text} action={<div className="flex flex-col items-center gap-2"><ClipboardList size={28} className="text-accent" aria-hidden/><Button onClick={openNew}>Tambah Tugas</Button></div>}/>
   :<EmptyState title={empty.title} text={empty.text} action={filtersOn?<Button variant="ghost" onClick={()=>setF(DEFAULT_FILTERS)}>Reset Filter</Button>:undefined}/>)
  :groups.map(g=><section key={g.key} aria-label={g.label||'Daftar tugas'}>{g.label&&<h2 className="mb-1 mt-3 text-sm font-semibold">{g.label} <span className="font-normal text-muted">({g.items.length})</span></h2>}
   <ul className="space-y-2">{g.items.map(t=><TaskRow key={t.id} task={t} project={projects.find(p=>p.id===t.projectId)} today={today} blockCount={bc.get(t.id)??0} onToggle={()=>toggle(t)} onOpen={()=>setDetail(t.id)} onSchedule={()=>setSched(t)} onEdit={()=>edit(t)} onDup={()=>dup(t)} onDelete={()=>setDel(t)} onStart={()=>{setTask(t.id,{status:'doing'});toast('Tugas sedang dikerjakan')}}/>)}</ul></section>)}
  <TaskForm open={formOpen} draft={draft} onClose={()=>setFormOpen(false)}/>
  <TaskDetail task={tasks.find(t=>t.id===detail)??null} onClose={()=>setDetail(null)} onEdit={edit} onSchedule={t=>{setDetail(null);setSched(t)}} onDelete={t=>{setDetail(null);setDel(t)}}/>
  <ScheduleDialog task={sched} onClose={()=>setSched(null)}/>
  <Modal open={!!del} onClose={()=>setDel(null)} title="Hapus tugas?">{del&&<div className="space-y-3"><p className="text-sm">“{del.title}” akan dihapus permanen.{(bc.get(del.id)??0)>0&&` ${bc.get(del.id)} blok jadwal terkait tetap ada dan hanya dilepas dari tugas ini.`}</p>
   <div className="flex gap-2"><Button variant="danger" onClick={()=>{delTask(del.id);toast('Tugas dihapus');setDel(null)}}>Ya, hapus</Button><Button variant="ghost" onClick={()=>setDel(null)}>Batal</Button></div></div>}</Modal></div>}
