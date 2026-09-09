/**
 * MONSTORE — Admin 404 (any unknown /admin/* route).
 */

import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../ui";

export default function AdminNotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center">
      <div className="w-full">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The admin page you are looking for doesn't exist."
          action={
            <Link
              to="/admin"
              className="tap-scale inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/85"
            >
              Back to dashboard
            </Link>
          }
        />
      </div>
    </div>
  );
}
