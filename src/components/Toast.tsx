import {createContext,useCallback,useContext,useState,ReactNode} from 'react'
import {AlertTriangle,Check} from 'lucide-react'
type Push=(m:string,tone?:'ok'|'err')=>void
const C=createContext<Push>(()=>{})
export const useToast=()=>useContext(C)
export function ToastProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<{id:number;m:string;tone:'ok'|'err'}[]>([])
 const push=useCallback<Push>((m,tone='ok')=>{const id=Date.now()+Math.random();setItems(x=>[...x,{id,m,tone}]);setTimeout(()=>setItems(x=>x.filter(i=>i.id!==id)),3500)},[])
 return <C.Provider value={push}>{children}<div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-[60] flex w-[min(92vw,24rem)] -translate-x-1/2 flex-col gap-2">{items.map(i=>
  <div key={i.id} className={`flex items-center gap-2 rounded-xl border bg-elevated px-4 py-2 text-sm text-ink shadow ${i.tone==='err'?'border-red-500':'border-line'}`}>{i.tone==='err'?<AlertTriangle size={16} className="text-red-500"/>:<Check size={16} className="text-emerald-500"/>}{i.m}</div>)}</div></C.Provider>}
