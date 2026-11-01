import {useState} from 'react'
import {CalendarCheck,CalendarDays,Copy,Eye,Pencil,Play,Plus,Power,Repeat,Search,Trash2,X} from 'lucide-react'
import {format} from 'date-fns'
import {id as idl} from 'date-fns/locale'
import {useStore} from '../stores/useStore'
import {Routine,ROUTINE_CATEGORIES,WEEKDAYS,filterRoutines,isActive,routineStats} from '../lib/routines'
import {fmtDur} from '../lib/schedule'
import {Badge,Button,EmptyState,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
import ActionMenu from '../components/ActionMenu'
import RoutineForm from '../components/routines/RoutineForm'
import ApplyDialog from '../components/routines/ApplyDialog'
import RoutineDetail from '../components/routines/RoutineDetail'
type Status='all'|'active'|'inactive'
const STEPS=[[Repeat,'Buat template aktivitas','Susun aktivitas harian beserta jamnya.'],[CalendarDays,'Atur hari dan waktu pengulangan','Pilih hari berlaku dan rentang tanggal.'],[CalendarCheck,'Terapkan ke jadwal harianmu','Pratinjau bentrok, lalu buat blok sekali klik.']] as const
export default function Routines(){
 const {routines,addRoutine,updateRoutine,delRoutine}=useStore();const toast=useToast()
 const [q,setQ]=useState('');const [status,setStatus]=useState<Status>('all');const [cat,setCat]=useState('')
 const [form,setForm]=useState<{open:boolean;r:Routine|null}>({open:false,r:null});const [apply,setApply]=useState<Routine|null>(null);const [detail,setDetail]=useState<string|null>(null);const [del,setDel]=useState<Routine|null>(null)
 const list=filterRoutines(routines,{q,status,category:cat}),filtersOn=!!(q.trim()||status!=='all'||cat),cats=ROUTINE_CATEGORIES.filter(c=>routines.some(r=>r.category===c))
 const reset=()=>{setQ('');setStatus('all');setCat('')}
 const dup=(r:Routine)=>{addRoutine({...r,id:crypto.randomUUID(),name:`${r.name} (salinan)`,lastAppliedAt:undefined,blocks:r.blocks.map(b=>({...b,id:crypto.randomUUID()}))});toast('Rutinitas diduplikasi')}
 const toggle=(r:Routine)=>{updateRoutine({...r,active:!isActive(r)});toast(isActive(r)?'Rutinitas dinonaktifkan':'Rutinitas diaktifkan')}
 const open=(r:Routine|null)=>setForm({open:true,r})
 return <div className="mx-auto max-w-6xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold">Rutinitas</h1>{routines.length>0&&<Badge tone="violet">{routines.length} rutinitas</Badge>}</div><p className="text-sm text-muted">Simpan susunan hari yang sering kamu pakai, lalu terapkan kapan saja.</p></div>
   <Button className="inline-flex items-center gap-1" onClick={()=>open(null)}><Plus size={16}/>Rutinitas Baru</Button></div>
  {routines.length===0?<section className="card mx-auto max-w-2xl space-y-5 text-center" aria-label="Belum ada rutinitas">
   <div className="flex justify-center -space-x-2" aria-hidden>{[Repeat,CalendarDays,CalendarCheck].map((I,i)=><span key={i} className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-surface ${i===1?'z-10 bg-brand-violet text-white':'bg-brand-violet/10 text-accent'}`}><I size={22}/></span>)}</div>
   <div><h2 className="text-lg font-semibold">Belum ada rutinitas</h2><p className="mx-auto max-w-md text-sm text-muted">Buat rutinitas harianmu untuk mengatur aktivitas berulang dengan lebih mudah dan konsisten.</p></div>
   <ol className="grid gap-3 text-left sm:grid-cols-3">{STEPS.map(([I,t,s],i)=><li key={t} className="rounded-xl bg-elevated p-3"><span className="flex items-center gap-2 text-xs font-semibold text-accent"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-violet text-white">{i+1}</span><I size={14} aria-hidden/></span><p className="mt-1 text-sm font-medium">{t}</p><p className="text-xs text-muted">{s}</p></li>)}</ol>
   <div><Button onClick={()=>open(null)}>Buat Rutinitas Pertama</Button></div></section>
  :<>
   <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Pencarian dan filter rutinitas">
    <div className="relative w-full min-w-[12rem] sm:w-auto sm:flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input aria-label="Cari rutinitas" placeholder="Cari rutinitas atau aktivitas" className="inp pl-8" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div role="group" aria-label="Status rutinitas" className="inline-flex rounded-xl border border-line bg-bg p-0.5">{([['all','Semua'],['active','Aktif'],['inactive','Nonaktif']] as const).map(([v,l])=><button key={v} type="button" aria-pressed={status===v} onClick={()=>setStatus(v)} className={`rounded-lg px-3 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 ${status===v?'bg-surface font-semibold text-accent shadow-sm':'text-muted hover:text-ink'}`}>{l}</button>)}</div>
    {cats.length>0&&<select aria-label="Filter kategori" className="inp w-auto" value={cat} onChange={e=>setCat(e.target.value)}><option value="">Semua kategori</option>{cats.map(c=><option key={c}>{c}</option>)}</select>}
    {filtersOn&&<Button variant="ghost" className="inline-flex items-center gap-1" onClick={reset}><X size={14}/>Reset</Button>}</div>
   <p className="text-xs text-muted" aria-live="polite">Menampilkan {list.length} dari {routines.length} rutinitas</p>
   {list.length===0?<EmptyState title={q.trim()?`Tidak ada hasil untuk “${q.trim()}”`:'Tidak ada rutinitas yang cocok'} text="Coba ubah pencarian atau filter." action={<Button variant="ghost" onClick={reset}>Reset Filter</Button>}/>
   :<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{list.map(r=>{const st=routineStats(r),on=isActive(r),color=r.color??'#7445FF'
    return <li key={r.id} className={`card flex flex-col gap-3 !p-4 transition-shadow hover:shadow-md ${on?'':'opacity-75'}`} style={{borderTop:`3px solid ${color}`}}>
     <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><button type="button" onClick={()=>setDetail(r.id)} className="block max-w-full truncate text-left font-semibold hover:underline focus-visible:outline focus-visible:outline-2">{r.name}</button><p className="line-clamp-2 min-h-[2rem] text-xs text-muted">{r.description??'Tanpa deskripsi'}</p></div>
      <ActionMenu label={`Aksi untuk ${r.name}`} items={[{label:'Lihat Detail',icon:<Eye size={14}/>,onClick:()=>setDetail(r.id)},{label:'Ubah',icon:<Pencil size={14}/>,onClick:()=>open(r)},{label:'Duplikat',icon:<Copy size={14}/>,onClick:()=>dup(r)},{label:on?'Nonaktifkan':'Aktifkan',icon:<Power size={14}/>,onClick:()=>toggle(r)},{label:'Hapus',icon:<Trash2 size={14}/>,onClick:()=>setDel(r),danger:true}]}/></div>
     <div className="flex flex-wrap gap-1">{r.category&&<Badge tone="violet">{r.category}</Badge>}<Badge tone={on?'green':'slate'}>{on?'Aktif':'Nonaktif'}</Badge></div>
     <div className="flex flex-wrap gap-1" aria-label="Hari berulang">{r.weekdays.length===0?<Badge>Semua hari</Badge>:WEEKDAYS.filter(([d])=>r.weekdays.includes(d)).map(([d,l])=><Badge key={d}>{l}</Badge>)}</div>
     <p className="text-xs text-muted">{st.count} aktivitas{st.start&&` · ${st.start}–${st.end}`} · {fmtDur(st.totalMin)}</p>
     <p className="mt-auto text-xs text-muted">{r.lastAppliedAt?`Terakhir diterapkan ${format(r.lastAppliedAt,'d MMM yyyy',{locale:idl})}`:'Belum pernah diterapkan'}</p>
     <div className="flex gap-2"><Button className="inline-flex flex-1 items-center justify-center gap-1 !py-1.5 text-xs" disabled={!on} title={on?'Terapkan ke jadwal':'Aktifkan rutinitas dulu'} onClick={()=>setApply(r)}><Play size={12}/>Terapkan</Button><Button variant="ghost" className="!py-1.5 text-xs" onClick={()=>setDetail(r.id)}>Detail</Button></div></li>})}</ul>}</>}
  <RoutineForm open={form.open} routine={form.r} onClose={()=>setForm({open:false,r:null})}/><ApplyDialog routine={apply} onClose={()=>setApply(null)}/>
  <RoutineDetail routine={routines.find(r=>r.id===detail)??null} onClose={()=>setDetail(null)} onApply={r=>{setDetail(null);setApply(r)}} onEdit={r=>{setDetail(null);open(r)}}/>
  <Modal open={!!del} onClose={()=>setDel(null)} title="Hapus rutinitas?">{del&&<div className="space-y-3"><p className="text-sm">“{del.name}” akan dihapus permanen. Blok yang sudah diterapkan ke jadwal <b>tidak ikut terhapus</b>; hanya dilepas dari rutinitas ini.</p><div className="flex flex-wrap gap-2"><Button variant="danger" onClick={()=>{delRoutine(del.id);toast('Rutinitas dihapus');setDel(null)}}>Ya, hapus</Button><Button variant="ghost" onClick={()=>{toggle(del);setDel(null)}}>{isActive(del)?'Nonaktifkan saja':'Batal'}</Button><Button variant="ghost" onClick={()=>setDel(null)}>Batal</Button></div></div>}</Modal></div>}
