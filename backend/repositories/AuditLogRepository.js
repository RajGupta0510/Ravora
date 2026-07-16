import { BaseRepository } from './BaseRepository.js';

export class AuditLogRepository extends BaseRepository {
  constructor() { super('audit_logs'); }

  async log(userId, action, resource, resourceId = null, metadata = null, ipAddress = null) {
    return this.create({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      metadata,
      ip_address: ipAddress,
    });
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({
      filters: { user_id: userId },
      sortBy: 'created_at',
      sortOrder: 'desc',
      ...options,
    });
  }
}
