import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  balance: number;
  level: number;
  avatar_url?: string;
}

export interface Item {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  value: number;
  obtainedAt: string;
  caseId: number;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addToInventory: (item: Omit<Item, 'id' | 'obtainedAt'>) => Promise<void>;
  getInventory: () => Promise<Item[]>;
  recordCaseOpening: (caseId: number, caseName: string, item: Item) => Promise<void>;
  removeFromInventory: (itemId: string) => Promise<void>;
  tradeItem: (offeredItemId: string, newItem: Omit<Item, 'id' | 'obtainedAt'>) => Promise<void>;
  inventory: Item[];
  refreshInventory: () => Promise<void>;
  removeItems: (itemIds: string[]) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'obtainedAt'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<Item[]>([]);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setInventory([]);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      refreshInventory();
    }
  }, [user, isAuthenticated]);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (walletError) throw walletError;

      if (profileData && walletData) {
        setUser({
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          createdAt: profileData.created_at,
          balance: parseFloat(walletData.balance),
          level: profileData.level,
          avatar_url: profileData.avatar_url,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters' };
      if (username.length < 3 || username.length > 20) return { success: false, message: 'Username must be between 3 and 20 characters' };

      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username } },
        });

        if (signUpError) return { success: false, message: signUpError.message };
        if (!authData.user) return { success: false, message: 'Registration failed.' };
        return { success: true, message: 'Registration successful!' };
      }
      return { success: false, message: 'Supabase not configured' };
    } catch (error) {
      return { success: false, message: 'Registration failed.' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };
        if (!data.user) return { success: false, message: 'Login failed.' };
        await fetchUserProfile(data.user.id);
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: 'Supabase not configured' };
    } catch (error) {
      return { success: false, message: 'Login error' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setInventory([]);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !supabase) return;
    try {
      const profileUpdates: any = {};
      if (updates.level !== undefined) profileUpdates.level = updates.level;
      if (updates.username !== undefined) profileUpdates.username = updates.username;
      if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
      }

      if (updates.balance !== undefined) {
        await supabase.from('wallets').update({ balance: updates.balance }).eq('user_id', user.id);
      }

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const addToInventory = async (item: Omit<Item, 'id' | 'obtainedAt'>) => {
    if (!user || !supabase) return;
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('pokemon_items')
        .select('id')
        .eq('name', item.name)
        .single();

      if (itemError || !itemData) throw new Error('Item not found');

      const { error } = await supabase.from('user_inventory').insert({
        user_id: user.id,
        item_id: itemData.id,
        status: 'available'
      });
      
      if (error) throw error;
      await refreshInventory();
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast.error('No se pudo guardar la carta en tu inventario.');
    }
  };

  const getInventory = async (): Promise<Item[]> => {
    if (!user || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select('*, pokemon_items(*)')
        .eq('user_id', user.id)
        .eq('status', 'available');

      if (error) throw error;

      return (data || []).map((inv) => ({
        id: inv.id,
        name: inv.pokemon_items?.name || 'Unknown Item',
        rarity: (inv.pokemon_items?.rarity as any) || 'Common',
        value: parseFloat(inv.pokemon_items?.price || '0'),
        obtainedAt: inv.obtained_at,
        caseId: inv.item_id,
        image: inv.pokemon_items?.image_url,
      }));
    } catch (error) { return []; }
  };

  const recordCaseOpening = async (caseId: number, caseName: string, item: Item) => {
    if (!user || !supabase) return;
    try {
      await supabase.from('game_results').insert({
        user_id: user.id,
        game_type: 'case',
        roll: Math.random() * 100,
        server_seed: 'seed_hash',
        client_seed: 'client_seed',
        nonce: 1
      });
    } catch (error) { console.error('Error recording opening:', error); }
  };

  const removeFromInventory = async (itemId: string) => {
    if (!user || !supabase) return;
    try {
      await supabase.from('user_inventory').delete().eq('id', itemId).eq('user_id', user.id);
      await refreshInventory();
    } catch (error) { console.error('Error removing:', error); }
  };

  const tradeItem = async (offeredItemId: string, newItem: Omit<Item, 'id' | 'obtainedAt'>) => {
    await removeFromInventory(offeredItemId);
    await addToInventory(newItem);
  };

  const refreshInventory = async () => {
    const items = await getInventory();
    setInventory(items);
  };

  const removeItems = async (itemIds: string[]) => {
    if (!user || !supabase || itemIds.length === 0) return;
    try {
      setInventory(prev => prev.filter(item => !itemIds.includes(item.id)));
      const { error } = await supabase.from('user_inventory').delete().in('id', itemIds).eq('user_id', user.id);
      if (error) { await refreshInventory(); throw error; }
      return { success: true };
    } catch (error) { toast.error('Error de sincronización con el inventario.'); throw error; }
  };

  const addItem = async (item: Omit<Item, 'id' | 'obtainedAt'>) => {
    await addToInventory(item);
  };

  return (
    <AuthContext.Provider
      value={{
        user, isAuthenticated, loading, login, register, logout,
        updateUser, addToInventory, getInventory, recordCaseOpening,
        removeFromInventory, tradeItem, inventory, refreshInventory,
        removeItems, addItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
