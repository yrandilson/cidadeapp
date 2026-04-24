-- ============================================================
--  CidadeApp — SQL completo para o Supabase
--  Execute este script no SQL Editor do seu projeto Supabase
--  Acesse: https://app.supabase.com -> seu projeto -> SQL Editor
-- ============================================================

-- 1. PERFIS DE USUÁRIO
-- (complementa a tabela auth.users do Supabase Auth)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'motoboy')),
  vehicle_type TEXT CHECK (vehicle_type IN ('carro', 'moto')),
  is_online   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CORRIDAS (Transporte tipo Uber)
CREATE TABLE rides (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  vehicle_type  TEXT NOT NULL CHECK (vehicle_type IN ('carro', 'moto')),
  price         NUMERIC(10,2) NOT NULL,
  platform_fee  NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','in_progress','finished','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESTAURANTES
CREATE TABLE restaurants (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL,        -- Ex: Lanches, Pizzaria, Marmita...
  address    TEXT NOT NULL,
  is_open    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITENS DO CARDÁPIO
CREATE TABLE menu_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  available     BOOLEAN DEFAULT TRUE
);

-- 5. PEDIDOS DE DELIVERY (tipo iFood)
CREATE TABLE orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  motoboy_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  items         JSONB NOT NULL DEFAULT '[]',   -- array de OrderItem
  total         NUMERIC(10,2) NOT NULL,
  delivery_fee  NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  platform_fee  NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  address       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN (
                    'pending','confirmed','preparing',
                    'collected','delivering','delivered','cancelled'
                  )),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  SEGURANÇA — Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuário vê e edita só o próprio perfil
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rides: passageiro vê as suas, motorista vê as pendentes e as suas
CREATE POLICY "rides_select" ON rides FOR SELECT USING (TRUE);
CREATE POLICY "rides_insert" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "rides_update" ON rides FOR UPDATE USING (
  auth.uid() = passenger_id OR auth.uid() = driver_id OR driver_id IS NULL
);

-- Restaurantes: qualquer autenticado lê
CREATE POLICY "restaurants_select" ON restaurants FOR SELECT USING (TRUE);

-- Menu items: qualquer autenticado lê
CREATE POLICY "menu_items_select" ON menu_items FOR SELECT USING (TRUE);

-- Orders: cliente vê os seus, motoboy vê os pendentes e os seus
CREATE POLICY "orders_select" ON orders FOR SELECT USING (TRUE);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (
  auth.uid() = customer_id OR auth.uid() = motoboy_id OR motoboy_id IS NULL
);

-- ============================================================
--  REALTIME — Ativa atualizações em tempo real
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================================
--  DADOS DE EXEMPLO — Restaurantes e cardápio para testar
-- ============================================================

INSERT INTO restaurants (name, category, address, is_open) VALUES
  ('Lanchonete da Maria',  'Lanches',   'Rua 1, Centro',      TRUE),
  ('Pizzaria do João',     'Pizza',     'Av. Principal, 200',  TRUE),
  ('Marmitaria Sabor',     'Marmitas',  'Rua das Flores, 50',  TRUE);

-- Cardápio: Lanchonete da Maria
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
  ((SELECT id FROM restaurants WHERE name='Lanchonete da Maria'), 'X-Burguer',    'Hamburguer, queijo, alface, tomate',       14.00),
  ((SELECT id FROM restaurants WHERE name='Lanchonete da Maria'), 'X-Frango',     'Frango grelhado, queijo, molho especial',  12.00),
  ((SELECT id FROM restaurants WHERE name='Lanchonete da Maria'), 'Combo Duplo',  'Dois hamburguer + batata + refri',         22.00),
  ((SELECT id FROM restaurants WHERE name='Lanchonete da Maria'), 'Refrigerante', 'Lata 350ml',                                4.00);

-- Cardápio: Pizzaria do João
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
  ((SELECT id FROM restaurants WHERE name='Pizzaria do João'), 'Pizza Mussarela',     'Molho, mussarela e orégano (8 fatias)',  35.00),
  ((SELECT id FROM restaurants WHERE name='Pizzaria do João'), 'Pizza Calabresa',     'Molho, calabresa e cebola (8 fatias)',   38.00),
  ((SELECT id FROM restaurants WHERE name='Pizzaria do João'), 'Pizza Frango Catup.', 'Frango, catupiry e milho (8 fatias)',    40.00);

-- Cardápio: Marmitaria Sabor
INSERT INTO menu_items (restaurant_id, name, description, price) VALUES
  ((SELECT id FROM restaurants WHERE name='Marmitaria Sabor'), 'Marmita P',   'Arroz, feijão, 1 proteína, salada',   12.00),
  ((SELECT id FROM restaurants WHERE name='Marmitaria Sabor'), 'Marmita G',   'Arroz, feijão, 2 proteínas, salada',  16.00),
  ((SELECT id FROM restaurants WHERE name='Marmitaria Sabor'), 'Suco Natural','Copo 300ml, vários sabores',           5.00);
