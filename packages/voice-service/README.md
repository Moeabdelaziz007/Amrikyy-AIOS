# @auraos/voice-service

خدمة صوتية متكاملة لـ AuraOS - تحويل الكلام لنص (STT) والنص لكلام (TTS)

## الميزات

- 🎤 **STT (Speech-to-Text)**: تحويل الصوت لنص باستخدام Web Speech API
- 🔊 **TTS (Text-to-Speech)**: تحويل النص لكلام
- 🧠 **Intent Parsing**: استخراج النوايا والكيانات من النص
- 🌍 **متعدد اللغات**: دعم 10+ لغات
- 🆓 **مجاني بالكامل**: يعمل محلياً في المتصفح
- ⚡ **سريع**: لا حاجة لاستدعاءات API خارجية

## التثبيت

```bash
cd packages/voice-service
pnpm install
pnpm build
```

## الاستخدام

### مثال بسيط

```typescript
import { VoiceService } from '@auraos/voice-service';

// إنشاء خدمة صوتية
const voiceService = new VoiceService({
  defaultLanguage: 'en-US',
  enableSTT: true,
  enableTTS: true,
});

// معالجة إدخال صوتي
const command = await voiceService.processVoiceInput();
console.log('Command:', command);
// { text: "create note project ideas", intent: "create", entities: {...} }

// تحويل نص لكلام
await voiceService.speak('Note created successfully');
```

### الاشتراك في الأحداث

```typescript
voiceService.on('listening-start', (event) => {
  console.log('Started listening...');
});

voiceService.on('transcription-complete', (event) => {
  console.log('Transcribed:', event.data.text);
});

voiceService.on('intent-detected', (event) => {
  console.log('Intent:', event.data);
});

voiceService.on('error', (event) => {
  console.error('Error:', event.data.error);
});
```

### تغيير اللغة

```typescript
// English
voiceService.setLanguage('en-US');

// Arabic
voiceService.setLanguage('ar-SA');

// Japanese
voiceService.setLanguage('ja-JP');
```

## اللغات المدعومة

- `en-US` - English (US)
- `en-GB` - English (UK)
- `ar-SA` - Arabic (Saudi)
- `ar-EG` - Arabic (Egypt)
- `zh-CN` - Chinese (Simplified)
- `ja-JP` - Japanese
- `hi-IN` - Hindi
- `es-ES` - Spanish
- `fr-FR` - French
- `de-DE` - German

## API Reference

### VoiceService

#### Constructor

```typescript
new VoiceService(config?: VoiceServiceConfig)
```

#### Methods

- `processVoiceInput(): Promise<VoiceCommand>` - معالجة إدخال صوتي كامل
- `speak(text: string, options?: TTSOptions): Promise<void>` - تحويل نص لكلام
- `stopSpeaking(): void` - إيقاف الكلام
- `stopListening(): void` - إيقاف الاستماع
- `setLanguage(lang: string): void` - تغيير اللغة
- `on(eventType: string, callback: Function): void` - الاشتراك في حدث
- `off(eventType: string, callback: Function): void` - إلغاء الاشتراك

#### Static Methods

- `VoiceService.isSupported(): boolean` - التحقق من دعم المتصفح
- `VoiceService.getSupportedLanguages(): string[]` - الحصول على اللغات المدعومة

## Types

### VoiceCommand

```typescript
interface VoiceCommand {
  text: string;              // النص المنسوخ
  intent: string;            // النية (create, search, etc.)
  entities: {
    args: string[];
    flags: Record<string, any>;
  };
  confidence: number;        // درجة الثقة (0-1)
  processingTime?: number;   // الوقت المستغرق (ms)
}
```

### TTSOptions

```typescript
interface TTSOptions {
  lang?: string;    // اللغة
  rate?: number;    // سرعة الكلام (0.5 - 2.0)
  pitch?: number;   // درجة الصوت (0.0 - 2.0)
  volume?: number;  // مستوى الصوت (0.0 - 1.0)
}
```

## أمثلة

### دمج مع React

```tsx
import { VoiceService } from '@auraos/voice-service';
import { useState, useEffect } from 'react';

function VoiceButton() {
  const [isListening, setIsListening] = useState(false);
  const [voiceService] = useState(() => new VoiceService());

  useEffect(() => {
    voiceService.on('listening-start', () => setIsListening(true));
    voiceService.on('listening-end', () => setIsListening(false));
  }, []);

  const handleClick = async () => {
    try {
      const command = await voiceService.processVoiceInput();
      console.log('Command:', command);
      
      // تنفيذ الأمر...
      
      await voiceService.speak('Command executed');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleClick}>
      {isListening ? '🔴 Listening...' : '🎤 Speak'}
    </button>
  );
}
```

## المتطلبات

- متصفح حديث يدعم Web Speech API
- Chrome/Edge: دعم كامل ✅
- Firefox: دعم جزئي ⚠️
- Safari: دعم محدود ⚠️

## الترخيص

MIT
