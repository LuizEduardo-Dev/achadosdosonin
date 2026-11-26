# Guia de Deploy de Preview (Supabase + Netlify)

Este guia documenta **tudo o que precisa ser feito manualmente** para publicar um **deploy de preview** da branch `feature/visual-redesign` no Netlify — sem fazer merge na `main` nem publicar produção — e testar o site (incluindo o comportamento do navegador embutido, item 2.5 do `AGENTS.md`) em aparelhos reais.

---

## 1. Preparar o projeto no Supabase

> Se você já criou o projeto do Supabase nos testes locais, pode reutilizá-lo para o preview (basta garantir que todas as migrations estão aplicadas e que as URLs de Auth incluem o domínio de preview do Netlify). Se preferir um ambiente isolado de homologação/preview, crie um novo projeto seguindo os passos abaixo.

### 1.1 Criar o projeto (se for um projeto novo)
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e clique em **New project**.
2. Escolha sua organização, defina nome (ex.: `sonin-links-preview`), senha forte do banco e região próxima do público (ex.: **South America (São Paulo) — `sa-east-1`**).
3. Aguarde o provisionamento terminar.

### 1.2 Aplicar as migrations do zero (idempotentes e reaplicáveis)
As migrations em `supabase/migrations/` criam toda a estrutura do zero (extensão `pgcrypto`, função `is_admin()`, tabelas `achados` e `site_settings`, triggers de `updated_at`, índices, políticas RLS, bucket `achados-images` com políticas de Storage e a coluna `price_note`) e usam `if not exists` / `drop ... if exists` / `on conflict`, podendo ser reaplicadas com segurança.

**Opção A — Pelo SQL Editor (mais simples):**
1. No painel do Supabase, abra **SQL Editor → New query**.
2. Execute, **nesta ordem**, o conteúdo de cada migration:
   1. `supabase/migrations/20261121000001_initial_schema.sql`
   2. `supabase/migrations/20261122000001_add_price_note.sql`
   3. `supabase/migrations/20261122000002_grant_table_privileges.sql`
3. Confirme que todas retornaram **Success**.

**Opção B — Via Supabase CLI (opcional):**
```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

### 1.3 Desativar cadastro público, criar o único admin e promover para `admin`
1. Em **Authentication → Sign In / Providers** (ou **User Signups**):
   - Mantenha o provedor **Email** **ativado**.
   - **Desative** **"Allow new users to sign up"** (sem cadastro público).
2. Em **Authentication → Users → Add user → Create new user**:
   - Informe o e-mail e a senha do dono/curador.
   - Marque **Auto Confirm User**.
3. Em **SQL Editor**, promova esse usuário gravando `role: "admin"` em `app_metadata` (campo somente servidor, exigido pelas políticas RLS do banco e do Storage):
   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'SEU_EMAIL_ADMIN';
   ```
4. Verifique se gravou corretamente:
   ```sql
   select email, raw_app_meta_data from auth.users where email = 'SEU_EMAIL_ADMIN';
   ```
   O campo `raw_app_meta_data` deve conter `"role": "admin"`.

### 1.4 Configurar URLs do Supabase Auth (Site URL e Redirect URLs)
Faça isso assim que tiver a URL do site no Netlify (passo 2):
1. No Supabase, vá em **Authentication → URL Configuration**.
2. **Site URL**:
   - Para o momento do preview, pode usar a URL de branch deploy do Netlify (ex.: `https://feature-visual-redesign--SEU-SITE.netlify.app`). Quando for para produção, troque para o domínio final.
3. **Redirect URLs** (adicione todas as necessárias):
   - `http://localhost:3000/**`
   - `https://feature-visual-redesign--SEU-SITE.netlify.app/**`
   - `https://deploy-preview-*--SEU-SITE.netlify.app/**`
   - `https://SEU-SITE.netlify.app/**`
4. Clique em **Save**.

### 1.5 Coletar as chaves do Supabase
- **Project Settings → Data API**: copie **Project URL** (`https://xxxxxxxx.supabase.co`).
- **Project Settings → API Keys**: copie a **Publishable key** (`sb_publishable_...`) — ou a **anon public** key (`eyJ...`).
- *Não* copie nem cadastre a `service_role` / `sb_secret_` no Netlify: o MVP não usa `SUPABASE_SERVICE_ROLE_KEY`.

---

## 2. Criar o site no Netlify (Deploy de Preview / Branch Deploy)

