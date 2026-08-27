import type { ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { cn } from "../utils/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}

export default function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const Comp = as as "div";

  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Comp>
  );
}
