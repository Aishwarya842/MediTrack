import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  glow: number;
}

export const AntigravityCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates for gravitational repulsion/attraction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    // Create antigravity particles
    const particleCount = Math.min(36, Math.floor((width * height) / 25000));
    const particles: Particle[] = [];

    const hues = [28, 35, 205, 215]; // Orange & Blue brand tones

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.5,
        speedY: -(Math.random() * 0.4 + 0.15), // Floating upwards like antigravity
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.15,
        baseOpacity: Math.random() * 0.4 + 0.15,
        hue: hues[Math.floor(Math.random() * hues.length)],
        glow: Math.random() * 8 + 4
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Antigravity drift
        p.y += p.speedY;
        p.x += p.speedX;

        // Interactive mouse gravity effect
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 1.5;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
          p.opacity = Math.min(0.85, p.baseOpacity + (1 - dist / maxDist) * 0.5);
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.05;
        }

        // Wrap around vertically & horizontally
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft glowing orb
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 55%, ${p.opacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 55%, ${p.opacity * 0.8})`;
        ctx.shadowBlur = p.glow;
        ctx.fill();
        ctx.restore();

        // Connect nearby particles with subtle gravitational threads
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pjDx = p.x - p2.x;
          const pjDy = p.y - p2.y;
          const pjDist = Math.sqrt(pjDx * pjDx + pjDy * pjDy);
          const linkDist = 110;

          if (pjDist < linkDist) {
            const linkAlpha = (1 - pjDist / linkDist) * 0.12 * Math.min(p.opacity, p2.opacity);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 130, 32, ${linkAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
};
