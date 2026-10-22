import {useEffect,useState} from 'react'
import {useStore} from '../stores/useStore'
import {remainingMs} from '../lib/time'
import {Button} from '../components/ui'
export default function Focus(){
 const {focus,startFocus,pauseFocus,resumeFocus,stopFocus}=useStore();const [,tick]=useState(0);const [m,setM]=useState(25)
 useEffect(()=>{const i=setInterval(()=>tick(x=>x+1),500);return()=>clearInterval(i)},[])
 const active=!!focus.sessionId,paused=focus.pausedLeft!=null
 const left=focus.endsAt?remainingMs(focus.endsAt):paused?focus.pausedLeft!:m*60000 // always derived from timestamps
 useEffect(()=>{if(focus.endsAt&&left===0)stopFocus()},[left,focus.endsAt,stopFocus])
 const s=Math.ceil(left/1000),mm=String(Math.floor(s/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0')
 const today=focus.sessions.filter(x=>new Date(x.at).toDateString()===new Date().toDateString()).reduce((a,x)=>a+x.minutes,0)
 return <div className="mx-auto max-w-md space-y-4 text-center"><h1 className="text-2xl font-bold">Mode Fokus</h1>
  <div className="card"><p className="text-6xl font-semibold tabular-nums" role="timer" aria-live="off">{mm}:{ss}</p>{paused&&<p className="mt-1 text-xs text-slate-500">Dijeda</p>}
   {!active?<div className="mt-4 flex items-end justify-center gap-2"><label className="text-sm">Menit <input type="number" min={1} max={180} className="inp inline w-20" value={m} onChange={e=>setM(Math.max(1,Number(e.target.value)||25))}/></label><Button onClick={()=>startFocus(m)}>Mulai</Button></div>
   :<div className="mt-4 flex justify-center gap-2">{paused?<Button onClick={resumeFocus}>Lanjut</Button>:<Button variant="ghost" onClick={pauseFocus}>Jeda</Button>}<Button variant="secondary" onClick={stopFocus}>Akhiri</Button></div>}</div>
  <p className="text-sm">Fokus tercatat hari ini: <b>{today} mnt</b> · {focus.sessions.length} sesi</p>
  <p className="text-xs text-slate-500">Waktu dihitung dari cap waktu dan pulih setelah refresh. "Akhiri" mencatat durasi yang benar-benar berjalan (minimal 1 menit). Jeda istirahat belum tersedia. Aplikasi ini tidak memblokir situs lain.</p></div>}
