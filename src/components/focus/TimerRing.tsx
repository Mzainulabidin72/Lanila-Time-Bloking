import {ReactNode} from 'react'
export default function TimerRing({fraction,children}:{fraction:number;children:ReactNode}){
 const R=88,C=2*Math.PI*R,f=Math.max(0,Math.min(1,fraction))
 return <div className="relative mx-auto aspect-square w-[min(72vw,16rem)]">
  <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden><circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" className="stroke-line"/>
   <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-accent transition-[stroke-dashoffset] duration-500 ease-linear" strokeDasharray={C} strokeDashoffset={C*(1-f)}/></svg>
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div></div>}
