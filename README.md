# Sonin Links

Vitrine pública de **achados e ofertas curadas**, otimizada para tráfego vindo de redes sociais (**TikTok**, **Instagram** e **WhatsApp**), com área administrativa mobile-first, páginas de departamentos e PWA instalável.

---

## Visão geral

O **Sonin Links** foi construído para substituir listas estáticas de links por uma vitrine rápida, visualmente limpa e controlada pelo próprio curador:

- **Vitrine pública (`/`, `/tt`, `/ig`, `/wpp`):** cards padronizados sem preços ou selos de desconto visíveis, com pílula da loja sobre a foto, ordenação cronológica (novidades primeiro), busca instantânea no cliente (`?q=`, ignorando acentos e maiúsculas) e filtro dinâmico por loja (`?loja=`).
- **Departamentos (`/c/[slug]`):** menu lateral (drawer) acessível com os departamentos ativos que possuem ofertas publicadas e URLs compartilháveis por categoria.
- **Página ponte para o WhatsApp (`/grupo`):** destino único para link na bio, com textos gerenciáveis no admin, benefícios curtos e imagem Open Graph `1200×630` gerada dinamicamente.
- **Tratamento de navegadores embutidos:** detecção automática de WebViews (`TikTok`, `Instagram`, `Facebook`, `Messenger`) com painel de saída (`intent:` no Android e instruções manuais no iOS) e interceptação inteligente em **todos** os botões de WhatsApp para evitar links quebrados de convite dentro do app.
- **Painel administrativo (`/admin`):** protegido no servidor, voltado para postagem rápida pelo celular, com CRUD de achados (até 3 departamentos por item), CRUD de departamentos (slug automático editável) e configurações do grupo/modal.
- **Padronização automática de imagens:** no upload pelo navegador, fotos são validadas (`>= 400 px`), centralizadas em canvas quadrado `800×800` com fundo branco (`#FFFFFF`) e margem interna de ~4%, e exportadas em WebP (fallback JPEG) visando até `150 KB` antes do envio direto ao Supabase Storage.
- **PWA instalável:** suporte a instalação em Android, iOS e desktop com `manifest.webmanifest`, ícones dedicados (incluindo `maskable` e `apple-touch-icon`), Service Worker *network-first* para HTML público e página `/offline`.

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework & Roteamento | Next.js `16.4.6` (App Router) + React `19.3.0` + TypeScript |
| Estilização & Ícones | Tailwind CSS `4` (tokens CSS como fonte única de verdade) + `lucide-react` |
| Banco, Auth & Storage | Supabase (`PostgreSQL` com RLS + `Supabase Auth` + `Supabase Storage`) |
| Validação | Zod `4` (cliente/env e Server Actions) |
| Navegador embutido | `inapp-spy` + política centralizada por aplicativo |
| Hospedagem & CDN | Netlify (com cache curto de borda `s-maxage=30` nas rotas públicas) |

---

## Arquitetura e segurança

