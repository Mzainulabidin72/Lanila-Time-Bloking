import {FormEvent,useEffect,useRef,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {Archive,ArchiveRestore,ArrowLeft,CalendarDays,Check,Ellipsis,FolderKanban,ListTodo,Plus,Search,Trash2} from 'lucide-react'
import {useStore} from '../stores/useStore'
import {Project,ProjectFilter,PROJECT_COLORS,STATE_LABEL,projectMatchesFilter,projectState,projectStats,blockProjectId} from '../lib/projects'
import {todayStr} from '../lib/time'
import {fmtDur} from '../lib/schedule'
import {fmtSec} from '../lib/focusTimer'
import {STATUS_LABEL} from '../lib/tasks'
import {Badge,Button,EmptyState,Field,Modal} from '../components/ui'
import {useToast} from '../components/Toast'

const TONE={active:'violet',done:'green',late:'red',archived:'slate'} as const
const FILTERS:readonly {id:ProjectFilter;label:string}[]=[
 {id:'all',label:'Semua'},{id:'active',label:'Aktif'},{id:'done',label:'Selesai'},{id:'archived',label:'Diarsipkan'}]
const dateLabel=(value?:number)=>value?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium'}).format(new Date(value)):'—'
const validDate=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [year,month,day]=value.split('-').map(Number),d=new Date(year,month-1,day);return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===day}

function ProjectForm({open,project,onClose}:{open:boolean;project:Project|null;onClose:()=>void}){
 const {addProject,updateProject}=useStore();const toast=useToast()
 const [name,setName]=useState(''),[description,setDescription]=useState(''),[color,setColor]=useState(PROJECT_COLORS[0]),[deadline,setDeadline]=useState(''),[status,setStatus]=useState<Project['status']>('active')
 const [touched,setTouched]=useState(false),[busy,setBusy]=useState(false);const saving=useRef(false)
 useEffect(()=>{if(!open)return;setName(project?.name??'');setDescription(project?.description??'');setColor(project?.color??PROJECT_COLORS[0]);setDeadline(project?.deadline??'');setStatus(project?.status??'active');setTouched(false);setBusy(false);saving.current=false},[open,project])
 const nameError=name.trim()?'':'Nama proyek wajib diisi'
 const deadlineError=deadline&&!validDate(deadline)?'Tanggal tidak valid':null
 const submit=async(e:FormEvent)=>{e.preventDefault();setTouched(true);if(nameError||deadlineError||saving.current)return
  saving.current=true;setBusy(true)
  await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))
  try{
   const values={name:name.trim(),description:description.trim()||undefined,color,status,deadline:deadline||undefined}
   if(project){updateProject({...project,...values});toast('Proyek diperbarui')}
   else{addProject({id:crypto.randomUUID(),...values});toast('Proyek dibuat')}
   onClose()
  }catch{toast('Gagal menyimpan proyek. Coba lagi.','err');saving.current=false;setBusy(false)}
 }
 return <Modal open={open} onClose={onClose} title={project?'Ubah proyek':'Proyek baru'}>{open&&<form onSubmit={submit} className="space-y-4" noValidate>
  <Field label="Nama proyek" id="project-name" error={touched?nameError:null}><input id="project-name" autoFocus maxLength={100} className="inp" value={name} onChange={e=>setName(e.target.value)} aria-invalid={touched&&!!nameError}/></Field>
  <Field label="Deskripsi (opsional)" id="project-description"><textarea id="project-description" rows={3} maxLength={500} className="inp" value={description} onChange={e=>setDescription(e.target.value)}/></Field>
  <div className="grid gap-3 sm:grid-cols-2">
   <Field label="Tenggat (opsional)" id="project-deadline" error={touched?deadlineError:null}><input id="project-deadline" type="date" className="inp" value={deadline} onChange={e=>setDeadline(e.target.value)} aria-invalid={touched&&!!deadlineError}/></Field>
   <Field label="Status" id="project-status"><select id="project-status" className="inp" value={status} onChange={e=>setStatus(e.target.value as Project['status'])}><option value="active">Aktif</option><option value="archived">Diarsipkan</option></select></Field>
  </div>
  <div role="group" aria-label="Warna proyek"><p className="mb-2 text-sm font-medium">Warna proyek</p><div className="flex flex-wrap gap-3">{PROJECT_COLORS.map(c=><button key={c} type="button" aria-label={`Pilih warna ${c}`} aria-pressed={color===c} onClick={()=>setColor(c)} className={`h-8 w-8 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${color===c?'ring-2 ring-ink ring-offset-2 ring-offset-surface':''}`} style={{background:c}}/>)}</div></div>
  <div className="flex flex-wrap gap-2 pt-1"><Button disabled={busy} className="inline-flex items-center gap-2">{busy?'Menyimpan…':project?'Simpan perubahan':'Simpan proyek'}</Button><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Batal</Button></div>
 </form>}</Modal>
}

