import {Block,toMin,fmt} from './time'
export type Row={kind:'block';b:Block}|{kind:'free';from:string;to:string;min:number}|{kind:'now';at:string}
const start=(r:Row)=>r.kind==='block'?toMin(r.b.start):r.kind==='free'?toMin(r.from):0
export function buildTimeline(blocks:Block[],nowMin:number|null,dayStart=360,dayEnd=1320):Row[]{
 const rows:Row[]=[];let cur=dayStart
 for(const b of [...blocks].sort((a,c)=>toMin(a.start)-toMin(c.start))){const s=toMin(b.start)
  if(s-cur>=15)rows.push({kind:'free',from:fmt(cur),to:fmt(s),min:s-cur});rows.push({kind:'block',b});cur=Math.max(cur,toMin(b.end))}
 if(dayEnd-cur>=15)rows.push({kind:'free',from:fmt(cur),to:fmt(dayEnd),min:dayEnd-cur})
 if(nowMin!==null){const i=rows.findIndex(r=>start(r)>nowMin);rows.splice(i<0?rows.length:i,0,{kind:'now',at:fmt(nowMin)})}
 return rows}
