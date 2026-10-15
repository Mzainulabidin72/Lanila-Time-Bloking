import {useEffect,useState} from 'react'
import {useStore} from '../stores/useStore'
import {remainingMs} from '../lib/time'
export default function Focus(){
 const {focus,startFocus,stopFocus}=useStore();const [,tick]=useState(0);const [m,setM]=useState(25)
 useEffect(()=>{const i=setInterval(()=>tick(x=>x+1),500);return()=>clearInterval(i)},[])
 const left=focus.endsAt?remainingMs(focus.endsAt):m*60000
 useEffect(()=>{if(focus.endsAt&&left===0)stopFocus(true)},[left,focus.endsAt,stopFocus])
 const s=Math.ceil(left/1000),mm=String(Math.floor(s/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0')
 return <div className="mx-auto max-w-md space-y-4 text-center"><h1 className="text-2xl font-bold">Mode Fokus</h1>
  <div className="card"><p className="text-6xl font-semibold tabular-nums" role="timer" aria-live="off">{mm}:{ss}</p>
   {!focus.endsAt?<div className="mt-4 flex items-center justify-center gap-2"><label className="text-sm">Menit <input type="number" min={1} max={180} className="inp inline w-20" value={m} onChange={e=>setM(Math.max(1,Number(e.target.value)||25))}/></label><button className="btn" onClick={()=>startFocus(m)}>Mulai</button></div>
   :<button className="btn mt-4 !bg-slate-500" onClick={()=>stopFocus(false)}>Hentikan</button>}</div>
  <p className="text-sm text-slate-500">Sesi selesai: {focus.sessions.length}. Waktu dihitung dari cap waktu, jadi tetap akurat saat tab tidak aktif. Aplikasi ini tidak memblokir situs lain.</p></div>}
