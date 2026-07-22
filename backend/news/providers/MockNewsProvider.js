import { NewsProviderInterface } from './NewsProviderInterface.js';

export class MockNewsProvider extends NewsProviderInterface {
  constructor() {
    super('Ravora News (Mock Sandbox)');
  }

  async fetchLatestNews() {
    return [
      {
        title: "SEC Officially Approves Spot Solana ETFs in Historic Regulatory Pivot",
        content: "In a major surprise announcement, the Securities and Exchange Commission has approved the first spot Solana ETFs. Analysts expect significant inflows into SOL layer-1 assets over the next quarter.",
        url: "https://ravoranews.mock/solana-etf-approval",
        source: "Bloomberg (Simulated)",
        category: "regulation",
        published_at: new Date(Date.now() - 5 * 60000).toISOString() // 5m ago
      },
      {
        title: "Bitcoin Breakout Confirmed as Institutional Inflows Cross $2B Mark",
        content: "Bitcoin price surged past previous consolidation zones today. Onchain metrics show strong accumulation trends by institutional custody wallets, confirming bullish momentum is intact.",
        url: "https://ravoranews.mock/btc-institutional-breakout",
        source: "CoinDesk (Simulated)",
        category: "macro",
        published_at: new Date(Date.now() - 15 * 60000).toISOString() // 15m ago
      },
      {
        title: "Major DeFi Protocol on Ethereum Exploited for $45M in Flash Loan Attack",
        content: "Security researchers confirm a smart contract vulnerability in a leading Ethereum yield farm has been exploited. The attacker drained liquidity pools, causing a sharp dump in the utility token price.",
        url: "https://ravoranews.mock/eth-defi-exploit-hack",
        source: "Cointelegraph (Simulated)",
        category: "DeFi",
        published_at: new Date(Date.now() - 35 * 60000).toISOString() // 35m ago
      },
      {
        title: "Sui Network TVL Hits Record High Amid Successful Upgrade Performance",
        content: "Sui Network transaction volume surpassed Solana today after its latest mainnet upgrade. Capital efficiency and low transaction costs are driving decentralized exchange volume to record highs.",
        url: "https://ravoranews.mock/sui-network-tvl-record",
        source: "Binance News (Simulated)",
        category: "L1",
        published_at: new Date(Date.now() - 60 * 60000).toISOString() // 1h ago
      },
      {
        title: "Chainlink (LINK) Integrates with Major Banking Network for Cross-Chain Assets",
        content: "Chainlink's CCIP protocol has completed a successful trial integration with institutional settlement systems. The deal expands global smart contract interoperability and utility values.",
        url: "https://ravoranews.mock/chainlink-ccip-banking-integration",
        source: "Bloomberg (Simulated)",
        category: "DeFi",
        published_at: new Date(Date.now() - 120 * 60000).toISOString() // 2h ago
      }
    ];
  }
}
export default MockNewsProvider;
