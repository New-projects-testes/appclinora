## Plano: Fluxo público de agendamento de consulta

Adicionar fluxo de marcação a partir do `/catalogo`, **mantendo nosso design system** (azul Ocean Deep, fontes Plus Jakarta + Inter, cards brancos com bordas sutis, botões `rounded-lg`). As referências do Doctoralia são apenas para a estrutura de fluxo / passos.

### Fluxo (4 etapas)

```text
/catalogo
   │  (clica em card do profissional)
   ▼
/catalogo/$id                ← perfil público + horários
   │  (escolhe data/horário)
   ▼
/catalogo/$id/opcoes         ← tipo de consulta + 1ª vez?
   │
   ▼
/catalogo/$id/reservar       ← dados de contato (para mim / outra pessoa)
   │
   ▼
/catalogo/$id/confirmacao    ← agendamento confirmado
```

### 1. Card no /catalogo
- Ao clicar no card, navegar para `/catalogo/$id` (em vez de abrir modal). Remover o `ProfileModal`.
- Adicionar no card o selo verde "Pagamento online" e a linha "Teleconsulta — R$ XXX" no rodapé (visual sutil, mantendo paleta atual: badge `bg-emerald-50 text-emerald-700` discreto).

### 2. Página /catalogo/$id (perfil público)
Layout em duas colunas (mantém header azul do catálogo):
- **Esquerda (card branco)**: avatar, nome + ícone verified azul LinkedIn, especialidade, registro, bio, lista de atendimento (online/presencial, cidade), preço da consulta.
- **Direita (card branco)**: grade de horários por dia (Hoje, Amanhã, +2 dias seguintes), gerados deterministicamente. Botões de horário em `rounded-lg` com `bg-primary/8 text-primary hover:bg-primary/15`. Setas para navegar dias. Link "Mostrar mais horários".
- Header: botão voltar para `/catalogo`.

### 3. Página /catalogo/$id/opcoes
- Card "Selecione as opções da consulta": tipo de visita (Teleconsulta selecionada por padrão, mostra preço), pergunta "É a sua primeira consulta?" (Sim/Não com radio).
- Card lateral resumo: foto, nome, especialidade, data/hora escolhida (vem da query string `?date=...&time=...`), link "Mudar a data" volta para `/catalogo/$id`.
- Botão primário "Continuar" → `/catalogo/$id/reservar`.

### 4. Página /catalogo/$id/reservar
- Card "Verificar e reservar":
  - "Para quem é a consulta?" (Para mim / Para outra pessoa — radio cards).
  - Dados de contato: celular (com DDI), e-mail, repetir e-mail.
  - Comentários para especialista (collapsible opcional).
  - Checkbox de autorização obrigatório + checkbox opcional de comunicações.
- Card lateral mantém resumo (foto, nome, data/hora, modalidade, preço).
- Botão "Continuar" → `/catalogo/$id/confirmacao`.

### 5. Página /catalogo/$id/confirmacao
- Tela centralizada com ícone de check, "Consulta agendada com sucesso!", resumo (profissional, data/hora, modalidade, preço), instruções ("o profissional enviará as instruções por e-mail"), botões "Voltar ao catálogo" e "Ver no Google Calendar" (mock, link `#`).

### Detalhes técnicos
- Estado entre páginas: passar `date`, `time`, `type`, `firstTime`, `forWhom` via search params (TanStack `validateSearch`) — sem context global.
- Função util `priceFor(id)` movida para `src/lib/catalog-utils.ts` (compartilhada entre rotas).
- Função util `slotsForProfessional(id, dayOffset)` para gerar horários determinísticos.
- Header azul reutilizado: extrair `<CatalogHeader />` para `src/components/CatalogHeader.tsx`.
- Manter selo verified em azul LinkedIn (`#0A66C2`) consistente em todas as telas.
- Todos os botões primários `rounded-lg` (regra do design system), nunca `rounded-full`.

### Arquivos
- Novo: `src/routes/catalogo.$id.tsx`
- Novo: `src/routes/catalogo.$id.opcoes.tsx`
- Novo: `src/routes/catalogo.$id.reservar.tsx`
- Novo: `src/routes/catalogo.$id.confirmacao.tsx`
- Novo: `src/components/CatalogHeader.tsx`
- Novo: `src/lib/catalog-utils.ts`
- Editar: `src/routes/catalogo.tsx` (remover modal, navegar para perfil, adicionar badge "Pagamento online", usar header extraído)
