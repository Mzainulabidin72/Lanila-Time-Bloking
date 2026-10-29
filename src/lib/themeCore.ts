export type Mode='light'|'dark'|'system'
export const THEME_KEY='lanila-theme' // single canonical preference key
export const parseMode=(v:string|null):Mode=>v==='light'||v==='dark'||v==='system'?v:'system'
export const isDark=(m:Mode,systemDark:boolean)=>m==='dark'||(m==='system'&&systemDark)
