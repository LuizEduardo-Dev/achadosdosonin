# AGENTS.md

Guia para agentes de IA (e humanos) que trabalham neste projeto. Leia inteiro antes de alterar qualquer coisa.

## 1. Visão geral

Site de **achados** (promoções, produtos e ofertas curadas) de um único curador. O tráfego chega principalmente por links compartilhados (TikTok, Instagram, WhatsApp), não por busca no Google. O público navega pela vitrine, clica no achado (link de afiliado) e é convidado a entrar no grupo de WhatsApp do curador. O dono gerencia tudo por uma área administrativa protegida.

Idioma da interface: **pt-BR**. Código, nomes de variáveis, commits e comentários técnicos: **inglês**.

## 2. Escopo

### 2.1 MVP (este escopo é o que deve ser construído agora)

1. **Vitrine pública** com os achados publicados, com:
   - **busca por título** no cliente (ignora maiúsculas e acentos, sincronizada com `?q=`);
   - filtro por **loja** (ex.: Shopee, Mercado Livre, Amazon; lista vem dos dados; esconder faixa se houver menos de 2 lojas);
   - **ordenação**: novidades (padrão), menor preço, maior preço;
   - contador de achados exibidos junto à ordenação ativa (`Novidades · N achados`);
   - observação curta opcional de preço (`price_note`, até 40 caracteres, ex.: "à vista no PIX", "em até 10x sem juros");
   - aviso único no rodapé: "Preços e disponibilidade podem mudar. Links podem gerar comissão."
2. **Área de admin** (`/admin`) para gerenciar achados e configurações.
3. **Modal de boas-vindas** com **um único link** de grupo de WhatsApp.
4. **Rotas por origem de tráfego** (`/tt`, `/ig`, `/wpp`) com aviso discreto para abrir no navegador quando o site é aberto dentro de um navegador embutido (ver 2.5).
5. **PWA** instalável (ver 2.6).

### 2.2 Fora do MVP (v2, NÃO implementar agora)

- Categorias de produto (ex.: Geral / Feminino) e múltiplos grupos de WhatsApp (um por categoria).
- Formulário "Pedir um achado" (o visitante sugere um produto ao curador).
- Botão "O link não abriu? Avisar o curador" (reportar link quebrado).
- Contagem de cliques por achado e painel de métricas (se adicionado, avaliar LGPD/consentimento).
- Importar título, imagem e preço automaticamente a partir do link do produto.
- Push notifications.

Ao projetar o modelo de dados e os componentes do MVP, **não bloquear** essas evoluções (ex.: deixar o campo `store` como texto simples e a configuração do WhatsApp em tabela própria), mas também **não construir** nada delas antecipadamente.

### 2.3 Área de admin (`/admin`)
- Login protegido (apenas o dono; **sem cadastro público**: desativar signups no Supabase Auth).
- CRUD de achados: criar, editar, excluir, arquivar, marcar como rascunho/publicado.
- Upload de imagem do achado (ver seção 6 sobre upload direto ao Storage).
- Campos de um achado: título, descrição curta (opcional), preço atual, preço original (opcional), loja, link de afiliado, imagem, status, data de criação, data de expiração (opcional).
- Tela de configurações: link do grupo de WhatsApp, texto do modal, modal ativo/inativo.
- Interface usável no celular (o dono provavelmente posta pelo telefone).
- Rotas `/admin/*` com `noindex`, nunca cacheadas pelo service worker.

### 2.4 Modal de boas-vindas
- Aparece ao abrir o site, após um pequeno atraso (~1,5 s), com mensagem de boas-vindas e botão para o grupo de achados no WhatsApp ("Entrar no grupo") e uma opção para dispensar ("Agora não").
- Botão de CTA usa o verde do WhatsApp (`#25D366`) e abre o link em nova aba (`target="_blank"` + `rel="noopener noreferrer"`).
- Fechável por "Agora não", botão "X", clique no overlay e tecla `Esc`.
- Não deve incomodar: após fechar, só reaparece depois de 24 h (guardar em `localStorage` com timestamp). Se o usuário clicou no CTA, não reaparecer por 7 dias.
- Se o aviso de navegador embutido (2.5) estiver visível, o modal só aparece depois que o aviso for dispensado (nunca dois overlays ao mesmo tempo).
- Acessibilidade: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, devolver o foco ao fechar, respeitar `prefers-reduced-motion`.
- Não renderizar nas rotas `/admin`.
- O link do grupo vem da configuração no banco (variável de ambiente como valor padrão), nunca hardcoded no componente.

