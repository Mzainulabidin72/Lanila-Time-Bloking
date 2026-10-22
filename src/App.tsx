import {NavLink,Navigate,Outlet,Route,Routes,useNavigate} from 'react-router-dom'
import {useEffect} from 'react'
import {LayoutDashboard,CalendarDays,CheckSquare,Timer,Plug,Moon,Sun,LogOut,UserCircle} from 'lucide-react'
import {useStore} from './stores/useStore'
import {GuestOnly,Protected,useAuth} from './lib/auth'
import {isCloud} from './lib/supabase'
import {PRODUCTS,CURRENT} from './registry/products'
import {Badge} from './components/ui'
import {Login,Register,Forgot,Reset} from './pages/AuthPages'
import Overview from './pages/Overview';import Schedule from './pages/Schedule';import Tasks from './pages/Tasks';import Focus from './pages/Focus';import Integrations from './pages/Integrations'
const nav=[['/',LayoutDashboard,'Ringkasan'],['/jadwal',CalendarDays,'Jadwal Saya'],['/tugas',CheckSquare,'Tugas'],['/fokus',Timer,'Mode Fokus'],['/integrasi',Plug,'Integrasi Lanila']] as const
function Shell(){
 const {dark,toggleDark}=useStore();const {user,signOut,syncError}=useAuth();const go=useNavigate()
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark])
 const out=async()=>{await signOut();go('/login',{replace:true})}
 return <div className="flex min-h-screen flex-col md:flex-row">
  <aside className="flex shrink-0 flex-col gap-1 border-b border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:w-64 md:border-b-0 md:border-r">
   <div className="flex items-start justify-between"><div><img src="/lanila-logo.png" alt="Lanila Time Blocking" className="mb-1 h-9 w-auto"/><span className="mb-2 flex items-center gap-1 text-xs font-semibold text-brand-violet">Time Blocking <Badge>{isCloud?'Cloud':'Mode lokal'}</Badge></span></div>
    {user&&<details className="relative"><summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg p-1 text-slate-600 focus-visible:outline focus-visible:outline-2 dark:text-slate-300" aria-label="Menu akun"><UserCircle size={22}/></summary>
     <div className="absolute right-0 z-10 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow dark:border-slate-700 dark:bg-slate-800"><p className="truncate px-2 py-1 text-xs text-slate-500">{user.email}</p>
      <button onClick={out} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700"><LogOut size={16}/>Keluar</button></div></details>}</div>
   <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Navigasi utama">{nav.map(([to,I,l])=>
    <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 active:scale-[.98] ${isActive?'bg-brand-violet/10 font-semibold text-brand-violet':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}><I size={18}/>{l}</NavLink>)}</nav>
   <div className="mt-auto hidden pt-4 md:block"><p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Ekosistem Lanila</p>
    {PRODUCTS.map(p=>{const cur=p.id===CURRENT;const label=cur?'Aktif':p.url?'Tersedia':'Perlu konfigurasi'
     const inner=<><span className="h-2.5 w-2.5 rounded-full" style={{background:p.accent}}/>{p.name}<span className="ml-auto text-[10px] text-slate-400">{label}</span></>
     const cls=`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${cur?'bg-slate-100 font-semibold dark:bg-slate-700':''}`
     return p.url&&!cur?<a key={p.id} href={p.url} className={cls}>{inner}</a>:<div key={p.id} className={cls+(p.url?'':' opacity-60')} aria-current={cur||undefined}>{inner}</div>})}
    <button onClick={toggleDark} className="mt-3 flex items-center gap-2 text-xs text-slate-500">{dark?<Sun size={14}/>:<Moon size={14}/>}{dark?'Mode terang':'Mode gelap'}</button></div>
  </aside>
  <main className="min-w-0 flex-1 p-4 md:p-8">{syncError&&<p role="alert" className="mb-4 rounded-xl bg-red-50 p-2 text-center text-xs text-red-700">{syncError}</p>}<Outlet/></main></div>}
export default function App(){
 return <Routes>
  <Route element={<GuestOnly/>}><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/forgot-password" element={<Forgot/>}/></Route>
  <Route path="/reset-password" element={<Reset/>}/>
  <Route element={<Protected/>}><Route element={<Shell/>}><Route index element={<Overview/>}/><Route path="jadwal" element={<Schedule/>}/><Route path="tugas" element={<Tasks/>}/><Route path="fokus" element={<Focus/>}/><Route path="integrasi" element={<Integrations/>}/></Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
