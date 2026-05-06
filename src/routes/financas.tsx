import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PatientAvatar } from "@/components/PatientAvatar";
import { Button } from "@/components/ui/button";
import { sessions as initial, patients } from "@/lib/mock-data";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAYMENT_META = {
  paid: { label: "Pago", description: "Sessão já recebida", className: "bg-success/15 text-success" },
  pending: { label: "Pendente", description: "Aguardando pagamento", className: "bg-warning/20 text-warning-foreground" },
} as const;
type PaymentStatus = keyof typeof PAYMENT_META;

const PAGE_SIZE = 10;

export const Route = createFileRoute("/financas")({
  component: Financas,
});

function Financas() {
  const [sessions, setSessions] = useState(initial);
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [q, setQ] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [period, q, paymentFilter]);

  const filtered = useMemo(() => {
    const [y, m] = period.split("-").map(Number);
    const term = q.trim().toLowerCase();
    return sessions.filter((s) => {
      const d = new Date(s.date_time);
      if (d.getFullYear() !== y || d.getMonth() !== m - 1) return false;
      if (paymentFilter !== "all" && s.payment_status !== paymentFilter) return false;
      if (term) {
        const p = patients.find((x) => x.id === s.patient_id);
        if (!p?.name.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [sessions, period, q, paymentFilter]);

  const total = filtered.reduce((a, s) => a + s.value, 0);
  const paid = filtered.filter((s) => s.payment_status === "paid").reduce((a, s) => a + s.value, 0);
  const pending = total - paid;

  const markPaid = (id: string) =>
    setSessions((arr) => arr.map((s) => (s.id === id ? { ...s, payment_status: "paid" } : s)));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Finanças"
          title="Como anda o seu mês."
          description="Acompanhe o que entrou e o que está por receber, sem complicação."
          actions={
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
            />
          }
        />

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card label="Sessões" value={filtered.length.toString()} />
          <Card label="Valor total" value={`R$ ${total.toLocaleString("pt-BR")}`} />
          <Card label="Recebido" value={`R$ ${paid.toLocaleString("pt-BR")}`} accent="success" />
          <Card label="Pendente" value={`R$ ${pending.toLocaleString("pt-BR")}`} accent="warning" />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left p-4 font-medium">Paciente</th>
                <th className="text-left p-4 font-medium">Última sessão</th>
                <th className="text-right p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => {
                const p = patients.find((x) => x.id === s.patient_id);
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
                      <span className={`text-xs px-2 py-1 rounded-full ${s.payment_status === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                        {s.payment_status === "paid" ? "Pago" : "Pendente"}
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

function Card({ label, value, accent }: { label: string; value: string; accent?: "success" | "warning" }) {
  const cls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl mt-2 ${cls}`}>{value}</p>
    </div>
  );
}
