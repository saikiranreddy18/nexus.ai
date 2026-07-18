import { useMemo } from "react";

// Procedural PCB / electronics background — no external assets, no API keys.
// Deterministic layout (seeded) so it renders identically every load.

const W = 1440;
const H = 900;
const CELL = 45;
const COLS = Math.floor(W / CELL);
const ROWS = Math.floor(H / CELL);

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];
interface Trace {
  id: string;
  d: string;
  pts: Pt[];
  len: number;
}

function buildTraces(): Trace[] {
  const rng = mulberry32(20260715);
  const traces: Trace[] = [];
  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    // Bias starting point toward the lower portion of the frame so the
    // "interesting" density sits low, like the original video crop.
    let cx = Math.floor(rng() * COLS);
    let cy = Math.floor((0.15 + rng() * 0.85) * ROWS);
    const pts: Pt[] = [[cx, cy]];
    const steps = 4 + Math.floor(rng() * 6);
    let horiz = rng() < 0.5;

    for (let s = 0; s < steps; s++) {
      const dist = 1 + Math.floor(rng() * 5);
      if (horiz) cx += (rng() < 0.5 ? -1 : 1) * dist;
      else cy += (rng() < 0.5 ? -1 : 1) * dist;
      cx = Math.max(0, Math.min(COLS, cx));
      cy = Math.max(0, Math.min(ROWS, cy));
      const last = pts[pts.length - 1];
      if (cx !== last[0] || cy !== last[1]) pts.push([cx, cy]);
      horiz = !horiz;
    }
    if (pts.length < 2) continue;

    let d = `M ${pts[0][0] * CELL} ${pts[0][1] * CELL}`;
    let len = 0;
    for (let p = 1; p < pts.length; p++) {
      d += ` L ${pts[p][0] * CELL} ${pts[p][1] * CELL}`;
      len +=
        (Math.abs(pts[p][0] - pts[p - 1][0]) +
          Math.abs(pts[p][1] - pts[p - 1][1])) *
        CELL;
    }
    traces.push({ id: `tr-${i}`, d, pts, len });
  }
  return traces;
}

// Hand-placed chip packages (grid coordinates).
const CHIPS = [
  { x: 4, y: 15, w: 5, h: 4 },
  { x: 25, y: 4, w: 5, h: 4 },
  { x: 20, y: 16, w: 4, h: 5 },
  { x: 12, y: 9, w: 4, h: 3 },
];

function Chip({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const px = x * CELL;
  const py = y * CELL;
  const pw = w * CELL;
  const ph = h * CELL;
  const pins = [];
  const pinCount = w * 2;
  for (let i = 0; i < pinCount; i++) {
    const fx = px + ((i + 0.5) / pinCount) * pw;
    pins.push(
      <line key={`t${i}`} x1={fx} y1={py} x2={fx} y2={py - 8} />,
      <line key={`b${i}`} x1={fx} y1={py + ph} x2={fx} y2={py + ph + 8} />
    );
  }
  return (
    <g>
      <g stroke="#2dd4bf" strokeWidth="1.5" opacity="0.55">
        {pins}
      </g>
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        rx="4"
        fill="rgba(8,20,28,0.85)"
        stroke="#38bdf8"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle cx={px + 9} cy={py + 9} r="2.5" fill="#22d3ee" opacity="0.8" />
    </g>
  );
}

export default function ElectronicsBackground() {
  const traces = useMemo(buildTraces, []);
  const pulses = useMemo(() => traces.filter((_, i) => i % 2 === 0), [traces]);
  const dots = useMemo(() => {
    const rng = mulberry32(778);
    const out: { x: number; y: number; r: number; warm: boolean }[] = [];
    for (let i = 0; i < 60; i++) {
      out.push({
        x: Math.floor(rng() * COLS) * CELL,
        y: Math.floor(rng() * ROWS) * CELL,
        r: rng() < 0.15 ? 2 : 1.2,
        warm: rng() < 0.12,
      });
    }
    return out;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Deep gradient base with a cool tech glow low-center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 78%, rgba(14,58,84,0.55) 0%, rgba(6,14,24,0.9) 45%, #01040a 100%)",
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {traces.map((t) => (
            <path key={t.id} id={t.id} d={t.d} />
          ))}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="softGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Grid pad dots */}
        <g>
          {dots.map((dt, i) => (
            <circle
              key={i}
              cx={dt.x}
              cy={dt.y}
              r={dt.r}
              fill={dt.warm ? "#f59e0b" : "#164e63"}
              opacity={dt.warm ? 0.5 : 0.6}
            />
          ))}
        </g>

        {/* Glowing trace underlay */}
        <g filter="url(#glow)" opacity="0.45">
          {traces.map((t) => (
            <use
              key={t.id}
              href={`#${t.id}`}
              stroke="#22d3ee"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Crisp trace lines */}
        <g className="circuit-flicker">
          {traces.map((t) => (
            <use
              key={t.id}
              href={`#${t.id}`}
              stroke="#5cc9f5"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          ))}
        </g>

        {/* Vias / solder pads at trace endpoints */}
        <g>
          {traces.map((t) => {
            const a = t.pts[0];
            const b = t.pts[t.pts.length - 1];
            return (
              <g key={t.id} stroke="#0b3a4a" strokeWidth="1">
                <circle cx={a[0] * CELL} cy={a[1] * CELL} r="3.5" fill="#0e2733" />
                <circle
                  cx={a[0] * CELL}
                  cy={a[1] * CELL}
                  r="1.4"
                  fill="#67e8f9"
                  stroke="none"
                />
                <circle cx={b[0] * CELL} cy={b[1] * CELL} r="3.5" fill="#0e2733" />
                <circle
                  cx={b[0] * CELL}
                  cy={b[1] * CELL}
                  r="1.4"
                  fill="#67e8f9"
                  stroke="none"
                />
              </g>
            );
          })}
        </g>

        {/* Chips */}
        {CHIPS.map((c, i) => (
          <Chip key={i} {...c} />
        ))}

        {/* Data pulses travelling along traces */}
        {pulses.map((t, i) => (
          <circle key={t.id} r="2.6" fill="#e8fbff" filter="url(#softGlow)">
            <animateMotion
              dur={`${Math.max(3.5, t.len / 95).toFixed(2)}s`}
              begin={`-${(i * 0.8).toFixed(2)}s`}
              repeatCount="indefinite"
            >
              <mpath href={`#${t.id}`} />
            </animateMotion>
          </circle>
        ))}
      </svg>

      {/* Cinematic vignette to keep edges dark under the glass UI */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}
