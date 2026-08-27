import { useRef, useState } from "react";
import { cn } from "../utils/cn";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const unique = Array.from(new Set(images));
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    setActive(index);
    const node = scrollerRef.current;
    if (node) {
      node.scrollTo({ left: index * node.clientWidth, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    const node = scrollerRef.current;
    if (!node) return;
    const index = Math.round(node.scrollLeft / node.clientWidth);
    setActive(index);
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="no-scrollbar flex aspect-[4/5] w-full snap-x snap-mandatory overflow-x-auto rounded-2xl bg-[var(--color-sand)] sm:aspect-square"
      >
        {unique.map((src, i) => (
          <div key={i} className="h-full w-full flex-shrink-0 snap-center">
            <img
              src={src}
              alt={`${name} - vue ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {unique.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {unique.map((_, i) => (
              <button
                key={i}
                aria-label={`Voir image ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn("h-1.5 rounded-full transition-all", active === i ? "w-6 bg-[var(--color-ink)]" : "w-1.5 bg-neutral-300")}
              />
            ))}
          </div>

          <div className="mt-4 hidden gap-3 sm:flex">
            {unique.map((src, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Voir image ${i + 1}`}
                className={cn(
                  "h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                  active === i ? "border-[var(--color-gold)]" : "border-transparent"
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