- **Sem `SUPABASE_SERVICE_ROLE_KEY`:** todas as operações do admin autenticam via sessão do Supabase Auth e passam pelas políticas de **Row Level Security (RLS)** do PostgreSQL (`public.is_admin()` valida `app_metadata.role = 'admin'`, jamais `user_metadata`).
- **Autorização em camadas:** `src/proxy.ts` protege `/admin/*` antes da renderização, o layout protegido e **todas** as Server Actions em `src/app/admin/actions/` executam `requireAdmin()` via `supabase.auth.getUser()` e validam payloads com Zod.
- **Upload direto ao Storage:** imagens vão diretamente do navegador para o bucket `achados-images` (políticas de escrita exclusivas para admin, `5 MB` máx., JPEG/PNG/WebP), sem trafegar binários por funções serverless.
- **Proteção contra XSS e clickjacking:** zero uso de `dangerouslySetInnerHTML`, sanitização de URLs (`toSafeHttpUrl` + constraints `CHECK` no PostgreSQL), validação estrita do formato `https://chat.whatsapp.com/<código>` e headers de segurança (`Content-Security-Policy` dinâmica, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy`) em [next.config.ts](next.config.ts) e [netlify.toml](netlify.toml).
- **Service Worker seguro:** [public/sw.js](public/sw.js) nunca armazena `/admin`, `/api/*`, `/grupo` nem respostas autenticadas/privadas.

---

## Estrutura de pastas

```text
src/
  app/
    (public)/
      page.tsx                  # Vitrine principal (/)
      [source]/page.tsx         # Rotas por origem (/tt, /ig, /wpp)
      c/[slug]/page.tsx         # Vitrine filtrada por departamento
      grupo/
        page.tsx                # Página ponte para o grupo do WhatsApp
        opengraph-image.tsx     # OG image 1200x630 específica do convite
      offline/page.tsx          # Fallback offline do PWA
    admin/
      actions/                  # Server Actions modularizadas (auth, achados, categories, settings)
      (protected)/
        page.tsx                # Dashboard
        achados/                # Listagem, criação e edição de achados
        departamentos/page.tsx  # CRUD de departamentos
        configuracoes/page.tsx  # Link do WhatsApp e modal de boas-vindas
      login/page.tsx
    favicon.ico
    manifest.ts
    opengraph-image.tsx         # OG image 1200x630 padrão do site
  components/
    admin/                      # Formulários, listas e upload direto do painel
    ui/                         # Primitivos de interface (botões, inputs)
    achado-card.tsx
    departments-drawer.tsx
    in-app-browser-banner.tsx
    storefront-header.tsx
    storefront-view.tsx
    welcome-modal.tsx
    whatsapp-link.tsx
  hooks/                        # Hooks reutilizáveis (ex.: useDialogFocusTrap)
  lib/
    data/                       # Queries públicas (REST) e administrativas (SSR)
    errors/                     # Mapeamento amigável de erros Zod e Supabase
    supabase/                   # Clients browser/server, env e padronização de imagens
    utils/                      # Utilitários puros (clipboard, datas, busca, URLs)
    validators/                 # Schemas Zod compartilhados
    config.ts                   # Textos da UI, origens permitidas e configurações
supabase/
  migrations/                   # Migrations SQL idempotentes (schema, RLS, GRANTs e seeds)
public/
  icons/                        # Ícones PWA (192x192, 512x512, maskable, apple-touch-icon)
  sw.js                         # Service Worker
docs/
  DEPLOY.md                     # Guia completo de deploy, variáveis e testes reais
  REPROCESS-IMAGES.md           # Script opcional para reprocessar imagens antigas
```

---

## Como rodar localmente

### Pré-requisitos
- Node.js `22+`
- Um projeto no [Supabase](https://supabase.com)

### 1. Instalar dependências e configurar variáveis

```bash
npm install
cp .env.example .env.local
```

Preencha `.env.local` (nunca commite este arquivo):

| Variável | Escopo | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Pública | URL base do site (em local: `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL do projeto Supabase (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Chave `Publishable` / `anon public` do Supabase |
| `NEXT_PUBLIC_WHATSAPP_GROUP_URL` | Pública (opcional) | Link fallback do WhatsApp enquanto `site_settings` estiver vazio |
| `ADMIN_EMAIL` | Somente servidor | E-mail único do administrador autorizado no `/admin` |

### 2. Aplicar as migrations e criar o administrador no Supabase

No **SQL Editor** do Supabase, execute as migrations nesta ordem:

1. `supabase/migrations/20261121000001_initial_schema.sql`
2. `supabase/migrations/20261122000001_add_price_note.sql`
3. `supabase/migrations/20261122000002_grant_table_privileges.sql`
4. `supabase/migrations/20261126000001_make_price_cents_nullable.sql`
5. `supabase/migrations/20261126000002_categories.sql`
6. `supabase/migrations/20261126000003_security_hardening.sql`

Depois, em **Authentication → Users**, desative cadastros públicos, crie o usuário único do dono e promova para `admin` via SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'seu-email@exemplo.com';
```

### 3. Executar em desenvolvimento ou produção local

```bash
npm run dev      # Servidor de desenvolvimento em http://localhost:3000
npm run lint     # Verificação ESLint + regras Next/React
npm run build    # Build de produção
npm run start    # Servir build de produção (necessário para validar PWA/SW)
```

---

## Documentação complementar

- **[Guia de Deploy (Supabase + Netlify) e checklist em aparelhos reais](docs/DEPLOY.md)** — passo a passo para publicação, variáveis de ambiente e matriz de testes (Chrome/Safari/TikTok/Instagram).
- **[Reprocessamento opcional de imagens](docs/REPROCESS-IMAGES.md)** — referência de script para padronizar objetos antigos no bucket `achados-images`.
- **[Guia de arquitetura e escopo (`AGENTS.md`)](AGENTS.md)** — tokens de design, convenções de código, escopo do MVP e regras do projeto.
