export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          experience_level: 'beginner' | 'active' | 'professional' | 'intermediate' | 'advanced';
          primary_goal: string | null;
          risk_stance: 'conservative' | 'balanced' | 'aggressive';
          max_drawdown_cap: number;
          capital: number;
          provider: string | null;
          onboarding_completed: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          experience_level?: 'beginner' | 'active' | 'professional' | 'intermediate' | 'advanced';
          primary_goal?: string | null;
          risk_stance?: 'conservative' | 'balanced' | 'aggressive';
          max_drawdown_cap?: number;
          capital?: number;
          provider?: string | null;
          onboarding_completed?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          auto_hedge_enabled: boolean;
          notifications_enabled: boolean;
          execution_mode: 'advisory' | 'semi_auto' | 'auto';
          theme: 'dark' | 'light';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          auto_hedge_enabled?: boolean;
          notifications_enabled?: boolean;
          execution_mode?: 'advisory' | 'semi_auto' | 'auto';
          theme?: 'dark' | 'light';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Row']>;
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          current_balance: number;
          currency: string;
          safety_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_balance?: number;
          currency?: string;
          safety_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['portfolios']['Row']>;
      };
      portfolio_assets: {
        Row: {
          id: string;
          portfolio_id: string;
          asset_symbol: string;
          allocation_pct: number;
          balance_amount: number;
          average_entry_price: number;
          position_type: 'long' | 'short';
          leverage: number;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          asset_symbol: string;
          allocation_pct?: number;
          balance_amount?: number;
          average_entry_price?: number;
          position_type?: 'long' | 'short';
          leverage?: number;
        };
        Update: Partial<Database['public']['Tables']['portfolio_assets']['Row']>;
      };
      positions: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          current_price: number;
          quantity: number;
          leverage: number;
          unrealized_pnl: number;
          realized_pnl: number;
          stop_loss: number | null;
          take_profit: number | null;
          margin_used: number;
          liquidation_price: number | null;
          status: 'open' | 'closed';
          opened_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          current_price?: number;
          quantity: number;
          leverage?: number;
          unrealized_pnl?: number;
          realized_pnl?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          margin_used?: number;
          liquidation_price?: number | null;
          status?: 'open' | 'closed';
          opened_at?: string;
          closed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['positions']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          order_type: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT';
          price: number | null;
          quantity: number;
          status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
          filled_quantity: number;
          filled_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          order_type: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT';
          price?: number | null;
          quantity: number;
          status?: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
          filled_quantity?: number;
          filled_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      trade_history: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          exit_price: number;
          quantity: number;
          leverage: number;
          pnl_amount: number;
          pnl_percentage: number;
          opened_at: string;
          closed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          exit_price: number;
          quantity: number;
          leverage?: number;
          pnl_amount?: number;
          pnl_percentage?: number;
          opened_at?: string;
          closed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['trade_history']['Row']>;
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['watchlist']['Row']>;
      };
      watchlist_items: {
        Row: {
          id: string;
          watchlist_id: string;
          symbol: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          symbol: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['watchlist_items']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          channel: string;
          priority: 'low' | 'medium' | 'high';
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          channel: string;
          priority?: 'low' | 'medium' | 'high';
          title: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          sms_enabled: boolean;
          whatsapp_enabled: boolean;
          security_alerts: boolean;
          ai_opportunities: boolean;
          market_volatility: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          sms_enabled?: boolean;
          whatsapp_enabled?: boolean;
          security_alerts?: boolean;
          ai_opportunities?: boolean;
          market_volatility?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>;
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          target_price: number;
          condition: 'ABOVE' | 'BELOW';
          is_triggered: boolean;
          triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          target_price: number;
          condition: 'ABOVE' | 'BELOW';
          is_triggered?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['price_alerts']['Row']>;
      };
      paper_accounts: {
        Row: {
          id: string;
          user_id: string;
          account_name: string;
          current_balance: number;
          initial_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_name?: string;
          current_balance?: number;
          initial_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['paper_accounts']['Row']>;
      };
      paper_positions: {
        Row: {
          id: string;
          paper_account_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          current_price: number;
          quantity: number;
          leverage: number;
          unrealized_pnl: number;
          stop_loss: number | null;
          take_profit: number | null;
          opened_at: string;
        };
        Insert: {
          id?: string;
          paper_account_id: string;
          symbol: string;
          side: 'LONG' | 'SHORT';
          entry_price: number;
          current_price?: number;
          quantity: number;
          leverage?: number;
          unrealized_pnl?: number;
          stop_loss?: number | null;
          take_profit?: number | null;
          opened_at?: string;
        };
        Update: Partial<Database['public']['Tables']['paper_positions']['Row']>;
      };
      paper_orders: {
        Row: {
          id: string;
          paper_account_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          order_type: 'LIMIT' | 'MARKET';
          price: number | null;
          quantity: number;
          status: 'PENDING' | 'FILLED' | 'CANCELLED';
          created_at: string;
        };
        Insert: {
          id?: string;
          paper_account_id: string;
          symbol: string;
          side: 'BUY' | 'SELL';
          order_type: 'LIMIT' | 'MARKET';
          price?: number | null;
          quantity: number;
          status?: 'PENDING' | 'FILLED' | 'CANCELLED';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['paper_orders']['Row']>;
      };
      market_cache: {
        Row: {
          symbol: string;
          name: string;
          price: number;
          change_24h: number;
          volume_24h: number;
          market_cap: number;
          last_updated: string;
        };
        Insert: {
          symbol: string;
          name: string;
          price?: number;
          change_24h?: number;
          volume_24h?: number;
          market_cap?: number;
          last_updated?: string;
        };
        Update: Partial<Database['public']['Tables']['market_cache']['Row']>;
      };
      ai_memory: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_memory']['Row']>;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          summary: string | null;
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          summary?: string | null;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_conversations']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          payload: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          payload?: any | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'dark' | 'light';
          dashboard_layout: string;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'dark' | 'light';
          dashboard_layout?: string;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>;
      };
    };
  };
}
