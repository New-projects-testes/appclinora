import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, FileText, Wallet, Bell, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinora — gestão clínica para profissionais de saúde mental" },
      {
        name: "description",
        content:
          "Organize agenda, pacientes, prontuário e finanças em um só lugar. Feito para psicólogos, psiquiatras e terapeutas.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl tracking-tight">Clinora</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/catalogo"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Catálogo
          </Link>
          <Link
            to="/login"
            className="text-sm text-foreground hover:text-primary px-3 py-2"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition"
          >
            Começar
          </Link>
        </nav>
      </header>

      <section className="px-6 md:px-10 max-w-7xl mx-auto pt-12 md:pt-24 pb-16 md:pb-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5">
              Para profissionais de saúde mental
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight">
              Sua clínica,{" "}
              <span className="italic text-primary">organizada</span> com
              serenidade.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Agenda, prontuário digital, controle financeiro e lembretes
              automáticos — para você reduzir tarefas administrativas e focar
              no que importa: o cuidado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-full font-medium hover:bg-primary/90 transition shadow-sm"
              >
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 border border-border px-6 py-3.5 rounded-full font-medium hover:bg-secondary transition"
              >
                Ver demonstração
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" /> Seus dados são protegidos.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -inset-6 bg-accent/20 rounded-[3rem] blur-3xl" />
              <div className="relative rounded-3xl bg-card border border-border p-6 shadow-xl shadow-primary/5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Sua agenda — terça
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { h: "09:00", n: "Rafael Monteiro", t: "Ansiedade" },
                    { h: "11:00", n: "Helena Castro", t: "Depressão" },
                    { h: "14:30", n: "Beatriz Souza", t: "Ansiedade" },
                    { h: "16:00", n: "João Pedro Lima", t: "Burnout" },
                  ].map((s) => (
                    <div
                      key={s.h}
                      className="flex items-center gap-4 p-3 rounded-xl bg-secondary"
                    >
                      <div className="font-display text-xl tabular-nums">{s.h}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.n}</p>
                        <p className="text-xs text-muted-foreground">{s.t}</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-success" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 max-w-7xl mx-auto pb-24">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { i: Calendar, t: "Agenda inteligente", d: "Calendário, link público de agendamento e reagendamentos rápidos." },
            { i: FileText, t: "Prontuário digital", d: "Anotações por data, tags e templates por abordagem." },
            { i: Wallet, t: "Finanças claras", d: "Controle de pagos e pendentes — fechamento de mês em segundos." },
            { i: Bell, t: "Lembretes automáticos", d: "Reduza faltas com avisos enviados ao paciente." },
          ].map((f) => (
            <div key={f.t} className="p-6 rounded-2xl bg-card border border-border">
              <f.i className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-xl">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 md:px-10 py-8 max-w-7xl mx-auto flex justify-between text-sm text-muted-foreground">
        <span>© 2026 Clinora</span>
        <Link to="/catalogo" className="hover:text-foreground">Encontrar profissional</Link>
      </footer>
    </div>
  );
}
