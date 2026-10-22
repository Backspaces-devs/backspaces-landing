export interface GlobeRenderer {
  update: (state: { phi?: number; width?: number; height?: number }) => void;
  destroy: () => void;
}

/** A rotating dot sphere for browsers that cannot create a WebGL context. */
export function createCanvasGlobe(
  canvas: HTMLCanvasElement,
  size: number,
  pixelRatio: number,
  initialPhi: number
): GlobeRenderer | null {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;

  const pointCount = 3600;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = Array.from({ length: pointCount }, (_, index) => {
    const y = 1 - (index / (pointCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });

  let width = size;
  let phi = initialPhi;
  let destroyed = false;

  function draw() {
    if (!context || destroyed) return;
    const center = width / 2;
    const radius = width * 0.4;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, width);

    const surface = context.createRadialGradient(
      center - radius * 0.3,
      center - radius * 0.35,
      radius * 0.05,
      center,
      center,
      radius
    );
    surface.addColorStop(0, "#182033");
    surface.addColorStop(0.75, "#101522");
    surface.addColorStop(1, "#0b0f18");
    context.fillStyle = surface;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fill();

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosTilt = Math.cos(0.22);
    const sinTilt = Math.sin(0.22);

    for (const point of points) {
      const x = point.x * cosPhi + point.z * sinPhi;
      const z = -point.x * sinPhi + point.z * cosPhi;
      const y = point.y * cosTilt - z * sinTilt;
      const depth = point.y * sinTilt + z * cosTilt;
      if (depth <= 0) continue;

      const opacity = 0.08 + depth * 0.46;
      const dotRadius = Math.max(0.35, width / 700) * (0.6 + depth * 0.5);
      context.fillStyle = `rgba(178, 195, 226, ${opacity})`;
      context.beginPath();
      context.arc(
        center + x * radius,
        center - y * radius,
        dotRadius,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  function resize(nextWidth: number) {
    width = Math.max(1, nextWidth);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(width * pixelRatio);
  }

  resize(size);
  draw();

  return {
    update(state) {
      if (state.width) resize(state.width);
      if (state.phi !== undefined) phi = state.phi;
      draw();
    },
    destroy() {
      destroyed = true;
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
