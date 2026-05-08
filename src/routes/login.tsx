import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground p-10">
        <Link to="/" className="font-display text-2xl">Clinora</Link>
        <div>
          <p className="font-display leading-tight italic text-5xl">
            {"\n"}
          </p>
          <p className="mt-4 opacity-80 font-sans text-white text-5xl">Mais tempo para escutar.&nbsp;{"\n"}Menos tempo na planilha.</p>
        </div>
        <p className="text-xs opacity-70">© 2026 Clinora</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const { error } = await signIn(email, pw);
            setLoading(false);
            if (error) {
              const msg = error.message?.toLowerCase() ?? "";
              if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
                toast.error("Não encontramos uma conta com esses dados. Verifique seu e-mail e senha ou crie uma conta.");
              } else if (msg.includes("email not confirmed")) {
                toast.error("Confirme seu e-mail antes de entrar.");
              } else {
                toast.error(error.message);
              }
              return;
            }
            navigate({ to: "/dashboard" });
          }}
          className="w-full max-w-sm space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bem-vinda de volta</p>
            <h1 className="font-display text-3xl mt-2">Entre na sua conta</h1>
          </div>

          <div className="space-y-4">
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
            <div>
              <div className="flex justify-between">
                <label className="text-sm font-medium">Senha</label>
                <Link to="/esqueci-senha" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
              </div>
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium rounded-lg py-3 hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Seus dados são protegidos.
          </p>

          <p className="text-sm text-center text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
