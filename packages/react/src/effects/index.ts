/**
 * B4's advanced-effects entry point — imported separately
 * (`@b4/react/effects`) so ordinary components never pay for this
 * code. Effects here are opt-in, composable, and never auto-enabled
 * on core components.
 */
export { BorderBeam } from "./BorderBeam/BorderBeam.js";
export type { BorderBeamProps, BorderBeamSize, BorderBeamTone } from "./BorderBeam/BorderBeam.js";

export { RefractionSweep } from "./RefractionSweep/RefractionSweep.js";
export type {
  RefractionSweepProps,
  RefractionSweepAmplitude,
  RefractionSweepDirection,
  RefractionSweepTone,
} from "./RefractionSweep/RefractionSweep.js";

export { DistortionWave } from "./DistortionWave/DistortionWave.js";
export type {
  DistortionWaveProps,
  DistortionWaveType,
  DistortionWavePalette,
  DistortionWaveHandle,
  DistortionWaveSource,
} from "./DistortionWave/types.js";
/**
 * Exposed for debugging, testing, and consumers who want to run the
 * built-in capture pipeline themselves (e.g. to pre-warm a cache, or to
 * implement the `capture` override prop by wrapping this). Not part of
 * the polished public surface — its return shape may still change.
 */
export { captureElement } from "./DistortionWave/internal/DomCapture.js";
