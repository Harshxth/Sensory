import type { ReactNode, CSSProperties } from "react";

export const SERIF = '"Cormorant Garamond","Playfair Display",ui-serif,Georgia,serif';
export const MONO = '"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace';

/* ============================================================
 * Editorial — typography-first components for Sensory v2
 * Magazine / field-guide aesthetic: huge serif, generous space,
 * monospace metadata, slate ink on warm paper-white.
 * ============================================================ */

export function Eyebrow({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#475569",
        display: "block",
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}

type HeadingTag = "h1" | "h2" | "h3" | "h4";

export function SerifHeadline({
  children,
  size = "xl",
  italic = false,
  className,
  style,
  as = "h1",
}: {
  children: ReactNode;
  size?: "md" | "lg" | "xl" | "xxl";
  italic?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: HeadingTag;
}) {
  const sizes: Record<string, string> = {
    md: "clamp(28px, 4vw, 44px)",
    lg: "clamp(40px, 6vw, 72px)",
    xl: "clamp(56px, 9vw, 120px)",
    xxl: "clamp(72px, 13vw, 180px)",
  };
  const baseStyle: CSSProperties = {
    fontFamily: SERIF,
    fontSize: sizes[size],
    fontWeight: 400,
    fontStyle: italic ? "italic" : "normal",
    lineHeight: 0.96,
    letterSpacing: "-0.025em",
    color: "#0f172a",
    margin: 0,
    ...style,
  };
  if (as === "h2") return <h2 className={className} style={baseStyle}>{children}</h2>;
  if (as === "h3") return <h3 className={className} style={baseStyle}>{children}</h3>;
  if (as === "h4") return <h4 className={className} style={baseStyle}>{children}</h4>;
  return <h1 className={className} style={baseStyle}>{children}</h1>;
}

export function Lede({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      className={className}
      style={{
        fontFamily: SERIF,
        fontSize: "clamp(18px, 1.6vw, 24px)",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "-0.005em",
        color: "#334155",
        maxWidth: "60ch",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function PullQuote({
  children,
  attribution,
  className,
}: {
  children: ReactNode;
  attribution?: string;
  className?: string;
}) {
  return (
    <figure
      className={className}
      style={{
        margin: 0,
        padding: "32px 0",
        borderTop: "1px solid #cbd5e1",
        borderBottom: "1px solid #cbd5e1",
      }}
    >
      <blockquote
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: "clamp(28px, 3.4vw, 48px)",
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1.18,
          letterSpacing: "-0.015em",
          color: "#0f172a",
        }}
      >
        &ldquo;{children}&rdquo;
      </blockquote>
      {attribution && (
        <figcaption
          style={{
            marginTop: 16,
            fontFamily: MONO,
            fontSize: 12,
            color: "#64748b",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}

export function StatGrid({
  items,
  className,
}: {
  items: { value: string; label: string; sub?: string }[];
  className?: string;
}) {
  return (
    <dl
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        gap: "clamp(12px, 2vw, 36px)",
        margin: 0,
        borderTop: "1px solid #cbd5e1",
        paddingTop: 32,
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}
        >
          <dt
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            {it.label}
          </dt>
          <dd
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(40px, 6vw, 86px)",
              fontWeight: 400,
              lineHeight: 1,
              color: "#225f1c",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {it.value}
          </dd>
          {it.sub && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "#475569",
                marginTop: 2,
              }}
            >
              {it.sub}
            </span>
          )}
        </div>
      ))}
    </dl>
  );
}

export function StoryCard({
  chapter,
  title,
  body,
  cta,
  ornament,
}: {
  chapter: string;
  title: string;
  body: string;
  cta?: ReactNode;
  ornament?: ReactNode;
}) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 24,
        padding: "40px 0",
        borderTop: "1px solid #cbd5e1",
      }}
    >
      <Eyebrow>{chapter}</Eyebrow>
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(32px, 4.5vw, 64px)",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "#0f172a",
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 1.55,
          color: "#334155",
          maxWidth: "62ch",
          margin: 0,
        }}
      >
        {body}
      </p>
      {ornament && <div style={{ marginTop: 8 }}>{ornament}</div>}
      {cta && <div style={{ marginTop: 8 }}>{cta}</div>}
    </article>
  );
}

export function EditorialButton({
  children,
  href,
  variant = "primary",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    padding: "16px 28px",
    borderRadius: 0,
    textDecoration: "none",
    transition: "all 200ms ease",
    cursor: "pointer",
    border: "1px solid currentColor",
  };
  const styles: Record<string, CSSProperties> = {
    primary: {
      ...base,
      background: "#0f172a",
      color: "#ffffff",
      borderColor: "#0f172a",
    },
    ghost: {
      ...base,
      background: "transparent",
      color: "#0f172a",
      borderColor: "#0f172a",
    },
  };
  const Comp = href ? "a" : "button";
  return (
    <Comp href={href} onClick={onClick} style={styles[variant]} type={href ? undefined : "button"}>
      {children}
      <span aria-hidden style={{ fontSize: 14, transform: "translateY(-1px)" }}>
        →
      </span>
    </Comp>
  );
}

export function Rule({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "48px 0",
      }}
    >
      <span style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
      {label && (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          {label}
        </span>
      )}
      <span style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
    </div>
  );
}

export function MetaLine({ items }: { items: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#64748b",
      }}
    >
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
          {it}
          {i < items.length - 1 && (
            <span aria-hidden style={{ opacity: 0.5 }}>
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function PaperFrame({
  children,
  className,
  paddingY = 96,
}: {
  children: ReactNode;
  className?: string;
  paddingY?: number;
}) {
  return (
    <section
      className={className}
      style={{
        background: "#fbfaf6",
        padding: `${paddingY}px 0`,
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 clamp(24px, 4vw, 64px)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
