// Mesh-warp animation: ONE untouched picture is drawn on a grid of triangles and the grid is bent over time
// (wings flap, arms swing, head nods, tail waves, body breathes) - nothing is cut out of the picture.
// Every <canvas class="mwarp" data-src="..." data-m="N"> in the page is drawn here, all sharing one WebGL context.
(() => {
  const SIZE = 768, GRID = 48, MAXB = 8;
  const FIX = new URLSearchParams(location.search).get('mwt'); // ?mwt=<ms> freezes time (used for screenshots)
  if (FIX !== null) window.__mwTime = Number(FIX);
  const gc = document.createElement('canvas'); gc.width = gc.height = SIZE;
  const gl = gc.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
  if (!gl) { window.MWARP = { ok: false }; return; }

  const VS = `
    attribute vec2 a_uv;
    uniform vec4 u_b0[${MAXB}]; // pivot.x, pivot.y, angle, ramp start
    uniform vec4 u_b1[${MAXB}]; // region x0, y0, x1, y1
    uniform vec4 u_b2[${MAXB}]; // edge softness, move x, move y, scale
    uniform vec4 u_b3[${MAXB}]; // ramp end
    varying vec2 v_uv;
    float edge(float v, float a, float b, float s) { return smoothstep(a, a + s, v) * (1.0 - smoothstep(b - s, b, v)); }
    void main() {
      vec2 q = a_uv;
      for (int i = 0; i < ${MAXB}; i++) {
        vec4 b0 = u_b0[i], b1 = u_b1[i], b2 = u_b2[i];
        float s = max(b2.x, 0.0001);
        float w = edge(a_uv.x, b1.x, b1.z, s) * edge(a_uv.y, b1.y, b1.w, s);
        float d = length(a_uv - b0.xy);
        w *= mix(1.0, smoothstep(b0.w, u_b3[i].x, d), step(b0.w + 0.0001, u_b3[i].x));   // joint stays still, the far end moves most
        float c = cos(b0.z * w), sn = sin(b0.z * w);
        vec2 r = q - b0.xy;
        r = vec2(c * r.x - sn * r.y, sn * r.x + c * r.y) * (1.0 + b2.w * w);
        q = b0.xy + r + b2.yz * w;
      }
      v_uv = a_uv;
      gl_Position = vec4(q.x * 2.0 - 1.0, 1.0 - q.y * 2.0, 0.0, 1.0);
    }`;
  const FS = `precision mediump float; uniform sampler2D u_tex; varying vec2 v_uv; void main() { gl_FragColor = texture2D(u_tex, v_uv); }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);

  // grid mesh
  const uv = [], idx = [];
  for (let y = 0; y <= GRID; y++) for (let x = 0; x <= GRID; x++) uv.push(x / GRID, y / GRID);
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) { const a = y * (GRID + 1) + x, b = a + 1, c = a + GRID + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_uv'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uB = [U('u_b0'), U('u_b1'), U('u_b2'), U('u_b3')];
  gl.viewport(0, 0, SIZE, SIZE); gl.clearColor(0, 0, 0, 0); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);

  // textures
  const tex = {};
  function texture(src) {
    if (tex[src]) return tex[src].ready ? tex[src].t : null;
    const t = gl.createTexture(); tex[src] = { t, ready: false };
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tex[src].ready = true;
    };
    img.src = src;
    return null;
  }

  // a bone = { p:[x,y] pivot, a: angle (rad), box:[x0,y0,x1,y1] region, soft, mv:[x,y], sc, r:[r0,r1] }
  const bone = (o) => Object.assign({ p: [0.5, 0.5], a: 0, box: [0, 0, 1, 1], soft: 0.03, mv: [0, 0], sc: 0, r: [0, 0] }, o);
  const S = Math.sin;
  const RIGS = {
    // 2 = the Accuser (muscular red demon), 6 = the Great Dragon. Coordinates are 0..1 over the picture, y down.
    1: (t, k) => [
      bone({ p: [0.5, 1], box: [0, 0, 1, 1], soft: 0.001, sc: 0.012 * S(t * 2.0) }),                                                     // breathing
      bone({ p: [0.5, 0.41], box: [0.3, 0, 0.7, 0.42], soft: 0.035, a: 0.03 * S(t * 2.2) - 0.02 * k, mv: [0, -0.008 * S(t * 2.2 + 1) - 0.01 * k] }), // head
      bone({ p: [0.28, 0.3], box: [0.06, 0.26, 0.34, 0.86], soft: 0.03, a: (0.035 + 0.05 * k) * S(t * (2.4 + 3 * k)), r: [0.03, 0.28] }),   // left arm
      bone({ p: [0.72, 0.3], box: [0.66, 0.26, 0.94, 0.86], soft: 0.03, a: -(0.035 + 0.05 * k) * S(t * (2.4 + 3 * k) + 1.1), r: [0.03, 0.28] }), // right arm
      bone({ p: [0.56, 0.78], box: [0.54, 0.7, 0.92, 0.92], soft: 0.03, a: 0.09 * S(t * 3.0), r: [0.03, 0.24] }),                      // tail
    ],
    5: (t, k) => [
      bone({ p: [0.5, 1], box: [0, 0, 1, 1], soft: 0.001, sc: 0.013 * S(t * 2.1) }),                                                      // breathing
      bone({ p: [0.36, 0.46], box: [0, 0.03, 0.4, 0.6], soft: 0.04, a: (0.07 + 0.05 * k) * S(t * (3.6 + 2 * k)), r: [0.03, 0.2] }),     // left wing
      bone({ p: [0.64, 0.46], box: [0.6, 0.03, 1, 0.6], soft: 0.04, a: -(0.07 + 0.05 * k) * S(t * (3.6 + 2 * k)), r: [0.03, 0.2] }),    // right wing
      bone({ p: [0.5, 0.4], box: [0.32, 0, 0.68, 0.43], soft: 0.035, a: 0.022 * S(t * 2.0 + 0.5) - 0.03 * k, mv: [0, -0.006 * S(t * 2.0) - 0.012 * k] }), // head
      bone({ p: [0.3, 0.9], box: [0, 0.74, 0.34, 1], soft: 0.03, a: 0.07 * S(t * 2.6 + 1), r: [0.03, 0.26] }),                          // tail
    ],
  };

  const buf = [new Float32Array(MAXB * 4), new Float32Array(MAXB * 4), new Float32Array(MAXB * 4), new Float32Array(MAXB * 4)];
  function render(m, src, t, k) {
    const tx = texture(src); if (!tx) return false;
    const bones = (RIGS[m] ? RIGS[m](t, k) : []).slice(0, MAXB);
    buf.forEach((a) => a.fill(0));
    bones.forEach((b, i) => {
      buf[0].set([b.p[0], b.p[1], b.a, b.r[0]], i * 4);
      buf[1].set(b.box, i * 4);
      buf[2].set([b.soft, b.mv[0], b.mv[1], b.sc], i * 4);
      buf[3].set([b.r[1], 0, 0, 0], i * 4);
    });
    for (let i = bones.length; i < MAXB; i++) buf[1].set([2, 2, 3, 3], i * 4); // unused bones: empty region
    for (let j = 0; j < 4; j++) gl.uniform4fv(uB[j], buf[j]);
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    return true;
  }

  const smooth = new WeakMap(); // per canvas: eased "attack" amount 0..1
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const T = (window.__mwTime != null ? window.__mwTime : now) / 1000;
    const dt = now - last; last = now;
    for (const c of document.querySelectorAll('canvas.mwarp')) {
      if (!c.isConnected || c.offsetParent === null) continue;
      const w = c.clientWidth; if (!w) continue;
      const small = w < 90;
      if (small && Math.floor(now / 80) === c.__lastTick) continue; // thumbnails: ~12 fps
      c.__lastTick = Math.floor(now / 80);
      const px = Math.min(SIZE, Math.max(64, Math.round(w * (window.devicePixelRatio || 1))));
      if (c.width !== px) { c.width = c.height = px; }
      const attacking = c.parentElement && c.parentElement.classList.contains('attack');
      const kPrev = smooth.get(c) || 0, k = kPrev + ((attacking ? 1 : 0) - kPrev) * Math.min(1, dt / 120);
      smooth.set(c, k);
      const ph = parseFloat(c.dataset.phase || (c.dataset.phase = FIX !== null ? '0' : (Math.random() * 6).toFixed(2)));
      if (render(Number(c.dataset.m), c.dataset.src, T + ph, k)) {
        const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(gc, 0, 0, c.width, c.height);
      }
    }
  }
  requestAnimationFrame(frame);
  window.MWARP = { ok: true };
})();
