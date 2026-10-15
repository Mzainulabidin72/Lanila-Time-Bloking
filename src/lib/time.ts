export interface Block{id:string;title:string;date:string;start:string;end:string;category:string;done:boolean;taskId?:string}
export const toMin=(t:string)=>{const[h,m]=t.split(':').map(Number);return h*60+m}
export const duration=(b:Pick<Block,'start'|'end'>)=>toMin(b.end)-toMin(b.start)
export function validateBlock(b:Pick<Block,'date'|'start'|'end'>):string|null{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||Number.isNaN(Date.parse(b.date)))return 'Tanggal tidak valid'
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.end))return 'Format waktu tidak valid'
  if(toMin(b.end)<=toMin(b.start))return 'Waktu selesai harus setelah waktu mulai'
  return null}
export const findConflicts=(blocks:Block[],c:Pick<Block,'id'|'date'|'start'|'end'>)=>
  blocks.filter(b=>b.id!==c.id&&b.date===c.date&&toMin(b.start)<toMin(c.end)&&toMin(c.start)<toMin(b.end))
export const remainingMs=(endsAt:number,now=Date.now())=>Math.max(0,endsAt-now)
export const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
