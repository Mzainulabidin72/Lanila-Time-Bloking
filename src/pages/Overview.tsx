import {Link} from 'react-router-dom'
import {useStore} from '../stores/useStore'
import {duration,todayStr} from '../lib/time'
export default function Overview(){
 const {blocks,tasks,focus}=useStore();const today=blocks.filter(b=>b.date===todayStr())
 const planned=today.reduce((a,b)=>a+duration(b),0),done=today.filter(b=>b.done).reduce((a,b)=>a+duration(b),0)
 const hour=new Date().getHours(),greet=hour<11?'Selamat pagi':hour<15?'Selamat siang':hour<18?'Selamat sore':'Selamat malam'
 const fToday=focus.sessions.filter(s=>new Date(s.at).toDateString()===new Date().toDateString()).reduce((a,s)=>a+s.minutes,0)
 const stats=[['Jam terencana',`${(planned/60).toFixed(1)} jam`],['Blok selesai',`${today.filter(b=>b.done).length}/${today.length}`],['Tugas tersisa',String(tasks.filter(t=>t.status!=='done').length)],['Fokus hari ini',`${fToday} mnt`],['Selesai (terjadwal)',planned?`${Math.round(done/planned*100)}%`:'–']]
 return <div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">{greet}</h1><p className="text-sm text-slate-500">{new Date().toLocaleDateString('id-ID',{dateStyle:'full'})}</p></div>
  <div className="flex gap-2"><Link to="/jadwal" className="btn">Rencanakan Hariku</Link><Link to="/fokus" className="btn !bg-brand">Mulai Fokus</Link></div></div>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{stats.map(([l,v])=><div key={l} className="card !p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-xl font-semibold">{v}</p></div>)}</div>
  <section className="card"><h2 className="mb-3 font-semibold">Jadwal hari ini</h2>{today.length===0?<p className="text-sm text-slate-500">Belum ada blok waktu hari ini. Buat satu di Jadwal Saya.</p>:
   <ul className="space-y-2">{[...today].sort((a,b)=>a.start.localeCompare(b.start)).map(b=><li key={b.id} className={`flex justify-between rounded-xl bg-brand-violet/5 px-3 py-2 text-sm ${b.done?'line-through opacity-60':''}`}><span>{b.start}–{b.end} · {b.title}</span><span className="text-slate-500">{duration(b)} mnt</span></li>)}</ul>}</section></div>}
