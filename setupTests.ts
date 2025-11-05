import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for components that use it (like some UI libraries) in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Safe window.alert mock to prevent 'Not implemented: window.alert' in jsdom
if (typeof window.alert !== 'function') {
  // @ts-ignore
  window.alert = vi.fn();
}

// Minimal SpeechRecognition mock for tests
class MockSpeechRecognition {
  public continuous = false;
  public interimResults = false;
  public lang = 'en-US';
  public onresult: ((event: any) => void) | null = null;
  public onend: (() => void) | null = null;
  public onerror: ((e: any) => void) | null = null;
  start() { /* no-op */ }
  stop() { if (this.onend) this.onend(); }
  abort() { if (this.onend) this.onend(); }
}

// Attach mocks to window (vendor prefixed too)
// @ts-ignore
window.SpeechRecognition = MockSpeechRecognition;
// @ts-ignore
window.webkitSpeechRecognition = MockSpeechRecognition;

// Minimal MediaRecorder mock
class MockMediaRecorder {
  public state: 'inactive' | 'recording' | 'paused' = 'inactive';
  public ondataavailable: ((ev: any) => void) | null = null;
  private _interval: any = null;
  constructor(public stream?: MediaStream) {}
  start(timeslice?: number) { this.state = 'recording'; /* simulate periodic data */ }
  stop() { this.state = 'inactive'; if (this.ondataavailable) this.ondataavailable({ data: new Blob([''], { type: 'audio/webm' }) }); }
}
// @ts-ignore
window.MediaRecorder = MockMediaRecorder;

// Minimal FileReader mock
class MockFileReader {
  public result: string | null = null;
  public onloadend: (() => void) | null = null;
  readAsDataURL(_blob: Blob) {
    // return a small data URL synchronously
    this.result = 'data:audio/webm;base64,AAA';
    if (this.onloadend) this.onloadend();
  }
}
// @ts-ignore
window.FileReader = MockFileReader;

// Minimal Audio mock to support play and onended
class MockAudio {
  public onended: (() => void) | null = null;
  private _playing = false;
  constructor(public src?: string) {}
  play() { this._playing = true; // simulate immediate end
    setTimeout(() => { this._playing = false; if (this.onended) this.onended(); }, 0); return Promise.resolve(); }
  pause() { this._playing = false; }
}
// @ts-ignore
window.Audio = MockAudio;

// Minimal speechSynthesis mock
if (typeof window.speechSynthesis === 'undefined') {
  // @ts-ignore
  window.speechSynthesis = {
    speak: (utterance: any) => {
      setTimeout(() => { if (typeof utterance.onend === 'function') utterance.onend(); }, 0);
    },
    cancel: () => {},
  };
}

// Mock URL.createObjectURL / revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  // @ts-ignore
  URL.createObjectURL = (obj: any) => 'blob://mock';
  // @ts-ignore
  URL.revokeObjectURL = (_: string) => {};
}

// Provide a default navigator.mediaDevices.getUserMedia stub
if (!navigator.mediaDevices) {
  // @ts-ignore
  navigator.mediaDevices = {};
}
if (!navigator.mediaDevices.getUserMedia) {
  // @ts-ignore
  navigator.mediaDevices.getUserMedia = async (_opts: any) => {
    // minimal mock MediaStream
    return {
      getTracks: () => [{ stop: () => {} }],
    } as unknown as MediaStream;
  };
}

// Geolocation mock helpers can be set in individual tests; provide default denied behavior
if (!navigator.geolocation) {
  // @ts-ignore
  navigator.geolocation = {
    getCurrentPosition: (_success: any, error: any) => { if (error) error({ message: 'User denied geolocation' }); },
    watchPosition: () => 0,
    clearWatch: () => {},
  };
}
