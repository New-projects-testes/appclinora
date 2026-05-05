import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { sessions as initialSessions, patients } from "@/lib/mock-data";
import type { Session } from "@/lib/types";
import { useState } from "react";
import { Plus, Link2, Bell, ChevronLeft, ChevronRight, Copy, Check, Clock, User, Wallet, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/agenda")({
  component: Agenda,
});

type View = "day" | "week" | "month";

function Agenda() {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(new Date());
  const [reminders, setReminders] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sessionList, setSessionList] = useState<Session[]>(initialSessions);

  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    duration: "50",
    value: "220",
    modality: "presencial",
  });

  const [openDetail, setOpenDetail] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const link = "https://clinora.app/agendar/marina-alves";

  const openCreateAt = (date: Date, hour?: number) => {
    setForm({
      patient_id: "",
      date: date.toISOString().slice(0, 10),
      time: hour !== undefined ? `${hour.toString().padStart(2, "0")}:00` : "09:00",
      duration: "50",
      value: "220",
      modality: "presencial",
    });
    setOpenNew(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }
    const dateTime = new Date(`${form.date}T${form.time}`);
    const newSession: Session = {
      id: `s_${Date.now()}`,
      patient_id: form.patient_id,
      date_time: dateTime.toISOString(),
      duration_minutes: Number(form.duration),
      status: "scheduled",
      payment_status: "pending",
      value: Number(form.value),
    };
    setSessionList((s) => [...s, newSession]);
    const p = patients.find((x) => x.id === form.patient_id);
    toast.success(`Sessão criada para ${p?.name} em ${form.date} às ${form.time}`);
    setOpenNew(false);
  };

  const openSessionDetail = (s: Session) => {
    setActiveSession(s);
    setOpenDetail(true);
  };

  const handleCancelSession = () => {
    if (!activeSession) return;
    setSessionList((list) =>
      list.map((s) => (s.id === activeSession.id ? { ...s, status: "cancelled" } : s))
    );
    toast.success("Sessão cancelada");
    setOpenDetail(false);
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Agenda inteligente"
          title="Sua semana, em ordem."
          description="Visualize, agende e compartilhe seus horários com os pacientes."
          actions={
            <button
              onClick={() => openCreateAt(new Date())}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Nova sessão
            </button>
          }
        />

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <Link2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Link público de agendamento</p>
              <p className="text-xs text-muted-foreground truncate">{link}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="inline-flex items-center gap-2 text-sm bg-secondary px-3 py-2 rounded-lg hover:bg-secondary/70"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <button
            onClick={() => setReminders((r) => !r)}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 text-left hover:bg-secondary/30"
          >
            <Bell className={`h-5 w-5 ${reminders ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">Lembretes automáticos</p>
              <p className="text-xs text-muted-foreground">{reminders ? "Ativos — 1h antes" : "Desativados"}</p>
            </div>
            <span className={`h-6 w-11 rounded-full p-0.5 transition ${reminders ? "bg-primary" : "bg-muted"}`}>
              <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${reminders ? "translate-x-5" : ""}`} />
            </span>
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <button onClick={() => move(cursor, setCursor, view, -1)} className="p-2 rounded-lg hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
              <h2 className="font-display text-xl px-2 capitalize">
                {view === "day"
                  ? cursor.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
                  : cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={() => move(cursor, setCursor, view, 1)} className="p-2 rounded-lg hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="flex bg-secondary rounded-full p-1">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-xs rounded-full transition ${view === v ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
                >
                  {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          </div>

          {view === "day" && (
            <DayView
              cursor={cursor}
              sessions={sessionList}
              onEmptyClick={openCreateAt}
              onSessionClick={openSessionDetail}
            />
          )}
          {view === "week" && (
            <WeekView
              cursor={cursor}
              sessions={sessionList}
              onEmptyClick={openCreateAt}
              onSessionClick={openSessionDetail}
            />
          )}
          {view === "month" && (
            <MonthView
              cursor={cursor}
              sessions={sessionList}
              onEmptyClick={(d) => openCreateAt(d)}
              onSessionClick={openSessionDetail}
            />
          )}
        </div>
      </div>

      {/* Nova sessão */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova sessão</DialogTitle>
            <DialogDescription>Agende um novo atendimento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v })}>
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
              <Button type="submit">Criar sessão</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detalhes da sessão */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent>
          {activeSession && (() => {
            const p = patients.find((x) => x.id === activeSession.patient_id);
            const d = new Date(activeSession.date_time);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Detalhes da sessão</DialogTitle>
                  <DialogDescription>
                    {d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{p?.name ?? "Paciente"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                      {activeSession.duration_minutes} min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>R$ {activeSession.value}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeSession.payment_status === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                      {activeSession.payment_status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Status</span>
                    <span className="text-sm capitalize">
                      {activeSession.status === "scheduled" ? "Agendada" : activeSession.status === "done" ? "Concluída" : "Cancelada"}
                    </span>
                  </div>
                  {activeSession.notes && (
                    <p className="text-muted-foreground border-t border-border pt-3">{activeSession.notes}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDetail(false)}>Fechar</Button>
                  {activeSession.status !== "cancelled" && (
                    <Button variant="destructive" onClick={handleCancelSession}>
                      <Trash2 className="h-4 w-4 mr-1" /> Cancelar sessão
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function move(cursor: Date, set: (d: Date) => void, view: View, dir: number) {
  const d = new Date(cursor);
  if (view === "day") d.setDate(d.getDate() + dir);
  else if (view === "week") d.setDate(d.getDate() + 7 * dir);
  else d.setMonth(d.getMonth() + dir);
  set(d);
}

type ViewProps = {
  cursor: Date;
  sessions: Session[];
  onEmptyClick: (date: Date, hour?: number) => void;
  onSessionClick: (s: Session) => void;
};

function DayView({ cursor, sessions, onEmptyClick, onSessionClick }: ViewProps) {
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
  return (
    <div>
      {hours.map((h) => {
        const slot = sessions.find((s) => {
          const sd = new Date(s.date_time);
          return sd.toDateString() === cursor.toDateString() && sd.getHours() === h && s.status !== "cancelled";
        });
        return (
          <div key={h} className="grid grid-cols-[80px_1fr] border-b border-border min-h-[64px]">
            <div className="text-xs text-muted-foreground p-3 border-r border-border tabular-nums">
              {h.toString().padStart(2, "0")}:00
            </div>
            <div
              onClick={() => !slot && onEmptyClick(cursor, h)}
              className={`p-2 ${slot ? "" : "hover:bg-secondary/30 cursor-pointer"}`}
            >
              {slot && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSessionClick(slot); }}
                  className="w-full text-left bg-primary/10 border-l-4 border-primary rounded-lg p-3 hover:bg-primary/15 transition"
                >
                  <p className="font-medium">{patients.find((p) => p.id === slot.patient_id)?.name}</p>
                  <p className="text-xs text-muted-foreground">{slot.duration_minutes} min · R$ {slot.value}</p>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekView({ cursor, sessions, onEmptyClick, onSessionClick }: ViewProps) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,minmax(120px,1fr))] min-w-[800px]">
        <div className="border-b border-r border-border" />
        {days.map((d) => (
          <div key={+d} className="border-b border-r border-border p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">{d.toLocaleDateString("pt-BR", { weekday: "short" })}</p>
            <p className={`font-display text-2xl mt-1 ${d.toDateString() === new Date().toDateString() ? "text-primary" : ""}`}>
              {d.getDate()}
            </p>
          </div>
        ))}

        {hours.map((h) => (
          <div key={h} className="contents">
            <div className="text-xs text-muted-foreground p-2 border-b border-r border-border tabular-nums">
              {h.toString().padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const slot = sessions.find((s) => {
                const sd = new Date(s.date_time);
                return sd.toDateString() === d.toDateString() && sd.getHours() === h && s.status !== "cancelled";
              });
              return (
                <div
                  key={+d + h}
                  onClick={() => !slot && onEmptyClick(d, h)}
                  className={`border-b border-r border-border min-h-[60px] p-1 transition ${slot ? "" : "hover:bg-secondary/30 cursor-pointer"}`}
                >
                  {slot && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSessionClick(slot); }}
                      className="w-full text-left bg-primary/10 border-l-2 border-primary rounded p-1.5 text-xs hover:bg-primary/15"
                    >
                      <p className="font-medium truncate">{patients.find((p) => p.id === slot.patient_id)?.name}</p>
                      <p className="text-muted-foreground">{slot.duration_minutes}min</p>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ cursor, sessions, onEmptyClick, onSessionClick }: ViewProps) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(cursor.getFullYear(), cursor.getMonth(), dayNum);
  });

  return (
    <div className="grid grid-cols-7">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
        <div key={d} className="text-xs uppercase text-muted-foreground p-3 border-b border-border text-center">{d}</div>
      ))}
      {cells.map((d, i) => {
        const daySessions = d
          ? sessions.filter((s) => new Date(s.date_time).toDateString() === d.toDateString() && s.status !== "cancelled")
          : [];
        const today = d && d.toDateString() === new Date().toDateString();
        return (
          <div
            key={i}
            onClick={() => d && onEmptyClick(d)}
            className={`min-h-[100px] border-b border-r border-border p-2 ${!d ? "bg-secondary/20" : "hover:bg-secondary/30 cursor-pointer"}`}
          >
            {d && (
              <>
                <p className={`text-sm font-medium ${today ? "text-primary" : ""}`}>{d.getDate()}</p>
                <div className="mt-1 space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <button
                      key={s.id}
                      onClick={(e) => { e.stopPropagation(); onSessionClick(s); }}
                      className="w-full text-left text-[10px] truncate bg-primary/10 text-primary rounded px-1.5 py-0.5 hover:bg-primary/20"
                    >
                      {new Date(s.date_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{" "}
                      {patients.find((p) => p.id === s.patient_id)?.name.split(" ")[0]}
                    </button>
                  ))}
                  {daySessions.length > 2 && <p className="text-[10px] text-muted-foreground">+{daySessions.length - 2}</p>}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
