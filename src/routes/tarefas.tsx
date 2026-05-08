import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { useMemo, useState } from "react";
import { Plus, List, LayoutGrid, Pencil, Trash2, ListTodo } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskStatus = Database["public"]["Enums"]["task_status"];
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export const Route = createFileRoute("/tarefas")({
  component: Tarefas,
});

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "a_fazer", title: "A fazer" },
  { id: "em_andamento", title: "Em andamento" },
  { id: "concluido", title: "Concluído" },
];

const STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  a_fazer: { label: "A fazer", className: "bg-muted text-foreground/70" },
  em_andamento: { label: "Em andamento", className: "bg-warning/15 text-warning-foreground" },
  concluido: { label: "Concluído", className: "bg-success/15 text-success" },
};

const STATUS_ORDER: Record<TaskStatus, number> = { a_fazer: 0, em_andamento: 1, concluido: 2 };

function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

type FormState = { title: string; description: string; patient_id: string };
const EMPTY_FORM: FormState = { title: "", description: "", patient_id: "none" };

function Tarefas() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("position");
      if (error) throw error;
      return data as TaskRow[];
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

  const moveMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa removida");
    },
  });

  const upsertMut = useMutation({
    mutationFn: async ({ id, form }: { id: string | null; form: FormState }) => {
      if (!user) throw new Error("Sem sessão");
      const patient_id = form.patient_id === "none" ? null : form.patient_id;
      if (id) {
        const { error } = await supabase.from("tasks").update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          patient_id,
        }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          owner_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          patient_id,
          status: "a_fazer",
          position: tasks.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const toggle = (t: TaskRow) =>
    moveMut.mutate({ id: t.id, status: t.status === "concluido" ? "a_fazer" : "concluido" });

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (t: TaskRow) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description ?? "", patient_id: t.patient_id ?? "none" });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    upsertMut.mutate({ id: editingId, form }, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const sortedList = useMemo(
    () => [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [tasks],
  );

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Tarefas"
          title="Sua rotina, sob controle."
          actions={
            <>
              <div className="flex bg-secondary rounded-full p-1">
                <button
                  onClick={() => setView("kanban")}
                  className={`p-2 rounded-full ${view === "kanban" ? "bg-card shadow" : "text-muted-foreground"}`}
                  aria-label="Kanban"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-full ${view === "list" ? "bg-card shadow" : "text-muted-foreground"}`}
                  aria-label="Lista"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={openNew} className="rounded-lg">
                <Plus className="h-4 w-4" /> Nova tarefa
              </Button>
            </>
          }
        />

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon={ListTodo}
              title="Sua lista está limpa"
              description="Crie tarefas para organizar follow-ups, estudos e pendências do dia a dia."
              action={
                <Button onClick={openNew} className="rounded-lg">
                  <Plus className="h-4 w-4" /> Criar primeira tarefa
                </Button>
              }
            />
          </div>
        ) : view === "kanban" ? (
          <div className="grid md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dragId && moveMut.mutate({ id: dragId, status: col.id })}
                  className="bg-secondary/40 rounded-2xl p-3 min-h-[400px]"
                >
                  <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <h3 className="font-display text-base">{col.title}</h3>
                    <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground/70 text-center py-6 italic">
                        Arraste uma tarefa para cá
                      </p>
                    ) : (
                      colTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          patients={patients}
                          onDragStart={() => setDragId(t.id)}
                          onEdit={() => openEdit(t)}
                          onDelete={() => removeMut.mutate(t.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {sortedList.map((t) => {
              const p = patients.find((x) => x.id === t.patient_id);
              const meta = STATUS_META[t.status];
              return (
                <div key={t.id} className="group flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={t.status === "concluido"}
                    onChange={() => toggle(t)}
                    className="h-4 w-4 mt-0.5 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${t.status === "concluido" ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      <span className={`text-[11px] rounded-full px-2 py-0.5 ${meta.className}`}>{meta.label}</span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                    {p && (
                      <Link
                        to="/pacientes/$id"
                        params={{ id: p.id }}
                        className="inline-block mt-2 text-[11px] bg-primary/10 text-primary rounded-full px-2 py-0.5"
                      >
                        {shortName(p.name)}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" aria-label="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeMut.mutate(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" aria-label="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {t.due_date && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Título *</Label>
              <Input id="task-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Descrição</Label>
              <Textarea id="task-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Paciente relacionado</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm((f) => ({ ...f, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-lg" disabled={upsertMut.isPending}>
                {editingId ? "Salvar" : "Criar tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function TaskCard({
  task, patients, onDragStart, onEdit, onDelete,
}: {
  task: TaskRow; patients: PatientRow[];
  onDragStart: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const p = patients.find((x) => x.id === task.patient_id);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group relative bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition"
    >
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={onEdit} className="p-1 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary" aria-label="Editar">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="p-1 rounded-md bg-card border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label="Excluir">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <p className="text-sm font-medium pr-14">{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-3">
        {p ? (
          <Link to="/pacientes/$id" params={{ id: p.id }} className="text-[11px] bg-primary/10 text-primary rounded-full px-2 py-0.5">
            {shortName(p.name)}
          </Link>
        ) : <span />}
        {task.due_date && (
          <span className="text-[11px] text-muted-foreground">
            {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}
