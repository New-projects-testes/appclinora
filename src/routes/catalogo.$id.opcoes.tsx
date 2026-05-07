import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { catalog } from "@/lib/mock-data";
import { CatalogHeader } from "@/components/CatalogHeader";
import { priceFor, formatFullDate, LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { ArrowLeft, BadgeCheck, Calendar, CreditCard, Check } from "lucide-react";
import { useState } from "react";

const searchSchema = z.object({
  date: fallback(z.string(), "").default(""),
  time: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/catalogo/$id/opcoes")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const pro = catalog.find((p) => p.id === params.id && p.catalog_visible);
    if (!pro) throw notFound();
    return { pro };
  },
  component: Opcoes,
});

function Opcoes() {
  const { pro } = Route.useLoaderData();
  const { date, time } = Route.useSearch();
  const navigate = useNavigate();
  const [firstTime, setFirstTime] = useState<"sim" | "nao">("sim");
  const price = priceFor(pro.id);

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/catalogo/$id" params={{ id: pro.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-card border border-border rounded-2xl p-7">
            <h1 className="font-display text-2xl">Selecione as opções da consulta</h1>

            <div className="mt-6">
              <label className="text-sm font-medium">Tipo de visita *</label>
              <div className="mt-2 border border-border rounded-xl p-4 flex items-start justify-between gap-4 bg-primary/5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary" /> Teleconsulta
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atendimento por vídeo. Você receberá o link por e-mail antes da sessão.
                  </p>
                </div>
                <span className="font-display text-lg whitespace-nowrap">R$ {price}</span>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-sm font-medium">É a sua primeira consulta com este especialista? *</label>
              <div className="mt-3 flex gap-6">
                {(["sim", "nao"] as const).map((v) => (
                  <label key={v} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={firstTime === v}
                      onChange={() => setFirstTime(v)}
                      className="accent-primary"
                    />
                    <span className="text-sm capitalize">{v === "sim" ? "Sim" : "Não"}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate({ to: "/catalogo/$id/reservar", params: { id: pro.id }, search: { date, time, firstTime } })}
              className="mt-10 w-full sm:w-auto bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Continuar
            </button>
          </div>

          <ResumoLateral pro={pro} date={date} time={time} />
        </div>
      </div>
    </div>
  );
}

function ResumoLateral({ pro, date, time }: { pro: typeof catalog[number]; date: string; time: string }) {
  return (
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
            <Link to="/catalogo/$id" params={{ id: pro.id }} className="text-xs text-primary hover:underline mt-1 inline-block">
              Mudar a data
            </Link>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4 flex items-start gap-2 text-sm text-emerald-700">
        <CreditCard className="h-4 w-4 mt-0.5" />
        <div>
          <p className="font-medium">Pagamento online</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cancele em até 24h antes da consulta e receba o reembolso.
          </p>
        </div>
      </div>
    </aside>
  );
}
