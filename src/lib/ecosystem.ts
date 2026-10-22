import {supabase} from './supabase'
// Tables seen in the shared Supabase project. A readable table verifies DB access for this account only, NOT event sync.
const PROBE:Record<string,string|null>={'buku-kas':'transactions',wedding:null,habits:'lh_habits',asset:'aset_assets'}
export interface Status{state:'verified'|'error'|'unconfigured'|'unknown';msg?:string}
export async function probe(id:string):Promise<Status>{
 if(!supabase)return {state:'unconfigured'}
 const t=PROBE[id];if(!t)return {state:'unknown'}
 try{const {error}=await supabase.from(t).select('*',{head:true,count:'exact'}).limit(1)
  if(error)return {state:'error',msg:error.code==='42P01'||error.code==='PGRST205'?'Tabel tidak ditemukan':'Tidak dapat mengakses tabel'}
  return {state:'verified'}}catch{return {state:'error',msg:'Jaringan bermasalah'}}}
