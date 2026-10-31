import {useEffect,useState} from 'react'
import {useStore,Task} from '../../stores/useStore'
import {PRIORITY_LABEL} from '../../lib/categories'
import {Button,Field,Modal} from '../ui'
import {useToast} from '../Toast'
export interface TaskDraft{id?:string;title?:string;priority?:Task['priority'];due?:string;est?:number;status?:Task['status'];description?:string;notes?:string;projectId?:string}
interface F{title:string;priority:Task['priority'];due:string;est:string;status:'todo'|'doing'|'done';description:string;notes:string;project:string}
export default function TaskForm({open,draft,onClose}:{open:boolean;draft:TaskDraft|null;onClose:()=>void}){
 const {addTask,setTask,projects}=useStore();const toast=useToast()
 const [f,setF]=useState<F|null>(null);const [touched,setTouched]=useState(false);const [busy,setBusy]=useState(false)
 useEffect(()=>{if(open&&draft){setF({title:draft.title??'',priority:draft.priority??'mid',due:draft.due??'',est:String(draft.est??30),status:draft.status==='inbox'||!draft.status?'todo':draft.status,description:draft.description??'',notes:draft.notes??'',project:draft.projectId??''});setTouched(false);setBusy(false)}},[open,draft])
 const editing=!!draft?.id
 const body=(()=>{if(!f)return null
  const estN=Number(f.est),errs={title:!f.title.trim()?'Judul tugas wajib diisi':null,est:!(estN>0)?'Estimasi harus lebih dari 0 menit':null,due:f.due&&(!/^\d{4}-\d{2}-\d{2}$/.test(f.due)||Number.isNaN(Date.parse(f.due)))?'Tanggal tenggat tidak valid':null}
  const ok=!errs.title&&!errs.est&&!errs.due&&!busy,set=<K extends keyof F>(k:K,v:F[K])=>setF({...f,[k]:v})
  const submit=(e:React.FormEvent)=>{e.preventDefault();setTouched(true);if(!ok)return;setBusy(true)
   const patch={title:f.title.trim(),priority:f.priority,due:f.due||undefined,est:Math.round(estN),status:f.status,description:f.description.trim()||undefined,notes:f.notes.trim()||undefined,projectId:f.project||undefined}
   try{if(editing)setTask(draft!.id!,patch);else addTask({id:crypto.randomUUID(),...patch});toast(editing?'Tugas diperbarui':'Tugas ditambahkan');onClose()}
   catch{toast('Gagal menyimpan tugas. Data yang kamu isi masih ada, coba lagi.','err');setBusy(false)}}
  return <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
   <div className="sm:col-span-2"><Field label="Judul tugas" id="t-title" error={touched?errs.title:null}><input id="t-title" autoFocus placeholder="Contoh: Menyusun laporan mingguan" className="inp" value={f.title} onChange={e=>set('title',e.target.value)} aria-invalid={touched&&!!errs.title}/></Field></div>
   <Field label="Prioritas" id="t-pr"><select id="t-pr" className="inp" value={f.priority} onChange={e=>set('priority',e.target.value as F['priority'])}>{(['low','mid','high'] as const).map(p=><option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</select></Field>
   <Field label="Status" id="t-st"><select id="t-st" className="inp" value={f.status} onChange={e=>set('status',e.target.value as F['status'])}><option value="todo">Belum selesai</option><option value="doing">Sedang dikerjakan</option><option value="done">Selesai</option></select></Field>
   <Field label="Tenggat" id="t-due" error={errs.due}><input id="t-due" type="date" className="inp" value={f.due} onChange={e=>set('due',e.target.value)}/></Field>
   <Field label="Estimasi (menit)" id="t-est" error={touched?errs.est:null}><input id="t-est" type="number" min={1} step={5} className="inp" value={f.est} onChange={e=>set('est',e.target.value)} aria-invalid={touched&&!!errs.est}/></Field>
   <div className="sm:col-span-2"><Field label="Proyek (opsional)" id="t-proj"><select id="t-proj" className="inp" value={f.project} onChange={e=>set('project',e.target.value)}><option value="">Tanpa proyek</option>{projects.filter(p=>p.status==='active'||p.id===f.project).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field></div>
   <div className="sm:col-span-2"><Field label="Deskripsi (opsional)" id="t-desc"><textarea id="t-desc" rows={2} placeholder="Detail yang perlu diingat" className="inp" value={f.description} onChange={e=>set('description',e.target.value)}/></Field></div>
   <div className="sm:col-span-2"><Field label="Catatan (opsional)" id="t-notes"><textarea id="t-notes" rows={2} className="inp" value={f.notes} onChange={e=>set('notes',e.target.value)}/></Field></div>
   <div className="flex gap-2 sm:col-span-2"><Button disabled={busy}>{busy?'Menyimpan…':editing?'Simpan perubahan':'Simpan tugas'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>})()
 return <Modal open={open} onClose={onClose} title={editing?'Ubah tugas':'Tambah tugas'}>{body}</Modal>}
