// OpenRouter API integration for AI content generation
import { supabase } from './supabase';

// Types for OpenRouter API
interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
  }[];
  error?: {
    message: string;
  };
}

export interface VideoIdea {
  title: string;
  description: string;
  targetAudience: string;
  keyPoints: string[];
  potentialTags: string[];
  marketingAngles: string[];
}

// Keep defaults on free OpenRouter-compatible models.
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free';
const FALLBACK_MODEL = import.meta.env.VITE_OPENROUTER_FALLBACK_MODEL || 'google/gemma-4-31b-it:free';
const DEFAULT_OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const ENV_OPENROUTER_ENDPOINT = import.meta.env.VITE_OPENROUTER_ENDPOINT;
const OPENROUTER_ENDPOINT =
  typeof ENV_OPENROUTER_ENDPOINT === 'string' &&
  ENV_OPENROUTER_ENDPOINT.includes('/api/v1/chat/completions')
    ? ENV_OPENROUTER_ENDPOINT
    : DEFAULT_OPENROUTER_ENDPOINT;

// Get API key from environment or database
export const getApiKey = async (): Promise<string> => {
  // First try to get from environment
  const envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envApiKey) return envApiKey;
  
  // If not in environment, try to get from database settings
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'openrouter_api_key')
      .single();
    
    if (error) throw error;
    if (data?.value) return data.value;
  } catch (error) {
    console.error('Failed to get API key from database:', error);
  }
  
  return '';
};

// Generate script using OpenRouter API
export const generateScript = async (
  videoTitle: string,
  keywords: string,
  targetAudience: string,
  videoLength: string,
  contentType: string
): Promise<string> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('OpenRouter API key not found');
    }

    // Create a system message to set the context
    const systemMessage = {
      role: 'system' as const,
      content: 'You are an expert YouTube scriptwriter who creates engaging, well-structured video scripts. Your scripts are natural, conversational, and optimized for the specified audience.'
    };

    // Create the user prompt
    const userMessage = {
      role: 'user' as const,
      content: `Create a complete YouTube script with the following details:

Title: ${videoTitle}
Keywords: ${keywords}
Target Audience: ${targetAudience}
Video Length: ${videoLength} minutes
Content Type: ${contentType}

Requirements:
- Start with a catchy intro that hooks viewers
- Include the keywords naturally throughout the script
- Match the tone and style to the audience and content type
- Structure the script with clear sections
- End with a strong call-to-action
- Include timestamps for a ${videoLength}-minute video

Please format the script in a clean, easy-to-read format.`
    };

    try {
      const tryModel = async (model: string) => {
        const request: OpenRouterRequest = {
          model,
          temperature: 0.7,
          messages: [systemMessage, userMessage],
          stream: false
        };

        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'SmartTube AI'
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        return response.json() as Promise<OpenRouterResponse>;
      };

      let data: OpenRouterResponse;
      try {
        data = await tryModel(MODEL);
      } catch (primaryError) {
        console.warn(`Primary model failed (${MODEL}), retrying with ${FALLBACK_MODEL}.`, primaryError);
        data = await tryModel(FALLBACK_MODEL);
      }
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response received from the AI model');
      }

      // Get the raw content from the API response
      let content = data.choices[0].message.content;
      
      // Remove formatting characters
      content = content.replace(/^\\boxed\{\s*```markdown\s*/i, '');
      content = content.replace(/^\\boxed\{\s*```text\s*/i, '');
      content = content.replace(/```\s*\}\s*$/i, '');
      content = content.replace(/^```markdown\s*/i, '');
      content = content.replace(/^```text\s*/i, '');
      content = content.replace(/```\s*$/i, '');
      content = content.replace(/^\\boxed\{\s*/i, '');
      content = content.replace(/\}\s*$/i, '');
      
      return content;
    } catch (error) {
      console.error('Script generation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Script generation error:', error);
    throw error;
  }
};
