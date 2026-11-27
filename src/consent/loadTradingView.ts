/**
 * Loads TradingView's widget script on demand. Call it only when the visitor has allowed
 * optional third-party content; it is not in index.html so nothing is requested from
 * TradingView before consent.
 */
let pending: Promise<void> | null = null;

export function loadTradingView(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as unknown as { TradingView?: unknown }).TradingView) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/tv.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      pending = null;
      reject(new Error('TradingView failed to load'));
    };
    document.head.appendChild(s);
  });
  return pending;
}
