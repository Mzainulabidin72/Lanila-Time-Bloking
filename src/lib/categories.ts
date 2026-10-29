export const CATS=['Deep Work','Administratif','Pribadi','Rapat','Belajar','Olahraga','Istirahat','Keluarga','Keuangan','Perencanaan Pernikahan']
const COL:Record<string,string>={'Deep Work':'#7445FF',Administratif:'#64748B',Pribadi:'#EC4899',Rapat:'#3985FF',Belajar:'#F59E0B',Olahraga:'#10B981',Istirahat:'#06B6D4',Keluarga:'#F97316',Keuangan:'#14B8A6','Perencanaan Pernikahan':'#F0566B'}
export const catColor=(c:string)=>COL[c]??'#7445FF'
export const PRIORITY_LABEL={low:'Rendah',mid:'Sedang',high:'Tinggi'} as const
