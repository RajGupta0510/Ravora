import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface PortfolioAsset {
  id: string;
  asset_symbol: string;
  allocation_pct: number;
  balance_amount: number;
  average_entry_price: number;
  position_type: string;
  leverage: number;
  current_price?: number;
  unrealized_pnl?: number;
}

export interface Opportunity {
  opportunityId: string;
  type: string;
  name: string;
  symbol: string;
  icon: string;
  confidenceScore: number;
  riskScore: number;
  riskLevel: string;
  expectedReturn: string;
  reasoningText: string;
  suggestedEntry?: number;
  suggestedStopLoss?: number;
  suggestedTakeProfit?: number;
  suggestedTakeProfit1?: number;
  suggestedTakeProfit2?: number;
  suggestedTakeProfit3?: number;
  expectedDuration?: string;
  riskRewardRatio?: string;
  trendDirection?: string;
  trendStrength?: string;
  supportLevels?: number[];
  resistanceLevels?: number[];
  tradeProbability?: number;
  strategyUsed?: string;
  tradeQuality?: string;
  nearestSupport?: number;
  nearestResistance?: number;
  distanceToSupport?: number;
  distanceToResistance?: number;
  marketBias?: string;
}

export interface Recommendation {
  id: string;
  opportunity_id: string;
  suggested_allocation_pct: number;
  status: string;
  created_at: string;
  opportunity?: Opportunity;
}

export interface Notification {
  id: string;
  channel: string;
  priority: string;
  title: string;
  body: string;
  is_read: number;
  created_at: string;
}

