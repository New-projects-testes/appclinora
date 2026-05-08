import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, BadgeCheck, Calendar as CalendarIcon, Check, CheckCircle2,
  Globe2, Building2, MapPin, Video, User, Users,
} from "lucide-react";
import { LINKEDIN_BLUE } from "@/lib/catalog-utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PatientAvatar } from "@/components/PatientAvatar";
import { toast } from "sonner";

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

export const Route = createFileRoute("/catalogo_/agendar/$proId")({
  head: () => ({
    meta: [
      { title: "Agendar consulta — Clinora" },
      { name: "description", content: "Agende sua consulta com profissionais verificados em poucos passos." },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, specialty, city, state, registration_type, registration_number, bio, avatar_url, accepts_online, accepts_presential, catalog_visible, verification_status, price_online, price_presential")
      .eq("id", params.proId)
      .eq("catalog_visible", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw notFound();
    return { pro: data as CatalogProfile };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => { router.invalidate(); reset(); }}>Tentar novamente</Button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="font-display text-2xl">Profissional não encontrado</h1>
        <Link to="/catalogo" className="text-primary hover:underline">Voltar ao catálogo</Link>
      </div>
    </div>
  ),
  component: AgendarPage,
});

type ConsultType = "online" | "presencial";
type ForWhom = "self" | "other";

const STEPS = [
  { id: 1, label: "Tipo de consulta" },
  { id: 2, label: "Data e horário" },
  { id: 3, label: "Seus dados" },
  { id: 4, label: "Confirmação" },
];

const personSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  emailConfirm: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  comments: z.string().max(500).optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "É necessário aceitar os termos" }) }),
}).refine((d) => d.email === d.emailConfirm, { message: "Os e-mails não coincidem", path: ["emailConfirm"] });

function priceFor(pro: CatalogProfile, type: ConsultType | null): number | null {
  if (type === "online") return pro.price_online ?? null;
  if (type === "presencial") return pro.price_presential ?? null;
  const a = pro.price_online, b = pro.price_presential;
  const arr = [a, b].filter((v): v is number => v !== null && v !== undefined);
  return arr.length ? Math.min(...arr) : null;
}

