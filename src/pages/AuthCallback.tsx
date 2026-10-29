import {useEffect,useState} from 'react'
import {Link,Navigate} from 'react-router-dom'
import {useAuth} from '../lib/auth'
import {supabase} from '../lib/supabase'
export default function AuthCallback(){
 const {user,loading}=useAuth();const [err,setErr]=useState<string|null>(null);const [busy,setBusy]=useState(true)
 useEffect(()=>{if(!supabase){setBusy(false);return}
  const q=new URLSearchParams(window.location.search),h=new URLSearchParams(window.location.hash.slice(1))
  if(q.get('error_description')||h.get('error_description')){setErr('Tautan tidak valid atau kedaluwarsa. Masuk, atau minta tautan baru.');setBusy(false);return}
  const code=q.get('code')
  if(code)supabase.auth.exchangeCodeForSession(code).then(({error})=>{if(error)setErr('Verifikasi gagal. Coba lagi.');setBusy(false)});else setBusy(false)},[])
 if(user)return <Navigate to="/" replace/>
 if(loading||busy)return <p role="status" className="p-8 text-sm text-muted">Memverifikasi…</p>
 return <div className="flex min-h-screen items-center justify-center p-4"><div className="card max-w-sm space-y-3"><h1 className="text-lg font-bold">{err?'Verifikasi gagal':'Tidak ada sesi aktif'}</h1><p className="text-sm text-muted">{err??'Silakan masuk untuk melanjutkan.'}</p><Link to="/login" className="btn inline-block">Ke halaman masuk</Link></div></div>}
