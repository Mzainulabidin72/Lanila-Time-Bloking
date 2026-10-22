export const isEmail=(s:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
export function passwordStrength(p:string):{score:number;label:string}{
 let s=0;if(p.length>=8)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p)||p.length>=12)s++
 return {score:s,label:['Sangat lemah','Lemah','Cukup','Kuat','Sangat kuat'][s]}}
