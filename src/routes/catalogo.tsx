import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Globe2, Building2, X, Mail, Phone, BadgeCheck, ArrowRight, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { EmptyState } from "@/components/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PatientAvatar } from "@/components/PatientAvatar";

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

type CatalogProfile = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city: string;
  state: string;
  registration_type: string;
  registration_number: string;
  bio: string;
  avatar_url: string | null;
  accepts_online: boolean;
  accepts_presential: boolean;
  catalog_visible: boolean;
  verification_status: boolean;
  price_online: number | null;
  price_presential: number | null;
};

function lowestPrice(p: CatalogProfile): number | null {
  const prices = [p.price_online, p.price_presential].filter(
    (v): v is number => v !== null && v !== undefined,
  );
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

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
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState<string>("Todas");
  const [location, setLocation] = useState("");
  const [online, setOnline] = useState(false);
  const [presential, setPresential] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [open, setOpen] = useState<CatalogProfile | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["catalog-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, specialty, city, state, registration_type, registration_number, bio, avatar_url, accepts_online, accepts_presential, catalog_visible, verification_status, price_online, price_presential")
        .eq("catalog_visible", true);
      if (error) throw error;
      return (data ?? []) as CatalogProfile[];
    },
  });

  const specialties = useMemo(
    () => ["Todas", ...Array.from(new Set(profiles.map((p) => p.specialty).filter(Boolean)))],
    [profiles],
  );

  const filtered = useMemo(() => profiles.filter((p) => {
    if (specialty !== "Todas" && p.specialty !== specialty) return false;
    if (online && !p.accepts_online) return false;
    if (presential && !p.accepts_presential) return false;
    const price = lowestPrice(p);
    if (price !== null && (price < priceRange[0] || price > priceRange[1])) return false;
    if (location) {
      const l = location.toLowerCase();
      if (!p.city.toLowerCase().includes(l) && !p.state.toLowerCase().includes(l)) return false;
    }
    if (q) {
      const s = q.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.specialty.toLowerCase().includes(s) || p.city.toLowerCase().includes(s);
    }
    return true;
  }), [profiles, specialty, online, presential, location, q, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-baseline">
            <span className="font-display text-2xl">Clinora</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">Entrar</Link>
            <Link to="/cadastro" className="hidden sm:inline-flex items-center gap-2 bg-accent text-accent-foreground font-medium rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition">
              Quero ser encontrado(a) no catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catálogo público</p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 tracking-tight">
          Encontre o cuidado <span className="italic text-primary">certo</span> para você.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Profissionais com registro validado e link direto para agendamento.
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
          <div><h3 className="font-display text-lg mb-4">Filtros</h3></div>

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
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Faixa de preço</label>
            </div>
            <Slider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10}
              value={priceRange}
              onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
              className="mt-2"
            />
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">R$ {priceRange[0]}</span>
              <span className="text-muted-foreground">R$ {priceRange[1]}</span>
            </div>
          </div>
        </aside>

        <div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando profissionais...</p>
          ) : profiles.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl">
              <EmptyState
                icon={Users}
                title="Em breve, profissionais por aqui"
                description="Estamos preparando o catálogo. Se você é profissional, cadastre-se e ative a visibilidade no catálogo nas configurações."
                action={
                  <Link to="/cadastro" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
                    Cadastrar como profissional
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} profissionais encontrados</p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => {
                  const price = lowestPrice(p);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setOpen(p)}
                      className="text-left bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <PatientAvatar name={p.name} src={p.avatar_url ?? undefined} size={64} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                            {p.verification_status && (
                              <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} aria-label="Profissional verificado" />
                            )}
                          </div>
                          <p className="text-sm text-primary mt-0.5">{p.specialty}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{p.bio || "—"}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-5 flex-wrap">
                        {(p.city || p.state) && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}{p.city && p.state ? ", " : ""}{p.state}</span>
                        )}
                        {p.accepts_online && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />Online</span>}
                        {p.accepts_presential && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />Presencial</span>}
                      </div>
                      <div className="mt-5 pt-4 border-t border-border flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">Consulta a partir de</span>
                        <span className="font-display text-lg text-foreground">{price !== null ? `R$ ${price}` : "Sob consulta"}</span>
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
            </>
          )}
        </div>
      </section>

      {open && <ProfileModal pro={open} onClose={() => setOpen(null)} />}

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Clinora · feito com cuidado
      </footer>
    </div>
  );
}

function ProfileModal({ pro, onClose }: { pro: CatalogProfile; onClose: () => void }) {
  const [contact, setContact] = useState(false);
  const price = lowestPrice(pro);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl max-w-lg w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <PatientAvatar name={pro.name} src={pro.avatar_url ?? undefined} size={80} />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-2xl">{pro.name}</h2>
              {pro.verification_status && (
                <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} aria-label="Profissional verificado" />
              )}
            </div>
            <p className="text-primary">{pro.specialty}</p>
            {(pro.registration_type || pro.registration_number) && (
              <p className="text-xs text-muted-foreground mt-1">{pro.registration_type} {pro.registration_number}</p>
            )}
          </div>
        </div>
        {pro.bio && <p className="text-sm text-muted-foreground mt-5">{pro.bio}</p>}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 flex-wrap">
          {(pro.city || pro.state) && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{pro.city}{pro.city && pro.state ? ", " : ""}{pro.state}</span>
          )}
          {pro.accepts_online && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />Online</span>}
          {pro.accepts_presential && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />Presencial</span>}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Consulta a partir de</span>
          <span className="font-display text-xl">{price !== null ? `R$ ${price}` : "Sob consulta"}</span>
        </div>

        {contact ? (
          <div className="mt-6 p-4 bg-secondary/50 rounded-xl space-y-2 text-sm">
            <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {pro.email}</p>
            <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Solicite via e-mail</p>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <button onClick={() => setContact(true)} className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:bg-primary/90">
              Entrar em contato
            </button>
            <Link to="/catalogo/agendar/$proId" params={{ proId: pro.id }} className="flex-1 border border-border rounded-lg py-3 text-sm font-medium text-center hover:bg-secondary">
              Marcar consulta
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
