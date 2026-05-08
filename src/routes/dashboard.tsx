import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PatientAvatar } from "@/components/PatientAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { useMemo, useState } from "react";
import { Plus, Clock, Wallet, CheckCircle2, CalendarCheck, Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const today = new Date();

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("sessions").select("*").order("date_time");
      if (error) throw error;
      return data as SessionRow[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("name");
      if (error) throw error;
      return data as PatientRow[];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      return data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (s: Database["public"]["Tables"]["sessions"]["Insert"]) => {
      const { error } = await supabase.from("sessions").insert(s);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleTaskMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Database["public"]["Enums"]["task_status"] }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: "50",
    value: "220",
    modality: "presencial" as "presencial" | "online",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.patient_id) return toast.error("Selecione um paciente");
    const dateTime = new Date(`${form.date}T${form.time}`);
    createMut.mutate({
      owner_id: user.id,
      patient_id: form.patient_id,
      date_time: dateTime.toISOString(),
      duration_minutes: Number(form.duration),
      status: "scheduled",
      payment_status: "pending",
      value: Number(form.value),
      modality: form.modality,
    }, {
      onSuccess: () => {
        toast.success("Sessão criada");
        setOpenNew(false);
      },
    });
  };

  const todaySessions = useMemo(
    () => sessions
      .filter((s) => new Date(s.date_time).toDateString() === today.toDateString() && s.status === "scheduled")
      .sort((a, b) => +new Date(a.date_time) - +new Date(b.date_time)),
    [sessions]
  );

  const monthSessions = sessions.filter((s) => {
    const d = new Date(s.date_time);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const paid = monthSessions.filter((s) => s.payment_status === "paid").reduce((a, s) => a + Number(s.value), 0);
  const pending = monthSessions.filter((s) => s.payment_status === "pending").reduce((a, s) => a + Number(s.value), 0);

  const pendingTasks = tasks.filter((t) => t.status !== "concluido");
  const greeting = today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const firstName = profile?.name?.split(" ")[0] || "por aí";

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow={today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          title={`${greeting}, ${firstName}.`}
          description="Aqui está o panorama do seu dia e do seu mês."
          actions={
            <>
              {profile?.verification_status && <VerifiedBadge size="md" />}
              <Button onClick={() => setOpenNew(true)} className="rounded-lg">
                <Plus className="h-4 w-4" /> Nova sessão
              </Button>
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
              <EmptyState
                icon={CalendarCheck}
                title="Dia tranquilo pela frente"
                description={patients.length === 0 ? "Cadastre seu primeiro paciente para começar a agendar atendimentos." : "Nenhum atendimento para hoje. Aproveite para descansar ou organizar a semana."}
                action={
                  patients.length === 0 ? (
                    <Button asChild className="rounded-lg"><Link to="/pacientes">Cadastrar paciente</Link></Button>
                  ) : (
                    <Button onClick={() => setOpenNew(true)} className="rounded-lg"><Plus className="h-4 w-4" /> Agendar sessão</Button>
                  )
                }
              />
            ) : (
              <div className="space-y-2">
                {todaySessions.map((s) => {
                  const p = patients.find((x) => x.id === s.patient_id);
                  if (!p) return null;
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
                      <PatientAvatar name={p.name} src={p.avatar_url ?? undefined} size={40} />
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
            {pendingTasks.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Sem pendências"
                description="Você está em dia! Crie tarefas para organizar follow-ups e estudos."
              />
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTaskMut.mutate({ id: t.id, status: "concluido" })}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/60 text-left"
                  >
                    <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova sessão</DialogTitle>
            <DialogDescription>Agende um novo atendimento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              {patients.length === 0 ? (
                <p className="text-xs text-muted-foreground">Cadastre um paciente em /pacientes antes de agendar.</p>
              ) : (
                <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Horário</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v as "presencial" | "online" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNew(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMut.isPending}>Criar sessão</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
