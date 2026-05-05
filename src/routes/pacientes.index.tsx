import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { patients, tags } from "@/lib/mock-data";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/pacientes/")({
  component: Pacientes,
});

function Pacientes() {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = patients.filter((p) => {
    if (activeTag && !p.tags.includes(activeTag)) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-7xl">
        <PageHeader
          eyebrow="Pacientes"
          title="Quem está sob seus cuidados."
          actions={
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Novo paciente
            </button>
          }
        />

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full bg-card border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs ${!activeTag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              Todas
            </button>
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTag(t.id === activeTag ? null : t.id)}
                className={`px-3 py-1.5 rounded-full text-xs ${activeTag === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left p-4 font-medium">Paciente</th>
                <th className="text-left p-4 font-medium">Telefone</th>
                <th className="text-left p-4 font-medium">Tags</th>
                <th className="text-left p-4 font-medium">Última sessão</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
                  <td className="p-4">
                    <Link to="/pacientes/$id" params={{ id: p.id }} className="flex items-center gap-3">
                      <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{p.phone}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.tags.map((id) => {
                        const tag = tags.find((t) => t.id === id);
                        return tag ? (
                          <span key={id} className="text-[11px] bg-accent/20 text-accent-foreground rounded-full px-2 py-0.5">
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {p.lastSession ? new Date(p.lastSession).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Nenhum paciente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
