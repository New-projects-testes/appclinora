import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase recovery link sets a session via the URL hash automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // If session already restored
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground p-10">
        <Link to="/" className="font-display text-2xl">Clinora</Link>
        <p className="font-display leading-tight italic text-5xl">
          Defina uma nova senha segura.
        </p>
        <p className="text-xs opacity-70">© 2026 Clinora</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (password !== confirm) {
              toast.error("As senhas não coincidem");
              return;
            }
            if (password.length < 6) {
              toast.error("A senha precisa ter no mínimo 6 caracteres");
              return;
            }
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            setLoading(false);
            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success("Senha atualizada com sucesso!");
            navigate({ to: "/dashboard" });
          }}
          className="w-full max-w-sm space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nova senha</p>
            <h1 className="font-display text-3xl mt-2">Crie sua nova senha</h1>
          </div>

          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Validando link de recuperação… Se você abriu esta página manualmente, solicite um novo link em{" "}
              <Link to="/esqueci-senha" className="text-primary hover:underline">Esqueci minha senha</Link>.
            </p>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nova senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirme a nova senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-medium rounded-lg py-3 hover:bg-primary/90 transition disabled:opacity-60"
              >
                {loading ? "Atualizando…" : "Atualizar senha"}
              </button>
            </>
          )}

          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Seus dados são protegidos.
          </p>
        </form>
      </div>
    </div>
  );
}
