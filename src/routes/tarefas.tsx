import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { tasks as initial, patients } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { useState } from "react";
import { Plus, List, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/tarefas")({
  component: Tarefas,
});

const COLUMNS: { id: Task["status"]; title: string }[] = [
  { id: "a_fazer", title: "A fazer" },
  { id: "em_andamento", title: "Em andamento" },
  { id: "concluido", title: "Concluído" },
];

function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [dragId, setDragId] = useState<string | null>(null);

  const move = (id: string, status: Task["status"]) =>
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));

  const toggle = (id: string) =>
    setTasks((arr) =>
      arr.map((t) =>
        t.id === id ? { ...t, status: t.status === "concluido" ? "a_fazer" : "concluido" } : t
      )
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
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90">
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
                      <TaskCard key={t.id} task={t} onDragStart={() => setDragId(t.id)} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {tasks.map((t) => {
              const p = patients.find((x) => x.id === t.patient_id);
              return (
                <div key={t.id} className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={t.status === "concluido"}
                    onChange={() => toggle(t.id)}
                    className="h-4 w-4 mt-0.5 accent-primary"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${t.status === "concluido" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                    {p && (
                      <Link to="/pacientes/$id" params={{ id: p.id }} className="inline-block mt-2 text-[11px] bg-accent/20 text-accent-foreground rounded-full px-2 py-0.5">
                        {p.name}
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TaskCard({ task, onDragStart }: { task: Task; onDragStart: () => void }) {
  const p = patients.find((x) => x.id === task.patient_id);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition"
    >
      <p className="text-sm font-medium">{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-3">
        {p ? (
          <Link to="/pacientes/$id" params={{ id: p.id }} className="text-[11px] bg-accent/20 text-accent-foreground rounded-full px-2 py-0.5">
            {p.name.split(" ")[0]}
          </Link>
        ) : <span />}
        <span className="text-[11px] text-muted-foreground">
          {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
    </div>
  );
}
