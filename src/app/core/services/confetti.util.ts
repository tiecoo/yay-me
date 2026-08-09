interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const CONFETTI_COLORS = ['#f59e0b', '#ec4899', '#fbbf24', '#f472b6', '#6366f1'];
const PARTICLE_COUNT = 36;
const DURATION_MS = 1200;
const GRAVITY = 0.22;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Dispara um burst de confete no canvas informado. Retorna uma função de
 * limpeza que cancela a animação e apaga o canvas (chamar ao fechar/destruir).
 */
export function burstConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return () => {};
  }

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particles: ConfettiParticle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: width / 2,
    y: height / 2,
    vx: (Math.random() - 0.5) * 9,
    vy: (Math.random() - 0.5) * 6 - 5,
    size: 4 + Math.random() * 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 24
  }));

  let rafId = 0;
  let cancelled = false;
  const start = performance.now();

  function tick(now: number): void {
    if (cancelled) {
      return;
    }
    const t = Math.min((now - start) / DURATION_MS, 1);
    ctx!.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += GRAVITY;
      particle.rotation += particle.rotationSpeed;

      ctx!.save();
      ctx!.globalAlpha = Math.max(1 - t, 0);
      ctx!.translate(particle.x, particle.y);
      ctx!.rotate((particle.rotation * Math.PI) / 180);
      ctx!.fillStyle = particle.color;
      ctx!.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
      ctx!.restore();
    }

    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      ctx!.clearRect(0, 0, width, height);
    }
  }

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    ctx!.clearRect(0, 0, width, height);
  };
}
