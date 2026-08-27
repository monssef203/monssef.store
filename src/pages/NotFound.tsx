import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4">
      <EmptyState
        icon={Compass}
        title="404 — Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        action={
          <Link to="/" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-white">
            Retour à l'accueil
          </Link>
        }
      />
    </div>
  );
}
