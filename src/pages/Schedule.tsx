import {useState} from 'react'
import {useStore} from '../stores/useStore'
import {Block,validateBlock,findConflicts,todayStr} from '../lib/time'
const CATS=['Deep Work','Administratif','Pribadi','Rapat','Belajar','Olahraga','Istirahat','Keluarga','Keuangan','Perencanaan Pernikahan']
export default function Schedule(){
 const {blocks,addBlock,delBlock,toggleBlock}=useStore()
 const [date,setDate]=useState(todayStr());const [f,setF]=useState({title:'',start:'09:00',end:'10:00',category:CATS[0]});const [err,setErr]=useState<string|null>(null);const [pending,setPending]=useState<Block|null>(null)
 const day=blocks.filter(b=>b.date===date).sort((a,b)=>a.start.localeCompare(b.start))
 const submit=(e:React.FormEvent)=>{e.preventDefault();const nb:Block={id:crypto.randomUUID(),title:f.title.trim(),date,start:f.start,end:f.end,category:f.category,done:false}
  const v=!nb.title?'Judul wajib diisi':validateBlock(nb);if(v){setErr(v);return};setErr(null)
  if(findConflicts(blocks,nb).length){setPending(nb);return};addBlock(nb)}
 const conflicted=new Set(day.filter(b=>findConflicts(blocks,b).length).map(b=>b.id))
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Jadwal Saya</h1>
  <label className="block text-sm">Tanggal<input type="date" className="inp mt-1 max-w-xs" value={date} onChange={e=>setDate(e.target.value)}/></label>
  <form onSubmit={submit} className="card grid gap-3 md:grid-cols-5" aria-label="Blok waktu baru">
   <label className="text-sm md:col-span-2">Judul<input className="inp mt-1" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></label>
   <label className="text-sm">Mulai<input type="time" className="inp mt-1" value={f.start} onChange={e=>setF({...f,start:e.target.value})}/></label>
   <label className="text-sm">Selesai<input type="time" className="inp mt-1" value={f.end} onChange={e=>setF({...f,end:e.target.value})}/></label>
   <label className="text-sm">Kategori<select className="inp mt-1" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></label>
   {err&&<p role="alert" className="text-sm text-red-600 md:col-span-4">{err}</p>}<button className="btn md:col-span-5 md:justify-self-start">Tambah blok</button></form>
  {pending&&<div role="alertdialog" className="card border-amber-400"><p className="text-sm">Blok ini bertabrakan dengan: {findConflicts(blocks,pending).map(b=>b.title).join(', ')}. Jadwal lama tidak akan ditimpa.</p>
   <div className="mt-3 flex gap-2"><button className="btn" onClick={()=>{addBlock(pending);setPending(null)}}>Tetap tambahkan</button><button className="btn !bg-slate-500" onClick={()=>setPending(null)}>Ubah waktu</button></div></div>}
  {day.length===0?<p className="text-sm text-slate-500">Belum ada blok pada tanggal ini.</p>:<ul className="space-y-2">{day.map(b=><li key={b.id} className={`card flex items-center gap-3 !p-3 ${conflicted.has(b.id)?'border-amber-400':''}`}>
   <input type="checkbox" aria-label={`Selesai: ${b.title}`} checked={b.done} onChange={()=>toggleBlock(b.id)}/><div className="flex-1"><p className={`text-sm font-medium ${b.done?'line-through':''}`}>{b.title}</p><p className="text-xs text-slate-500">{b.start}–{b.end} · {b.category}{conflicted.has(b.id)&&' · bentrok'}</p></div>
   <button className="text-xs text-red-600" onClick={()=>confirm('Hapus blok ini?')&&delBlock(b.id)}>Hapus</button></li>)}</ul>}</div>}
