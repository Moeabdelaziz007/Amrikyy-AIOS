/**
 * Browser-based Speech-to-Text using Web Speech API
 * مجاني، سريع، يعمل في المتصفح مباشرة
 */

import type { STTResult } from '../types';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  
  start(): void;
  stop(): void;
  abort(): void;
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class BrowserSTT {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor(private lang: string = 'en-US') {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') {
      console.warn('BrowserSTT: Not running in browser environment');
      return;
    }

    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error('BrowserSTT: Web Speech API not supported');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.lang;
    this.recognition.maxAlternatives = 1;
  }

  /**
   * بدء الاستماع والنسخ
   */
  async transcribe(): Promise<STTResult> {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.isListening) {
      throw new Error('Already listening');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Recognition not available'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0];
        
        resolve({
          text: result.transcript,
          confidence: result.confidence,
          language: this.lang,
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * إيقاف الاستماع
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * تغيير اللغة
   */
  setLanguage(lang: string): void {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * التحقق من الدعم
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * الحصول على اللغات المدعومة
   */
  static getSupportedLanguages(): string[] {
    return [
      'en-US', // English (US)
      'en-GB', // English (UK)
      'ar-SA', // Arabic (Saudi)
      'ar-EG', // Arabic (Egypt)
      'zh-CN', // Chinese (Simplified)
      'ja-JP', // Japanese
      'hi-IN', // Hindi
      'es-ES', // Spanish
      'fr-FR', // French
      'de-DE', // German
    ];
  }
}
