import {createContext,useContext,useEffect,useRef,useState,ReactNode} from 'react'
import {Navigate,Outlet,useLocation} from 'react-router-dom'
import type {User} from '@supabase/supabase-js'
import {supabase,isCloud} from './supabase'
import {remote} from '../repositories/remote'
import {useStore} from '../stores/useStore'
interface Ctx{user:User|null;loading:boolean;dataReady:boolean;syncError:string|null
 signIn:(e:string,p:string)=>Promise<string|null>;signUp:(n:string,e:string,p:string)=>Promise<{error:string|null;verify:boolean}>
 signOut:()=>Promise<void>;resetPassword:(e:string)=>Promise<void>;updatePassword:(p:string)=>Promise<string|null>}
const C=createContext<Ctx>(null!)
export const useAuth=()=>useContext(C)
const generic='Terjadi kesalahan. Periksa koneksi lalu coba lagi.'
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(isCloud);const [dataReady,setReady]=useState(!isCloud);const [syncError,setErr]=useState<string|null>(null)
 const had=useRef(false)
 useEffect(()=>{if(!supabase)return
  supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null)}).finally(()=>setLoading(false))
  const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>sub.subscription.unsubscribe()},[])
 const uid=user?.id
 useEffect(()=>{if(!isCloud)return
  if(!uid){if(had.current){useStore.getState().clearAll();had.current=false};setReady(false);return}
  had.current=true;let alive=true;setReady(false);setErr(null)
  remote.fetchAll().then(d=>{if(alive&&d)useStore.getState().setData(d)}).catch(()=>{if(alive)setErr('Gagal sinkron dengan server. Menampilkan data lokal.')}).finally(()=>{if(alive)setReady(true)})
  return()=>{alive=false}},[uid])
 const api:Ctx={user,loading,dataReady,syncError,
  async signIn(email,password){try{const {error}=await supabase!.auth.signInWithPassword({email,password})
   if(!error)return null;if(/invalid login/i.test(error.message))return 'Email atau kata sandi salah';if(/not confirmed/i.test(error.message))return 'Email belum diverifikasi. Cek kotak masukmu.';return generic}catch{return generic}},
  async signUp(name,email,password){try{const {data,error}=await supabase!.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${window.location.origin}/auth/callback`}})
   if(error)return {error:/registered|exists/i.test(error.message)?'Email sudah terdaftar':generic,verify:false}
   if(data.user&&data.user.identities?.length===0)return {error:'Email sudah terdaftar',verify:false}
   return {error:null,verify:!data.session}}catch{return {error:generic,verify:false}}},
  async signOut(){await supabase?.auth.signOut();useStore.getState().clearAll()},
  async resetPassword(email){try{await supabase!.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`})}catch{/* generic success shown regardless */}},
  async updatePassword(password){try{const {error}=await supabase!.auth.updateUser({password});return error?generic:null}catch{return generic}}}
 return <C.Provider value={api}>{children}</C.Provider>}
const Loading=()=><p role="status" className="p-8 text-sm text-muted">Memuat…</p>
export function Protected(){const {user,loading,dataReady}=useAuth();const loc=useLocation()
 if(loading||(isCloud&&user&&!dataReady))return <Loading/>
 if(isCloud&&!user)return <Navigate to="/login" replace state={{from:loc.pathname+loc.search}}/>
 return <Outlet/>}
export function GuestOnly(){const {user,loading}=useAuth();const loc=useLocation()
 if(loading)return <Loading/>
 if(user)return <Navigate to={(loc.state as {from?:string}|null)?.from||'/'} replace/>
 return <Outlet/>}
