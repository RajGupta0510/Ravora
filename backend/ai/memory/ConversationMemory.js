import { AIConversationsRepository } from '../../repositories/AIConversationsRepository.js';
import { getSupabaseAdmin } from '../../config/database.js';
import crypto from 'crypto';

const convRepo = new AIConversationsRepository();

export const ConversationMemory = {
  /**
   * Retrieves or initializes a conversation thread.
   */
  async getOrCreateConversation(userId, conversationId = null) {
    if (conversationId && conversationId !== 'new') {
      const conv = await convRepo.findById(conversationId);
      if (conv && conv.user_id === userId) {
        return conv;
      }
    }

    if (conversationId !== 'new') {
      // Try finding the user's most recent conversation first
      const list = await convRepo.findByUserId(userId);
      if (list && list.length > 0) {
        return list[0];
      }
    }

    // Create a new default conversation thread
    const newConv = await convRepo.createConversation(userId, 'Araiven Financial Analysis');
    return newConv;
  },

  /**
   * Saves a user message to the conversation thread.
   */
  async saveUserMessage(userId, conversationId, text) {
    const conv = await this.getOrCreateConversation(userId, conversationId);
    const messages = conv.messages || [];
    
    messages.push({
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    });

    await convRepo.updateConversationMessages(conv.id, messages);
    return conv.id;
  },

  /**
   * Saves Araiven's reply response to the conversation thread.
   */
  async saveCopilotMessage(userId, conversationId, text, statsMeta = '') {
    const conv = await this.getOrCreateConversation(userId, conversationId);
    const messages = conv.messages || [];
    
    messages.push({
      id: crypto.randomUUID(),
      sender: 'copilot',
      text,
      statsMeta,
      timestamp: new Date().toISOString()
    });

    await convRepo.updateConversationMessages(conv.id, messages);
    return conv.id;
  },

  /**
   * Retrieves the last N messages formatted for prompt feeding.
   */
  async getRecentHistory(userId, conversationId, limit = 10) {
    const conv = await this.getOrCreateConversation(userId, conversationId);
    const messages = conv.messages || [];
    return messages.slice(-limit);
  },

  /**
   * Retrieves user context details: risk profile, preferred markets, currency, etc.
   */
  async getUserStanceContext(userId) {
    const db = getSupabaseAdmin();
    
    const { data: profile } = await db
      .from('profiles')
      .select('risk_stance, max_drawdown_cap, preferred_markets, preferred_currency, timezone')
      .eq('id', userId)
      .maybeSingle();

    return {
      riskStance: profile?.risk_stance || 'balanced',
      maxDrawdown: parseFloat(profile?.max_drawdown_cap || 3.5),
      preferredMarkets: profile?.preferred_markets ? JSON.parse(profile?.preferred_markets) : ['BTCUSDT', 'ETHUSDT'],
      preferredCurrency: profile?.preferred_currency || 'USD',
      timezone: profile?.timezone || 'UTC'
    };
  }
};
