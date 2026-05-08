import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  CheckSquare,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "./RequireAuth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Finanças", url: "/financas", icon: Wallet },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Catálogo", url: "/catalogo", icon: BookOpen },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShellInner>{children}</AppShellInner>
    </RequireAuth>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.name || user?.email?.split("@")[0] || "Profissional";
  const displaySpecialty = profile?.specialty || "—";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        <div className="px-6 py-7">
          <Link to="/dashboard" className="flex items-baseline">
            <span className="font-display text-2xl tracking-tight text-sidebar-foreground">
              Clinora
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </Link>
          <p className="text-xs text-sidebar-foreground/60 mt-1">gestão clínica</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {items.map((item) => {
            const active =
              path === item.url || (item.url !== "/dashboard" && path.startsWith(item.url));
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-full before:bg-accent"
                    : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-sidebar"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium ring-2 ring-sidebar">
                {avatarLetter}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{displaySpecialty}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground/60 hover:text-white"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

