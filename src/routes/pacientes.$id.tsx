import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patients, sessions as initialSessions, sessionTemplates } from "@/lib/mock-data";
import type { PatientStatus, Session } from "@/lib/types";
import { useMemo, useState } from "react";
import {
  Phone, Mail, Calendar, User as UserIcon, FileText, ChevronDown,
  Save, Plus, Clock, CircleDollarSign, ShieldCheck, MessageSquare, Pencil,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PatientAvatar } from "@/components/PatientAvatar";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<PatientStatus, { label: string; cls: string }> = {
  ativo: { label: "Ativo", cls: "bg-success/15 text-success" },
  em_pausa: { label: "Em pausa", cls: "bg-warning/20 text-warning-foreground" },
  inativo: { label: "Inativo", cls: "bg-muted text-muted-foreground" },
  encerrado: { label: "Encerrado", cls: "bg-secondary text-secondary-foreground" },
};

const GENDER_LABEL: Record<string, string> = {
  mulher_cis: "Mulher cis", homem_cis: "Homem cis",
  mulher_trans: "Mulher trans", homem_trans: "Homem trans",
  nao_binario: "Não-binário", genero_fluido: "Gênero fluido",
  agenero: "Agênero", outro: "Outro", prefiro_nao_dizer: "Prefiro não dizer",
};

type PaymentStatus = Session["payment_status"];
const PAY_META: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: { label: "Pago", cls: "bg-success/15 text-success" },
  pending: { label: "Pendente", cls: "bg-warning/20 text-warning-foreground" },
  isento: { label: "Isento", cls: "bg-secondary text-secondary-foreground" },
};

