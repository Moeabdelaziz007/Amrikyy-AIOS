import { SpeechClient } from '@google-cloud/speech';
import dotenv from 'dotenv';

dotenv.config();

const speechClient = new SpeechClient();

/**
 * Transcribes audio from a Base64 encoded string.
 * @param audioBase64 The Base64 encoded audio data.
 * @param languageCode The language of the speech in the audio (e.g., 'en-US', 'ar-SA').
 * @returns The transcribed text.
 */
export async function transcribeAudio(audioBase64: string, languageCode: string): Promise<string> {
  const audio = {
    content: audioBase64,
  };

  const config = {
    encoding: 'WEBM_OPUS' as const, // Opus is a common codec for webm audio from MediaRecorder
    sampleRateHertz: 48000, // A standard sample rate for web audio
    languageCode: languageCode,
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0].transcript)
      .join('\n');
    
    return transcription || '';
  } catch (error) {
    console.error('Google Speech-to-Text API error:', error);
    throw new Error('Failed to transcribe audio.');
  }
}
