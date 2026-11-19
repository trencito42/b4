import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Field } from "../Field/Field.js";
import { Popover } from "../Popover/Popover.js";
import { TextField } from "../TextField/TextField.js";
import { PickerTrigger } from "../../internal/PickerTrigger.js";

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
    h < 60 || h === 360
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
  const [lastEdit, setLastEdit] = useState<{ hex: string; hsv: Hsv }>();
  const [draft, setDraft] = useState<{ source: string; text: string }>();
  const [preview, setPreview] = useState<Hsv>();
  const [open, setOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const selected = lastEdit?.hex === hex ? lastEdit.hsv : hexToHsv(hex);
  const hsv = preview ?? selected ?? { h: 220, s: 60, v: 80 };
  const hexInput = draft?.source === hex ? draft.text : hex;

  function commit(next: Hsv) {
    const nextHex = hsvToHex(next);
    setLastEdit({ hex: nextHex, hsv: next });
    setDraft(undefined);
    if (value === undefined) setUncontrolledHex(nextHex);
    if (nextHex !== hex) onValueChange?.(nextHex);
  }

  function commitHexText(text: string) {
    const next = hexToHsv(text);
    if (next) {
      commit(next.s === 0 ? { ...next, h: hsv.h } : next);
    } else {
      setDraft({ source: hex, text });
    }
  }

  function colorAt(clientX: number, clientY: number) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return;
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
    return { h: hsv.h, s, v };
  }

  function handleAreaPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || pointer.current !== null) return;
    pointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPreview(colorAt(event.clientX, event.clientY));
  }

  function cancelPreview() {
    pointer.current = null;
    setPreview(undefined);
  }

  function handleAreaKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled || pointer.current !== null) return;
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
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            cancelPreview();
            setDraft(undefined);
          }
        }}
        trigger={
          <PickerTrigger
            disabled={disabled}
            className="b4-color-picker__trigger"
            startIcon={<span className="b4-color-picker__swatch" style={{ backgroundColor: hex }} aria-hidden="true" />}
          >
            {hex}
          </PickerTrigger>
        }
      >
        <div className="b4-color-picker__panel">
          <div
            ref={areaRef}
            className="b4-color-picker__area"
            style={{ backgroundColor: pureHueHex }}
            onPointerDown={handleAreaPointerDown}
            onPointerMove={(event) => {
              if (!disabled && pointer.current === event.pointerId) {
                setPreview(colorAt(event.clientX, event.clientY));
              }
            }}
            onPointerUp={(event) => {
              if (pointer.current !== event.pointerId) return;
              const next = colorAt(event.clientX, event.clientY);
              cancelPreview();
              if (next && !disabled) commit(next);
            }}
            onLostPointerCapture={(event) => {
              if (pointer.current === event.pointerId) cancelPreview();
            }}
          >
            <div className="b4-color-picker__area-white" />
            <div className="b4-color-picker__area-black" />
            <div
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label="Saturation and brightness"
              aria-valuenow={Math.round(hsv.s)}
              aria-valuetext={`Saturation ${Math.round(hsv.s)}%, brightness ${Math.round(hsv.v)}%`}
              className="b4-color-picker__area-thumb"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: preview ? hsvToHex(preview) : hex }}
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
