import {Block,toMin} from './time'
export const HOUR_PX=56
/** Minutes covered by the union of blocks (overlaps counted once), optionally clipped to a window. */
export function mergedMinutes(blocks:Block[],winStart=0,winEnd=1440){
 const iv=blocks.map(b=>[Math.max(toMin(b.start),winStart),Math.min(toMin(b.end),winEnd)] as [number,number]).filter(([a,b])=>b>a).sort((x,y)=>x[0]-y[0])
 let tot=0,cs=-1,ce=-1
 for(const [a,b] of iv){if(a>ce){if(ce>cs)tot+=ce-cs;cs=a;ce=b}else ce=Math.max(ce,b)}
 if(ce>cs)tot+=ce-cs;return tot}
const ov=(a:Block,b:Block)=>a.date===b.date&&toMin(a.start)<toMin(b.end)&&toMin(b.start)<toMin(a.end)
export function conflictPairs(blocks:Block[]){let n=0;for(let i=0;i<blocks.length;i++)for(let j=i+1;j<blocks.length;j++)if(ov(blocks[i],blocks[j]))n++;return n}
export function conflictIds(blocks:Block[]){const s=new Set<string>();for(let i=0;i<blocks.length;i++)for(let j=i+1;j<blocks.length;j++)if(ov(blocks[i],blocks[j])){s.add(blocks[i].id);s.add(blocks[j].id)};return s}
/** Side-by-side columns for overlapping blocks of ONE day. */
export function layoutColumns(blocks:Block[]){
 const res=new Map<string,{col:number;cols:number}>()
 const s=[...blocks].sort((a,b)=>toMin(a.start)-toMin(b.start)||toMin(b.end)-toMin(a.end))
 let cluster:Block[]=[],clusterEnd=-1
 const flush=()=>{const ends:number[]=[];const asg:[Block,number][]=[]
  for(const b of cluster){let c=ends.findIndex(e=>e<=toMin(b.start));if(c<0){c=ends.length;ends.push(0)};ends[c]=toMin(b.end);asg.push([b,c])}
  for(const [b,c] of asg)res.set(b.id,{col:c,cols:ends.length});cluster=[]}
 for(const b of s){if(cluster.length&&toMin(b.start)>=clusterEnd)flush();cluster.push(b);clusterEnd=cluster.length===1?toMin(b.end):Math.max(clusterEnd,toMin(b.end))}
 if(cluster.length)flush();return res}
/** total = merged scheduled minutes; available = window minutes per day minus merged minutes inside the window; conflicts = overlapping pairs. */
export function summarize(blocks:Block[],dates:string[],winStart:number,winEnd:number){
 let total=0,occupied=0,conflicts=0,count=0
 for(const d of dates){const day=blocks.filter(b=>b.date===d);count+=day.length;total+=mergedMinutes(day);occupied+=mergedMinutes(day,winStart,winEnd);conflicts+=conflictPairs(day)}
 return {total,count,conflicts,available:Math.max(0,(winEnd-winStart)*dates.length-occupied)}}
export const fmtDur=(m:number)=>{const h=Math.floor(m/60),r=m%60;return h?`${h} j${r?` ${r} mnt`:''}`:`${r} mnt`}
