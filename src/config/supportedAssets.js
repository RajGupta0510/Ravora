/**
 * Centralized Supported Assets Configuration
 * 
 * This is the single source of truth for all assets supported by Ravora.
 * Adding or removing an asset here automatically updates all backend engines,
 * the market scanner, the database seeder, and the trading terminal.
 */

export const SUPPORTED_ASSETS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    color: '#f7931a',
    pair: 'BTC / USD',
    binanceSymbol: 'BTCUSDT',
    coincapId: 'bitcoin',
    opportunityId: 'btc-halving',
    type: 'momentum',
    fallbackPrice: 64120.10,
    fallbackVolume: 28450200100,
    fallbackMarketCap: 1258900400100
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    color: '#627eea',
    pair: 'ETH / USD',
    binanceSymbol: 'ETHUSDT',
    coincapId: 'ethereum',
    opportunityId: 'eth-staking',
    type: 'momentum',
    fallbackPrice: 3485.10,
    fallbackVolume: 14502100800,
    fallbackMarketCap: 418500200300
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    icon: 'S',
    color: '#14f195',
    pair: 'SOL / USD',
    binanceSymbol: 'SOLUSDT',
    coincapId: 'solana',
    opportunityId: 'solana-liquidity',
    type: 'momentum',
    fallbackPrice: 134.20,
    fallbackVolume: 3840100500,
    fallbackMarketCap: 62450300100
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    icon: 'B',
    color: '#f3ba2f',
    pair: 'BNB / USD',
    binanceSymbol: 'BNBUSDT',
    coincapId: 'binance-coin',
    opportunityId: 'bnb-breakout',
    type: 'momentum',
    fallbackPrice: 580.10,
    fallbackVolume: 1850200100,
    fallbackMarketCap: 89050300100
  },
  {
    symbol: 'SUI',
    name: 'Sui',
    icon: '💧',
    color: '#6fbcd5',
    pair: 'SUI / USD',
    binanceSymbol: 'SUIUSDT',
    coincapId: 'sui',
    opportunityId: 'sui-move',
    type: 'momentum',
    fallbackPrice: 1.15,
    fallbackVolume: 120500600,
    fallbackMarketCap: 2840900100
  }
];

// Dynamically derived helper configurations to prevent duplication across services
export const ASSETS_TO_TRACK = SUPPORTED_ASSETS.map(a => a.symbol);

export const SYMBOL_TO_COINCAP_ID = SUPPORTED_ASSETS.reduce((acc, a) => {
  acc[a.symbol] = a.coincapId;
  return acc;
}, {});

export const COINCAP_ID_TO_SYMBOL = SUPPORTED_ASSETS.reduce((acc, a) => {
  acc[a.coincapId] = a.symbol;
  return acc;
}, {});

export const SYMBOL_TO_BINANCE_SYMBOL = SUPPORTED_ASSETS.reduce((acc, a) => {
  acc[a.symbol] = a.binanceSymbol;
  return acc;
}, {});

export const BINANCE_SYMBOL_TO_SYMBOL = SUPPORTED_ASSETS.reduce((acc, a) => {
  acc[a.binanceSymbol] = a.symbol;
  return acc;
}, {});

export const ASSET_METADATA = SUPPORTED_ASSETS.reduce((acc, a) => {
  acc[a.symbol] = {
    name: a.name,
    icon: a.icon,
    opportunityId: a.opportunityId,
    type: a.type
  };
  return acc;
}, {});
