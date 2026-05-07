import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { catalog } from "@/lib/mock-data";
import { CatalogHeader } from "@/components/CatalogHeader";
import { priceFor, formatFullDate, LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { ArrowLeft, BadgeCheck, Calendar, CreditCard, Video } from "lucide-react";
import { useState } from "react";

type ReservarSearch = { date: string; time: string; firstTime: "sim" | "nao" };

export const Route = createFileRoute("/catalogo/$id/reservar")({
  validateSearch: (s: Record<string, unknown>): ReservarSearch => ({
    date: typeof s.date === "string" ? s.date : "",
    time: typeof s.time === "string" ? s.time : "",
    firstTime: s.firstTime === "nao" ? "nao" : "sim",
  }),
  loader: ({ params }) => {
    const pro = catalog.find((p) => p.id === params.id && p.catalog_visible);
    if (!pro) throw notFound();
    return { pro };
  },
  component: Reservar,
});

function Reservar() {
  const { pro } = Route.useLoaderData();
  const { date, time } = Route.useSearch();
  const navigate = useNavigate();
  const price = priceFor(pro.id);

  const [forWhom, setForWhom] = useState<"mim" | "outra">("mim");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [comments, setComments] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const canSubmit = forWhom && phone.length >= 8 && email && email === emailConfirm && authorized;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    navigate({ to: "/catalogo/$id/confirmacao", params: { id: pro.id }, search: { date, time } });
  }

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/catalogo/$id/opcoes" params={{ id: pro.id }} search={{ date, time }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
          <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-7 space-y-7">
            <h1 className="font-display text-2xl">Verificar e reservar</h1>

            <div>
              <label className="text-sm font-medium">Para quem é a consulta?</label>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {([
                  { v: "mim", label: "Para mim" },
                  { v: "outra", label: "Para outra pessoa" },
                ] as const).map((opt) => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setForWhom(opt.v)}
                    className={`text-left border rounded-xl px-4 py-3.5 text-sm transition ${
                      forWhom === opt.v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-3.5 w-3.5 rounded-full border ${forWhom === opt.v ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium">Dados de contato</h2>

              <div>
                <label className="text-xs text-muted-foreground">Seu número de celular *</label>
                <div className="mt-1.5 flex gap-2">
                  <span className="inline-flex items-center px-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">+55</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Enviaremos um código para confirmar a consulta</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Seu e-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Repetir o seu endereço de e-mail *</label>
                <input
                  type="email"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  placeholder="Verifique seu e-mail"
                  className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {emailConfirm && email !== emailConfirm && (
                  <p className="text-xs text-destructive mt-1">Os e-mails não coincidem.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium mb-3">Outras informações</h2>
              <button
                type="button"
                onClick={() => setShowComments((s) => !s)}
                className="w-full flex items-center justify-between border border-border rounded-lg px-4 py-3 text-sm hover:bg-secondary/50"
              >
                <span className="font-medium">Comentários para especialista <span className="text-muted-foreground italic font-normal">(opcional)</span></span>
                <span className="text-muted-foreground">{showComments ? "−" : "+"}</span>
              </button>
              {showComments && (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Deixe uma mensagem para o profissional..."
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-1 accent-primary" />
                <span>* Autorizo a Clinora a processar meus dados de saúde com a finalidade de usar seus serviços.</span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 accent-primary" />
                <span>Gostaria de receber comunicações comerciais da Clinora (opcional).</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Ao agendar, você concorda com os termos e condições de uso e a política de privacidade da Clinora.
            </p>
          </form>

          <aside className="bg-card border border-border rounded-2xl p-5 h-fit space-y-4">
            <div className="flex items-start gap-3">
              <img src={pro.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-sm">{pro.name}</p>
                  <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} />
                </div>
                <p className="text-xs text-muted-foreground">{pro.specialty}</p>
              </div>
            </div>
            {date && time && (
              <div className="border-t border-border pt-4 flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{formatFullDate(date)}, {time}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fuso horário: Brasília</p>
                </div>
              </div>
            )}
            <div className="border-t border-border pt-4 flex items-start gap-2 text-sm text-emerald-700">
              <CreditCard className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Pagamento online</p>
                <p className="text-xs text-muted-foreground mt-0.5">R$ {price} · cancelamento até 24h antes</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex items-start gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>Consulta online</p>
                <p className="text-xs text-muted-foreground mt-0.5">O especialista enviará instruções sobre como conectar</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
