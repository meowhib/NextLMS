import { convertToCoreMessages, smoothStream, streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { deepseek } from '@ai-sdk/deepseek';
import { getModelConfig } from '@/lib/models';

// Provider-specific client initialization
const providers = {
  groq: groq,
  openai: openai,
  anthropic: anthropic,
  deepseek: deepseek,
} as const;

export async function POST(req: Request) {
  const { messages, courseId, courseTitle, lessonTitle, chapterTitle, modelKey } = await req.json();
  
  // Get model configuration including provider and model ID
  const modelConfig = getModelConfig(modelKey);
  
  // Get the appropriate provider client
  const provider = providers[modelConfig.provider];
  
  const result = await streamText({
    model: provider(modelConfig.modelId),
    system: `You are a helpful AI tutor for the course "${courseTitle}". You are currently helping with the lesson "${lessonTitle}" from chapter "${chapterTitle}".
             Your role is to:
             1. Answer questions about the current lesson content
             2. Provide additional explanations and examples
             3. Help students understand difficult concepts
             4. Suggest practice exercises related to the lesson
             5. Connect current lesson concepts with previous course material
             
             Keep your responses focused on the current chapter and lesson context while relating it to the broader course material when relevant.
             Make your explanations clear, concise, and tailored to the student's learning needs.`,
    messages: convertToCoreMessages(messages),
    experimental_transform: smoothStream({
      delayInMs: 20, 
      chunking: 'word',
    }),  
  });

  return result.toDataStreamResponse();
}
