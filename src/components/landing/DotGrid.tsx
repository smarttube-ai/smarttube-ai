import { useEffect, useRef, useState } from 'react';

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  const [isCanvasSupported, setIsCanvasSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCanvasSupported(false);
      return;
    }

    const DOT_SPACING = 24; // Increased spacing between dots
    const DOT_RADIUS = 1; // Smaller dot size
    const HOVER_RADIUS = 40; // Exact 40px hover radius as requested
    const TRANSITION_SPEED = 0.15; // Slightly faster transition

    let dots: { x: number; y: number; currentColor: number[]; currentOpacity: number }[] = [];
    let isActive = true; // Flag to track if component is still mounted

    const resizeCanvas = () => {
      if (!canvas || !isActive) return;
      
      try {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initDots();
      } catch (error) {
        console.error("Error resizing canvas:", error);
        setIsCanvasSupported(false);
      }
    };

    const initDots = () => {
      if (!canvas || !isActive) return;
      
      try {
        dots = [];
        const cols = Math.floor(canvas.width / DOT_SPACING);
        const rows = Math.floor(canvas.height / DOT_SPACING);
        const offsetX = (canvas.width - (cols - 1) * DOT_SPACING) / 2;
        const offsetY = (canvas.height - (rows - 1) * DOT_SPACING) / 2;

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            dots.push({
              x: offsetX + i * DOT_SPACING,
              y: offsetY + j * DOT_SPACING,
              currentColor: [43, 96, 235], // Always blue (#2B60EB)
              currentOpacity: 0.15 // Very transparent by default
            });
          }
        }
      } catch (error) {
        console.error("Error initializing dots:", error);
      }
    };

    const drawDots = () => {
      if (!ctx || !canvas || !isActive) return;
      
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dots.forEach(dot => {
          const distance = Math.hypot(dot.x - mousePosition.current.x, dot.y - mousePosition.current.y);
          const intensity = Math.max(0, 1 - distance / HOVER_RADIUS);

          // Target opacity based on hover
          const targetOpacity = 0.15 + (intensity * 0.85); // Max opacity of 1.0 on full hover

          // Smoothly transition the opacity
          dot.currentOpacity += (targetOpacity - dot.currentOpacity) * TRANSITION_SPEED;

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(43, 96, 235, ${dot.currentOpacity})`;
          ctx.fill();
        });

        if (isActive) {
          animationFrameId.current = requestAnimationFrame(drawDots);
        }
      } catch (error) {
        console.error("Error drawing dots:", error);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas || !isActive) return;
      
      try {
        const rect = canvas.getBoundingClientRect();
        mousePosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      } catch (error) {
        console.error("Error handling mouse move:", error);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || !isActive) return;
      
      try {
        if (e.touches && e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          mousePosition.current = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
          };
        }
      } catch (error) {
        console.error("Error handling touch move:", error);
      }
    };

    // Initialize
    try {
      resizeCanvas();
      drawDots();

      // Event listeners
      window.addEventListener('resize', resizeCanvas);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove);
    } catch (error) {
      console.error("Error initializing canvas:", error);
      setIsCanvasSupported(false);
    }

    return () => {
      isActive = false;
      
      try {
        window.removeEventListener('resize', resizeCanvas);
        if (canvas) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('touchmove', handleTouchMove);
        }
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      } catch (error) {
        console.error("Error cleaning up canvas:", error);
      }
    };
  }, []);

  // If canvas is not supported, return null instead of the canvas element
  if (!isCanvasSupported) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: '#020817' }}
      aria-hidden="true"
    />
  );
}