### 2.5 Navegador embutido (TikTok, Instagram, Facebook) e rotas por origem

Rotas por origem
- /tt, /ig e /wpp renderizam a MESMA vitrine da home (whitelist; outro segmento
  retorna 404). A rota é só uma dica de origem. A detecção de navegador
  embutido NÃO depende da rota: roda em qualquer página.

Detecção
- Feita no cliente, após a montagem (evitar erro de hidratação), com a
  biblioteca `inapp-spy` (ou regex de user agent como alternativa). Detectar
  pelo menos: tiktok, instagram, facebook, messenger.
- Política por app, centralizada em UM arquivo de configuração:
    tiktok: "strong" | instagram: "soft" | facebook: "soft" |
    messenger: "soft" | demais: "off"
- Sair do navegador embutido remove o aviso automaticamente (o user agent muda).

Comportamento "strong" (TikTok)
- Painel (bottom sheet) na primeira visita de cada sessão (sessionStorage),
  com role="dialog", foco gerenciado e respeito a prefers-reduced-motion.
- Conteúdo: título direto (ex.: "Abra no navegador para comprar sem travar"),
  passo a passo curto ("toque nos três pontinhos no canto superior direito e
  escolha Abrir no navegador"), seta apontando para o menu, botão "Copiar
  link do site" (secundário, com contorno) e saída discreta
  "Continuar aqui mesmo assim".
- Android: botão primário "Abrir no navegador" que navega para
  `intent:<URL atual completa, sem hash>#Intent;end`, preservando query/UTM.
  Além disso, UMA tentativa automática por sessão (flag em sessionStorage)
  com window.location.replace(intentLink) logo ao detectar; se a página
  continuar visível após ~1,5 s, exibir o painel normalmente.
- iOS: somente instruções manuais. Não implementar atalhos nem hacks de
  esquemas de URL (não são confiáveis).

Comportamento "soft" (Instagram, Facebook, Messenger)
- Faixa discreta no topo (--surface-2, borda --border), dispensável, com o
  mesmo texto curto e botão "Copiar link". Sem redirecionamento automático.
  Se dispensada, não reaparece por 24 h (localStorage).

Regras gerais
- Nunca bloquear o conteúdo: sempre permitir continuar no navegador embutido.
- O redirecionamento automático só leva à mesma URL, nunca a outra página.
- O modal de boas-vindas só aparece depois que o painel/faixa for dispensado
  ou se não houver navegador embutido (nunca dois overlays juntos).
- Canonical e og:url sempre apontam para "/".
- Em desenvolvimento/preview (nunca em produção), permitir simular com
  ?debugInApp=tiktok|instagram|facebook, para testar sem o app real.
- Limitação conhecida: não há saída programática confiável no iOS, e os apps
  mudam o comportamento com o tempo; testar em Android e iPhone reais.

### 2.6 PWA
- Instalável em Android/iOS/desktop.
- Usar o suporte nativo do Next.js (App Router), sem dependências desnecessárias:
  - `app/manifest.ts` para o Web App Manifest (`name`, `short_name`, `start_url: "/"`, `display: "standalone"`, `theme_color`, `background_color`, ícones).
  - Ícones em `public/icons/`: 192x192, 512x512 e versão **maskable**, mais `apple-touch-icon` 180x180 (iOS).
  - Service worker em `public/sw.js`, registrado no cliente. Se precisar de estratégias de cache mais avançadas, avaliar **Serwist** antes de escrever à mão.
  - Headers para `/sw.js` (`Content-Type: application/javascript`, `Cache-Control: no-cache, no-store, must-revalidate`). Definir em `next.config.ts`; se não surtir efeito no Netlify, usar `netlify.toml`.
- Estratégia de cache: shell e assets estáticos em cache; lista de achados com *stale-while-revalidate*; **nunca** cachear `/admin`, rotas de API e respostas autenticadas.
- Fallback offline simples (`/offline`).
- PWA só funciona em HTTPS (ou `localhost`). Testar instalação com `next build && next start`, não só em `next dev`.
- Validar com Lighthouse antes de entregar.

## 3. Stack e hospedagem

| Camada | Escolha |
|---|---|
| Framework | Next.js (App Router) + TypeScript, criado com `create-next-app` |
| Estilo | Tailwind CSS com tokens de design (ver seção 4) |
| Banco, Auth e Storage | **Supabase** (Postgres + Auth + Storage) |
| Hospedagem do app | **Netlify** (plano gratuito no início; uso comercial é permitido no plano gratuito) |
| Validação | Zod |
| Formulários | React Hook Form (ou Server Actions com `useActionState`) |
| Ícones | lucide-react |

Não existe backend separado: toda a lógica de servidor roda no próprio Next.js (Server Actions e Route Handlers).

### Decisões e cuidados de hospedagem
- **Netlify:** detecta Next.js automaticamente; conferir a documentação atual de Next.js no Netlify antes de usar recursos novos do framework. Variáveis de ambiente configuradas no painel do Netlify, nunca no repositório.
- **Limites do plano gratuito do Netlify:** o plano usa créditos mensais com limite rígido e, ao estourar, o site pode ser **pausado** até o próximo ciclo. Acompanhar o consumo; picos de tráfego (conteúdo viral) são o principal risco. Funções serverless têm timeout curto, então Server Actions devem ser rápidas e **não** processar upload de imagem (ver seção 6).
- **Supabase gratuito:** conferir limites atuais (inatividade, tamanho de banco e de Storage, uso comercial) na documentação oficial antes de ir para produção.
- Revisar estes planos periodicamente; preços e limites mudam.

> Antes de usar qualquer API do Next.js, confira a versão em `package.json` e a documentação correspondente. Algumas convenções mudam entre versões (por exemplo, `middleware.ts` foi renomeado para `proxy.ts` em versões mais recentes). Não assuma; verifique.

## 4. Design e paleta de cores

Visual limpo, profissional e de varejo (inspirado em e-commerces brasileiros como KaBuM! e Terabyte Shop): **roxo-noite quase preto (`--ink`)** como identidade no topo e nas ações primárias, **creme e verde sálvia** como base neutra, e **cards brancos** para valorizar fotos de produto.

### Tokens (definir como CSS variables / `@theme` do Tailwind — única fonte de verdade)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#F5F4EE` | Fundo da página (creme neutro) |
| `--surface` | `#FFFFFF` | Cards, inputs, modais, rodapé |
| `--surface-2` | `#ECEEE5` | Hover de botões secundários, aviso discreto, skeletons, divisor de imagem |
| `--border` | `#DDE0D3` | Bordas e divisores |
| `--ink` | `#180828` | Faixa do topo, botão primário, chip ativo, barra superior do admin |
| `--ink-hover` | `#2B1347` | Hover do primário e elementos internos sobre `--ink` |
| `--link` | `#5B3A8E` | Links, foco (`outline`), borda hover do card |
| `--price` | `#1B6E45` | Preço atual em destaque |
| `--badge-bg` | `#E0F0E6` | Fundo de selo de desconto e ícone do modal |
| `--badge-text` | `#165A38` | Texto de selo de desconto e estados de sucesso |
| `--text` | `#1C1A24` | Texto principal |
| `--text-muted` | `#65656B` | Texto secundário, nome da loja, preço riscado, `price_note` |
| `--on-ink` | `#F3EFF8` | Texto principal sobre `--ink` |
| `--on-ink-muted` | `#C9BEDC` | Texto secundário sobre `--ink` |
| `--accent-sage` | `#A9D8B8` | Selo "Curadoria diária" e detalhes discretos sobre `--ink` |
| `--whatsapp` | `#25D366` | Botão do WhatsApp (uso exclusivo, com texto `#04361A`) |
| `--danger` | `#C0392B` | Erro e ações destrutivas (contorno por padrão; sólido apenas na confirmação) |
| `--success` | `#1B6E45` | Sucesso |

### Tipografia, raios e regras
- **Fonte**: uma única família sans legível (`Plus Jakarta Sans` ou `Inter`) via `next/font`, pesos `400`, `500` e `600`.
- **Letter-spacing**: normal (`0`) em textos de leitura; no máximo `-0.01em` em títulos grandes. Preços com `font-variant-numeric: tabular-nums`.
- **Raios de borda**: `8px` em cards, inputs e botões; `999px` apenas em chips; `12px` no modal; `16px` nos cantos inferiores da faixa do topo.
- **Botões**: primário sólido `--ink` (com parcimônia); secundário com contorno `1px --ink` (fundo transparente, hover `--surface-2`); WhatsApp sólido `#25D366` com texto `#04361A`; destrutivo com contorno `--danger` e sólido `--danger` somente na confirmação.
- **Card de achado**: o card inteiro é um único `<a>` para o link de afiliado; apenas a borda externa `1px --border` (sem linha divisória abaixo da imagem nem contêineres aninhados com borda); imagem quadrada `1/1` com fundo branco e `object-fit: contain` + padding `8px`; linha de `price_note` com altura reservada para alinhamento; botão visual "Ver oferta" (`<span>`) com contorno `1px --ink`, fundo transparente e texto `--ink` (altura mínima `40px`, largura total), preenchendo com fundo `--ink` e texto branco no hover e focus-visible.
- **Grade**: 2 colunas (`<640px`), 3 (`>=640px`), 4 (`>=1024px`), 5 (`>=1280px`), container `max-width: 1280px` com padding lateral `12px` (mobile) / `20px`.
- **Contraste mínimo WCAG AA** (`4.5:1` para texto normal). Nada de cores hardcoded em componentes: usar apenas os tokens.
- `theme_color` do manifest = `#180828` (`--ink`); `background_color` = `#F5F4EE` (`--bg`).
- Mobile-first. Testar em `360px`, `768px`, `1024px` e `1280px`.
- **Não** bloquear zoom (`user-scalable=no` / `maximum-scale=1` no viewport): prejudica acessibilidade.
- Open Graph e Twitter Card completos (imagem 1200x630, título e descrição em pt-BR), pois o tráfego vem de links compartilhados.

### O que evitar
- **Proibido**: glow, sombras coloridas, gradientes, neon, magenta/rosa saturado.
- Sombras apenas neutras e muito suaves (ex.: hover de card e modal).
- Sem decoração desnecessária no admin; skeletons neutros (`--surface-2`) em vez de spinners coloridos.

## 5. Modelo de dados (MVP)

Tabelas mínimas no Postgres (Supabase). Toda alteração de schema deve vir com migration versionada em `supabase/migrations/`.

**`achados`**
- `id` uuid (PK), `title` text, `description` text null
- `price_cents` integer, `original_price_cents` integer null
- `price_note` text null (observação curta de preço, até 40 caracteres, ex.: "à vista no PIX")
- `store` text (nome da loja, ex.: "Shopee"), `affiliate_url` text
- `image_path` text (caminho no Storage)
- `status` text: `draft` | `published` | `archived`
- `created_at`, `updated_at`, `expires_at` null

**`site_settings`** (linha única)
- `whatsapp_group_url` text, `modal_enabled` boolean
- `modal_title` text, `modal_message` text

Dinheiro: guardar em **centavos** (inteiro) e formatar com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.

## 6. Segurança

- **Toda** verificação de autenticação/autorização acontece no servidor (Server Actions, Route Handlers, layout de `/admin`). Proteção só no cliente não conta.
- **RLS ativado em todas as tabelas.** Leitura pública apenas de achados `published` (e não expirados) e das configurações necessárias ao modal; escrita apenas para o usuário admin (definir o admin por allowlist de e-mail ou claim em `app_metadata`, nunca por dado editável pelo usuário).
- Signups públicos desativados. Apenas o usuário do dono existe.
- Nunca expor a `service_role` ao cliente. Só `NEXT_PUBLIC_*` pode ir ao browser.
- **Upload de imagens:** o navegador envia direto ao Supabase Storage (bucket com política que permite escrita só ao admin), em vez de passar pelo servidor Next, por causa dos limites de função no Netlify. Validar tipo (jpeg/png/webp) e tamanho máximo, e comprimir/redimensionar no cliente antes de enviar.
- Validar todo input com Zod no servidor.
- Não usar `dangerouslySetInnerHTML` com conteúdo vindo do admin ou de usuários.
- Links de afiliado: `rel="noopener noreferrer sponsored"` e `target="_blank"`.
- Admin: `robots` noindex e exclusão no `robots.txt`.
- `next/image`: configurar `remotePatterns` para o domínio do Supabase Storage; avaliar o consumo de otimização de imagens na hospedagem.

## 7. Variáveis de ambiente

Manter `.env.example` atualizado (sem valores reais). Nunca commitar `.env.local`.

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_GROUP_URL=   # valor padrão; o valor efetivo fica em site_settings
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # somente servidor, nunca no cliente
ADMIN_EMAIL=
```

## 8. Estrutura de pastas sugerida

```
src/
  app/
    (public)/
      page.tsx                  # vitrine de achados
      [source]/page.tsx         # /tt, /ig, /wpp (whitelist; senão 404)
      offline/page.tsx
    admin/
      login/page.tsx
      page.tsx                  # dashboard
      achados/                  # listagem, novo, [id]/editar
      configuracoes/page.tsx    # modal e link do WhatsApp
    manifest.ts
    layout.tsx
  components/
    ui/                         # botões, inputs, etc.
    welcome-modal.tsx
    in-app-browser-banner.tsx
    achado-card.tsx
    store-filter.tsx
    sort-select.tsx
  lib/
    supabase/                   # clients (server e browser)
    validators/                 # schemas Zod
    detect-in-app-browser.ts
    config.ts
  types/
supabase/
  migrations/
public/
  sw.js
  icons/
netlify.toml                    # se necessário (headers, configurações)
```

## 9. Convenções de código

- TypeScript estrito. Sem `any` sem justificativa em comentário.
- Server Components por padrão; `"use client"` apenas quando necessário (modal, banner de navegador embutido, filtros interativos, registro do SW).
- Componentes em `kebab-case.tsx`, exportados em PascalCase.
- Preferir Server Actions para mutações do admin.
- Imagens com `next/image`, com `alt` descritivo.
- Commits no padrão Conventional Commits (`feat:`, `fix:`, `chore:`...).
- Textos da interface centralizados e em pt-BR; datas com `pt-BR`.

## 10. Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir build (use para testar PWA)
npm run lint     # lint
```

Antes de finalizar qualquer tarefa: rodar `npm run lint` e `npm run build` e garantir que ambos passam.

## 11. Definição de pronto

- [ ] Funciona e é legível em `360px`, `768px`, `1024px` e `1280px`
- [ ] Contraste WCAG AA (`4.5:1`) em todos os pares de cores usados
- [ ] Sem glow, sombras coloridas, gradientes, neon ou cores hardcoded nos componentes
- [ ] Card de achado como link único (`<a>`), imagem `1/1` em fundo branco (`object-contain`), `price_note` opcional alinhado
- [ ] Rotas admin protegidas no servidor e RLS ativo nas tabelas e migrations
- [ ] Modal respeita frequência e acessibilidade, não aparece no admin e não sobrepõe o aviso de navegador embutido
- [ ] `/tt`, `/ig`, `/wpp` funcionam; outros segmentos retornam 404
- [ ] Busca por título (`?q=`, sem acento/maiúsculas), filtro por loja e ordenação funcionando
- [ ] Lighthouse: PWA instalável, Acessibilidade ≥ 90
- [ ] `lint` e `build` sem erros
- [ ] `.env.example` atualizado se houve nova variável

## 12. O que o agente NÃO deve fazer

- Implementar itens da seção 2.2 (v2) sem pedido explícito.
- Adicionar dependências pesadas sem necessidade (avaliar se o Next/Tailwind já resolve).
- Criar cadastro público de usuários.
- Cachear conteúdo autenticado no service worker.
- Processar upload de imagem em Server Actions ou Route Handlers.
- Usar cores fora da paleta definida.
- Alterar o modelo de dados sem atualizar migration, tipos e validadores juntos.
- Bloquear zoom do usuário no viewport.
- Commitar segredos ou arquivos `.env`.