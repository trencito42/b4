import { useRef, useState } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Field } from "../Field/Field.js";
import { FieldControl } from "../../internal/FieldControl.js";
import { SteppingInput } from "../../internal/SteppingInput.js";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";

export interface TimeValue {
  /** 0-23, always 24-hour internally regardless of the `use24Hour` display prop. */
  hours: number;
  minutes: number;
}

export interface TimePickerProps {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  value?: TimeValue | null;
  defaultValue?: TimeValue;
  onValueChange?: (value: TimeValue) => void;
  /** @default false — 12-hour with an AM/PM segmented control. */
  use24Hour?: boolean;
  className?: string;
}

const MinusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 8h10" strokeLinecap="round" />
  </svg>
);
const PlusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);

function to12Hour(hours24: number) {
  const meridiem: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour12, meridiem };
}

function from12Hour(hour12: number, meridiem: "AM" | "PM") {
  if (meridiem === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

/**
 * Two (or three, with AM/PM) real `NumberField`-style segments — the
 * same `Base UI NumberField` + `FieldControl`/`SteppingInput`/
 * `motionCompatibleProps` recipe `NumberField.tsx` uses, composed
 * directly (not the wrapped `NumberField` component, which brings its
 * own `Field` — nesting two of those inside this component's own
 * `Field` would double up labels/hints). Each segment gets real value
 * clamping and keyboard arrow-key stepping, not a fake increment/
 * decrement pair bolted onto a plain text input. AM/PM reuses
 * `SegmentedControl`, this library's own capsule toggle, rather than a
 * third ad hoc control.
 */
export function TimePicker({
  label,
  hideLabel,
  hint,
  error,
  disabled = false,
  required = false,
  value,
  defaultValue,
  onValueChange,
  use24Hour = false,
  className,
}: TimePickerProps) {
  const stepChangeHours = useRef(false);
  const stepChangeMinutes = useRef(false);
  const [uncontrolledValue, setUncontrolledValue] = useState<TimeValue>(
    defaultValue ?? { hours: 0, minutes: 0 },
  );
  const current = value ?? uncontrolledValue;
  const { hour12, meridiem } = to12Hour(current.hours);

  function emit(next: TimeValue) {
    setUncontrolledValue(next);
    onValueChange?.(next);
  }

  const STEP_REASONS = [
    "increment-press",
    "decrement-press",
    "keyboard",
    "scrub",
    "wheel",
  ];

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
    >
      <div className="b4-time-picker__row">
        <div className="b4-time-picker__segments" role="group" aria-label={label}>
          <BaseNumberField.Root
            min={use24Hour ? 0 : 1}
            max={use24Hour ? 23 : 12}
            value={use24Hour ? current.hours : hour12}
            format={{ minimumIntegerDigits: 2 }}
            disabled={disabled}
            required={required}
            onValueChange={(next, details) => {
              if (next === null) return;
              stepChangeHours.current = STEP_REASONS.includes(details.reason);
              emit({
                hours: use24Hour ? next : from12Hour(next, meridiem),
                minutes: current.minutes,
              });
            }}
          >
            <BaseNumberField.Group
              render={<FieldControl disabled={disabled} />}
              className={[
                "b4-text-field__control",
                "b4-time-picker__segment",
                error ? "b4-text-field__control--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <BaseNumberField.Decrement
                render={(props, state) => (
                  <IconButton
                    {...motionCompatibleProps(props)}
                    variant="ghost"
                    size="sm"
                    className="b4-field-action"
                    aria-label="Decrease hours"
                    icon={MinusIcon}
                    disabled={state.disabled}
                  />
                )}
              />
              <BaseNumberField.Input
                aria-label="Hours"
                className="b4-time-picker__input"
                render={(props, state) => (
                  <SteppingInput
                    {...motionCompatibleProps(props)}
                    // Base UI's NumberField.Input picks up an ambient
                    // `aria-labelledby` from the surrounding Field.Root
                    // context (the outer "label" prop, e.g. "Reminder
                    // time") regardless of this Input's own `aria-label` —
                    // `aria-labelledby` always wins over `aria-label` per
                    // the accname spec, so both segments would otherwise
                    // get the SAME name instead of "Hours"/"Minutes".
                    // Clearing it here lets this segment's own label win.
                    aria-labelledby={undefined}
                    numericValue={state.value}
                    stepChange={stepChangeHours.current}
                  />
                )}
              />
              <BaseNumberField.Increment
                render={(props, state) => (
                  <IconButton
                    {...motionCompatibleProps(props)}
                    variant="ghost"
                    size="sm"
                    className="b4-field-action"
                    aria-label="Increase hours"
                    icon={PlusIcon}
                    disabled={state.disabled}
                  />
                )}
              />
            </BaseNumberField.Group>
          </BaseNumberField.Root>

          <span className="b4-time-picker__separator" aria-hidden="true">
            :
          </span>

          <BaseNumberField.Root
            min={0}
            max={59}
            value={current.minutes}
            format={{ minimumIntegerDigits: 2 }}
            disabled={disabled}
            required={required}
            onValueChange={(next, details) => {
              if (next === null) return;
              stepChangeMinutes.current = STEP_REASONS.includes(details.reason);
              emit({ hours: current.hours, minutes: next });
            }}
          >
            <BaseNumberField.Group
              render={<FieldControl disabled={disabled} />}
              className={[
                "b4-text-field__control",
                "b4-time-picker__segment",
                error ? "b4-text-field__control--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <BaseNumberField.Decrement
                render={(props, state) => (
                  <IconButton
                    {...motionCompatibleProps(props)}
                    variant="ghost"
                    size="sm"
                    className="b4-field-action"
                    aria-label="Decrease minutes"
                    icon={MinusIcon}
                    disabled={state.disabled}
                  />
                )}
              />
              <BaseNumberField.Input
                aria-label="Minutes"
                className="b4-time-picker__input"
                render={(props, state) => (
                  <SteppingInput
                    {...motionCompatibleProps(props)}
                    aria-labelledby={undefined}
                    numericValue={state.value}
                    stepChange={stepChangeMinutes.current}
                  />
                )}
              />
              <BaseNumberField.Increment
                render={(props, state) => (
                  <IconButton
                    {...motionCompatibleProps(props)}
                    variant="ghost"
                    size="sm"
                    className="b4-field-action"
                    aria-label="Increase minutes"
                    icon={PlusIcon}
                    disabled={state.disabled}
                  />
                )}
              />
            </BaseNumberField.Group>
          </BaseNumberField.Root>
        </div>
        {!use24Hour && (
          <SegmentedControl
            aria-label="AM or PM"
            size="sm"
            disabled={disabled}
            value={meridiem}
            items={[
              { value: "AM", label: "AM" },
              { value: "PM", label: "PM" },
            ]}
            onValueChange={(nextMeridiem) => {
              emit({ hours: from12Hour(hour12, nextMeridiem), minutes: current.minutes });
            }}
          />
        )}
      </div>
    </Field>
  );
}
