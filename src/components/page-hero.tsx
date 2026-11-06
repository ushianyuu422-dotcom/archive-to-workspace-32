import type { ReactNode } from "react";

/** Shared page banner used at the top of every content page. */
export function PageHero({
  kicker,
  title,
  body,
  imageSrc,
  children,
}: {
  kicker?: string;
  title: string;
  body?: string;
  imageSrc?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-forest-deep">
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-40"
        />
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {kicker && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{kicker}</p>
        )}
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
          {title}
        </h1>
        {body && <p className="mt-3 max-w-2xl text-base text-primary-foreground/85">{body}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
