import { useEffect, useRef, useState } from 'react';

/**
 * Anima un número desde su valor anterior (o 0 al montar) hasta `value`
 * con una curva ease-out. Ideal para montos y contadores.
 */
export function useCountUp(value: number, duration = 750) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let frame = 0;

    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      fromRef.current = current;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}
