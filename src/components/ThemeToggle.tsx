import {Sun,Moon,Monitor} from 'lucide-react'
import {useTheme} from '../lib/theme'
const OPTS=[['light',Sun,'Terang'],['system',Monitor,'Sistem'],['dark',Moon,'Gelap']] as const
export default function ThemeToggle({compact=false}:{compact?:boolean}){
 const {mode,setMode}=useTheme()
 return <div role="group" aria-label="Tema tampilan" className="inline-flex rounded-xl border border-line bg-bg p-0.5">{OPTS.map(([m,I,l])=>
  <button key={m} type="button" aria-pressed={mode===m} aria-label={`Tema ${l}`} title={l} onClick={()=>setMode(m)}
   className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-violet ${mode===m?'bg-surface font-semibold text-accent shadow-sm':'text-muted hover:text-ink'}`}><I size={14}/>{!compact&&l}</button>)}</div>}
