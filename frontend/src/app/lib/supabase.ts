import { createClient } from '@supabase/supabase-js';

// Las variables de entorno en Vite se acceden a través de import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL o Anon Key no encontradas en el archivo .env');
}

// Creamos el cliente de Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Exportamos un booleano para saber si la conexión está lista
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
