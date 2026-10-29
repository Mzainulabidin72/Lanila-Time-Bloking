import {useEffect} from 'react'
import {useStore} from '../stores/useStore'
import {useToast} from '../components/Toast'
import {chime,systemNotify} from './notify'
/** Mounted ONCE (in Shell). Completes due sessions anywhere in the app, including recovery after refresh/inactivity. */
export function useFocusEngine(){
 const toast=useToast();const id=useStore(s=>s.focus.active?.id);const ends=useStore(s=>s.focus.active?.endsAt)
 useEffect(()=>{let t:number|undefined
  const tick=()=>{const s=useStore.getState().completeActive()
   if(s){const msg=s.type==='focus'?'Sesi fokus selesai. Kerja bagus!':'Istirahat selesai. Siap fokus lagi?';toast(msg)
    if(useStore.getState().focus.settings.sound){chime();systemNotify('Lanila Time Blocking',msg)}}
   const a=useStore.getState().focus.active
   if(a&&a.endsAt!=null)t=window.setTimeout(tick,Math.max(50,a.endsAt-Date.now()+20))}
  const vis=()=>{if(document.visibilityState==='visible'){window.clearTimeout(t);tick()}}
  tick();document.addEventListener('visibilitychange',vis)
  return()=>{window.clearTimeout(t);document.removeEventListener('visibilitychange',vis)}},[id,ends,toast])}
