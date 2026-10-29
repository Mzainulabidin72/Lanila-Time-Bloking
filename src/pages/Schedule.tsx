import {useEffect,useState} from 'react'
import {ChevronLeft,ChevronRight,Plus,Search,X} from 'lucide-react'
import {addDays,format,parseISO} from 'date-fns'
import {id as idl} from 'date-fns/locale'
import {useStore,Task} from '../stores/useStore'
import {Block,todayStr,weekDates,toMin,fmt} from '../lib/time'
import {summarize,fmtDur} from '../lib/schedule'
import {CATS} from '../lib/categories'
import {Button,Badge} from '../components/ui'
import Grid from '../components/schedule/Grid'
import BlockForm,{Draft} from '../components/schedule/BlockForm'
import BlockDetail from '../components/schedule/BlockDetail'
const shift=(d:string,n:number)=>format(addDays(parseISO(d),n),'yyyy-MM-dd')
export default function Schedule(){
 const {blocks,tasks,prefs}=useStore()
 const [date,setDate]=useState(todayStr());const [view,setView]=useState<'day'|'week'>('day')
 const [draft,setDraft]=useState<Draft|null>(null);const [formOpen,setFormOpen]=useState(false);const [sel,setSel]=useState<string|null>(null)
 const [q,setQ]=useState('');const [cat,setCat]=useState('');const [tk,setTk]=useState('');const [st,setSt]=useState<'all'|'open'|'done'>('all')
 const [now,setNow]=useState(Date.now());useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(i)},[])
 const nd=new Date(now),nowMin=nd.getHours()*60+nd.getMinutes(),today=todayStr()
 const dates=view==='day'?[date]:weekDates(date)
 const filtered=blocks.filter(b=>(!cat||b.category===cat)&&(!tk||b.taskId===tk)&&(st==='all'||(st==='done')===b.done)&&(!q.trim()||b.title.toLowerCase().includes(q.trim().toLowerCase())))
 const vis=filtered.filter(b=>dates.includes(b.date))
 const winS=prefs.startHour*60,winE=prefs.endHour*60
 const startMin=vis.length?Math.min(winS,Math.floor(Math.min(...vis.map(b=>toMin(b.start)))/60)*60):winS
 const endMin=vis.length?Math.max(winE,Math.min(1440,Math.ceil(Math.max(...vis.map(b=>toMin(b.end)))/60)*60)):winE
 const sum=summarize(filtered,dates,winS,winE)
 const label=view==='day'?format(parseISO(date),'EEEE, d MMMM yyyy',{locale:idl}):`${format(parseISO(dates[0]),'d MMM',{locale:idl})} – ${format(parseISO(dates[6]),'d MMM yyyy',{locale:idl})}`
 const step=view==='day'?1:7,filtersOn=!!(q||cat||tk||st!=='all')
 const openNew=(o:Partial<Draft>={})=>{setDraft({date,...o});setFormOpen(true)}
 const edit=(b:Block)=>{setSel(null);setDraft(b);setFormOpen(true)}
 const cards=[['Total Terjadwal',fmtDur(sum.total),'gabungan durasi blok (tumpang tindih dihitung sekali)'],['Jumlah Blok',String(sum.count),view==='day'?'pada hari ini':'pada minggu ini'],['Waktu Kosong',fmtDur(sum.available),`dalam jam kerja ${fmt(winS)}–${fmt(winE)}${view==='week'?' × 7 hari':''}`],['Konflik Jadwal',String(sum.conflicts),'pasangan blok yang bertabrakan']]
 return <div className="mx-auto max-w-7xl space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Jadwal Saya</h1><p className="text-sm text-muted">Atur waktumu, satu blok dalam satu waktu.</p></div>
   <div className="flex gap-2"><Button variant="ghost" onClick={()=>setDate(today)}>Hari Ini</Button><Button className="inline-flex items-center gap-1" onClick={()=>openNew()}><Plus size={16}/>Tambah Blok</Button></div></div>
  <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Navigasi kalender">
   <Button variant="ghost" aria-label={view==='day'?'Hari sebelumnya':'Minggu sebelumnya'} title="Sebelumnya" onClick={()=>setDate(shift(date,-step))}><ChevronLeft size={16}/></Button>
   <Button variant="ghost" aria-label={view==='day'?'Hari berikutnya':'Minggu berikutnya'} title="Berikutnya" onClick={()=>setDate(shift(date,step))}><ChevronRight size={16}/></Button>
   <input type="date" aria-label="Pilih tanggal" className="inp w-auto" value={date} onChange={e=>e.target.value&&setDate(e.target.value)}/>
   <p className="min-w-0 flex-1 text-sm font-semibold capitalize" aria-live="polite">{label}</p>
   <div role="group" aria-label="Tampilan kalender" className="flex gap-1">{(['day','week'] as const).map(v=><Button key={v} variant={view===v?'primary':'ghost'} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='day'?'Hari':'Minggu'}</Button>)}</div></div>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([l,v,s])=><div key={l} className="card !p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 text-xl font-semibold">{v}{l==='Konflik Jadwal'&&sum.conflicts>0&&<span className="ml-2 align-middle"><Badge tone="amber">Perlu dicek</Badge></span>}</p><p className="text-xs text-muted">{s}</p></div>)}</div>
  <div className="flex flex-wrap items-center gap-2">
   <div className="relative min-w-[10rem] flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input aria-label="Cari blok" placeholder="Cari judul blok" className="inp pl-8" value={q} onChange={e=>setQ(e.target.value)}/></div>
   <select aria-label="Filter kategori" className="inp w-auto" value={cat} onChange={e=>setCat(e.target.value)}><option value="">Semua kategori</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
   <select aria-label="Filter tugas" className="inp w-auto max-w-[12rem]" value={tk} onChange={e=>setTk(e.target.value)}><option value="">Semua tugas</option>{tasks.map((t:Task)=><option key={t.id} value={t.id}>{t.title}</option>)}</select>
   <select aria-label="Filter status" className="inp w-auto" value={st} onChange={e=>setSt(e.target.value as typeof st)}><option value="all">Semua status</option><option value="open">Belum selesai</option><option value="done">Selesai</option></select>
   {filtersOn&&<Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>{setQ('');setCat('');setTk('');setSt('all')}}><X size={14}/>Reset</Button>}</div>
  <Grid dates={dates} selected={date} blocks={filtered} tasks={tasks} startMin={startMin} endMin={endMin} today={today} nowMin={nowMin} periodLabel={view==='day'?'hari ini':'minggu ini'}
   onSelectBlock={b=>setSel(b.id)} onSlot={(d,m)=>{setDraft({date:d,start:fmt(m),end:fmt(Math.min(m+60,1439))});setFormOpen(true)}} onPickDate={d=>{setDate(d);setView('day')}} onAdd={()=>openNew()}/>
  <BlockForm open={formOpen} draft={draft} onClose={()=>setFormOpen(false)}/>
  <BlockDetail block={blocks.find(b=>b.id===sel)??null} onClose={()=>setSel(null)} onEdit={edit}/></div>}
