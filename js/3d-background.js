// Check if WebGL is supported by the user's browser/system
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// Safely patch THREE if WebGL is not available to prevent crashes in tool page hero scenes
function patchThreeJS() {
  if (isWebGLAvailable()) return;

  const applyMock = (threeObj) => {
    if (!threeObj || threeObj.__webglMocked) return;
    threeObj.__webglMocked = true;
    
    console.warn("Mocking THREE.WebGLRenderer for systems without WebGL support to prevent page load crashes.");
    threeObj.WebGLRenderer = function() {
      return {
        setSize: () => {},
        setPixelRatio: () => {},
        render: () => {},
        dispose: () => {},
        domElement: document.createElement('div') // Return a safe dummy div element
      };
    };
  };

  if (window.THREE) {
    applyMock(window.THREE);
  } else {
    let tempThree = null;
    Object.defineProperty(window, 'THREE', {
      get() { return tempThree; },
      set(val) {
        tempThree = val;
        applyMock(tempThree);
      },
      configurable: true
    });
  }
}

// Run the patcher immediately upon module evaluation
patchThreeJS();

// Dynamically load Three.js if WebGL is available and Three.js is not already present
function loadThreeJS() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Three.js script from CDN"));
    document.head.appendChild(script);
  });
}

// Injects custom CSS fallback keyframes into the document head
function injectCSSFallbackStyles() {
  if (document.getElementById('bg-css-fallback-styles')) return;
  const style = document.createElement('style');
  style.id = 'bg-css-fallback-styles';
  style.textContent = `
    .fallback-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: -1;
      background: #050510;
    }
    .fallback-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(0, 204, 255, 0.3);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0, 204, 255, 0.6);
      pointer-events: none;
      animation: floatFallback 16s infinite ease-in-out;
    }
    @keyframes floatFallback {
      0%, 100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.1;
      }
      50% {
        transform: translate(var(--x, 150px), var(--y, -150px)) scale(1.5);
        opacity: 0.6;
      }
    }
  `;
  document.head.appendChild(style);
}

// Render fallback CSS animated particles
function initCSSFallback(container) {
  try {
    injectCSSFallbackStyles();
    container.innerHTML = ''; // Clear container

    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'fallback-container';

    // Create 40 floating dots
    const dotsCount = 40;
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'fallback-dot';
      
      // Random coordinates and custom floats
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const moveX = (Math.random() - 0.5) * 300;
      const moveY = (Math.random() - 0.5) * 300;
      const delay = Math.random() * -16; // Start animations at random intervals
      const duration = 10 + Math.random() * 12;

      dot.style.top = `${top}%`;
      dot.style.left = `${left}%`;
      dot.style.setProperty('--x', `${moveX}px`);
      dot.style.setProperty('--y', `${moveY}px`);
      dot.style.animationDelay = `${delay}s`;
      dot.style.animationDuration = `${duration}s`;

      fallbackDiv.appendChild(dot);
    }

    container.appendChild(fallbackDiv);
    console.log("CSS particle background fallback active.");
  } catch (err) {
    console.warn("Could not load CSS fallback background", err);
  }
}

// Core background initialization wrapper (Wraps in try/catch to NEVER throw uncaught crashes)
export async function initBackground(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    // 1. Check if WebGL works
    if (!isWebGLAvailable()) {
      throw new Error("WebGL is not supported or is disabled on this system");
    }

    // 2. Load Three.js library
    await loadThreeJS();

    // 3. Initialize WebGL Scene
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';

    container.innerHTML = ''; // Safely clear container of past nodes
    container.appendChild(canvas);

    // Particle settings
    const particleCount = 100; // Optimized size
    const points = [];
    const velocities = [];
    const minDistance = 110;

    // Geometry
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 600;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      points.push(new THREE.Vector3(x, y, z));
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ));
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Canvas Dot Texture
    const canvasDot = document.createElement('canvas');
    canvasDot.width = 16;
    canvasDot.height = 16;
    const ctx = canvasDot.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(0, 204, 255, 1)');
    grad.addColorStop(1, 'rgba(0, 102, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvasDot);

    const particleMaterial = new THREE.PointsMaterial({
      size: 5,
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Dynamic Connections Line Material
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0066FF,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });

    const maxLines = 400;
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Parallax dynamics
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Frame scale resize handler
    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Render loop ticker
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth parallax camera offset
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      scene.rotation.y += 0.0002;
      scene.rotation.x += 0.0001;

      // Update particle positions
      const posAttr = particleGeometry.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        const pt = points[i];
        const vel = velocities[i];

        pt.add(vel);

        // Reflect off boundary box bounds
        if (Math.abs(pt.x) > 400) vel.x = -vel.x;
        if (Math.abs(pt.y) > 300) vel.y = -vel.y;
        if (Math.abs(pt.z) > 300) vel.z = -vel.z;

        posAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;

      // Connect near dots with lines
      let lineIdx = 0;
      const linePosAttr = lineGeometry.getAttribute('position');

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dist = points[i].distanceTo(points[j]);
          if (dist < minDistance && lineIdx < maxLines) {
            linePosAttr.setXYZ(lineIdx * 2, points[i].x, points[i].y, points[i].z);
            linePosAttr.setXYZ(lineIdx * 2 + 1, points[j].x, points[j].y, points[j].z);
            lineIdx++;
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIdx * 2);
      linePosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();
    
    // Attach standard namespace cleanup method
    window.cleanup3DBackground = () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      canvas.remove();
    };

  } catch (err) {
    console.error("Three.js WebGL background initialization failed. Reverting to CSS animated dots fallback.", err);
    initCSSFallback(container);
  }
}

// Expose dynamically both globally (window namespace) and as modular ES module
window.initBackground = initBackground;
