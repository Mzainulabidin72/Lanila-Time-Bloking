import {FormEvent,ReactNode,useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {useAuth} from '../lib/auth'
import {isCloud,supabase} from '../lib/supabase'
import {isEmail,passwordStrength} from '../lib/validate'
import {PRODUCTS,CURRENT} from '../registry/products'
import {Button,Field,PasswordInput} from '../components/ui'
import ThemeToggle from '../components/ThemeToggle'
function Layout({title,sub,children}:{title:string;sub:string;children:ReactNode}){
 const others=PRODUCTS.filter(p=>p.id!==CURRENT&&p.url)
 return <div className="flex min-h-screen items-center justify-center p-4"><div className="w-full max-w-md"><div className="mb-3 flex justify-end"><ThemeToggle compact/></div><div className="card space-y-4 !p-6 sm:!p-8">
  <div><img src="/lanila-logo.png" alt="Lanila" className="h-9 w-auto"/><p className="mt-1 text-xs font-semibold text-accent">Time Blocking</p></div>
  <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-muted">{sub}</p></div>
  {!isCloud&&<p role="status" className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Supabase belum dikonfigurasi (isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY). Autentikasi tidak tersedia; aplikasi berjalan di mode lokal. <Link to="/" className="underline">Buka aplikasi</Link></p>}
  {children}</div>
  <p className="mt-4 text-center text-xs text-muted">Rencanakan waktu. Fokus pada hal penting.</p>
  {others.length>0&&<p className="mt-4 text-center text-xs text-muted">Aplikasi Lanila lain: {others.map((p,i)=><span key={p.id}>{i>0&&' · '}<a className="underline" href={p.url}>{p.name.replace('Lanila ','')}</a></span>)}<br/>Tiap aplikasi tetap meminta login sendiri.</p>}</div></div>}
const ed=(e:string|null,id:string)=>e?{'aria-invalid':true,'aria-describedby':id+'-e'}:{}
export function Login(){
 const {signIn}=useAuth();const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [busy,setBusy]=useState(false);const [err,setErr]=useState<string|null>(null);const [t,setT]=useState({e:false,p:false})
 const eErr=t.e&&!isEmail(email)?'Format email tidak valid':null,pErr=t.p&&pw.length<6?'Minimal 6 karakter':null,valid=isEmail(email)&&pw.length>=6&&isCloud
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!valid||busy)return;setBusy(true);setErr(null);const m=await signIn(email.trim(),pw);setBusy(false);if(m)setErr(m)}
 return <Layout title="Selamat datang kembali" sub="Masuk dan lanjutkan rencana harianmu."><form onSubmit={submit} className="space-y-3" noValidate>
  <Field label="Email" id="email" error={eErr}><input id="email" type="email" autoComplete="email" className="inp" value={email} onChange={e=>setEmail(e.target.value)} onBlur={()=>setT({...t,e:true})} {...ed(eErr,'email')}/></Field>
  <Field label="Kata sandi" id="pw" error={pErr}><PasswordInput id="pw" autoComplete="current-password" value={pw} onChange={e=>setPw(e.target.value)} onBlur={()=>setT({...t,p:true})} {...ed(pErr,'pw')}/></Field>
  <div className="text-right text-xs"><Link to="/forgot-password" className="text-accent underline">Lupa kata sandi?</Link></div>
  {err&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}
  <Button className="w-full" disabled={!valid||busy}>{busy?'Memproses…':'Masuk'}</Button></form>
  <p className="text-center text-sm">Belum punya akun? <Link to="/register" className="text-accent underline">Daftar</Link></p></Layout>}