### 2.1 Conectar o repositório sem publicar a `main` como versão final
1. Acesse [app.netlify.com](https://app.netlify.com) e clique em **Add new site → Import an existing project**.
2. Conecte ao GitHub e selecione o repositório `achadosdosonin`.
3. O Netlify detecta automaticamente o Next.js e lê o `netlify.toml` (`command = "npm run build"`, `NODE_VERSION = "22"`).
4. **Antes de disparar o deploy**, configure as variáveis de ambiente (seção 2.2 abaixo) e ajuste os branches de deploy em **Site configuration → Build & deploy → Continuous deployment → Branches and deploy contexts**:
   - **Production branch**: mantenha `main` (ou `develop` se preferir; **não faça merge na `main`** agora).
   - **Branch deploys**: selecione **Let me add individual branches** e adicione `feature/visual-redesign` (ou deixe **All**).
   - **Deploy Previews**: deixe **Any pull request against your production branch / branch deploy branches** ativado (se abrir um PR da `feature/visual-redesign` para `develop`, o Netlify gera automaticamente uma URL `deploy-preview-<N>--SEU-SITE.netlify.app`).
5. Em **Site configuration → General → Site details**, você pode renomear o subdomínio do Netlify (ex.: `sonin-links-preview.netlify.app`) para facilitar o compartilhamento.

### 2.2 Cadastrar as variáveis de ambiente no Netlify
Vá em **Site configuration → Environment variables → Add a variable**.

| Variável | Tipo | Obrigatória | Onde obter / valor | Contextos no Netlify |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Pública** (vai ao navegador) | Sim | URL do preview (ex.: `https://feature-visual-redesign--SEU-SITE.netlify.app`). Em produção, usar o domínio final. | **Branch deploys** e **Deploy Previews** (URL do preview); **Production** (domínio final quando lançar) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Pública** (vai ao navegador) | Sim | Supabase → **Project Settings → Data API → Project URL** (`https://xxxx.supabase.co`) | Todos os contextos (ou específico por ambiente se tiver 2 projetos Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Pública** (vai ao navegador) | Sim | Supabase → **Project Settings → API Keys → Publishable / anon public** | Todos os contextos |
| `NEXT_PUBLIC_WHATSAPP_GROUP_URL` | **Pública** (vai ao navegador) | Opcional | Link do grupo (`https://chat.whatsapp.com/...`). Fallback caso `/admin/configuracoes` esteja vazio. | Todos os contextos |
| `ADMIN_EMAIL` | **Segredo (somente servidor)** | Sim | E-mail exato do usuário admin criado no passo 1.3 | Todos os contextos (**marque como Secret / Contains secret value**) |
| `SECRETS_SCAN_OMIT_KEYS` | Config de build do Netlify | Recomendado | `NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_WHATSAPP_GROUP_URL,NEXT_PUBLIC_NETLIFY_CONTEXT` | Todos os contextos (evita falso positivo no Secrets Scanner; ver Troubleshooting) |

> **Observação:** `NEXT_PUBLIC_NETLIFY_CONTEXT` já é definida por contexto no `netlify.toml` (`deploy-preview`, `branch-deploy`, `production`). Não precisa cadastrá-la manualmente no painel.

### 2.3 Disparar o deploy de preview
1. Faça um push para `feature/visual-redesign` (ou clique em **Deploys → Trigger deploy → Deploy branch** selecionando `feature/visual-redesign`, ou abra um PR de `feature/visual-redesign` → `develop` para gerar um Deploy Preview).
2. Acompanhe o log do build no Netlify e confirme que terminou com sucesso.
3. Volte ao passo **1.4** e garanta que a URL final do preview está listada em **Redirect URLs** no Supabase Auth (e em `NEXT_PUBLIC_SITE_URL` no Netlify, disparando um **Clear cache and deploy** se alterou a variável).

---

## 3. Checklists de teste

### 3.1 Smoke test geral (antes de mandar o link para o amigo)
- [ ] **Estado vazio**: abrir `/` com 0 achados publicados — exibe `"Nenhum achado encontrado"` sem erro 500 nem console errors.
- [ ] **Proteção de indexação do preview**:
  - Abrir `/robots.txt` no preview → deve retornar `Disallow: /`.
  - Inspecionar os headers HTTP da resposta de `/` (DevTools → Network) → deve conter `x-robots-tag: noindex, nofollow`.
- [ ] **Login admin e CRUD**:
  - Abrir `/admin` deslogado → redireciona para `/admin/login`.
  - Fazer login com `ADMIN_EMAIL` + senha.
  - Criar 2 ou 3 achados de teste em lojas diferentes (ex.: Shopee, Mercado Livre, Amazon) com **upload de imagem**, preço original, preço atual e `price_note` (ex.: `"à vista no PIX"`).
  - Confirmar que as imagens sobem direto para o bucket `achados-images` no Supabase Storage e carregam na vitrine.
- [ ] **Vitrine pública**:
  - Abrir `/` → os achados aparecem na grade (`2` cols mobile / `3` / `4` / `5` desktop), botão `"Ver oferta"` com contorno `--ink` preenchendo no hover/focus, `price_note` alinhado.
  - Testar busca por título (incluindo sem acento e minúsculas) e verificar atualização da URL `?q=`.
  - Testar chips de loja e ordenação (`Novidades`, `Menor preço`, `Maior preço`).
  - Clicar em um card → abre o link de afiliado em nova aba.
- [ ] **Rotas de origem e 404**:
  - `/tt`, `/ig` e `/wpp` renderizam a mesma vitrine; `canonical` e `og:url` no `<head>` apontam para `/`.
  - `/qualquer-rota-invalida` retorna HTTP **404** com a página customizada.
- [ ] **Configurações e modal do WhatsApp**:
  - Em `/admin/configuracoes`, salvar o link do grupo do WhatsApp e ativar o modal.
  - Abrir `/` em aba anônima → após ~1,5 s o modal aparece; fechar com `Esc` / `"Agora não"` e recarregar → não reaparece (cooldown de 24 h).
- [ ] **Service Worker e atualização**:
  - Inspecionar headers de `/sw.js` → `content-type: application/javascript` e `cache-control: no-cache, no-store, must-revalidate`.
  - Conferir no DevTools → Application → Cache Storage que `/admin` nunca aparece em cache.

### 3.2 Checklist específico do item 2.5 (para o amigo testar em aparelhos reais)
Envie para o seu amigo os links do preview (ex.: `https://<preview>/tt?utm_source=teste`, `https://<preview>/ig`, `https://<preview>/` e `https://<preview>/?debugInApp=tiktok`):

- [ ] **TikTok no Android (app real)**:
  1. Abrir o link do preview por dentro do TikTok (bio, DM ou comentário).
  2. Observar se ocorre a **tentativa automática única** de abrir no navegador externo preservando `?utm_source=teste`.
  3. Se o TikTok bloquear/permanecer no navegador interno, confirmar que após ~1,5 s aparece o **bottom sheet** com título `"Abra no navegador para comprar sem travar"`, indicação do menu no canto superior direito, botão primário **"Abrir no navegador"**, botão secundário **"Copiar link do site"** e **"Continuar aqui mesmo assim"**.
  4. Tocar em **"Abrir no navegador"** e verificar se abre no Chrome na mesma URL (com query/UTM).
  5. Recarregar dentro do TikTok na mesma sessão → confirmar que **não** repete o redirecionamento automático em loop.
- [ ] **TikTok no iPhone / iOS (app real)**:
  1. Abrir o link por dentro do TikTok no iPhone.
  2. Confirmar que **não** tenta redirecionamento automático nem mostra botão de intent — exibe apenas o **bottom sheet** com instruções manuais, botão **"Copiar link do site"** e **"Continuar aqui mesmo assim"**.
  3. Testar copiar o link e colar no Safari.
- [ ] **Instagram, Facebook e Messenger (Android e iPhone reais)**:
  1. Abrir o link por dentro de cada app.
  2. Confirmar que aparece apenas a **faixa discreta no topo** (fundo `--surface-2`, borda `--border`) com botão **"Copiar link"** e botão de fechar — **sem** redirecionamento automático e **sem** bloquear o conteúdo.
  3. Dispensar a faixa e recarregar → não deve reaparecer (cooldown de 24 h em `localStorage`).
- [ ] **Ordem com o modal do WhatsApp**:
  - Confirmar que o modal de boas-vindas **nunca** aparece por cima do bottom sheet ou da faixa — só aparece (~1,5 s depois) após o aviso de navegador embutido ser dispensado.
- [ ] **Saída para o navegador externo**:
  - Ao abrir o site no Chrome ou Safari fora dos apps, o aviso de navegador embutido some automaticamente.
- [ ] **Simulação sem o app (apenas no preview)**:
  - Acessar `/?debugInApp=tiktok`, `/?debugInApp=instagram` e `/?debugInApp=facebook` no preview para conferir o visual rapidamente.

---

## 4. Troubleshooting

### Build falha no "Secrets scanning" do Netlify por causa de variáveis `NEXT_PUBLIC_*`
O Netlify verifica se valores de variáveis cadastradas no painel aparecem nos arquivos compilados (`.next/`). Como variáveis `NEXT_PUBLIC_*` (ex.: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`) são propositalmente embutidas no bundle do navegador, o scanner pode dar falso positivo e falhar o deploy.

**Solução:**
Cadastre a variável abaixo no painel do Netlify (**Site configuration → Environment variables**):
- **Key:** `SECRETS_SCAN_OMIT_KEYS`
- **Value:** `NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_WHATSAPP_GROUP_URL,NEXT_PUBLIC_NETLIFY_CONTEXT`

> Nunca adicione `ADMIN_EMAIL` (nem qualquer segredo real) em `SECRETS_SCAN_OMIT_KEYS`.

### Build falha logo no início com `[env] Invalid or missing server environment variables`
A validação Zod em `src/lib/env.ts` roda no início do build para evitar deploys quebrados. Confira no log qual variável faltou ou está fora do formato (ex.: URL sem `https://` ou `ADMIN_EMAIL` sem `@`), corrija no painel do Netlify e rode **Clear cache and deploy**.

### Login em `/admin/login` entra ou falha com erro de permissão / RLS ao criar achado ou subir foto
1. Confirme se `ADMIN_EMAIL` no Netlify está igual ao e-mail do usuário criado no Supabase Auth.
2. Rode no SQL Editor do Supabase o `update auth.users ... '{"role":"admin"}'` (passo 1.3).
3. Após promover o usuário no SQL Editor, **faça logout e login novamente** em `/admin` para gerar um novo JWT com `app_metadata.role = "admin"`.

### Imagens enviadas pelo admin não carregam na vitrine
1. Verifique se a migration `20261121000001_initial_schema.sql` criou o bucket `achados-images` como **Public**.
2. Confirme se `NEXT_PUBLIC_SUPABASE_URL` não tem barra sobrando ou erro de digitação e corresponde ao padrão `*.supabase.co` autorizado em `next.config.ts`.

### Erro `column achados.price_note does not exist` ao salvar no admin
Aplique a segunda migration (`supabase/migrations/20261122000001_add_price_note.sql`) no SQL Editor do Supabase.


---

## 5. Checklist de testes do link do grupo de WhatsApp

Teste sempre em **aparelhos reais** antes de divulgar um link na bio ou em vídeos:

| Ambiente | Navegador normal (Chrome / Safari) | TikTok (navegador embutido) | Instagram (navegador embutido) |
|---|---|---|---|
| **Android** | Clicar em **Grupo VIP**, no modal ou em `/grupo` abre o convite direto no app do WhatsApp | Ao abrir `/grupo` ou tocar em botão do WhatsApp, `intent:` abre a mesma página no Chrome; no Chrome, o botão leva direto ao WhatsApp | Faixa discreta no topo; ao tocar em **Entrar no grupo** / **Grupo VIP**, abre o painel para abrir no Chrome (sem cair direto na página web de instalação) |
| **iPhone (iOS)** | Clicar no CTA abre `chat.whatsapp.com` no Safari/app do WhatsApp | Painel com instruções manuais (**⋯ → Abrir no navegador**); link só vai para `chat.whatsapp.com` se escolher **Continuar aqui mesmo assim** | Faixa no topo; ao tocar no CTA do WhatsApp, abre painel com instruções manuais (**⋯ → Abrir no navegador externo**) |

### Troubleshooting de convites do WhatsApp

- **Convite redefinido / inválido:** se alguém redefiniu o link de convite no WhatsApp, o link antigo deixa de funcionar imediatamente. Gere o novo link curto (`https://chat.whatsapp.com/...`) e atualize em `/admin/configuracoes`.
- **Grupo lotado:** quando o grupo atingir o limite de participantes, crie um novo grupo (ex.: "Achados VIP #2"), copie o novo link de convite e troque apenas em `/admin/configuracoes` — o link da bio (`/grupo`) permanece o mesmo.
- **WhatsApp × WhatsApp Business no mesmo aparelho:** se houver dois aplicativos instalados e o sistema perguntar qual usar ou abrir o app errado, confira nas configurações de links padrão do Android qual WhatsApp está associado a `chat.whatsapp.com`. Em último caso, o botão **Copiar link** permite abrir no navegador principal.
