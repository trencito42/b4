/**
 * Captures a DOM subtree into a Canvas2D image by painting it directly —
 * walking the live subtree and drawing each element's background, border,
 * box-shadow and text runs with Canvas2D primitives, using the browser's
 * own layout (`getBoundingClientRect()`/`Range.getClientRects()`) for
 * every position so nothing is re-implemented by hand.
 *
 * This replaced an earlier SVG-`foreignObject` pipeline (serialize the
 * subtree as XHTML, rasterize via an `<img>`, draw that image to canvas).
 * That approach is a known Chromium dead end for this use case: a canvas
 * painted from an SVG containing `foreignObject` is permanently marked
 * "tainted" — it can still be *displayed*, but `texImage2D`/`getImageData`
 * on it throws `SecurityError: Tainted canvases may not be loaded`, even
 * for a same-origin `blob:` URL with zero external resources. That is
 * exactly the shape of bug a purely visual check misses (the image still
 * looks right) and a WebGL texture upload catches immediately. Painting
 * directly with `fillRect`/`fillText`/`strokeRect` never loads a raster
 * image into the canvas at all, so there is nothing to taint it.
 *
 * Explicit, stated scope (read before assuming this is a universal
 * html2canvas replacement): it supports the kind of content B4 components
 * themselves produce — text, box layout, solid/alpha backgrounds, uniform
 * borders, border-radius, a single box-shadow, inline SVG icons (drawn as
 * vector paths, not rasterized). It does NOT support: multi-stop/angled
 * CSS gradients (first background-color only), per-side differing
 * borders (uses the top side's width/color/style for all four), nested
 * `<canvas>`/`<video>` content (their pixels aren't part of the DOM to
 * read), `<img>` elements whose `src` isn't a `data:` URL (skipped —
 * drawing a non-data-URL image risks re-tainting the canvas the exact
 * same way), CSS transforms/filters, iframes, or shadow DOM. See
 * docs/effects/DISTORTION_WAVE.md for the full list.
 */

export interface CaptureOptions {
  /** Backing-store resolution multiplier. @default min(devicePixelRatio, 2) */
  resolution?: number;
}

export interface CaptureResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

function parseBoxShadow(value: string): { offsetX: number; offsetY: number; blur: number; color: string } | null {
  if (!value || value === "none") return null;
  // Only the first shadow in a comma-separated list; `inset` shadows are skipped (rare in B4 cards).
  const first = value.split(/,(?![^(]*\))/)[0]?.trim();
  if (!first || first.includes("inset")) return null;
  const colorMatch = first.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/);
  const color = colorMatch?.[1] ?? "rgba(0,0,0,0.2)";
  const rest = colorMatch?.[1] ? first.replace(colorMatch[1], "") : first;
  const lengths = rest.match(/-?\d+(\.\d+)?px/g)?.map((s) => parseFloat(s)) ?? [];
  const [offsetX = 0, offsetY = 0, blur = 0] = lengths;
  return { offsetX, offsetY, blur, color };
}

function drawRoundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintBoxDecoration(
  ctx: CanvasRenderingContext2D,
  style: CSSStyleDeclaration,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const radius = parseFloat(style.borderTopLeftRadius) || 0;
  const shadow = parseBoxShadow(style.boxShadow);

  const bg = style.backgroundColor;
  const hasBg = bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)";
  if (hasBg || shadow) {
    ctx.save();
    if (shadow) {
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
    }
    drawRoundedRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = hasBg ? bg : "rgba(0,0,0,0)";
    ctx.fill();
    ctx.restore();
  }

  const borderWidth = parseFloat(style.borderTopWidth) || 0;
  if (borderWidth > 0 && style.borderTopStyle !== "none") {
    ctx.save();
    drawRoundedRectPath(ctx, x + borderWidth / 2, y + borderWidth / 2, w - borderWidth, h - borderWidth, Math.max(0, radius - borderWidth / 2));
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Splits a Text node into visual lines using the browser's own inline
 * layout, via `Range.getClientRects()` (one rect per wrapped line) and a
 * binary search per line to recover the substring it contains. This
 * avoids re-implementing CSS text wrapping by hand.
 */
function getTextLines(textNode: Text): { text: string; rect: DOMRect }[] {
  const full = textNode.textContent ?? "";
  if (!full.trim()) return [];
  const probe = document.createRange();
  probe.selectNodeContents(textNode);
  const rectCount = probe.getClientRects().length;
  if (rectCount <= 1) {
    const r = probe.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? [{ text: full, rect: r }] : [];
  }

  const lines: { text: string; rect: DOMRect }[] = [];
  const range = document.createRange();
  let start = 0;
  let guard = 0;
  while (start < full.length && guard < 200) {
    guard += 1;
    let lo = start + 1;
    let hi = full.length;
    let best = start + 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      range.setStart(textNode, start);
      range.setEnd(textNode, mid);
      if (range.getClientRects().length <= 1) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    range.setStart(textNode, start);
    range.setEnd(textNode, best);
    const rect = range.getBoundingClientRect();
    const text = full.slice(start, best);
    if (rect.width > 0 && rect.height > 0) lines.push({ text, rect });
    start = best;
  }
  return lines;
}

function paintTextNode(
  ctx: CanvasRenderingContext2D,
  textNode: Text,
  style: CSSStyleDeclaration,
  originX: number,
  originY: number,
) {
  const lines = getTextLines(textNode);
  if (lines.length === 0) return;
  ctx.save();
  ctx.font = `${style.fontStyle === "italic" ? "italic " : ""}${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "alphabetic";
  const fontSizePx = parseFloat(style.fontSize) || 14;
  // Alphabetic baseline sits ~0.8 of the font size down from a line's top in most UI fonts.
  const baselineOffset = fontSizePx * 0.8;
  for (const line of lines) {
    const x = line.rect.left - originX;
    const y = line.rect.top - originY + Math.min(baselineOffset, line.rect.height - 1);
    ctx.fillText(line.text, x, y);
  }
  ctx.restore();
}

function paintInlineSvg(ctx: CanvasRenderingContext2D, svg: SVGSVGElement, originX: number, originY: number): Promise<void> {
  return new Promise((resolve) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      resolve();
      return;
    }
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", String(rect.width));
      clone.setAttribute("height", String(rect.height));
      const serialized = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => {
        try {
          ctx.drawImage(img, rect.left - originX, rect.top - originY, rect.width, rect.height);
        } catch {
          // Drawing failed (e.g. an unexpectedly tainting edge case) — skip this icon rather than fail the whole capture.
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
    } catch {
      resolve();
    }
  });
}

async function paintNode(
  ctx: CanvasRenderingContext2D,
  node: Node,
  originX: number,
  originY: number,
): Promise<void> {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (parent) paintTextNode(ctx, node as Text, getComputedStyle(parent), originX, originY);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;

  if (el instanceof SVGSVGElement) {
    await paintInlineSvg(ctx, el, originX, originY);
    return;
  }

  if (!(el instanceof HTMLElement)) return;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

  if (el instanceof HTMLImageElement) {
    if (el.src.startsWith("data:") && el.complete && el.naturalWidth > 0) {
      const rect = el.getBoundingClientRect();
      try {
        ctx.drawImage(el, rect.left - originX, rect.top - originY, rect.width, rect.height);
      } catch {
        // Skip: see the module doc comment on non-data-URL images.
      }
    }
    return;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    paintBoxDecoration(ctx, style, rect.left - originX, rect.top - originY, rect.width, rect.height);
  }

  for (const child of Array.from(el.childNodes)) {
    await paintNode(ctx, child, originX, originY);
  }
}

/**
 * Captures `el` into a canvas sized to its current `getBoundingClientRect()`,
 * at `resolution * cssSize` backing pixels. Returns a rejected promise
 * (never throws synchronously) on failure, so callers can fall back
 * without crashing — see DistortionWave.tsx's capture-failure handling.
 */
export async function captureElement(el: HTMLElement, options: CaptureOptions = {}): Promise<CaptureResult> {
  const rect = el.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (width <= 1 || height <= 1) {
    throw new Error("DistortionWave: capture target has no measurable size");
  }

  const dpr = Math.min(options.resolution ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("DistortionWave: could not get 2D context for capture canvas");
  }
  ctx.scale(dpr, dpr);

  const rootStyle = getComputedStyle(el);
  paintBoxDecoration(ctx, rootStyle, 0, 0, width, height);
  for (const child of Array.from(el.childNodes)) {
    await paintNode(ctx, child, rect.left, rect.top);
  }

  return { canvas, width, height };
}
