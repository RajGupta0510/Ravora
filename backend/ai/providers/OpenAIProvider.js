import { AiServiceInterface } from '../AiServiceInterface.js';
import env from '../../config/environment.js';

export class OpenAIProvider extends AiServiceInterface {
  constructor() {
    super('OpenAI');
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async sendRequest(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key is not configured in environment variables');
    }

    const { stream = false, onChunk = null, jsonMode = false } = options;

    const body = {
      model: this.model,
      messages,
      stream
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.error?.message || `OpenAI API returned status ${res.status}`);
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
        
        // Save the last partial line back to the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || cleanLine === 'data: [DONE]') continue;
          if (cleanLine.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(cleanLine.substring(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch (err) {
              // skip parse errors
            }
          }
        }
      }
      return null;
    } else {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
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
    
    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
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

    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
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

    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
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

    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
    return JSON.parse(result);
  }

  async chat(userId, message, conversationHistory = []) {
    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s active AI wealth copilot. Help the user audit assets, risk stances, and yields.' },
      ...conversationHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: message }
    ];

    const reply = await this.sendRequest(messages);
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

    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
    return JSON.parse(result);
  }

  async analyzeAsset(symbol, context) {
    const prompt = `Perform a technical asset analysis for ${symbol.toUpperCase()}:
Context: ${JSON.stringify(context)}
Provide response in strict JSON format matching the single asset analysis schema.`;

    const messages = [
      { role: 'system', content: 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.' },
      { role: 'user', content: prompt }
    ];

    const result = await this.sendRequest(messages, { jsonMode: true });
    return JSON.parse(result);
  }
}
