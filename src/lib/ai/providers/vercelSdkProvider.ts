import { generateObject, generateText } from 'ai';
import { DecomposeResponse, DecomposeSchema, AIProvider } from '../types';
import { SYSTEM_PROMPT } from '../prompt';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai, createOpenAI } from '@ai-sdk/openai';

export class VercelSdkProvider implements AIProvider {
  constructor(
    public name: string,
    private modelName?: string
  ) {}

  private getModelInstance() {
    const provider = this.name.toLowerCase();
    
    switch (provider) {
      case 'google':
      case 'gemini': {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing GEMINI_API_KEY environment variable.");
        }
        return google(this.modelName || 'gemini-1.5-flash');
      }
      
      case 'anthropic':
      case 'claude': {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
        }
        return anthropic(this.modelName || 'claude-3-5-sonnet-latest');
      }
      
      case 'deepseek': {
        const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing DEEPSEEK_API_KEY or OPENAI_API_KEY environment variable.");
        }
        const deepseekClient = createOpenAI({
          name: 'deepseek',
          apiKey,
          baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        });
        return deepseekClient.chat(this.modelName || 'deepseek-chat');
      }
      
      case 'openai':
      default: {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing OPENAI_API_KEY environment variable.");
        }
        const openaiClient = createOpenAI({
          apiKey,
          baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        });
        return openaiClient.chat(this.modelName || 'gpt-4o-mini');
      }
    }
  }

  public async decompose(inputText: string): Promise<DecomposeResponse> {
    const isDeepseek = this.name.toLowerCase() === 'deepseek';
    try {
      const model = this.getModelInstance();

      if (isDeepseek) {
        const systemPrompt = `${SYSTEM_PROMPT}

You MUST respond with a JSON object ONLY, matching this schema:
{
  "entity_title": "string",
  "entity_type": "project | goal | habit | asset",
  "today_focus": "string",
  "why_focus": "string",
  "tasks": [
    {
      "title": "string starting with an active verb, under 30 minutes",
      "estimated_minutes": number between 5 and 30,
      "priority": "P1 | P2 | P3",
      "done_criteria": "string (the objective definition of finished for this specific action)"
    }
  ]
}

Ensure your response is raw JSON only. Do not wrap it in markdown code blocks like \`\`\`json.`;

        const { text } = await generateText({
          model,
          system: systemPrompt,
          prompt: `请对以下内容进行认知捕获与原子行动拆解，用户大脑中的混乱输入为：\n\n"${inputText}"`,
        });

        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          const lines = cleanText.split('\n');
          if (lines[0].startsWith('```')) {
            lines.shift();
          }
          if (lines[lines.length - 1].startsWith('```')) {
            lines.pop();
          }
          cleanText = lines.join('\n').trim();
        }

        const parsed = JSON.parse(cleanText);
        return DecomposeSchema.parse(parsed);
      }

      const { object } = await generateObject({
        model,
        schema: DecomposeSchema,
        system: SYSTEM_PROMPT,
        prompt: `请对以下内容进行认知捕获与原子行动拆解，用户大脑中的混乱输入为：\n\n"${inputText}"`,
      });
      return object;
    } catch (error) {
      console.error(`Vercel AI SDK [${this.name}] generation failed, throwing standard error:`, error);
      throw error;
    }
  }
}
