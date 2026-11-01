import {useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {AlertCircle,CalendarClock,CheckCircle2,ClipboardList,LayoutGrid,List,ListChecks,Plus,Search,SlidersHorizontal,X} from 'lucide-react'
import {useStore} from '../stores/useStore'
import type {Task} from '../stores/useStore'
import {todayStr} from '../lib/time'
import {DEFAULT_FILTERS,Filters,GroupMode,SortKey,StatusFilter,applyFilters,emptyInfo,groupTasks,metrics,scheduleInfo,sortTasks} from '../lib/tasks'
import {PRIORITY_LABEL} from '../lib/categories'
import {Button,EmptyState,Field,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
import TaskForm,{TaskDraft} from '../components/tasks/TaskForm'
import TaskRow,{QuickField} from '../components/tasks/TaskRow'
import TaskBoard,{COLS,ColKey} from '../components/tasks/TaskBoard'
import TaskDetail from '../components/tasks/TaskDetail'
import ScheduleDialog from '../components/tasks/ScheduleDialog'
type View='list'|'board'
const VK='lanila-tasks-view' // lightweight UI preference only
const readView=():View=>{try{return localStorage.getItem(VK)==='board'?'board':'list'}catch{return 'list'}}
const STATUS_LABEL:Record<StatusFilter,string>={active:'Aktif',all:'Semua status',open:'Belum dimulai',doing:'Sedang dikerjakan',done:'Selesai',overdue:'Terlambat',today:'Jatuh tempo hari ini'}
export default function Tasks(){
 const {tasks,blocks,projects,addTask,setTask,delTask}=useStore();const toast=useToast();const today=todayStr()
 const [view,setViewState]=useState<View>(readView)
 const defStatus:StatusFilter=view==='board'?'all':'active'
 const [f,setF]=useState<Filters>(()=>({...DEFAULT_FILTERS,status:readView()==='board'?'all':'active'}))
 const [sort,setSort]=useState<SortKey>('pr');const [group,setGroup]=useState<GroupMode>('list');const [adv,setAdv]=useState(false);const [cardSel,setCardSel]=useState<StatusFilter|null>(null)
 const [quick,setQuick]=useState('');const [qerr,setQerr]=useState<string|null>(null);const lastAdd=useRef<{t:string;at:number}|null>(null);const auto=useRef(readView()==='board')
 const [draft,setDraft]=useState<TaskDraft|null>(null);const [formOpen,setFormOpen]=useState(false);const [detail,setDetail]=useState<string|null>(null);const [sched,setSched]=useState<Task|null>(null);const [del,setDel]=useState<Task|null>(null)
 const [qe,setQe]=useState<{t:Task;field:QuickField}|null>(null);const [qv,setQv]=useState('')
 const m=metrics(tasks,today),list=sortTasks(applyFilters(tasks,f,today),sort),groups=groupTasks(list,group,today),empty=emptyInfo(f,tasks.length),si=scheduleInfo(blocks,Date.now())
 const sel=<K extends keyof Filters>(k:K,v:Filters[K])=>setF(x=>({...x,[k]:v}))
 const setStatus=(s:StatusFilter)=>{auto.current=false;setCardSel(null);sel('status',s)}
 const changeView=(v:View)=>{if(v===view)return;try{localStorage.setItem(VK,v)}catch{/* ignore */}
  if(v==='board'&&f.status==='active'){sel('status','all');auto.current=true}else if(v==='list'&&auto.current&&f.status==='all'){sel('status','active');auto.current=false}
  setViewState(v)}
 const resetAll=()=>{setF({...DEFAULT_FILTERS,status:defStatus});setCardSel(null);auto.current=view==='board'}
 const pname=(id:string)=>projects.find(p=>p.id===id)?.name??'Proyek'
 const chips:{label:string;clear:()=>void}[]=[]
 if(f.status!==defStatus)chips.push({label:`Status: ${STATUS_LABEL[f.status]}`,clear:()=>setStatus(defStatus)})
 if(f.priority)chips.push({label:`Prioritas: ${PRIORITY_LABEL[f.priority]}`,clear:()=>sel('priority','')})
 if(f.due)chips.push({label:f.due==='week'?'Tenggat: 7 hari ke depan':'Tanpa tenggat',clear:()=>sel('due','')})
 if(f.project)chips.push({label:f.project==='none'?'Tanpa proyek':`Proyek: ${pname(f.project)}`,clear:()=>sel('project','')})
 if(f.dateFrom||f.dateTo)chips.push({label:`Tenggat ${f.dateFrom||'…'} – ${f.dateTo||'…'}`,clear:()=>setF(x=>({...x,dateFrom:'',dateTo:''}))})
 const advCount=(f.due?1:0)+(f.project?1:0)+(f.dateFrom||f.dateTo?1:0)
 const openNew=()=>{setDraft({});setFormOpen(true)},edit=(t:Task)=>{setDetail(null);setDraft(t);setFormOpen(true)}
 const toggle=(t:Task)=>{setTask(t.id,{status:t.status==='done'?'todo':'done'});toast(t.status==='done'?'Tugas dibuka kembali':'Tugas selesai')}
 const dup=(t:Task)=>{addTask({...t,id:crypto.randomUUID(),title:`${t.title} (salinan)`,status:'todo',createdAt:undefined});toast('Tugas diduplikasi')}
 const move=(id:string,to:ColKey)=>{const t=tasks.find(x=>x.id===id);if(!t)return;const from=t.status==='inbox'?'todo':t.status;if(from===to)return;setTask(id,{status:to});toast(`Dipindahkan ke ${COLS.find(c=>c[0]===to)![1]}`)}
 const submitQuick=(e:React.FormEvent)=>{e.preventDefault();const t=quick.trim();if(!t){setQerr('Tulis judul tugas dulu');return}
  const key=t.toLowerCase(),last=lastAdd.current;if(last&&last.t===key&&Date.now()-last.at<2000)return // ignore accidental double submit
  lastAdd.current={t:key,at:Date.now()};addTask({id:crypto.randomUUID(),title:t,status:'todo',priority:'mid',est:30});setQuick('');setQerr(null);toast('Tugas ditambahkan')}
 const openQuick=(t:Task,field:QuickField)=>{setQe({t,field});setQv(field==='priority'?t.priority:field==='due'?t.due??'':t.projectId??'')}
 const saveQuick=(e:React.FormEvent)=>{e.preventDefault();if(!qe)return
  if(qe.field==='priority')setTask(qe.t.id,{priority:qv as Task['priority']});if(qe.field==='due')setTask(qe.t.id,{due:qv||undefined});if(qe.field==='project')setTask(qe.t.id,{projectId:qv||undefined})
  toast('Tugas diperbarui');setQe(null)}
 const cards=[['active','Tugas Aktif',m.active,ListChecks,'text-accent','belum selesai'],['today','Jatuh Tempo Hari Ini',m.dueToday,CalendarClock,'text-amber-600 dark:text-amber-300','tenggat hari ini'],['overdue','Terlambat',m.overdue,AlertCircle,'text-red-600 dark:text-red-400','lewat tenggat'],['done','Selesai',m.done,CheckCircle2,'text-emerald-600 dark:text-emerald-400','total selesai']] as const
 const clickCard=(k:StatusFilter)=>{if(cardSel===k&&f.status===k){setStatus(defStatus)}else{auto.current=false;setCardSel(k);sel('status',k)}}
 const emptyAction=empty.kind==='none'?<div className="flex flex-col items-center gap-2"><ClipboardList size={28} className="text-accent" aria-hidden/><Button onClick={openNew}>Tambah Tugas</Button></div>
  :empty.kind==='search'?<Button variant="ghost" onClick={()=>sel('q','')}>Hapus Pencarian</Button>
  :empty.kind==='filter'?<Button variant="ghost" onClick={resetAll}>Reset Filter</Button>
  :f.status==='done'?<Button variant="ghost" onClick={()=>setStatus(defStatus)}>Lihat Tugas Aktif</Button>:<Button variant="ghost" onClick={openNew}>Tambah Tugas</Button>
 return <div className="mx-auto max-w-5xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Tugas</h1><p className="text-sm text-muted">Kelola prioritas dan ubah rencana menjadi tindakan.</p></div>
   <Button className="inline-flex items-center gap-1" onClick={openNew}><Plus size={16}/>Tambah Tugas</Button></div>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([k,l,v,I,tone,s])=>{const on=cardSel===k&&f.status===k
   return <button key={k} type="button" aria-pressed={on} onClick={()=>clickCard(k)} className={`card flex items-start gap-3 !p-4 text-left transition-colors hover:bg-elevated focus-visible:outline focus-visible:outline-2 ${on?'ring-2 ring-accent':''}`}>
    <span className={`mt-0.5 rounded-lg bg-elevated p-2 ${tone}`}><I size={18} aria-hidden/></span><span className="min-w-0"><span className="block truncate text-xs text-muted">{l}</span><span className="block text-xl font-semibold">{v}</span><span className="block text-xs text-muted">{s}</span></span></button>})}</div>
  <form onSubmit={submitQuick} noValidate><div className="flex gap-2"><input aria-label="Tambah cepat" aria-invalid={!!qerr} placeholder="Tambah cepat: ketik judul lalu Enter" className="inp" value={quick} onChange={e=>{setQuick(e.target.value);setQerr(null)}}/><Button variant="ghost" className="shrink-0">Tambah</Button></div>{qerr&&<p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{qerr}</p>}</form>
  <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Pencarian dan filter">
   <div className="relative w-full min-w-[12rem] sm:w-auto sm:flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input aria-label="Cari tugas" placeholder="Cari tugas" className="inp pl-8" value={f.q} onChange={e=>sel('q',e.target.value)}/></div>
   <select aria-label="Filter status" className="inp w-auto" value={f.status} onChange={e=>setStatus(e.target.value as StatusFilter)}>{(Object.keys(STATUS_LABEL) as StatusFilter[]).map(k=><option key={k} value={k}>{k==='active'?'Status: Aktif':STATUS_LABEL[k]}</option>)}</select>
   <select aria-label="Filter prioritas" className="inp w-auto" value={f.priority} onChange={e=>sel('priority',e.target.value as Filters['priority'])}><option value="">Semua prioritas</option><option value="high">Tinggi</option><option value="mid">Sedang</option><option value="low">Rendah</option></select>
   <Button variant={adv?'primary':'ghost'} aria-expanded={adv} aria-controls="adv-filters" className="inline-flex items-center gap-1" onClick={()=>setAdv(!adv)}><SlidersHorizontal size={14}/>Filter{advCount>0&&<span className="rounded-full bg-brand-violet px-1.5 text-xs text-white">{advCount}</span>}</Button>
   <select aria-label="Urutkan" className="inp w-auto" value={sort} onChange={e=>setSort(e.target.value as SortKey)}><option value="pr">Urut: Prioritas</option><option value="due">Urut: Tenggat</option><option value="new">Urut: Terbaru</option><option value="alpha">Urut: Judul A–Z</option><option value="est">Urut: Durasi terpendek</option></select>
   <div role="group" aria-label="Tampilan tugas" className="inline-flex rounded-xl border border-line bg-bg p-0.5">{([['list','Daftar',List],['board','Papan',LayoutGrid]] as const).map(([v,l,I])=><button key={v} type="button" aria-pressed={view===v} onClick={()=>changeView(v)} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 ${view===v?'bg-surface font-semibold text-accent shadow-sm':'text-muted hover:text-ink'}`}><I size={14}/>{l}</button>)}</div></div>
  {adv&&<div id="adv-filters" className="card grid gap-3 !p-4 sm:grid-cols-2 lg:grid-cols-4">
   <Field label="Tenggat" id="af-due"><select id="af-due" className="inp" value={f.due} onChange={e=>sel('due',e.target.value as Filters['due'])}><option value="">Semua tenggat</option><option value="week">7 hari ke depan</option><option value="none">Tanpa tenggat</option></select></Field>
   <div><Field label="Proyek" id="af-pj"><select id="af-pj" className="inp" value={f.project} onChange={e=>sel('project',e.target.value)}><option value="">Semua proyek</option><option value="none">Tanpa proyek</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}{p.status==='archived'?' (arsip)':''}</option>)}</select></Field>{projects.length===0&&<p className="mt-1 text-xs text-muted">Belum ada proyek. <Link to="/proyek" className="underline">Buat proyek</Link></p>}</div>
   <Field label="Tenggat dari" id="af-from"><input id="af-from" type="date" className="inp" value={f.dateFrom} max={f.dateTo||undefined} onChange={e=>sel('dateFrom',e.target.value)}/></Field>
   <Field label="Tenggat sampai" id="af-to"><input id="af-to" type="date" className="inp" value={f.dateTo} min={f.dateFrom||undefined} onChange={e=>sel('dateTo',e.target.value)}/></Field>
   {view==='list'&&<Field label="Kelompokkan daftar" id="af-gr"><select id="af-gr" className="inp" value={group} onChange={e=>setGroup(e.target.value as GroupMode)}><option value="list">Tanpa kelompok</option><option value="priority">Prioritas</option><option value="due">Tenggat</option></select></Field>}
   <div className="flex items-end"><Button variant="ghost" onClick={resetAll}>Reset Filter</Button></div></div>}
  {(chips.length>0||f.q)&&<div className="flex flex-wrap items-center gap-2" aria-label="Filter aktif">{chips.map(c=><span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-brand-violet/10 px-2 py-1 text-xs text-accent">{c.label}<button type="button" aria-label={`Hapus filter ${c.label}`} onClick={c.clear} className="rounded-full hover:bg-brand-violet/20 focus-visible:outline focus-visible:outline-2"><X size={12}/></button></span>)}
   <button type="button" className="text-xs text-accent underline" onClick={resetAll}>Reset Filter</button></div>}
  <p className="text-xs text-muted" aria-live="polite">Menampilkan {list.length} dari {tasks.length} tugas</p>
  {list.length===0?<EmptyState title={empty.title} text={empty.text} action={emptyAction}/>
  :view==='board'?<TaskBoard tasks={list} today={today} projects={projects} sched={si} onMove={move} onOpen={t=>setDetail(t.id)} onSchedule={setSched}/>
  :groups.map(g=><section key={g.key} aria-label={g.label||'Daftar tugas'}>{g.label&&<h2 className="mb-1 mt-3 text-sm font-semibold">{g.label} <span className="font-normal text-muted">({g.items.length})</span></h2>}
   <ul className="space-y-2">{g.items.map(t=><TaskRow key={t.id} task={t} project={projects.find(p=>p.id===t.projectId)} sched={si.get(t.id)} today={today} onToggle={()=>toggle(t)} onOpen={()=>setDetail(t.id)} onSchedule={()=>setSched(t)} onEdit={()=>edit(t)} onDup={()=>dup(t)} onDelete={()=>setDel(t)} onStatus={s=>{setTask(t.id,{status:s});toast(s==='doing'?'Tugas sedang dikerjakan':'Dikembalikan ke Belum dimulai')}} onQuick={fl=>openQuick(t,fl)}/>)}</ul></section>)}
  <TaskForm open={formOpen} draft={draft} onClose={()=>setFormOpen(false)}/>
  <TaskDetail task={tasks.find(t=>t.id===detail)??null} onClose={()=>setDetail(null)} onEdit={edit} onSchedule={t=>{setDetail(null);setSched(t)}} onDelete={t=>{setDetail(null);setDel(t)}}/>
  <ScheduleDialog task={sched} onClose={()=>setSched(null)}/>
  <Modal open={!!qe} onClose={()=>setQe(null)} title={qe?.field==='priority'?'Ubah prioritas':qe?.field==='due'?'Ubah tenggat':'Ubah proyek'}>{qe&&<form onSubmit={saveQuick} className="space-y-3"><p className="truncate text-sm font-medium">{qe.t.title}</p>
   {qe.field==='priority'&&<Field label="Prioritas" id="qe-v"><select id="qe-v" className="inp" value={qv} onChange={e=>setQv(e.target.value)}>{(['low','mid','high'] as const).map(p=><option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</select></Field>}
   {qe.field==='due'&&<Field label="Tenggat (kosongkan untuk menghapus)" id="qe-v"><input id="qe-v" type="date" className="inp" value={qv} onChange={e=>setQv(e.target.value)}/></Field>}
   {qe.field==='project'&&<div><Field label="Proyek" id="qe-v"><select id="qe-v" className="inp" value={qv} onChange={e=>setQv(e.target.value)}><option value="">Tanpa proyek</option>{projects.filter(p=>p.status==='active'||p.id===qe.t.projectId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>{projects.length===0&&<p className="mt-1 text-xs text-muted">Belum ada proyek. <Link to="/proyek" className="underline">Buat proyek</Link></p>}</div>}
   <div className="flex gap-2"><Button>Simpan</Button><Button type="button" variant="ghost" onClick={()=>setQe(null)}>Batal</Button></div></form>}</Modal>
  <Modal open={!!del} onClose={()=>setDel(null)} title="Hapus tugas?">{del&&<div className="space-y-3"><p className="text-sm">“{del.title}” akan dihapus permanen.{blocks.some(b=>b.taskId===del.id)&&' Blok jadwal terkait tetap ada dan hanya dilepas dari tugas ini.'}</p>
   <div className="flex gap-2"><Button variant="danger" onClick={()=>{delTask(del.id);toast('Tugas dihapus');setDel(null)}}>Ya, hapus</Button><Button variant="ghost" onClick={()=>setDel(null)}>Batal</Button></div></div>}</Modal></div>}
