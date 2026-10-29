import {useNavigate} from 'react-router-dom'
import {useAuth} from '../lib/auth'
import {isCloud} from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'
import {Button,Field} from '../components/ui'
import {useStore} from '../stores/useStore'
export default function Settings(){
 const {user,signOut}=useAuth();const {prefs,setPrefs}=useStore();const go=useNavigate()
 return <div className="mx-auto max-w-2xl space-y-4"><h1 className="text-2xl font-bold">Pengaturan</h1>
  <section className="card space-y-2"><h2 className="font-semibold">Tema</h2><p className="text-sm text-muted">Pilih Terang, Gelap, atau Sistem (mengikuti pengaturan perangkat). Pilihan tersimpan di browser ini.</p><ThemeToggle/></section>
  <section className="card space-y-2"><h2 className="font-semibold">Jam kerja (rentang jadwal)</h2><p className="text-sm text-muted">Dipakai untuk rentang timeline dan perhitungan waktu kosong di Jadwal Saya. Tersimpan di browser ini.</p>
   <div className="flex gap-3"><Field label="Mulai" id="sh"><select id="sh" className="inp" value={prefs.startHour} onChange={e=>{const v=Number(e.target.value);setPrefs({startHour:v,endHour:Math.max(prefs.endHour,v+1)})}}>{Array.from({length:23},(_,h)=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select></Field>
    <Field label="Selesai" id="eh"><select id="eh" className="inp" value={prefs.endHour} onChange={e=>setPrefs({...prefs,endHour:Number(e.target.value)})}>{Array.from({length:24-prefs.startHour},(_,i)=>prefs.startHour+1+i).map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select></Field></div></section>
  <section className="card space-y-2"><h2 className="font-semibold">Akun</h2>
   <p className="text-sm text-muted">{user?`Masuk sebagai ${user.email}`:isCloud?'Belum masuk.':'Mode lokal: Supabase belum dikonfigurasi, data hanya tersimpan di browser ini.'}</p>
   {user&&<Button variant="ghost" onClick={async()=>{await signOut();go('/login',{replace:true})}}>Keluar</Button>}</section></div>}
