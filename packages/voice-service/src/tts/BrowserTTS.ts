/**
 * Browser-based Text-to-Speech using Web Speech API
 * مجاني، يعمل في المتصفح مباشرة
 */

import type { TTSOptions } from '../types';

export class BrowserTTS {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initSynthesis();
  }

  private initSynthesis(): void {
    if (typeof window === 'undefined') {
      console.warn('BrowserTTS: Not running in browser environment');
      return;
    }

    if (!window.speechSynthesis) {
      console.error('BrowserTTS: Web Speech API not supported');
      return;
    }

    this.synth = window.speechSynthesis;
    
    // تحميل الأصوات المتاحة
    this.loadVoices();
    
    // بعض المتصفحات تحتاج وقت لتحميل الأصوات
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  /**
   * تحويل النص لكلام
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.synth) {
      throw new Error('Speech synthesis not initialized');
    }

    // إيقاف أي كلام جاري
    this.synth.cancel();

    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // تطبيق الخيارات
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // اختيار الصوت المناسب
      const voice = this.findVoice(utterance.lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`TTS error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  /**
   * إيقاف الكلام
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * إيقاف مؤقت
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  /**
   * استئناف
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  /**
   * البحث عن صوت مناسب للغة
   */
  private findVoice(lang: string): SpeechSynthesisVoice | null {
    // البحث عن صوت يطابق اللغة تماماً
    let voice = this.voices.find(v => v.lang === lang);
    
    // إذا لم يوجد، ابحث عن صوت يبدأ بنفس اللغة (مثلاً en-US يطابق en)
    if (!voice) {
      const langPrefix = lang.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(langPrefix));
    }

    return voice || null;
  }

  /**
   * الحصول على الأصوات المتاحة
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * الحصول على الأصوات حسب اللغة
   */
  getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
    const langPrefix = lang.split('-')[0];
    return this.voices.filter(v => 
      v.lang === lang || v.lang.startsWith(langPrefix)
    );
  }

  /**
   * التحقق من الدعم
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * الحصول على اللغات المدعومة
   */
  getSupportedLanguages(): string[] {
    return [...new Set(this.voices.map(v => v.lang))];
  }
}
