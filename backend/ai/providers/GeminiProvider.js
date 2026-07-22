import { AiServiceInterface } from '../AiServiceInterface.js';

export class GeminiProvider extends AiServiceInterface {
  constructor() {
    super('Gemini');
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async sendRequest(contents, options = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini API Key is not configured in environment variables');
    }

    const { stream = false, onChunk = null, jsonMode = false, systemInstruction = '', systemPrompt = '' } = options;
    const activeSystemInstruction = systemInstruction || systemPrompt;
    
    const action = stream ? 'streamGenerateContent' : 'generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:${action}?key=${this.apiKey}`;

    // Format input contents to match Gemini API specification (supporting both OpenAI-style and Gemini-style arrays)
    const formattedContents = Array.isArray(contents) 
      ? contents.map(item => {
          if (item.parts && Array.isArray(item.parts)) {
            return {
              role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
              parts: item.parts
            };
          }
          const textVal = item.content || item.text || '';
          return {
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: textVal }]
          };
        })
      : [];

    const body = {
      contents: formattedContents
    };

    if (activeSystemInstruction) {
      body.systemInstruction = {
        parts: [{ text: activeSystemInstruction }]
      };
    }

    if (jsonMode) {
      body.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.error?.message || `Gemini API returned status ${res.status}`);
    }

    if (stream && onChunk) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Gemini stream returns JSON structures separated by comma or inside a list
        // Let's parse text chunks using regex or character scans
        // A simple robust approach is to look for "text": "..." entries
        let match;
        const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        while ((match = regex.exec(buffer)) !== null) {
          try {
            // Unescape text chunk
            const text = JSON.parse(`"${match[1]}"`);
            onChunk(text);
          } catch (e) {
            // skip
          }
        }
        // Keep only unresolved tail
        buffer = buffer.substring(regex.lastIndex);
        regex.lastIndex = 0;
      }
      return null;
    } else {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
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

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
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

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
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

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
    return JSON.parse(result);
  }

  async chat(userId, message, conversationHistory = []) {
    const systemInstruction = 'You are Araiven, Ravora\'s active AI wealth copilot. Help the user audit assets, risk stances, and yields.';
    const contents = [
      ...conversationHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const reply = await this.sendRequest(contents, { systemInstruction });
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

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
    return JSON.parse(result);
  }

  async analyzeAsset(symbol, context) {
    const prompt = `Perform a technical asset analysis for ${symbol.toUpperCase()}:
Context: ${JSON.stringify(context)}
Provide response in strict JSON format matching the single asset analysis schema.`;

    const systemInstruction = 'You are Araiven, Ravora\'s institutional AI investment analyst. Output only valid JSON.';
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const result = await this.sendRequest(contents, { systemInstruction, jsonMode: true });
    return JSON.parse(result);
  }
}
