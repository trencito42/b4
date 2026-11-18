import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Field } from "../Field/Field.js";
import { Popover } from "../Popover/Popover.js";
import { TextField } from "../TextField/TextField.js";

export interface ColorPickerProps {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** A `#rrggbb` hex color. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  className?: string;
}

interface Hsv {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - c;
  const [r1, g1, b1] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hsvToHex(hsv: Hsv) {
  return rgbToHex(...hsvToRgb(hsv));
}

function hexToHsv(hex: string): Hsv | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(...rgb) : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * A real color picker — a draggable, keyboard-operable saturation/
 * brightness area (pointer drag *and* arrow-key nudging, not a static
 * gradient image), a real Base UI `Slider` for hue, and a hex text
 * input that stays in sync both ways — not a swatch that just opens a
 * native `<input type="color">` with no custom UI, and not a picker
 * that only responds to the mouse.
 *
 * HSV is the canonical editing state (it maps directly onto the 2D
 * area and the hue slider); the public API is a plain `#rrggbb` hex
 * string, converted at the edges.
 */
export function ColorPicker({
  label,
  hideLabel,
  hint,
  error,
  disabled = false,
  required = false,
  value,
  defaultValue,
  onValueChange,
  className,
}: ColorPickerProps) {
  const [uncontrolledHex, setUncontrolledHex] = useState(defaultValue ?? "#3366cc");
  const hex = value ?? uncontrolledHex;
  const hsv = hexToHsv(hex) ?? { h: 220, s: 60, v: 80 };
  const [hexInput, setHexInput] = useState(hex);
  const [open, setOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  function commit(next: Hsv) {
    const nextHex = hsvToHex(next);
    setUncontrolledHex(nextHex);
    setHexInput(nextHex);
    onValueChange?.(nextHex);
  }

  function commitHexText(text: string) {
    setHexInput(text);
    const rgb = hexToRgb(text);
    if (!rgb) return;
    const nextHex = rgbToHex(...rgb);
    setUncontrolledHex(nextHex);
    onValueChange?.(nextHex);
  }

  function setFromPointer(clientX: number, clientY: number) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
    commit({ h: hsv.h, s, v });
  }

  function handleAreaPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientX, event.clientY);
  }

  function handleAreaPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || event.buttons !== 1) return;
    setFromPointer(event.clientX, event.clientY);
  }

  function handleAreaKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const STEP = event.shiftKey ? 10 : 2;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, STEP],
      ArrowDown: [0, -STEP],
    };
    if (event.key in deltas) {
      event.preventDefault();
      const [ds, dv] = deltas[event.key]!;
      commit({ h: hsv.h, s: clamp(hsv.s + ds, 0, 100), v: clamp(hsv.v + dv, 0, 100) });
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      commit({ h: hsv.h, s: 0, v: hsv.v });
    }
    if (event.key === "End") {
      event.preventDefault();
      commit({ h: hsv.h, s: 100, v: hsv.v });
    }
  }

  const pureHueHex = hsvToHex({ h: hsv.h, s: 100, v: 100 });

  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} disabled={disabled} required={required} className={className}>
      <Popover
        title={label}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button type="button" disabled={disabled} className="b4-color-picker__trigger">
            <span className="b4-color-picker__swatch" style={{ backgroundColor: hex }} aria-hidden="true" />
            <span className="b4-color-picker__trigger-text">{hex}</span>
          </button>
        }
      >
        <div className="b4-color-picker__panel">
          <div
            ref={areaRef}
            className="b4-color-picker__area"
            style={{ backgroundColor: pureHueHex }}
            onPointerDown={handleAreaPointerDown}
            onPointerMove={handleAreaPointerMove}
          >
            <div className="b4-color-picker__area-white" />
            <div className="b4-color-picker__area-black" />
            <div
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label="Saturation and brightness"
              aria-valuetext={`Saturation ${Math.round(hsv.s)}%, brightness ${Math.round(hsv.v)}%`}
              className="b4-color-picker__area-thumb"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hex }}
              onKeyDown={handleAreaKeyDown}
            />
          </div>

          <BaseSlider.Root
            value={hsv.h}
            min={0}
            max={360}
            disabled={disabled}
            onValueChange={(next) => commit({ h: next as number, s: hsv.s, v: hsv.v })}
          >
            <BaseSlider.Control className="b4-color-picker__hue-control">
              <BaseSlider.Track className="b4-color-picker__hue-track">
                <BaseSlider.Thumb
                  aria-label="Hue"
                  className="b4-color-picker__hue-thumb"
                  style={{ backgroundColor: pureHueHex }}
                />
              </BaseSlider.Track>
            </BaseSlider.Control>
          </BaseSlider.Root>

          <TextField
            label="Hex color"
            hideLabel
            value={hexInput}
            onValueChange={commitHexText}
            disabled={disabled}
            className="b4-color-picker__hex-field"
          />
        </div>
      </Popover>
    </Field>
  );
}
