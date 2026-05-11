/* ============================================================
   IsaacOriginals — Subtle Starfield (Three.js r128)
   Minimal, fast-loading. Gentle drift + soft twinkle.
   Exposes __IO.initParticles / destroyParticles for SPA.
   ============================================================ */
(function () {
  'use strict';

  window.__IO = window.__IO || {};

  var renderer = null;
  var animId = null;

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer = null;
    }
  }

  function init() {
    destroy(); // clean up any previous instance

    var container = document.getElementById('particles-container');
    if (!container) return;
    if (typeof THREE === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    var scene = new THREE.Scene();
    var w = container.clientWidth;
    var h = container.clientHeight;
    var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
    camera.position.set(0, 0, 50);

    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    var pr = Math.min(window.devicePixelRatio, 2);
    var count = 600;
    var positions = new Float32Array(count * 3);
    var alphas = new Float32Array(count);
    var sizes = new Float32Array(count);
    var speeds = new Float32Array(count);

    for (var i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      alphas[i] = 0.15 + Math.random() * 0.7;
      sizes[i] = 0.4 + Math.random() * 1.8;
      speeds[i] = 0.3 + Math.random() * 2.0;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pr }
      },
      vertexShader: [
        'attribute float alpha;',
        'attribute float size;',
        'attribute float speed;',
        'uniform float uTime;',
        'uniform float uPixelRatio;',
        'varying float vAlpha;',
        'varying float vSpeed;',
        'void main() {',
        '  vAlpha = alpha;',
        '  vSpeed = speed;',
        '  vec3 pos = position;',
        '  pos.x += sin(uTime * 0.01 * speed + position.y * 0.08) * 1.0;',
        '  pos.y += cos(uTime * 0.008 * speed + position.x * 0.06) * 0.7;',
        '  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
        '  gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uTime;',
        'varying float vAlpha;',
        'varying float vSpeed;',
        'void main() {',
        '  float d = length(gl_PointCoord - 0.5);',
        '  if (d > 0.5) discard;',
        '  float glow = smoothstep(0.5, 0.0, d);',
        '  float core = smoothstep(0.2, 0.0, d) * 0.5;',
        '  float twinkle = 0.6 + 0.4 * sin(uTime * vSpeed * 0.6 + vAlpha * 60.0);',
        '  float finalAlpha = (glow * 0.3 + core) * vAlpha * twinkle;',
        '  gl_FragColor = vec4(0.95, 0.95, 1.0, finalAlpha * 0.6);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(geo, mat));

    var time = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.016;
      mat.uniforms.uTime.value = time;
      camera.position.x = Math.sin(time * 0.015) * 1.0;
      camera.position.y = Math.cos(time * 0.01) * 0.5;
      renderer.render(scene, camera);
    }
    animate();

    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        if (!renderer) return;
        var w2 = container.clientWidth;
        var h2 = container.clientHeight;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
      }, 200);
    });
  }

  // Init on load if container exists
  init();

  // Expose for SPA
  window.__IO.initParticles = init;
  window.__IO.destroyParticles = destroy;

})();
