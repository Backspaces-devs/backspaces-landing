"use client";

import { useEffect, useRef, useState } from "react";

import { createCanvasGlobe, type GlobeRenderer } from "./globe-fallback";

interface ParticleGlobeProps {
  rotationSpeed?: number;
  mapSamples?: number;
}

type RendererState = "loading" | "cobe" | "canvas" | "unavailable";

export function ParticleGlobe({
  rotationSpeed = 0.13,
  mapSamples = 24000,
}: ParticleGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rendererState, setRendererState] = useState<RendererState>("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const globeHost = host;

    let renderer: GlobeRenderer | null = null;
    let disposed = false;
    let started = false;
    let visible = false;
    let animationFrame = 0;
    let warmupTimer = 0;
    let lastPaint = 0;
    let phi = 0.75;
    let size = Math.max(1, Math.round(globeHost.clientWidth));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function stopAnimation() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastPaint = 0;
    }

    function canAnimate() {
      return (
        !disposed &&
        visible &&
        !document.hidden &&
        !motionQuery.matches &&
        rotationSpeed !== 0
      );
    }

    function tick(timestamp: number) {
      animationFrame = 0;
      if (!renderer || !canAnimate()) return;

      // Limit GPU work to roughly 30 frames per second, independent of refresh rate.
      if (!lastPaint) lastPaint = timestamp;
      const elapsed = timestamp - lastPaint;
      if (elapsed >= 1000 / 30) {
        phi += (Math.min(elapsed, 100) / 1000) * rotationSpeed;
        renderer.update({ phi });
        lastPaint = timestamp;
      }
      animationFrame = window.requestAnimationFrame(tick);
    }

    function syncMotion() {
      stopAnimation();
      if (!renderer || disposed) return;
      globeHost.dataset.motion = canAnimate()
        ? "rotating"
        : motionQuery.matches
          ? "reduced"
          : "paused";
      if (canAnimate()) animationFrame = window.requestAnimationFrame(tick);
      else renderer.update({ phi });
    }

    function freshCanvas() {
      const canvas = document.createElement("canvas");
      canvas.className = "bs-home-globe-canvas";
      canvas.setAttribute("aria-hidden", "true");
      globeHost.replaceChildren(canvas);
      return canvas;
    }

    async function initialize() {
      if (started || disposed) return;
      started = true;
      let canvas = freshCanvas();

      try {
        // COBE is loaded only in the browser, once the globe enters the viewport.
        const { default: createGlobe } = await import("cobe");
        if (disposed) return;

        const globe = createGlobe(canvas, {
          width: size,
          height: size,
          devicePixelRatio: pixelRatio,
          phi,
          theta: 0.22,
          dark: 1,
          diffuse: 1.2,
          scale: 1,
          mapSamples,
          mapBrightness: 3.2,
          mapBaseBrightness: 0.04,
          baseColor: [0.38, 0.38, 0.38],
          markerColor: [0.5, 0.5, 0.5],
          glowColor: [0.08, 0.08, 0.08],
          opacity: 1,
          offset: [0, 0],
          markers: [],
          context: { alpha: true, antialias: true },
        });

        if (!globe || typeof globe.update !== "function") {
          throw new Error("WebGL globe is unavailable");
        }
        renderer = globe;
        setRendererState("cobe");
      } catch {
        if (disposed) return;
        // Still an animated dot sphere, not an image, when WebGL is unavailable.
        canvas = freshCanvas();
        renderer = createCanvasGlobe(canvas, size, pixelRatio, phi);
        setRendererState(renderer ? "canvas" : "unavailable");
      }

      if (disposed) {
        renderer?.destroy();
        return;
      }
      renderer?.update({ width: size, height: size, phi });
      syncMotion();

      // Give the embedded map texture time to decode even with reduced motion.
      warmupTimer = window.setTimeout(() => {
        if (!disposed) renderer?.update({ phi });
      }, 150);
    }

    const resizeObserver = new ResizeObserver(() => {
      const nextSize = Math.max(1, Math.round(globeHost.clientWidth));
      if (nextSize === size) return;
      size = nextSize;
      renderer?.update({ width: size, height: size, phi });
    });
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) void initialize();
        syncMotion();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(host);

    motionQuery.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);

    return () => {
      disposed = true;
      stopAnimation();
      window.clearTimeout(warmupTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      renderer?.destroy();
      // COBE v2 owns an internal wrapper; React owns only this empty globeHost.
      globeHost.replaceChildren();
    };
  }, [rotationSpeed, mapSamples]);

  return (
    <div
      className="bs-home-globe"
      data-renderer={rendererState}
      aria-hidden="true"
    >
      <div className="bs-home-globe-glow" />
      <OrbitRings front={false} />
      <div className="bs-home-globe-backplate" />
      <div className="bs-home-globe-loading-dots" />
      <div ref={hostRef} className="bs-home-globe-canvas-host" />
      <OrbitRings front />
    </div>
  );
}

const rings = [
  { radius: 274, tilt: 64, rotation: -22 },
  { radius: 284, tilt: 71, rotation: 54 },
];

function orbitPath(
  radius: number,
  tiltDegrees: number,
  rotationDegrees: number,
  front: boolean
) {
  const tilt = (tiltDegrees * Math.PI) / 180;
  const rotation = (rotationDegrees * Math.PI) / 180;
  const start = front ? 0 : Math.PI;
  return Array.from({ length: 97 }, (_, index) => {
    const angle = start + (index / 96) * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle) * Math.cos(tilt);
    const screenX = 300 + x * Math.cos(rotation) - y * Math.sin(rotation);
    const screenY = 300 + x * Math.sin(rotation) + y * Math.cos(rotation);
    return `${index === 0 ? "M" : "L"}${screenX.toFixed(3)},${screenY.toFixed(3)}`;
  }).join(" ");
}

function OrbitRings({ front }: { front: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 600 600"
      className={`bs-home-globe-orbits bs-home-globe-orbits-${front ? "front" : "back"}`}
    >
      {rings.map((ring) => (
        <path
          key={ring.rotation}
          d={orbitPath(ring.radius, ring.tilt, ring.rotation, front)}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
