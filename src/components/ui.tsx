import {useEffect,useRef,useState,ReactNode,InputHTMLAttributes,ButtonHTMLAttributes} from 'react'
import {Eye,EyeOff} from 'lucide-react'
type BV='primary'|'secondary'|'ghost'|'danger'
const BC:Record<BV,string>={primary:'bg-brand-violet text-white hover:opacity-90',secondary:'bg-brand text-white hover:opacity-90',ghost:'border border-strong hover:bg-elevated',danger:'bg-red-600 text-white hover:opacity-90'}
export const Button=({variant='primary',className='',...p}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:BV})=>
 <button {...p} className={`rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-violet disabled:cursor-not-allowed disabled:opacity-50 ${BC[variant]} ${className}`}/>
export function Field({label,id,error,hint,children}:{label:string;id:string;error?:string|null;hint?:string;children:ReactNode}){
 return <div><label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>{children}
 {hint&&!error&&<p className="mt-1 text-xs text-muted">{hint}</p>}{error&&<p id={id+'-e'} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}</div>}
export function PasswordInput(p:InputHTMLAttributes<HTMLInputElement>){const [show,setShow]=useState(false)
 return <div className="relative"><input {...p} type={show?'text':'password'} className="inp pr-10"/>
 <button type="button" onClick={()=>setShow(!show)} aria-label={show?'Sembunyikan kata sandi':'Tampilkan kata sandi'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted focus-visible:outline focus-visible:outline-2">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>}
export const Skeleton=({className=''}:{className?:string})=><div aria-hidden className={`animate-pulse rounded-lg bg-line ${className}`}/>
export const Badge=({tone='slate',children}:{tone?:'slate'|'green'|'amber'|'red'|'violet';children:ReactNode})=>{
 const t={slate:'bg-elevated text-muted',green:'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',amber:'bg-amber-500/15 text-amber-700 dark:text-amber-300',red:'bg-red-500/15 text-red-700 dark:text-red-300',violet:'bg-brand-violet/10 text-accent'}[tone]
 return <span className={`rounded-full px-2 py-0.5 text-xs ${t}`}>{children}</span>}
export const EmptyState=({title,text,action}:{title:string;text?:string;action?:ReactNode})=>
 <div className="rounded-2xl border border-dashed border-strong p-6 text-center"><p className="font-medium">{title}</p>{text&&<p className="mt-1 text-sm text-muted">{text}</p>}{action&&<div className="mt-3">{action}</div>}</div>
export function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}){
 const r=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const d=r.current;if(!d)return;if(open&&!d.open)d.showModal();if(!open&&d.open)d.close()},[open])
 return <dialog ref={r} onClose={onClose} aria-label={title} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 backdrop:bg-black/50 max-sm:mb-0 max-sm:mt-auto max-sm:max-w-none max-sm:rounded-b-none bg-surface text-ink border border-line"><h2 className="mb-3 text-lg font-semibold">{title}</h2>{open&&children}</dialog>}
