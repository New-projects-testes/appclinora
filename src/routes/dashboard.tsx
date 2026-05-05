import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { currentUser, sessions, tasks, patients } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Plus, Clock, Wallet, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const today = new Date();
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: "50",
    value: "220",
    modality: "presencial",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }
    const p = patients.find((x) => x.id === form.patient_id);
    toast.success(`Sessão criada para ${p?.name} em ${form.date} às ${form.time}`);
    setOpenNew(false);
  };

  const todaySessions = useMemo(
    () =>
      sessions
        .filter((s) => {
          const d = new Date(s.date_time);
          return (
            d.toDateString() === today.toDateString() && s.status === "scheduled"
          );
        })
        .sort((a, b) => +new Date(a.date_time) - +new Date(b.date_time)),
    []
  );

  const monthSessions = sessions.filter((s) => {
    const d = new Date(s.date_time);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const paid = monthSessions.filter((s) => s.payment_status === "paid").reduce((a, s) => a + s.value, 0);
  const pending = monthSessions.filter((s) => s.payment_status === "pending").reduce((a, s) => a + s.value, 0);

  const pendingTasks = tasks.filter((t) => t.status !== "concluido");

  const greeting = today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow={today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          title={`${greeting}, ${currentUser.name.split(" ")[1] || currentUser.name}.`}
          description="Aqui está o panorama do seu dia e do seu mês."
          actions={
            <>
              {currentUser.verification_status && <VerifiedBadge size="md" />}
              <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Nova sessão
              </button>
            </>
          }
        />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Stat label="Sessões hoje" value={todaySessions.length.toString()} sub={`${todaySessions.length * 50} min agendados`} />
          <Stat label="Recebido no mês" value={`R$ ${paid.toLocaleString("pt-BR")}`} sub={`${monthSessions.filter((s) => s.payment_status === "paid").length} sessões pagas`} accent="success" />
          <Stat label="A receber" value={`R$ ${pending.toLocaleString("pt-BR")}`} sub={`${monthSessions.filter((s) => s.payment_status === "pending").length} sessões pendentes`} accent="warning" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl">Agenda de hoje</h2>
              <Link to="/agenda" className="text-sm text-primary hover:underline">Ver agenda completa →</Link>
            </div>
            {todaySessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Nenhum atendimento hoje. Aproveite para descansar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySessions.map((s) => {
                  const p = patients.find((x) => x.id === s.patient_id)!;
                  return (
                    <Link
                      key={s.id}
                      to="/pacientes/$id"
                      params={{ id: p.id }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/60 transition group"
                    >
                      <div className="font-display text-2xl tabular-nums text-primary w-20">
                        {new Date(s.date_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <img src={p.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{s.duration_minutes} min · R$ {s.value}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${s.payment_status === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                        {s.payment_status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl">Tarefas pendentes</h2>
              <Link to="/tarefas" className="text-sm text-primary hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((t) => {
                const done = doneTasks.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() =>
                      setDoneTasks((s) => {
                        const n = new Set(s);
                        n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                        return n;
                      })
                    }
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 text-left"
                  >
                    <CheckCircle2 className={`h-5 w-5 mt-0.5 shrink-0 ${done ? "text-success fill-success/20" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                    </div>
                  </button>
                );
              })}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sem pendências 🌿</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: "success" | "warning" }) {
  const accentCls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-4xl mt-3 ${accentCls}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1.5">
        <Wallet className="h-3.5 w-3.5" /> {sub}
      </p>
    </div>
  );
}
