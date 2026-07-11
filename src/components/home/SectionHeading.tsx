import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

interface SectionHeadingProps {
  kicker: string;
  title: ReactNode;
  accent: ReactNode;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}

const SectionHeading = ({
  kicker,
  title,
  accent,
  description,
  align = "center",
  light = false,
}: SectionHeadingProps) => {
  const isCenter = align === "center";

  return (
    <Reveal
      className={`mb-10 sm:mb-12 ${isCenter ? "text-center mx-auto max-w-2xl" : "text-left"}`}
    >
      <div className={`flex items-center gap-3 mb-4 ${isCenter ? "justify-center" : "justify-start"}`}>
        <span className={`hidden sm:block h-px w-10 ${light ? "bg-white/50" : "bg-primary/60"}`} />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.3em] ${
            light ? "text-white/80" : "text-primary"
          }`}
        >
          {kicker}
        </span>
        <span className={`hidden sm:block h-px w-10 ${light ? "bg-white/50" : "bg-primary/60"}`} />
      </div>
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {title} <span className="italic text-gradient">{accent}</span>
      </h2>
      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? "text-white/85" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
};

export default SectionHeading;
