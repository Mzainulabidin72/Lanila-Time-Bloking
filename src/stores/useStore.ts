import {create} from 'zustand'
import {persist,createJSONStorage,StateStorage} from 'zustand/middleware'
import {get,set,del} from 'idb-keyval'
import type {Block} from '../lib/time'
import {remote} from '../repositories/remote'
import type {Project} from '../lib/projects'
import type {Routine} from '../lib/routines'
import {FocusState,SessionType,FocusSession,DEFAULT_SETTINGS,FocusSettings,startActive,remainingMs,completeIfDue,endEarly,sanitizeActive,legacySession} from '../lib/focusTimer'
export interface Task{id:string;title:string;status:'inbox'|'todo'|'doing'|'done';priority:'low'|'mid'|'high';est:number;due?:string;description?:string;notes?:string;createdAt?:number;projectId?:string}
export interface Prefs{startHour:number;endHour:number}
export type Focus=FocusState
const idb:StateStorage={getItem:async k=>(await get(k))??null,setItem:(k,v)=>set(k,v),removeItem:k=>del(k)}
const F0:Focus={active:null,summary:null,sessions:[],settings:DEFAULT_SETTINGS}
interface S{blocks:Block[];tasks:Task[];focus:Focus;prefs:Prefs;projects:Project[];routines:Routine[]
 setPrefs:(p:Prefs)=>void;setData:(d:{blocks:Block[];tasks:Task[];sessions?:FocusSession[];projects?:Project[];routines?:Routine[]})=>void;clearAll:()=>void;addProject:(p:Project)=>void;updateProject:(p:Project)=>void;addRoutine:(r:Routine)=>void;updateRoutine:(r:Routine)=>void;delRoutine:(id:string)=>void
 addBlock:(b:Block)=>void;updateBlock:(b:Block)=>void;delBlock:(id:string)=>void;toggleBlock:(id:string)=>void
 addTask:(t:Task)=>void;setTask:(id:string,p:Partial<Task>)=>void;delTask:(id:string)=>void
 startSession:(o:{type:SessionType;taskId?:string;objective?:string})=>void;pauseFocus:()=>void;resumeFocus:()=>void;resetFocus:()=>void
 endSession:()=>{recorded:FocusSession|null;elapsedSec:number}|null;completeActive:()=>FocusSession|null;dismissSummary:()=>void;setFocusSettings:(p:Partial<FocusSettings>)=>void}
export const useStore=create<S>()(persist((s,g)=>({
 blocks:[],tasks:[],focus:F0,prefs:{startHour:6,endHour:22},projects:[],routines:[],
 setPrefs:p=>s({prefs:p}),
 addProject:p=>{const np={...p,createdAt:p.createdAt??Date.now()};s(st=>({projects:st.projects.some(x=>x.id===np.id)?st.projects.map(x=>x.id===np.id?np:x):[...st.projects,np]}));remote.upsertProject(np)},
 updateProject:p=>{s(st=>({projects:st.projects.map(x=>x.id===p.id?p:x)}));remote.upsertProject(p)},
 addRoutine:r=>{s(st=>({routines:st.routines.some(x=>x.id===r.id)?st.routines.map(x=>x.id===r.id?r:x):[...st.routines,r]}));remote.upsertRoutine(r)},
 updateRoutine:r=>{s(st=>({routines:st.routines.map(x=>x.id===r.id?r:x)}));remote.upsertRoutine(r)},
 delRoutine:id=>{s(st=>({routines:st.routines.filter(x=>x.id!==id)}));remote.deleteRoutine(id)},
 setData:d=>s(st=>({blocks:d.blocks,tasks:d.tasks,focus:d.sessions?{...st.focus,sessions:d.sessions}:st.focus,projects:d.projects??st.projects,routines:d.routines??st.routines})),
 clearAll:()=>s(st=>({blocks:[],tasks:[],projects:[],routines:[],focus:{...F0,settings:st.focus.settings}})),
 addBlock:b=>{s(st=>({blocks:st.blocks.some(x=>x.id===b.id)?st.blocks.map(x=>x.id===b.id?b:x):[...st.blocks,b]}));remote.upsertBlock(b)}, // idempotent: retrying with the same id never duplicates
 updateBlock:b=>{s(st=>({blocks:st.blocks.map(x=>x.id===b.id?b:x)}));remote.upsertBlock(b)},
 delBlock:id=>{s(st=>({blocks:st.blocks.filter(b=>b.id!==id)}));remote.deleteBlock(id)},
 toggleBlock:id=>{s(st=>({blocks:st.blocks.map(b=>b.id===id?{...b,done:!b.done}:b)}));const nb=g().blocks.find(b=>b.id===id);if(nb)remote.upsertBlock(nb)},
 addTask:t=>{const nt={...t,createdAt:t.createdAt??Date.now()};s(st=>({tasks:st.tasks.some(x=>x.id===nt.id)?st.tasks.map(x=>x.id===nt.id?nt:x):[...st.tasks,nt]}));remote.upsertTask(nt)},
 setTask:(id,p)=>{s(st=>({tasks:st.tasks.map(t=>t.id===id?{...t,...p}:t)}));const nt=g().tasks.find(t=>t.id===id);if(nt)remote.upsertTask(nt)},
 delTask:id=>{ // policy: linked time blocks are KEPT and only unlinked (DB: on delete set null)
  s(st=>({tasks:st.tasks.filter(t=>t.id!==id),blocks:st.blocks.map(b=>b.taskId===id?{...b,taskId:undefined}:b)}));remote.deleteTask(id)},
 startSession:o=>{const f=g().focus;if(f.active)return;s({focus:{...f,summary:null,active:startActive(o,f.settings,Date.now())}})},
 pauseFocus:()=>{const f=g().focus,a=f.active;if(!a||a.endsAt==null)return;s({focus:{...f,active:{...a,pausedLeftMs:remainingMs(a,Date.now()),endsAt:null}}})},
 resumeFocus:()=>{const f=g().focus,a=f.active;if(!a||a.pausedLeftMs==null)return;s({focus:{...f,active:{...a,endsAt:Date.now()+a.pausedLeftMs,pausedLeftMs:null}}})},
 resetFocus:()=>{const f=g().focus;if(f.active)s({focus:{...f,active:null}})}, // discards without recording
 endSession:()=>{const r=endEarly(g().focus,Date.now());if(!r)return null;s({focus:r.focus});if(r.recorded)remote.upsertSession(r.recorded);return {recorded:r.recorded,elapsedSec:r.elapsedSec}},
 completeActive:()=>{const r=completeIfDue(g().focus,Date.now());if(r.focus!==g().focus)s({focus:r.focus});if(r.session)remote.upsertSession(r.session);return r.session},
 dismissSummary:()=>s(st=>({focus:{...st.focus,summary:null}})),
 setFocusSettings:p=>s(st=>({focus:{...st.focus,settings:{...st.focus.settings,...p}}}))
}),{name:'lanila-tb',version:3,storage:createJSONStorage(()=>idb),
 migrate:(p:any)=>{const old=p?.focus??{};return {...p,focus:{sessions:(old.sessions??[]).map((x:any,i:number)=>x.status?x:legacySession(x,i))}}},
 merge:(p:any,c)=>({...c,...(p??{}),focus:{...c.focus,...(p?.focus??{}),active:sanitizeActive(p?.focus?.active),settings:{...DEFAULT_SETTINGS,...(p?.focus?.settings??{})}}})}))
