/**
 * AuraOS Voice Service
 * خدمة صوتية متكاملة للإدخال والإخراج الصوتي
 */

import { BrowserSTT } from './stt/BrowserSTT';
import { IntentParser } from './intent/IntentParser';
import { BrowserTTS } from './tts/BrowserTTS';
import type {
  VoiceCommand,
  VoiceServiceConfig,
  VoiceServiceEvent,
  TTSOptions,
} from './types';

export class VoiceService {
  private stt: BrowserSTT;
  private intentParser: IntentParser;
  private tts: BrowserTTS;
  private config: VoiceServiceConfig;
  private eventListeners: Map<string, Set<(event: VoiceServiceEvent) => void>>;

  constructor(config: VoiceServiceConfig = {}) {
    this.config = {
      enableSTT: true,
      enableTTS: true,
      defaultLanguage: 'en-US',
      logLevel: 'info',
      ...config,
    };

    this.stt = new BrowserSTT(this.config.defaultLanguage);
    this.intentParser = new IntentParser();
    this.tts = new BrowserTTS();
    this.eventListeners = new Map();

    this.log('info', 'VoiceService initialized', this.config);
  }

  /**
   * معالجة إدخال صوتي كامل
   * STT → Intent Parsing → إرجاع الأمر
   */
  async processVoiceInput(): Promise<VoiceCommand> {
    const startTime = Date.now();

    try {
      // 1. إصدار حدث بدء الاستماع
      this.emit('listening-start', {});

      // 2. تحويل الصوت لنص (STT)
      if (!this.config.enableSTT) {
        throw new Error('STT is disabled');
      }

      const sttResult = await this.stt.transcribe();
      this.log('info', 'STT result:', sttResult);

      // 3. إصدار حدث انتهاء النسخ
      this.emit('transcription-complete', { text: sttResult.text });

      // 4. تحليل النية
      const parsed = this.intentParser.parse(sttResult.text);
      this.log('info', 'Intent parsed:', parsed);

      // 5. التحقق من صحة النية
      if (!this.intentParser.isValid(parsed)) {
        throw new Error(`Invalid intent: confidence too low (${parsed.confidence})`);
      }

      // 6. إنشاء VoiceCommand
      const command: VoiceCommand = {
        text: sttResult.text,
        intent: parsed.intent,
        entities: parsed.entities,
        confidence: Math.min(sttResult.confidence, parsed.confidence),
        processingTime: Date.now() - startTime,
      };

      // 7. إصدار حدث اكتشاف النية
      this.emit('intent-detected', command);

      return command;

    } catch (error) {
      this.log('error', 'Voice input processing failed:', error);
      this.emit('error', { error });
      throw error;

    } finally {
      this.emit('listening-end', {});
    }
  }

  /**
   * تحويل نص لكلام (TTS)
   */
  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.config.enableTTS) {
      this.log('warn', 'TTS is disabled');
      return;
    }

    try {
      this.emit('speech-start', { text });
      
      await this.tts.speak(text, {
        lang: this.config.defaultLanguage,
        ...options,
      });

      this.emit('speech-end', { text });

    } catch (error) {
      this.log('error', 'TTS failed:', error);
      this.emit('error', { error });
      throw error;
    }
  }

  /**
   * إيقاف الكلام
   */
  stopSpeaking(): void {
    this.tts.stop();
  }

  /**
   * إيقاف الاستماع
   */
  stopListening(): void {
    this.stt.stop();
  }

  /**
   * تغيير اللغة
   */
  setLanguage(lang: string): void {
    this.config.defaultLanguage = lang;
    this.stt.setLanguage(lang);
    this.log('info', `Language changed to: ${lang}`);
  }

  /**
   * الاشتراك في الأحداث
   */
  on(eventType: string, callback: (event: VoiceServiceEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * إلغاء الاشتراك من الأحداث
   */
  off(eventType: string, callback: (event: VoiceServiceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * إصدار حدث
   */
  private emit(type: string, data?: any): void {
    const event: VoiceServiceEvent = {
      type: type as any,
      data,
      timestamp: Date.now(),
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * تسجيل رسالة
   */
  private log(level: string, ...args: any[]): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = this.config.logLevel || 'info';
    
    if (levels.indexOf(level) >= levels.indexOf(configLevel)) {
      console[level as 'log']('[VoiceService]', ...args);
    }
  }

  /**
   * التحقق من دعم المتصفح
   */
  static isSupported(): boolean {
    return BrowserSTT.isSupported() && BrowserTTS.isSupported();
  }

  /**
   * الحصول على اللغات المدعومة
   */
  static getSupportedLanguages(): string[] {
    return BrowserSTT.getSupportedLanguages();
  }
}

// Re-export types
export * from './types';
export { BrowserSTT } from './stt/BrowserSTT';
export { IntentParser } from './intent/IntentParser';
export { BrowserTTS } from './tts/BrowserTTS';
