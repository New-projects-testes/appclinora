import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { patients as initialPatients } from "@/lib/mock-data";
import type { Patient, PatientStatus } from "@/lib/types";
import React, { useMemo, useState } from "react";
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PatientAvatar } from "@/components/PatientAvatar";
import { toast } from "sonner";

export const Route = createFileRoute("/pacientes/")({
  component: Pacientes,
});

const STATUS_META: Record<PatientStatus, { label: string; description: string; className: string }> = {
  ativo: { label: "Ativo", description: "Em acompanhamento regular", className: "bg-success/15 text-success" },
  em_pausa: { label: "Em pausa", description: "Interrompeu temporariamente", className: "bg-warning/20 text-warning-foreground" },
  inativo: { label: "Inativo", description: "Não retorna há um tempo", className: "bg-muted text-muted-foreground" },
  encerrado: { label: "Encerrado", description: "Processo finalizado", className: "bg-secondary text-secondary-foreground" },
};

const PAGE_SIZE = 10;

type SortKey = "name" | "lastSession";
type SortDir = "asc" | "desc";

function Pacientes() {
  const navigate = useNavigate();
  const [list, setList] = useState<Patient[]>(initialPatients);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">("all");
  const [lastSessionFilter, setLastSessionFilter] = useState<"all" | "7" | "30" | "90" | "older">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    const days = (n: number) => n * 24 * 60 * 60 * 1000;
    return list.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (lastSessionFilter !== "all") {
        if (!p.lastSession) return lastSessionFilter === "older";
        const diff = now - new Date(p.lastSession).getTime();
        if (lastSessionFilter === "7" && diff > days(7)) return false;
        if (lastSessionFilter === "30" && diff > days(30)) return false;
        if (lastSessionFilter === "90" && diff > days(90)) return false;
        if (lastSessionFilter === "older" && diff <= days(90)) return false;
      }
      return true;
    });
  }, [list, q, statusFilter, lastSessionFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else {
        const av = a.lastSession ? new Date(a.lastSession).getTime() : 0;
        const bv = b.lastSession ? new Date(b.lastSession).getTime() : 0;
        cmp = av - bv;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "name" ? "asc" : "desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const updateStatus = (id: string, status: PatientStatus) => {
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Pacientes"
          title="Quem está sob seus cuidados."
          actions={
            <Button onClick={() => setOpenNew(true)} className="rounded-lg">
              <Plus className="h-4 w-4" /> Novo paciente
            </Button>
          }
        />

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por nome..."
              className="w-full bg-card border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {(Object.keys(STATUS_META) as PatientStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lastSessionFilter} onValueChange={(v) => { setLastSessionFilter(v as any); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Última sessão" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer data</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="older">Mais de 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left p-4 font-medium">
                  <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Paciente <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left p-4 font-medium">WhatsApp</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">
                  <button onClick={() => toggleSort("lastSession")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Última sessão <SortIcon k="lastSession" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td
                    className="p-0 cursor-pointer group"
                    onClick={() => navigate({ to: "/pacientes/$id", params: { id: p.id } })}
                  >
                    <div className="flex items-center gap-3 p-4 transition-colors group-hover:bg-primary/5">
                      <PatientAvatar name={p.name} src={p.avatar} size={36} />
                      <div className="min-w-0">
                        <p className="font-medium group-hover:text-primary transition-colors truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{p.phone}</td>
                  <td className="p-4">
                    <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v as PatientStatus)}>
                      <SelectTrigger className={`h-8 w-[140px] border-0 text-xs font-medium ${STATUS_META[p.status].className}`}>
                        <span>{STATUS_META[p.status].label}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_META) as PatientStatus[]).map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            textValue={STATUS_META[s].label}
                            className="focus:bg-muted/60 focus:text-foreground data-[state=checked]:bg-primary/8"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-foreground">{STATUS_META[s].label}</span>
                              <span className="text-xs text-muted-foreground">{STATUS_META[s].description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {p.lastSession ? new Date(p.lastSession).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Nenhum paciente encontrado.</td></tr>
              )}
            </tbody>
          </table>

          {sorted.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} de {sorted.length}
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

      <NewPatientDialog
        open={openNew}
        onOpenChange={setOpenNew}
        onCreate={(p) => { setList([p, ...list]); setPage(1); toast.success("Paciente criado com sucesso"); }}
      />
    </AppShell>
  );
}

function NewPatientDialog({
  open, onOpenChange, onCreate,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (p: Patient) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [notes, setNotes] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [gName, setGName] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setBirthDate(""); setGender(""); setNotes("");
    setIsMinor(false); setGName(""); setGEmail(""); setGPhone(""); setPhoto(undefined);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (isMinor && (!gName.trim() || !gEmail.trim() || !gPhone.trim())) {
      toast.error("Preencha os dados do responsável");
      return;
    }
    const p: Patient = {
      id: `p${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate: birthDate || undefined,
      gender: gender || undefined,
      notes: notes.trim() || undefined,
      isMinor,
      guardianName: isMinor ? gName.trim() : undefined,
      guardianEmail: isMinor ? gEmail.trim() : undefined,
      guardianPhone: isMinor ? gPhone.trim() : undefined,
      status: "ativo",
      tags: [],
      avatar: photo,
    };
    onCreate(p);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo paciente</DialogTitle>
          <DialogDescription>Preencha os dados para criar um novo prontuário.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <PatientAvatar name={name || "?"} src={photo} size={64} />
            <div className="flex flex-col gap-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {photo ? "Trocar foto" : "Adicionar foto"}
                </Button>
                {photo && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPhoto(undefined)}>
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Opcional. PNG ou JPG.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nome completo" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            </Field>
            <Field label="E-mail" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            </Field>
            <Field label="WhatsApp" required>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} required />
            </Field>
            <Field label="Data de nascimento">
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </Field>
            <Field label="Gênero">
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mulher_cis">Mulher cis</SelectItem>
                  <SelectItem value="homem_cis">Homem cis</SelectItem>
                  <SelectItem value="mulher_trans">Mulher trans</SelectItem>
                  <SelectItem value="homem_trans">Homem trans</SelectItem>
                  <SelectItem value="nao_binario">Não-binário</SelectItem>
                  <SelectItem value="genero_fluido">Gênero fluido</SelectItem>
                  <SelectItem value="agenero">Agênero</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Observações">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={1000} />
          </Field>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox id="minor" checked={isMinor} onCheckedChange={(v) => setIsMinor(!!v)} />
            <Label htmlFor="minor" className="cursor-pointer">Paciente menor de idade</Label>
          </div>

          {isMinor && (
            <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
              <p className="text-sm font-medium">Dados do responsável</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nome completo" required>
                  <Input value={gName} onChange={(e) => setGName(e.target.value)} maxLength={120} required />
                </Field>
                <Field label="E-mail" required>
                  <Input type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)} maxLength={255} required />
                </Field>
                <Field label="WhatsApp" required>
                  <Input value={gPhone} onChange={(e) => setGPhone(e.target.value)} maxLength={20} required />
                </Field>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Criar paciente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}
