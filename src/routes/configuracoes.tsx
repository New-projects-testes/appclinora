import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  component: Configuracoes,
});

function Configuracoes() {
  const { profile, loading, refreshProfile, user } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", specialty: "", bio: "", city: "", state: "" });
  const [savedProfile, setSavedProfile] = useState(profileForm);
  const [profileDirty, setProfileDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [catalogVisible, setCatalogVisible] = useState(false);
  const [savedCatalog, setSavedCatalog] = useState(false);
  const [savingCatalog, setSavingCatalog] = useState(false);

  const [reminders, setReminders] = useState({ enabled: true, interval: 60 });
  const [savedReminders, setSavedReminders] = useState(reminders);
  const [savingReminders, setSavingReminders] = useState(false);

  // Sync from loaded profile
  useEffect(() => {
    if (!profile) return;
    const p = {
      name: profile.name ?? "",
      specialty: profile.specialty ?? "",
      bio: profile.bio ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
    };
    setProfileForm(p);
    setSavedProfile(p);
    setCatalogVisible(profile.catalog_visible);
    setSavedCatalog(profile.catalog_visible);
    setReminders({
      enabled: profile.reminder_enabled,
      interval: profile.reminder_interval_minutes,
    });
    setSavedReminders({
      enabled: profile.reminder_enabled,
      interval: profile.reminder_interval_minutes,
    });
  }, [profile]);

  const updProfile = (k: keyof typeof profileForm, v: string) => {
    setProfileForm((p) => ({ ...p, [k]: v }));
    setProfileDirty(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profileForm.name,
        specialty: profileForm.specialty,
        bio: profileForm.bio,
        city: profileForm.city,
        state: profileForm.state,
      })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    setSavedProfile(profileForm);
    setProfileDirty(false);
    await refreshProfile();
  };

  const saveCatalog = async () => {
    if (!user) return;
    setSavingCatalog(true);
    const { error } = await supabase
      .from("profiles")
      .update({ catalog_visible: catalogVisible })
      .eq("id", user.id);
    setSavingCatalog(false);
    if (error) return toast.error(error.message);
    toast.success("Visibilidade atualizada");
    setSavedCatalog(catalogVisible);
    await refreshProfile();
  };

  const saveReminders = async () => {
    if (!user) return;
    setSavingReminders(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        reminder_enabled: reminders.enabled,
        reminder_interval_minutes: reminders.interval,
      })
      .eq("id", user.id);
    setSavingReminders(false);
    if (error) return toast.error(error.message);
    toast.success("Lembretes atualizados");
    setSavedReminders(reminders);
    await refreshProfile();
  };

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-10 max-w-4xl flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações...
        </div>
      </AppShell>
    );
  }

  const status = profile.verification_status ? "verificado" : "pendente";
  const remindersDirty = reminders.enabled !== savedReminders.enabled || reminders.interval !== savedReminders.interval;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-4xl">
        <PageHeader eyebrow="Configurações" title="Seu perfil e preferências." />

        <div className="space-y-6">
          <Section title="Dados do perfil" description="Como você aparece na plataforma e no catálogo.">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome">
                <input value={profileForm.name} onChange={(e) => updProfile("name", e.target.value)} className={inp} />
              </Field>
              <Field label="Área de atuação">
                <input value={profileForm.specialty} onChange={(e) => updProfile("specialty", e.target.value)} className={inp} />
              </Field>
              <Field label="Cidade">
                <input value={profileForm.city} onChange={(e) => updProfile("city", e.target.value)} className={inp} />
              </Field>
              <Field label="Estado">
                <input value={profileForm.state} onChange={(e) => updProfile("state", e.target.value)} className={inp} />
              </Field>
            </div>
            <Field label="Biografia">
              <textarea rows={4} value={profileForm.bio} onChange={(e) => updProfile("bio", e.target.value)} className={`${inp} resize-none`} />
            </Field>
            {profileDirty && (
              <Actions
                disabled={savingProfile}
                onCancel={() => { setProfileForm(savedProfile); setProfileDirty(false); }}
                onSave={saveProfile}
              />
            )}
          </Section>

          <Section title="Registro profissional" description="Usado para verificação e selo de credenciamento.">
            <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl">
              <div>
                <p className="font-medium">{profile.registration_type} {profile.registration_number}</p>
                <p className="text-xs text-muted-foreground mt-1">Não pode ser alterado após verificação</p>
              </div>
              <StatusBadge status={status} />
            </div>
          </Section>

          <Section
            title="Aparecer no catálogo"
            description="Tenha mais visibilidade — apareça na vitrine pública."
            highlighted
            icon={<Sparkles className="h-5 w-5 text-accent" />}
          >
            {!profile.verification_status ? (
              <p className="text-sm text-muted-foreground p-4 bg-secondary/40 rounded-xl">
                Disponível apenas para profissionais verificados.
              </p>
            ) : (
              <>
                <button
                  onClick={() => setCatalogVisible(!catalogVisible)}
                  className="w-full flex items-center gap-4 p-4 bg-secondary/40 rounded-xl hover:bg-secondary/60 transition"
                >
                  <span className={`h-6 w-11 rounded-full p-0.5 transition ${catalogVisible ? "bg-primary" : "bg-muted-foreground/30"}`}>
                    <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${catalogVisible ? "translate-x-5" : ""}`} />
                  </span>
                  <span className="text-sm text-left flex-1">
                    {catalogVisible ? "Visível no catálogo público" : "Oculto do catálogo"}
                  </span>
                </button>
                {catalogVisible !== savedCatalog && (
                  <Actions
                    disabled={savingCatalog}
                    onCancel={() => setCatalogVisible(savedCatalog)}
                    onSave={saveCatalog}
                  />
                )}
              </>
            )}
          </Section>

          <Section title="Gerenciar lembretes" description="Reduza faltas com avisos automáticos para os pacientes.">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-secondary/40 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={(e) => setReminders({ ...reminders, enabled: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Enviar lembretes automáticos</span>
              </label>
              <Field label="Antecedência">
                <select
                  value={reminders.interval}
                  onChange={(e) => setReminders({ ...reminders, interval: +e.target.value })}
                  disabled={!reminders.enabled}
                  className={inp}
                >
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                  <option value={120}>2 horas antes</option>
                  <option value={1440}>1 dia antes</option>
                </select>
              </Field>
            </div>
            {remindersDirty && (
              <Actions
                disabled={savingReminders}
                onCancel={() => setReminders(savedReminders)}
                onSave={saveReminders}
              />
            )}
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

const inp = "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Section({ title, description, children, highlighted, icon }: { title: string; description?: string; children: React.ReactNode; highlighted?: boolean; icon?: React.ReactNode }) {
  return (
    <section
      className={`rounded-2xl p-6 ${
        highlighted
          ? "bg-gradient-to-br from-accent/10 to-card border-2 border-accent/30 shadow-lg shadow-accent/10"
          : "bg-card border border-border"
      }`}
    >
      <div className="flex items-start gap-3 mb-5">
        {icon}
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Actions({ onCancel, onSave, disabled }: { onCancel: () => void; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button onClick={onCancel} disabled={disabled} className="px-4 py-2 text-sm rounded-full border border-border hover:bg-secondary disabled:opacity-50">Cancelar</button>
      <button onClick={onSave} disabled={disabled} className="px-4 py-2 text-sm rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {disabled ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    verificado: { cls: "bg-success/15 text-success", icon: CheckCircle2, label: "Verificado" },
    pendente: { cls: "bg-warning/20 text-warning-foreground", icon: Clock, label: "Pendente" },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
      <Icon className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}
