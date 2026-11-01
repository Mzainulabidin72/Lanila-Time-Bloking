import type {ReactNode} from 'react'
import {Ellipsis} from 'lucide-react'

interface ActionItem{label:string;icon?:ReactNode;onClick:()=>void;danger?:boolean}
export default function ActionMenu({label,items}:{label:string;items:ActionItem[]}){
 return <details className="relative shrink-0">
  <summary aria-label={label} className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><Ellipsis size={18}/></summary>
  <div role="menu" className="absolute right-0 z-20 mt-1 min-w-44 rounded-xl border border-line bg-surface p-1 shadow-lg">
   {items.map(item=><button key={item.label} type="button" role="menuitem" onClick={e=>{e.currentTarget.closest('details')?.removeAttribute('open');item.onClick()}} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated ${item.danger?'text-red-600 dark:text-red-400':''}`}>
    {item.icon}<span>{item.label}</span>
   </button>)}
  </div>
 </details>
}
