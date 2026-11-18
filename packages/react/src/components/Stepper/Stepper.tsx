export interface StepperStep {
  label: string;
  description?: string;
}

export type StepperOrientation = "horizontal" | "vertical";

export interface StepperProps {
  steps: readonly StepperStep[];
  /** 0-indexed. Steps before it are complete, this one is active, later ones are upcoming. */
  activeStep: number;
  orientation?: StepperOrientation;
  /** Required — the step list has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

const CheckIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="m3 8 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Wizard-style progress indicator: an ordered list of steps, each
 * complete/active/upcoming, read via `aria-current="step"` on the active
 * one rather than color alone. Pure presentational — no Base UI primitive
 * exists for multi-step progress.
 */
export function Stepper({ steps, activeStep, orientation = "horizontal", className, ...rest }: StepperProps) {
  return (
    <ol
      className={[
        "b4-stepper",
        `b4-stepper--${orientation}`,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {steps.map((step, index) => {
        const status = index < activeStep ? "complete" : index === activeStep ? "active" : "upcoming";
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.label}
            className={`b4-stepper__step b4-stepper__step--${status}`}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="b4-stepper__marker" aria-hidden="true">
              {status === "complete" ? CheckIcon : <span className="b4-stepper__marker-text">{index + 1}</span>}
            </span>
            <span className="b4-stepper__content">
              <span className="b4-stepper__label">{step.label}</span>
              {step.description && <span className="b4-stepper__description">{step.description}</span>}
            </span>
            {!isLast && <span className="b4-stepper__connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
