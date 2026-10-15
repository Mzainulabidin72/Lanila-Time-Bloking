import {PRODUCTS,CURRENT} from '../registry/products'
export default function Integrations(){
 return <div className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Integrasi Lanila</h1>
  <p className="text-sm text-slate-500">Belum ada integrasi yang diverifikasi. Status "Terhubung" hanya muncul setelah koneksi benar-benar diverifikasi oleh adapter.</p>
  {PRODUCTS.filter(p=>p.id!==CURRENT).map(p=><div key={p.id} className="card flex items-start gap-3"><span className="mt-1.5 h-3 w-3 rounded-full" style={{background:p.accent}}/><div className="flex-1"><p className="font-semibold">{p.name}</p>
   <p className="text-xs text-slate-500">Kemampuan yang disiapkan: {p.capabilities.join(', ')}</p></div>
   <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-700">{p.url?'Belum terhubung':'Perlu konfigurasi'}</span></div>)}</div>}
