# 🚗 CidadeApp — Transporte + Delivery Local

Plataforma completa estilo Uber + iFood para cidades pequenas.

---

## 🛠️ SETUP LOCAL (passo a passo)

### 1. Instalar dependências

```bash
cd cidadeapp
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Dê um nome (ex: `cidadeapp`) e salve a senha do banco
4. Aguarde o projeto iniciar (~2 min)

### 3. Criar as tabelas no Supabase

1. No painel do seu projeto, clique em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Cole o conteúdo do arquivo `SUPABASE_SQL.sql`
4. Clique em **Run** (▶️)

Isso vai criar todas as tabelas, políticas de segurança e dados de exemplo.

### 4. Pegar as credenciais

1. No Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL** → ex: `https://xyzxyz.supabase.co`
   - **anon public key** → chave longa que começa com `eyJ...`

### 5. Configurar variáveis de ambiente

Edite o arquivo `.env.local` e cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

### 6. Rodar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000) ✅

---

## 🌐 DEPLOY NA VERCEL

### Opção A — Via GitHub (recomendado)

1. Crie um repositório no [GitHub](https://github.com/new)
2. Inicialize e suba o código:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git remote add origin https://github.com/SEU_USUARIO/cidadeapp.git
   git push -u origin main
   ```
3. Acesse [https://vercel.com](https://vercel.com) → **Add New Project**
4. Importe o repositório do GitHub
5. Na tela de configuração, adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em **Deploy** → aguarde ~2 min ✅

### Opção B — Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
# Siga as instruções e adicione as env vars quando solicitado
```

---

## 📱 PÁGINAS DO SISTEMA

| Página | URL | Quem usa |
|--------|-----|----------|
| Home | `/` | Todos |
| Login | `/login` | Todos |
| Cadastro | `/register` | Todos |
| Dashboard passageiro | `/passenger` | Passageiro |
| Nova corrida | `/passenger/nova-corrida` | Passageiro |
| Dashboard motorista | `/driver` | Motorista / Motoboy |
| Delivery | `/delivery` | Todos |
| Fazer pedido | `/delivery/novo-pedido?restaurant=ID` | Passageiro |
| Admin | `/admin` | Admin |

---

## 💰 MODELO DE RECEITA

- **Corrida de moto**: R$ 7,00 → plataforma fica 10% = R$ 0,70
- **Corrida de carro**: R$ 15,00 → plataforma fica 10% = R$ 1,50
- **Cada pedido de delivery**: taxa fixa de R$ 2,00
- **Assinatura motorista**: R$ 29/mês (adicionar depois)

---

## 🔥 ESTRUTURA DE ARQUIVOS

```
cidadeapp/
├── app/
│   ├── page.tsx                   ← Home
│   ├── login/page.tsx             ← Login
│   ├── register/page.tsx          ← Cadastro
│   ├── passenger/
│   │   ├── page.tsx               ← Dashboard passageiro
│   │   └── nova-corrida/page.tsx  ← Solicitar corrida
│   ├── driver/page.tsx            ← Dashboard motorista
│   ├── delivery/
│   │   ├── page.tsx               ← Lista restaurantes
│   │   └── novo-pedido/page.tsx   ← Fazer pedido
│   └── admin/page.tsx             ← Painel admin
├── components/
│   ├── Navbar.tsx
│   └── RideCard.tsx
├── lib/
│   └── supabase.ts                ← Cliente Supabase
├── types/
│   └── database.ts                ← Tipos TypeScript
├── SUPABASE_SQL.sql               ← SQL das tabelas
├── .env.local                     ← Suas credenciais (não sobe pro GitHub!)
└── package.json
```

---

## 🚀 PRÓXIMOS PASSOS (evolução)

- [ ] Painel do motoboy para aceitar/entregar pedidos
- [ ] Notificações push (Supabase Realtime já está ativo)
- [ ] Cálculo de preço por distância (Google Maps API)
- [ ] Chat motorista ↔ passageiro
- [ ] Pagamento via Pix (Mercado Pago API)
- [ ] App mobile (Expo / React Native)
- [ ] Avaliação de motoristas e restaurantes