export interface PaperPosition {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  marginUsed: number;
  unrealizedPnl: number;
  realizedPnl: number;
  stopLoss: number | null;
  takeProfit: number | null;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

interface UserProfile {
  experience_level: string;
  primary_goal: string;
  risk_stance: string;
  max_drawdown_cap: number;
  capital: number;
}

interface AppSettings {
  auto_hedge_enabled: number;
  notifications_enabled: number;
  execution_mode: string;
}

interface AppContextType {
  profile: UserProfile | null;
  settings: AppSettings | null;
  portfolioBalance: number;
  safetyScore: number;
  portfolioAssets: PortfolioAsset[];
  portfolioHistory: { timestamp: string; balance: number }[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  notifications: Notification[];
  paperPositions: PaperPosition[];
  paperHistory: PaperPosition[];
  copilotHistory: { sender: 'user' | 'copilot'; text: string; actionHtml?: string }[];
  marketOverview: any[];
  marketSummary: any;
  loading: boolean;
  onboardUser: (experience: string, capital: number, riskLevel: number, goal: string) => Promise<boolean>;
  updateSettings: (executionMode: string, autoHedgeEnabled: boolean, notificationsEnabled: boolean) => Promise<boolean>;
  fetchDashboardData: () => Promise<void>;
  scanMarkets: () => Promise<void>;
  executeRecommendation: (recId: string) => Promise<boolean>;
  deployOpportunity: (symbol: string, side: 'LONG' | 'SHORT', amount: number, leverage: number, stopLoss: number | null, takeProfit: number | null) => Promise<boolean>;
  closePaperPosition: (positionId: string) => Promise<boolean>;
  closeAllPaperPositions: () => Promise<boolean>;
  sendCopilotMessage: (text: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  connectExchangeKey: (exchangeName: string, apiKey: string, apiSecret: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, updateOnboardingCompletedState } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [portfolioBalance, setPortfolioBalance] = useState<number>(0);
  const [safetyScore, setSafetyScore] = useState<number>(100);
  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<{ timestamp: string; balance: number }[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([]);
  const [paperHistory, setPaperHistory] = useState<PaperPosition[]>([]);
  const [marketOverview, setMarketOverview] = useState<any[]>([]);
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copilotHistory, setCopilotHistory] = useState<{ sender: 'user' | 'copilot'; text: string; actionHtml?: string }[]>([
    { sender: 'copilot', text: 'Hello! I am Araiven, your AI wealth manager. I am continuously auditing market trends, support vectors, and risk cushions. How can I assist you today?' }
  ]);

  const API_BASE = '/v1';

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  const fetchDashboardData = async () => {
    if (!token || !user) return;
    try {
      setLoading(true);
      // 1. Get profile
      const profRes = await fetchWithAuth(`${API_BASE}/user/profile`);
      if (profRes.ok) {
        const data = await profRes.json();
        if (data.onboardingCompleted) {
          setProfile(data.profile);
          setSettings(data.settings);
          updateOnboardingCompletedState(true);
        } else {
          setProfile(null);
          setSettings(null);
          updateOnboardingCompletedState(false);
          setLoading(false);
          return;
        }
      }

      // 2. Portfolio overview
      const portRes = await fetchWithAuth(`${API_BASE}/portfolio`);
      if (portRes.ok) {
        const data = await portRes.json();
        setPortfolioBalance(data.currentBalance || 0);
        setSafetyScore(data.safetyScore || 96);
        setPortfolioAssets(data.assets || []);
      }

      // 3. Portfolio history
      const histRes = await fetchWithAuth(`${API_BASE}/portfolio/history`);
      if (histRes.ok) {
        const data = await histRes.json();
        setPortfolioHistory(data.history || []);
      }

      // 4. Opportunities scanner
      const oppRes = await fetchWithAuth(`${API_BASE}/opportunities`);
      if (oppRes.ok) {
        const data = await oppRes.json();
        setOpportunities(data || []);
      }

      // 5. Araiven recommendations
      const recRes = await fetchWithAuth(`${API_BASE}/opportunities/recommendations`);
      if (recRes.ok) {
        const data = await recRes.json();
        setRecommendations(data || []);
      }

      // 6. Notifications
      const notRes = await fetchWithAuth(`${API_BASE}/notifications`);
      if (notRes.ok) {
        const data = await notRes.json();
        setNotifications(data || []);
      }

      // 7. Paper Trading Positions
      const paperRes = await fetchWithAuth(`${API_BASE}/paper/positions`);
      if (paperRes.ok) {
        const data = await paperRes.json();
        setPaperPositions(data || []);
      }

      // 8. Paper Trading History
      const paperHistRes = await fetchWithAuth(`${API_BASE}/paper/history`);
      if (paperHistRes.ok) {
        const data = await paperHistRes.json();
        setPaperHistory(data || []);
      }

      // 9. Market overview & summary
      const mktRes = await fetch(`${API_BASE}/market/overview`);
      if (mktRes.ok) {
        const data = await mktRes.json();
        setMarketOverview(data);
      }

      const mktSumRes = await fetch(`${API_BASE}/market/summary`);
      if (mktSumRes.ok) {
        const data = await mktSumRes.json();
        setMarketSummary(data);
      }

    } catch (err) {
      console.error('[Fetch dashboard error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.onboardingCompleted) {
      fetchDashboardData();
      
      // Setup live refresh interval (every 10s for balances / prices / paper positions)
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [token, user?.onboardingCompleted]);

  const onboardUser = async (experience: string, capital: number, riskLevel: number, goal: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/user/onboard`, {
        method: 'POST',
        body: JSON.stringify({ experience, capital, riskLevel, goal })
      });

      if (res.ok) {
        updateOnboardingCompletedState(true);
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Onboarding API error]', err);
      return false;
    }
  };

  const updateSettings = async (executionMode: string, autoHedgeEnabled: boolean, notificationsEnabled: boolean) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/user/settings`, {
        method: 'POST',
        body: JSON.stringify({
          executionMode,
          autoHedgeEnabled: autoHedgeEnabled ? 1 : 0,
          notificationsEnabled: notificationsEnabled ? 1 : 0
        })
      });

      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Settings API error]', err);
      return false;
    }
  };

  const scanMarkets = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/market/scan`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('[Market scan API error]', err);
    } finally {
      setLoading(false);
    }
  };

  const executeRecommendation = async (recId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/recommendations/${recId}/execute`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Execute recommendation error]', err);
      return false;
    }
  };

  const deployOpportunity = async (
    symbol: string,
    side: 'LONG' | 'SHORT',
    amount: number,
    leverage: number,
    stopLoss: number | null,
    takeProfit: number | null
  ) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/opportunities/deploy`, {
        method: 'POST',
        body: JSON.stringify({ symbol, side, amount, leverage, stopLoss, takeProfit })
      });
      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Deploy opportunity error]', err);
      return false;
    }
  };

  const closePaperPosition = async (positionId: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/paper/positions/${positionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Close paper position error]', err);
      return false;
    }
  };

  const closeAllPaperPositions = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/paper/positions`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Close all paper positions error]', err);
      return false;
    }
  };

  const sendCopilotMessage = async (text: string) => {
    // 1. Add user message
    setCopilotHistory(prev => [...prev, { sender: 'user', text }]);
    
    try {
      const res = await fetchWithAuth(`${API_BASE}/copilot/message`, {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotHistory(prev => [
          ...prev,
          { 
            sender: 'copilot', 
            text: data.reply,
            actionHtml: data.actionHtml 
          }
        ]);
      } else {
        setCopilotHistory(prev => [
          ...prev,
          { sender: 'copilot', text: 'Sorry, I encountered an issue while auditing that request. Please try again.' }
        ]);
      }
    } catch (err) {
      console.error('[Copilot message error]', err);
      setCopilotHistory(prev => [
        ...prev,
        { sender: 'copilot', text: 'Network exception. Connection is temporarily offline.' }
      ]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/notifications/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error('[Mark notifications read error]', err);
    }
  };

  const connectExchangeKey = async (exchangeName: string, apiKey: string, apiSecret: string) => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/settings/exchanges`, {
        method: 'POST',
        body: JSON.stringify({ exchangeName, apiKey, apiSecret })
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to connect exchange API.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred connecting exchange.' };
    }
  };

  return (
    <AppContext.Provider value={{
      profile,
      settings,
      portfolioBalance,
      safetyScore,
      portfolioAssets,
      portfolioHistory,
      opportunities,
      recommendations,
      notifications,
      paperPositions,
      paperHistory,
      copilotHistory,
      marketOverview,
      marketSummary,
      loading,
      onboardUser,
      updateSettings,
      fetchDashboardData,
      scanMarkets,
      executeRecommendation,
      deployOpportunity,
      closePaperPosition,
      closeAllPaperPositions,
      sendCopilotMessage,
      markNotificationsAsRead,
      connectExchangeKey
    }}>
      {children}
    </AppContext.Provider>
  );
};
