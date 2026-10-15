import {create} from 'zustand'
import {persist,createJSONStorage,StateStorage} from 'zustand/middleware'
import {get,set,del} from 'idb-keyval'
import type {Block} from '../lib/time'
export interface Task{id:string;title:string;status:'inbox'|'todo'|'doing'|'done';priority:'low'|'mid'|'high';est:number}
const idb:StateStorage={getItem:async k=>(await get(k))??null,setItem:(k,v)=>set(k,v),removeItem:k=>del(k)}
interface S{blocks:Block[];tasks:Task[];dark:boolean;focus:{endsAt:number|null;minutes:number;sessions:{at:number;minutes:number}[]}
 addBlock:(b:Block)=>void;delBlock:(id:string)=>void;toggleBlock:(id:string)=>void
 addTask:(t:Task)=>void;setTask:(id:string,p:Partial<Task>)=>void;delTask:(id:string)=>void
 toggleDark:()=>void;startFocus:(m:number)=>void;stopFocus:(completed:boolean)=>void;reset:()=>void}
export const useStore=create<S>()(persist((s)=>({
 blocks:[],tasks:[],dark:false,focus:{endsAt:null,minutes:25,sessions:[]},
 addBlock:b=>s(st=>({blocks:[...st.blocks,b]})),delBlock:id=>s(st=>({blocks:st.blocks.filter(b=>b.id!==id)})),
 toggleBlock:id=>s(st=>({blocks:st.blocks.map(b=>b.id===id?{...b,done:!b.done}:b)})),
 addTask:t=>s(st=>({tasks:[...st.tasks,t]})),setTask:(id,p)=>s(st=>({tasks:st.tasks.map(t=>t.id===id?{...t,...p}:t)})),
 delTask:id=>s(st=>({tasks:st.tasks.filter(t=>t.id!==id)})),toggleDark:()=>s(st=>({dark:!st.dark})),
 startFocus:m=>s(st=>({focus:{...st.focus,minutes:m,endsAt:Date.now()+m*60000}})),
 stopFocus:c=>s(st=>({focus:{...st.focus,endsAt:null,sessions:c?[...st.focus.sessions,{at:Date.now(),minutes:st.focus.minutes}]:st.focus.sessions}})),
 reset:()=>s({blocks:[],tasks:[]})}),{name:'lanila-tb',storage:createJSONStorage(()=>idb)}))
