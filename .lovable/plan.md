## Fluxo de agendamento de consulta no catálogo

Criar uma nova rota única que reúne todos os steps do agendamento, mantendo 100% o design system atual (Ocean Deep + branco, Plus Jakarta + Inter, cards brancos, botões `rounded-lg`). Os prints da Doctoralia são **referência apenas de fluxo/UX**, não de visual.

### 1. Nova rota: `src/routes/catalogo.agendar.$proId.tsx`

Rota pública (sem auth), com `head()` próprio. Layout idêntico ao `/catalogo`:
- Mesmo header azul (`bg-primary`) com logo Clinora + link "Entrar" + CTA "Quero ser encontrado(a) no catálogo"
- Footer simples
- Conteúdo central: à esquerda o card do step ativo, à direita um card sticky de resumo (igual aos prints — profissional, data/hora escolhidas, tipo de consulta, valor)

Stepper horizontal no topo da área de conteúdo com 4 etapas e barra de progresso na cor `primary`:
1. **Tipo de consulta**
2. **Data e horário**
3. **Seus dados**
4. **Confirmação**

Estado todo client-side com `useState` (sem persistência real, igual ao resto do app mock). Botões "Voltar" / "Continuar" no rodapé de cada step. Validação por step antes de avançar.

### 2. Steps (conteúdo)

**Step 1 — Tipo de consulta**
- Radio cards: "Teleconsulta" (se `accepts_online`) e "Presencial" (se `accepts_presential`).
- Mostra preço (`priceFor(pro.id)`) ao lado de cada opção.
- Campo "É a sua primeira consulta com este especialista?" (Sim/Não) usando `RadioGroup`.

**Step 2 — Data e horário**
- Componente `Calendar` (shadcn, já existe em `src/components/ui/calendar.tsx`) à esquerda para escolher o dia (desabilita datas passadas e domingos como exemplo).
- À direita, grade de horários mockados gerados deterministicamente a partir do `pro.id` + dia (slots de 30 min entre 09:00–18:00, com alguns ocupados aleatoriamente). Slot selecionado fica `bg-primary text-primary-foreground`.

**Step 3 — Seus dados (Verificar e reservar)**
- "Para quem é a consulta?" → cards radio "Para mim" / "Para outra pessoa". Se "outra pessoa", mostra campos extras (nome do paciente, data de nascimento).
- Inputs: nome completo, e-mail, confirmar e-mail, celular (com máscara simples), comentário opcional (`Textarea`).
- Validação com `zod` (já é padrão do projeto): nome ≥2, email válido, emails iguais, telefone com 10–11 dígitos.
- Checkbox obrigatório de aceite dos termos + checkbox opcional de comunicações.

**Step 4 — Confirmação**
- Tela de sucesso com `CheckCircle2` em `text-primary`, título "Consulta solicitada com sucesso", resumo dos dados, e dois botões: "Voltar ao catálogo" (`Link to="/catalogo"`) e "Ver outros profissionais".
- Mensagem informando que o profissional confirmará por e-mail (mock).

### 3. Card de resumo (lateral direita, sticky)

Conteúdo evolui conforme os steps são preenchidos:
- Avatar + nome + especialidade + `BadgeCheck` azul-LinkedIn (mesmo estilo do `/catalogo`)
- Registro (CRP/CRM)
- Data + hora selecionadas (após step 2)
- Tipo de consulta + valor (após step 1)
- Forma de pagamento: texto fixo "Pagamento combinado diretamente com o profissional" (já que o app não tem gateway)

### 4. Integração com `/catalogo`

Em `src/routes/catalogo.tsx`, dentro do `ProfileModal`, substituir o `<a href="https://clinora.app/agendar/...">` por:

```tsx
<Link to="/catalogo/agendar/$proId" params={{ proId: pro.id }} className="...">Marcar consulta</Link>
```

Também adicionar um botão "Marcar consulta" direto no card do profissional (atalho), levando à mesma rota.

### 5. Detalhes técnicos

- **Arquivos novos**: `src/routes/catalogo.agendar.$proId.tsx`
- **Arquivos editados**: `src/routes/catalogo.tsx` (botão/link "Marcar consulta")
- **Loader**: a rota usa `loader: ({ params }) => { const pro = catalog.find(p => p.id === params.proId); if (!pro) throw notFound(); return { pro }; }` + `notFoundComponent` e `errorComponent`.
- **Componentes shadcn já disponíveis**: `Calendar`, `RadioGroup`, `Input`, `Textarea`, `Checkbox`, `Button`, `Label`, `Separator`. Sem novas dependências.
- **Helpers reutilizados**: `priceFor(id)` será extraído para `src/lib/catalog-utils.ts` (pequeno arquivo) e importado tanto no `/catalogo` quanto na nova página, para garantir o mesmo preço.
- **Slots de horário**: função `slotsFor(proId, date)` determinística retornando ~12 horários, marcando 3–4 como ocupados.
- **Sem auth**: tudo público, igual à `/catalogo`.

### Pergunta única antes de implementar
A página de catálogo hoje não tem sistema real de pagamento. Para o step de "Tipo de consulta" eu mostro o preço (ex.: R$ 250) e na confirmação aviso que o pagamento é combinado direto com o profissional — sem etapa de checkout/cartão. Confirma essa abordagem ou prefere que eu adicione um step extra mockado de "pagamento online" (apenas visual, sem integração)?
