// Women's measurement sheet: a front and a back figure side by side, with a guide line
// or curve for each of the 25 measurements. Drawn as plain instructions (FigureNode) so the
// same picture renders in the app and onto the canvas image sent to designers.
import { FigureNode } from '@/components/measure/figure';

/** The sheet's measurements, in the sheet's order. */
export const WOMEN_FIELDS = [
  'Cups',
  'Blouse Length',
  'Skirt Length',
  'Dress Length',
  'Skirt Belt',
  'Cross Shoulder',
  'Bust Point',
  'Bodice',
  'Front Neck',
  'Back Neck',
  'Arm Hole',
  'Sleeves',
  'Sleeve Mori',
  'Bicep',
  'Upper Chest Round',
  'Full Bust',
  'Under Bust',
  'Waist',
  'Stomach',
  'Hips',
  'Crotch',
  'Upper Thighs',
  'Lower Thighs',
  'Knee',
  'Calf',
  'Ankle',
] as const;

/** Fields that take words rather than a number. */
export const TEXT_FIELDS: Record<string, { hint: string; choices?: string[] }> = {
  Cups: { hint: 'Padded cups in the blouse?', choices: ['Yes', 'No'] },
};

export const CROQUIS_VIEW = { w: 600, h: 620 };

type CGuide = {
  /** A straight guide... */
  line?: [number, number, number, number];
  /** ...or a curve (SVG path). */
  d?: string;
  focus: { cx: number; cy: number; s: number };
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
};

const h = (y: number, x1: number, x2: number, s: number, cx = (x1 + x2) / 2): CGuide => ({
  line: [x1, y, x2, y],
  focus: { cx, cy: y, s },
  label: { x: (x1 + x2) / 2, y: y - 6, anchor: 'middle' },
});
const v = (x: number, y1: number, y2: number, s: number, fx = x): CGuide => ({
  line: [x, y1, x, y2],
  focus: { cx: fx, cy: (y1 + y2) / 2, s },
  label: { x: x + 6, y: (y1 + y2) / 2 + 3, anchor: 'start' },
});

// Front figure is centred on x = 150, back on x = 450.
export const CROQUIS_GUIDES: Record<string, CGuide> = {
  Cups: {
    d: 'M124 168a4 4 0 1 0 8 0a4 4 0 1 0-8 0M168 168a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
    focus: { cx: 150, cy: 168, s: 2.6 },
    label: { x: 150, y: 158, anchor: 'middle' },
  },
  'Blouse Length': v(450, 100, 200, 2.1),
  'Skirt Length': v(508, 215, 588, 1.05, 480),
  'Dress Length': v(232, 110, 590, 1.0, 190),
  'Skirt Belt': h(215, 420, 480, 2.6),
  'Cross Shoulder': h(110, 400, 500, 2.3),
  'Bust Point': {
    line: [141, 98, 128, 166],
    focus: { cx: 138, cy: 134, s: 2.6 },
    label: { x: 124, y: 130, anchor: 'end' },
  },
  Bodice: v(162, 100, 215, 2.1, 156),
  // Front neck depth on the front figure; back neck depth on the back figure.
  'Back Neck': {
    d: 'M439 96Q450 110 461 96',
    focus: { cx: 456, cy: 102, s: 3.2 },
    label: { x: 464, y: 110, anchor: 'start' },
  },
  'Front Neck': {
    d: 'M139 96Q150 124 161 96',
    focus: { cx: 156, cy: 104, s: 3.2 },
    label: { x: 164, y: 112, anchor: 'start' },
  },
  'Arm Hole': {
    d: 'M101 111C115 116 117 138 110 148',
    focus: { cx: 106, cy: 130, s: 3.4 },
    label: { x: 96, y: 132, anchor: 'end' },
  },
  Sleeves: {
    line: [99, 114, 80, 290],
    focus: { cx: 92, cy: 200, s: 1.6 },
    label: { x: 76, y: 205, anchor: 'end' },
  },
  'Sleeve Mori': h(288, 79, 95, 4),
  Bicep: h(150, 87, 106, 3.4),
  'Upper Chest Round': h(140, 110, 190, 2.6),
  'Full Bust': h(168, 108, 192, 2.6),
  'Under Bust': h(190, 113, 187, 2.6),
  Waist: h(215, 120, 180, 2.6),
  Stomach: h(246, 115, 185, 2.6),
  Hips: h(276, 107, 193, 2.4),
  Crotch: v(150, 215, 305, 2.4),
  'Upper Thighs': h(318, 150, 192, 3),
  'Lower Thighs': h(368, 152, 186, 3),
  Knee: h(420, 154, 180, 3.2),
  Calf: h(470, 154, 182, 3.2),
  Ankle: h(560, 156, 170, 3.6),
};

export const CROQUIS_OVERVIEW = { cx: 300, cy: 310, s: 1 };

// Half of the figure (left side), from the neck down to the inside of the leg.
const BODY_HALF =
  'M150 76H141V96C132 102 112 104 100 110C96 118 104 138 110 148C108 156 107 162 108 170' +
  'C110 180 112 186 113 190C116 200 120 208 120 215C119 228 116 238 115 246C111 258 108 266 107 276' +
  'C106 292 107 304 108 316C110 340 113 356 114 370C117 392 119 408 120 420C119 440 117 456 118 470' +
  'C122 500 128 535 130 560L126 590H146L144 560C144 530 146 500 146 470C146 452 145 436 146 420' +
  'C147 400 148 380 148 360C149 340 149 320 150 305Z';
