import {Block,findConflicts,validateBlock} from './time'
export interface RoutineBlock{id:string;title:string;start:string;end:string;category:string}
export interface Routine{id:string;name:string;description?:string;weekdays:number[];blocks:RoutineBlock[]}
/** 0 = Minggu (JS getDay). Displayed Monday-first. */
export const WEEKDAYS:readonly (readonly [number,string])[]=[[1,'Sen'],[2,'Sel'],[3,'Rab'],[4,'Kam'],[5,'Jum'],[6,'Sab'],[0,'Min']]
export const weekdayOf=(date:string)=>{const [y,m,d]=date.split('-').map(Number);return new Date(y,m-1,d).getDay()}
export function validateRoutine(r:{name:string;blocks:RoutineBlock[]}):string|null{
 if(!r.name.trim())return 'Nama rutinitas wajib diisi'
 if(r.blocks.length===0)return 'Tambahkan minimal satu blok'
 for(let i=0;i<r.blocks.length;i++){const b=r.blocks[i];if(!b.title.trim())return `Blok ${i+1}: judul wajib diisi`;const e=validateBlock({date:'2026-01-01',start:b.start,end:b.end});if(e)return `Blok ${i+1}: ${e}`}
 return null}
export interface PreviewRow{rb:RoutineBlock;conflicts:Block[]}
/** Never writes anything: reports which routine blocks would collide with existing blocks on `date`. */
export const previewApply=(r:Routine,date:string,existing:Block[]):PreviewRow[]=>r.blocks.map(rb=>({rb,conflicts:findConflicts(existing,{id:'__routine__',date,start:rb.start,end:rb.end})}))
