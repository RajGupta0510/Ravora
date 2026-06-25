export const ASSETS_TO_TRACK = ['BTC', 'ETH', 'SOL', 'LINK', 'SUI'];

export const SYMBOL_TO_COINCAP_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  LINK: 'chainlink',
  SUI: 'sui'
};

export const COINCAP_ID_TO_SYMBOL = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  chainlink: 'LINK',
  sui: 'SUI'
};

export const SYMBOL_TO_BINANCE_SYMBOL = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  LINK: 'LINKUSDT',
  SUI: 'SUIUSDT'
};

export const BINANCE_SYMBOL_TO_SYMBOL = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
  LINKUSDT: 'LINK',
  SUIUSDT: 'SUI'
};

// Caching parameters
export const TICKER_TTL_MS = 60 * 1000; // 1 minute
export const HISTORY_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