function calcAge(birth?: string) {
  if (!birth) return null;
  const d = new Date(birth);
  if (isNaN(+d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const Route = createFileRoute("/pacientes/$id")({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const original = patients.find((p) => p.id === id);
  const [patient, setPatient] = useState(original);
  const [status, setStatus] = useState<PatientStatus>(original?.status ?? "ativo");
  const [allSessions, setAllSessions] = useState<Session[]>(initialSessions);
  const [tab, setTab] = useState("atendimentos");
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Editor state
  const [draft, setDraft] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [templateId, setTemplateId] = useState("");

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

  const age = calcAge(patient.birthDate);
  const patientSessions = allSessions
    .filter((s) => s.patient_id === id)
    .sort((a, b) => +new Date(b.date_time) - +new Date(a.date_time));

  const upcoming = [...patientSessions]
    .reverse()
    .find((s) => s.status === "scheduled" && new Date(s.date_time) > new Date());
  const history = patientSessions.filter((s) => s.status === "done");

  const applyTemplate = (tplId: string) => {
    setTemplateId(tplId);
    const tpl = sessionTemplates.find((t) => t.id === tplId);
    if (tpl && editor) {
      editor.commands.setContent(tpl.content);
      setDraft(tpl.content);
    }
  };

  const saveNotes = () => {
    if (!draft.trim() || draft === "<p></p>") {
      toast.error("Escreva alguma anotação antes de salvar.");
      return;
    }
    const target = upcoming;
    if (target) {
      setAllSessions((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, status: "done", notes: draft } : s)),
      );
    } else {
      const newSession: Session = {
        id: `s${Date.now()}`,
        patient_id: id,
        date_time: new Date().toISOString(),
        duration_minutes: 50,
        status: "done",
        payment_status: "pending",
        value: 220,
        notes: draft,
      };
      setAllSessions((prev) => [...prev, newSession]);
    }
    toast.success("Anotações salvas no histórico");
    editor?.commands.clearContent();
    setDraft("");
    setTemplateId("");
    setTab("historico");
  };

  const updatePayment = (sessionId: string, ps: PaymentStatus) => {
    setAllSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, payment_status: ps } : s)));
  };

  const fin = useMemo(() => {
    const done = patientSessions.filter((s) => s.status === "done");
    const paid = done.filter((s) => s.payment_status === "paid");
    const pending = done.filter((s) => s.payment_status === "pending");
    const isento = done.filter((s) => s.payment_status === "isento");
    return {
      paidTotal: paid.reduce((a, s) => a + s.value, 0),
      pendingTotal: pending.reduce((a, s) => a + s.value, 0),
      isentoTotal: isento.reduce((a, s) => a + s.value, 0),
      totalCount: done.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      isentoCount: isento.length,
    };
  }, [patientSessions]);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/pacientes">Pacientes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{patient.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <PatientAvatar name={patient.name} src={patient.avatar} size={96} className="text-3xl" />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl truncate">{patient.name}</h1>
                <Select value={status} onValueChange={(v) => setStatus(v as PatientStatus)}>
                  <SelectTrigger className={cn("h-7 w-[130px] border-0 text-xs font-medium", STATUS_META[status].cls)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_META) as PatientStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="focus:bg-muted/60 focus:text-foreground">
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {patient.isMinor && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-accent/10 text-accent">
                    <ShieldCheck className="h-3 w-3" /> Menor de idade
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-5">
                <InfoField icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" value={patient.email} />
                <InfoField icon={<Phone className="h-3.5 w-3.5" />} label="WhatsApp" value={patient.phone} />
                <InfoField
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Nascimento"
                  value={patient.birthDate ? `${new Date(patient.birthDate).toLocaleDateString("pt-BR")}${age !== null ? ` · ${age} anos` : ""}` : "—"}
                />
                <InfoField
                  icon={<UserIcon className="h-3.5 w-3.5" />}
                  label="Gênero"
                  value={patient.gender ? (GENDER_LABEL[patient.gender] ?? patient.gender) : "—"}
                />
                <InfoField
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Última sessão"
                  value={patient.lastSession ? new Date(patient.lastSession).toLocaleDateString("pt-BR") : "—"}
                />
                <InfoField
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Tags"
                  value={patient.tags.length ? patient.tags.join(", ") : "—"}
                />
              </div>

              {patient.isMinor && (
                <div className="mt-5 border border-border rounded-xl p-4 bg-muted/30">
                  <p className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5 mb-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Responsável legal
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    <InfoField icon={<UserIcon className="h-3.5 w-3.5" />} label="Nome" value={patient.guardianName ?? "—"} />
                    <InfoField icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" value={patient.guardianEmail ?? "—"} />
                    <InfoField icon={<Phone className="h-3.5 w-3.5" />} label="WhatsApp" value={patient.guardianPhone ?? "—"} />
                  </div>
                </div>
              )}

              {patient.notes && (
                <div className="mt-5 border-l-2 border-primary/40 pl-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="icon" className="rounded-lg" onClick={() => setOpenEdit(true)} aria-label="Editar paciente">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button onClick={() => setOpenSchedule(true)} className="rounded-lg">
                <Plus className="h-4 w-4" /> Nova sessão
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6">
            <TabTrigger value="atendimentos">Atendimentos</TabTrigger>
            <TabTrigger value="historico">Histórico de sessões</TabTrigger>
            <TabTrigger value="financeiro">Financeiro</TabTrigger>
          </TabsList>

          {/* TAB: Atendimentos */}
          <TabsContent value="atendimentos" className="space-y-6 mt-0">
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-lg mb-4">Próxima sessão</h2>
              {upcoming ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-primary/8 text-primary rounded-xl px-4 py-3 text-center min-w-[80px]">
                    <p className="text-2xl font-display leading-none">{new Date(upcoming.date_time).getDate().toString().padStart(2, "0")}</p>
                    <p className="text-xs uppercase mt-1">{new Date(upcoming.date_time).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</p>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium">{fmtDate(upcoming.date_time)}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtTime(upcoming.date_time)} · {upcoming.duration_minutes} min</span>
                      <span className="inline-flex items-center gap-1"><CircleDollarSign className="h-3 w-3" /> R$ {upcoming.value}</span>
                    </div>
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full", PAY_META[upcoming.payment_status].cls)}>
                    {PAY_META[upcoming.payment_status].label}
                  </span>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>Nenhuma sessão agendada.</p>
                  <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={() => setOpenSchedule(true)}>
                    <Plus className="h-4 w-4" /> Agendar sessão
                  </Button>
                </div>
              )}
            </section>

            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="font-display text-lg">Anotações da sessão</h2>
                <Select value={templateId} onValueChange={applyTemplate}>
                  <SelectTrigger className="w-[260px] h-9">
                    <SelectValue placeholder="Aplicar template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTemplates.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        textValue={t.name}
                        className="focus:bg-muted/60 focus:text-foreground"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{t.name}</span>
                          <span className="text-xs text-muted-foreground">{t.approach}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <RichTextEditor
                value={draft}
                onChange={setDraft}
                placeholder="Comece a escrever ou aplique um template..."
                onReady={setEditor}
              />

              <div className="flex justify-end mt-4">
                <Button onClick={saveNotes} className="rounded-lg">
                  <Save className="h-4 w-4" /> Salvar anotações
                </Button>
              </div>
            </section>
          </TabsContent>

          {/* TAB: Histórico */}
          <TabsContent value="historico" className="mt-0">
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-lg mb-6">Histórico de sessões</h2>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma sessão registrada ainda.</p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-3">
                    {history.map((s) => (
                      <SessionTimelineItem key={s.id} session={s} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>

          {/* TAB: Financeiro */}
          <TabsContent value="financeiro" className="space-y-6 mt-0">
            <div className="grid sm:grid-cols-3 gap-4">
              <KpiCard label="Total recebido" value={`R$ ${fin.paidTotal.toLocaleString("pt-BR")}`} sub={`${fin.paidCount} sessões pagas`} accent="success" />
              <KpiCard label="A receber" value={`R$ ${fin.pendingTotal.toLocaleString("pt-BR")}`} sub={`${fin.pendingCount} pendentes`} accent="warning" />
              <KpiCard label="Isento" value={`R$ ${fin.isentoTotal.toLocaleString("pt-BR")}`} sub={`${fin.isentoCount} sessões isentas`} />
            </div>

            <section className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display text-lg">Extrato de sessões</h2>
                <span className="text-xs text-muted-foreground">{fin.totalCount} sessões realizadas</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Horário</th>
                    <th className="text-right p-4 font-medium">Valor</th>
                    <th className="text-left p-4 font-medium w-[180px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientSessions.filter((s) => s.status === "done").map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm">{fmtDate(s.date_time)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{fmtTime(s.date_time)}</td>
                      <td className="p-4 text-sm tabular-nums text-right">R$ {s.value.toLocaleString("pt-BR")}</td>
                      <td className="p-4">
                        <Select value={s.payment_status} onValueChange={(v) => updatePayment(s.id, v as PaymentStatus)}>
                          <SelectTrigger className={cn("h-8 w-[140px] border-0 text-xs font-medium", PAY_META[s.payment_status].cls)}>
                            <span>{PAY_META[s.payment_status].label}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(PAY_META) as PaymentStatus[]).map((k) => (
                              <SelectItem key={k} value={k} className="focus:bg-muted/60">
                                {PAY_META[k].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {fin.totalCount === 0 && (
                    <tr><td colSpan={4} className="p-10 text-center text-sm text-muted-foreground">Sem sessões realizadas.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleSessionDialog
        open={openSchedule}
        onOpenChange={setOpenSchedule}
        onCreate={(s) => {
          setAllSessions((prev) => [...prev, { ...s, patient_id: id }]);
          toast.success("Sessão agendada");
        }}
      />

      <EditPatientDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        patient={patient}
        onSave={(updated) => {
          setPatient(updated);
          setStatus(updated.status);
          toast.success("Dados do paciente atualizados");
        }}
      />
    </AppShell>
  );
}

function EditPatientDialog({
  open, onOpenChange, patient, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patient: NonNullable<ReturnType<typeof patients.find>>;
  onSave: (p: NonNullable<ReturnType<typeof patients.find>>) => void;
}) {
  const [form, setForm] = useState(patient);
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setForm(patient); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>Atualize os dados cadastrais do paciente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ep-name">Nome completo</Label>
              <Input id="ep-name" value={form.name} onChange={(e) => upd("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-email">E-mail</Label>
              <Input id="ep-email" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-phone">WhatsApp</Label>
              <Input id="ep-phone" value={form.phone} onChange={(e) => upd("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-birth">Nascimento</Label>
              <Input id="ep-birth" type="date" value={form.birthDate ?? ""} onChange={(e) => upd("birthDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-gender">Gênero</Label>
              <Select value={form.gender ?? ""} onValueChange={(v) => upd("gender", v)}>
                <SelectTrigger id="ep-gender"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GENDER_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => upd("status", v as PatientStatus)}>
                <SelectTrigger id="ep-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_META) as PatientStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-avatar">URL do avatar</Label>
              <Input id="ep-avatar" value={form.avatar ?? ""} onChange={(e) => upd("avatar", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ep-notes">Observações</Label>
              <Textarea id="ep-notes" rows={3} value={form.notes ?? ""} onChange={(e) => upd("notes", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox id="ep-minor" checked={!!form.isMinor} onCheckedChange={(v) => upd("isMinor", !!v)} />
            <Label htmlFor="ep-minor" className="cursor-pointer">Paciente menor de idade</Label>
          </div>

          {form.isMinor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border rounded-xl p-4 bg-muted/30">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ep-gname">Nome do responsável</Label>
                <Input id="ep-gname" value={form.guardianName ?? ""} onChange={(e) => upd("guardianName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-gemail">E-mail do responsável</Label>
                <Input id="ep-gemail" type="email" value={form.guardianEmail ?? ""} onChange={(e) => upd("guardianEmail", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-gphone">WhatsApp do responsável</Label>
                <Input id="ep-gphone" value={form.guardianPhone ?? ""} onChange={(e) => upd("guardianPhone", e.target.value)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-lg">Salvar alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleSessionDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (s: Omit<Session, "patient_id">) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(50);
  const [value, setValue] = useState(220);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { toast.error("Selecione uma data"); return; }
    const iso = new Date(`${date}T${time}:00`).toISOString();
    onCreate({
      id: `s${Date.now()}`,
      date_time: iso,
      duration_minutes: duration,
      status: "scheduled",
      payment_status: "pending",
      value,
      notes: "",
    });
    setDate(""); setTime("09:00"); setDuration(50); setValue(220);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar nova sessão</DialogTitle>
          <DialogDescription>Defina data, horário e valor da sessão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dur">Duração (min)</Label>
              <Input id="dur" type="number" min={10} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="val">Valor (R$)</Label>
              <Input id="val" type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-lg">Agendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground/70 inline-flex items-center gap-1.5 mb-1">
        <span>{icon}</span>{label}
      </p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  );
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
    >
      {children}
    </TabsTrigger>
  );
}

function SessionTimelineItem({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <span className="absolute -left-[22px] top-3 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
      <Collapsible open={open} onOpenChange={setOpen} className="border border-border rounded-xl hover:border-primary/40 transition-colors">
        <CollapsibleTrigger className="w-full text-left p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{fmtDate(session.date_time)}</p>
              <p className="text-xs text-muted-foreground">
                {fmtTime(session.date_time)} · {session.duration_minutes} min
              </p>
            </div>
            <span className={cn("text-xs px-2.5 py-1 rounded-full", PAY_META[session.payment_status].cls)}>
              {PAY_META[session.payment_status].label}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t border-border mx-4 min-w-0">
            {session.notes ? (
              <div
                className="rt-content text-sm text-foreground pt-3 max-h-[320px] overflow-y-auto break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: session.notes }}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic pt-3">Sem anotações registradas.</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function KpiCard({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent?: "success" | "warning" }) {
  const cls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning-foreground" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-display text-2xl mt-2 tabular-nums", cls)}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
