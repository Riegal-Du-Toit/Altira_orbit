'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitLoginCard } from '@/components/auth/orbit-login-card';
import { Button } from '@/components/ui/button';

const typewriterWords = ['Altira Orbit', 'excellence', 'precision', 'affordability'];

function WovenOrbitBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6.7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();
    const particleCount = 28000;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const geometry = new THREE.BufferGeometry();
    const knot = new THREE.TorusKnotGeometry(1.58, 0.46, 220, 36);
    const palette = ['#65fff2', '#7c5cff', '#b99cff', '#f7fbff'];

    for (let i = 0; i < particleCount; i += 1) {
      const sourceIndex = i % knot.attributes.position.count;
      const jitter = (Math.random() - 0.5) * 0.08;
      const x = knot.attributes.position.getX(sourceIndex) + jitter;
      const y = knot.attributes.position.getY(sourceIndex) + jitter;
      const z = knot.attributes.position.getZ(sourceIndex) + jitter;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const color = new THREE.Color(palette[i % palette.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.scale.set(0.944, 0.858, 0.858);
    points.rotation.x = -0.22;
    points.position.x = -0.36;
    points.position.y = -0.334;
    scene.add(points);

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const mouseWorld = new THREE.Vector3(mouse.x * 2.7, mouse.y * 2.4, 0);

      for (let i = 0; i < particleCount; i += 1) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const dx = positions[ix] - mouseWorld.x;
        const dy = positions[iy] - mouseWorld.y;
        const dz = positions[iz] - mouseWorld.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 1.35) {
          const force = (1.35 - distance) * 0.0045;
          velocities[ix] += (dx / Math.max(distance, 0.001)) * force;
          velocities[iy] += (dy / Math.max(distance, 0.001)) * force;
          velocities[iz] += (dz / Math.max(distance, 0.001)) * force;
        }

        velocities[ix] += (originalPositions[ix] - positions[ix]) * 0.0014;
        velocities[iy] += (originalPositions[iy] - positions[iy]) * 0.0014;
        velocities[iz] += (originalPositions[iz] - positions[iz]) * 0.0014;

        velocities[ix] *= 0.94;
        velocities[iy] *= 0.94;
        velocities[iz] *= 0.94;

        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y = elapsed * 0.055;
      points.rotation.z = Math.sin(elapsed * 0.24) * 0.08;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      knot.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 opacity-90" aria-hidden="true" />;
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(typewriterWords[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const currentWord = typewriterWords[wordIndex];
    const isFullWord = displayText === currentWord;
    const isEmpty = displayText === '';

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && isFullWord) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && isEmpty) {
          setIsDeleting(false);
          setWordIndex((index) => (index + 1) % typewriterWords.length);
          return;
        }

        setDisplayText((text) =>
          isDeleting
            ? currentWord.slice(0, Math.max(text.length - 1, 0))
            : currentWord.slice(0, text.length + 1)
        );
      },
      isFullWord && !isDeleting ? 1500 : isDeleting ? 55 : 85
    );

    return () => window.clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <main className="min-h-screen">
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020612]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(124,92,255,0.22),transparent_34%),radial-gradient(circle_at_60%_46%,rgba(101,255,242,0.16),transparent_28%),linear-gradient(180deg,rgba(2,6,18,0.88),rgba(3,9,28,0.94))]" />
        <WovenOrbitBackground />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,18,0.12)_35%,rgba(2,6,18,0.88)_100%)]" />

        <nav className="absolute top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white shadow-sm">
          <div className="container relative mx-auto flex items-center justify-between px-4 py-2">
            <img src="/favicon.jpeg" alt="Altira emblem" className="h-9 w-auto" />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
              aria-label="Altira Group"
            >
              <span className="bg-gradient-to-r from-[#081b66] via-[#4938a8] to-[#7659e8] bg-clip-text text-[0.78rem] font-semibold uppercase tracking-[0.42em] text-transparent md:text-sm">
                Altira Group
              </span>
              <span className="mx-auto mt-1 block h-px w-10 bg-gradient-to-r from-transparent via-[#65fff2] to-transparent" />
            </div>
            <div className="relative flex items-center gap-4">
              {loginOpen && (
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close login"
                  onClick={() => setLoginOpen(false)}
                />
              )}
              {!loginOpen && (
                <Button
                  className="relative z-50 bg-[#081b66] text-white hover:bg-[#122985]"
                  onClick={() => setLoginOpen(true)}
                >
                  Sign-in
                </Button>
              )}
              {loginOpen && (
                <div className="relative z-50 translate-x-[3px] translate-y-[11px] text-right text-lg font-medium text-[#081b66]">
                  <span className="login-thinking-text">Sign-in detected</span>
                  <span className="inline-flex w-4 justify-start">
                    <span className="animate-pulse">..</span>
                  </span>
                </div>
              )}
              {loginOpen && (
                <div className="absolute right-[-30px] top-[calc(100%+2.725rem)] z-50 w-[min(13rem,calc(100vw-2rem))]">
                  <OrbitLoginCard onClose={() => setLoginOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </nav>

        <motion.div
          className="container relative z-20 mx-auto px-4 text-center"
          style={{ paddingTop: '146px' }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.65, 0.3, 0.9] }}
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-semibold text-white mb-6 drop-shadow-[0_0_34px_rgba(101,255,242,0.18)]">
              Welcome to{' '}
              <span className="inline-block min-w-[10ch] text-left text-[#8f78ff] drop-shadow-[0_0_22px_rgba(124,92,255,0.72)]">
                {displayText}
                <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-[#65fff2] shadow-[0_0_16px_rgba(101,255,242,0.9)]" />
              </span>
            </h1>
            <p className="mx-auto inline-flex items-center rounded-md border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#dffdfa] shadow-[0_0_36px_rgba(101,255,242,0.14)] backdrop-blur-md">
              With you, at every turn.
            </p>

          </div>
        </motion.div>
      </section>

      <footer className="relative -mt-4 border-t border-slate-800 bg-[#020612]">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-sm text-slate-400">&copy; 2026 Altira Orbit. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
