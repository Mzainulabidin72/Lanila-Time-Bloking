export interface Product{id:string;name:string;accent:string;url?:string;capabilities:string[]}
const e=import.meta.env
export const PRODUCTS:Product[]=[
 {id:'buku-kas',name:'Lanila Buku Kas',accent:'#10B981',url:e.VITE_URL_BUKU_KAS||undefined,capabilities:['Jadwal tinjauan keuangan','Pengingat tagihan']},
 {id:'wedding',name:'Lanila Wedding Planner',accent:'#F0566B',url:e.VITE_URL_WEDDING||undefined,capabilities:['Sesi perencanaan','Tindak lanjut vendor']},
 {id:'habits',name:'Lanila Habits',accent:'#F97316',url:e.VITE_URL_HABITS||undefined,capabilities:['Jadwal rutinitas kebiasaan']},
 {id:'time-blocking',name:'Lanila Time Blocking',accent:'#7445FF',url:window.location.origin,capabilities:['Blok waktu','Mode fokus']},
 {id:'asset',name:'Lanila Asset',accent:'#06B6D4',url:e.VITE_URL_ASSET||undefined,capabilities:['Tinjauan aset berkala']}]
export const CURRENT='time-blocking'
