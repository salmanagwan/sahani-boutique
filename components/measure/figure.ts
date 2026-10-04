// The measurement figure as plain drawing instructions, so the same picture can be drawn
// in the app (react-native-svg) and onto a canvas for the image sent to designers.

export type Unit = 'cm' | 'in';

export type Guide = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Point to zoom to while typing, and how far to zoom. */
  focus: { cx: number; cy: number; s: number };
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
};

const H = (y: number, x1: number, x2: number, s: number): Guide => ({
  x1,
  y1: y,
  x2,
  y2: y,
  focus: { cx: 150, cy: y, s },
  label: { x: 150, y: y - 6, anchor: 'middle' },
});

const SLEEVE: Guide = { x1: 97, y1: 86, x2: 80, y2: 212, focus: { cx: 90, cy: 150, s: 1.7 }, label: { x: 74, y: 152, anchor: 'end' } };
const LOWER: Guide = { x1: 214, y1: 172, x2: 214, y2: 372, focus: { cx: 192, cy: 272, s: 1.25 }, label: { x: 220, y: 275, anchor: 'start' } };

export const GUIDES: Record<string, Guide> = {
  Neck: { x1: 140, y1: 66, x2: 160, y2: 66, focus: { cx: 156, cy: 66, s: 3.2 }, label: { x: 165, y: 69, anchor: 'start' } },
  Shoulder: H(80, 100, 200, 2.1),
  Bust: H(136, 104, 196, 2.3),
  Chest: H(136, 104, 196, 2.3),
  Waist: H(172, 118, 182, 2.6),
  Hip: H(212, 104, 196, 2.3),
  'Sleeve Length': SLEEVE,
  'Arm Length': SLEEVE,
  'Blouse Length': { x1: 170, y1: 74, x2: 170, y2: 152, focus: { cx: 166, cy: 114, s: 1.9 }, label: { x: 176, y: 116, anchor: 'start' } },
  'Shirt Length': { x1: 170, y1: 72, x2: 170, y2: 238, focus: { cx: 166, cy: 156, s: 1.4 }, label: { x: 176, y: 158, anchor: 'start' } },
  'Skirt Length': LOWER,
  'Trouser Length': LOWER,
  'Dress Length': { x1: 214, y1: 80, x2: 214, y2: 300, focus: { cx: 190, cy: 190, s: 1.2 }, label: { x: 220, y: 193, anchor: 'start' } },
  Height: { x1: 252, y1: 16, x2: 252, y2: 372, focus: { cx: 150, cy: 200, s: 1 }, label: { x: 252, y: 9, anchor: 'middle' } },
};

export const OVERVIEW = { cx: 150, cy: 200, s: 1 };

// Left half of a plain dress-form figure; the right half is the same outline mirrored.
const HALF =
  'M150 58H142V70C130 72 112 74 100 80C92 84 88 100 86 120L80 168L76 214L86 216L92 170L100 124L106 112' +
  'C104 124 104 134 106 140C110 156 116 166 118 172C114 186 106 200 104 214L110 300L118 372H140L144 300L148 228H150Z';

/** Mirrors an absolute path (M, L, C, H, V, Z only) across x = 150. */
function mirror(d: string): string {
  return d.replace(/([MLCHVZ])([^MLCHVZ]*)/g, (_, cmd: string, args: string) => {
    const nums = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    if (cmd === 'H') return 'H' + nums.map((x) => 300 - x).join(' ');
    if (cmd === 'V' || cmd === 'Z') return cmd + nums.join(' ');
    return cmd + nums.map((n, i) => (i % 2 === 0 ? 300 - n : n)).join(' ');
  });
}

const HALF_RIGHT = mirror(HALF);

/** Value as it should read on the drawing: a bare number gets its unit. */
export function withUnit(field: string, raw: string | undefined, unit: Unit): string {
  const v = (raw ?? '').trim();
  if (!v) return '';
  // Numbers, fractions and pairs like "5.5 / 8.5" get the unit; words ("Yes") don't.
  if (/^[\d.\s\/½¼¾]+$/.test(v) && /\d/.test(v)) return field === 'Age' ? `${v} yrs` : `${v} ${unit}`;
  return v;
}

export type FigureNode =
  | { k: 'path'; d: string; fill?: string; stroke?: string; sw?: number }
  | { k: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number }
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number; dash?: number[] }
  | { k: 'text'; x: number; y: number; anchor: 'start' | 'middle' | 'end'; size: number; color: string; text: string; strong?: boolean; halo?: string };

const OUTLINE = '#CFCBC4';
const BODY = '#FFFFFF';

export interface BuildOptions {
  fields: string[];
  /** Display-ready values, unit included ("32 cm"). */
  values: Record<string, string>;
  active?: string | null;
  /** Label size in grid units. */
  labelSize?: number;
  /** Background colour behind labels, so text stays readable over lines. */
  halo?: string;
  /** Include the measurement name before the value ("Bust 32 cm"). */
  names?: boolean;
}

export function buildFigure({ fields, values, active, labelSize = 7.5, halo, names = true }: BuildOptions): FigureNode[] {
  const nodes: FigureNode[] = [
    { k: 'circle', cx: 150, cy: 36, r: 20, fill: BODY, stroke: OUTLINE, sw: 1 },
    { k: 'path', d: HALF, fill: BODY, stroke: OUTLINE, sw: 1 },
    { k: 'path', d: HALF_RIGHT, fill: BODY, stroke: OUTLINE, sw: 1 },
    // hide the centre seam so the halves read as one figure
    { k: 'line', x1: 150, y1: 59, x2: 150, y2: 227, stroke: BODY, sw: 1.4 },
  ];
  const labels: FigureNode[] = [];

  for (const name of fields) {
    const g = GUIDES[name];
    if (!g) continue;
    const on = name === active;
    const val = values[name]?.trim();
    const color = on ? '#000000' : val ? '#6B6B6B' : '#BDBDBD';
    const sw = on ? 1.4 : 0.9;
    const dash = on || val ? undefined : [3, 3];
    nodes.push({ k: 'line', x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, stroke: color, sw, dash });
    if (g.y1 === g.y2) {
      nodes.push({ k: 'line', x1: g.x1, y1: g.y1 - 3, x2: g.x1, y2: g.y1 + 3, stroke: color, sw });
      nodes.push({ k: 'line', x1: g.x2, y1: g.y2 - 3, x2: g.x2, y2: g.y2 + 3, stroke: color, sw });
    } else if (g.x1 === g.x2) {
      nodes.push({ k: 'line', x1: g.x1 - 3, y1: g.y1, x2: g.x1 + 3, y2: g.y1, stroke: color, sw });
      nodes.push({ k: 'line', x1: g.x2 - 3, y1: g.y2, x2: g.x2 + 3, y2: g.y2, stroke: color, sw });
    } else {
      nodes.push({ k: 'circle', cx: g.x1, cy: g.y1, r: on ? 1.8 : 1.3, fill: color });
      nodes.push({ k: 'circle', cx: g.x2, cy: g.y2, r: on ? 1.8 : 1.3, fill: color });
    }
    if (val || on) {
      const text = val ? (names ? `${name} ${val}` : val) : name;
      labels.push({
        k: 'text',
        x: g.label.x,
        y: g.label.y,
        anchor: g.label.anchor,
        size: labelSize,
        color: on ? '#000000' : val ? '#3A3A3A' : '#9A9A9A',
        text,
        strong: !!val,
        halo,
      });
    }
  }
  // Labels last so they sit above every line.
  return [...nodes, ...labels];
}
