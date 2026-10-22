import {useState} from 'react'
import {useStore} from '../stores/useStore'
import {Block,validateBlock,findConflicts,todayStr,weekDates} from '../lib/time'
import {Button,EmptyState,Field} from '../components/ui'
const CATS=['Deep Work','Administratif','Pribadi','Rapat','Belajar','Olahraga','Istirahat','Keluarga','Keuangan','Perencanaan Pernikahan']
export default function Schedule(){
 const {blocks,tasks,addBlock,updateBlock,delBlock,toggleBlock}=useStore()
 const E0={title:'',start:'09:00',end:'10:00',category:CATS[0],taskId:''}
 const [date,setDate]=useState(todayStr());const [view,setView]=useState<'day'|'week'>('day');const [f,setF]=useState(E0);const [editId,setEditId]=useState<string|null>(null);const [err,setErr]=useState<string|null>(null);const [pending,setPending]=useState<Block|null>(null)
 const save=(b:Block)=>{editId?updateBlock(b):addBlock(b);setF(E0);setEditId(null);setPending(null)}
 const submit=(e:React.FormEvent)=>{e.preventDefault();const old=blocks.find(b=>b.id===editId)
  const nb:Block={id:editId??crypto.randomUUID(),title:f.title.trim(),date,start:f.start,end:f.end,category:f.category,done:old?.done??false,taskId:f.taskId||undefined}
  const v=!nb.title?'Judul wajib diisi':validateBlock(nb);if(v){setErr(v);return};setErr(null)
  if(findConflicts(blocks,nb).length){setPending(nb);return};save(nb)}
 const edit=(b:Block)=>{setF({title:b.title,start:b.start,end:b.end,category:b.category,taskId:b.taskId??''});setEditId(b.id);setDate(b.date);setView('day')}
 const dates=view==='day'?[date]:weekDates(date)
 const item=(b:Block)=>{const c=findConflicts(blocks,b).length>0;const t=tasks.find(x=>x.id===b.taskId)
  return <li key={b.id} className={`card flex items-center gap-3 !p-3 ${c?'border-amber-400':''}`}><input type="checkbox" aria-label={`Selesai: ${b.title}`} checked={b.done} onChange={()=>toggleBlock(b.id)}/>
   <div className="min-w-0 flex-1"><p className={`truncate text-sm font-medium ${b.done?'line-through':''}`}>{b.title}</p><p className="text-xs text-slate-500">{b.start}–{b.end} · {b.category}{t&&` · Tugas: ${t.title}`}{c&&' · bentrok'}</p></div>
   <button className="text-xs text-brand-violet" onClick={()=>edit(b)}>Ubah</button><button className="text-xs text-red-600" onClick={()=>confirm('Hapus blok ini?')&&delBlock(b.id)}>Hapus</button></li>}
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Jadwal Saya</h1>
  <div className="flex flex-wrap items-end gap-3"><label className="text-sm">Tanggal<input type="date" className="inp mt-1" value={date} onChange={e=>setDate(e.target.value)}/></label>
   <div role="group" aria-label="Tampilan" className="flex gap-1">{(['day','week'] as const).map(v=><Button key={v} variant={view===v?'primary':'ghost'} onClick={()=>setView(v)}>{v==='day'?'Hari':'Minggu'}</Button>)}</div></div>
  <form onSubmit={submit} className="card grid gap-3 md:grid-cols-6" aria-label={editId?'Ubah blok waktu':'Blok waktu baru'}>
   <div className="md:col-span-2"><Field label="Judul" id="bt"><input id="bt" className="inp" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></Field></div>
   <Field label="Mulai" id="bs"><input id="bs" type="time" className="inp" value={f.start} onChange={e=>setF({...f,start:e.target.value})}/></Field>
   <Field label="Selesai" id="be"><input id="be" type="time" className="inp" value={f.end} onChange={e=>setF({...f,end:e.target.value})}/></Field>
   <Field label="Kategori" id="bc"><select id="bc" className="inp" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
   <Field label="Tugas" id="bk"><select id="bk" className="inp" value={f.taskId} onChange={e=>setF({...f,taskId:e.target.value})}><option value="">–</option>{tasks.filter(t=>t.status!=='done'||t.id===f.taskId).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
   {err&&<p role="alert" className="text-sm text-red-600 md:col-span-6">{err}</p>}
   <div className="flex gap-2 md:col-span-6"><Button>{editId?'Simpan perubahan':'Tambah blok'}</Button>{editId&&<Button type="button" variant="ghost" onClick={()=>{setEditId(null);setF(E0)}}>Batal</Button>}</div></form>
  {pending&&<div role="alertdialog" aria-label="Jadwal bentrok" className="card border-amber-400"><p className="text-sm">Bentrok dengan: {findConflicts(blocks,pending).map(b=>b.title).join(', ')}. Jadwal lama tidak akan ditimpa.</p>
   <div className="mt-3 flex gap-2"><Button onClick={()=>save(pending)}>Tetap simpan</Button><Button variant="ghost" onClick={()=>setPending(null)}>Ubah waktu</Button></div></div>}
  {dates.map(dt=>{const day=blocks.filter(b=>b.date===dt).sort((a,b)=>a.start.localeCompare(b.start));return <section key={dt}>{view==='week'&&<h2 className="mb-1 mt-2 text-sm font-semibold">{new Date(dt+'T00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short'})}</h2>}
   {day.length===0?(view==='day'?<EmptyState title="Belum ada blok pada tanggal ini"/>:<p className="text-xs text-slate-400">Kosong</p>):<ul className="space-y-2">{day.map(item)}</ul>}</section>})}</div>}
