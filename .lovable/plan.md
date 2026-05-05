## Objetivo

Refazer o sistema visual do Clinora trocando a paleta atual (sage/cream + terracota) por **Ocean Deep + branco**, mantendo a estrutura de **Sidebar + Painéis** já existente e adotando a tipografia limpa do print de referência (sem serifa, próxima de Inter/Plus Jakarta Sans).

## Paleta — Ocean Deep + branco

Tokens definidos em `src/styles.css` (modo claro como padrão):

- `--background`: branco puro `oklch(1 0 0)`
- `--foreground`: azul-marinho profundo `oklch(0.18 0.05 245)` (Ocean Deep)
- `--card` / `--popover`: branco `oklch(1 0 0)`
- `--primary`: Ocean Deep `oklch(0.32 0.10 245)` — usado na sidebar ativa, botões e títulos de destaque
- `--primary-foreground`: branco
- `--secondary` / `--muted`: cinza-azulado bem claro `oklch(0.97 0.01 240)`
- `--muted-foreground`: cinza-azulado `oklch(0.52 0.02 245)`
- `--accent`: azul oceano vibrante `oklch(0.55 0.15 230)` (para badges, links e gráficos)
- `--success`: `oklch(0.62 0.13 165)` (verde-água)
- `--warning`: `oklch(0.75 0.13 75)`
- `--destructive`: `oklch(0.58 0.20 27)`
- `--border` / `--input`: cinza muito claro `oklch(0.93 0.008 240)`
- `--ring`: igual ao accent
- Sidebar tokens: fundo branco com leve tom (`oklch(0.985 0.005 240)`), item ativo com fundo `primary/8` e texto `primary`, hover `secondary`
- `--chart-1..5`: degradês de Ocean Deep → azul claro → verde-água

Modo escuro: inverte para fundo Ocean Deep `oklch(0.18 0.05 245)` com cards `oklch(0.22 0.05 245)` e texto branco.

## Tipografia

Trocar Fraunces (serifa) + Inter por uma única família sem serifa moderna, igual ao print:

- **Plus Jakarta Sans** para títulos (`--font-display`) — pesos 600/700, sem `letter-spacing` negativo agressivo
- **Inter** para corpo (`--font-sans`) — pesos 400/500/600
- Atualizar o `<link>` de Google Fonts em `src/routes/__root.tsx`
- Remover o uso de `font-display` itálico/serifa nas páginas (continua existindo a classe utilitária, mas agora aponta pra Plus Jakarta)
- Ajustar `h1..h4` em `@layer base` para weight 600 e tracking neutro

## Layout — Sidebar + Painéis

A estrutura `AppShell` (sidebar fixa à esquerda + main) já está correta. Ajustes visuais:

- Sidebar: fundo branco, borda direita sutil, logo "Clinora" em Plus Jakarta 700 com um ponto accent azul
- Item ativo: fundo `primary/8` + barra lateral esquerda de 3px na cor `primary` + texto `primary` (em vez do bloco verde escuro atual)
- Cards/painéis (`bg-card border border-border rounded-2xl`): mantém, mas com sombra mais leve (`shadow-sm`) e borda `oklch(0.93 0.008 240)`
- Cabeçalhos de página: título grande em Plus Jakarta 600, eyebrow em uppercase tracking-widest na cor `muted-foreground`
- Botões primários: `bg-primary` Ocean Deep, hover `primary/90`, raio `rounded-lg` (em vez de `rounded-full`) para combinar com o estilo do print
- Stats/painéis do dashboard: ícone em círculo `bg-secondary` no canto superior direito (como no print), valor grande em Plus Jakarta

## Arquivos a alterar

1. **`src/styles.css`** — substituir todos os tokens OKLCH (`:root` e `.dark`), atualizar `--font-display`/`--font-sans`, ajustar `@layer base` para nova tipografia
2. **`src/routes/__root.tsx`** — trocar o `<link>` do Google Fonts para `Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600`
3. **`src/components/AppShell.tsx`** — ajustar estilo do item ativo (barra lateral + bg suave em vez de bloco escuro), logo
4. **`src/components/PageHeader.tsx`** — revisar tracking/peso dos títulos
5. **`src/components/VerifiedBadge.tsx`** — recolorir com `accent` Ocean
6. **Páginas** (`dashboard.tsx`, `agenda.tsx`, `pacientes.*`, `financas.tsx`, `tarefas.tsx`, `configuracoes.tsx`, `catalogo.tsx`, `cadastro.tsx`, `login.tsx`, `index.tsx`) — substituir cores hardcoded restantes (qualquer `text-primary`/`bg-primary`/etc. continua funcionando via tokens; revisar `rounded-full` em botões primários para `rounded-lg` e qualquer uso explícito de cores warm/sage)

Como as páginas já consomem os tokens semânticos (`bg-card`, `text-primary`, `border-border`), a maior parte da troca acontece automaticamente ao mudar `styles.css`. As alterações por página são apenas refinos pontuais (raios de botão, remoção de itálicos/serifa quando explícitos).

## Memória

Salvar em `mem://index.md` as regras centrais:
- Paleta Ocean Deep + branco; primary `oklch(0.32 0.10 245)`
- Tipografia Plus Jakarta Sans (display) + Inter (corpo); nunca serifa
- Layout sempre Sidebar + Painéis em cards brancos com borda sutil