export function Register(){
 const {signUp}=useAuth();const [f,setF]=useState({name:'',email:'',pw:'',pw2:''});const [busy,setBusy]=useState(false);const [err,setErr]=useState<string|null>(null);const [sent,setSent]=useState(false);const [t,setT]=useState<Record<string,boolean>>({})
 const set=(k:string)=>({value:(f as Record<string,string>)[k],onChange:(e:React.ChangeEvent<HTMLInputElement>)=>setF({...f,[k]:e.target.value}),onBlur:()=>setT({...t,[k]:true})})
 const errs={name:t.name&&!f.name.trim()?'Nama wajib diisi':null,email:t.email&&!isEmail(f.email)?'Format email tidak valid':null,pw:t.pw&&f.pw.length<8?'Minimal 8 karakter':null,pw2:t.pw2&&f.pw2!==f.pw?'Konfirmasi tidak cocok':null}
 const valid=isCloud&&f.name.trim()&&isEmail(f.email)&&f.pw.length>=8&&f.pw===f.pw2;const st=passwordStrength(f.pw)
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!valid||busy)return;setBusy(true);setErr(null);const r=await signUp(f.name.trim(),f.email.trim(),f.pw);setBusy(false);if(r.error)setErr(r.error);else if(r.verify)setSent(true)}
 if(sent)return <Layout title="Cek emailmu" sub="Akunmu belum aktif."><p className="text-sm">Kami mengirim tautan verifikasi ke <b>{f.email}</b>. Buka tautan itu, lalu masuk.</p><Link to="/login" className="btn inline-block">Ke halaman masuk</Link></Layout>
 return <Layout title="Buat akunmu" sub="Mulai atur waktu dengan akun Lanila."><form onSubmit={submit} className="space-y-3" noValidate>
  <Field label="Nama lengkap" id="name" error={errs.name}><input id="name" autoComplete="name" className="inp" {...set('name')} {...ed(errs.name,'name')}/></Field>
  <Field label="Email" id="remail" error={errs.email}><input id="remail" type="email" autoComplete="email" className="inp" {...set('email')} {...ed(errs.email,'remail')}/></Field>
  <Field label="Kata sandi" id="rpw" error={errs.pw} hint={f.pw?`Kekuatan: ${st.label}`:'Minimal 8 karakter'}><PasswordInput id="rpw" autoComplete="new-password" {...set('pw')} {...ed(errs.pw,'rpw')}/></Field>
  <Field label="Konfirmasi kata sandi" id="rpw2" error={errs.pw2}><PasswordInput id="rpw2" autoComplete="new-password" {...set('pw2')} {...ed(errs.pw2,'rpw2')}/></Field>
  {err&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}<Button className="w-full" disabled={!valid||busy}>{busy?'Memproses…':'Buat Akun'}</Button></form>
  <p className="text-center text-sm">Sudah punya akun? <Link to="/login" className="text-accent underline">Masuk</Link></p></Layout>}
export function Forgot(){
 const {resetPassword}=useAuth();const [email,setEmail]=useState('');const [done,setDone]=useState(false);const [busy,setBusy]=useState(false)
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!isEmail(email)||!isCloud)return;setBusy(true);await resetPassword(email.trim());setBusy(false);setDone(true)}
 return <Layout title="Lupa kata sandi" sub="Masukkan email akunmu untuk menerima tautan reset.">{done?<p role="status" className="text-sm">Jika email terdaftar, tautan reset sudah dikirim.</p>:
  <form onSubmit={submit} className="space-y-3" noValidate><Field label="Email" id="femail"><input id="femail" type="email" className="inp" value={email} onChange={e=>setEmail(e.target.value)}/></Field><Button className="w-full" disabled={!isEmail(email)||!isCloud||busy}>Kirim tautan</Button></form>}
  <p className="text-center text-sm"><Link to="/login" className="text-accent underline">Kembali ke masuk</Link></p></Layout>}
export function Reset(){
 const {user,loading,updatePassword}=useAuth();const nav=useNavigate();const [pw,setPw]=useState('');const [pw2,setPw2]=useState('');const [err,setErr]=useState<string|null>(null)
 const ok=pw.length>=8&&pw===pw2
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!ok)return;const m=await updatePassword(pw);if(m)setErr(m);else{await supabase?.auth.signOut();nav('/login',{replace:true})}}
 if(!loading&&!user)return <Layout title="Tautan tidak valid" sub="Tautan reset kedaluwarsa atau sudah dipakai."><Link to="/forgot-password" className="btn inline-block">Minta tautan baru</Link></Layout>
 return <Layout title="Kata sandi baru" sub="Pilih kata sandi baru untuk akunmu."><form onSubmit={submit} className="space-y-3" noValidate>
  <Field label="Kata sandi baru" id="np" hint="Minimal 8 karakter"><PasswordInput id="np" autoComplete="new-password" value={pw} onChange={e=>setPw(e.target.value)}/></Field>
  <Field label="Konfirmasi" id="np2" error={pw2&&pw!==pw2?'Konfirmasi tidak cocok':null}><PasswordInput id="np2" autoComplete="new-password" value={pw2} onChange={e=>setPw2(e.target.value)}/></Field>
  {err&&<p role="alert" className="text-sm text-red-600 dark:text-red-400">{err}</p>}<Button className="w-full" disabled={!ok}>Simpan</Button></form></Layout>}
