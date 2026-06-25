/**
 * Math and Statistical Utilities for Quantitative Crypto Analysis
 */

/**
 * Calculates the Simple Moving Average (SMA) of an array of numbers
 */
export function calculateSMA(values, period) {
  if (!values || values.length === 0 || period <= 0) return 0;
  const len = Math.min(values.length, period);
  const sum = values.slice(-len).reduce((acc, val) => acc + val, 0);
  return sum / len;
}

/**
 * Calculates the percentage returns between consecutive values
 */
export function calculateDailyReturns(values) {
  if (!values || values.length < 2) return [];
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev === 0) {
      returns.push(0);
    } else {
      returns.push((curr - prev) / prev);
    }
  }
  return returns;
}

/**
 * Calculates the standard deviation of an array of numbers
 */
export function calculateStandardDeviation(values) {
  if (!values || values.length < 2) return 0;
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates the annualized volatility of daily prices (Crypto trades 365 days/year)
 */
export function calculateAnnualizedVolatility(prices) {
  const returns = calculateDailyReturns(prices);
  if (returns.length < 2) return 0;
  const dailyStdev = calculateStandardDeviation(returns);
  return dailyStdev * Math.sqrt(365);
}

/**
 * Calculates the percentage change over a given lookback period
 */
export function calculatePercentageChange(values, lookback) {
  if (!values || values.length < 2) return 0;
  const len = values.length;
  const current = values[len - 1];
  const oldIdx = Math.max(0, len - 1 - lookback);
  const old = values[oldIdx];
  if (old === 0) return 0;
  return (current - old) / old;
}