function DeleteProjectDialog({project,onClose,onConfirm,busy}:{project:Project|null;onClose:()=>void;onConfirm:()=>void;busy:boolean}){
 return <Modal open={!!project} onClose={onClose} title="Hapus proyek?">{project&&<div className="space-y-4">
  <p className="text-sm text-muted">Proyek “{project.name}” akan dihapus. Tugas dan blok waktu tetap ada, tetapi tidak lagi terhubung ke proyek ini.</p>
  <div className="flex gap-2"><Button variant="danger" disabled={busy} onClick={onConfirm}>{busy?'Menghapus…':'Hapus proyek'}</Button><Button variant="ghost" disabled={busy} onClick={onClose}>Batal</Button></div>
 </div>}</Modal>
}

export default function Projects(){
 const {projectId}=useParams();const {projects,tasks,blocks,focus,updateProject,setTask,delProject}=useStore();const toast=useToast();const today=todayStr()
 const [filter,setFilter]=useState<ProjectFilter>('all'),[query,setQuery]=useState('')
 const [form,setForm]=useState<{open:boolean;project:Project|null}>({open:false,project:null}),[toDelete,setToDelete]=useState<Project|null>(null),[deleteBusy,setDeleteBusy]=useState(false)
 const [attach,setAttach]=useState('')
 const selected=projects.find(p=>p.id===projectId)
 const statsFor=(p:Project)=>projectStats(p,tasks,blocks,focus.sessions)
 const projectStateFor=(p:Project)=>projectState(p,statsFor(p),today)
 const counts=FILTERS.reduce((result,item)=>({...result,[item.id]:projects.filter(p=>projectMatchesFilter(projectStateFor(p),item.id)).length}),{} as Record<ProjectFilter,number>)
 const filtered=projects.filter(p=>projectMatchesFilter(projectStateFor(p),filter)&&(!query.trim()||`${p.name} ${p.description??''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))
 const free=tasks.filter(t=>!t.projectId&&t.status!=='done')
 const projectBlocks=selected?blocks.filter(b=>blockProjectId(b,tasks)===selected.id).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)):[]
 const selectedStats=selected?statsFor(selected):null
 const openForm=(project:Project|null=null)=>setForm({open:true,project})
 const toggleArchive=(project:Project)=>{const archived=project.status!=='archived';updateProject({...project,status:archived?'archived':'active'});toast(archived?'Proyek diarsipkan. Tugas dan blok tetap tersimpan.':'Proyek diaktifkan kembali.')}
 const confirmDelete=()=>{if(!toDelete)return;setDeleteBusy(true);delProject(toDelete.id);setDeleteBusy(false);setToDelete(null);toast('Proyek dihapus. Tugas dan blok tetap tersimpan.')}
 if(projectId&&!selected)return <div className="mx-auto max-w-5xl space-y-4"><Link to="/proyek" className="inline-flex items-center gap-2 text-sm text-accent hover:underline"><ArrowLeft size={16}/>Semua proyek</Link><EmptyState title="Proyek tidak ditemukan" text="Proyek ini mungkin telah dihapus atau tidak tersedia." /></div>

 if(selected&&selectedStats)return <div className="mx-auto max-w-5xl space-y-5">
  <Link to="/proyek" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft size={16}/>Semua proyek</Link>
  <header className="flex flex-wrap items-start justify-between gap-4">
   <div className="flex min-w-0 items-start gap-3"><span className="mt-1 h-5 w-5 shrink-0 rounded-lg" style={{background:selected.color}} aria-hidden/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{selected.name}</h1><Badge tone={TONE[projectStateFor(selected)]}>{STATE_LABEL[projectStateFor(selected)]}</Badge></div><p className="mt-1 text-sm text-muted">{selected.description||'Ringkasan tugas dan waktu untuk proyek ini.'}</p></div></div>
   <div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={()=>openForm(selected)}>Ubah proyek</Button><Button variant="ghost" onClick={()=>toggleArchive(selected)}>{selected.status==='archived'?'Aktifkan':'Arsipkan'}</Button></div>
  </header>
  <section className="grid gap-3 sm:grid-cols-3">
   <div className="card !p-4"><p className="text-xs text-muted">Tugas selesai</p><p className="mt-1 text-xl font-semibold">{selectedStats.done} / {selectedStats.total}</p><p className="text-xs text-muted">{selectedStats.pct===null?'Belum ada tugas':`${selectedStats.pct}% progres`}</p></div>
   <div className="card !p-4"><p className="text-xs text-muted">Waktu terjadwal</p><p className="mt-1 text-xl font-semibold">{fmtDur(selectedStats.scheduledMin)}</p><p className="text-xs text-muted">{projectBlocks.length} blok waktu</p></div>
   <div className="card !p-4"><p className="text-xs text-muted">Tenggat</p><p className="mt-1 text-xl font-semibold">{selected.deadline??'Belum ditentukan'}</p><p className="text-xs text-muted">Fokus aktual {fmtSec(selectedStats.focusSec)}</p></div>
  </section>
  <div className="grid gap-5 lg:grid-cols-2">
   <section className="card !p-4 sm:!p-5">
    <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><ListTodo size={18} className="text-accent"/>Tugas <span className="text-sm font-normal text-muted">({selectedStats.total})</span></h2><Link to="/tugas" className="text-xs text-accent hover:underline">Kelola tugas</Link></div>
    {!selectedStats.total?<p className="rounded-xl border border-dashed border-strong p-4 text-center text-sm text-muted">Belum ada tugas terkait proyek ini.</p>:<ul className="space-y-2">{selectedStats.tasks.map(task=><li key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-elevated/60 p-3"><span className={`min-w-0 truncate text-sm ${task.status==='done'?'line-through text-muted':''}`}>{task.title}</span><span className="flex shrink-0 items-center gap-2 text-xs text-muted">{STATUS_LABEL[task.status]}<button type="button" onClick={()=>setTask(task.id,{projectId:undefined})} className="rounded-lg px-2 py-1 text-accent hover:bg-brand-violet/10 focus-visible:outline focus-visible:outline-2">Lepas</button></span></li>)}</ul>}
    {selected.status==='active'&&<div className="mt-3 flex flex-wrap gap-2"><label className="sr-only" htmlFor="project-attach">Tambahkan tugas ke proyek</label><select id="project-attach" className="inp min-w-0 flex-1" value={attach} onChange={e=>setAttach(e.target.value)}><option value="">Pilih tugas untuk ditambahkan…</option>{free.map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</select><Button disabled={!attach} onClick={()=>{setTask(attach,{projectId:selected.id});setAttach('');toast('Tugas ditambahkan ke proyek')}}>Tambah tugas</Button></div>}
   </section>
   <section className="card !p-4 sm:!p-5">
    <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-semibold"><CalendarDays size={18} className="text-accent"/>Blok waktu <span className="text-sm font-normal text-muted">({projectBlocks.length})</span></h2><Link to="/jadwal" className="text-xs text-accent hover:underline">Buka jadwal</Link></div>
    {!projectBlocks.length?<p className="rounded-xl border border-dashed border-strong p-4 text-center text-sm text-muted">Belum ada blok waktu. Blok proyek dan tugas terkait akan tampil di sini.</p>:<ul className="max-h-80 space-y-2 overflow-y-auto">{projectBlocks.map(block=><li key={block.id} className="flex items-center justify-between gap-3 rounded-xl bg-elevated/60 p-3"><span className="min-w-0 truncate text-sm">{block.title}</span><span className="shrink-0 text-right text-xs text-muted">{block.date}<br/>{block.start}–{block.end}{block.done&&<span className="ml-1 text-emerald-600 dark:text-emerald-300">· Selesai</span>}</span></li>)}</ul>}
   </section>
  </div>
  <p className="text-xs text-muted">Dibuat {dateLabel(selected.createdAt)} · Aktivitas terakhir {dateLabel(selected.updatedAt??selected.createdAt)} · Fokus aktual {fmtSec(selectedStats.focusSec)}</p>
  <ProjectForm open={form.open} project={form.project} onClose={()=>setForm({open:false,project:null})}/>
  <DeleteProjectDialog project={toDelete} onClose={()=>setToDelete(null)} onConfirm={confirmDelete} busy={deleteBusy}/>
 </div>

 return <div className="mx-auto max-w-6xl space-y-5">
  <header className="flex flex-wrap items-end justify-between gap-4">
   <div><h1 className="text-2xl font-bold">Proyek</h1><p className="mt-1 text-sm text-muted">Kelompokkan tugas dan blok waktu berdasarkan tujuan.</p><p className="mt-3 text-xs text-muted" aria-live="polite">{projects.length} proyek total</p></div>
   <Button className="inline-flex min-h-11 items-center gap-2" onClick={()=>openForm()}><Plus size={17}/>Proyek Baru</Button>
  </header>
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div className="grid w-full grid-cols-2 gap-1 rounded-xl border border-line bg-elevated/60 p-1 sm:flex sm:w-auto" role="group" aria-label="Filter proyek">{FILTERS.map(item=><button key={item.id} type="button" aria-pressed={filter===item.id} onClick={()=>setFilter(item.id)} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 sm:shrink-0 ${filter===item.id?'bg-surface font-medium text-accent shadow-sm':'text-muted hover:text-ink'}`}>{item.label}<span className={`rounded-full px-1.5 py-0.5 text-xs ${filter===item.id?'bg-brand-violet/10 text-accent':'bg-elevated text-muted'}`}>{counts[item.id]}</span></button>)}</div>
   <label className="relative min-w-[12rem] flex-1 sm:max-w-xs"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><span className="sr-only">Cari proyek</span><input type="search" className="inp min-h-10 pl-9" placeholder="Cari proyek…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  </div>
  {filtered.length===0?
   projects.length===0&&!query.trim()&&filter==='all'?
    <section className="rounded-2xl border border-dashed border-strong bg-elevated/30 px-5 py-9 text-center sm:px-10">
     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-violet/10 text-accent"><FolderKanban size={30} aria-hidden/></div>
     <h2 className="text-lg font-semibold">Belum ada proyek</h2>
     <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">Mulai buat proyek pertamamu untuk mengelompokkan tugas, mengatur prioritas, dan merencanakan waktu dengan lebih terstruktur.</p>
     <Button className="mt-5 inline-flex min-h-11 items-center gap-2" onClick={()=>openForm()}><Plus size={16}/>Buat Proyek Pertama</Button>
     <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-2 text-xs text-muted"><Check size={14} className="shrink-0 text-accent"/>Pantau progres tugas dan jadwal proyek di satu tempat.</p>
    </section>
   :<EmptyState title={query.trim()?'Proyek tidak ditemukan':filter==='done'?'Belum ada proyek selesai':filter==='archived'?'Belum ada proyek diarsipkan':'Belum ada proyek aktif'} text={query.trim()?'Coba kata kunci lain atau hapus pencarian.':filter==='active'?'Proyek selesai dan diarsipkan tersedia di filter lainnya.':'Proyek akan muncul di sini saat memenuhi filter ini.'} action={query.trim()?<Button variant="ghost" onClick={()=>setQuery('')}>Hapus pencarian</Button>:undefined}/>
   :<ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(project=>{
    const stats=statsFor(project),state=projectStateFor(project),latest=project.updatedAt??project.createdAt
    return <li key={project.id} className="card flex min-h-64 flex-col !p-4 transition duration-200 hover:-translate-y-0.5 hover:border-strong hover:shadow-md sm:!p-5">
     <div className="flex items-start justify-between gap-3">
      <Link to={`/proyek/${project.id}`} className="group flex min-w-0 items-start gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><span className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full" style={{background:project.color}} aria-hidden/><span className="min-w-0"><span className="block truncate font-semibold group-hover:text-accent">{project.name}</span><span className="mt-1 block line-clamp-2 min-h-10 text-sm text-muted">{project.description||'Belum ada deskripsi proyek.'}</span></span></Link>
      <div className="flex shrink-0 items-center gap-1"><Badge tone={TONE[state]}>{STATE_LABEL[state]}</Badge><details className="relative"><summary aria-label={`Menu ${project.name}`} className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><Ellipsis size={18}/></summary><div className="absolute right-0 z-10 mt-1 min-w-40 rounded-xl border border-line bg-surface p-1 shadow-lg">
       <Link to={`/proyek/${project.id}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-elevated">Buka proyek</Link>
       <button type="button" onClick={()=>openForm(project)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated">Ubah</button>
       <button type="button" onClick={()=>toggleArchive(project)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated">{project.status==='archived'?'Aktifkan':'Arsipkan'}</button>
       <button type="button" onClick={()=>setToDelete(project)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"><Trash2 size={14}/>Hapus</button>
      </div></details></div>
     </div>
     <div className="mt-4">
      <div className="flex items-center justify-between text-xs"><span className="font-medium">{stats.total?`${stats.done} dari ${stats.total} tugas selesai`:'Belum ada tugas'}</span><span className="text-muted">{stats.pct===null?'—':`${stats.pct}%`}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={`Progres ${project.name}`} aria-valuenow={stats.pct??0} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full transition-[width]" style={{width:`${stats.pct??0}%`,background:project.color}}/></div>
     </div>
     <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted"><span className="inline-flex items-center gap-1.5"><ListTodo size={14}/>{stats.total} {stats.total===1?'tugas':'tugas'}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{project.deadline?`Tenggat ${project.deadline}`:'Tanpa tenggat'}</span></div>
     <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted"><span>Aktivitas {dateLabel(latest)}</span><div className="flex items-center gap-1"><Link to={`/proyek/${project.id}`} className="rounded-lg px-3 py-2 font-medium text-accent hover:bg-brand-violet/10">Buka</Link><button type="button" aria-label={project.status==='archived'?`Aktifkan ${project.name}`:`Arsipkan ${project.name}`} title={project.status==='archived'?'Aktifkan':'Arsipkan'} onClick={()=>toggleArchive(project)} className="rounded-lg p-2 hover:bg-elevated focus-visible:outline focus-visible:outline-2"><span className="sr-only">{project.status==='archived'?'Aktifkan':'Arsipkan'}</span>{project.status==='archived'?<ArchiveRestore size={15}/>:<Archive size={15}/>}</button></div></div>
    </li>
   })}</ul>}
  <ProjectForm open={form.open} project={form.project} onClose={()=>setForm({open:false,project:null})}/>
  <DeleteProjectDialog project={toDelete} onClose={()=>setToDelete(null)} onConfirm={confirmDelete} busy={deleteBusy}/>
 </div>
}
