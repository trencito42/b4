/**
 * Captures a DOM subtree into a Canvas2D image: the SVG `foreignObject`
 * pipeline described in the mission brief. There is no generic
 * "screenshot this element" browser API, so this walks the live subtree,
 * clones it, inlines the computed styles that actually affect its visual
 * output, serializes the clone as XHTML inside an SVG `foreignObject`,
 * rasterizes that SVG via an `<img>`, and draws the result to a canvas.
 *
 * Explicit, stated scope (read before assuming this is a universal
 * html2canvas replacement): it supports the kind of content B4 components
 * themselves produce — text, simple box layout, backgrounds, borders,
 * border-radius, box-shadow, simple gradients, inline SVG icons — because
 * it inlines a curated property allowlist (see STYLE_PROPERTIES below),
 * not every CSS property. It does NOT support: `<canvas>`/`<video>`
 * content (their pixels aren't part of the DOM to clone), cross-origin
 * images without CORS headers (browser security, not a bug here), CSS
 * `@keyframes`/transitions mid-flight (captured at whatever state they're
 * in when `captureElement` runs), iframes, or shadow DOM content (not
 * traversed). See docs/effects/DISTORTION_WAVE.md for the full list.
 */

const STYLE_PROPERTIES = [
  "display",
  "position",
  "boxSizing",
  "width",
  "height",
  "margin",
  "padding",
  "border",
  "borderRadius",
  "background",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "boxShadow",
  "color",
  "font",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textDecoration",
  "textTransform",
  "whiteSpace",
  "overflow",
  "flexDirection",
  "flexWrap",
  "alignItems",
  "justifyContent",
  "gap",
  "gridTemplateColumns",
  "gridTemplateRows",
  "opacity",
  "transform",
  "zIndex",
  "verticalAlign",
  "objectFit",
] as const;

function inlineComputedStyles(live: Element, clone: Element) {
  if (!(live instanceof HTMLElement) || !(clone instanceof HTMLElement)) return;
  const computed = getComputedStyle(live);
  const declarations: string[] = [];
  for (const prop of STYLE_PROPERTIES) {
    const value = computed[prop as keyof CSSStyleDeclaration];
    if (typeof value === "string" && value) {
      const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      declarations.push(`${kebab}: ${value}`);
    }
  }
  clone.setAttribute("style", declarations.join("; "));

  const liveChildren = Array.from(live.children);
  const cloneChildren = Array.from(clone.children);
  for (let i = 0; i < liveChildren.length; i++) {
    const liveChild = liveChildren[i];
    const cloneChild = cloneChildren[i];
    if (liveChild && cloneChild) inlineComputedStyles(liveChild, cloneChild);
  }
}

export interface CaptureOptions {
  /** Backing-store resolution multiplier. @default min(devicePixelRatio, 2) */
  resolution?: number;
}

export interface CaptureResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/**
 * Captures `el` into a canvas sized to its current `getBoundingClientRect()`,
 * at `resolution * cssSize` backing pixels. Returns a rejected promise
 * (never throws synchronously) on failure, so callers can fall back
 * without crashing — see DistortionWave.tsx's capture-failure handling.
 */
export function captureElement(el: HTMLElement, options: CaptureOptions = {}): Promise<CaptureResult> {
  return new Promise((resolve, reject) => {
    try {
      const rect = el.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (width <= 1 || height <= 1) {
        reject(new Error("DistortionWave: capture target has no measurable size"));
        return;
      }

      const clone = el.cloneNode(true) as HTMLElement;
      inlineComputedStyles(el, clone);
      clone.removeAttribute("id");
      clone.style.margin = "0";
      clone.style.position = "static";
      // Required so the foreignObject's SVG parser treats this subtree as
      // HTML rather than falling back to the SVG namespace it's embedded
      // in — a detached clone doesn't inherit this from the live document.
      clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

      const serializer = new XMLSerializer();
      const xhtml = serializer.serializeToString(clone);

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<foreignObject width="100%" height="100%">
${xhtml}
</foreignObject>
</svg>`;

      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const dpr = Math.min(options.resolution ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), 2);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("DistortionWave: could not get 2D context for capture canvas"));
          return;
        }
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ canvas, width, height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("DistortionWave: failed to rasterize DOM capture (unsupported content or security restriction)"));
      };
      img.src = url;
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
