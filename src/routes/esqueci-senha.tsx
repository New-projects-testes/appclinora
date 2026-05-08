import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/esqueci-senha")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground p-10">
        <Link to="/" className="font-display text-2xl">Clinora</Link>
        <p className="font-display leading-tight italic text-5xl">
          Recuperar acesso é simples.
        </p>
        <p className="text-xs opacity-70">© 2026 Clinora</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setLoading(false);
            if (error) {
              toast.error(error.message);
              return;
            }
            setSent(true);
            toast.success("E-mail enviado! Verifique sua caixa de entrada.");
          }}
          className="w-full max-w-sm space-y-6"
        >
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar para login
          </Link>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recuperação de senha</p>
            <h1 className="font-display text-3xl mt-2">Esqueceu sua senha?</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Informe seu e-mail e enviaremos um link para você criar uma nova senha.
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
              <p className="font-medium text-foreground">E-mail enviado para {email}</p>
              <p className="text-muted-foreground mt-1">
                Clique no link recebido para criar uma nova senha. Não esqueça de verificar a pasta de spam.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria.santos@exemplo.com"
                  className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-medium rounded-lg py-3 hover:bg-primary/90 transition disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar link de recuperação"}
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
