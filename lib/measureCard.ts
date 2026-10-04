// Draws the measurement card sent to designers: logo, order, piece, client, dates and the
// figure with every value. Web only (uses a canvas). No price and no client address.
import { OrderWithRelations, BoutiqueSettings } from '@/types';
import { Fonts } from '@/constants/theme';
import { buildFigure, FigureNode, GUIDES } from '@/components/measure/figure';
import { LOGO_PATHS } from '@/components/ui/Logo';
import { Asset } from 'expo-asset';
import { getGarmentImage } from '@/utils/garments';
import { formatDateShort, getMeasurementFields } from '@/utils/helpers';
import { buildCroquis, CROQUIS_VIEW, WOMEN_FIELDS } from '@/components/measure/croquis';

const W = 1080;
const H = 1500;
const M = 72; // page margin
const INK = '#000000';
const GREY = '#6B6B6B';
const LIGHT = '#DDDDDD';
const MIST = '#F5F4F1';

export const font = (size: number, family: string) => `${size}px ${family}`;

export async function loadFonts() {
  const fams = [Fonts.product, Fonts.sans, Fonts.sansMedium, Fonts.sansSemiBold];
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all(fams.map((f) => document.fonts.load(font(32, f)).catch(() => undefined)));
}

/** Letter-spaced text, drawn character by character (works in every browser). */
export function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: 'left' | 'right' = 'left') {
  const widths = [...text].map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let cx = align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  [...text].forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  return total;
}

export function drawFigure(ctx: CanvasRenderingContext2D, nodes: FigureNode[]) {
  for (const n of nodes) {
    if (n.k === 'path') {
      const p = new Path2D(n.d);
      if (n.fill) {
        ctx.fillStyle = n.fill;
        ctx.fill(p);
      }
      if (n.stroke) {
        ctx.strokeStyle = n.stroke;
        ctx.lineWidth = n.sw ?? 1;
        ctx.lineJoin = 'round';
        ctx.stroke(p);
      }
    } else if (n.k === 'circle') {
      ctx.beginPath();
      ctx.arc(n.cx, n.cy, n.r, 0, Math.PI * 2);
      if (n.fill) {
        ctx.fillStyle = n.fill;
        ctx.fill();
      }
      if (n.stroke) {
        ctx.strokeStyle = n.stroke;
        ctx.lineWidth = n.sw ?? 1;
        ctx.stroke();
      }
    } else if (n.k === 'line') {
      ctx.beginPath();
      ctx.setLineDash(n.dash ?? []);
      ctx.moveTo(n.x1, n.y1);
      ctx.lineTo(n.x2, n.y2);
      ctx.strokeStyle = n.stroke;
      ctx.lineWidth = n.sw;
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (n.k === 'text') {
      ctx.font = font(n.size, n.strong ? Fonts.sansMedium : Fonts.sans);
      ctx.textAlign = n.anchor === 'middle' ? 'center' : n.anchor === 'end' ? 'right' : 'left';
      ctx.textBaseline = 'alphabetic';
      if (n.halo) {
        ctx.strokeStyle = n.halo;
        ctx.lineWidth = n.size * 0.45;
        ctx.lineJoin = 'round';
        ctx.strokeText(n.text, n.x, n.y);
      }
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, n.x, n.y);
    }
  }
}

export function canMakeCard() {
  return typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined';
}

