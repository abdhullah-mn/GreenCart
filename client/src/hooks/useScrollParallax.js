import { useEffect, useState } from 'react';

export default function useScrollParallax(multiplier = 0.18, maxOffset = 110) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frameId;
    const updateOffset = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setOffset(Math.min(window.scrollY * multiplier, maxOffset));
      });
    };

    window.addEventListener('scroll', updateOffset, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateOffset);
    };
  }, [multiplier, maxOffset]);

  return offset;
}
