import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import rawEvents from "@site/static/data/events.json";
import charactersJson from "@site/src/data/characters.json";
import useBaseUrl from "@docusaurus/useBaseUrl";

type EventType =
  | "birthday"
  | "session"
  | "world"
  | "faction"
  | "holiday"
  | "deadline"
  | "other";

type Ref = { label: string; doc?: string };

type CalendarEvent = {
  id: string;
  type: EventType;
  title: string;
  month: number;
  day: number;
  year?: number;
  recurring?: boolean;
  description?: string;
  doc?: string;
  imageSrc?: string;

  // puedes dejar realm como string si solo lo muestras
  realm?: string;

  faction?: { label: string; doc?: string };
  character?: { id: string; name: string; role?: string };
  tags?: string[];

  turningAge?: number;
};

type Character = {
  id?: string;
  title: string;
  imageSrc?: string;
  faction?: Ref;
  realm?: Ref;
  dateOfBirth?: string; // "YYYY-MM-DD"
  group?: string;
  doc?: string;
};

type CharactersMap = Record<string, Character>;

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
] as const;

const TYPE_LABEL: Record<EventType, string> = {
  birthday: "🎂 Cumpleaños",
  session: "🎲 Sesión",
  world: "🌍 Evento de mundo",
  faction: "🏳️‍🌈 Evento de facción",
  holiday: "✨ Celebración",
  deadline: "⏳ Deadline",
  other: "📌 Otro",
};

function normalize(e: CalendarEvent) {
  const monthName = MONTHS[e.month - 1] ?? "—";
  const dateLabel = `${e.day} de ${monthName}`;
  const sortKey = `${String(e.month).padStart(2, "0")}-${String(e.day).padStart(2, "0")}`;
  return { ...e, monthName, dateLabel, sortKey };
}

function bySortKey(a: any, b: any) {
  const ay = a.year ?? 9999;
  const by = b.year ?? 9999;
  if (ay !== by) return ay - by;
  return a.sortKey.localeCompare(b.sortKey);
}

function buildBirthdayEvents(characters: CharactersMap, year: number): CalendarEvent[] {
  const out: CalendarEvent[] = [];

  for (const [id, c] of Object.entries(characters)) {
    if (!c?.dateOfBirth) continue;

    const [yy, mm, dd] = c.dateOfBirth.split("-").map((x) => parseInt(x, 10));
    if (!yy || !mm || !dd) continue;

    const turningAge = year - yy;

    // ruta doc: si ya lo tienes en c.doc, úsalo; si no, usa group/id
    const doc = c.doc ?? `characters/${c.group ?? "misc"}/${id}`;

    out.push({
      id: `bday-${id}-${year}`,
      type: "birthday",
      title: `Cumple: ${c.title}`,
      month: mm,
      day: dd,
      year,
      recurring: true,
      turningAge,
      imageSrc: c.imageSrc,
      faction: c.faction,
      realm: c.realm?.label,
      character: { id, name: c.title },
      doc,
      tags: ["Cumpleaños"],
    });
  }

  return out;
}

function EventCard({ e }: { e: any }) {
  const imgUrl = e.imageSrc ? useBaseUrl(e.imageSrc) : null;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        border: "1px solid var(--ifm-color-emphasis-200)",
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={e.title}
          width={48}
          height={48}
          style={{ borderRadius: 10, objectFit: "cover" }}
        />
      ) : (
        <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--ifm-color-emphasis-200)" }} />
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800 }}>
          {e.doc ? <Link to={`/${e.doc}`}>{e.title}</Link> : e.title}
        </div>

        <div style={{ opacity: 0.85, fontSize: 14 }}>
          <span style={{ fontWeight: 700 }}>{e.dateLabel}</span>
          {e.year ? <> · {e.year}</> : null}
          <> · {TYPE_LABEL[e.type as EventType] ?? e.type}</>

          {e.type === "birthday" && typeof e.turningAge === "number" ? (
            <> · Cumple {e.turningAge}</>
          ) : null}

          {e.faction?.label ? (
            <>
              {" "}
              ·{" "}
              {e.faction.doc ? <Link to={`/${e.faction.doc}`}>{e.faction.label}</Link> : e.faction.label}
            </>
          ) : null}

        </div>

        {e.description ? (
          <div style={{ marginTop: 6, opacity: 0.9, fontSize: 14 }}>{e.description}</div>
        ) : null}
      </div>

      <div style={{ fontWeight: 800, fontSize: 14, opacity: 0.9 }}>{e.sortKey}</div>
    </div>
  );
}

export default function CalendarPage() {
  const [type, setType] = useState<"all" | EventType>("all");
  const [month, setMonth] = useState<"all" | string>("all");

  // ✅ manualEvents y defaultYear deben estar dentro del componente (hooks!)
  const manualEvents = useMemo(() => (rawEvents as CalendarEvent[]).map(normalize), []);

  const defaultYear = useMemo(() => {
    const ys = manualEvents.map((e) => e.year).filter(Boolean) as number[];
    return ys.length ? Math.max(...ys) : new Date().getFullYear();
  }, [manualEvents]);

  const [viewYear, setViewYear] = useState<number>(defaultYear);

  const events = useMemo(() => {
    const characters = charactersJson as CharactersMap;
    const bdays = buildBirthdayEvents(characters, viewYear).map(normalize);
    return [...manualEvents, ...bdays];
  }, [manualEvents, viewYear]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => (type === "all" ? true : e.type === type))
      .filter((e) => (month === "all" ? true : String(e.month) === month))
      .slice()
      .sort(bySortKey);
  }, [events, type, month]);

  const grouped = useMemo(() => {
    const acc: Record<string, any[]> = {};
    for (const e of filtered) {
      acc[e.monthName] = acc[e.monthName] || [];
      acc[e.monthName].push(e);
    }
    return acc;
  }, [filtered]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <label>
          <span style={{ fontWeight: 700, marginRight: 8 }}>Año</span>
          <select value={viewYear} onChange={(ev) => setViewYear(parseInt(ev.target.value, 10))}>
            {[defaultYear - 1, defaultYear, defaultYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span style={{ fontWeight: 700, marginRight: 8 }}>Tipo</span>
          <select value={type} onChange={(ev) => setType(ev.target.value as any)}>
            <option value="all">Todos</option>
            {(Object.keys(TYPE_LABEL) as EventType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span style={{ fontWeight: 700, marginRight: 8 }}>Mes</span>
          <select value={month} onChange={(ev) => setMonth(ev.target.value)}>
            <option value="all">Todos</option>
            {MONTHS.map((m, idx) => (
              <option key={m} value={String(idx + 1)}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      {MONTHS.map((m) => {
        const list = grouped[m];
        if (!list?.length) return null;
        return (
          <React.Fragment key={m}>
            <h2>{m}</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {list.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}