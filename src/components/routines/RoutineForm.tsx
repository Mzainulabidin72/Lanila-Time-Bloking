import {useEffect,useState} from 'react'
import {AlertTriangle,ArrowDown,ArrowUp,Plus,X} from 'lucide-react'
import {useStore} from '../../stores/useStore'
import {Routine,RoutineBlock,ROUTINE_CATEGORIES,ROUTINE_COLOR,WEEKDAYS,overlapPairs,validateRoutine} from '../../lib/routines'
import {fmt,toMin} from '../../lib/time'
import {CATS} from '../../lib/categories'
import {PROJECT_COLORS} from '../../lib/projects'
import {Button,Field,Modal} from '../ui'
import {useToast} from '../Toast'
const newRow=(after?:string):RoutineBlock=>{const s=after??'09:00';return {id:crypto.randomUUID(),title:'',start:s,end:fmt(Math.min(toMin(s)+60,1439)),category:CATS[0]}}
export default function RoutineForm({open,routine,onClose}:{open:boolean;routine:Routine|null;onClose:()=>void}){
 const {projects,addRoutine,updateRoutine}=useStore();const toast=useToast()
 const [name,setName]=useState('');const [desc,setDesc]=useState('');const [cat,setCat]=useState('');const [color,setColor]=useState(ROUTINE_COLOR);const [days,setDays]=useState<number[]>([]);const [sd,setSd]=useState('');const [ed,setEd]=useState('');const [active,setActive]=useState(true)
 const [rows,setRows]=useState<RoutineBlock[]>([]);const [err,setErr]=useState<string|null>(null);const [busy,setBusy]=useState(false)
 useEffect(()=>{if(open){setName(routine?.name??'');setDesc(routine?.description??'');setCat(routine?.category??'');setColor(routine?.color??ROUTINE_COLOR);setDays(routine?.weekdays??[]);setSd(routine?.startDate??'');setEd(routine?.endDate??'');setActive(routine?.active!==false);setRows(routine?.blocks.map(b=>({...b}))??[newRow()]);setErr(null);setBusy(false)}},[open,routine])
 const upd=(id:string,p:Partial<RoutineBlock>)=>setRows(rs=>rs.map(r=>r.id===id?{...r,...p}:r))
 const move=(i:number,d:number)=>setRows(rs=>{const j=i+d;if(j<0||j>=rs.length)return rs;const c=[...rs];[c[i],c[j]]=[c[j],c[i]];return c})
 const pairs=overlapPairs(rows)
 const submit=(e:React.FormEvent)=>{e.preventDefault();const v=validateRoutine({name,blocks:rows,startDate:sd,endDate:ed});if(v){setErr(v);return};setBusy(true)
  const base={name:name.trim(),description:desc.trim()||undefined,category:cat||undefined,color,active,weekdays:days,startDate:sd||undefined,endDate:ed||undefined,
   blocks:rows.map(r=>({...r,title:r.title.trim(),description:r.description?.trim()||undefined,projectId:r.projectId||undefined}))}
  try{if(routine)updateRoutine({...routine,...base});else addRoutine({id:crypto.randomUUID(),...base});toast(routine?'Rutinitas diperbarui':'Rutinitas dibuat');onClose()}
  catch{setErr('Gagal menyimpan. Isianmu masih ada, coba lagi.');setBusy(false)}}
 return <Modal open={open} onClose={onClose} title={routine?'Ubah rutinitas':'Rutinitas baru'}>{open&&<form onSubmit={submit} className="space-y-4" noValidate>
  <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-1 text-sm font-semibold">Informasi dasar</legend>
   <div className="sm:col-span-2"><Field label="Nama rutinitas" id="r-name"><input id="r-name" autoFocus className="inp" value={name} onChange={e=>setName(e.target.value)}/></Field></div>
   <div className="sm:col-span-2"><Field label="Deskripsi (opsional)" id="r-desc"><input id="r-desc" className="inp" value={desc} onChange={e=>setDesc(e.target.value)}/></Field></div>
   <Field label="Kategori" id="r-cat"><select id="r-cat" className="inp" value={cat} onChange={e=>setCat(e.target.value)}><option value="">Tanpa kategori</option>{ROUTINE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
   <div role="group" aria-label="Warna rutinitas"><p className="mb-1 text-sm font-medium">Warna</p><div className="flex flex-wrap gap-2">{PROJECT_COLORS.map(c=><button key={c} type="button" aria-label={`Warna ${c}`} aria-pressed={color===c} onClick={()=>setColor(c)} className={`h-7 w-7 rounded-full focus-visible:outline focus-visible:outline-2 ${color===c?'ring-2 ring-ink ring-offset-2 ring-offset-surface':''}`} style={{background:c}}/>)}</div></div></fieldset>
  <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-1 text-sm font-semibold">Jadwal</legend>
   <div role="group" aria-label="Hari berulang" className="sm:col-span-2"><p className="mb-1 text-sm font-medium">Berulang pada hari <span className="font-normal text-muted">(kosong = semua hari)</span></p><div className="flex flex-wrap gap-1">{WEEKDAYS.map(([d,l])=><button key={d} type="button" aria-pressed={days.includes(d)} onClick={()=>setDays(x=>x.includes(d)?x.filter(y=>y!==d):[...x,d])} className={`rounded-lg border px-3 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 ${days.includes(d)?'border-transparent bg-brand-violet text-white':'border-strong text-muted hover:bg-elevated'}`}>{l}</button>)}</div></div>
   <Field label="Berlaku mulai (opsional)" id="r-sd"><input id="r-sd" type="date" className="inp" value={sd} onChange={e=>setSd(e.target.value)}/></Field>
   <Field label="Berlaku sampai (opsional)" id="r-ed"><input id="r-ed" type="date" className="inp" value={ed} onChange={e=>setEd(e.target.value)}/></Field>
   <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Rutinitas aktif (hanya yang aktif bisa diterapkan)</label></fieldset>
  <fieldset><legend className="mb-1 text-sm font-semibold">Aktivitas ({rows.length})</legend>
   <ul className="space-y-2">{rows.map((r,i)=>{const dur=toMin(r.end)-toMin(r.start);return <li key={r.id} className="space-y-2 rounded-xl border border-line p-2">
    <div className="flex items-center gap-2"><span className="w-5 text-center text-xs text-muted" aria-hidden>{i+1}</span><label className="sr-only" htmlFor={`rt${r.id}`}>Nama aktivitas {i+1}</label><input id={`rt${r.id}`} placeholder="Nama aktivitas" className="inp" value={r.title} onChange={e=>upd(r.id,{title:e.target.value})}/>
     <button type="button" aria-label={`Naikkan aktivitas ${i+1}`} title="Naikkan" disabled={i===0} onClick={()=>move(i,-1)} className="rounded-lg p-2 text-muted hover:bg-elevated disabled:opacity-30"><ArrowUp size={16}/></button>
     <button type="button" aria-label={`Turunkan aktivitas ${i+1}`} title="Turunkan" disabled={i===rows.length-1} onClick={()=>move(i,1)} className="rounded-lg p-2 text-muted hover:bg-elevated disabled:opacity-30"><ArrowDown size={16}/></button>
     <button type="button" aria-label={`Hapus aktivitas ${i+1}`} title="Hapus" onClick={()=>setRows(rs=>rs.filter(x=>x.id!==r.id))} className="rounded-lg p-2 text-muted hover:bg-elevated"><X size={16}/></button></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
     <div><label className="text-xs text-muted" htmlFor={`rs${r.id}`}>Mulai</label><input id={`rs${r.id}`} type="time" className="inp" value={r.start} onChange={e=>upd(r.id,{start:e.target.value})}/></div>
     <div><label className="text-xs text-muted" htmlFor={`re${r.id}`}>Selesai</label><input id={`re${r.id}`} type="time" className="inp" value={r.end} onChange={e=>upd(r.id,{end:e.target.value})}/></div>
     <div><label className="text-xs text-muted" htmlFor={`rd${r.id}`}>Durasi (mnt)</label><input id={`rd${r.id}`} type="number" min={5} step={5} className="inp" value={dur>0?dur:''} onChange={e=>{const v=Number(e.target.value);if(v>0)upd(r.id,{end:fmt(Math.min(toMin(r.start)+v,1439))})}}/></div>
     <div><label className="text-xs text-muted" htmlFor={`rc${r.id}`}>Kategori blok</label><select id={`rc${r.id}`} className="inp" value={r.category} onChange={e=>upd(r.id,{category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div></div>
    <div className="grid gap-2 sm:grid-cols-2"><div><label className="sr-only" htmlFor={`rx${r.id}`}>Deskripsi aktivitas {i+1}</label><input id={`rx${r.id}`} placeholder="Deskripsi (opsional)" className="inp" value={r.description??''} onChange={e=>upd(r.id,{description:e.target.value})}/></div>
     <div><label className="sr-only" htmlFor={`rp${r.id}`}>Proyek aktivitas {i+1}</label><select id={`rp${r.id}`} className="inp" value={r.projectId??''} onChange={e=>upd(r.id,{projectId:e.target.value||undefined})}><option value="">Tanpa proyek</option>{projects.filter(p=>p.status!=='archived'||p.id===r.projectId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div></li>})}</ul>
   {pairs.length>0&&<div role="status" className="mt-2 rounded-xl border border-amber-500 bg-amber-500/10 p-2 text-xs"><p className="flex items-center gap-1 font-medium"><AlertTriangle size={12}/>Waktu tumpang tindih</p><ul className="list-disc pl-5">{pairs.map(([a,b])=><li key={`${a}-${b}`}>Aktivitas {a+1} ({rows[a].title||'tanpa nama'}) dan {b+1} ({rows[b].title||'tanpa nama'})</li>)}</ul><p className="text-muted">Boleh disimpan, tetapi saat diterapkan blok-blok ini akan bentrok satu sama lain.</p></div>}
   <div className="mt-2 flex flex-wrap gap-2"><Button type="button" variant="ghost" className="inline-flex items-center gap-1 !py-1.5 text-xs" onClick={()=>setRows(rs=>[...rs,newRow(rs.length?rs[rs.length-1].end:undefined)])}><Plus size={12}/>Tambah aktivitas</Button>
    <Button type="button" variant="ghost" className="!py-1.5 text-xs" onClick={()=>setRows(rs=>[...rs].sort((a,b)=>a.start.localeCompare(b.start)))}>Urutkan berdasarkan waktu</Button></div></fieldset>
  {err&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}
  <div className="flex gap-2"><Button disabled={busy}>{busy?'Menyimpan…':routine?'Simpan perubahan':'Simpan rutinitas'}</Button><Button type="button" variant="ghost" onClick={onClose}>Batal</Button></div></form>}</Modal>}
