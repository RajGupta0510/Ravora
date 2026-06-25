export const ASSETS_TO_TRACK = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI'];

export const SYMBOL_TO_COINCAP_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binance-coin',
  SUI: 'sui'
};

export const COINCAP_ID_TO_SYMBOL = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  'binance-coin': 'BNB',
  sui: 'SUI'
};

export const SYMBOL_TO_BINANCE_SYMBOL = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  BNB: 'BNBUSDT',
  SUI: 'SUIUSDT'
};

export const BINANCE_SYMBOL_TO_SYMBOL = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
  BNBUSDT: 'BNB',
  SUIUSDT: 'SUI'
};

// Caching parameters
export const TICKER_TTL_MS = 60 * 1000; // 1 minute
export const HISTORY_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