// Left arm, hanging slightly away from the body.
const ARM =
  'M100 110C92 114 88 126 87 140L84 205L80 290C80 300 84 306 90 304L94 290L100 205L106 150Z';

/** Moves an absolute path sideways and/or mirrors it across x = c. */
function shift(d: string, dx: number, mirrorAt?: number): string {
  return d.replace(/([MLCHVZQ])([^MLCHVZQ]*)/g, (_, cmd: string, args: string) => {
    const nums = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    const fx = (x: number) => (mirrorAt !== undefined ? 2 * mirrorAt - x : x) + dx;
    if (cmd === 'H') return 'H' + nums.map(fx).join(' ');
    if (cmd === 'V' || cmd === 'Z') return cmd + nums.join(' ');
    return cmd + nums.map((n, i) => (i % 2 === 0 ? fx(n) : n)).join(' ');
  });
}

const OUTLINE = '#C9C4BC';
const BODY = '#FFFFFF';

function figure(dx: number, back: boolean): FigureNode[] {
  const c = 150 + dx;
  const nodes: FigureNode[] = [
    { k: 'path', d: shift(ARM, dx), fill: BODY, stroke: OUTLINE, sw: 1 },
    { k: 'path', d: shift(ARM, dx, 150), fill: BODY, stroke: OUTLINE, sw: 1 },
    { k: 'path', d: shift(BODY_HALF, dx), fill: BODY, stroke: OUTLINE, sw: 1 },
    { k: 'path', d: shift(BODY_HALF, dx, 150), fill: BODY, stroke: OUTLINE, sw: 1 },
    // hide the centre seam, except between the legs
    { k: 'line', x1: c, y1: 77, x2: c, y2: 304, stroke: BODY, sw: 1.4 },
    // head
    { k: 'path', d: `M${c} 20C${c + 14} 20 ${c + 22} 32 ${c + 22} 48C${c + 22} 66 ${c + 12} 80 ${c} 80C${c - 12} 80 ${c - 22} 66 ${c - 22} 48C${c - 22} 32 ${c - 14} 20 ${c} 20Z`, fill: BODY, stroke: OUTLINE, sw: 1 },
  ];
  if (back) {
    // spine and shoulder blades, so the back reads as the back
    nodes.push({ k: 'line', x1: c, y1: 100, x2: c, y2: 230, stroke: '#E2DED7', sw: 0.8, dash: [2, 3] });
    nodes.push({ k: 'path', d: `M${c - 30} 128C${c - 22} 140 ${c - 20} 152 ${c - 26} 162M${c + 30} 128C${c + 22} 140 ${c + 20} 152 ${c + 26} 162`, stroke: '#E2DED7', sw: 0.8 });
  } else {
    // waist seam hint at the navel
    nodes.push({ k: 'circle', cx: c, cy: 236, r: 1, fill: '#D8D3CB' });
  }
  return nodes;
}

export interface CroquisOptions {
  /** Display-ready values ("29.5 in"). */
  values: Record<string, string>;
  active?: string | null;
  /** Label size for the active measurement, in grid units. */
  labelSize?: number;
  halo?: string;
  /** Write values on the figure (only for the active field in the entry view). */
  labelActive?: boolean;
}

export function buildCroquis({ values, active, labelSize = 9, halo, labelActive = true }: CroquisOptions): FigureNode[] {
  const nodes: FigureNode[] = [...figure(0, false), ...figure(300, true)];
  const labels: FigureNode[] = [];
  for (const name of WOMEN_FIELDS) {
    const g = CROQUIS_GUIDES[name];
    const on = name === active;
    const val = values[name]?.trim();
    const color = on ? '#000000' : val ? '#4A4A4A' : '#C2C2C2';
    const sw = on ? 1.6 : val ? 1.1 : 0.9;
    const dash = on || val ? undefined : [3, 3];
    if (g.line) {
      const [x1, y1, x2, y2] = g.line;
      nodes.push({ k: 'line', x1, y1, x2, y2, stroke: color, sw, dash });
      if (y1 === y2) {
        nodes.push({ k: 'line', x1, y1: y1 - 3, x2: x1, y2: y1 + 3, stroke: color, sw });
        nodes.push({ k: 'line', x1: x2, y1: y2 - 3, x2, y2: y2 + 3, stroke: color, sw });
      } else if (x1 === x2) {
        nodes.push({ k: 'line', x1: x1 - 3, y1, x2: x1 + 3, y2: y1, stroke: color, sw });
        nodes.push({ k: 'line', x1: x2 - 3, y1: y2, x2: x2 + 3, y2, stroke: color, sw });
      } else {
        nodes.push({ k: 'circle', cx: x1, cy: y1, r: on ? 1.8 : 1.3, fill: color });
        nodes.push({ k: 'circle', cx: x2, cy: y2, r: on ? 1.8 : 1.3, fill: color });
      }
    } else if (g.d) {
      nodes.push({ k: 'path', d: g.d, stroke: color, sw, fill: name === 'Cups' && val?.toLowerCase().startsWith('y') ? color : undefined });
    }
    if (on && labelActive) {
      labels.push({
        k: 'text',
        x: g.label.x,
        y: g.label.y,
        anchor: g.label.anchor,
        size: labelSize,
        color: '#000000',
        text: val ? `${name} ${val}` : name,
        strong: true,
        halo,
      });
    }
  }
  return [...nodes, ...labels];
}
