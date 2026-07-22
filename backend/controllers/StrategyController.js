import { BacktestEngine } from '../ai/reasoning/BacktestEngine.js';
import { StrategyDefinitionRepository } from '../repositories/StrategyDefinitionRepository.js';
import { BacktestResultRepository } from '../repositories/BacktestResultRepository.js';
import { PatternStatisticRepository } from '../repositories/PatternStatisticRepository.js';
import { ApiError } from '../utils/ApiError.js';

const strategyRepo = new StrategyDefinitionRepository();
const resultRepo = new BacktestResultRepository();
const patternRepo = new PatternStatisticRepository();

export const StrategyController = {
  /**
   * Run a new backtest simulation
   */
  async runBacktest(req, res, next) {
    try {
      const userId = req.user.id;
      const { symbol, timeframe, strategyConfig, initialCapital, feePct, slippagePct, strategyId } = req.body;

      if (!symbol || !strategyConfig) {
        throw ApiError.badRequest('symbol and strategyConfig buy/sell rules are required');
      }

      // Execute simulation
      const result = await BacktestEngine.runBacktest({
        symbol,
        timeframe: timeframe || '1d',
        strategyConfig,
        initialCapital: initialCapital ? parseFloat(initialCapital) : 10000,
        feePct: feePct ? parseFloat(feePct) : 0.001,
        slippagePct: slippagePct ? parseFloat(slippagePct) : 0.0005
      });

      // Save results
      const savedResult = await resultRepo.create({
        user_id: userId,
        strategy_id: strategyId || null,
        symbol: symbol.toUpperCase(),
        timeframe: timeframe || '1d',
        start_date: new Date(Date.now() - 30 * 86400000).toISOString(), // rough estimate
        end_date: new Date().toISOString(),
        initial_capital: initialCapital || 10000,
        final_capital: result.finalCapital,
        metrics: result.metrics,
        trades: result.trades
      });

      return res.status(201).json({
        success: true,
        data: {
          id: savedResult.id,
          ...result
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Save a new strategy configuration
   */
  async saveStrategy(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, description, indicatorsConfig, rulesConfig } = req.body;

      if (!name || !rulesConfig) {
        throw ApiError.badRequest('name and rulesConfig are required');
      }

      const strategy = await strategyRepo.create({
        user_id: userId,
        name,
        description,
        indicators_config: indicatorsConfig || {},
        rules_config: rulesConfig
      });

      return res.status(201).json({
        success: true,
        data: strategy
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all strategies saved by user
   */
  async listStrategies(req, res, next) {
    try {
      const userId = req.user.id;
      const { data: strategies } = await strategyRepo.findByUserId(userId);
      return res.json({
        success: true,
        data: strategies || []
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get saved backtests for user
   */
  async listBacktests(req, res, next) {
    try {
      const userId = req.user.id;
      const { data: results } = await resultRepo.findByUserId(userId);
      return res.json({
        success: true,
        data: results || []
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Compare two backtests
   */
  async compareBacktests(req, res, next) {
    try {
      const userId = req.user.id;
      const { idA, idB } = req.query;

      if (!idA || !idB) {
        throw ApiError.badRequest('idA and idB query parameters are required');
      }

      const resultA = await resultRepo.findById(idA);
      const resultB = await resultRepo.findById(idB);

      if (!resultA || resultA.user_id !== userId || !resultB || resultB.user_id !== userId) {
        throw ApiError.notFound('One or both backtest results not found');
      }

      const comparison = BacktestEngine.compareStrategies(resultA, resultB);

      return res.json({
        success: true,
        data: {
          strategyA: resultA,
          strategyB: resultB,
          comparison
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lookup probability data and history matches for specific technical patterns
   */
  async patternLookup(req, res, next) {
    try {
      const { symbol, timeframe, patternName } = req.query;

      if (!symbol || !patternName) {
        throw ApiError.badRequest('symbol and patternName are required');
      }

      const tf = timeframe || '1d';
      const matches = await BacktestEngine.findHistoricalMatches(symbol.toUpperCase(), tf, patternName);
      const stats = await BacktestEngine.calculateProbability(symbol.toUpperCase(), tf, patternName);

      return res.json({
        success: true,
        data: {
          patternName,
          symbol: symbol.toUpperCase(),
          timeframe: tf,
          matchesCount: matches.length,
          successProbabilityPct: stats.probability,
          matches: matches.slice(0, 10) // return recent 10 matches
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
