import { ApiError } from '../../utils/ApiError.js';
import { getSupabaseAdmin } from '../../config/database.js';
import { MarketDataService } from '../../services/MarketDataService.js';

export const OrderValidator = {
  /**
   * Performs basic schema and business rule validations on an incoming order.
   * @param {string} userId
   * @param {object} params
   * @param {string} params.exchangeAccountId - The connected exchange database ID
   * @param {string} params.symbol - e.g. 'BTCUSDT'
   * @param {string} params.type - 'market' | 'limit' | 'stop_loss' | 'take_profit' | 'stop_limit' | 'trailing_stop'
   * @param {string} params.side - 'buy' | 'sell'
   * @param {number} params.quantity - Order quantity
   * @param {number} [params.price] - Limit price
   * @param {number} [params.stopPrice] - Trigger price
   * @param {number} [params.leverage=1.0] - Margin leverage
   */
  async validateOrder(userId, params) {
    const { exchangeAccountId, symbol, type, side, quantity, price, stopPrice, leverage = 1.0 } = params;

    // 1. Basic Schema Checks
    if (!exchangeAccountId) throw ApiError.badRequest('exchangeAccountId is required');
    if (!symbol) throw ApiError.badRequest('symbol is required');
    
    const validSides = ['buy', 'sell'];
    if (!validSides.includes(side?.toLowerCase())) {
      throw ApiError.badRequest(`Invalid order side: ${side}. Allowed: ${validSides.join(', ')}`);
    }

    const validTypes = ['market', 'limit', 'stop_loss', 'take_profit', 'stop_limit', 'trailing_stop'];
    if (!validTypes.includes(type?.toLowerCase())) {
      throw ApiError.badRequest(`Invalid order type: ${type}. Allowed: ${validTypes.join(', ')}`);
    }

    if (isNaN(quantity) || quantity <= 0) {
      throw ApiError.badRequest('Quantity must be a positive number');
    }

    if (['limit', 'stop_limit'].includes(type.toLowerCase())) {
      if (isNaN(price) || price <= 0) {
        throw ApiError.badRequest('Price is required and must be a positive number for limit orders');
      }
    }

    if (['stop_loss', 'take_profit', 'stop_limit'].includes(type.toLowerCase())) {
      if (isNaN(stopPrice) || stopPrice <= 0) {
        throw ApiError.badRequest('stopPrice is required and must be a positive number for trigger orders');
      }
    }

    if (isNaN(leverage) || leverage < 1.0 || leverage > 100.0) {
      throw ApiError.badRequest('Leverage must be between 1.0 and 100.0');
    }

    // 2. Exchange Specific Limits (e.g. Min sizes / Precisions)
    const baseSymbol = symbol.toUpperCase().replace('USDT', '').replace('USD', '');
    const quoteSymbol = symbol.toUpperCase().endsWith('USDT') ? 'USDT' : 'USD';
    
    const minOrderSizes = {
      BTC: 0.0001,
      ETH: 0.001,
      SOL: 0.01,
      AVAX: 0.1,
      default: 0.1
    };

    const minSize = minOrderSizes[baseSymbol] || minOrderSizes.default;
    if (quantity < minSize) {
      throw ApiError.badRequest(`Order size ${quantity} ${baseSymbol} is below the exchange minimum of ${minSize}`);
    }

    // 3. Balance Validation Checks
    const db = getSupabaseAdmin();
    
    // Fetch live asset price
    const currentPrice = await MarketDataService.getCurrentPrice(baseSymbol) || price || stopPrice || 1.0;
    const orderCost = quantity * (price || currentPrice);

    if (side.toLowerCase() === 'buy') {
      // User is buying base asset, check quote asset balance (USDT/USDC/USD)
      const { data: quoteAsset } = await db
        .from('portfolio_assets')
        .select('balance_amount')
        .eq('exchange_account_id', exchangeAccountId)
        .in('asset_symbol', ['USDT', 'USDC', 'USD'])
        .maybeSingle();

      const availableQuote = parseFloat(quoteAsset?.balance_amount || 0);
      const neededQuote = orderCost / leverage; // adjust for leverage margin

      if (availableQuote < neededQuote) {
        throw ApiError.badRequest(`Insufficient exchange funds. Available: ${availableQuote} USD/USDT. Required: ${neededQuote.toFixed(2)}`);
      }
    } else {
      // User is selling base asset, check base asset balance (BTC/ETH/SOL/etc.)
      const { data: baseAsset } = await db
        .from('portfolio_assets')
        .select('balance_amount')
        .eq('exchange_account_id', exchangeAccountId)
        .eq('asset_symbol', baseSymbol)
        .maybeSingle();

      const availableBase = parseFloat(baseAsset?.balance_amount || 0);
      if (availableBase < quantity) {
        throw ApiError.badRequest(`Insufficient exchange funds. Available: ${availableBase} ${baseSymbol}. Required: ${quantity}`);
      }
    }

    return true;
  }
};
