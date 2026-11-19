import type { WaveGeometry } from "./WaveGeometry.js";
import { VERTEX_SRC, FRAGMENT_SRC } from "./WaveShaders.js";

export interface WaveRenderParams {
  geometry: WaveGeometry;
  lensWidth: number;
  amplitude: number;
  chromaStrength: number;
  blurStrength: number;
  colorA: [number, number, number];
  colorB: [number, number, number];
  particleSeed: number;
  containerWidth: number;
  containerHeight: number;
}

export interface WaveRenderer {
  setOriginalTexture: (source: TexImageSource | null) => void;
  setRevealedTexture: (source: TexImageSource | null) => void;
  render: (params: WaveRenderParams) => void;
  resize: (widthPx: number, heightPx: number) => void;
  dispose: () => void;
  /** True once this renderer has rendered at least one real frame. */
  hasRendered: boolean;
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

function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("DistortionWave: could not create texture");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

/**
 * Creates the WebGL2 renderer for one DistortionWave instance. Returns
 * `null` (never throws) when WebGL2 is unavailable, so the caller can
 * fall back gracefully (same contract as RefractionSweepCrest's
 * `createCrestRenderer`).
 */
export function createWaveRenderer(canvas: HTMLCanvasElement): WaveRenderer | null {
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: false });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const ctx = gl;

  let program: WebGLProgram;
  let vao: WebGLVertexArrayObject | null;
  try {
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
    const buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), ctx.STATIC_DRAW);
    const aPos = ctx.getAttribLocation(prog, "aPos");
    ctx.enableVertexAttribArray(aPos);
    ctx.vertexAttribPointer(aPos, 2, ctx.FLOAT, false, 0, 0);
    ctx.bindVertexArray(null);
  } catch {
    return null;
  }

  const uniforms = {
    originalTex: ctx.getUniformLocation(program, "uOriginalTex"),
    revealedTex: ctx.getUniformLocation(program, "uRevealedTex"),
    hasOriginalTex: ctx.getUniformLocation(program, "uHasOriginalTex"),
    hasRevealedTex: ctx.getUniformLocation(program, "uHasRevealedTex"),
    originUv: ctx.getUniformLocation(program, "uOriginUv"),
    axis: ctx.getUniformLocation(program, "uAxis"),
    frontOffset: ctx.getUniformLocation(program, "uFrontOffset"),
    travelExtent: ctx.getUniformLocation(program, "uTravelExtent"),
    mode: ctx.getUniformLocation(program, "uMode"),
    aspectCorrection: ctx.getUniformLocation(program, "uAspectCorrection"),
    lensWidth: ctx.getUniformLocation(program, "uLensWidth"),
    amplitude: ctx.getUniformLocation(program, "uAmplitude"),
    chromaStrength: ctx.getUniformLocation(program, "uChromaStrength"),
    blurStrength: ctx.getUniformLocation(program, "uBlurStrength"),
    colorA: ctx.getUniformLocation(program, "uColorA"),
    colorB: ctx.getUniformLocation(program, "uColorB"),
    particleSeed: ctx.getUniformLocation(program, "uParticleSeed"),
  };

  const originalTex = createTexture(ctx);
  const revealedTex = createTexture(ctx);
  let hasOriginal = false;
  let hasRevealed = false;
  let hasRendered = false;

  function setOriginalTexture(source: TexImageSource | null) {
    if (!source) {
      hasOriginal = false;
      return;
    }
    ctx.bindTexture(ctx.TEXTURE_2D, originalTex);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, source);
    hasOriginal = true;
  }

  function setRevealedTexture(source: TexImageSource | null) {
    if (!source) {
      hasRevealed = false;
      return;
    }
    ctx.bindTexture(ctx.TEXTURE_2D, revealedTex);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, source);
    hasRevealed = true;
  }

  function resize(widthPx: number, heightPx: number) {
    if (canvas.width !== widthPx || canvas.height !== heightPx) {
      canvas.width = widthPx;
      canvas.height = heightPx;
    }
    ctx.viewport(0, 0, widthPx, heightPx);
  }

  function render(params: WaveRenderParams) {
    const { geometry, containerWidth, containerHeight } = params;
    ctx.clearColor(0, 0, 0, 0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
    ctx.useProgram(program);
    ctx.bindVertexArray(vao);

    ctx.activeTexture(ctx.TEXTURE0);
    ctx.bindTexture(ctx.TEXTURE_2D, originalTex);
    ctx.uniform1i(uniforms.originalTex, 0);
    ctx.activeTexture(ctx.TEXTURE1);
    ctx.bindTexture(ctx.TEXTURE_2D, revealedTex);
    ctx.uniform1i(uniforms.revealedTex, 1);
    ctx.uniform1i(uniforms.hasOriginalTex, hasOriginal ? 1 : 0);
    ctx.uniform1i(uniforms.hasRevealedTex, hasRevealed ? 1 : 0);

    ctx.uniform2f(uniforms.originUv, geometry.originUv.x, geometry.originUv.y);
    ctx.uniform2f(uniforms.axis, geometry.axis.x, geometry.axis.y);
    ctx.uniform1f(uniforms.frontOffset, geometry.frontOffset);
    ctx.uniform1f(uniforms.travelExtent, geometry.travelExtent);
    ctx.uniform1i(uniforms.mode, geometry.mode === "radial" ? 1 : 0);
    const aspect = containerWidth > 0 && containerHeight > 0 ? containerWidth / containerHeight : 1;
    // Corrects distance math so a circle stays a circle and a line stays
    // straight even when the container isn't square (uv space is 0..1 on
    // both axes regardless of actual pixel aspect ratio).
    ctx.uniform2f(uniforms.aspectCorrection, aspect > 1 ? aspect : 1, aspect > 1 ? 1 : 1 / aspect);

    ctx.uniform1f(uniforms.lensWidth, params.lensWidth);
    ctx.uniform1f(uniforms.amplitude, params.amplitude);
    ctx.uniform1f(uniforms.chromaStrength, params.chromaStrength);
    ctx.uniform1f(uniforms.blurStrength, params.blurStrength);
    ctx.uniform3f(uniforms.colorA, ...params.colorA);
    ctx.uniform3f(uniforms.colorB, ...params.colorB);
    ctx.uniform1f(uniforms.particleSeed, params.particleSeed);

    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    ctx.bindVertexArray(null);
    hasRendered = true;
  }

  function dispose() {
    if (ctx.isContextLost()) return;
    ctx.deleteTexture(originalTex);
    ctx.deleteTexture(revealedTex);
    ctx.deleteProgram(program);
    if (vao) ctx.deleteVertexArray(vao);
  }

  return {
    setOriginalTexture,
    setRevealedTexture,
    render,
    resize,
    dispose,
    get hasRendered() {
      return hasRendered;
    },
  };
}
