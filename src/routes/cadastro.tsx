import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    specialty: "",
    location: "",
    online: true,
    presential: false,
    regType: "",
    regNumber: "",
  });

  const upd = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 md:px-10 py-6 max-w-5xl w-full mx-auto">
        <Link to="/" className="font-display text-2xl">Clinora</Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cadastro profissional</p>
          <h1 className="font-display text-4xl mt-2">Comece a organizar seus atendimentos hoje.</h1>

          <div className="flex items-center gap-3 mt-8 mb-10">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-3 flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {n}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step >= n ? "text-foreground" : "text-muted-foreground"}`}>
                    {n === 1 ? "Dados da conta" : "Registro profissional"}
                  </p>
                </div>
                {n === 1 && <div className={`h-px flex-1 ${step >= 2 ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 1) setStep(2);
              else navigate({ to: "/dashboard" });
            }}
            className="space-y-5"
          >
            {step === 1 && (
              <>
                <Field label="E-mail">
                  <input type="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} placeholder="maria.santos@exemplo.com" className={inputCls} />
                </Field>
                <Field label="Senha">
                  <input type="password" required minLength={6} value={form.password} onChange={(e) => upd("password", e.target.value)} placeholder="Mínimo 6 caracteres" className={inputCls} />
                </Field>
                <Field label="Nome completo">
                  <input type="text" required value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="Maria Santos" className={inputCls} />
                </Field>
                <Field label="Área de atuação">
                  <select required value={form.specialty} onChange={(e) => upd("specialty", e.target.value)} className={inputCls}>
                    <option value="">Selecione sua especialidade principal</option>
                    <option>Psicólogo(a)</option>
                    <option>Psiquiatra</option>
                    <option>Terapeuta</option>
                    <option>Psicanalista</option>
                    <option>Neuropsicólogo(a)</option>
                  </select>
                </Field>
                <Field label="Cidade / Estado">
                  <input type="text" required value={form.location} onChange={(e) => upd("location", e.target.value)} placeholder="São Paulo, SP" className={inputCls} />
                </Field>

                <Field label="Tipo de atendimento">
                  <div className="space-y-2 mt-1">
                    <Check label="Atendo online" checked={form.online} onChange={(v) => upd("online", v)} />
                    <Check label="Atendo presencial" checked={form.presential} onChange={(v) => upd("presential", v)} />
                  </div>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <div className="rounded-xl bg-secondary/50 p-5 border border-border">
                  <p className="font-medium">Registro profissional</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usado para verificação e selo de profissional credenciado.
                  </p>
                </div>
                <Field label="Tipo de registro">
                  <select required value={form.regType} onChange={(e) => upd("regType", e.target.value)} className={inputCls}>
                    <option value="">Selecione</option>
                    <option>CRP — Conselho Regional de Psicologia</option>
                    <option>CRM — Conselho Regional de Medicina</option>
                    <option>Outro</option>
                  </select>
                </Field>
                <Field label="Número do registro">
                  <input required value={form.regNumber} onChange={(e) => upd("regNumber", e.target.value)} placeholder="CRP 06/123456" className={inputCls} />
                </Field>
              </>
            )}

            <div className="flex items-center gap-3 pt-3">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm px-5 py-3 rounded-full border border-border hover:bg-secondary">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              )}
              <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium rounded-full py-3 hover:bg-primary/90 transition">
                {step === 1 ? "Continuar" : "Começar agora"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Seus dados são protegidos.
            </p>

            <p className="text-sm text-center text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-primary" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
