import React, { Suspense, lazy } from 'react';
import { useInView, usePrefersReducedMotion } from './hooks';

// ThreeUI's predictive-arc field: a 2D canvas of dots that follow a forecast curve. Loaded on demand,
// so the landing page's first paint does not pay for it. It makes no network requests of its own.
const PredictiveArcCanvas = lazy(() =>
  import('@designcodeio/threeui/components/PredictiveArcCanvas').then((m) => ({ default: m.PredictiveArcCanvas }))
);

/**
 * Decorative backdrop for a dark panel. It only mounts once the panel scrolls into view, and not at all
 * when the visitor prefers reduced motion (the panel then keeps its plain gunmetal surface).
 */
export const ArcBackdrop: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.05);
  return (
    <div ref={ref} className={`rv-arc ${className}`} aria-hidden="true">
      {inView && !reduced && (
        <Suspense fallback={null}>
          <PredictiveArcCanvas spacing={6} dotSize={5} archHeight={0.8} speed={0.6} brightness={0.9} hue={132} saturation={0.9} />
        </Suspense>
      )}
    </div>
  );
};

export default ArcBackdrop;