export async function makeMeasurementCard(order: OrderWithRelations, boutique: BoutiqueSettings): Promise<Blob | null> {
  if (!canMakeCard()) return null;
  await loadFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // Logo: the arch mark beside SAHANI / BOUTIQUE
  ctx.save();
  ctx.translate(M, 56);
  ctx.scale(2.2, 2.2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  ctx.stroke(new Path2D(LOGO_PATHS.outer));
  ctx.stroke(new Path2D(LOGO_PATHS.base));
  ctx.lineWidth = 0.8;
  ctx.stroke(new Path2D(LOGO_PATHS.inner));
  ctx.fillStyle = INK;
  ctx.fill(new Path2D(LOGO_PATHS.diamond));
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.font = font(40, Fonts.product);
  spaced(ctx, 'SAHANI', M + 74, 100, 12);
  ctx.font = font(14, Fonts.sansMedium);
  ctx.fillStyle = GREY;
  spaced(ctx, 'BOUTIQUE', M + 76, 126, 9);

  // Order number and date, top right
  ctx.fillStyle = INK;
  ctx.font = font(34, Fonts.sansMedium);
  ctx.textAlign = 'right';
  ctx.fillText(order.orderNumber, W - M, 96);
  ctx.font = font(20, Fonts.sans);
  ctx.fillStyle = GREY;
  ctx.fillText(`Ordered ${formatDateShort(order.orderDate ?? order.createdAt)}`, W - M, 126);

  ctx.fillStyle = LIGHT;
  ctx.fillRect(M, 168, W - 2 * M, 1.5);

  // The piece
  ctx.fillStyle = GREY;
  ctx.font = font(18, Fonts.sansMedium);
  spaced(ctx, 'COMMISSION FOR', M, 224, 4);
  ctx.fillStyle = INK;
  ctx.font = font(30, Fonts.sansMedium);
  spaced(ctx, order.designer.name.toUpperCase(), M, 268, 5);
  ctx.font = font(60, Fonts.product);
  ctx.textAlign = 'left';
  ctx.fillText(order.productName, M, 348);
  if (order.productCode) {
    ctx.font = font(24, Fonts.sans);
    ctx.fillStyle = GREY;
    ctx.fillText(`Style code ${order.productCode}`, M, 392);
  }

  // Facts: client, fitting, due, event
  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
  const due = order.vendorDeliveryDate ?? order.expectedDeliveryDate;
  const facts: [string, string][] = [
    ['CLIENT', order.customer.fullName],
    ['FITTING FOR', cap(order.customer.gender)],
    ['NEEDED BY', due ? formatDateShort(due) : 'Not set'],
    ['EVENT', order.eventDate ? formatDateShort(order.eventDate) : 'Not set'],
  ];
  const colW = (W - 2 * M) / 4;
  facts.forEach(([label, value], i) => {
    const x = M + i * colW;
    ctx.fillStyle = GREY;
    ctx.font = font(16, Fonts.sansMedium);
    spaced(ctx, label, x, 456, 3);
    ctx.fillStyle = INK;
    ctx.font = font(26, Fonts.sansMedium);
    ctx.textAlign = 'left';
    let v = value;
    while (ctx.measureText(v).width > colW - 16 && v.length > 4) v = v.slice(0, -2) + '…';
    ctx.fillText(v, x, 494);
  });

  // Figure with every value
  const boxY = 536;
  const boxH = 860;
  ctx.fillStyle = MIST;
  ctx.fillRect(M, boxY, W - 2 * M, boxH);
  const fields = getMeasurementFields(order.customer.gender);
  const values = order.measurements?.values ?? {};
  const nodes = buildFigure({ fields, values, labelSize: 11, halo: MIST });
  const vx = -58;
  const vw = 416;
  const k = Math.min((W - 2 * M) / vw, (boxH - 40) / 400);
  const offX = M + ((W - 2 * M) - vw * k) / 2;
  const offY = boxY + (boxH - 400 * k) / 2;
  ctx.save();
  ctx.translate(offX - vx * k, offY);
  ctx.scale(k, k);
  drawFigure(ctx, nodes);
  ctx.restore();

  // Values the figure can't show (such as age), written in the box corner
  const extras = Object.entries(values).filter(([f]) => !GUIDES[f]);
  extras.forEach(([f, v], i) => {
    ctx.fillStyle = INK;
    ctx.font = font(22, Fonts.sansMedium);
    ctx.textAlign = 'left';
    ctx.fillText(`${f} ${v}`, M + 28, boxY + 48 + i * 32);
  });
  if (!Object.keys(values).length) {
    ctx.fillStyle = GREY;
    ctx.font = font(24, Fonts.sans);
    ctx.textAlign = 'center';
    ctx.fillText('Measurements to follow', W / 2, boxY + boxH - 36);
  }

  // Footer: the boutique's own details only
  ctx.fillStyle = GREY;
  ctx.font = font(18, Fonts.sans);
  ctx.textAlign = 'left';
  ctx.fillText(boutique.name, M, H - 46);
  ctx.textAlign = 'right';
  ctx.fillText(boutique.email, W - M, H - 46);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}


// ---------------------------------------------------------------------------
// Women's measurement sheet, laid out like the boutique's paper form: a header table
// (order, dates, client, design, designer, colour, fabric, details), then the list of
// measurements on the left and the front and back figures on the right. One image.

const SW = 1240;
const SM = 60;
const RULE = '#D9D5CE';
const LABEL = '#6B6B6B';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wraps text to a width, keeping the line breaks the person typed. */
function wrapParagraphs(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  return text
    .split(/\r?\n/)
    .flatMap((para) => (para.trim() ? wrap(ctx, para.trim(), maxW) : ['']));
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  let v = text;
  while (ctx.measureText(v).width > maxW && v.length > 3) v = v.slice(0, -2) + '…';
  return v;
}

export async function makeWomenSheet(order: OrderWithRelations, boutique: BoutiqueSettings): Promise<Blob | null> {
  if (!canMakeCard()) return null;
  await loadFonts();

  // Work out the page height first: header, measurements (standard plus any added),
  // then a band for the piece photo and special request when there is one.
  const values = order.measurements?.values ?? {};
  const extras = Object.keys(values).filter((k) => !(WOMEN_FIELDS as readonly string[]).includes(k));
  const fields = [...WOMEN_FIELDS, ...extras];
  const [piecePhoto, specialPhoto] = await Promise.all([
    loadImage(garmentUri(order)),
    order.specialImageUri ? loadImage(order.specialImageUri) : Promise.resolve(null),
  ]);
  const special = order.specialRequest?.trim() ?? '';
  const hasBand = !!(piecePhoto || special || specialPhoto);

  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = font(24, Fonts.sansMedium);
  const tw0 = SW - 2 * SM;
  const detailLines = wrap(measure, order.details ?? '', tw0 - 0.2 * tw0 - 32).slice(0, 3);
  const dh = Math.max(60, 20 + detailLines.length * 36);
  const headerEnd = 150 + 108 + 4 * 60 + dh + 28;
  const rowH = 42;
  const tableH = Math.max(fields.length * rowH, 1100);
  // Band: a heading line, two equal image boxes, then the request text under its box.
  // The request can run to 23 lines or more; the card grows to fit, keeping line breaks.
  const MAX_LINES = 80; // 23+ typed lines, even when each wraps onto two
  const colW0 = (tw0 - 30) / 2;
  measure.font = font(24, Fonts.sans);
  const specialLines = special ? wrapParagraphs(measure, special, specialPhoto ? colW0 : colW0 - 64).slice(0, MAX_LINES) : [];
  // Without an image the text sits inside the box, so the box is at least as tall as the text.
  const BOX = specialPhoto || !special ? 680 : Math.max(680, 60 + specialLines.length * 36 + 30);
  const BAND = 40 + BOX + (specialLines.length && specialPhoto ? 24 + specialLines.length * 34 : 0);
  const H = headerEnd + tableH + (hasBand ? 56 + BAND : 0) + 80;

  const canvas = document.createElement('canvas');
  canvas.width = SW;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, SW, H);
  ctx.textBaseline = 'alphabetic';

  // Title: mark and SAHANI BOUTIQUE, centred
  ctx.font = font(42, Fonts.product);
  const title = 'SAHANI BOUTIQUE';
  const titleW = [...title].reduce((a, c) => a + ctx.measureText(c).width, 0) + 10 * (title.length - 1);
  const markW = 24 * 1.9;
  const startX = (SW - (markW + 22 + titleW)) / 2;
  ctx.save();
  ctx.translate(startX, 46);
  ctx.scale(1.9, 1.9);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  ctx.stroke(new Path2D(LOGO_PATHS.outer));
  ctx.stroke(new Path2D(LOGO_PATHS.base));
  ctx.lineWidth = 0.8;
  ctx.stroke(new Path2D(LOGO_PATHS.inner));
  ctx.fillStyle = INK;
  ctx.fill(new Path2D(LOGO_PATHS.diamond));
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.font = font(42, Fonts.product);
  spaced(ctx, title, startX + markW + 22, 98, 10);

  // Header table
  const x0 = SM;
  const x1 = SW - SM;
  const tw = x1 - x0;
  let y = 150;
  const line = (ax: number, ay: number, bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  const label = (t: string, x: number, yy: number, w: number, center = true) => {
    ctx.fillStyle = LABEL;
    ctx.font = font(16, Fonts.sansMedium);
    const sw = spacedWidth(ctx, t, 2.2);
    spaced(ctx, t, center ? x + (w - sw) / 2 : x + 16, yy, 2.2);
  };
  const value = (t: string, x: number, yy: number, w: number, center = true, size = 24) => {
    ctx.fillStyle = INK;
    ctx.font = font(size, Fonts.sansMedium);
    const v = fit(ctx, t, w - 24);
    ctx.textAlign = center ? 'center' : 'left';
    ctx.fillText(v, center ? x + w / 2 : x + 16, yy);
    ctx.textAlign = 'left';
  };

  const due = order.vendorDeliveryDate ?? order.expectedDeliveryDate;
  const cols = [
    { l: 'ORDER NO.', v: order.orderNumber, w: 0.16 },
    { l: 'ORDER DATE', v: formatDateShort(order.orderDate ?? order.createdAt), w: 0.18 },
    { l: 'CLIENT', v: order.customer.fullName, w: 0.3 },
    { l: 'DELIVERY DATE', v: due ? formatDateShort(due) : '', w: 0.18 },
    { l: 'EVENT DATE', v: order.eventDate ? formatDateShort(order.eventDate) : '', w: 0.18 },
  ];
  line(x0, y, x1, y);
  let cx = x0;
  cols.forEach((c) => {
    const w = c.w * tw;
    label(c.l, cx, y + 32, w);
    value(c.v, cx, y + 86, w, true, 22);
    cx += w;
  });
  line(x0, y + 48, x1, y + 48);
  line(x0, y + 108, x1, y + 108);
  cx = x0;
  cols.forEach((c, i) => {
    if (i > 0) line(cx, y, cx, y + 108);
    cx += c.w * tw;
  });
  line(x0, y, x0, y + 108);
  line(x1, y, x1, y + 108);
  y += 108;

  const lw = 0.2 * tw;
  const rows: [string, string][] = [
    ['DESIGN', [order.productName, order.productCode].filter(Boolean).join(', ')],
    ['DESIGNER', order.designer.name],
    ['COLOUR', order.colour ?? ''],
    ['FABRICS', order.fabric ?? ''],
  ];
  rows.forEach(([l, v]) => {
    label(l, x0, y + 38, lw);
    value(v, x0 + lw, y + 40, tw - lw, false);
    line(x0, y + 60, x1, y + 60);
    line(x0, y, x0, y + 60);
    line(x0 + lw, y, x0 + lw, y + 60);
    line(x1, y, x1, y + 60);
    y += 60;
  });
  label('DETAILS', x0, y + 38, lw);
  detailLines.forEach((t, i) => value(t, x0 + lw, y + 40 + i * 36, tw - lw, false));
  line(x0, y + dh, x1, y + dh);
  line(x0, y, x0, y + dh);
  line(x0 + lw, y, x0 + lw, y + dh);
  line(x1, y, x1, y + dh);
  y += dh + 28;

  // Measurements column: the sheet's list, then any the boutique added
  const top = y;
  const bottom = top + tableH;
  const rh = tableH / fields.length;
  const nameW = 250;
  const valW = 130;
  fields.forEach((f, i) => {
    const ry = top + i * rh;
    line(x0, ry, x0 + nameW + valW, ry);
    ctx.fillStyle = INK;
    ctx.font = font(19, Fonts.sansMedium);
    ctx.fillText(fit(ctx, f, nameW - 20), x0 + 12, ry + rh / 2 + 7);
    const v = values[f];
    if (v) {
      ctx.font = font(21, Fonts.sansSemiBold);
      ctx.fillText(fit(ctx, v, valW - 16), x0 + nameW + 12, ry + rh / 2 + 8);
    }
  });
  line(x0, bottom, x0 + nameW + valW, bottom);
  line(x0, top, x0, bottom);
  line(x0 + nameW, top, x0 + nameW, bottom);
  line(x0 + nameW + valW, top, x0 + nameW + valW, bottom);

  // Front and back figures
  const fx0 = x0 + nameW + valW + 20;
  const fw = x1 - fx0;
  const fh = bottom - top;
  const cropX = 40;
  const cropW = CROQUIS_VIEW.w - 2 * cropX;
  const k = Math.min(fw / cropW, fh / CROQUIS_VIEW.h);
  const ox = fx0 + (fw - cropW * k) / 2 - cropX * k;
  const oy = top + (fh - CROQUIS_VIEW.h * k) / 2;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  drawFigure(ctx, buildCroquis({ values, labelActive: false }));
  ctx.restore();
  ctx.fillStyle = LABEL;
  ctx.font = font(16, Fonts.sansMedium);
  spaced(ctx, 'FRONT', ox + 150 * k - spacedWidth(ctx, 'FRONT', 3) / 2, oy + CROQUIS_VIEW.h * k + 24, 3);
  spaced(ctx, 'BACK', ox + 450 * k - spacedWidth(ctx, 'BACK', 3) / 2, oy + CROQUIS_VIEW.h * k + 24, 3);

  // The piece and the special request: two equal columns, headings on one line,
  // image boxes the same size and top, the request text under its box.
  if (hasBand) {
    const by = bottom + 56;
    const colW = (tw - 30) / 2;
    const sx = x0 + colW + 30;
    const boxY = by + 40;
    const heading = (t: string, x: number) => {
      ctx.fillStyle = LABEL;
      ctx.font = font(16, Fonts.sansMedium);
      spaced(ctx, t, x, by + 16, 2.2);
    };
    heading('THE PIECE', x0);
    heading('SPECIAL REQUEST', sx);
    drawCover(ctx, piecePhoto, x0, boxY, colW, BOX, 'No photo');
    if (specialPhoto) {
      drawCover(ctx, specialPhoto, sx, boxY, colW, BOX, '');
      ctx.font = font(24, Fonts.sans);
      ctx.fillStyle = INK;
      specialLines.forEach((t, i) => ctx.fillText(t, sx, boxY + BOX + 44 + i * 34));
    } else {
      // No image: the request text sits inside the box, so the two boxes still match.
      ctx.fillStyle = MIST;
      ctx.fillRect(sx, boxY, colW, BOX);
      ctx.font = font(24, Fonts.sans);
      ctx.fillStyle = special ? INK : LABEL;
      const lines = special ? specialLines : ['None'];
      lines.forEach((t, i) => ctx.fillText(t, sx + 32, boxY + 60 + i * 36));
    }
  }

  // Footer: the boutique's own details only
  ctx.fillStyle = LABEL;
  ctx.font = font(17, Fonts.sans);
  ctx.textAlign = 'left';
  ctx.fillText(boutique.name, x0, H - 26);
  ctx.textAlign = 'right';
  ctx.fillText(boutique.email, x1, H - 26);
  ctx.textAlign = 'left';

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

/** The piece's photo as a URL: the one added to the order, or the matched sample photo. */
function garmentUri(order: OrderWithRelations): string | null {
  const src: any = getGarmentImage(order);
  if (!src) return null;
  if (typeof src === 'string') return src;
  if (typeof src === 'object' && src.uri) return src.uri;
  if (typeof src === 'number') {
    try {
      return Asset.fromModule(src).uri;
    } catch {
      return null;
    }
  }
  return null;
}

/** Loads an image for drawing. Links from sites that don't allow it come back empty. */
function loadImage(uri: string | null): Promise<HTMLImageElement | null> {
  if (!uri) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new window.Image();
    if (!uri.startsWith('data:') && !uri.startsWith('blob:')) img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = uri;
  });
}

/** Fills a box with an image, cropped to the box's shape and centred. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  emptyText: string
) {
  ctx.fillStyle = MIST;
  ctx.fillRect(x, y, w, h);
  if (!img) {
    if (emptyText) {
      ctx.fillStyle = LABEL;
      ctx.font = font(22, Fonts.sans);
      ctx.textAlign = 'center';
      ctx.fillText(emptyText, x + w / 2, y + h / 2);
      ctx.textAlign = 'left';
    }
    return;
  }
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / s;
  const sh = h / s;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Draws an image inside a box on the light background, whole and centred. */
function drawContained(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = MIST;
  ctx.fillRect(x, y, w, h);
  if (!img) return;
  const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  return [...text].reduce((a, c) => a + ctx.measureText(c).width, 0) + spacing * (text.length - 1);
}

/** The image that goes to the designer: the full sheet for women, the card otherwise. */
export function makeOrderImage(order: OrderWithRelations, boutique: BoutiqueSettings) {
  return order.customer.gender === 'female' ? makeWomenSheet(order, boutique) : makeMeasurementCard(order, boutique);
}
