/* ============================================================
   IsaacOriginals — Enhanced Starfield (Three.js r128)
   Deep, ambient, gloomy starfield with nebula glow, shooting
   stars, and atmospheric fog. Cinematic + immersive.
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

    // ─── STARFIELD (main layer) ──────────────────────────────
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 250;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      alphas[i] = 0.15 + Math.random() * 0.85;
      sizes[i] = 0.4 + Math.random() * 2.5;
      speeds[i] = 0.3 + Math.random() * 3.0;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const starMat = new THREE.ShaderMaterial({
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
          pos.x += sin(uTime * 0.015 * speed + position.y * 0.1) * 1.8;
          pos.y += cos(uTime * 0.01 * speed + position.x * 0.08) * 1.2;
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
          float core = smoothstep(0.2, 0.0, d) * 0.7;
          float twinkle = 0.5 + 0.5 * sin(uTime * vSpeed * 0.8 + vAlpha * 80.0);
          twinkle = mix(0.5, 1.0, twinkle);
          float finalAlpha = (glow * 0.5 + core) * vAlpha * twinkle;
          vec3 color = vec3(0.95, 0.95, 1.0);
          gl_FragColor = vec4(color, finalAlpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(starGeo, starMat));

    // ─── HERO STARS (bright layer) ───────────────────────────
    const heroCount = 50;
    const heroPos = new Float32Array(heroCount * 3);
    const heroAlpha = new Float32Array(heroCount);
    const heroSize = new Float32Array(heroCount);
    const heroSpeed = new Float32Array(heroCount);

    for (let i = 0; i < heroCount; i++) {
      heroPos[i * 3]     = (Math.random() - 0.5) * 200;
      heroPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      heroPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      heroAlpha[i] = 0.6 + Math.random() * 0.4;
      heroSize[i] = 3.0 + Math.random() * 4.0;
      heroSpeed[i] = 0.2 + Math.random() * 1.2;
    }

    const heroGeo = new THREE.BufferGeometry();
    heroGeo.setAttribute('position', new THREE.BufferAttribute(heroPos, 3));
    heroGeo.setAttribute('alpha', new THREE.BufferAttribute(heroAlpha, 1));
    heroGeo.setAttribute('size', new THREE.BufferAttribute(heroSize, 1));
    heroGeo.setAttribute('speed', new THREE.BufferAttribute(heroSpeed, 1));

    const heroMat = new THREE.ShaderMaterial({
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
          pos.x += sin(uTime * 0.008 * speed + position.z * 0.05) * 2.5;
          pos.y += cos(uTime * 0.006 * speed + position.x * 0.04) * 1.8;
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
          float core = smoothstep(0.12, 0.0, d) * 0.9;
          float pulse = 0.5 + 0.5 * sin(uTime * vSpeed * 0.35 + vAlpha * 50.0);
          float finalAlpha = (glow * 0.6 + core) * vAlpha * pulse;
          vec3 color = vec3(1.0, 0.97, 0.94);
          gl_FragColor = vec4(color, finalAlpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(heroGeo, heroMat));

    // ─── NEBULA FOG (ambient glow clouds) ────────────────────
    const nebulaCount = 25;
    const nebPos = new Float32Array(nebulaCount * 3);
    const nebAlpha = new Float32Array(nebulaCount);
    const nebSize = new Float32Array(nebulaCount);
    const nebSpeed = new Float32Array(nebulaCount);

    for (let i = 0; i < nebulaCount; i++) {
      nebPos[i * 3]     = (Math.random() - 0.5) * 200;
      nebPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      nebPos[i * 3 + 2] = -20 - Math.random() * 60;
      nebAlpha[i] = 0.3 + Math.random() * 0.7;
      nebSize[i] = 30 + Math.random() * 50;
      nebSpeed[i] = 0.1 + Math.random() * 0.5;
    }

    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute('alpha', new THREE.BufferAttribute(nebAlpha, 1));
    nebGeo.setAttribute('size', new THREE.BufferAttribute(nebSize, 1));
    nebGeo.setAttribute('speed', new THREE.BufferAttribute(nebSpeed, 1));

    const nebMat = new THREE.ShaderMaterial({
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
          pos.x += sin(uTime * 0.005 * speed) * 5.0;
          pos.y += cos(uTime * 0.004 * speed + 1.0) * 3.0;
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
          // Ultra-soft radial gradient — like a fog cloud
          float glow = smoothstep(0.5, 0.05, d);
          float breathe = 0.6 + 0.4 * sin(uTime * vSpeed * 0.15 + vAlpha * 30.0);
          float finalAlpha = glow * vAlpha * breathe * 0.035;
          vec3 color = vec3(0.7, 0.75, 1.0);
          gl_FragColor = vec4(color, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(nebGeo, nebMat));

    // ─── SHOOTING STARS ──────────────────────────────────────
    const shootMax = 5;
    const shootPositions = new Float32Array(shootMax * 3);
    const shootAlpha = new Float32Array(shootMax);
    const shootSize = new Float32Array(shootMax);
    const shootVel = [];
    const shootLife = new Float32Array(shootMax);
    const shootActive = new Uint8Array(shootMax);

    for (let i = 0; i < shootMax; i++) {
      shootPositions[i * 3] = 0;
      shootPositions[i * 3 + 1] = 0;
      shootPositions[i * 3 + 2] = 0;
      shootAlpha[i] = 0;
      shootSize[i] = 1.5;
      shootVel.push({ x: 0, y: 0 });
      shootLife[i] = 0;
      shootActive[i] = 0;
    }

    const shootGeo = new THREE.BufferGeometry();
    shootGeo.setAttribute('position', new THREE.BufferAttribute(shootPositions, 3));
    shootGeo.setAttribute('alpha', new THREE.BufferAttribute(shootAlpha, 1));
    shootGeo.setAttribute('size', new THREE.BufferAttribute(shootSize, 1));

    const shootMat = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: pr } },
      vertexShader: `
        attribute float alpha;
        attribute float size;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(1.0, 1.0, 1.0, glow * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    scene.add(new THREE.Points(shootGeo, shootMat));

    function spawnShootingStar(index) {
      const side = Math.random() > 0.5 ? 1 : -1;
      shootPositions[index * 3]     = side * (60 + Math.random() * 40);
      shootPositions[index * 3 + 1] = 20 + Math.random() * 40;
      shootPositions[index * 3 + 2] = -10 + Math.random() * 20;
      shootVel[index].x = -side * (1.5 + Math.random() * 2.0);
      shootVel[index].y = -(0.8 + Math.random() * 1.5);
      shootLife[index] = 1.0;
      shootActive[index] = 1;
      shootSize[index] = 1.0 + Math.random() * 2.0;
    }

    let nextShoot = 3 + Math.random() * 5;

    // ─── ANIMATION LOOP ─────────────────────────────────────
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      starMat.uniforms.uTime.value = time;
      heroMat.uniforms.uTime.value = time;
      nebMat.uniforms.uTime.value = time;

      // Shooting stars logic
      nextShoot -= 0.016;
      if (nextShoot <= 0) {
        for (let i = 0; i < shootMax; i++) {
          if (!shootActive[i]) {
            spawnShootingStar(i);
            break;
          }
        }
        nextShoot = 4 + Math.random() * 8;
      }

      for (let i = 0; i < shootMax; i++) {
        if (shootActive[i]) {
          shootPositions[i * 3]     += shootVel[i].x * 0.5;
          shootPositions[i * 3 + 1] += shootVel[i].y * 0.5;
          shootLife[i] -= 0.012;
          shootAlpha[i] = Math.max(0, shootLife[i]);
          if (shootLife[i] <= 0) {
            shootActive[i] = 0;
            shootAlpha[i] = 0;
          }
        }
      }
      shootGeo.attributes.position.needsUpdate = true;
      shootGeo.attributes.alpha.needsUpdate = true;

      // Subtle camera sway
      camera.position.x = Math.sin(time * 0.018) * 2.0;
      camera.position.y = Math.cos(time * 0.013) * 1.2;

      renderer.render(scene, camera);
    }
    animate();

    // ─── RESIZE ──────────────────────────────────────────────
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 150);
    });
  }

  init();
})();
