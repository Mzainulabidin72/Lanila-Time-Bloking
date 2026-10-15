import {NavLink,Route,Routes} from 'react-router-dom'
import {useEffect} from 'react'
import {LayoutDashboard,CalendarDays,CheckSquare,Timer,Plug,Moon,Sun} from 'lucide-react'
import {useStore} from './stores/useStore'
import {PRODUCTS,CURRENT} from './registry/products'
import Overview from './pages/Overview';import Schedule from './pages/Schedule';import Tasks from './pages/Tasks';import Focus from './pages/Focus';import Integrations from './pages/Integrations'
const nav=[['/',LayoutDashboard,'Ringkasan'],['/jadwal',CalendarDays,'Jadwal Saya'],['/tugas',CheckSquare,'Tugas'],['/fokus',Timer,'Mode Fokus'],['/integrasi',Plug,'Integrasi Lanila']] as const
export default function App(){
 const {dark,toggleDark}=useStore()
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark])
 return <div className="flex min-h-screen flex-col md:flex-row">
  <aside className="flex shrink-0 flex-col gap-1 border-b border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:w-64 md:border-b-0 md:border-r">
   <img src="/lanila-logo.png" alt="Lanila Time Blocking" className="mb-1 h-9 w-auto self-start"/>
   <span className="mb-2 text-xs font-semibold text-brand-violet">Time Blocking</span>
   <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Navigasi utama">{nav.map(([to,I,l])=>
    <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm ${isActive?'bg-brand-violet/10 font-semibold text-brand-violet':'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}><I size={18}/>{l}</NavLink>)}</nav>
   <div className="mt-auto hidden pt-4 md:block"><p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Ekosistem Lanila</p>
    {PRODUCTS.map(p=>{const cur=p.id===CURRENT;const inner=<><span className="h-2.5 w-2.5 rounded-full" style={{background:p.accent}}/>{p.name}{!p.url&&<span className="ml-auto text-[10px] text-slate-400">perlu konfigurasi</span>}</>
     const cls=`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${cur?'bg-slate-100 font-semibold dark:bg-slate-700':''}`
     return p.url&&!cur?<a key={p.id} href={p.url} className={cls}>{inner}</a>:<div key={p.id} className={cls+(p.url?'':' opacity-60')} aria-current={cur||undefined}>{inner}</div>})}
    <button onClick={toggleDark} className="mt-3 flex items-center gap-2 text-xs text-slate-500">{dark?<Sun size={14}/>:<Moon size={14}/>}{dark?'Mode terang':'Mode gelap'}</button></div>
  </aside>
  <main className="flex-1 p-4 md:p-8"><Routes><Route path="/" element={<Overview/>}/><Route path="/jadwal" element={<Schedule/>}/><Route path="/tugas" element={<Tasks/>}/><Route path="/fokus" element={<Focus/>}/><Route path="/integrasi" element={<Integrations/>}/></Routes></main></div>}
