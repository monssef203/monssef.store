import { Star } from "lucide-react";
import { cn } from "../utils/cn";

export default function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.round(rating);
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(dim, i < full ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "fill-neutral-200 text-neutral-200")}
        />
      ))}
    </div>
  );
}
