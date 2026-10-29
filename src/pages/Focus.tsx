import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {Pause,Play,RotateCcw,Settings2,Square,Volume2,VolumeX} from 'lucide-react'
import {useStore} from '../stores/useStore'
import {SessionType,TYPE_LABEL,minutesFor,remainingMs,todayFocusSec,completedFocusToday,streakDays,fmtSec} from '../lib/focusTimer'
import {PRIORITY_LABEL} from '../lib/categories'
import {todayStr} from '../lib/time'
import {fmtDur} from '../lib/schedule'
import {unlockAudio,requestNotifyPermission} from '../lib/notify'
import {Badge,Button,EmptyState,Field,Modal} from '../components/ui'
import {useToast} from '../components/Toast'
import TimerRing from '../components/focus/TimerRing'
const MODES:SessionType[]=['focus','short_break','long_break']
type Confirm={kind:'end'|'reset'|'mode'|'done';mode?:SessionType}|null
export default function Focus(){
 const {focus,tasks,blocks,startSession,pauseFocus,resumeFocus,resetFocus,endSession,dismissSummary,setFocusSettings,setTask}=useStore()
 const toast=useToast();const {active,summary,sessions,settings}=focus
 const [,tick]=useState(0);const [mode,setMode]=useState<SessionType>('focus');const [taskId,setTaskId]=useState('');const [objective,setObjective]=useState('')
 const [cf,setCf]=useState<Confirm>(null);const [setOpen,setSetOpen]=useState(false);const [all,setAll]=useState(false);const [form,setForm]=useState(settings)
 const running=!!active&&active.endsAt!=null,paused=!!active&&active.endsAt==null
 useEffect(()=>{if(!running)return;const i=setInterval(()=>tick(x=>x+1),250);return()=>clearInterval(i)},[running])
 useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.code!=='Space'||e.repeat)return;const el=e.target as HTMLElement|null
  if(el&&(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(el.tagName)||el.isContentEditable))return;if(document.querySelector('dialog[open]'))return
  const st=useStore.getState(),a=st.focus.active;if(!a)return;e.preventDefault();if(a.endsAt!=null)st.pauseFocus();else st.resumeFocus()}
  window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[])
 const now=Date.now(),type=active?.type??mode,plannedMs=active?active.plannedMs:minutesFor(type,settings)*60000
 const left=active?remainingMs(active,now):plannedMs,secs=Math.ceil(left/1000),mm=String(Math.floor(secs/60)).padStart(2,'0'),ss=String(secs%60).padStart(2,'0')
 useEffect(()=>{if(!active)return;const prev=document.title;document.title=`${mm}:${ss} · ${TYPE_LABEL[active.type]}`;return()=>{document.title=prev}},[active,mm,ss])
 const openTasks=tasks.filter(t=>t.status!=='done'),sel=tasks.find(t=>t.id===taskId)
 const todaySec=todayFocusSec(sessions,now),doneToday=completedFocusToday(sessions,now),goalSec=settings.goalMin*60,streak=streakDays(sessions,now)
 const cycle=doneToday%settings.longEvery,status=active?(running?'Berjalan':'Dijeda'):summary?'Selesai':'Siap'
 const todayBlocks=blocks.filter(b=>b.date===todayStr()).sort((a,b)=>a.start.localeCompare(b.start))
 const taskLabel=(id?:string,obj?:string)=>(id&&tasks.find(t=>t.id===id)?.title)||obj||'–'
 const start=(o?:{type?:SessionType;taskId?:string;objective?:string})=>{unlockAudio();const t=o?.type??type;setMode(t)
  startSession({type:t,taskId:t==='focus'?(o?o.taskId:taskId||undefined):undefined,objective:t==='focus'?(o?o.objective:!taskId&&objective.trim()?objective.trim():undefined):undefined})}
 const next:SessionType=summary?(summary.type==='focus'?(doneToday%settings.longEvery===0?'long_break':'short_break'):'focus'):'focus'
 const summaryTask=summary?.taskId?tasks.find(t=>t.id===summary.taskId):undefined
 const doConfirm=()=>{if(!cf)return
  if(cf.kind==='end'){const r=endSession();toast(r?.recorded?`Sesi diakhiri lebih awal. ${fmtSec(r.recorded.actualSec)} tercatat sebagai terputus.`:'Sesi kurang dari 1 menit, jadi tidak dicatat.')}
  if(cf.kind==='reset'){resetFocus();toast('Timer di-reset. Sesi ini tidak dicatat.')}
  if(cf.kind==='mode'&&cf.mode){endSession();setMode(cf.mode);toast('Sesi sebelumnya diakhiri.')}
  if(cf.kind==='done'&&summaryTask){setTask(summaryTask.id,{status:'done'});toast('Tugas ditandai selesai')}
  setCf(null)}
 const toggleSound=async()=>{const on=!settings.sound;setFocusSettings({sound:on});if(!on)return;unlockAudio();const r=await requestNotifyPermission()
  toast(r==='granted'?'Suara dan notifikasi browser aktif':'Suara aktif. Notifikasi browser tidak tersedia, pemberitahuan tampil di dalam aplikasi.')}
 const saveSettings=(e:React.FormEvent)=>{e.preventDefault();const c=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,Math.round(v)||lo))
  setFocusSettings({focusMin:c(form.focusMin,1,180),shortMin:c(form.shortMin,1,60),longMin:c(form.longMin,1,90),goalMin:c(form.goalMin,10,720),longEvery:c(form.longEvery,2,8)});setSetOpen(false);toast('Pengaturan timer disimpan')}
 const hist=[...sessions].sort((a,b)=>b.endedAt-a.endedAt),shown=all?hist.slice(0,100):hist.slice(0,8)
 const num=(k:'focusMin'|'shortMin'|'longMin'|'longEvery'|'goalMin',l:string,id:string)=><Field label={l} id={id}><input id={id} type="number" min={1} className="inp" value={form[k]} onChange={e=>setForm({...form,[k]:Number(e.target.value)})}/></Field>
 return <div className="mx-auto max-w-5xl space-y-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Mode Fokus</h1><p className="text-sm text-muted">Satu hal dalam satu waktu.</p></div>
   <div className="flex items-center gap-2 text-sm text-muted"><span>{new Date().toLocaleDateString('id-ID',{dateStyle:'full'})}</span><Badge tone={active?'violet':summary?'green':'slate'}>{status}</Badge></div></div>
  <section className="card mx-auto max-w-xl space-y-4 text-center" aria-label="Timer fokus">
   <div className="flex flex-wrap justify-center gap-1" role="group" aria-label="Mode sesi">{MODES.map(m=><Button key={m} variant={type===m?'primary':'ghost'} aria-pressed={type===m} className="!px-3 !py-1.5 text-xs" onClick={()=>{if(m===type)return;if(active)setCf({kind:'mode',mode:m});else setMode(m)}}>{TYPE_LABEL[m]} · {minutesFor(m,settings)}m</Button>)}</div>
   <TimerRing fraction={active?left/plannedMs:summary?0:1}>
    <span role="timer" aria-live="off" className="text-5xl font-semibold tabular-nums">{mm}:{ss}</span><span className="mt-1 text-xs text-muted">{summary&&!active?'Selesai':TYPE_LABEL[type]}</span></TimerRing>
   {type==='focus'&&<div className="flex justify-center gap-1" aria-label={`Siklus: ${cycle} dari ${settings.longEvery} sesi menuju istirahat panjang`} role="img">{Array.from({length:settings.longEvery},(_,i)=><span key={i} className={`h-2 w-2 rounded-full ${i<cycle?'bg-accent':'bg-line'}`}/>)}</div>}
   {active?<p className="text-sm">{active.type==='focus'?<>Fokus pada: <b>{taskLabel(active.taskId,active.objective)}</b></>:'Waktunya beristirahat.'}</p>
   :summary?<div className="space-y-1 text-sm"><p className="font-medium">{summary.type==='focus'?`Sesi fokus selesai · ${fmtSec(summary.actualSec)}`:'Istirahat selesai'}</p>{summary.type==='focus'&&<p className="text-muted">Tugas: {taskLabel(summary.taskId,summary.objective)}</p>}
    {summaryTask&&summaryTask.status!=='done'&&<button className="text-xs text-accent underline" onClick={()=>setCf({kind:'done'})}>Tandai tugas ini selesai</button>}</div>
   :type==='focus'&&<div className="mx-auto max-w-sm space-y-2 text-left">
    <Field label="Tugas" id="f-task"><select id="f-task" className="inp" value={taskId} onChange={e=>setTaskId(e.target.value)}><option value="">Tanpa tugas</option>{openTasks.map(t=><option key={t.id} value={t.id}>{t.title} · {PRIORITY_LABEL[t.priority]} · {t.est} mnt</option>)}</select></Field>
    {sel?<p className="text-xs text-muted">Prioritas {PRIORITY_LABEL[sel.priority]} · estimasi {sel.est} mnt{sel.due?` · tenggat ${sel.due}`:''}</p>:<Field label="Tujuan fokus (opsional)" id="f-obj"><input id="f-obj" maxLength={80} placeholder="Contoh: Menulis draf proposal" className="inp" value={objective} onChange={e=>setObjective(e.target.value)}/></Field>}</div>}
   <div className="flex flex-wrap justify-center gap-2">
    {!active&&!summary&&<Button className="inline-flex items-center gap-1" onClick={()=>start()}><Play size={16}/>Mulai</Button>}
    {running&&<><Button className="inline-flex items-center gap-1" onClick={pauseFocus}><Pause size={16}/>Jeda</Button><Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>setCf({kind:'end'})}><Square size={14}/>Akhiri Sesi</Button></>}
    {paused&&<><Button className="inline-flex items-center gap-1" onClick={resumeFocus}><Play size={16}/>Lanjutkan</Button><Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>setCf({kind:'reset'})}><RotateCcw size={14}/>Reset</Button><Button variant="ghost" className="inline-flex items-center gap-1" onClick={()=>setCf({kind:'end'})}><Square size={14}/>Akhiri Sesi</Button></>}
    {!active&&summary&&<><Button className="inline-flex items-center gap-1" onClick={()=>start({type:next,taskId:next==='focus'&&summaryTask&&summaryTask.status!=='done'?summaryTask.id:undefined})}><Play size={16}/>Mulai Sesi Berikutnya ({TYPE_LABEL[next]})</Button><Button variant="ghost" onClick={dismissSummary}>Tutup Ringkasan</Button></>}</div>
   <div className="flex flex-wrap items-center justify-center gap-3 border-t border-line pt-3 text-xs text-muted">
    <button type="button" onClick={toggleSound} aria-pressed={settings.sound} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-elevated focus-visible:outline focus-visible:outline-2">{settings.sound?<Volume2 size={14}/>:<VolumeX size={14}/>}Suara &amp; notifikasi {settings.sound?'aktif':'mati'}</button>
    <button type="button" onClick={()=>{setForm(settings);setSetOpen(true)}} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-elevated focus-visible:outline focus-visible:outline-2"><Settings2 size={14}/>Atur durasi</button>
    <span><kbd className="rounded border border-strong px-1">Spasi</kbd> jeda/lanjut · <kbd className="rounded border border-strong px-1">Esc</kbd> tutup dialog</span></div></section>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
   <div className="card !p-4"><p className="text-xs text-muted">Fokus Hari Ini</p><p className="mt-1 text-xl font-semibold">{fmtDur(Math.round(todaySec/60))}</p><p className="text-xs text-muted">waktu fokus yang benar-benar berjalan</p></div>
   <div className="card !p-4"><p className="text-xs text-muted">Sesi Selesai</p><p className="mt-1 text-xl font-semibold">{doneToday}</p><p className="text-xs text-muted">sesi fokus penuh hari ini</p></div>
   <div className="card !p-4"><p className="text-xs text-muted">Target Harian</p><p className="mt-1 text-xl font-semibold">{fmtDur(settings.goalMin)}</p>
    <div className="mt-1 h-1.5 rounded-full bg-line" role="progressbar" aria-valuenow={Math.min(100,Math.round(todaySec/goalSec*100))} aria-valuemin={0} aria-valuemax={100} aria-label="Progres target harian"><div className="h-1.5 rounded-full bg-brand-violet" style={{width:`${Math.min(100,todaySec/goalSec*100)}%`}}/></div>
    <p className="mt-1 text-xs text-muted">{todaySec>=goalSec?'Target tercapai':`Sisa ${fmtDur(Math.ceil((goalSec-todaySec)/60))}`}</p></div>
   <div className="card !p-4"><p className="text-xs text-muted">Streak Fokus</p><p className="mt-1 text-xl font-semibold">{streak>0?`${streak} hari`:'–'}</p><p className="text-xs text-muted">hari berturut-turut dengan sesi selesai</p></div></div>
  <div className="grid gap-5 lg:grid-cols-2">
   <section className="card space-y-2"><h2 className="font-semibold">Rencana Fokus Hari Ini</h2>
    {todayBlocks.length===0?<EmptyState title="Belum ada jadwal hari ini" text="Atur blok waktu agar fokusmu punya rencana." action={<Link to="/jadwal" className="btn inline-block">Buka Jadwal Saya</Link>}/>
    :<ul className="space-y-2">{todayBlocks.map(b=>{const t=tasks.find(x=>x.id===b.taskId);return <li key={b.id} className="flex items-center gap-2 rounded-xl bg-elevated p-2 text-sm"><div className="min-w-0 flex-1"><p className={`truncate font-medium ${b.done?'line-through opacity-60':''}`}>{b.title}</p><p className="text-xs text-muted">{b.start}–{b.end}{t&&` · ${t.title}`} · Prioritas {PRIORITY_LABEL[b.priority??t?.priority??'mid']}{b.done&&' · Selesai'}</p></div>
     {!b.done&&<Button variant="ghost" className="!px-2 !py-1 text-xs" disabled={!!active} title={active?'Akhiri sesi yang berjalan dulu':'Mulai fokus'} onClick={()=>{setTaskId(b.taskId??'');setObjective(b.taskId?'':b.title);start({type:'focus',taskId:b.taskId,objective:b.taskId?undefined:b.title})}}>Fokus</Button>}</li>})}</ul>}</section>
   <section className="card space-y-2"><div className="flex items-center justify-between"><h2 className="font-semibold">Riwayat Sesi</h2>{hist.length>8&&<button className="text-xs text-accent underline" onClick={()=>setAll(!all)}>{all?'Tampilkan lebih sedikit':'Lihat Semua'}</button>}</div>
    {hist.length===0?<EmptyState title="Belum ada riwayat fokus" text="Selesaikan sesi pertamamu untuk melihatnya di sini."/>
    :<ul className="space-y-1">{shown.map(h=><li key={h.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-elevated"><div className="min-w-0"><p className="truncate">{h.type==='focus'?taskLabel(h.taskId,h.objective):TYPE_LABEL[h.type]}</p><p className="text-xs text-muted">{new Date(h.startedAt).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · {fmtSec(h.actualSec)} · {TYPE_LABEL[h.type]}</p></div><Badge tone={h.status==='completed'?'green':'amber'}>{h.status==='completed'?'Selesai':'Terputus'}</Badge></li>)}</ul>}</section></div>
  <Modal open={!!cf} onClose={()=>setCf(null)} title={cf?.kind==='end'?'Akhiri sesi?':cf?.kind==='reset'?'Reset timer?':cf?.kind==='mode'?'Ganti mode?':'Tandai tugas selesai?'}>{cf&&<form onSubmit={e=>{e.preventDefault();doConfirm()}} className="space-y-3">
   <p className="text-sm">{cf.kind==='end'&&'Waktu yang sudah berjalan dicatat sebagai sesi terputus (minimal 1 menit; kurang dari itu tidak dicatat) dan tidak dihitung sebagai sesi penuh.'}{cf.kind==='reset'&&'Timer kembali ke durasi awal dan sesi ini tidak dicatat.'}{cf.kind==='mode'&&'Sesi yang sedang berjalan akan diakhiri dan dicatat sebagai terputus.'}{cf.kind==='done'&&`“${summaryTask?.title}” akan ditandai selesai. Ini tidak terjadi otomatis setelah sesi fokus.`}</p>
   <div className="flex gap-2"><Button autoFocus>Ya, lanjutkan</Button><Button type="button" variant="ghost" onClick={()=>setCf(null)}>Batal</Button></div></form>}</Modal>
  <Modal open={setOpen} onClose={()=>setSetOpen(false)} title="Atur durasi & target"><form onSubmit={saveSettings} className="grid grid-cols-2 gap-3">{num('focusMin','Fokus (menit)','s-f')}{num('shortMin','Istirahat singkat (menit)','s-s')}{num('longMin','Istirahat panjang (menit)','s-l')}{num('longEvery','Istirahat panjang setiap … sesi','s-e')}{num('goalMin','Target harian (menit)','s-g')}
   <p className="col-span-2 text-xs text-muted">Perubahan berlaku untuk sesi berikutnya, bukan sesi yang sedang berjalan.</p><div className="col-span-2 flex gap-2"><Button>Simpan</Button><Button type="button" variant="ghost" onClick={()=>setSetOpen(false)}>Batal</Button></div></form></Modal></div>}
