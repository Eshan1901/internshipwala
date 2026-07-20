import { useEffect, useRef } from 'react';
import './AuthLayout.css';

/**
 * Initialises a WebGL teal glow shader on the given canvas element.
 * The shader produces a floating, pulsing teal orb that drifts across the
 * dark left panel, providing an animated, futuristic atmosphere.
 */
function initShader(canvas) {
  if (!canvas) return;

  function syncSize() {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;

    void main() {
      vec2 uv = v_texCoord;
      vec2 center = vec2(0.5, 0.5);
      vec2 movement = vec2(
        sin(u_time * 0.4) * 0.15,
        cos(u_time * 0.3) * 0.15
      );
      float dist = distance(uv, center + movement);
      float pulse = 0.5 + 0.5 * sin(u_time * 0.6);
      float glow = exp(-dist * 3.5 * (1.2 - 0.1 * pulse));
      vec3 teal = vec3(0.058, 0.462, 0.431);
      vec3 blue = vec3(0.1, 0.3, 0.6);
      vec3 color = mix(teal, blue, 0.2) * glow;
      float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      color += noise * 0.015;
      gl_FragColor = vec4(color, color.r * 0.7);
    }
  `;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');

  let animId;
  function render(t) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animId = requestAnimationFrame(render);
  }
  render(0);

  return () => cancelAnimationFrame(animId);
}

export default function AuthLayout({ children, title, subtitle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cleanup = initShader(canvasRef.current);
    return cleanup;
  }, []);

  return (
    <div className="auth-container">
      {/* ─── Visual / Branding Left Panel ─── */}
      <div className="auth-info-panel">
        {/* Grid pattern overlay */}
        <div className="auth-info-panel__grid" />

        {/* Animated WebGL shader — floating teal orb */}
        <div className="auth-shader-canvas">
          <canvas ref={canvasRef} />
        </div>

        {/* Top — Brand */}
        <div className="auth-info-panel__content">
          <div className="auth-info-logo">
            <div className="auth-info-logo__icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span>
              Internship<span className="auth-gradient-text">Wala</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="auth-info-title">
            Unlock the gateway to your{' '}
            <span className="auth-gradient-text">dream career.</span>
          </h2>

          {/* Benefit cards — glassmorphism */}
          <div className="auth-benefits">
            <div className="auth-benefit">
              <div className="benefit-icon-wrap">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <h4>Practical Project Portfolio</h4>
                <p>Work on industry-aligned assignments curated by experts.</p>
              </div>
            </div>
            <div className="auth-benefit">
              <div className="benefit-icon-wrap">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div>
                <h4>Verified Certifications</h4>
                <p>Sharable digital credentials trusted by core enterprises.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — Copyright */}
        <div className="auth-info-footer">
          © {new Date().getFullYear()} InternshipWala. Empowering student careers globally.
        </div>
      </div>

      {/* ─── Form / Interactive Right Panel ─── */}
      <div className="auth-form-panel">
        <div className="auth-form-card animate-scale-in">
          {/* Mobile branding (hidden on desktop) */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-brand__icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div className="auth-mobile-brand__text">
              Internship<span>Wala</span>
            </div>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
