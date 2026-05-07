-- ==========================================
-- POKEBOX PROFESSIONAL DATABASE SCHEMA
-- ==========================================
-- Descripción: Esquema completo para producción.
-- Incluye: Usuarios, Economía, Inventario, Azar Verificable (Provably Fair),
-- Batallas, Upgrades, Intercambios y Sistema de Referidos.

-- 1. LIMPIEZA TOTAL (Eliminar tablas antiguas para evitar conflictos)
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.trade_items CASCADE;
DROP TABLE IF EXISTS public.trades CASCADE;
DROP TABLE IF EXISTS public.upgrades CASCADE;
DROP TABLE IF EXISTS public.battle_participants CASCADE;
DROP TABLE IF EXISTS public.case_battles CASCADE;
DROP TABLE IF EXISTS public.game_results CASCADE;
DROP TABLE IF EXISTS public.rng_seeds CASCADE;
DROP TABLE IF EXISTS public.user_inventory CASCADE;
DROP TABLE IF EXISTS public.case_contents CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.pokemon_items CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.marketplace_listings CASCADE;
DROP TABLE IF EXISTS public.case_openings CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Eliminar tipos ENUM si existen
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.rarity_tier CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;
DROP TYPE IF EXISTS public.case_category CASCADE;
DROP TYPE IF EXISTS public.item_status CASCADE;
DROP TYPE IF EXISTS public.game_type CASCADE;
DROP TYPE IF EXISTS public.battle_status CASCADE;
DROP TYPE IF EXISTS public.trade_status CASCADE;

-- 2. DEFINICIÓN DE TIPOS (ENUMS)
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE public.rarity_tier AS ENUM ('Common', 'Rare', 'Epic', 'Legendary', 'Mythic');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdraw', 'case_buy', 'upgrade_bet', 'battle_entry', 'market_sell', 'referral_bonus');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE public.case_category AS ENUM ('new', 'hot', 'limited', 'budget', 'official');
CREATE TYPE public.item_status AS ENUM ('available', 'locked_battle', 'locked_trade', 'sold', 'withdrawn');
CREATE TYPE public.game_type AS ENUM ('case', 'upgrade', 'battle');
CREATE TYPE public.battle_status AS ENUM ('waiting', 'in_progress', 'finished', 'cancelled');
CREATE TYPE public.trade_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- 3. MÓDULO DE USUARIOS Y PERFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role public.user_role DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp BIGINT DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20)
);

-- 4. MÓDULO DE ECONOMÍA
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  total_deposited DECIMAL(12, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type public.transaction_type NOT NULL,
  status public.transaction_status DEFAULT 'pending',
  metadata JSONB, -- Para guardar detalles como "case_id" o "stripe_id"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATÁLOGO DE OBJETOS Y CAJAS
CREATE TABLE public.pokemon_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rarity public.rarity_tier NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  pokemon_type TEXT, -- fuego, agua, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.cases (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category public.case_category DEFAULT 'official',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.case_contents (
  case_id INTEGER REFERENCES public.cases(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES public.pokemon_items(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 100, -- Sistema de probabilidades por pesos
  PRIMARY KEY (case_id, item_id)
);

-- 6. INVENTARIO DE USUARIOS
CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER REFERENCES public.pokemon_items(id) NOT NULL,
  status public.item_status DEFAULT 'available',
  obtained_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROVABLY FAIR (AZAR VERIFICABLE)
CREATE TABLE public.rng_seeds (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  server_seed_hashed TEXT NOT NULL,
  client_seed TEXT,
  nonce INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_type public.game_type NOT NULL,
  roll DECIMAL(5, 2) NOT NULL, -- El número resultante (00.00 a 99.99)
  server_seed TEXT NOT NULL,
  client_seed TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MODOS DE JUEGO (BATALLAS, UPGRADES)
CREATE TABLE public.case_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.battle_status DEFAULT 'waiting',
  total_cost DECIMAL(12, 2) NOT NULL,
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.battle_participants (
  battle_id UUID REFERENCES public.case_battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL,
  PRIMARY KEY (battle_id, slot_number)
);

CREATE TABLE public.upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_spent_id UUID REFERENCES public.user_inventory(id),
  target_item_id INTEGER REFERENCES public.pokemon_items(id),
  chance DECIMAL(5, 2) NOT NULL,
  is_win BOOLEAN NOT NULL,
  roll_result DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INTERCAMBIOS (TRADES)
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.trade_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE public.trade_items (
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.user_inventory(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id),
  PRIMARY KEY (trade_id, inventory_item_id)
);

-- 10. MARKETING (REFERIDOS)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  commission_earned DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ÍNDICES PARA RENDIMIENTO
CREATE INDEX idx_inventory_user ON public.user_inventory(user_id);
CREATE INDEX idx_inventory_status ON public.user_inventory(status);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_cases_active ON public.cases(is_active);

-- 12. SEGURIDAD (RLS - Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Ejemplo: Solo el dueño puede ver su cartera)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Wallets are private" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Inventory viewable by owner" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);

-- 13. TRIGGERS (AUTOMATIZACIÓN)
-- Crear perfil y cartera automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  
  INSERT INTO public.profiles (id, username, email, referral_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), NEW.email, ref_code);
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 10.00); -- Regalo de bienvenida de 10 PokeCoins
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
