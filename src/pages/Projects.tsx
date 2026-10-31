import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Archive,ArchiveRestore,FolderKanban,Pencil,Plus} from 'lucide-react'
import {useStore} from '../stores/useStore'
import {Project,PROJECT_COLORS,STATE_LABEL,projectState,projectStats} from '../lib/projects'
import {todayStr} from '../lib/time'
import {fmtDur} from '../lib/schedule'
import {fmtSec} from '../lib/focusTimer'
import {PRIORITY_LABEL} from '../lib/categories'
import {STATUS_LABEL} from '../lib/tasks'
import {Badge,Button,EmptyState,Field,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
const TONE={active:'violet',done:'green',late:'red',archived:'slate'} as const
function ProjectForm({open,project,onClose}:{open:boolean;project:Project|null;onClose:()=>void}){
 const {addProject,updateProject}=useStore();const toast=useToast()
 const [name,setName]=useState('');const [desc,setDesc]=useState('');const [color,setColor]=useState(PROJECT_COLORS[0]);const [deadline,setDeadline]=useState('');const [touched,setTouched]=useState(false);const [key,setKey]=useState<string|null>(null)
 const k=open?(project?.id??'new'):null
 if(k!==key){setKey(k);if(open){setName(project?.name??'');setDesc(project?.description??'');setColor(project?.color??PROJECT_COLORS[0]);setDeadline(project?.deadline??'');setTouched(false)}}
 const nameErr=!name.trim()?'Nama proyek wajib diisi':null,dErr=deadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(deadline)||Number.isNaN(Date.parse(deadline)))?'Tanggal tidak valid':null
 const submit=(e:React.FormEvent)=>{e.preventDefault();setTouched(true);if(nameErr||dErr)return
  const base={name:name.trim(),description:desc.trim()||undefined,color,deadline:deadline||undefined}
  if(project){updateProject({...project,...base});toast('Proyek diperbarui')}else{addProject({id:crypto.randomUUID(),status:'active',...base});toast('Proyek dibuat')};onClose()}
 return <Modal open={open} onClose={onClose} title={project?'Ubah proyek':'Proyek baru'}>{open&&<form onSubmit={submit} className="space-y-3" noValidate>
  <Field label="Nama proyek" id="p-name" error={touched?nameErr:null}><input id="p-name" autoFocus className="inp" value={name} onChange={e=>setName(e.target.value)} aria-invalid={touched&&!!nameErr}/></Field>
  <Field label="Deskripsi (opsional)" id="p-desc"><textarea id="p-desc" rows={2} className="inp" value={desc} onChange={e=>setDesc(e.target.value)}/></Field>
  <Field label="Tenggat (opsional)" id="p-dl" error={dErr}><input id="p-dl" type="date" className="inp" value={deadline} onChange={e=>setDeadline(e.target.value)}/></Field>
  <div role="group" aria-label="Warna proyek"><p className="mb-1 text-sm font-medium">Warna</p><div className="flex flex-wrap gap-2">{PROJECT_COLORS.map(c=><button key={c} type="button" aria-label={`Warna ${c}`} aria-pressed={color===c} onClick={()=>setColor(c)} className={`h-7 w-7 rounded-full focus-visible:outline focus-visible:outline-2 ${color===c?'ring-2 ring-ink ring-offset-2 ring-offset-surface':''}`} style={{background:c}}/>)}</div></div>
  <div className="flex gap-2"><Button>{project?'Simpan perubahan':'Buat proyek'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>}</Modal>}
export default function Projects(){
 const {projects,tasks,blocks,focus,updateProject,setTask}=useStore();const toast=useToast();const today=todayStr()
 const [view,setView]=useState<'active'|'archived'|'all'>('active');const [form,setForm]=useState<{open:boolean;p:Project|null}>({open:false,p:null});const [detail,setDetail]=useState<string|null>(null);const [attach,setAttach]=useState('')
 const list=projects.filter(p=>view==='all'||(view==='archived')===(p.status==='archived')),dp=projects.find(p=>p.id===detail)
 const dst=dp?projectStats(dp,tasks,blocks,focus.sessions):null,free=tasks.filter(t=>!t.projectId&&t.status!=='done')
 return <div className="mx-auto max-w-5xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Proyek</h1><p className="text-sm text-muted">Kelompokkan tugas dan blok waktu berdasarkan tujuan.</p></div>
   <Button className="inline-flex items-center gap-1" onClick={()=>setForm({open:true,p:null})}><Plus size={16}/>Proyek Baru</Button></div>
  <div className="flex items-center gap-2 text-sm"><label htmlFor="pv" className="text-muted">Tampilkan</label><select id="pv" className="inp w-auto" value={view} onChange={e=>setView(e.target.value as typeof view)}><option value="active">Aktif</option><option value="archived">Diarsipkan</option><option value="all">Semua</option></select><span className="text-xs text-muted" aria-live="polite">{list.length} proyek</span></div>
  {list.length===0?<EmptyState title={projects.length===0?'Belum ada proyek':view==='archived'?'Tidak ada proyek yang diarsipkan':'Tidak ada proyek aktif'} text={projects.length===0?'Buat proyek untuk mengelompokkan tugas dan blok waktumu.':undefined} action={projects.length===0?<div className="flex flex-col items-center gap-2"><FolderKanban size={28} className="text-accent" aria-hidden/><Button onClick={()=>setForm({open:true,p:null})}>Buat Proyek</Button></div>:undefined}/>
  :<ul className="grid gap-3 md:grid-cols-2">{list.map(p=>{const st=projectStats(p,tasks,blocks,focus.sessions),state=projectState(p,st,today)
   return <li key={p.id} className="card space-y-3 !p-4"><div className="flex items-start justify-between gap-2"><button type="button" onClick={()=>setDetail(p.id)} className="flex min-w-0 items-center gap-2 text-left font-semibold hover:underline focus-visible:outline focus-visible:outline-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{background:p.color}} aria-hidden/><span className="truncate">{p.name}</span></button><Badge tone={TONE[state]}>{STATE_LABEL[state]}</Badge></div>
    <div><div className="h-2 rounded-full bg-line" role="progressbar" aria-label={`Progres ${p.name}`} aria-valuenow={st.pct??0} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full" style={{width:`${st.pct??0}%`,background:p.color}}/></div>
     <p className="mt-1 text-xs text-muted">{st.pct===null?'Belum ada tugas di proyek ini':`${st.done} dari ${st.total} tugas selesai (${st.pct}%)`}</p></div>
    <p className="text-xs text-muted">Tenggat: {p.deadline??'tidak ada'}{state==='late'&&' · terlewat'} · Terjadwal {fmtDur(st.scheduledMin)} · Fokus aktual {fmtSec(st.focusSec)}</p>
    <div className="flex flex-wrap gap-2"><Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={()=>setDetail(p.id)}>Detail</Button><Button variant="ghost" className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs" onClick={()=>setForm({open:true,p})}><Pencil size={12}/>Ubah</Button>
     <Button variant="ghost" className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs" onClick={()=>{updateProject({...p,status:p.status==='archived'?'active':'archived'});toast(p.status==='archived'?'Proyek diaktifkan kembali':'Proyek diarsipkan. Tugas dan blok tetap tersimpan.')}}>{p.status==='archived'?<ArchiveRestore size={12}/>:<Archive size={12}/>}{p.status==='archived'?'Aktifkan':'Arsipkan'}</Button></div></li>})}</ul>}
  <ProjectForm open={form.open} project={form.p} onClose={()=>setForm({open:false,p:null})}/>
  <Modal open={!!dp} onClose={()=>setDetail(null)} title={dp?.name??'Detail proyek'}>{dp&&dst&&<div className="space-y-3">
   {dp.description&&<p className="whitespace-pre-wrap text-sm">{dp.description}</p>}
   <p className="text-xs text-muted">Tenggat: {dp.deadline??'tidak ada'} · Terjadwal {fmtDur(dst.scheduledMin)} (blok proyek ini) · Fokus aktual {fmtSec(dst.focusSec)} (sesi dari tugas proyek ini)</p>
   <div><h3 className="text-sm font-semibold">Tugas ({dst.total})</h3>{dst.total===0?<p className="text-xs text-muted">Belum ada tugas. Tambahkan dari daftar di bawah, atau pilih proyek ini saat membuat tugas di halaman <Link to="/tugas" className="underline">Tugas</Link>.</p>
    :<ul className="mt-1 space-y-1">{dst.tasks.map(t=><li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-elevated px-2 py-1 text-sm"><span className={`truncate ${t.status==='done'?'line-through opacity-60':''}`}>{t.title}</span><span className="flex shrink-0 items-center gap-2 text-xs text-muted">{STATUS_LABEL[t.status]} · {PRIORITY_LABEL[t.priority]}<button type="button" className="text-accent underline" onClick={()=>setTask(t.id,{projectId:undefined})}>Lepas</button></span></li>)}</ul>}</div>
   {dp.status==='active'&&free.length>0&&<div className="flex gap-2"><label className="sr-only" htmlFor="att">Tambahkan tugas</label><select id="att" className="inp" value={attach} onChange={e=>setAttach(e.target.value)}><option value="">Tambahkan tugas ke proyek…</option>{free.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select><Button disabled={!attach} onClick={()=>{setTask(attach,{projectId:dp.id});setAttach('');toast('Tugas ditambahkan ke proyek')}}>Tambah</Button></div>}
   <Button variant="ghost" onClick={()=>setDetail(null)}>Tutup</Button></div>}</Modal></div>}
