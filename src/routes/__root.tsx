import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clinora — gestão clínica para profissionais" },
      { name: "description", content: "Agenda, prontuário, finanças e lembretes em um só lugar. Menos burocracia, mais cuidado." },
      { property: "og:title", content: "Clinora — gestão clínica para profissionais" },
      { property: "og:description", content: "Agenda, prontuário, finanças e lembretes em um só lugar. Menos burocracia, mais cuidado." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Clinora — gestão clínica para profissionais" },
      { name: "twitter:description", content: "Agenda, prontuário, finanças e lembretes em um só lugar. Menos burocracia, mais cuidado." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba79e63c-bfbb-4629-83b4-29a2bd268b23/id-preview-23c336d8--b89bf53b-9775-4f87-8337-1c689c31880c.lovable.app-1778111089703.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba79e63c-bfbb-4629-83b4-29a2bd268b23/id-preview-23c336d8--b89bf53b-9775-4f87-8337-1c689c31880c.lovable.app-1778111089703.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
