import {format} from 'date-fns'
import {Play,Pencil} from 'lucide-react'
import {useStore} from '../../stores/useStore'
import {Routine,WEEKDAYS,isActive,routineStats} from '../../lib/routines'
import {duration} from '../../lib/time'
import {fmtDur} from '../../lib/schedule'
import {Badge,Button,Modal} from '../ui'
export default function RoutineDetail({routine:r,onClose,onApply,onEdit}:{routine:Routine|null;onClose:()=>void;onApply:(r:Routine)=>void;onEdit:(r:Routine)=>void}){
 const {projects}=useStore();const st=r?routineStats(r):null
 return <Modal open={!!r} onClose={onClose} title="Detail rutinitas">{r&&st&&<div className="space-y-3">
  <div className="border-l-4 pl-3" style={{borderColor:r.color??'#7445FF'}}><p className="text-lg font-semibold">{r.name}</p>{r.description&&<p className="text-sm text-muted">{r.description}</p>}</div>
  <div className="flex flex-wrap items-center gap-1">{r.category&&<Badge tone="violet">{r.category}</Badge>}<Badge tone={isActive(r)?'green':'slate'}>{isActive(r)?'Aktif':'Nonaktif'}</Badge>{r.weekdays.length===0?<Badge>Semua hari</Badge>:WEEKDAYS.filter(([d])=>r.weekdays.includes(d)).map(([d,l])=><Badge key={d}>{l}</Badge>)}</div>
  <p className="text-xs text-muted">{st.count} aktivitas · total {fmtDur(st.totalMin)}{st.start&&` · ${st.start}–${st.end}`}{(r.startDate||r.endDate)&&` · berlaku ${r.startDate??'…'} s/d ${r.endDate??'…'}`}{r.lastAppliedAt&&` · terakhir diterapkan ${format(r.lastAppliedAt,'d MMM yyyy')}`}</p>
  <ol className="relative ml-2 space-y-3 border-l-2 border-line pl-4" aria-label="Urutan aktivitas">{r.blocks.map(b=>{const p=projects.find(x=>x.id===b.projectId);return <li key={b.id} className="relative">
   <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full" style={{background:r.color??'#7445FF'}} aria-hidden/>
   <p className="text-xs text-muted">{b.start}–{b.end} · {fmtDur(Math.max(0,duration(b)))}</p><p className="text-sm font-medium">{b.title}</p>
   <p className="text-xs text-muted">{b.category}{p&&` · Proyek: ${p.name}`}</p>{b.description&&<p className="text-xs">{b.description}</p>}</li>})}</ol>
  <div className="flex flex-wrap gap-2"><Button className="inline-flex items-center gap-1" disabled={!isActive(r)} title={isActive(r)?'':'Aktifkan rutinitas dulu'} onClick={()=>onApply(r)}><Play size={14}/>Terapkan Rutinitas</Button><Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>onEdit(r)}><Pencil size={14}/>Ubah</Button><Button variant="ghost" onClick={onClose}>Tutup</Button></div></div>}</Modal>}
