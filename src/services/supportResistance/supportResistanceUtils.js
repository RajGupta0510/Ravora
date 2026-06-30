/**
 * Support & Resistance Utilities
 * 
 * Implements density-based clustering for price levels and volume profile binning
 * to locate high-liquidity price zones.
 */

/**
 * Clusters an array of raw price levels using a percentage tolerance.
 * Groups nearby levels together and returns the average price and count (touches) for each cluster.
 * 
 * @param {Array<number>} levels - Raw price levels (e.g., swing highs and lows)
 * @param {number} tolerancePct - Percentage difference to group levels (default 1.5%)
 * @returns {Array<Object>} Clustered levels [{ price, touches, strength }]
 */
export function clusterLevels(levels, tolerancePct = 0.015) {
  if (!levels || levels.length === 0) return [];

  // Sort prices ascending
  const sorted = [...levels].sort((a, b) => a - b);
  const clusters = [];
  let currentCluster = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diff = (curr - prev) / prev;

    if (diff <= tolerancePct) {
      currentCluster.push(curr);
    } else {
      clusters.push(currentCluster);
      currentCluster = [curr];
    }
  }
  clusters.push(currentCluster);

  // Map clusters to objects with average price and touches
  return clusters.map(cluster => {
    const avgPrice = cluster.reduce((sum, p) => sum + p, 0) / cluster.length;
    return {
      price: Math.round(avgPrice * 100) / 100,
      touches: cluster.length,
      strength: Math.min(100, cluster.length * 25) // Scale strength (1 touch = 25, 4+ touches = 100)
    };
  });
}

/**
 * Computes the Volume Profile (Volume at Price) by dividing the price range
 * into bins and accumulating trading volume.
 * 
 * @param {Array} history - Historical OHLCV array
 * @param {number} binCount - Number of price bins (default 20)
 * @returns {Array<Object>} Price bins with volume [{ priceLow, priceHigh, priceCenter, volume }]
 */
export function calculateVolumeProfile(history, binCount = 20) {
  if (!history || history.length === 0) return [];

  const closes = history.map(h => h.close);
  const minPrice = Math.min(...closes);
  const maxPrice = Math.max(...closes);
  const range = maxPrice - minPrice;

  if (range === 0) return [];

  const binSize = range / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const priceLow = minPrice + i * binSize;
    const priceHigh = priceLow + binSize;
    return {
      priceLow,
      priceHigh,
      priceCenter: priceLow + (binSize / 2),
      volume: 0
    };
  });

  // Accumulate volume into bins
  for (const candle of history) {
    const binIndex = Math.min(
      binCount - 1,
      Math.floor((candle.close - minPrice) / binSize)
    );
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex].volume += candle.volume || 0;
    }
  }

  return bins;
}
