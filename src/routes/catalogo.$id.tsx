import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { catalog } from "@/lib/mock-data";
import { CatalogHeader } from "@/components/CatalogHeader";
import { priceFor, slotsForProfessional, formatDayLabel, dateForOffset, LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { ArrowLeft, BadgeCheck, MapPin, Globe2, Building2, CreditCard, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/catalogo/$id")({
  loader: ({ params }) => {
    const pro = catalog.find((p) => p.id === params.id && p.catalog_visible);
    if (!pro) throw notFound();
    return { pro };
  },
  component: PerfilPublico,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl">Profissional não encontrado</h1>
        <Link to="/catalogo" className="text-primary hover:underline mt-3 inline-block">Voltar ao catálogo</Link>
      </div>
    </div>
  ),
});

const DAYS_VISIBLE = 4;

function PerfilPublico() {
  const { pro } = Route.useLoaderData();
  const navigate = useNavigate();
  const [startDay, setStartDay] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const price = priceFor(pro.id);

  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => startDay + i);

  function pick(dayOffset: number, time: string) {
    const date = dateForOffset(dayOffset).toISOString();
    navigate({
      to: "/catalogo/$id/opcoes",
      params: { id: pro.id },
      search: { date, time },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Coluna esquerda — perfil */}
          <div className="bg-card border border-border rounded-2xl p-7">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5 mb-4">
              <CreditCard className="h-3 w-3" /> Pagamento online
            </span>
            <div className="flex items-start gap-4">
              <img src={pro.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-display text-2xl leading-tight">{pro.name}</h1>
                  <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} aria-label="Profissional verificado" />
                </div>
                <p className="text-sm text-primary mt-1">{pro.specialty}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="ml-1">5,0 · 124 opiniões</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-5">
              {pro.registration_type} {pro.registration_number}
            </p>

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{pro.bio}</p>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {pro.city}, {pro.state}
              </div>
              {pro.accepts_online && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe2 className="h-4 w-4" /> Atendimento online (Teleconsulta)
                </div>
              )}
              {pro.accepts_presential && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> Atendimento presencial
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-border flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Teleconsulta</span>
              <span className="font-display text-2xl">R$ {price}</span>
            </div>
          </div>

          {/* Coluna direita — horários */}
          <div className="bg-card border border-border rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg">Escolha um horário</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStartDay((s) => Math.max(0, s - DAYS_VISIBLE))}
                  disabled={startDay === 0}
                  className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setStartDay((s) => s + DAYS_VISIBLE)}
                  className="p-2 rounded-lg hover:bg-secondary"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {days.map((d) => {
                const { label, sub } = formatDayLabel(d);
                const slots = slotsForProfessional(pro.id, d);
                const visibleSlots = showAll ? slots : slots.slice(0, 5);
                return (
                  <div key={d}>
                    <div className="text-center mb-3">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                    <div className="space-y-2">
                      {visibleSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => pick(d, time)}
                          className="w-full bg-primary/8 text-primary text-sm font-medium rounded-lg py-2 hover:bg-primary/15 transition"
                        >
                          {time}
                        </button>
                      ))}
                      {visibleSlots.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground py-2">—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-6 w-full text-sm text-primary hover:underline"
              >
                Mostrar mais horários
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
