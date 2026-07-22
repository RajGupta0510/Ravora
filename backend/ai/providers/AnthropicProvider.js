import { AiServiceInterface } from '../AiServiceInterface.js';

export class AnthropicProvider extends AiServiceInterface {
  constructor() {
    super('Anthropic');
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
  }

  async sendRequest(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('Anthropic API Key is not configured in environment variables');
    }

    const { stream = false, onChunk = null, systemPrompt = '' } = options;

    const body = {
      model: this.model,
      max_tokens: 2000,
      messages,
      stream
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const headers = {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.error?.message || `Anthropic API returned status ${res.status}`);
    }

    if (stream && onChunk) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(cleanLine.substring(6));
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                onChunk(parsed.delta.text);
              }
            } catch (err) {
              // skip parse errors
            }
          }
        }
      }
      return null;
    } else {
      const data = await res.json();
      return data.content?.[0]?.text || '';
    }
  }

  async analyzePortfolio(portfolio, marketData) {
    const prompt = `Perform a detailed portfolio review:
Portfolio: ${JSON.stringify(portfolio)}
Market Data: ${JSON.stringify(marketData)}
Provide response in strict JSON format:
{
  "summary": "overall summary",
  "healthScore": 85,
  "diversificationAnalysis": "details",
  "recommendations": ["rec1", "rec2"]
}`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }

  async reviewTrade(trade, context) {
    const prompt = `Review the following trade:
Trade details: ${JSON.stringify(trade)}
Context: ${JSON.stringify(context)}
Provide response in strict JSON format:
{
  "verdict": "approve" | "warn" | "reject",
  "reasoning": "why",
  "confidence": 85,
  "riskLevel": "low" | "medium" | "high"
}`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }

  async summarizeMarket(marketData) {
    const prompt = `Summarize the following market conditions:
Market Data: ${JSON.stringify(marketData)}
Provide response in strict JSON format:
{
  "summary": "narrative summary",
  "sentiment": "bullish" | "bearish" | "neutral",
  "keyInsights": ["insight1", "insight2"]
}`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }

  async assessRisk(positions, marketConditions) {
    const prompt = `Assess the risk profiles for these active positions:
Positions: ${JSON.stringify(positions)}
Market Conditions: ${JSON.stringify(marketConditions)}
Provide response in strict JSON format:
{
  "overallRisk": "low" | "moderate" | "high",
  "score": 75,
  "warnings": ["warn1"],
  "suggestions": ["sug1"]
}`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }

  async chat(userId, message, conversationHistory = []) {
    const systemPrompt = 'You are Araiven, Ravora\'s active AI wealth copilot. Help the user audit assets, risk stances, and yields.';
    const messages = [
      ...conversationHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: message }
    ];

    const reply = await this.sendRequest(messages, { systemPrompt });
    return { reply, actionHtml: null };
  }

  async generateRecommendations(userId, portfolio, opportunities) {
    const prompt = `Review opportunities and formulate target allocations:
Portfolio: ${JSON.stringify(portfolio)}
Opportunities: ${JSON.stringify(opportunities)}
Provide response in strict JSON format as an array of recommendations:
[
  {
    "opportunityId": "id",
    "suggested_allocation_pct": 5.0,
    "reasoning": "why"
  }
]`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }

  async analyzeAsset(symbol, context) {
    const prompt = `Perform a technical asset analysis for ${symbol.toUpperCase()}:
Context: ${JSON.stringify(context)}
Provide response in strict JSON format matching the single asset analysis schema.`;

    const systemPrompt = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const messages = [{ role: 'user', content: prompt }];
    const result = await this.sendRequest(messages, { systemPrompt });
    return JSON.parse(result);
  }
}
