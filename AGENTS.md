# AGENTS.md

Guia para agentes de IA (e humanos) que trabalham neste projeto. Leia inteiro antes de alterar qualquer coisa.

## 1. Visão geral

Site de **achados** (promoções, produtos e ofertas curadas) de um único curador. O tráfego chega principalmente por links compartilhados (TikTok, Instagram, WhatsApp), não por busca no Google. O público navega pela vitrine, clica no achado (link de afiliado) e é convidado a entrar no grupo de WhatsApp do curador. O dono gerencia tudo por uma área administrativa protegida.

Idioma da interface: **pt-BR**. Código, nomes de variáveis, commits e comentários técnicos: **inglês**.

## 2. Escopo

### 2.1 MVP (este escopo é o que deve ser construído agora)

1. **Vitrine pública** com os achados publicados, com:
   - filtro por **loja** (ex.: Shopee, Mercado Livre, Amazon; lista vem dos dados);
   - **ordenação**: novidades (padrão), menor preço, maior preço;
   - contador de achados exibidos;
   - texto fixo: "Preços e disponibilidade podem mudar" e aviso de que os links podem gerar comissão ao curador.
2. **Área de admin** (`/admin`) para gerenciar achados e configurações.
3. **Modal de boas-vindas** com **um único link** de grupo de WhatsApp.
4. **Rotas por origem de tráfego** (`/tt`, `/ig`, `/wpp`) com aviso para abrir no navegador quando o site é aberto dentro de um navegador embutido (ver 2.5).
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

### 2.5 Rotas por origem e navegador embutido
- Rotas aceitas: `/tt` (TikTok), `/ig` (Instagram), `/wpp` (WhatsApp). Todas renderizam a **mesma vitrine** da home. Manter uma lista fixa (whitelist) de origens; qualquer outro segmento retorna 404.
- Motivo: navegadores embutidos (TikTok, Instagram, Facebook) costumam bloquear o login das lojas, e a compra trava para o visitante.
- Detectar navegador embutido no cliente via `navigator.userAgent` (padrões como `TikTok`, `musical_ly`, `BytedanceWebview`, `Instagram`, `FBAN`, `FBAV`). Detecção é "melhor esforço" e pode falhar; sempre permitir "Continuar aqui mesmo assim".
- Quando detectado, mostrar aviso dispensável com instruções curtas: tocar nos três pontinhos, escolher "Abrir no navegador", e um botão "Copiar link do site".
- As instruções devem poder ser ajustadas por origem (o menu do TikTok e o do Instagram diferem).
- Canonical e `og:url` sempre apontam para `/`.

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

Tema principal: **roxo escuro**. O site é *dark-first*, com roxo profundo como base e um acento quente para destacar preços e CTAs.

### Por que essas combinações
- **Análogas** (violeta, magenta, índigo) dão profundidade e gradientes harmoniosos.
- **Complementar** (amarelo/âmbar) é o oposto do roxo no círculo cromático: cria o maior contraste para preço, selo de "oferta" e botões primários.
- **Neutros com tom lavanda** (em vez de cinza puro) mantêm a coerência e evitam aspecto "sujo" sobre fundo roxo.
- Verde do WhatsApp é usado **apenas** em CTAs do WhatsApp, por reconhecimento de marca.

### Tokens (definir como CSS variables / `@theme` do Tailwind)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#14072B` | Fundo da página |
| `--surface` | `#1E0B3A` | Cards, header, modal |
| `--surface-2` | `#2E1065` | Hover de cards, inputs, seções destacadas |
| `--border` | `#4C1D95` | Bordas e divisores |
| `--primary` | `#7C3AED` | Botões secundários, links, foco |
| `--primary-hover` | `#8B5CF6` | Hover do primário |
| `--accent` | `#F5B83D` | Preços, selo de oferta, CTA principal |
| `--accent-hover` | `#FBBF24` | Hover do acento |
| `--highlight` | `#D946EF` | Gradientes, detalhes decorativos (usar com parcimônia) |
| `--text` | `#F5F3FF` | Texto principal |
| `--text-muted` | `#C4B5FD` | Texto secundário |
| `--whatsapp` | `#25D366` | Botão do WhatsApp |
| `--success` | `#22C55E` | Sucesso |
| `--danger` | `#F43F5E` | Erro / exclusão |

Gradiente de marca sugerido: `linear-gradient(135deg, #2E1065 0%, #7C3AED 100%)`.

### Regras
- Contraste mínimo **WCAG AA** (4.5:1 para texto normal). Verifique qualquer combinação nova.
- Texto sobre `--accent` deve ser escuro (`--bg`), nunca branco.
- Nada de cores hardcoded em componentes: usar apenas os tokens.
- `theme_color` do manifest = `--surface`; `background_color` = `--bg`.
- Mobile-first. Testar em 360 px de largura.
- **Não** bloquear zoom (`user-scalable=no` / `maximum-scale=1` no viewport): prejudica acessibilidade.
- Open Graph e Twitter Card completos (imagem 1200x630, título e descrição em pt-BR), pois o tráfego vem de links compartilhados.

## 5. Modelo de dados (MVP)

Tabelas mínimas no Postgres (Supabase). Toda alteração de schema deve vir com migration versionada em `supabase/migrations/`.

**`achados`**
- `id` uuid (PK), `title` text, `description` text null
- `price_cents` integer, `original_price_cents` integer null
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

- [ ] Funciona e é legível em 360 px de largura
- [ ] Contraste AA nas cores usadas
- [ ] Rotas admin protegidas no servidor e RLS ativo nas tabelas novas
- [ ] Modal respeita frequência e acessibilidade, não aparece no admin e não sobrepõe o aviso de navegador embutido
- [ ] `/tt`, `/ig`, `/wpp` funcionam; outros segmentos retornam 404
- [ ] Filtro por loja e ordenação funcionando
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