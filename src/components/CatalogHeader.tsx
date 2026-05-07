import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CatalogHeader() {
  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/catalogo" className="flex items-baseline">
          <span className="font-display text-2xl">Clinora</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="hidden sm:inline-flex items-center gap-2 bg-accent text-accent-foreground font-medium rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition"
          >
            Quero ser encontrado(a) no catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
