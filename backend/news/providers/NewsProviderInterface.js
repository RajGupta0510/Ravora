/**
 * News Provider Interface Base Class
 * Defines the contract that all news sources must implement.
 */

export class NewsProviderInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetches latest news articles.
   * @returns {Promise<Array<object>>} Array of formatted news articles
   */
  async fetchLatestNews() {
    throw new Error(`${this.name}: fetchLatestNews() is not implemented`);
  }
}
