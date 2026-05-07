import { createClient } from '@supabase/supabase-js';

// Las variables de entorno en Vite se acceden a través de import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Crear un cliente mock si no hay credenciales válidas
let supabase;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
  // Credenciales válidas - usar Supabase real
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Conectando a Supabase...');
} else {
  // Sin credenciales válidas - crear mock para desarrollo
  console.warn('⚠️ Supabase no configurado. Usando modo desarrollo con almacenamiento local.');
  
  // Mock más robusto de Supabase client que maneja async correctamente
  const mockQueryBuilder = {
    select: () => ({
      limit: () => ({
        then: (onSuccess: any, onError?: any) => {
          // Simular error de tabla no encontrada para desarrollo
          onSuccess({
            data: null,
            error: {
              message: 'relation "profiles" does not exist',
              code: 'PGRST116',
            }
          });
          return Promise.resolve();
        }
      }),
      catch: () => ({})
    }),
    insert: async (data: any) => ({ data: null, error: null }),
    update: async (data: any) => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    upsert: async (data: any) => ({ data: null, error: null }),
  };

  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => mockQueryBuilder,
    rpc: async () => ({ data: null, error: null }),
  } as any;
}

export { supabase };

// Exportamos un booleano para saber si la conexión está lista
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);
