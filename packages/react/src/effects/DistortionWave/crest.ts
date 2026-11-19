/**
 * The WebGL2 program driving DistortionWave's chromatic/specular crest.
 *
 * Kept separate from DistortionWave.tsx so the shader source, uniform
 * wiring and GL lifecycle (init / resize / context-loss / dispose) read
 * as one unit instead of being interleaved with the React component.
 *
 * This renders the crest procedurally (RGB-channel-split specular core +
 * animated caustic-noise shimmer) — it does not sample a snapshot of the
 * DOM content behind it. The real pixel distortion in DistortionWave
 * comes from the separate `backdrop-filter` band in DistortionWave.css;
 * this canvas is the layer riding on top of that band, replacing what
 * used to be a flat CSS gradient "fringe" with an actually GPU-rendered
 * one. See docs/effects/DISTORTION_WAVE.md for what is and is not real
 * backdrop sampling here.
 */

const VERTEX_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec3 uColor;
uniform float uAmplitude;
uniform int uVertical;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = uVertical == 1 ? vUv.yx : vUv;

  float core = 1.0 - abs(uv.x - 0.5) * 2.0;
  core = pow(clamp(core, 0.0, 1.0), 2.2);

  float n1 = noise(vec2(uv.y * 11.0, uTime * 1.6));
  float n2 = noise(vec2(uv.y * 23.0 - uTime * 2.1, uTime * 0.7));
  float shimmer = 0.6 + 0.4 * (n1 * 0.6 + n2 * 0.4);

  float off = 0.05 * uAmplitude;
  float coreR = pow(clamp(1.0 - abs((uv.x - off) - 0.5) * 2.0, 0.0, 1.0), 2.2);
  float coreB = pow(clamp(1.0 - abs((uv.x + off) - 0.5) * 2.0, 0.0, 1.0), 2.2);

  vec3 chroma = vec3(coreR, core, coreB);
  float spec = smoothstep(0.1, 0.0, abs(uv.x - 0.5));

  vec3 color = uColor * chroma * shimmer + vec3(1.0) * spec * shimmer * 0.9;
  float alpha = core * shimmer * 0.85 + spec * 0.55;

  fragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}`;

interface CrestHandle {
  render: (timeSeconds: number, amplitude: number, vertical: boolean, colorRgb: [number, number, number]) => void;
  resize: (widthPx: number, heightPx: number) => void;
  dispose: () => void;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("DistortionWave: could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`DistortionWave: shader compile failed: ${info ?? "unknown error"}`);
  }
  return shader;
}

/** Returns null (never throws) when WebGL2 is unavailable — the caller
 * falls back to rendering nothing on the canvas rather than crashing. */
export function createCrestRenderer(canvas: HTMLCanvasElement): CrestHandle | null {
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const ctx = gl;

  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let buffer: WebGLBuffer | null = null;
  let uTime = -1;
  let uColor = -1;
  let uAmplitude = -1;
  let uVertical = -1;

  function init() {
    const vertexShader = compile(ctx, ctx.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compile(ctx, ctx.FRAGMENT_SHADER, FRAGMENT_SRC);
    const prog = ctx.createProgram();
    if (!prog) throw new Error("DistortionWave: could not create GL program");
    ctx.attachShader(prog, vertexShader);
    ctx.attachShader(prog, fragmentShader);
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
      const info = ctx.getProgramInfoLog(prog);
      ctx.deleteProgram(prog);
      throw new Error(`DistortionWave: program link failed: ${info ?? "unknown error"}`);
    }
    ctx.deleteShader(vertexShader);
    ctx.deleteShader(fragmentShader);
    program = prog;

    vao = ctx.createVertexArray();
    ctx.bindVertexArray(vao);
    buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    // Two triangles covering clip space [-1, 1].
    ctx.bufferData(
      ctx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      ctx.STATIC_DRAW,
    );
    const aPos = ctx.getAttribLocation(prog, "aPos");
    ctx.enableVertexAttribArray(aPos);
    ctx.vertexAttribPointer(aPos, 2, ctx.FLOAT, false, 0, 0);
    ctx.bindVertexArray(null);

    uTime = ctx.getUniformLocation(prog, "uTime") as unknown as number;
    uColor = ctx.getUniformLocation(prog, "uColor") as unknown as number;
    uAmplitude = ctx.getUniformLocation(prog, "uAmplitude") as unknown as number;
    uVertical = ctx.getUniformLocation(prog, "uVertical") as unknown as number;

    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
  }

  try {
    init();
  } catch {
    return null;
  }

  function resize(widthPx: number, heightPx: number) {
    if (canvas.width !== widthPx || canvas.height !== heightPx) {
      canvas.width = widthPx;
      canvas.height = heightPx;
    }
    ctx.viewport(0, 0, widthPx, heightPx);
  }

  function render(timeSeconds: number, amplitude: number, vertical: boolean, colorRgb: [number, number, number]) {
    if (!program) return;
    ctx.clearColor(0, 0, 0, 0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.useProgram(program);
    ctx.bindVertexArray(vao);
    ctx.uniform1f(uTime as unknown as WebGLUniformLocation, timeSeconds);
    ctx.uniform3f(uColor as unknown as WebGLUniformLocation, colorRgb[0], colorRgb[1], colorRgb[2]);
    ctx.uniform1f(uAmplitude as unknown as WebGLUniformLocation, amplitude);
    ctx.uniform1i(uVertical as unknown as WebGLUniformLocation, vertical ? 1 : 0);
    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    ctx.bindVertexArray(null);
  }

  function dispose() {
    if (ctx.isContextLost()) return;
    if (buffer) ctx.deleteBuffer(buffer);
    if (vao) ctx.deleteVertexArray(vao);
    if (program) ctx.deleteProgram(program);
  }

  return { render, resize, dispose };
}
