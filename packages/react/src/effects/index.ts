/**
 * B4's advanced-effects entry point — imported separately
 * (`@b4/react/effects`) so ordinary components never pay for this
 * code. Effects here are opt-in, composable, and never auto-enabled
 * on core components.
 *
 * `BorderBeam` and `DistortionWave` (a WebGL dual-view transition engine)
 * were removed per an explicit mission-brief decision: B4's priority is
 * one coherent, exceptionally polished component system, not a
 * decorative-effects engine. See CHANGELOG.md and HANDOFF.md for the
 * removal record — they are not an unfinished task to resurrect.
 */
export { RefractionSweep } from "./RefractionSweep/RefractionSweep.js";
export type {
  RefractionSweepProps,
  RefractionSweepAmplitude,
  RefractionSweepDirection,
  RefractionSweepTone,
} from "./RefractionSweep/RefractionSweep.js";
