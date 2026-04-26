import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SensoryGlyph } from "@/components/brand/SensoryMark";

export type AppBarAction = {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
};

export function TopAppBar({
  title = "Sensory",
  leading,
  trailing,
}: {
  title?: string;
  leading?: AppBarAction;
  trailing?: AppBarAction | React.ReactNode;
}) {
  const isAppBarAction = (v: unknown): v is AppBarAction =>
    typeof v === "object" && v !== null && "icon" in v && "label" in v;

  let trailingNode: React.ReactNode = null;
  if (isAppBarAction(trailing)) {
    trailingNode = <ActionButton {...trailing} />;
  } else if (trailing !== undefined) {
    trailingNode = trailing as React.ReactNode;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md text-primary font-bold border-b border-outline/20 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-3">
          {leading ? (
            <ActionButton {...leading} />
          ) : (
            <Link href="/" className="flex items-center gap-2 text-primary" aria-label="Sensory home">
              <SensoryGlyph size={28} />
            </Link>
          )}
          <h1
            className="text-on-surface"
            style={{
              fontFamily: '"Cormorant Garamond","Playfair Display",ui-serif,Georgia,serif',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {title}
          </h1>
          <span
            className="hidden md:inline"
            style={{
              fontFamily: '"IBM Plex Mono",ui-monospace,monospace',
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#64748b",
              borderLeft: "1px solid #cbd5e1",
              paddingLeft: 12,
              marginLeft: 4,
              fontWeight: 500,
            }}
          >
            Live Field Map
          </span>
        </div>
        {trailingNode}
      </div>
    </header>
  );
}

export function ActionButton({ icon, label, onClick, href }: AppBarAction) {
  const cn =
    "p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 text-primary flex items-center justify-center";
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cn}>
        <Icon name={icon} size={24} />
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn}>
      <Icon name={icon} size={24} />
    </button>
  );
}
