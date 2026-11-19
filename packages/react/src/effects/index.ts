/**
 * B4's advanced-effects entry point — imported separately
 * (`@b4/react/effects`) so ordinary components never pay for this
 * code. Effects here are opt-in, composable, and never auto-enabled
 * on core components.
 */
export { BorderBeam } from "./BorderBeam/BorderBeam.js";
export type { BorderBeamProps, BorderBeamSize, BorderBeamTone } from "./BorderBeam/BorderBeam.js";

export { DistortionWave } from "./DistortionWave/DistortionWave.js";
export type {
  DistortionWaveProps,
  DistortionWaveAmplitude,
  DistortionWaveDirection,
  DistortionWaveTone,
} from "./DistortionWave/DistortionWave.js";
