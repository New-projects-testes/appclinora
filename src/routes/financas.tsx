import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PatientAvatar } from "@/components/PatientAvatar";
import { Button } from "@/components/ui/button";
import { sessions as initial, patients } from "@/lib/mock-data";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [period]);

  const filtered = useMemo(() => {
    const [y, m] = period.split("-").map(Number);
    return sessions.filter((s) => {
      const d = new Date(s.date_time);
      return d.getFullYear() === y && d.getMonth() === m - 1;
    });
  }, [sessions, period]);

  const total = filtered.reduce((a, s) => a + s.value, 0);
  const paid = filtered.filter((s) => s.payment_status === "paid").reduce((a, s) => a + s.value, 0);
  const pending = total - paid;

  const markPaid = (id: string) =>
    setSessions((arr) => arr.map((s) => (s.id === id ? { ...s, payment_status: "paid" } : s)));

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
                <th className="text-left p-4 font-medium">Data</th>
                <th className="text-right p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const p = patients.find((x) => x.id === s.patient_id);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <span className="font-medium">{p?.name}</span>
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
