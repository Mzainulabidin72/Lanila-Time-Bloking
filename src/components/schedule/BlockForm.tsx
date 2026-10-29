import {useEffect,useState} from 'react'
import {AlertTriangle} from 'lucide-react'
import {useStore} from '../../stores/useStore'
import {Block,validateBlock,findConflicts,toMin,fmt} from '../../lib/time'
import {CATS,PRIORITY_LABEL} from '../../lib/categories'
import {Button,Field,Modal} from '../ui'
import {useToast} from '../Toast'
export interface Draft{id?:string;date:string;start?:string;end?:string;title?:string;category?:string;taskId?:string;priority?:Block['priority'];description?:string;notes?:string;done?:boolean}
interface F{title:string;date:string;start:string;end:string;category:string;taskId:string;priority:NonNullable<Block['priority']>;description:string;notes:string}
export default function BlockForm({open,draft,onClose}:{open:boolean;draft:Draft|null;onClose:()=>void}){
 const {blocks,tasks,addBlock,updateBlock}=useStore();const toast=useToast()
 const [f,setF]=useState<F|null>(null);const [ack,setAck]=useState(false);const [busy,setBusy]=useState(false);const [touched,setTouched]=useState(false)
 useEffect(()=>{if(open&&draft){const s=draft.start??'09:00';setF({title:draft.title??'',date:draft.date,start:s,end:draft.end??fmt(Math.min(toMin(s)+60,1439)),category:draft.category??CATS[0],taskId:draft.taskId??'',priority:draft.priority??'mid',description:draft.description??'',notes:draft.notes??''});setAck(false);setBusy(false);setTouched(false)}},[open,draft])
 const editing=!!draft?.id
 const body=(()=>{if(!f)return null
  const titleErr=!f.title.trim()?'Judul blok wajib diisi':null,timeErr=validateBlock(f)
  const conflicts=timeErr?[]:findConflicts(blocks,{id:draft?.id??'__new__',date:f.date,start:f.start,end:f.end})
  const can=!titleErr&&!timeErr&&(conflicts.length===0||ack)&&!busy
  const set=<K extends keyof F>(k:K,v:F[K])=>setF({...f,[k]:v})
  const submit=(e:React.FormEvent)=>{e.preventDefault();setTouched(true);if(!can)return;setBusy(true)
   const nb:Block={id:draft?.id??crypto.randomUUID(),title:f.title.trim(),date:f.date,start:f.start,end:f.end,category:f.category,done:draft?.done??false,taskId:f.taskId||undefined,priority:f.priority,description:f.description.trim()||undefined,notes:f.notes.trim()||undefined}
   if(editing)updateBlock(nb);else addBlock(nb);toast(editing?'Blok diperbarui':'Blok ditambahkan');setBusy(false);onClose()}
  return <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
   <div className="sm:col-span-2"><Field label="Judul blok" id="f-title" error={touched?titleErr:null}><input id="f-title" className="inp" autoFocus value={f.title} onChange={e=>set('title',e.target.value)} aria-invalid={touched&&!!titleErr}/></Field></div>
   <Field label="Tanggal" id="f-date"><input id="f-date" type="date" className="inp" value={f.date} onChange={e=>set('date',e.target.value)}/></Field>
   <Field label="Kategori" id="f-cat"><select id="f-cat" className="inp" value={f.category} onChange={e=>set('category',e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
   <Field label="Waktu mulai" id="f-start"><input id="f-start" type="time" className="inp" value={f.start} onChange={e=>set('start',e.target.value)}/></Field>
   <Field label="Waktu selesai" id="f-end" error={timeErr}><input id="f-end" type="time" className="inp" value={f.end} onChange={e=>set('end',e.target.value)} aria-invalid={!!timeErr}/></Field>
   <Field label="Prioritas" id="f-pr"><select id="f-pr" className="inp" value={f.priority} onChange={e=>set('priority',e.target.value as F['priority'])}>{(['low','mid','high'] as const).map(p=><option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</select></Field>
   <Field label="Tugas terkait (opsional)" id="f-task"><select id="f-task" className="inp" value={f.taskId} onChange={e=>set('taskId',e.target.value)}><option value="">Tanpa tugas</option>{tasks.filter(t=>t.status!=='done'||t.id===f.taskId).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
   <div className="sm:col-span-2"><Field label="Deskripsi (opsional)" id="f-desc"><textarea id="f-desc" rows={2} className="inp" value={f.description} onChange={e=>set('description',e.target.value)}/></Field></div>
   <div className="sm:col-span-2"><Field label="Catatan (opsional)" id="f-notes"><textarea id="f-notes" rows={2} className="inp" value={f.notes} onChange={e=>set('notes',e.target.value)}/></Field></div>
   {conflicts.length>0&&<div role="alert" className="rounded-xl border border-amber-500 bg-amber-500/10 p-3 text-sm sm:col-span-2"><p className="flex items-center gap-2 font-medium"><AlertTriangle size={16}/>Bentrok dengan {conflicts.length} blok</p>
    <ul className="mt-1 list-disc pl-5 text-xs">{conflicts.map(c=><li key={c.id}>{c.title} ({c.start}–{c.end})</li>)}</ul><p className="mt-1 text-xs text-muted">Ubah waktunya, atau setujui tumpang tindih. Blok lama tidak akan ditimpa.</p>
    <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>Saya mengerti dan tetap ingin menyimpan</label></div>}
   <div className="flex gap-2 sm:col-span-2"><Button disabled={!can}>{busy?'Menyimpan…':editing?'Simpan perubahan':'Simpan blok'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>})()
 return <Modal open={open} onClose={onClose} title={editing?'Ubah blok waktu':'Tambah blok waktu'}>{body}</Modal>}
