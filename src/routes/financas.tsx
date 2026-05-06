import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PatientAvatar } from "@/components/PatientAvatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { sessions as initial, patients } from "@/lib/mock-data";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, Calendar as CalendarIcon, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const PAYMENT_META = {
  paid: { label: "Pago", description: "Sessão já recebida", className: "bg-success/15 text-success" },
  pending: { label: "Pendente", description: "Aguardando pagamento", className: "bg-warning/20 text-warning-foreground" },
  isento: { label: "Isento", description: "Sessão oferecida sem cobrança", className: "bg-muted text-muted-foreground" },
} as const;
type PaymentStatus = keyof typeof PAYMENT_META;

const PAGE_SIZE = 10;

export const Route = createFileRoute("/financas")({
  component: Financas,
});

function startOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }

function Financas() {
  const [sessions, setSessions] = useState(initial);
  const [range, setRange] = useState<DateRange | undefined>({ from: startOfMonth(), to: endOfMonth() });
  const [q, setQ] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  useEffect(() => { setPage(1); }, [range, q, paymentFilter]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const from = range?.from ? new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime() : null;
    const to = range?.to
      ? new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999).getTime()
      : range?.from
        ? new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 23, 59, 59, 999).getTime()
        : null;
    const list = sessions.filter((s) => {
      const t = new Date(s.date_time).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      if (paymentFilter !== "all" && s.payment_status !== paymentFilter) return false;
      if (term) {
        const p = patients.find((x) => x.id === s.patient_id);
        if (!p?.name.toLowerCase().includes(term)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      const da = new Date(a.date_time).getTime();
      const db = new Date(b.date_time).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
  }, [sessions, range, q, paymentFilter, sortDir]);

  const total = filtered.reduce((a, s) => a + (s.payment_status === "isento" ? 0 : s.value), 0);
  const paid = filtered.filter((s) => s.payment_status === "paid").reduce((a, s) => a + s.value, 0);
  const pending = filtered.filter((s) => s.payment_status === "pending").reduce((a, s) => a + s.value, 0);

  const markPaid = (id: string) =>
    setSessions((arr) => arr.map((s) => (s.id === id ? { ...s, payment_status: "paid" } : s)));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const rangeLabel = (() => {
    if (!range?.from) return "Todo o período";
    const fmt = (d: Date) => format(d, "dd MMM yyyy", { locale: ptBR });
    if (!range.to || range.from.getTime() === range.to.getTime()) return fmt(range.from);
    return `${fmt(range.from)} – ${fmt(range.to)}`;
  })();

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Finanças"
          title="Como anda o seu negócio."
          description="Acompanhe o que entrou e o que está por receber, sem complicação."
        />

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card label="Sessões" value={filtered.length.toString()} />
          <Card label="Valor total" value={`R$ ${total.toLocaleString("pt-BR")}`} />
          <Card label="Recebido" value={`R$ ${paid.toLocaleString("pt-BR")}`} accent="success" />
          <Card label="Pendente" value={`R$ ${pending.toLocaleString("pt-BR")}`} accent="warning" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full bg-card border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status">
                {paymentFilter === "all" ? "Todos os status" : PAYMENT_META[paymentFilter].label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {(Object.keys(PAYMENT_META) as PaymentStatus[]).map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  textValue={PAYMENT_META[s].label}
                  className="focus:bg-muted/60 focus:text-foreground data-[state=checked]:bg-primary/8"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{PAYMENT_META[s].label}</span>
                    <span className="text-xs text-muted-foreground">{PAYMENT_META[s].description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2.5 text-sm w-full md:w-[280px] hover:bg-muted/40 transition-colors">
                <span className="flex items-center gap-2 min-w-0">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{rangeLabel}</span>
                </span>
                {range?.from && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setRange(undefined); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-border min-w-[160px]">
                  <PresetButton label="Este mês" onClick={() => setRange({ from: startOfMonth(), to: endOfMonth() })} />
                  <PresetButton label="Mês passado" onClick={() => {
                    const d = new Date(); d.setMonth(d.getMonth() - 1);
                    setRange({ from: startOfMonth(d), to: endOfMonth(d) });
                  }} />
                  <PresetButton label="Últimos 30 dias" onClick={() => {
                    const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29);
                    setRange({ from, to });
                  }} />
                  <PresetButton label="Este ano" onClick={() => {
                    const y = new Date().getFullYear();
                    setRange({ from: new Date(y, 0, 1), to: new Date(y, 11, 31, 23, 59, 59) });
                  }} />
                  <PresetButton label="Todo o período" onClick={() => setRange(undefined)} />
                </div>
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={2}
                  locale={ptBR}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left p-4 font-medium">Paciente</th>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    Última sessão
                    {sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  </button>
                </th>
                <th className="text-right p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => {
                const p = patients.find((x) => x.id === s.patient_id);
                const meta = PAYMENT_META[s.payment_status as PaymentStatus];
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={p?.name ?? "?"} src={p?.avatar} size={36} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(s.date_time).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 text-right tabular-nums">R$ {s.value}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {s.payment_status === "pending" && (
                        <button onClick={() => markPaid(s.id)} className="text-xs bg-primary text-primary-foreground rounded-full px-3 py-1.5 hover:bg-primary/90">
                          Marcar como pago
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Nenhuma sessão neste período.</td></tr>
              )}
            </tbody>
          </table>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left text-sm px-3 py-2 rounded-md hover:bg-muted/60 transition-colors"
    >
      {label}
    </button>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: "success" | "warning" }) {
  const cls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl mt-2 ${cls}`}>{value}</p>
    </div>
  );
}
