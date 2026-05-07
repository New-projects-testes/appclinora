import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { catalog } from "@/lib/mock-data";
import { CatalogHeader } from "@/components/CatalogHeader";
import { priceFor, formatFullDate, LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { BadgeCheck, Calendar, CheckCircle2, Video, Mail } from "lucide-react";

const searchSchema = z.object({
  date: fallback(z.string(), "").default(""),
  time: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/catalogo/$id/confirmacao")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const pro = catalog.find((p) => p.id === params.id && p.catalog_visible);
    if (!pro) throw notFound();
    return { pro };
  },
  component: Confirmacao,
});

function Confirmacao() {
  const { pro } = Route.useLoaderData();
  const { date, time } = Route.useSearch();
  const price = priceFor(pro.id);

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl">Consulta agendada!</h1>
          <p className="text-muted-foreground mt-2">
            Enviamos os detalhes da consulta para o seu e-mail.
          </p>

          <div className="mt-8 text-left bg-secondary/40 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <img src={pro.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
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
                <p>{formatFullDate(date)} · {time} (Brasília)</p>
              </div>
            )}

            <div className="border-t border-border pt-4 flex items-start gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>Teleconsulta · R$ {price}</p>
            </div>

            <div className="border-t border-border pt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mt-0.5" />
              <p>O especialista enviará instruções sobre como conectar antes da consulta.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/catalogo"
              className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Voltar ao catálogo
            </Link>
            <a
              href="#"
              className="border border-border rounded-lg px-6 py-3 text-sm font-medium hover:bg-secondary transition"
            >
              Adicionar ao Google Calendar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