function AgendarPage() {
  const { pro } = Route.useLoaderData();

  const [step, setStep] = useState(1);
  const [consultType, setConsultType] = useState<ConsultType | null>(
    pro.accepts_online ? "online" : pro.accepts_presential ? "presencial" : null,
  );
  const [firstTime, setFirstTime] = useState<"sim" | "nao">("sim");

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);

  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [patientName, setPatientName] = useState("");
  const [patientBirth, setPatientBirth] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", emailConfirm: "", phone: "", comments: "",
    acceptTerms: false, marketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const price = priceFor(pro, consultType);

  // Fetch booked slots for the chosen date
  const dateKey = date ? date.toISOString().slice(0, 10) : null;
  const { data: bookedSlots = [] } = useQuery({
    queryKey: ["booked-slots", pro.id, dateKey],
    enabled: !!dateKey,
    queryFn: async () => {
      const start = new Date(date!); start.setHours(0, 0, 0, 0);
      const end = new Date(date!); end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from("bookings")
        .select("date_time")
        .eq("professional_id", pro.id)
        .gte("date_time", start.toISOString())
        .lte("date_time", end.toISOString())
        .neq("status", "cancelled");
      if (error) throw error;
      return (data ?? []).map((b) => {
        const d = new Date(b.date_time);
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      });
    },
  });

  const slots = useMemo(() => {
    if (!date) return [];
    const list: { time: string; available: boolean }[] = [];
    const isToday = date.toDateString() === new Date().toDateString();
    const now = new Date();
    for (let hour = 9; hour < 18; hour++) {
      for (const m of [0, 30]) {
        const t = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        let available = !bookedSlots.includes(t);
        if (isToday && (hour < now.getHours() || (hour === now.getHours() && m <= now.getMinutes()))) {
          available = false;
        }
        list.push({ time: t, available });
      }
    }
    return list;
  }, [date, bookedSlots]);

  useEffect(() => { setTime(null); }, [date]);

  function next() { setStep((s) => Math.min(4, s + 1)); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  async function handleSubmitDados() {
    const result = personSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path.join(".")] = i.message; });
      setErrors(fe);
      return;
    }
    if (forWhom === "other" && patientName.trim().length < 2) {
      setErrors({ patientName: "Informe o nome do paciente" });
      return;
    }
    setErrors({});

    if (!date || !time || !consultType) return;
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(h, m, 0, 0);

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      professional_id: pro.id,
      patient_name: forWhom === "other" ? patientName.trim() : form.fullName.trim(),
      patient_email: form.email.trim(),
      patient_phone: form.phone.trim(),
      date_time: dt.toISOString(),
      modality: consultType,
      is_first_consultation: firstTime === "sim",
      for_self: forWhom === "self",
      comment: form.comments?.trim() || null,
      price: price ?? null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível concluir o agendamento. Tente novamente.");
      return;
    }
    next();
  }

  const canAdvanceStep1 = !!consultType;
  const canAdvanceStep2 = !!date && !!time;

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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <Stepper current={step} />

        <div className="mt-8 grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="bg-card border border-border rounded-2xl p-8">
            {step === 1 && (
              <Step1
                pro={pro}
                consultType={consultType}
                setConsultType={setConsultType}
                firstTime={firstTime}
                setFirstTime={setFirstTime}
              />
            )}
            {step === 2 && (
              <Step2
                today={today}
                date={date}
                setDate={(d) => setDate(d)}
                time={time}
                setTime={setTime}
                slots={slots}
              />
            )}
            {step === 3 && (
              <Step3
                forWhom={forWhom}
                setForWhom={setForWhom}
                patientName={patientName}
                setPatientName={setPatientName}
                patientBirth={patientBirth}
                setPatientBirth={setPatientBirth}
                form={form}
                setForm={setForm}
                errors={errors}
              />
            )}
            {step === 4 && (
              <Step4
                pro={pro}
                date={date!}
                time={time!}
                consultType={consultType!}
                price={price}
                email={form.email}
              />
            )}

            {step < 4 && (
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <Button variant="ghost" onClick={prev} disabled={step === 1}>
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                {step === 1 && (
                  <Button onClick={next} disabled={!canAdvanceStep1}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 2 && (
                  <Button onClick={next} disabled={!canAdvanceStep2}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 3 && (
                  <Button onClick={handleSubmitDados} disabled={submitting}>
                    {submitting ? "Enviando..." : "Confirmar agendamento"} <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <Summary pro={pro} consultType={consultType} date={date} time={time} price={price} />
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Clinora · feito com cuidado
      </footer>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4 w-full">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <li key={s.id} className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full grid place-items-center text-sm font-medium border",
                  done && "bg-primary text-primary-foreground border-primary",
                  active && "border-primary text-primary bg-primary/8",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn("text-sm truncate hidden sm:inline", active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px", current > s.id ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Step1({
  pro, consultType, setConsultType, firstTime, setFirstTime,
}: {
  pro: CatalogProfile;
  consultType: ConsultType | null; setConsultType: (v: ConsultType) => void;
  firstTime: "sim" | "nao"; setFirstTime: (v: "sim" | "nao") => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Selecione o tipo de consulta</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha como você prefere ser atendido(a).</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {pro.accepts_online && (
          <ConsultOption
            selected={consultType === "online"}
            onClick={() => setConsultType("online")}
            icon={<Video className="h-5 w-5" />}
            title="Teleconsulta"
            subtitle="Atendimento por vídeo"
            price={pro.price_online}
          />
        )}
        {pro.accepts_presential && (
          <ConsultOption
            selected={consultType === "presencial"}
            onClick={() => setConsultType("presencial")}
            icon={<Building2 className="h-5 w-5" />}
            title="Presencial"
            subtitle={`${pro.city}, ${pro.state}`}
            price={pro.price_presential}
          />
        )}
      </div>

      <div>
        <Label className="text-sm font-medium">É a sua primeira consulta com este especialista?</Label>
        <RadioGroup value={firstTime} onValueChange={(v) => setFirstTime(v as "sim" | "nao")} className="flex gap-6 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="sim" /> <span className="text-sm">Sim</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="nao" /> <span className="text-sm">Não</span>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}

function ConsultOption({
  selected, onClick, icon, title, subtitle, price,
}: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string; price: number | null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-5 transition-all",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-lg grid place-items-center", selected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}>
            {icon}
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">a partir de</p>
          <p className="font-display text-lg">{price !== null ? `R$ ${price}` : "Sob consulta"}</p>
        </div>
      </div>
    </button>
  );
}

function Step2({
  today, date, setDate, time, setTime, slots,
}: {
  today: Date;
  date: Date | undefined; setDate: (d: Date | undefined) => void;
  time: string | null; setTime: (t: string) => void;
  slots: { time: string; available: boolean }[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Escolha a data e o horário</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione um dia disponível no calendário e depois um horário.</p>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        <div className="rounded-xl border border-border p-2 w-fit">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < today || d.getDay() === 0}
            initialFocus
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-3 inline-flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            {date ? date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) : "Selecione uma data"}
          </p>

          {!date && (
            <p className="text-sm text-muted-foreground">Os horários aparecerão aqui após escolher a data.</p>
          )}

          {date && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  className={cn(
                    "rounded-lg border py-2 text-sm transition-colors",
                    !s.available && "opacity-40 cursor-not-allowed line-through",
                    s.available && time === s.time && "bg-primary text-primary-foreground border-primary",
                    s.available && time !== s.time && "border-border hover:border-primary/40 hover:bg-secondary",
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3({
  forWhom, setForWhom, patientName, setPatientName, patientBirth, setPatientBirth,
  form, setForm, errors,
}: {
  forWhom: ForWhom; setForWhom: (v: ForWhom) => void;
  patientName: string; setPatientName: (v: string) => void;
  patientBirth: string; setPatientBirth: (v: string) => void;
  form: { fullName: string; email: string; emailConfirm: string; phone: string; comments: string; acceptTerms: boolean; marketing: boolean };
  setForm: React.Dispatch<React.SetStateAction<{ fullName: string; email: string; emailConfirm: string; phone: string; comments: string; acceptTerms: boolean; marketing: boolean }>>;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Verificar e reservar</h2>
        <p className="text-sm text-muted-foreground mt-1">Preencha seus dados de contato para concluir o agendamento.</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-medium">Para quem é a consulta?</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          <ForWhomCard selected={forWhom === "self"} onClick={() => setForWhom("self")} icon={<User className="h-4 w-4" />} label="Para mim" />
          <ForWhomCard selected={forWhom === "other"} onClick={() => setForWhom("other")} icon={<Users className="h-4 w-4" />} label="Para outra pessoa" />
        </div>

        {forWhom === "other" && (
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div>
              <Label htmlFor="pname">Nome do paciente *</Label>
              <Input id="pname" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="mt-1.5" />
              {errors.patientName && <p className="text-xs text-destructive mt-1">{errors.patientName}</p>}
            </div>
            <div>
              <Label htmlFor="pbirth">Data de nascimento</Label>
              <Input id="pbirth" type="date" value={patientBirth} onChange={(e) => setPatientBirth(e.target.value)} className="mt-1.5" />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Dados de contato</h3>
        <div>
          <Label htmlFor="fullName">Nome completo *</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="mt-1.5" />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1.5" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="emailConfirm">Confirmar e-mail *</Label>
            <Input id="emailConfirm" type="email" value={form.emailConfirm} onChange={(e) => setForm((f) => ({ ...f, emailConfirm: e.target.value }))} className="mt-1.5" />
            {errors.emailConfirm && <p className="text-xs text-destructive mt-1">{errors.emailConfirm}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Celular *</Label>
          <Input id="phone" placeholder="(11) 98123-4567" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1.5" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="comments">Comentários para o especialista (opcional)</Label>
          <Textarea id="comments" value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} className="mt-1.5" rows={3} />
        </div>
      </section>

      <section className="space-y-3 pt-2 border-t border-border">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.acceptTerms} onCheckedChange={(c) => setForm((f) => ({ ...f, acceptTerms: c === true }))} className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            Autorizo a Clinora a processar meus dados com a finalidade de agendar esta consulta. *
          </span>
        </label>
        {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.marketing} onCheckedChange={(c) => setForm((f) => ({ ...f, marketing: c === true }))} className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            Gostaria de receber comunicações da Clinora (opcional).
          </span>
        </label>
      </section>
    </div>
  );
}

function ForWhomCard({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40",
      )}
    >
      <div className={cn("h-9 w-9 rounded-lg grid place-items-center", selected ? "bg-primary text-primary-foreground" : "bg-secondary")}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Step4({
  pro, date, time, consultType, price, email,
}: { pro: CatalogProfile; date: Date; time: string; consultType: ConsultType; price: number | null; email: string }) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h2 className="font-display text-2xl mt-5">Consulta solicitada com sucesso</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Enviamos os detalhes para <span className="font-medium text-foreground">{email}</span>. {pro.name.split(" ")[0]} confirmará seu agendamento em breve.
      </p>

      <div className="mt-8 mx-auto max-w-md text-left bg-secondary/40 rounded-xl p-5 space-y-2 text-sm">
        <Row label="Profissional" value={pro.name} />
        <Row label="Data" value={date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
        <Row label="Horário" value={time} />
        <Row label="Modalidade" value={consultType === "online" ? "Teleconsulta" : "Presencial"} />
        <Row label="Valor" value={price !== null ? `R$ ${price}` : "Sob consulta"} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/catalogo" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-primary/90">
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function Summary({
  pro, consultType, date, time, price,
}: { pro: CatalogProfile; consultType: ConsultType | null; date: Date | undefined; time: string | null; price: number | null }) {
  return (
    <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24 space-y-5">
      <div className="flex items-start gap-3">
        <PatientAvatar name={pro.name} src={pro.avatar_url ?? undefined} size={56} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-lg leading-tight truncate">{pro.name}</h3>
            {pro.verification_status && (
              <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "white", fill: LINKEDIN_BLUE }} />
            )}
          </div>
          <p className="text-sm text-primary">{pro.specialty}</p>
          {(pro.registration_type || pro.registration_number) && (
            <p className="text-xs text-muted-foreground mt-0.5">{pro.registration_type} {pro.registration_number}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2.5 text-sm">
        {date && time ? (
          <Row label="Data" value={`${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}, ${time}`} />
        ) : (
          <p className="text-muted-foreground text-sm">Selecione uma data e horário</p>
        )}
        {consultType && (
          <Row
            label="Modalidade"
            value={consultType === "online" ? "Teleconsulta" : `Presencial — ${pro.city}/${pro.state}`}
          />
        )}
        <Row label="Valor" value={price !== null ? `R$ ${price}` : "Sob consulta"} />
      </div>

      <div className="border-t border-border pt-4 text-xs text-muted-foreground flex gap-2">
        {consultType === "online" ? <Globe2 className="h-4 w-4 shrink-0 text-primary" /> : <MapPin className="h-4 w-4 shrink-0 text-primary" />}
        <span>Pagamento combinado diretamente com o profissional após a confirmação.</span>
      </div>
    </aside>
  );
}
