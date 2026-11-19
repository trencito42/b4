import type { DistortionWavePalette } from "../types.js";

/**
 * The actual UV-displacement pipeline. Every texture sample in the
 * fragment shader below reads from a DISPLACED coordinate
 * (`refractedUv`), computed from the signed distance to the travelling
 * wavefront — not a static image with a blur/gradient painted over it.
 * This is what makes DistortionWave genuinely different from
 * RefractionSweep (nee the old DistortionWave): RefractionSweep's
 * `backdrop-filter` blurs real pixels but never moves WHERE they're
 * sampled from; this shader moves the sample coordinates themselves.
 */

export const VERTEX_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  // aPos is -1..1 clip space; vUv is 0..1 with (0,0) at the TOP-LEFT,
  // matching DOM/CSS convention (WaveGeometry.ts's originUv/axis are in
  // that same space) — the y-flip here, not a texture-upload flip,
  // reconciles clip space's bottom-left origin with that convention.
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAGMENT_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uOriginalTex;
uniform sampler2D uRevealedTex;
uniform bool uHasOriginalTex;
uniform bool uHasRevealedTex;

uniform vec2 uOriginUv;
uniform vec2 uAxis;
uniform float uFrontOffset;
uniform float uTravelExtent;
uniform int uMode; // 0 = linear, 1 = radial
uniform vec2 uAspectCorrection; // (1,1) for square containers; corrects circle/line math for non-square aspect

uniform float uLensWidth;
uniform float uAmplitude;
uniform float uChromaStrength;
uniform float uBlurStrength;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uParticleSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Signed distance from uv to the current wavefront: negative = behind
// the front (revealed side), positive = ahead of it (still original).
float signedDistanceToFront(vec2 uv) {
  vec2 d = (uv - uOriginUv) * uAspectCorrection;
  if (uMode == 1) {
    return length(d) - uFrontOffset;
  }
  vec2 axis = uAxis * uAspectCorrection;
  return dot(d, normalize(axis)) - uFrontOffset;
}

vec2 frontNormal(vec2 uv) {
  if (uMode == 1) {
    vec2 d = (uv - uOriginUv) * uAspectCorrection;
    float len = length(d);
    return len > 0.0001 ? d / len : vec2(0.0, -1.0);
  }
  return normalize(uAxis);
}

vec4 sampleBoth(vec2 uv, float reveal) {
  vec4 orig = uHasOriginalTex ? texture(uOriginalTex, uv) : vec4(0.0);
  vec4 rev = uHasRevealedTex ? texture(uRevealedTex, uv) : vec4(0.0);
  return mix(orig, rev, reveal);
}

void main() {
  float dist = signedDistanceToFront(vUv);
  // Gaussian influence band centered on the front — this is what makes
  // displacement/chroma/blur strongest right at the wavefront and fall
  // away smoothly on either side, instead of a hard-edged band.
  float influence = exp(-pow(dist / uLensWidth, 2.0));

  vec2 normal = frontNormal(vUv);
  // Primary lens push: along the front's own normal, scaled by influence
  // and signed by which side of the front this pixel is on (ahead pixels
  // sample further ahead, behind pixels sample further behind) — this is
  // the actual UV displacement, not a filter.
  vec2 displacement = normal * influence * uAmplitude * sign(dist + 0.0001);

  // A little cross-axis wobble so the front doesn't read as a perfectly
  // straight/circular line — real refraction isn't that clean.
  float wobblePhase = (uMode == 1) ? atan(vUv.y - uOriginUv.y, vUv.x - uOriginUv.x) * 3.0 : dot(vUv - uOriginUv, vec2(-uAxis.y, uAxis.x)) * 18.0;
  float wobble = sin(wobblePhase + uParticleSeed * 0.001) * 0.004 * influence;
  displacement += normal.yx * vec2(-1.0, 1.0) * wobble;

  // Reveal mask: which texture dominates at this (undisplaced) position.
  // A soft step centered on the front, not a hard cut, so the two
  // textures cross-fade across the lens band rather than meeting at a
  // razor edge.
  float reveal = 1.0 - smoothstep(-uLensWidth * 0.5, uLensWidth * 0.5, dist);

  // Chromatic aberration: three different displacement MAGNITUDES per
  // channel (not three different flat offsets over a static image) —
  // each channel samples BOTH source textures through its own displaced
  // coordinate, then the reveal mix happens per channel.
  float chroma = uChromaStrength * influence;
  vec2 uvR = vUv + displacement * (1.0 + chroma * 1.6);
  vec2 uvG = vUv + displacement * (1.0 + chroma * 0.4);
  vec2 uvB = vUv + displacement * (1.0 - chroma * 1.1);

  vec4 colR = sampleBoth(uvR, reveal);
  vec4 colG = sampleBoth(uvG, reveal);
  vec4 colB = sampleBoth(uvB, reveal);

  vec3 color = vec3(colR.r, colG.g, colB.b);
  float alphaOut = max(colG.a, 0.0);

  // Edge light: tint + brighten near the front, blended from two tokens
  // across the cross-axis so "colorful" reads as a gradient, not a flat
  // tint. Additive, so it only shows where influence is high.
  float crossAxisT = (uMode == 1)
    ? fract(wobblePhase / 6.2831853)
    : clamp(dot(vUv - uOriginUv, vec2(-uAxis.y, uAxis.x)) + 0.5, 0.0, 1.0);
  vec3 edgeColor = mix(uColorA, uColorB, crossAxisT);
  float edgeStrength = influence * (0.55 + 0.45 * sin(uParticleSeed * 0.003));
  color += edgeColor * edgeStrength * 0.6;

  // A thin bright specular hairline exactly at the front.
  float hairline = smoothstep(uLensWidth * 0.12, 0.0, abs(dist));
  color += vec3(1.0) * hairline * 0.5;

  // Subtle particles: sparse bright points within the influence band.
  vec2 cell = floor(vUv * 180.0);
  float sparkle = step(0.997, hash(cell + floor(uParticleSeed * 0.05))) * influence;
  color += edgeColor * sparkle * 1.5;

  fragColor = vec4(color, alphaOut);
}`;

const PALETTE_TOKEN_PAIRS: Record<DistortionWavePalette, [string, string]> = {
  colorful: ["var(--b4-accent-500)", "var(--b4-danger)"],
  mono: ["var(--b4-accent-500)", "var(--b4-accent-500)"],
  ocean: ["var(--b4-info)", "var(--b4-accent-500)"],
  sunset: ["var(--b4-warning)", "var(--b4-danger)"],
};

function parseRgb(computed: string): [number, number, number] {
  const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(computed);
  if (!match) return [1, 1, 1];
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
}

/**
 * Resolves a palette name to two actual RGB colors by setting each CSS
 * custom-property-valued token on a throwaway element and reading back
 * `getComputedStyle` — same technique `RefractionSweepCrest` uses, so the
 * shader's colors are always real, current-theme B4 tokens, never a
 * hardcoded hex, and stay correct across a live Graphite/Porcelain switch.
 */
export function resolvePalette(palette: DistortionWavePalette, probeEl: HTMLElement): [[number, number, number], [number, number, number]] {
  const [tokenA, tokenB] = PALETTE_TOKEN_PAIRS[palette];
  probeEl.style.color = tokenA;
  const colorA = parseRgb(getComputedStyle(probeEl).color);
  probeEl.style.color = tokenB;
  const colorB = parseRgb(getComputedStyle(probeEl).color);
  return [colorA, colorB];
}
