import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patients, sessions, tags, annotations as initial, sessionTemplates } from "@/lib/mock-data";
import type { PatientStatus } from "@/lib/types";
import { useState } from "react";
import { ArrowLeft, Phone, Mail, Plus, X, Save, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_LABEL: Record<PatientStatus, string> = {
  ativo: "Ativo",
  em_pausa: "Em pausa",
  inativo: "Inativo",
  encerrado: "Encerrado",
};

export const Route = createFileRoute("/pacientes/$id")({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const patient = patients.find((p) => p.id === id);
  const [status, setStatus] = useState<PatientStatus>(patient?.status ?? "ativo");
  const [patientTags, setPatientTags] = useState<string[]>(patient?.tags ?? []);
  const [notes, setNotes] = useState(initial[id] ?? []);
  const [draft, setDraft] = useState("");
  const [template, setTemplate] = useState("");

  if (!patient) {
    return (
      <AppShell>
        <div className="p-10">
          <Link to="/pacientes" className="text-sm text-primary">← Voltar</Link>
          <p className="mt-4">Paciente não encontrado.</p>
        </div>
      </AppShell>
    );
  }

  const patientSessions = sessions
    .filter((s) => s.patient_id === id)
    .sort((a, b) => +new Date(b.date_time) - +new Date(a.date_time));

  const paidTotal = patientSessions.filter((s) => s.payment_status === "paid").reduce((a, s) => a + s.value, 0);
  const pendingTotal = patientSessions.filter((s) => s.payment_status === "pending").reduce((a, s) => a + s.value, 0);

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes([{ id: String(Date.now()), date: new Date().toISOString(), content: draft }, ...notes]);
    setDraft("");
  };

  const applyTemplate = (tplId: string) => {
    const tpl = sessionTemplates.find((t) => t.id === tplId);
    if (tpl) setDraft(tpl.content);
    setTemplate(tplId);
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <Link to="/pacientes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Pacientes
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img src={patient.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            <div className="flex-1">
              <h1 className="font-display text-3xl">{patient.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {patient.email}
                </p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {patient.phone}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Select value={status} onValueChange={(v) => setStatus(v as PatientStatus)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as PatientStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {patientTags.map((tid) => {
                  const tag = tags.find((t) => t.id === tid);
                  return tag ? (
                    <span key={tid} className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent-foreground rounded-full pl-2.5 pr-1 py-0.5">
                      {tag.name}
                      <button onClick={() => setPatientTags(patientTags.filter((x) => x !== tid))} className="p-0.5 hover:bg-black/10 rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
                <select
                  value=""
                  onChange={(e) => e.target.value && setPatientTags([...patientTags, e.target.value])}
                  className="text-xs bg-secondary rounded-full px-2.5 py-0.5 border-0"
                >
                  <option value="">+ tag</option>
                  {tags.filter((t) => !patientTags.includes(t.id)).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90">
              <Save className="h-4 w-4" /> Salvar prontuário
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">Anotações</h2>
                <select
                  value={template}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="text-xs bg-secondary rounded-lg px-3 py-1.5 border-0"
                >
                  <option value="">Usar template...</option>
                  {sessionTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreva uma nova anotação..."
                rows={5}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex justify-end mt-3">
                <button onClick={addNote} className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> Adicionar
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {notes.map((n) => (
                  <div key={n.id} className="border-l-2 border-primary/40 pl-4 py-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {new Date(n.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma anotação ainda.</p>
                )}
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl mb-4">Histórico de sessões</h2>
              <div className="space-y-2">
                {patientSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{new Date(s.date_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{s.notes || "Sem resumo"}</p>
                    </div>
                    <span className="text-sm tabular-nums">R$ {s.value}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${s.payment_status === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                      {s.payment_status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-lg mb-4">Financeiro</h3>
              <div className="space-y-3">
                <Row label="Total recebido" value={`R$ ${paidTotal.toLocaleString("pt-BR")}`} accent="success" />
                <Row label="Pendente" value={`R$ ${pendingTotal.toLocaleString("pt-BR")}`} accent="warning" />
                <Row label="Sessões" value={patientSessions.length.toString()} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "success" | "warning" }) {
  const cls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="flex justify-between items-baseline border-b border-border pb-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-display text-xl tabular-nums ${cls}`}>{value}</span>
    </div>
  );
}
