import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { tasks as initial, patients } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { useMemo, useState } from "react";
import { Plus, List, LayoutGrid, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/tarefas")({
  component: Tarefas,
});

const COLUMNS: { id: Task["status"]; title: string }[] = [
  { id: "a_fazer", title: "A fazer" },
  { id: "em_andamento", title: "Em andamento" },
  { id: "concluido", title: "Concluído" },
];

const STATUS_META: Record<Task["status"], { label: string; className: string }> = {
  a_fazer: { label: "A fazer", className: "bg-muted text-foreground/70" },
  em_andamento: { label: "Em andamento", className: "bg-warning/15 text-warning-foreground" },
  concluido: { label: "Concluído", className: "bg-success/15 text-success" },
};

const STATUS_ORDER: Record<Task["status"], number> = {
  a_fazer: 0,
  em_andamento: 1,
  concluido: 2,
};

function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

type TaskFormState = {
  title: string;
  description: string;
  patient_id: string;
};

const EMPTY_FORM: TaskFormState = { title: "", description: "", patient_id: "none" };

function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);

  const move = (id: string, status: Task["status"]) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));

  const toggle = (id: string) =>
    setTasks((arr) =>
      arr.map((t) =>
        t.id === id ? { ...t, status: t.status === "concluido" ? "a_fazer" : "concluido" } : t,
      ),
    );

  const remove = (id: string) => setTasks((arr) => arr.filter((t) => t.id !== id));

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description ?? "",
      patient_id: t.patient_id ?? "none",
    });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const patient_id = form.patient_id === "none" ? undefined : form.patient_id;
    if (editingId) {
      setTasks((arr) =>
        arr.map((t) =>
          t.id === editingId
            ? { ...t, title: form.title.trim(), description: form.description.trim() || undefined, patient_id }
            : t,
        ),
      );
    } else {
      const id = `t${Date.now()}`;
      setTasks((arr) => [
        ...arr,
        {
          id,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          patient_id,
          due_date: new Date().toISOString(),
          status: "a_fazer",
          position: arr.length,
        },
      ]);
    }
    setDialogOpen(false);
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
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Nova tarefa
              </button>
            </>
          }
        />

        {view === "kanban" ? (
          <div className="grid md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragId && move(dragId, col.id)}
                className="bg-secondary/40 rounded-2xl p-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <h3 className="font-display text-base">{col.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {tasks.filter((t) => t.status === col.id).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onDragStart={() => setDragId(t.id)}
                        onEdit={() => openEdit(t)}
                        onDelete={() => remove(t.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
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
                    onChange={() => toggle(t.id)}
                    className="h-4 w-4 mt-0.5 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${t.status === "concluido" ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      <span className={`text-[11px] rounded-full px-2 py-0.5 ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    )}
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
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
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
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Descrição</Label>
              <Textarea
                id="task-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Paciente relacionado</Label>
              <Select
                value={form.patient_id}
                onValueChange={(v) => setForm((f) => ({ ...f, patient_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editingId ? "Salvar" : "Criar tarefa"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function TaskCard({
  task,
  onDragStart,
  onEdit,
  onDelete,
}: {
  task: Task;
  onDragStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const p = patients.find((x) => x.id === task.patient_id);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group relative bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition"
    >
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onEdit}
          className="p-1 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="Editar"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-md bg-card border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Excluir"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <p className="text-sm font-medium pr-14">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        {p ? (
          <Link
            to="/pacientes/$id"
            params={{ id: p.id }}
            className="text-[11px] bg-primary/10 text-primary rounded-full px-2 py-0.5"
          >
            {shortName(p.name)}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-[11px] text-muted-foreground">
          {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
    </div>
  );
}
