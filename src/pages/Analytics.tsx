import {useState} from 'react'
import {useStore} from '../stores/useStore'
import {Range,analyze,daysIn,presetRange} from '../lib/analytics'
import {todayStr} from '../lib/time'
import {fmtDur} from '../lib/schedule'
import {catColor} from '../lib/categories'
import {fmtSec} from '../lib/focusTimer'
import {Button,EmptyState} from '../components/ui'
type P='7d'|'30d'|'month'|'custom'
function Bars({rows,color}:{rows:{key:string;min:number}[];color:(k:string)=>string}){
 const total=rows.reduce((a,r)=>a+r.min,0)
 return <ul className="space-y-2">{rows.map(r=><li key={r.key}><div className="flex justify-between text-xs"><span className="truncate">{r.key}</span><span className="shrink-0 text-muted">{fmtDur(r.min)} · {Math.round(r.min/total*100)}%</span></div>
  <div className="mt-0.5 h-2 rounded-full bg-line"><div className="h-2 rounded-full" style={{width:`${r.min/total*100}%`,background:color(r.key)}}/></div></li>)}</ul>}
export default function Analytics(){
 const {blocks,tasks,focus,projects}=useStore();const today=todayStr()
 const [preset,setPreset]=useState<P>('7d');const [range,setRange]=useState<Range>(presetRange('7d',today))
 const pick=(p:Exclude<P,'custom'>)=>{setPreset(p);setRange(presetRange(p,today))}
 const bad=range.from>range.to,a=analyze({blocks,tasks,sessions:focus.sessions,projects},bad?{from:range.to,to:range.to}:range)
 const maxDay=Math.max(1,...a.perDay.map(d=>d.planned)),pc=new Map(projects.map(p=>[p.name,p.color]))
 const cards=[['Terencana',fmtDur(a.plannedMin),'total durasi blok terjadwal'],['Selesai (terjadwal)',fmtDur(a.completedMin),a.plannedMin?`${Math.round(a.completedMin/a.plannedMin*100)}% dari terencana, berdasarkan blok yang ditandai selesai`:'blok yang ditandai selesai'],['Fokus Aktual',fmtSec(a.focusSec),`terukur dari sesi fokus · rata-rata ${a.avgFocusMin} mnt/hari`],['Tugas Selesai',a.taskRate?`${a.taskRate.pct}%`:'–',a.taskRate?`${a.taskRate.done} dari ${a.taskRate.total} tugas yang tenggatnya dalam rentang`:'tidak ada tugas bertenggat dalam rentang']]
 return <div className="mx-auto max-w-5xl space-y-4">
  <div><h1 className="text-2xl font-bold">Analitik</h1><p className="text-sm text-muted">Wawasan dari jadwal, tugas, dan sesi fokusmu yang sebenarnya.</p></div>
  <div className="flex flex-wrap items-end gap-2" role="group" aria-label="Rentang tanggal">
   {([['7d','7 hari'],['30d','30 hari'],['month','Bulan ini']] as const).map(([k,l])=><Button key={k} variant={preset===k?'primary':'ghost'} aria-pressed={preset===k} onClick={()=>pick(k)}>{l}</Button>)}
   <label className="text-xs text-muted">Dari<input type="date" className="inp mt-0.5 w-auto" value={range.from} onChange={e=>{setPreset('custom');setRange({...range,from:e.target.value})}}/></label>
   <label className="text-xs text-muted">Sampai<input type="date" className="inp mt-0.5 w-auto" value={range.to} onChange={e=>{setPreset('custom');setRange({...range,to:e.target.value})}}/></label></div>
  {bad&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">Tanggal awal harus sebelum tanggal akhir.</p>}
  {daysIn(range).length===366&&<p className="text-xs text-muted">Rentang dibatasi 366 hari.</p>}
  {!bad&&!a.hasData?<EmptyState title="Belum ada data pada rentang ini" text="Tambahkan blok waktu, tugas bertenggat, atau selesaikan sesi fokus agar analitik muncul. Tidak ada angka yang diisi otomatis."/>:!bad&&<>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([l,v,s])=><div key={l} className="card !p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 text-xl font-semibold">{v}</p><p className="text-xs text-muted">{s}</p></div>)}</div>
  <section className="card space-y-2"><h2 className="font-semibold">Terencana vs Selesai per hari</h2>
   <div className="flex h-32 items-end gap-1" role="img" aria-label={`Grafik harian: terencana ${fmtDur(a.plannedMin)}, selesai ${fmtDur(a.completedMin)} selama ${a.days} hari. Data lengkap ada di tabel di bawah.`}>
    {a.perDay.map(d=><div key={d.date} title={`${d.date}: terencana ${fmtDur(d.planned)}, selesai ${fmtDur(d.done)}`} className="flex h-full flex-1 flex-col justify-end"><div className="flex flex-col justify-end rounded-t border border-strong bg-elevated" style={{height:`${d.planned/maxDay*100}%`}}><div className="rounded-t bg-brand-violet" style={{height:`${d.planned?d.done/d.planned*100:0}%`}}/></div></div>)}</div>
   <div className="flex gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded border border-strong bg-elevated"/>Terencana</span><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-brand-violet"/>Selesai (terjadwal)</span><span className="ml-auto">{a.perDay[0]?.date} → {a.perDay[a.perDay.length-1]?.date}</span></div>
   <details className="text-xs"><summary className="cursor-pointer text-accent">Lihat data tabel</summary><div className="mt-2 max-h-48 overflow-auto"><table className="w-full text-left"><thead><tr><th className="py-1">Tanggal</th><th>Terencana</th><th>Selesai</th></tr></thead><tbody>{a.perDay.map(d=><tr key={d.date} className="border-t border-line"><td className="py-1">{d.date}</td><td>{fmtDur(d.planned)}</td><td>{fmtDur(d.done)}</td></tr>)}</tbody></table></div></details></section>
  <div className="grid gap-4 md:grid-cols-2">
   <section className="card space-y-2"><h2 className="font-semibold">Distribusi waktu per kategori</h2>{a.byCategory.length===0?<p className="text-sm text-muted">Belum ada blok.</p>:<Bars rows={a.byCategory} color={catColor}/>}</section>
   <section className="card space-y-2"><h2 className="font-semibold">Distribusi waktu per proyek</h2>{a.byProject.length===0?<p className="text-sm text-muted">Belum ada blok.</p>:<Bars rows={a.byProject} color={k=>pc.get(k)??'#64748B'}/>}</section></div>
  <section className="card space-y-2"><h2 className="font-semibold">Estimasi vs aktual (tugas dengan sesi fokus)</h2>
   {a.estVsActual.length===0?<p className="text-sm text-muted">Belum ada sesi fokus yang terhubung ke tugas pada rentang ini.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs text-muted"><th className="py-1">Tugas</th><th>Estimasi</th><th>Fokus aktual</th></tr></thead><tbody>{a.estVsActual.map(t=><tr key={t.id} className="border-t border-line"><td className="py-1 pr-2">{t.title}</td><td>{t.est} mnt</td><td>{t.actualMin} mnt</td></tr>)}</tbody></table></div>}
   <p className="text-xs text-muted">Waktu aktual hanya mencakup sesi fokus yang dipilih untuk tugas tersebut; kerja di luar Mode Fokus tidak terukur.</p></section></>}</div>}
