import {createClient} from '@supabase/supabase-js'
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined
// Anon key only. Never put a service-role key in client code.
export const supabase=url&&key?createClient(url,key):null
export const isCloud=!!supabase
