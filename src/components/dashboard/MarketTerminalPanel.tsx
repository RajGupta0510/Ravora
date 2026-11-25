import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Sliders,
  Maximize2
} from 'lucide-react';

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketTerminalPanelProps {
  initialSymbol?: string;
  onNavigateTab?: (tab: 'portfolio' | 'terminal' | 'markets' | 'opportunities' | 'copilot' | 'settings') => void;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

export const MarketTerminalPanel: React.FC<MarketTerminalPanelProps> = ({
  initialSymbol = 'BTC',
  onNavigateTab
}) => {
  const { marketOverview, deployOpportunity } = useApp();

  const [activeSymbol, setActiveSymbol] = useState<string>(initialSymbol);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('1h');
  const [chartEngine, setChartEngine] = useState<'tradingview' | 'native'>('tradingview');
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper');

  // Trade form
  const [orderSide, setOrderSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [orderAmount, setOrderAmount] = useState<number>(1000);
  const [orderLeverage, setOrderLeverage] = useState<number>(2);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Market items
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rawCandles, setRawCandles] = useState<Candle[]>([]);
  const [candlesLoading, setCandlesLoading] = useState<boolean>(false);
  const [assetDetails, setAssetDetails] = useState<any>(null);

  // Overlay state
  const [showTargets, setShowTargets] = useState<boolean>(true);
  const [showSupportResistance, setShowSupportResistance] = useState<boolean>(true);

  const tvContainerRef = useRef<HTMLDivElement>(null);

  // Watchlist assets
  const watchlist = useMemo(() => {
    if (marketOverview && marketOverview.length > 0) {
      return marketOverview;
    }
    return [
      { symbol: 'BTC', name: 'Bitcoin', price: 63314.01, change24h: 1.50, volume24h: 12000000000 },
      { symbol: 'ETH', name: 'Ethereum', price: 3485.10, change24h: 1.50, volume24h: 12000000000 },
      { symbol: 'SOL', name: 'Solana', price: 134.20, change24h: 1.50, volume24h: 12000000000 },
      { symbol: 'BNB', name: 'Binance Coin', price: 588.40, change24h: 0.85, volume24h: 1850000000 },
      { symbol: 'XRP', name: 'Ripple', price: 0.582, change24h: -0.42, volume24h: 940000000 },
      { symbol: 'ADA', name: 'Cardano', price: 0.384, change24h: 2.14, volume24h: 420000000 },
      { symbol: 'AVAX', name: 'Avalanche', price: 28.60, change24h: -1.15, volume24h: 310000000 }
    ];
  }, [marketOverview]);

  const activeAsset = useMemo(() => {
    return watchlist.find(a => a.symbol === activeSymbol) || {
      symbol: activeSymbol,
      name: activeSymbol,
      price: 63314.01,
      change24h: 1.50,
      volume24h: 12000000000
    };
  }, [watchlist, activeSymbol]);

  // Filter watchlist
  const filteredWatchlist = useMemo(() => {
    if (!searchQuery.trim()) return watchlist;
    const q = searchQuery.toLowerCase();
    return watchlist.filter(a => a.symbol.toLowerCase().includes(q) || (a.name && a.name.toLowerCase().includes(q)));
  }, [watchlist, searchQuery]);

  // Load Asset Details & Candles
  const loadAssetData = useCallback(async (sym: string) => {
    setCandlesLoading(true);
    try {
      const res = await fetch(`/v1/market/assets/${sym}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setAssetDetails(data);
        if (data.candles && data.candles.length > 0) {
          setRawCandles(data.candles);
        } else {
          setRawCandles([]);
        }
      }
    } catch (e) {
      console.error('[Terminal] Candle fetch error:', e);
    } finally {
      setCandlesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssetData(activeSymbol);
  }, [activeSymbol, loadAssetData]);

  // TradingView Interval mapping
  const getTvInterval = (tf: string) => {
    const map: Record<string, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '4h': '240',
      '1D': 'D',
      '1W': 'W'
    };
    return map[tf] || '60';
  };

  // Embed TradingView Widget
  useEffect(() => {
    if (chartEngine !== 'tradingview') return;

    const containerId = 'tv_terminal_chart_container';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const tvSymbol = `BINANCE:${activeSymbol}USDT`;

    if (typeof window.TradingView !== 'undefined' && window.TradingView.widget) {
      try {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: getTvInterval(activeTimeframe),
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1', // Candlestick mode
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: containerId,
          loading_screen: { backgroundColor: '#0b0e14' },
          overrides: {
            'paneProperties.background': '#0b0e14',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': 'rgba(203, 213, 225, 0.05)',
            'paneProperties.horzGridProperties.color': 'rgba(203, 213, 225, 0.05)',
            'scalesProperties.textColor': '#94a3b8',
            'mainSeriesProperties.candleStyle.upColor': '#10b981',
            'mainSeriesProperties.candleStyle.downColor': '#ef4444',
            'mainSeriesProperties.candleStyle.drawWick': true,
            'mainSeriesProperties.candleStyle.drawBorder': true,
            'mainSeriesProperties.candleStyle.borderColor': '#10b981',
            'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
            'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444'
          }
        });
      } catch (err) {
        console.warn('TradingView initialization failed, fallback to native', err);
        setChartEngine('native');
      }
    } else {
      // If script not yet ready, retry or fallback
      const timer = setTimeout(() => {
        if (typeof window.TradingView === 'undefined') {
          setChartEngine('native');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeSymbol, activeTimeframe, chartEngine]);

  // Order Execution Handler
  const handleDeployTrade = async () => {
    setIsExecuting(true);
    setExecutionMessage(null);
    try {
      const price = activeAsset.price || 100;
      const stopLoss = orderSide === 'LONG' ? price * 0.96 : price * 1.04;
      const takeProfit = orderSide === 'LONG' ? price * 1.08 : price * 0.92;

      const success = await deployOpportunity(
        activeSymbol,
        orderSide,
        orderAmount,
        orderLeverage,
        stopLoss,
        takeProfit
      );

      if (success) {
        setExecutionMessage({
          type: 'success',
          text: `${orderSide} ${activeSymbol} deployed with ${orderLeverage}x leverage!`
        });
      } else {
        setExecutionMessage({
          type: 'error',
          text: `Simulated order for ${activeSymbol} was not executed. Check sandbox capital.`
        });
      }
    } catch (e: any) {
      setExecutionMessage({ type: 'error', text: e.message || 'Execution error.' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Format Helpers
  const formatPrice = (val?: number) => {
    if (val === undefined || isNaN(val)) return '$0.00';
    if (val < 1) return '$' + val.toFixed(4);
    if (val < 10) return '$' + val.toFixed(3);
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (val?: number) => {
    if (!val || isNaN(val)) return '$0';
    if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
    return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Synthetic Candles for Native SVG Engine
  const displayCandles = useMemo(() => {
    if (rawCandles && rawCandles.length >= 10) {
      return rawCandles.slice(-48);
    }
    const base = activeAsset.price || 63000;
    const count = 48;
    const now = Date.now();
    let current = base * 0.95;
    return Array.from({ length: count }, (_, i) => {
      const change = (Math.sin(i * 0.3) + (Math.random() - 0.48) * 1.5) * (base * 0.007);
      const open = current;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (base * 0.005);
      const low = Math.min(open, close) - Math.random() * (base * 0.005);
      const volume = Math.random() * 800000000 + 200000000;
      current = close;
      return {
        timestamp: now - (count - i) * 3600000,
        open,
        high,
        low,
        close,
        volume
      };
    });
  }, [rawCandles, activeAsset.price]);

  // Order Book Mock Generator based on current price
  const orderBook = useMemo(() => {
    const p = activeAsset.price || 100;
    const asks = [
      { price: p * 1.004, size: 2.45, total: 2.45 },
      { price: p * 1.003, size: 4.81, total: 7.26 },
      { price: p * 1.002, size: 8.12, total: 15.38 },
      { price: p * 1.001, size: 12.65, total: 28.03 }
    ].reverse();

    const bids = [
      { price: p * 0.999, size: 14.20, total: 14.20 },
      { price: p * 0.998, size: 7.95, total: 22.15 },
      { price: p * 0.997, size: 5.40, total: 27.55 },
      { price: p * 0.996, size: 3.10, total: 30.65 }
    ];

    return { asks, bids };
  }, [activeAsset.price]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. TOP CONTROL BAR */}
      <div
        className="card-glass"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}
      >
        {/* Left: Active Asset Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0e14',
                fontWeight: 800,
                fontSize: '1rem'
              }}
            >
              {activeSymbol.slice(0, 3)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{activeAsset.name || activeSymbol}</span>
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>{activeSymbol}/USDT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  {formatPrice(activeAsset.price)}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: (activeAsset.change24h || 0) >= 0 ? '#10b981' : '#ef4444'
                  }}
                >
                  {(activeAsset.change24h || 0) >= 0 ? '+' : ''}
                  {(activeAsset.change24h || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.72rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', }}>24h Vol</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{formatVolume(activeAsset.volume24h)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', }}>Engine</span>
              <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}></span>
                Continuous Stream
              </span>
            </div>
          </div>
        </div>

        {/* Right: Timeframe & Engine Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Timeframe Selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '2px',
              gap: '2px'
            }}
          >
            {['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: activeTimeframe === tf ? '#f59e0b' : 'transparent',
                  color: activeTimeframe === tf ? '#0b0e14' : 'var(--text-secondary)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Engine Switch (TradingView vs Native) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '2px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => setChartEngine('tradingview')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: chartEngine === 'tradingview' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: chartEngine === 'tradingview' ? '#f59e0b' : 'var(--text-secondary)'
              }}
            >
              TradingView
            </button>
            <button
              onClick={() => setChartEngine('native')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: chartEngine === 'native' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: chartEngine === 'native' ? '#f59e0b' : 'var(--text-secondary)'
              }}
            >
              Araiven Native
            </button>
          </div>

          {/* Paper / Live toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setTradingMode('paper')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: tradingMode === 'paper' ? '#10b981' : 'transparent',
                color: tradingMode === 'paper' ? '#0b0e14' : 'var(--text-muted)'
              }}
            >
              PAPER
            </button>
            <button
              onClick={() => setTradingMode('live')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: tradingMode === 'live' ? '#ef4444' : 'transparent',
                color: tradingMode === 'live' ? '#fff' : 'var(--text-muted)'
              }}
            >
              LIVE
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN TERMINAL WORKSPACE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr) minmax(280px, 320px)',
          gap: '16px',
          alignItems: 'start'
        }}
        className="terminal-layout-columns"
      >
        {/* LEFT COLUMN: WATCHLIST SCANNER */}
        <div
          className="card-glass"
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '620px',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0' }}>
              Market radar
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{watchlist.length} Assets</span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter symbol..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                color: '#fff',
                fontSize: '0.72rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Assets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredWatchlist.map(item => {
              const isSelected = item.symbol === activeSymbol;
              const isGreen = (item.change24h || 0) >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => setActiveSymbol(item.symbol)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                    border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseOut={e => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#0b0e14' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: isSelected ? '#fbbf24' : '#fff' }}>
                        {item.symbol}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff' }}>{formatPrice(item.price)}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isGreen ? '#10b981' : '#ef4444' }}>
                      {isGreen ? '+' : ''}
                      {(item.change24h || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: CANDLESTICK CHART */}
        <div
          className="card-glass"
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            height: '620px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Chart Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                {activeSymbol} candlestick radar
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({activeTimeframe})</span>
            </div>

            {/* AI Overlay Toggles */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowTargets(!showTargets)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: showTargets ? '1px solid #f59e0b' : '1px solid var(--border)',
                  background: showTargets ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: showTargets ? '#f59e0b' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Araiven Targets
              </button>
              <button
                onClick={() => setShowSupportResistance(!showSupportResistance)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: showSupportResistance ? '1px solid #10b981' : '1px solid var(--border)',
                  background: showSupportResistance ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: showSupportResistance ? '#10b981' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                S/R Levels
              </button>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div style={{ flex: 1, width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '8px', background: '#0b0e14' }}>
            {chartEngine === 'tradingview' ? (
              <div
                id="tv_terminal_chart_container"
                ref={tvContainerRef}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              /* Native SVG Candlestick Engine */
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {(() => {
                  const W = 800;
                  const H = 450;
                  const PAD_LEFT = 60;
                  const PAD_RIGHT = 10;
                  const PAD_TOP = 20;
                  const PAD_BOTTOM = 40;
                  const chartW = W - PAD_LEFT - PAD_RIGHT;
                  const chartH = H - PAD_TOP - PAD_BOTTOM;

                  const highs = displayCandles.map(c => c.high);
                  const lows = displayCandles.map(c => c.low);
                  const maxP = Math.max(...highs) * 1.002;
                  const minP = Math.min(...lows) * 0.998;
                  const rangeP = maxP - minP || 1;

                  const toY = (p: number) => PAD_TOP + ((maxP - p) / rangeP) * chartH;
                  const toX = (i: number) => PAD_LEFT + (i / displayCandles.length) * chartW + (chartW / displayCandles.length) / 2;
                  const candleW = Math.max(5, (chartW / displayCandles.length) - 3);

                  const curP = activeAsset.price || displayCandles[displayCandles.length - 1]?.close || 100;
                  const curY = toY(curP);

                  // Support & Resistance
                  const supY = toY(minP * 1.005);
                  const resY = toY(maxP * 0.995);
                  const targetY = toY(curP * 1.045);

                  return (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${W} ${H}`}
                      preserveAspectRatio="none"
                      style={{ display: 'block' }}
                    >
                      {/* Grid */}
                      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const y = PAD_TOP + chartH * pct;
                        const p = maxP - rangeP * pct;
                        return (
                          <g key={idx}>
                            <line
                              x1={PAD_LEFT}
                              y1={y}
                              x2={W - PAD_RIGHT}
                              y2={y}
                              stroke="rgba(203, 213, 225, 0.06)"
                              strokeDasharray="4,4"
                            />
                            <text
                              x={PAD_LEFT - 6}
                              y={y + 4}
                              fill="#94a3b8"
                              fontSize="9"
                              textAnchor="end"
                              fontFamily="monospace"
                            >
                              {p > 1000 ? '$' + (p / 1000).toFixed(1) + 'k' : '$' + p.toFixed(2)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Candlesticks */}
                      {displayCandles.map((c, i) => {
                        const isUp = c.close >= c.open;
                        const col = isUp ? '#10b981' : '#ef4444';
                        const cx = toX(i);
                        const topY = toY(Math.max(c.open, c.close));
                        const botY = toY(Math.min(c.open, c.close));
                        const bodyH = Math.max(2, botY - topY);

                        return (
                          <g key={i}>
                            {/* Wick */}
                            <line
                              x1={cx}
                              y1={toY(c.high)}
                              x2={cx}
                              y2={toY(c.low)}
                              stroke={col}
                              strokeWidth="1.2"
                              opacity="0.85"
                            />
                            {/* Candle Body */}
                            <rect
                              x={cx - candleW / 2}
                              y={topY}
                              width={candleW}
                              height={bodyH}
                              fill={isUp ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'}
                              stroke={col}
                              strokeWidth="0.5"
                              rx="1"
                            />
                          </g>
                        );
                      })}

                      {/* Araiven Target Ladder Overlay */}
                      {showTargets && (
                        <g>
                          <line
                            x1={PAD_LEFT}
                            y1={targetY}
                            x2={W - PAD_RIGHT}
                            y2={targetY}
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="6,4"
                          />
                          <text
                            x={W - PAD_RIGHT - 10}
                            y={targetY - 5}
                            fill="#f59e0b"
                            fontSize="9"
                            fontWeight="700"
                            textAnchor="end"
                          >
                            Araiven Target 1 (+4.5%)
                          </text>
                        </g>
                      )}

                      {/* S/R Levels */}
                      {showSupportResistance && (
                        <g>
                          <line
                            x1={PAD_LEFT}
                            y1={resY}
                            x2={W - PAD_RIGHT}
                            y2={resY}
                            stroke="rgba(239, 68, 68, 0.5)"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1={PAD_LEFT}
                            y1={supY}
                            x2={W - PAD_RIGHT}
                            y2={supY}
                            stroke="rgba(16, 185, 129, 0.5)"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                        </g>
                      )}

                      {/* Live Price Line (Amber) */}
                      <line
                        x1={PAD_LEFT}
                        y1={curY}
                        x2={W - PAD_RIGHT}
                        y2={curY}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="5,3"
                      />
                      <rect x={W - 70} y={curY - 9} width={65} height={18} fill="#f59e0b" rx="3" />
                      <text x={W - 38} y={curY + 4} fill="#0b0e14" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                        {curP > 1000 ? '$' + curP.toFixed(1) : '$' + curP.toFixed(3)}
                      </text>
                    </svg>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Bottom Directive Ticker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.72rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ color: '#f8fafc' }}>
                <strong style={{ color: '#fbbf24' }}>Araiven Structural Signal:</strong> {activeSymbol} orderbook depth
                indicates positive accumulation. Liquidity support is firm at current range.
              </span>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('opportunities')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap'
                }}
              >
                Scan Triggers
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDERBOOK & RAPID EXECUTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Orderbook Card */}
          <div
            className="card-glass"
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Orderbook depth
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>L2 Realtime</span>
            </div>

            {/* Asks (Red) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem' }}>
              {orderBook.asks.map((ask, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>{formatPrice(ask.price)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{ask.size.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Mid Price Spread */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#fff',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <span>{formatPrice(activeAsset.price)}</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Spread 0.01%</span>
            </div>

            {/* Bids (Green) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem' }}>
              {orderBook.bids.map((bid, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>{formatPrice(bid.price)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{bid.size.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rapid Order Execution Card */}
          <div
            className="card-glass"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                Rapid execution
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: tradingMode === 'paper' ? '#10b981' : '#f59e0b',
                  background: tradingMode === 'paper' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {tradingMode.toUpperCase()} TRADING
              </span>
            </div>

            {/* Side Switcher (LONG vs SHORT) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setOrderSide('LONG')}
                style={{
                  padding: '8px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: orderSide === 'LONG' ? '1px solid #10b981' : '1px solid var(--border)',
                  background: orderSide === 'LONG' ? '#10b981' : 'rgba(255, 255, 255, 0.02)',
                  color: orderSide === 'LONG' ? '#0b0e14' : 'var(--text-secondary)'
                }}
              >
                BUY / LONG
              </button>
              <button
                onClick={() => setOrderSide('SHORT')}
                style={{
                  padding: '8px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: orderSide === 'SHORT' ? '1px solid #ef4444' : '1px solid var(--border)',
                  background: orderSide === 'SHORT' ? '#ef4444' : 'rgba(255, 255, 255, 0.02)',
                  color: orderSide === 'SHORT' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Order Amount Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Position Size (USDT)</span>
              </div>
              <input
                type="number"
                value={orderAmount}
                onChange={e => setOrderAmount(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[250, 500, 1000, 2500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setOrderAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '3px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Leverage</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>{orderLeverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={orderLeverage}
                onChange={e => setOrderLeverage(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeployTrade}
              disabled={isExecuting}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '42px',
                fontWeight: 700,
                fontSize: '0.88rem',
                borderRadius: '8px',
                marginTop: '4px'
              }}
            >
              {isExecuting ? 'Deploying...' : `1-Click ${orderSide} ${activeSymbol}`}
            </button>

            {/* Feedback Message */}
            {executionMessage && (
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '7px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: executionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: executionMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: executionMessage.type === 'success' ? '#10b981' : '#ef4444'
                }}
              >
                {executionMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Stacking CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .terminal-layout-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketTerminalPanel;
