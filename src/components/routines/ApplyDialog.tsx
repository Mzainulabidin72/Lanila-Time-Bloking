import {useEffect,useRef,useState} from 'react'
import {AlertTriangle,Copy,X} from 'lucide-react'
import {format,parseISO} from 'date-fns'
import {id as idl} from 'date-fns/locale'
import {useStore} from '../../stores/useStore'
import {PreviewRow,Routine,datesAhead,datesForWeek,isActive,notesFor,previewApply} from '../../lib/routines'
import {todayStr} from '../../lib/time'
import {Badge,Button,Field,Modal} from '../ui'
import {useToast} from '../Toast'
const MAX_DATES=31
const key=(d:string,id:string)=>`${d}|${id}`
export default function ApplyDialog({routine,onClose}:{routine:Routine|null;onClose:()=>void}){
 const {blocks,projects,addBlock,updateRoutine}=useStore();const toast=useToast()
 const [dates,setDates]=useState<string[]>([]);const [nd,setNd]=useState(todayStr());const [sel,setSel]=useState<Record<string,boolean>>({});const ids=useRef(new Map<string,string>());const [busy,setBusy]=useState(false)
 useEffect(()=>{if(routine){ids.current=new Map();setDates([todayStr()]);setNd(todayStr());setSel({});setBusy(false)}},[routine])
 const addDates=(ds:string[])=>setDates(x=>[...new Set([...x,...ds])].sort().slice(0,MAX_DATES))
 const previews=routine?dates.map(d=>({date:d,rows:previewApply(routine,d,blocks),notes:notesFor(routine,d)})):[]
 const isOn=(d:string,r:PreviewRow)=>sel[key(d,r.rb.id)]??(r.conflicts.length===0&&!r.duplicate)
 const chosen=previews.flatMap(p=>p.rows.filter(r=>isOn(p.date,r)).map(r=>({date:p.date,r}))),total=previews.reduce((a,p)=>a+p.rows.length,0)
 const apply=()=>{if(!routine||!chosen.length||busy||!isActive(routine))return;setBusy(true)
  try{for(const {date,r} of chosen){const k=key(date,r.rb.id);if(!ids.current.has(k))ids.current.set(k,crypto.randomUUID()) // stable id per (date, activity): retrying never duplicates
   addBlock({id:ids.current.get(k)!,title:r.rb.title,date,start:r.rb.start,end:r.rb.end,category:r.rb.category,done:false,priority:'mid',description:r.rb.description,projectId:r.rb.projectId&&projects.some(p=>p.id===r.rb.projectId)?r.rb.projectId:undefined,routineId:routine.id,routineBlockId:r.rb.id})}
   updateRoutine({...routine,lastAppliedAt:Date.now()});toast(`${chosen.length} blok ditambahkan${total-chosen.length?`, ${total-chosen.length} dilewati`:''}`);onClose()}
  catch{toast('Gagal menerapkan rutinitas. Jadwalmu tidak berubah, coba lagi.','err');setBusy(false)}}
 return <Modal open={!!routine} onClose={onClose} title={`Terapkan: ${routine?.name??''}`}>{routine&&<div className="space-y-3">
  {!isActive(routine)&&<p role="alert" className="rounded-xl border border-amber-500 bg-amber-500/10 p-2 text-xs">Rutinitas ini nonaktif. Aktifkan dulu lewat menu kartu atau form ubah.</p>}
  <div><p className="mb-1 text-sm font-medium">Tanggal tujuan ({dates.length}/{MAX_DATES})</p>
   <div className="flex flex-wrap items-end gap-2"><Field label="Pilih tanggal" id="ap-date"><input id="ap-date" type="date" className="inp" value={nd} onChange={e=>setNd(e.target.value)}/></Field><Button variant="ghost" disabled={!nd} onClick={()=>addDates([nd])}>Tambah</Button></div>
   <div className="mt-2 flex flex-wrap gap-2"><Button variant="ghost" className="!py-1 text-xs" onClick={()=>addDates(datesForWeek(todayStr(),routine.weekdays))}>Minggu ini (hari berlaku)</Button><Button variant="ghost" className="!py-1 text-xs" onClick={()=>addDates(datesAhead(todayStr(),7,routine.weekdays))}>7 hari ke depan (hari berlaku)</Button></div>
   <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tanggal terpilih">{dates.map(d=><li key={d} className="inline-flex items-center gap-1 rounded-full bg-brand-violet/10 px-2 py-1 text-xs text-accent">{format(parseISO(d),'EEE d MMM',{locale:idl})}<button type="button" aria-label={`Hapus tanggal ${d}`} onClick={()=>setDates(x=>x.filter(y=>y!==d))} className="rounded-full hover:bg-brand-violet/20"><X size={12}/></button></li>)}</ul></div>
  {dates.length===0?<p className="text-sm text-muted">Pilih minimal satu tanggal.</p>:<div className="space-y-3"><p className="text-sm font-medium">Pratinjau (belum ada yang disimpan)</p>
   {previews.map(p=><section key={p.date} aria-label={p.date}><h3 className="text-xs font-semibold">{format(parseISO(p.date),'EEEE, d MMMM yyyy',{locale:idl})}</h3>{p.notes.map(n=><p key={n} className="text-xs text-muted">ℹ {n}</p>)}
    <ul className="mt-1 space-y-1">{p.rows.map(r=><li key={r.rb.id} className={`rounded-xl border p-2 text-sm ${r.conflicts.length?'border-amber-500 bg-amber-500/10':r.duplicate?'border-brand-violet/50 bg-brand-violet/5':'border-line'}`}>
     <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={isOn(p.date,r)} onChange={e=>setSel({...sel,[key(p.date,r.rb.id)]:e.target.checked})}/><span className="min-w-0"><span className="block font-medium">{r.rb.start}–{r.rb.end} · {r.rb.title}</span>
      {r.duplicate&&<span className="flex items-start gap-1 text-xs"><Copy size={12} className="mt-0.5 shrink-0"/>Sudah diterapkan di tanggal ini. Centang hanya jika ingin menambahkannya lagi.</span>}
      {r.conflicts.length>0&&<span className="flex items-start gap-1 text-xs"><AlertTriangle size={12} className="mt-0.5 shrink-0"/>Bentrok dengan {r.conflicts.map(c=>`${c.title} (${c.start}–${c.end})`).join(', ')}. Centang untuk tetap menambahkan; jadwal lama tidak ditimpa.</span>}
      {!r.duplicate&&r.conflicts.length===0&&<span className="text-xs text-muted">Tidak ada bentrok</span>}</span></label></li>)}</ul></section>)}</div>}
  <div className="flex flex-wrap items-center gap-2"><Button disabled={!chosen.length||busy||!isActive(routine)} onClick={apply}>{busy?'Menerapkan…':`Terapkan ${chosen.length} blok`}</Button><Button variant="ghost" onClick={onClose}>Batal</Button>{total>0&&<Badge>{total-chosen.length} dilewati</Badge>}</div></div>}</Modal>}
