import {useEffect,useState} from 'react'
import {Check,Copy,Pencil,Trash2,Undo2} from 'lucide-react'
import {useStore} from '../../stores/useStore'
import {Block,duration} from '../../lib/time'
import {PRIORITY_LABEL,catColor} from '../../lib/categories'
import {fmtDur} from '../../lib/schedule'
import {Badge,Button,Modal} from '../ui'
import {useToast} from '../Toast'
export default function BlockDetail({block,onClose,onEdit}:{block:Block|null;onClose:()=>void;onEdit:(b:Block)=>void}){
 const {tasks,toggleBlock,delBlock,addBlock}=useStore();const toast=useToast();const [confirming,setConfirming]=useState(false)
 useEffect(()=>setConfirming(false),[block?.id])
 const task=tasks.find(t=>t.id===block?.taskId)
 return <Modal open={!!block} onClose={onClose} title="Detail blok">{block&&<div className="space-y-3">
  <div className="border-l-4 pl-3" style={{borderColor:catColor(block.category)}}><p className={`text-lg font-semibold ${block.done?'line-through opacity-70':''}`}>{block.title}</p>
   <p className="text-sm text-muted">{block.date} · {block.start}–{block.end} · {fmtDur(duration(block))}</p></div>
  <div className="flex flex-wrap gap-1"><Badge tone="violet">{block.category}</Badge><Badge tone={block.priority==='high'?'red':block.priority==='low'?'slate':'amber'}>Prioritas {PRIORITY_LABEL[block.priority??'mid']}</Badge><Badge tone={block.done?'green':'slate'}>{block.done?'Selesai':'Belum selesai'}</Badge></div>
  {task&&<p className="text-sm">Tugas terkait: <b>{task.title}</b></p>}
  {block.description&&<p className="whitespace-pre-wrap text-sm">{block.description}</p>}
  {block.notes&&<p className="whitespace-pre-wrap text-sm text-muted">Catatan: {block.notes}</p>}
  {confirming?<div role="alertdialog" className="rounded-xl border border-red-500 p-3 text-sm"><p>Hapus blok ini? Tugas terkait tidak ikut terhapus.</p><div className="mt-2 flex gap-2"><Button variant="danger" onClick={()=>{delBlock(block.id);toast('Blok dihapus');onClose()}}>Ya, hapus</Button><Button variant="ghost" onClick={()=>setConfirming(false)}>Batal</Button></div></div>
  :<div className="flex flex-wrap gap-2"><Button onClick={()=>{toggleBlock(block.id);toast(block.done?'Ditandai belum selesai':'Blok ditandai selesai')}} className="inline-flex items-center gap-1">{block.done?<Undo2 size={14}/>:<Check size={14}/>}{block.done?'Batalkan selesai':'Tandai selesai'}</Button>
   <Button variant="ghost" onClick={()=>onEdit(block)} className="inline-flex items-center gap-1"><Pencil size={14}/>Ubah</Button>
   <Button variant="ghost" onClick={()=>{addBlock({...block,id:crypto.randomUUID(),title:`${block.title} (salinan)`,done:false});toast('Blok diduplikasi');onClose()}} className="inline-flex items-center gap-1"><Copy size={14}/>Duplikat</Button>
   <Button variant="ghost" onClick={()=>setConfirming(true)} className="inline-flex items-center gap-1 text-red-600 dark:text-red-400"><Trash2 size={14}/>Hapus</Button>
   <Button variant="ghost" onClick={onClose}>Tutup</Button></div>}</div>}</Modal>}
