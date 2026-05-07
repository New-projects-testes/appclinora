## Refazer página `/pacientes/$id`

Vou reconstruir totalmente `src/routes/pacientes.$id.tsx` mantendo a UI/paleta atual do app (cards brancos, Ocean Deep, Plus Jakarta + Inter), inspirada na imagem mas sem copiar o visual.

### 1. Breadcrumb
Substituir o link "← Pacientes" por um breadcrumb usando o componente `@/components/ui/breadcrumb`:
`Pacientes / {Nome do paciente}`

### 2. Header do paciente (card branco)
Mostrar todos os dados que já capturamos no cadastro:
- `PatientAvatar` grande (96px)
- Nome (display)
- Idade calculada a partir de `birthDate` + data de nascimento
- Gênero
- Email, WhatsApp (com ícones)
- Status (Select inline já existente)
- Tags
- Se `isMinor`: bloco "Responsável" com nome/email/telefone
- Observações (linha curta)
- Botão "Nova sessão" no canto direito

### 3. Sistema de abas
Usar `@/components/ui/tabs` (shadcn) com 3 abas. Estilo: tabs horizontais com underline na cor primary, sem o visual escuro do print — manter clean.

#### 3.1 Aba "Atendimentos" (default)
- **Card "Próxima sessão"**: data/hora, duração, valor, status pagamento da próxima `Session` agendada para o paciente. Se não houver, mostrar empty state com botão "Agendar sessão" abrindo o `NewSessionDialog` já existente.
- **Card "Anotações da sessão"**:
  - Select de template (expandir `sessionTemplates` em `mock-data.ts` com mais opções e conteúdo HTML rico de exemplo: TCC padrão, Psicanálise, Humanista/ACP, Anamnese inicial, Sessão de retorno, Encerramento).
  - **Rich Text Editor**: usar TipTap (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-placeholder`). Adicionar via `bun add`. Toolbar simples: Bold, Italic, Underline, Headings (H2/H3), listas (bullet/numbered), blockquote, undo/redo.
  - Ao escolher template, fazer `editor.commands.setContent(htmlDoTemplate)`.
  - Botão "Salvar anotações": cria entrada na timeline (estado local), associada à próxima sessão (ou à sessão selecionada). Marca a sessão como `done` e adiciona o HTML como `notes`.

#### 3.2 Aba "Histórico de sessões"
- Linha do tempo vertical (linha primary/20 à esquerda + bullets primary).
- Para cada sessão `done` (ordem desc), mostrar card colapsável (`Collapsible` ou `Accordion` shadcn):
  - Cabeçalho: data formatada (dia/mês/ano), hora, duração, status pagamento (badge), chevron.
  - Conteúdo expandido: HTML das anotações renderizado (`prose` tailwind), botões "Editar" (reabre na aba Atendimentos) e "Exportar PDF" (placeholder).

#### 3.3 Aba "Financeiro"
Estender o tipo `Session.payment_status` para incluir `"isento"` (atualizar `src/lib/types.ts`).
- **Resumo (3 KPIs em cards)**: Total recebido, A receber (apenas pending), Isentos. Linha extra: Total de sessões, Sessões pagas, Pendentes, Isentas.
- **Tabela/Extrato**: lista de todas as sessões do paciente com data, valor, status (`Select` inline para alternar entre Pago / Pendente / Isento). Cada mudança recalcula os KPIs (estado local).
- Filtro por status no topo da tabela (opcional simples).

### Arquivos alterados/criados

- **edit** `src/lib/types.ts`: `payment_status: "pending" | "paid" | "isento"`.
- **edit** `src/lib/mock-data.ts`: expandir `sessionTemplates` (5–6 templates com conteúdo HTML), adicionar mais sessões `done` para `p4` e outros pacientes para popular histórico/financeiro.
- **new** `src/components/RichTextEditor.tsx`: wrapper TipTap com toolbar + prop `value`/`onChange`/`ref` para `setContent`.
- **edit** `src/routes/pacientes.$id.tsx`: reescrita completa conforme acima.
- **deps**: `bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-underline`.

### Notas técnicas
- Estado tudo client-side (mock). Mutações apenas em `useState` local; persistência real virá depois.
- Renderização do HTML salvo usa `dangerouslySetInnerHTML` com classe `prose prose-sm` (TipTap produz HTML seguro do nosso próprio editor).
- Idade calculada com helper local a partir de `birthDate`.

### Pergunta
Posso prosseguir adicionando o TipTap como Rich Text Editor? É a opção leve e padrão para React. Se preferir outro (ex.: Lexical), me avise.