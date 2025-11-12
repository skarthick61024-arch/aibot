import type { Chat } from '@google/genai';

export interface ImagePart {
  mimeType: string;
  data: string; // base64 string
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: ImagePart;
  isError?: boolean;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  chat?: Chat; // To hold the ongoing Gemini chat session instance
}

// Add to your existing types.ts
export interface ImagePart {
    mimeType: string;
    data: string;
}

export interface GeneratedImage {
    url: string;
    prompt: string;
    model: string;
}

export interface Message {
    sender: 'user' | 'ai';
    text: string;
    image?: ImagePart;
    generatedImage?: GeneratedImage; // Add this
    isLoading?: boolean;
    isError?: boolean;
    isImageGeneration?: boolean; // Add this
}

// Rest of your existing types...
export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    chat?: Chat;
}