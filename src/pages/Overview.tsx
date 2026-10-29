import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {useStore} from '../stores/useStore'
import {useAuth} from '../lib/auth'
import {duration,todayStr,toMin} from '../lib/time'
import {todayFocusSec} from '../lib/focusTimer'
import {buildTimeline} from '../lib/timeline'
import {Badge,EmptyState,Skeleton} from '../components/ui'
const PR={high:0,mid:1,low:2}
export default function Overview(){
 const {blocks,tasks,focus}=useStore();const {user,dataReady}=useAuth();const [now,setNow]=useState(Date.now())
 useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(i)},[])
 const d=new Date(now),nowMin=d.getHours()*60+d.getMinutes(),today=blocks.filter(b=>b.date===todayStr())
 const planned=today.reduce((a,b)=>a+duration(b),0),done=today.filter(b=>b.done).reduce((a,b)=>a+duration(b),0),pct=planned?Math.round(done/planned*100):0
 const h=d.getHours(),greet=h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam',name=(user?.user_metadata?.full_name as string|undefined)?.split(' ')[0]
 const fToday=Math.round(todayFocusSec(focus.sessions,now)/60)
 const next=blocks.filter(b=>!b.done&&new Date(`${b.date}T${b.start}`).getTime()>now).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))[0]
 const open=tasks.filter(t=>t.status!=='done').sort((a,b)=>PR[a.priority]-PR[b.priority]||(a.due??'9').localeCompare(b.due??'9')).slice(0,5)
 const stats=[['Jam terencana',`${(planned/60).toFixed(1)} jam`,'total durasi blok hari ini'],['Blok selesai',`${today.filter(b=>b.done).length} / ${today.length}`,'blok ditandai selesai'],['Tugas tersisa',String(tasks.filter(t=>t.status!=='done').length),'belum selesai'],['Fokus hari ini',`${fToday} mnt`,'durasi sesi fokus tercatat'],['Sesi berikutnya',next?next.start:'–',next?`${next.title}${next.date!==todayStr()?` (${next.date})`:''}`:'belum ada yang dijadwalkan']]
 const rows=buildTimeline(today,nowMin)
 return <div className="mx-auto max-w-6xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">{greet}{name?`, ${name}`:''}</h1><p className="text-sm text-muted">{d.toLocaleDateString('id-ID',{dateStyle:'full'})}</p></div>
  <div className="flex gap-2"><Link to="/jadwal" className="btn">Rencanakan Hariku</Link><Link to="/fokus" className="btn !bg-brand">Mulai Fokus</Link></div></div>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{stats.map(([l,v,s],i)=><div key={l} className={`card !p-4 ${i===4?'col-span-2 lg:col-span-1':''}`}><p className="text-xs text-muted">{l}</p>
   {dataReady?<><p className="mt-1 text-xl font-semibold">{v}</p><p className="truncate text-xs text-muted">{s}</p></>:<><Skeleton className="mt-2 h-6 w-16"/><Skeleton className="mt-2 h-3 w-24"/></>}</div>)}</div>
  <div className="grid gap-6 lg:grid-cols-3"><section className="card lg:col-span-2"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Linimasa hari ini</h2><Link to="/jadwal" className="text-xs text-accent underline">Tambah blok</Link></div>
   {!dataReady?<Skeleton className="h-40 w-full"/>:today.length===0?<EmptyState title="Hari ini masih kosong" text="Buat blok waktu pertamamu untuk mulai merencanakan hari." action={<Link to="/jadwal" className="btn inline-block">Buat Blok Waktu Pertamamu</Link>}/>:
   <ol className="space-y-2">{rows.map((r,i)=>r.kind==='now'?<li key={i} className="flex items-center gap-2 text-xs font-medium text-red-500" aria-label={`Sekarang ${r.at}`}><span className="w-12">{r.at}</span><span className="h-px flex-1 bg-red-400"/>Sekarang</li>
    :r.kind==='free'?<li key={i} className="flex gap-2 text-xs text-muted"><span className="w-12">{r.from}</span><span className="flex-1 rounded-lg border border-dashed border-strong px-3 py-1">Waktu luang {Math.floor(r.min/60)?`${Math.floor(r.min/60)} j `:''}{r.min%60?`${r.min%60} mnt`:''} · {r.from}–{r.to}</span></li>
    :<li key={r.b.id} className="flex gap-2 text-sm"><span className="w-12 text-xs text-muted">{r.b.start}</span><div className={`flex flex-1 justify-between rounded-xl bg-brand-violet/10 px-3 py-2 ${r.b.done?'line-through opacity-60':''}`}><span>{r.b.title}<span className="ml-2 text-xs text-muted">{r.b.start}–{r.b.end}</span></span>{r.b.done?<Badge tone="green">Selesai</Badge>:toMin(r.b.start)<=nowMin&&nowMin<toMin(r.b.end)?<Badge tone="violet">Berlangsung</Badge>:<span className="text-xs text-muted">{duration(r.b)} mnt</span>}</div></li>)}</ol>}</section>
   <div className="space-y-6"><section className="card"><h2 className="mb-2 font-semibold">Progres harian</h2>{!dataReady?<Skeleton className="h-10 w-full"/>:planned===0?<p className="text-sm text-muted">Belum ada blok terjadwal hari ini.</p>:<>
    <div className="h-2 rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-brand-violet" style={{width:`${pct}%`}}/></div>
    <p className="mt-2 text-sm font-medium">{pct}%</p><p className="text-xs text-muted">Durasi blok yang ditandai selesai dibagi durasi seluruh blok hari ini ({done}/{planned} menit). Ini bukan waktu kerja terukur.</p></>}</section>
   <section className="card"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Tugas prioritas</h2><Link to="/tugas" className="text-xs text-accent underline">Semua tugas</Link></div>
    {!dataReady?<Skeleton className="h-20 w-full"/>:open.length===0?<p className="text-sm text-muted">Tidak ada tugas yang tertunda.</p>:<ul className="space-y-2">{open.map(t=><li key={t.id} className="flex items-center justify-between gap-2 text-sm"><span className="truncate">{t.title}</span><span className="flex shrink-0 gap-1"><Badge tone={t.priority==='high'?'red':t.priority==='mid'?'amber':'slate'}>{t.priority==='high'?'Tinggi':t.priority==='mid'?'Sedang':'Rendah'}</Badge><span className="text-xs text-muted">{t.due?`${t.due} · `:''}{t.est} mnt</span></span></li>)}</ul>}</section></div></div></div>}
