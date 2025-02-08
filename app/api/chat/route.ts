import { convertToCoreMessages, streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { messages, courseId, courseTitle, lessonTitle, chapterTitle } = await req.json();
  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
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
  });

  return result.toDataStreamResponse();
}
