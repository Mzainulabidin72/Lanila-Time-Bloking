import {useEffect,useState} from 'react'
import {PRODUCTS,CURRENT} from '../registry/products'
import {probe,Status} from '../lib/ecosystem'
import {Badge} from '../components/ui'
const label=(s?:Status):[string,'slate'|'green'|'amber'|'red']=>!s?['Memeriksa…','slate']:s.state==='verified'?['Terhubung (database bersama)','green']:s.state==='error'?['Error koneksi','red']:s.state==='unconfigured'?['Perlu konfigurasi','amber']:['Belum ada tabel terverifikasi','slate']
export default function Integrations(){
 const [st,setSt]=useState<Record<string,Status>>({})
 useEffect(()=>{PRODUCTS.filter(p=>p.id!==CURRENT).forEach(p=>probe(p.id).then(r=>setSt(x=>({...x,[p.id]:r}))))},[])
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Integrasi Lanila</h1>
  <p className="text-sm text-slate-500">"Terhubung" berarti akunmu berhasil membaca tabel aplikasi tersebut di project Supabase bersama. Ini belum berarti sinkronisasi event antar aplikasi aktif; fitur itu belum dibuat.</p>
  {PRODUCTS.filter(p=>p.id!==CURRENT).map(p=>{const [t,tone]=label(st[p.id]);return <div key={p.id} className="card flex items-start gap-3"><span className="mt-1.5 h-3 w-3 rounded-full" style={{background:p.accent}}/><div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p>
   <p className="text-xs text-slate-500">Kemampuan yang disiapkan: {p.capabilities.join(', ')}</p>
   <p className="text-xs text-slate-500">{p.url?<>Tujuan: <a className="underline" href={p.url}>buka aplikasi</a></>:'URL belum dikonfigurasi (.env), jadi tautan tidak ditampilkan.'}{st[p.id]?.msg&&` · ${st[p.id].msg}`}</p></div><Badge tone={tone}>{t}</Badge></div>})}</div>}
