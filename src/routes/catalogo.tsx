import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { catalog } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Search, MapPin, Globe2, Building2, BadgeCheck, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CatalogHeader } from "@/components/CatalogHeader";
import { priceFor, LINKEDIN_BLUE } from "@/lib/catalog-utils";

const PRICE_MIN = 150;
const PRICE_MAX = 350;

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo — encontre profissionais de saúde mental verificados" },
      { name: "description", content: "Conheça psicólogos, psiquiatras e terapeutas verificados. Marque sua consulta com poucos cliques." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState<string>("Todas");
  const [location, setLocation] = useState("");
  const [online, setOnline] = useState(false);
  const [presential, setPresential] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const specialties = ["Todas", ...Array.from(new Set(catalog.map((p) => p.specialty)))];

  const visible = useMemo(() => catalog.filter((p) => p.catalog_visible && p.verification_status), []);
  const filtered = useMemo(() => visible.filter((p) => {
    if (specialty !== "Todas" && p.specialty !== specialty) return false;
    if (online && !p.accepts_online) return false;
    if (presential && !p.accepts_presential) return false;
    const price = priceFor(p.id);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (location) {
      const l = location.toLowerCase();
      if (!p.city.toLowerCase().includes(l) && !p.state.toLowerCase().includes(l)) return false;
    }
    if (q) {
      const s = q.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.specialty.toLowerCase().includes(s) || p.city.toLowerCase().includes(s);
    }
    return true;
  }), [visible, specialty, online, presential, location, q, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader />

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catálogo público</p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 tracking-tight">
          Encontre o cuidado <span className="italic text-primary">certo</span> para você.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Profissionais verificados, com registro validado e link direto para agendamento.
        </p>

        <div className="mt-10 relative max-w-xl mx-auto">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="bg-card border border-border rounded-2xl p-5 h-fit lg:sticky lg:top-24 space-y-6">
          <h3 className="font-display text-lg">Filtros</h3>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Especialidade</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {specialties.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Endereço</label>
            <div className="relative mt-2">
              <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cidade ou estado"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Atende online</span>
              </div>
              <Switch checked={online} onCheckedChange={setOnline} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Atende presencial</span>
              </div>
              <Switch checked={presential} onCheckedChange={setPresential} />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Faixa de preço</label>
            <Slider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10}
              value={priceRange}
              onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
              className="mt-3"
            />
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">R$ {priceRange[0]}</span>
              <span className="text-muted-foreground">R$ {priceRange[1]}</span>
            </div>
          </div>
        </aside>

        <div>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} profissionais encontrados</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const price = priceFor(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => navigate({ to: "/catalogo/$id", params: { id: p.id } })}
                  className="text-left bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all"
                >
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5 mb-3">
                    <CreditCard className="h-3 w-3" /> Pagamento online
                  </span>
                  <div className="flex items-start gap-4">
                    <img src={p.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                        <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} aria-label="Profissional verificado" />
                      </div>
                      <p className="text-sm text-primary mt-0.5">{p.specialty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{p.bio}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-5 flex-wrap">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}, {p.state}</span>
                    {p.accepts_online && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />Online</span>}
                    {p.accepts_presential && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />Presencial</span>}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Teleconsulta a partir de</span>
                    <span className="font-display text-lg text-foreground">R$ {price}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum profissional encontrado para sua busca.
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Clinora · feito com cuidado
      </footer>
    </div>
  );
}
