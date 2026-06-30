import { BaseLevelModel } from './supportResistanceAnalyzer.js';
import { findSwingPivots } from '../marketStructure/structureUtils.js';
import { clusterLevels, calculateVolumeProfile } from './supportResistanceUtils.js';

/**
 * Pluggable Model: Swing Level Clustering
 * Extracts swing highs/lows and clusters them to find zones with multiple touches.
 */
export class SwingLevelModel extends BaseLevelModel {
  constructor(weight = 0.5) {
    super('SwingLevelClustering', weight);
  }

  detectLevels(currentPrice, history) {
    if (!history || history.length < 15) {
      return { supports: [], resistances: [], explanation: 'Insufficient history for swing levels.' };
    }

    const { peaks, troughs } = findSwingPivots(history, 2);
    const rawHighs = peaks.map(p => p.price);
    const rawLows = troughs.map(t => t.price);

    // Cluster raw levels
    const clusteredSupports = clusterLevels(rawLows, 0.015);
    const clusteredResistances = clusterLevels(rawHighs, 0.015);

    // Separate relative to current price
    const supports = clusteredSupports
      .filter(s => s.price < currentPrice)
      .sort((a, b) => b.price - a.price); // Closest below

    const resistances = clusteredResistances
      .filter(r => r.price > currentPrice)
      .sort((a, b) => a.price - b.price); // Closest above

    let explanation = '';
    if (supports.length > 0 && resistances.length > 0) {
      explanation = `Swing pivot clustering identified key horizontal support at $${supports[0].price.toLocaleString()} (touches: ${supports[0].touches}) and resistance at $${resistances[0].price.toLocaleString()} (touches: ${resistances[0].touches}).`;
    }

    return { supports, resistances, explanation };
  }
}

/**
 * Pluggable Model: Psychological Levels
 * Identifies round number levels close to the current price.
 */
export class PsychologicalLevelModel extends BaseLevelModel {
  constructor(weight = 0.2) {
    super('PsychologicalLevels', weight);
  }

  detectLevels(currentPrice, history) {
    // Determine round number step based on asset price magnitude
    let step = 1000;
    if (currentPrice < 2) step = 0.10;
    else if (currentPrice < 10) step = 0.50;
    else if (currentPrice < 100) step = 5;
    else if (currentPrice < 1000) step = 50;
    else if (currentPrice < 10000) step = 500;
    else if (currentPrice < 50000) step = 1000;
    else step = 5000;

    const basePrice = Math.floor(currentPrice / step) * step;

    const supports = [
      { price: basePrice, strength: 40, touches: 1 },
      { price: basePrice - step, strength: 30, touches: 1 }
    ];

    const resistances = [
      { price: basePrice + step, strength: 40, touches: 1 },
      { price: basePrice + (step * 2), strength: 30, touches: 1 }
    ];

    const explanation = `Psychological round-number boundaries are active at $${resistances[0].price.toLocaleString()} (Resistance) and $${supports[0].price.toLocaleString()} (Support).`;

    return { supports, resistances, explanation };
  }
}

/**
 * Pluggable Model: Volume Profile High Volume Nodes (HVNs)
 * Locates price zones where high trading volume occurred.
 */
export class VolumeProfileLevelModel extends BaseLevelModel {
  constructor(weight = 0.3) {
    super('VolumeProfileHVN', weight);
  }

  detectLevels(currentPrice, history) {
    if (!history || history.length === 0) {
      return { supports: [], resistances: [], explanation: '' };
    }

    const bins = calculateVolumeProfile(history, 20);
    if (bins.length === 0) {
      return { supports: [], resistances: [], explanation: '' };
    }

    // Sort bins by volume descending to find High Volume Nodes (HVNs)
    const sortedBins = [...bins].sort((a, b) => b.volume - a.volume);
    const topHVNs = sortedBins.slice(0, 4); // Top 4 high volume zones

    const supports = [];
    const resistances = [];

    topHVNs.forEach((bin, index) => {
      const level = {
        price: Math.round(bin.priceCenter * 100) / 100,
        touches: 2,
        strength: Math.round(70 - (index * 10)) // Higher volume = higher strength
      };

      if (level.price < currentPrice) {
        supports.push(level);
      } else {
        resistances.push(level);
      }
    });

    // Sort relative to current price
    supports.sort((a, b) => b.price - a.price);
    resistances.sort((a, b) => a.price - b.price);

    let explanation = '';
    if (supports.length > 0 || resistances.length > 0) {
      const bestZone = topHVNs[0];
      explanation = `Volume profile analysis indicates high institutional liquidity concentration (Point of Control) near $${Math.round(bestZone.priceCenter).toLocaleString()}.`;
    }

    return { supports, resistances, explanation };
  }
}
