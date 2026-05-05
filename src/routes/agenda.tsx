import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { sessions, patients } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { Plus, Link2, Bell, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/agenda")({
  component: Agenda,
});

function Agenda() {
  const [view, setView] = useState<"month" | "week">("week");
  const [cursor, setCursor] = useState(new Date());
  const [reminders, setReminders] = useState(true);
  const [copied, setCopied] = useState(false);

  const link = "https://clinora.app/agendar/marina-alves";

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Agenda inteligente"
          title="Sua semana, em ordem."
          description="Visualize, agende e compartilhe seus horários com os pacientes."
          actions={
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90">
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
                {cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={() => move(cursor, setCursor, view, 1)} className="p-2 rounded-lg hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="flex bg-secondary rounded-full p-1">
              {(["week", "month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 text-xs rounded-full transition ${view === v ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
                >
                  {v === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          </div>

          {view === "week" ? <WeekView cursor={cursor} /> : <MonthView cursor={cursor} />}
        </div>
      </div>
    </AppShell>
  );
}

function move(cursor: Date, set: (d: Date) => void, view: "week" | "month", dir: number) {
  const d = new Date(cursor);
  if (view === "week") d.setDate(d.getDate() + 7 * dir);
  else d.setMonth(d.getMonth() + dir);
  set(d);
}

function WeekView({ cursor }: { cursor: Date }) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8h–19h

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
                return sd.toDateString() === d.toDateString() && sd.getHours() === h;
              });
              return (
                <div key={+d + h} className="border-b border-r border-border min-h-[60px] p-1 hover:bg-secondary/30 transition">
                  {slot && (
                    <div className="bg-primary/10 border-l-2 border-primary rounded p-1.5 text-xs">
                      <p className="font-medium truncate">{patients.find((p) => p.id === slot.patient_id)?.name}</p>
                      <p className="text-muted-foreground">{slot.duration_minutes}min</p>
                    </div>
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

function MonthView({ cursor }: { cursor: Date }) {
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
        const daySessions = d ? sessions.filter((s) => new Date(s.date_time).toDateString() === d.toDateString()) : [];
        const today = d && d.toDateString() === new Date().toDateString();
        return (
          <div key={i} className={`min-h-[100px] border-b border-r border-border p-2 ${!d ? "bg-secondary/20" : ""}`}>
            {d && (
              <>
                <p className={`text-sm font-medium ${today ? "text-primary" : ""}`}>{d.getDate()}</p>
                <div className="mt-1 space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <div key={s.id} className="text-[10px] truncate bg-primary/10 text-primary rounded px-1.5 py-0.5">
                      {new Date(s.date_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{" "}
                      {patients.find((p) => p.id === s.patient_id)?.name.split(" ")[0]}
                    </div>
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
