"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorialNav } from "@/components/editorial/EditorialNav";
import {
  Eyebrow,
  SerifHeadline,
  Lede,
  EditorialButton,
  Rule,
  MetaLine,
  PaperFrame,
  SERIF,
  MONO,
} from "@/components/editorial/Editorial";
import {
  deleteEntry,
  loadJournal,
  seedDemoEntries,
  updateReflection,
  type JournalEntry,
} from "@/lib/journal";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showingDemos, setShowingDemos] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const loaded = loadJournal();
    if (loaded.length === 0) {
      setEntries(seedDemoEntries());
      setShowingDemos(true);
    } else {
      setEntries(loaded);
    }
  }, []);

  const stats = useMemo(() => {
    const calm = entries.filter((e) => e.routeKind === "calm").length;
    const totalKm = entries.reduce((s, e) => s + e.distanceMeters, 0) / 1000;
    const totalMin = Math.round(entries.reduce((s, e) => s + e.durationSec, 0) / 60);
    return { calm, totalKm, totalMin, count: entries.length };
  }, [entries]);

  const onSaveReflection = (id: string) => {
    if (showingDemos) {
      // demos aren't persisted; just update local state
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, reflection: draft } : e)));
    } else {
      updateReflection(id, draft);
      setEntries(loadJournal());
    }
    setEditing(null);
    setDraft("");
  };

  const onDelete = (id: string) => {
    if (showingDemos) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      deleteEntry(id);
      setEntries(loadJournal());
    }
  };

  return (
    <div style={{ background: "#fbfaf6", color: "#0f172a", minHeight: "100vh" }}>
      <EditorialNav />

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px clamp(24px, 4vw, 64px) 16px",
        }}
      >
        <MetaLine items={["Issue No. 01", "Field Notes", "Personal Journal", showingDemos ? "Demo entries" : `${stats.count} entries`]} />
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px clamp(24px, 4vw, 64px) 64px",
        }}
      >
        <Eyebrow>The journal</Eyebrow>
        <SerifHeadline size="xl" style={{ marginTop: 28, marginBottom: 36, maxWidth: "16ch" }}>
          A diary of the calm you found.
        </SerifHeadline>
        <Lede>
          Every completed journey is logged here, anonymously, on this device only.
          Add a reflection — what felt different, what worked, what to remember
          next time. Nobody else sees it.
        </Lede>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "clamp(16px, 3vw, 36px)",
            borderTop: "1px solid #cbd5e1",
            paddingTop: 32,
          }}
        >
          <Stat value={String(stats.count)} label="Trips logged" />
          <Stat value={String(stats.calm)} label="Calm routes taken" />
          <Stat value={`${stats.totalKm.toFixed(1)} km`} label="Distance walked" />
          <Stat value={`${stats.totalMin} min`} label="Time on foot" />
        </div>
      </section>

      {entries.length === 0 ? (
        <PaperFrame paddingY={120}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <SerifHeadline size="lg" italic style={{ color: "#475569", marginBottom: 32 }}>
              No journeys yet.
            </SerifHeadline>
            <Lede style={{ margin: "0 auto 36px" }}>
              Take a trip from the map, then come back. Each completed navigation
              becomes a field note here.
            </Lede>
            <EditorialButton href="/map">Open the map</EditorialButton>
          </div>
        </PaperFrame>
      ) : (
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 clamp(24px, 4vw, 64px)",
          }}
        >
          {entries.map((e) => (
            <Entry
              key={e.id}
              entry={e}
              onEdit={() => {
                setEditing(e.id);
                setDraft(e.reflection ?? "");
              }}
              isEditing={editing === e.id}
              draft={draft}
              setDraft={setDraft}
              onSave={() => onSaveReflection(e.id)}
              onCancel={() => {
                setEditing(null);
                setDraft("");
              }}
              onDelete={() => onDelete(e.id)}
            />
          ))}
        </section>
      )}

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "120px clamp(24px, 4vw, 64px)",
          textAlign: "center",
        }}
      >
        <Rule label="The map" />
        <SerifHeadline size="lg" italic style={{ marginBottom: 32 }}>
          Take another walk.
        </SerifHeadline>
        <EditorialButton href="/map">Open the live map</EditorialButton>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(36px, 5vw, 64px)",
          fontWeight: 400,
          lineHeight: 1,
          color: "#225f1c",
          letterSpacing: "-0.02em",
          display: "block",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#64748b",
          display: "block",
          marginTop: 6,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Entry({
  entry,
  onEdit,
  isEditing,
  draft,
  setDraft,
  onSave,
  onCancel,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  isEditing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const date = new Date(entry.endedAt);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const km = (entry.distanceMeters / 1000).toFixed(2);
  const min = Math.round(entry.durationSec / 60);
  const accent = entry.routeKind === "calm" ? "#225f1c" : "#aa371c";

  return (
    <article
      style={{
        padding: "48px 0",
        borderTop: "1px solid #cbd5e1",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 24,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#64748b",
              display: "block",
            }}
          >
            {dateStr} · {timeStr}
          </span>
          <h3
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(28px, 3.6vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              margin: "12px 0 0",
            }}
          >
            <span style={{ color: "#475569", fontStyle: "italic" }}>From</span>{" "}
            {entry.fromName}
            {" → "}
            <span style={{ color: "#475569", fontStyle: "italic" }}>to</span>{" "}
            {entry.toName}
          </h3>
        </div>

        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            background: accent,
            color: "#ffffff",
            padding: "6px 12px",
          }}
        >
          {entry.routeKind === "calm" ? "Calm route" : "Faster route"}
        </span>
      </header>

      <MetaLine
        items={[`${km} km`, `${min} min`, `${entry.encountered.length} sensory notes`]}
      />

      {entry.encountered.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {entry.encountered.map((tag, i) => (
            <li
              key={i}
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                color: "#1e293b",
                lineHeight: 1.5,
                paddingLeft: 16,
                borderLeft: `2px solid ${TAG_COLORS[tag.kind]}`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: TAG_COLORS[tag.kind],
                  marginRight: 8,
                }}
              >
                {tag.kind}
              </span>
              {tag.label}
            </li>
          ))}
        </ul>
      )}

      {isEditing ? (
        <div style={{ display: "grid", gap: 12 }}>
          <textarea
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            placeholder="What did this walk feel like? What worked? What didn&rsquo;t?"
            rows={4}
            style={{
              fontFamily: SERIF,
              fontSize: 17,
              lineHeight: 1.5,
              padding: 16,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              resize: "vertical",
              outline: "none",
              borderRadius: 0,
            }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <EditorialButton onClick={onSave}>Save reflection</EditorialButton>
            <EditorialButton variant="ghost" onClick={onCancel}>
              Cancel
            </EditorialButton>
          </div>
        </div>
      ) : entry.reflection ? (
        <blockquote
          style={{
            margin: 0,
            padding: "20px 24px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            fontFamily: SERIF,
            fontSize: 18,
            fontStyle: "italic",
            lineHeight: 1.55,
            color: "#1e293b",
          }}
        >
          &ldquo;{entry.reflection}&rdquo;
        </blockquote>
      ) : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#475569",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #cbd5e1",
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            {entry.reflection ? "Edit reflection" : "Add reflection"}
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#aa371c",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid transparent",
            padding: "4px 0",
            cursor: "pointer",
          }}
        >
          Forget this entry
        </button>
      </div>
    </article>
  );
}

const TAG_COLORS: Record<string, string> = {
  noise: "#fb923c",
  light: "#eab308",
  crowd: "#a855f7",
  smell: "#22c55e",
  alert: "#ef4444",
};
