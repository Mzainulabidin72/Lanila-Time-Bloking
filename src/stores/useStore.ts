import {create} from 'zustand'
import {persist,createJSONStorage,StateStorage} from 'zustand/middleware'
import {get,set,del} from 'idb-keyval'
import type {Block} from '../lib/time'
import {remote} from '../repositories/remote'
export interface Task{id:string;title:string;status:'inbox'|'todo'|'doing'|'done';priority:'low'|'mid'|'high';est:number;due?:string}
export interface Session{id:string;at:number;minutes:number}
export interface Focus{sessionId:string|null;endsAt:number|null;pausedLeft:number|null;minutes:number;sessions:Session[]}
const idb:StateStorage={getItem:async k=>(await get(k))??null,setItem:(k,v)=>set(k,v),removeItem:k=>del(k)}
const F0:Focus={sessionId:null,endsAt:null,pausedLeft:null,minutes:25,sessions:[]}
interface S{blocks:Block[];tasks:Task[];dark:boolean;focus:Focus
 setData:(d:{blocks:Block[];tasks:Task[];sessions?:Session[]})=>void;clearAll:()=>void
 addBlock:(b:Block)=>void;updateBlock:(b:Block)=>void;delBlock:(id:string)=>void;toggleBlock:(id:string)=>void
 addTask:(t:Task)=>void;setTask:(id:string,p:Partial<Task>)=>void;delTask:(id:string)=>void;toggleDark:()=>void
 startFocus:(m:number)=>void;pauseFocus:()=>void;resumeFocus:()=>void;stopFocus:()=>void}
export const useStore=create<S>()(persist((s,g)=>({
 blocks:[],tasks:[],dark:false,focus:F0,
 setData:d=>s(st=>({blocks:d.blocks,tasks:d.tasks,focus:d.sessions?{...st.focus,sessions:d.sessions}:st.focus})),
 clearAll:()=>s({blocks:[],tasks:[],focus:F0}),
 addBlock:b=>{s(st=>({blocks:[...st.blocks,b]}));remote.upsertBlock(b)},
 updateBlock:b=>{s(st=>({blocks:st.blocks.map(x=>x.id===b.id?b:x)}));remote.upsertBlock(b)},
 delBlock:id=>{s(st=>({blocks:st.blocks.filter(b=>b.id!==id)}));remote.deleteBlock(id)},
 toggleBlock:id=>{s(st=>({blocks:st.blocks.map(b=>b.id===id?{...b,done:!b.done}:b)}));const nb=g().blocks.find(b=>b.id===id);if(nb)remote.upsertBlock(nb)},
 addTask:t=>{s(st=>({tasks:[...st.tasks,t]}));remote.upsertTask(t)},
 setTask:(id,p)=>{s(st=>({tasks:st.tasks.map(t=>t.id===id?{...t,...p}:t)}));const nt=g().tasks.find(t=>t.id===id);if(nt)remote.upsertTask(nt)},
 delTask:id=>{s(st=>({tasks:st.tasks.filter(t=>t.id!==id)}));remote.deleteTask(id)},
 toggleDark:()=>s(st=>({dark:!st.dark})),
 startFocus:m=>s(st=>({focus:{...st.focus,minutes:m,sessionId:crypto.randomUUID(),endsAt:Date.now()+m*60000,pausedLeft:null}})),
 pauseFocus:()=>s(st=>st.focus.endsAt?{focus:{...st.focus,pausedLeft:Math.max(0,st.focus.endsAt-Date.now()),endsAt:null}}:st),
 resumeFocus:()=>s(st=>st.focus.pausedLeft!=null?{focus:{...st.focus,endsAt:Date.now()+st.focus.pausedLeft,pausedLeft:null}}:st),
 stopFocus:()=>{const f=g().focus;if(!f.sessionId)return // idempotent: no active session, nothing recorded twice
  const left=f.endsAt!=null?Math.max(0,f.endsAt-Date.now()):(f.pausedLeft??0)
  const mins=Math.round((f.minutes*60000-left)/60000)
  if(mins>=1)remote.addSession(f.sessionId,mins)
  s({focus:{...f,sessionId:null,endsAt:null,pausedLeft:null,sessions:mins>=1?[...f.sessions,{id:f.sessionId,at:Date.now(),minutes:mins}]:f.sessions}})}
}),{name:'lanila-tb',version:2,storage:createJSONStorage(()=>idb),
 migrate:(p:any)=>({...p,focus:{...F0,sessions:(p?.focus?.sessions??[]).map((x:any,i:number)=>({id:x.id??`legacy-${i}`,at:x.at,minutes:x.minutes}))}})}))
