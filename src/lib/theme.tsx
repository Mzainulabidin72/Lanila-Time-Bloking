import {createContext,useContext,useEffect,useState,ReactNode} from 'react'
import {Mode,THEME_KEY,parseMode,isDark} from './themeCore'
const MQ='(prefers-color-scheme: dark)'
const read=():Mode=>{try{return parseMode(localStorage.getItem(THEME_KEY))}catch{return 'system'}}
const apply=(m:Mode)=>{const d=isDark(m,window.matchMedia(MQ).matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}
const C=createContext<{mode:Mode;setMode:(m:Mode)=>void}>(null!)
export const useTheme=()=>useContext(C)
export function ThemeProvider({children}:{children:ReactNode}){
 const [mode,setMode]=useState<Mode>(read)
 useEffect(()=>{apply(mode);try{localStorage.setItem(THEME_KEY,mode)}catch{/* storage unavailable */}
  if(mode!=='system')return;const mq=window.matchMedia(MQ);const h=()=>apply('system');mq.addEventListener('change',h);return()=>mq.removeEventListener('change',h)},[mode])
 return <C.Provider value={{mode,setMode}}>{children}</C.Provider>}
