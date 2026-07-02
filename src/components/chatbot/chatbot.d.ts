import { MvxElement } from '../../core.js';

export interface MvxChatbotModel {
  provider?: string;
  value: string;
  label?: string;
}

export interface MvxChatbotMessage {
  role?: 'assistant' | 'user' | 'system' | string;
  name?: string;
  content: string;
}

export class MvxChatbot extends MvxElement {
  models: MvxChatbotModel[];
  messages: MvxChatbotMessage[];
  suggestions: string[];
  headers: Record<string, string>;
  addMessage(message: MvxChatbotMessage): void;
  clear(): void;
}
