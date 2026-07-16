import { BaseRepository } from './BaseRepository.js';

export class PaperTradingRepository extends BaseRepository {
  constructor() { super('paper_accounts'); }

  async findAccountByUserId(userId) {
    return this.findOne({ user_id: userId });
  }

  async getOrCreateAccount(userId) {
    let account = await this.findAccountByUserId(userId);
    if (!account) {
      account = await this.create({
        user_id: userId,
        balance: 100000.00,
        initial_balance: 100000.00,
        currency: 'USD',
      });
    }
    return account;
  }

  async getOpenPositions(accountId) {
    const { data, error } = await this.db
      .from('paper_positions')
      .select('*')
      .eq('paper_account_id', accountId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getClosedPositions(accountId, limit = 50) {
    const { data, error } = await this.db
      .from('paper_positions')
      .select('*')
      .eq('paper_account_id', accountId)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async createPosition(positionData) {
    const { data, error } = await this.db
      .from('paper_positions')
      .insert(positionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async closePosition(positionId, exitPrice, pnl) {
    const { data, error } = await this.db
      .from('paper_positions')
      .update({
        status: 'closed',
        exit_price: exitPrice,
        pnl,
        closed_at: new Date().toISOString(),
      })
      .eq('id', positionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateAccountBalance(accountId, newBalance) {
    return this.update(accountId, { balance: newBalance });
  }
}
