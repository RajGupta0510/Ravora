import { BaseRepository } from './BaseRepository.js';

export class PatternStatisticRepository extends BaseRepository {
  constructor() {
    super('pattern_statistics');
  }

  async findByPatternName(patternName) {
    const { data } = await this.findAll({ filters: { pattern_name: patternName } });
    return data || [];
  }
}
