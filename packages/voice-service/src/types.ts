/**
 * Voice Service Types
 */

export interface VoiceCommand {
  /** النص المنسوخ من الصوت */
  text: string;
  
  /** النية المستخرجة (مثل: create, search, open) */
  intent: string;
  
  /** الكيانات المستخرجة (args, flags) */
  entities: Record<string, any>;
  
  /** درجة الثقة (0-1) */
  confidence: number;
  
  /** الوقت المستغرق للمعالجة (ms) */
  processingTime?: number;
}

export interface STTResult {
  text: string;
  confidence: number;
  language?: string;
}

export interface TTSOptions {
  /** اللغة (en-US, ar-SA, etc.) */
  lang?: string;
  
  /** سرعة الكلام (0.5 - 2.0) */
  rate?: number;
  
  /** درجة الصوت (0.0 - 2.0) */
  pitch?: number;
  
  /** مستوى الصوت (0.0 - 1.0) */
  volume?: number;
}

export interface VoiceServiceConfig {
  /** تفعيل STT */
  enableSTT?: boolean;
  
  /** تفعيل TTS */
  enableTTS?: boolean;
  
  /** اللغة الافتراضية */
  defaultLanguage?: string;
  
  /** مستوى السجل */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export type VoiceServiceEventType = 
  | 'listening-start'
  | 'listening-end'
  | 'transcription-complete'
  | 'intent-detected'
  | 'speech-start'
  | 'speech-end'
  | 'error';

export interface VoiceServiceEvent {
  type: VoiceServiceEventType;
  data?: any;
  timestamp: number;
}
