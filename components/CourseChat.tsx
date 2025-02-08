"use client"

import React, { useRef, useEffect, useState } from 'react';
import { useChat, Message } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { models, DEFAULT_MODEL_KEY, getAvailableProviders, getModelsByProvider } from '@/lib/models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

interface CourseChatProps {
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  chapterTitle: string;
  /** Optional: allow selecting the AI model */
  initialModelKey?: string;
}

const CourseChat = ({
  courseId,
  courseTitle,
  lessonTitle,
  chapterTitle,
  initialModelKey = DEFAULT_MODEL_KEY,
}: CourseChatProps) => {
  const [selectedModel, setSelectedModel] = useState(initialModelKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      courseId,
      courseTitle,
      lessonTitle,
      chapterTitle,
      modelKey: selectedModel,
    },
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up a mutation observer to watch for content changes
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const target = chatContainerRef.current;
    const observer = new MutationObserver((mutations) => {
      scrollToBottom();
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-[600px] w-full rounded-lg shadow-lg bg-background text-foreground">
      <div className="p-4 rounded-t-lg bg-secondary text-secondary-foreground">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Course Chat</h2>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Model">
                {selectedModel ? models[selectedModel].displayName : "Select Model"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {getAvailableProviders().map((provider) => (
                <SelectGroup key={provider}>
                  <SelectLabel className="capitalize">{provider}</SelectLabel>
                  {Object.entries(getModelsByProvider(provider)).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.displayName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask questions about {lessonTitle} from {chapterTitle} in {courseTitle}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={chatContainerRef} className="p-4 space-y-4">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 max-w-[80%] transition-all duration-300',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-px" />
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t rounded-b-lg bg-card border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about the course..."
            className="flex-1 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-ring bg-input border border-border text-foreground"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="rounded-lg px-4 py-2 transition-all duration-300 bg-primary text-primary-foreground"
            disabled={isLoading}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseChat; 