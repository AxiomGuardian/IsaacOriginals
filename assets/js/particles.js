/* ============================================================
   IsaacOriginals — Subtle Starfield (Three.js r128)
   Minimal, fast-loading. Gentle drift + soft twinkle only.
   ============================================================ */

(function () {
  'use strict';

  const container = document.getElementById('particles-container');
  if (!container) return;

  function init() {
    if (typeof THREE === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    const scene = new THREE.Scene();
    const w = container.clientWidth;
    const h = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const pr = Math.min(window.devicePixelRatio, 2);

    // --- Single starfield layer — clean and fast ---
    const count = 600;
    const positions = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      alphas[i] = 0.15 + Math.random() * 0.7;
      sizes[i] = 0.4 + Math.random() * 1.8;
      speeds[i] = 0.3 + Math.random() * 2.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pr }
      },
      vertexShader: `
        attribute float alpha;
        attribute float size;
        attribute float speed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vSpeed;

        void main() {
          vAlpha = alpha;
          vSpeed = speed;
          vec3 pos = position;
          pos.x += sin(uTime * 0.01 * speed + position.y * 0.08) * 1.0;
          pos.y += cos(uTime * 0.008 * speed + position.x * 0.06) * 0.7;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying float vAlpha;
        varying float vSpeed;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          float core = smoothstep(0.2, 0.0, d) * 0.5;
          float twinkle = 0.6 + 0.4 * sin(uTime * vSpeed * 0.6 + vAlpha * 60.0);
          float finalAlpha = (glow * 0.3 + core) * vAlpha * twinkle;
          gl_FragColor = vec4(0.95, 0.95, 1.0, finalAlpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(geo, mat));

    // --- Animation ---
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;
      mat.uniforms.uTime.value = time;
      camera.position.x = Math.sin(time * 0.015) * 1.0;
      camera.position.y = Math.cos(time * 0.01) * 0.5;
      renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 200);
    });
  }

  init();
})();
