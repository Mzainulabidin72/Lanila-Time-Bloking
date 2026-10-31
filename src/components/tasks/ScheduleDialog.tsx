import {useEffect,useRef,useState} from 'react'
import {AlertTriangle} from 'lucide-react'
import {useStore,Task} from '../../stores/useStore'
import {Block,validateBlock,findConflicts,toMin,fmt,todayStr} from '../../lib/time'
import {CATS} from '../../lib/categories'
import {Button,Field,Modal} from '../ui'
import {useToast} from '../Toast'
const nextSlot=()=>{const d=new Date();const m=Math.ceil((d.getHours()*60+d.getMinutes()+1)/30)*30;return m<1380?fmt(m):'09:00'}
export default function ScheduleDialog({task,onClose}:{task:Task|null;onClose:()=>void}){
 const {blocks,addBlock}=useStore();const toast=useToast()
 const [date,setDate]=useState(todayStr());const [start,setStart]=useState('09:00');const [dur,setDur]=useState(30);const [cat,setCat]=useState(CATS[0]);const [ack,setAck]=useState(false);const [busy,setBusy]=useState(false)
 const blockId=useRef(crypto.randomUUID()) // one id per dialog session: a retry updates the same block instead of duplicating
 useEffect(()=>{if(!task)return;const t=todayStr();blockId.current=crypto.randomUUID();const d=task.due&&task.due>=t?task.due:t;setDate(d);setStart(d===t?nextSlot():'09:00');setDur(task.est);setCat(CATS[0]);setAck(false);setBusy(false)},[task])
 const body=(()=>{if(!task)return null
  const endMin=toMin(start)+dur,end=fmt(Math.min(endMin,1439))
  const err=!(dur>0)?'Durasi harus lebih dari 0 menit':endMin>1439?'Blok melewati tengah malam; kurangi durasi atau majukan waktu mulai':validateBlock({date,start,end})
  const conflicts=err?[]:findConflicts(blocks,{id:blockId.current,date,start,end}),can=!err&&(conflicts.length===0||ack)&&!busy
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(!can)return;setBusy(true)
   try{const b:Block={id:blockId.current,title:task.title,date,start,end,category:cat,done:false,taskId:task.id,priority:task.priority,description:task.description,projectId:task.projectId};addBlock(b);toast('Tugas dijadwalkan');onClose()}
   catch{toast('Gagal menjadwalkan. Tugasmu tidak berubah, coba lagi.','err');setBusy(false)}}
  return <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
   <p className="text-sm sm:col-span-2"><b>{task.title}</b><span className="block text-xs text-muted">Estimasi tugas: {task.est} menit. Menjadwalkan tidak menandai tugas selesai.</span></p>
   <Field label="Tanggal" id="s-date"><input id="s-date" type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)}/></Field>
   <Field label="Kategori" id="s-cat"><select id="s-cat" className="inp" value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
   <Field label="Waktu mulai" id="s-start"><input id="s-start" type="time" className="inp" value={start} onChange={e=>setStart(e.target.value)}/></Field>
   <Field label="Durasi (menit)" id="s-dur" error={err} hint={err?undefined:`Selesai pukul ${end}`}><input id="s-dur" type="number" min={5} step={5} className="inp" value={dur} onChange={e=>setDur(Number(e.target.value)||0)} aria-invalid={!!err}/></Field>
   {conflicts.length>0&&<div role="alert" className="rounded-xl border border-amber-500 bg-amber-500/10 p-3 text-sm sm:col-span-2"><p className="flex items-center gap-2 font-medium"><AlertTriangle size={16}/>Bentrok dengan {conflicts.length} blok</p><ul className="mt-1 list-disc pl-5 text-xs">{conflicts.map(c=><li key={c.id}>{c.title} ({c.start}–{c.end})</li>)}</ul>
    <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>Saya mengerti dan tetap ingin menjadwalkan</label></div>}
   <div className="flex gap-2 sm:col-span-2"><Button disabled={!can}>{busy?'Menjadwalkan…':'Jadwalkan'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>})()
 return <Modal open={!!task} onClose={onClose} title="Jadwalkan tugas">{body}</Modal>}
