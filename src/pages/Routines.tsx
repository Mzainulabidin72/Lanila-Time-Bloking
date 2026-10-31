import {useEffect,useRef,useState} from 'react'
import {AlertTriangle,Copy,Pencil,Play,Plus,Repeat,Trash2,X} from 'lucide-react'
import {useStore} from '../stores/useStore'
import {Routine,RoutineBlock,WEEKDAYS,previewApply,validateRoutine,weekdayOf} from '../lib/routines'
import {todayStr,duration} from '../lib/time'
import {fmtDur} from '../lib/schedule'
import {CATS} from '../lib/categories'
import {Badge,Button,EmptyState,Field,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
const newRow=():RoutineBlock=>({id:crypto.randomUUID(),title:'',start:'09:00',end:'10:00',category:CATS[0]})
function RoutineForm({open,routine,onClose}:{open:boolean;routine:Routine|null;onClose:()=>void}){
 const {addRoutine,updateRoutine}=useStore();const toast=useToast()
 const [name,setName]=useState('');const [desc,setDesc]=useState('');const [days,setDays]=useState<number[]>([]);const [rows,setRows]=useState<RoutineBlock[]>([]);const [err,setErr]=useState<string|null>(null)
 useEffect(()=>{if(open){setName(routine?.name??'');setDesc(routine?.description??'');setDays(routine?.weekdays??[]);setRows(routine?.blocks.map(b=>({...b}))??[newRow()]);setErr(null)}},[open,routine])
 const upd=(id:string,p:Partial<RoutineBlock>)=>setRows(rs=>rs.map(r=>r.id===id?{...r,...p}:r))
 const submit=(e:React.FormEvent)=>{e.preventDefault();const v=validateRoutine({name,blocks:rows});if(v){setErr(v);return}
  const sorted=[...rows].sort((a,b)=>a.start.localeCompare(b.start)).map(r=>({...r,title:r.title.trim()}))
  const base={name:name.trim(),description:desc.trim()||undefined,weekdays:days,blocks:sorted}
  if(routine){updateRoutine({...routine,...base});toast('Rutinitas diperbarui')}else{addRoutine({id:crypto.randomUUID(),...base});toast('Rutinitas dibuat')};onClose()}
 return <Modal open={open} onClose={onClose} title={routine?'Ubah rutinitas':'Rutinitas baru'}>{open&&<form onSubmit={submit} className="space-y-3" noValidate>
  <Field label="Nama rutinitas" id="r-name"><input id="r-name" autoFocus className="inp" value={name} onChange={e=>setName(e.target.value)}/></Field>
  <Field label="Deskripsi (opsional)" id="r-desc"><input id="r-desc" className="inp" value={desc} onChange={e=>setDesc(e.target.value)}/></Field>
  <div role="group" aria-label="Hari berlaku"><p className="mb-1 text-sm font-medium">Berlaku pada hari</p><div className="flex flex-wrap gap-1">{WEEKDAYS.map(([d,l])=><button key={d} type="button" aria-pressed={days.includes(d)} onClick={()=>setDays(x=>x.includes(d)?x.filter(y=>y!==d):[...x,d])} className={`rounded-lg border px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 ${days.includes(d)?'border-transparent bg-brand-violet text-white':'border-strong text-muted hover:bg-elevated'}`}>{l}</button>)}</div></div>
  <div><p className="mb-1 text-sm font-medium">Blok waktu</p><ul className="space-y-2">{rows.map((r,i)=><li key={r.id} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-2 sm:grid-cols-[1fr_6rem_6rem_auto]">
   <div className="col-span-2 sm:col-span-1"><label className="sr-only" htmlFor={`rt${r.id}`}>Judul blok {i+1}</label><input id={`rt${r.id}`} placeholder="Judul blok" className="inp" value={r.title} onChange={e=>upd(r.id,{title:e.target.value})}/></div>
   <div><label className="sr-only" htmlFor={`rs${r.id}`}>Mulai {i+1}</label><input id={`rs${r.id}`} type="time" className="inp" value={r.start} onChange={e=>upd(r.id,{start:e.target.value})}/></div>
   <div><label className="sr-only" htmlFor={`re${r.id}`}>Selesai {i+1}</label><input id={`re${r.id}`} type="time" className="inp" value={r.end} onChange={e=>upd(r.id,{end:e.target.value})}/></div>
   <button type="button" aria-label={`Hapus blok ${i+1}`} title="Hapus blok" className="justify-self-end rounded-lg p-2 text-muted hover:bg-elevated" onClick={()=>setRows(rs=>rs.filter(x=>x.id!==r.id))}><X size={16}/></button>
   <div className="col-span-2 sm:col-span-4"><label className="sr-only" htmlFor={`rc${r.id}`}>Kategori {i+1}</label><select id={`rc${r.id}`} className="inp" value={r.category} onChange={e=>upd(r.id,{category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div></li>)}</ul>
   <Button type="button" variant="ghost" className="mt-2 inline-flex items-center gap-1 !py-1.5 text-xs" onClick={()=>setRows(rs=>[...rs,newRow()])}><Plus size={12}/>Tambah blok</Button></div>
  {err&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}
  <div className="flex gap-2"><Button>{routine?'Simpan perubahan':'Simpan rutinitas'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>}</Modal>}
function ApplyDialog({routine,onClose}:{routine:Routine|null;onClose:()=>void}){
 const {blocks,addBlock}=useStore();const toast=useToast()
 const [date,setDate]=useState(todayStr());const [sel,setSel]=useState<Record<string,boolean>>({});const ids=useRef(new Map<string,string>())
 useEffect(()=>{if(routine){ids.current=new Map(routine.blocks.map(b=>[b.id,crypto.randomUUID()]));setDate(todayStr())}},[routine])
 const rows=routine?previewApply(routine,date,blocks):[]
 useEffect(()=>{if(routine)setSel(Object.fromEntries(previewApply(routine,date,blocks).map(r=>[r.rb.id,r.conflicts.length===0])))},[routine,date]) // eslint-disable-line react-hooks/exhaustive-deps
 const chosen=rows.filter(r=>sel[r.rb.id]),skipped=rows.length-chosen.length
 const apply=()=>{if(!routine||!chosen.length)return
  for(const r of chosen)addBlock({id:ids.current.get(r.rb.id)!,title:r.rb.title,date,start:r.rb.start,end:r.rb.end,category:r.rb.category,done:false,priority:'mid'})
  toast(`${chosen.length} blok ditambahkan${skipped?`, ${skipped} dilewati`:''}`);onClose()}
 const off=routine&&routine.weekdays.length>0&&!routine.weekdays.includes(weekdayOf(date))
 return <Modal open={!!routine} onClose={onClose} title={`Terapkan: ${routine?.name??''}`}>{routine&&<div className="space-y-3">
  <Field label="Tanggal" id="ap-date"><input id="ap-date" type="date" className="inp" value={date} onChange={e=>e.target.value&&setDate(e.target.value)}/></Field>
  {off&&<p className="text-xs text-muted">Rutinitas ini biasanya untuk: {WEEKDAYS.filter(([d])=>routine.weekdays.includes(d)).map(([,l])=>l).join(', ')}. Kamu tetap bisa menerapkannya hari ini.</p>}
  <div><p className="mb-1 text-sm font-medium">Pratinjau (belum ada yang disimpan)</p><ul className="space-y-1">{rows.map(r=><li key={r.rb.id} className={`rounded-xl border p-2 text-sm ${r.conflicts.length?'border-amber-500 bg-amber-500/10':'border-line'}`}>
   <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={!!sel[r.rb.id]} onChange={e=>setSel({...sel,[r.rb.id]:e.target.checked})}/><span className="min-w-0"><span className="block font-medium">{r.rb.start}–{r.rb.end} · {r.rb.title}</span>
    {r.conflicts.length>0?<span className="flex items-start gap-1 text-xs"><AlertTriangle size={12} className="mt-0.5 shrink-0"/>Bentrok dengan {r.conflicts.map(c=>`${c.title} (${c.start}–${c.end})`).join(', ')}. Centang hanya jika ingin tetap menambahkan; jadwal lama tidak ditimpa.</span>:<span className="text-xs text-muted">Tidak ada bentrok</span>}</span></label></li>)}</ul></div>
  <div className="flex gap-2"><Button disabled={!chosen.length} onClick={apply}>Terapkan {chosen.length} blok</Button><Button variant="ghost" onClick={onClose}>Batal</Button></div></div>}</Modal>}
export default function Routines(){
 const {routines,addRoutine,delRoutine}=useStore();const toast=useToast()
 const [form,setForm]=useState<{open:boolean;r:Routine|null}>({open:false,r:null});const [apply,setApply]=useState<Routine|null>(null);const [del,setDel]=useState<Routine|null>(null)
 return <div className="mx-auto max-w-5xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Rutinitas</h1><p className="text-sm text-muted">Simpan susunan hari yang sering kamu pakai, lalu terapkan kapan saja.</p></div>
   <Button className="inline-flex items-center gap-1" onClick={()=>setForm({open:true,r:null})}><Plus size={16}/>Rutinitas Baru</Button></div>
  {routines.length===0?<EmptyState title="Belum ada rutinitas" text="Buat template, misalnya “Pagi Produktif”, lalu terapkan ke tanggal mana pun." action={<div className="flex flex-col items-center gap-2"><Repeat size={28} className="text-accent" aria-hidden/><Button onClick={()=>setForm({open:true,r:null})}>Buat Rutinitas</Button></div>}/>
  :<ul className="grid gap-3 md:grid-cols-2">{routines.map(r=><li key={r.id} className="card space-y-2 !p-4"><div><p className="font-semibold">{r.name}</p>{r.description&&<p className="text-xs text-muted">{r.description}</p>}</div>
   <div className="flex flex-wrap gap-1">{r.weekdays.length===0?<Badge>Semua hari</Badge>:WEEKDAYS.filter(([d])=>r.weekdays.includes(d)).map(([d,l])=><Badge key={d} tone="violet">{l}</Badge>)}</div>
   <p className="text-xs text-muted">{r.blocks.length} blok · {fmtDur(r.blocks.reduce((a,b)=>a+duration(b),0))}</p>
   <ul className="space-y-0.5 text-xs">{r.blocks.slice(0,4).map(b=><li key={b.id} className="truncate">{b.start}–{b.end} · {b.title}</li>)}{r.blocks.length>4&&<li className="text-muted">+{r.blocks.length-4} lainnya</li>}</ul>
   <div className="flex flex-wrap gap-2"><Button className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs" onClick={()=>setApply(r)}><Play size={12}/>Terapkan</Button><Button variant="ghost" className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs" onClick={()=>setForm({open:true,r})}><Pencil size={12}/>Ubah</Button>
    <Button variant="ghost" className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs" onClick={()=>{addRoutine({...r,id:crypto.randomUUID(),name:`${r.name} (salinan)`,blocks:r.blocks.map(b=>({...b,id:crypto.randomUUID()}))});toast('Rutinitas diduplikasi')}}><Copy size={12}/>Duplikat</Button>
    <Button variant="ghost" className="inline-flex items-center gap-1 !px-3 !py-1.5 text-xs text-red-600 dark:text-red-400" onClick={()=>setDel(r)}><Trash2 size={12}/>Hapus</Button></div></li>)}</ul>}
  <RoutineForm open={form.open} routine={form.r} onClose={()=>setForm({open:false,r:null})}/><ApplyDialog routine={apply} onClose={()=>setApply(null)}/>
  <Modal open={!!del} onClose={()=>setDel(null)} title="Hapus rutinitas?">{del&&<div className="space-y-3"><p className="text-sm">“{del.name}” akan dihapus. Blok yang sudah diterapkan ke jadwal tidak ikut terhapus.</p><div className="flex gap-2"><Button variant="danger" onClick={()=>{delRoutine(del.id);toast('Rutinitas dihapus');setDel(null)}}>Ya, hapus</Button><Button variant="ghost" onClick={()=>setDel(null)}>Batal</Button></div></div>}</Modal></div>}
