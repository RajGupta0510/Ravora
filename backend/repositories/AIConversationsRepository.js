import { BaseRepository } from './BaseRepository.js';

export class AIConversationsRepository extends BaseRepository {
  constructor() {
    super('ai_conversations');
  }

  async findByUserId(userId) {
    const { data } = await this.findAll({
      filters: { user_id: userId },
      sortBy: 'updated_at',
      sortOrder: 'desc',
      limit: 50
    });
    return data;
  }

  async createConversation(userId, title = 'New Conversation', messages = []) {
    return this.create({
      user_id: userId,
      title,
      messages
    });
  }

  async updateConversationMessages(conversationId, messages) {
    return this.update(conversationId, {
      messages,
      updated_at: new Date().toISOString()
    });
  }
}
