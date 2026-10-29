import {NavLink,Navigate,Outlet,Route,Routes,useLocation,useNavigate} from 'react-router-dom'
import {useEffect,useState} from 'react'
import {LayoutDashboard,CalendarDays,CheckSquare,Timer,Plug,Settings as Cog,LogOut,Menu,X,ChevronDown} from 'lucide-react'
import {GuestOnly,Protected,useAuth} from './lib/auth'
import {isCloud} from './lib/supabase'
import {PRODUCTS,CURRENT} from './registry/products'
import {Badge} from './components/ui'
import ThemeToggle from './components/ThemeToggle'
import {useFocusEngine} from './lib/useFocusEngine'
import {Login,Register,Forgot,Reset} from './pages/AuthPages'
import AuthCallback from './pages/AuthCallback'
import Overview from './pages/Overview';import Schedule from './pages/Schedule';import Tasks from './pages/Tasks';import Focus from './pages/Focus';import Integrations from './pages/Integrations';import Settings from './pages/Settings'
const nav=[['/',LayoutDashboard,'Ringkasan'],['/jadwal',CalendarDays,'Jadwal Saya'],['/tugas',CheckSquare,'Tugas'],['/fokus',Timer,'Mode Fokus'],['/integrasi',Plug,'Integrasi Lanila'],['/pengaturan',Cog,'Pengaturan']] as const
function Shell(){
 useFocusEngine()
 const {user,signOut,syncError}=useAuth();const go=useNavigate();const loc=useLocation();const [open,setOpen]=useState(false)
 useEffect(()=>setOpen(false),[loc.pathname])
 useEffect(()=>{if(!open)return;const h=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[open])
 const out=async()=>{await signOut();go('/login',{replace:true})}
 return <div className="min-h-screen md:flex">
  <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-3 py-2 md:hidden">
   <button onClick={()=>setOpen(true)} aria-label="Buka menu" aria-expanded={open} className="rounded-lg p-2 text-muted focus-visible:outline focus-visible:outline-2"><Menu size={22}/></button>
   <img src="/lanila-logo.png" alt="Lanila Time Blocking" className="h-7 w-auto"/><ThemeToggle compact/></header>
  {open&&<div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={()=>setOpen(false)} aria-hidden/>}
  <aside aria-label="Sidebar" className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-1 overflow-y-auto overscroll-contain border-r border-line bg-surface p-3 pb-4 transition-transform md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:shrink-0 md:translate-x-0 md:visible ${open?'translate-x-0':'-translate-x-full invisible'}`}>
   <div className="flex items-start justify-between"><div><img src="/lanila-logo.png" alt="Lanila Time Blocking" className="mb-1 h-9 w-auto"/><span className="mb-2 flex items-center gap-1 text-xs font-semibold text-accent">Time Blocking <Badge>{isCloud?'Cloud':'Mode lokal'}</Badge></span></div>
    <button onClick={()=>setOpen(false)} aria-label="Tutup menu" className="rounded-lg p-2 text-muted focus-visible:outline focus-visible:outline-2 md:hidden"><X size={20}/></button></div>
   <nav className="flex flex-col gap-1" aria-label="Navigasi utama">{nav.map(([to,I,l])=>
    <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 active:scale-[.98] ${isActive?'bg-brand-violet/10 font-semibold text-accent':'text-muted hover:bg-elevated hover:text-ink'}`}><I size={18}/>{l}</NavLink>)}</nav>
   <div className="mt-auto space-y-3 pt-4"><details open className="group"><summary className="mb-1 flex cursor-pointer list-none items-center justify-between rounded text-xs uppercase tracking-wider text-muted focus-visible:outline focus-visible:outline-2">Ekosistem Lanila<ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden/></summary>
    {PRODUCTS.map(p=>{const cur=p.id===CURRENT;const label=cur?'Aktif':p.url?'Tersedia':'Perlu konfigurasi'
     const inner=<><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{background:p.accent}}/><span className="truncate">{p.name}</span><span className="ml-auto shrink-0 text-[10px] text-muted">{label}</span></>
     const cls=`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${cur?'bg-elevated font-semibold':''}`
     return p.url&&!cur?<a key={p.id} href={p.url} className={cls+' hover:bg-elevated'}>{inner}</a>:<div key={p.id} className={cls+(p.url?'':' opacity-70')} aria-current={cur||undefined}>{inner}</div>})}</details>
    <ThemeToggle/>
    {user&&<div className="border-t border-line pt-2"><p className="truncate text-xs text-muted">{user.email}</p><button onClick={out} className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-elevated hover:text-ink focus-visible:outline focus-visible:outline-2"><LogOut size={16}/>Keluar</button></div>}</div>
  </aside>
  <main className="min-w-0 flex-1 p-4 md:p-8">{syncError&&<p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-2 text-center text-xs text-red-700 dark:text-red-300">{syncError}</p>}<Outlet/></main></div>}
export default function App(){
 return <Routes>
  <Route element={<GuestOnly/>}><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/forgot-password" element={<Forgot/>}/></Route>
  <Route path="/reset-password" element={<Reset/>}/><Route path="/auth/callback" element={<AuthCallback/>}/>
  <Route element={<Protected/>}><Route element={<Shell/>}><Route index element={<Overview/>}/><Route path="jadwal" element={<Schedule/>}/><Route path="tugas" element={<Tasks/>}/><Route path="fokus" element={<Focus/>}/><Route path="integrasi" element={<Integrations/>}/><Route path="pengaturan" element={<Settings/>}/></Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
