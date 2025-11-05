import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';

dotenv.config();

// Creates a client
const client = new TextToSpeechClient();

export interface VoiceSelectionParams {
  languageCode: string;
  name?: string; // e.g., 'en-US-Wavenet-D' for English, 'ar-XA-Wavenet-B' for Arabic
  ssmlGender?: 'SSML_VOICE_GENDER_UNSPECIFIED' | 'MALE' | 'FEMALE' | 'NEUTRAL';
}

/**
 * Synthesizes speech from text and returns it as a Base64 encoded audio string.
 * @param text The text to synthesize.
 * @param voice The voice selection parameters.
 * @returns The Base64 encoded audio content (MP3).
 */
export async function synthesizeSpeech(text: string, voice: VoiceSelectionParams): Promise<string> {
  const request = {
    input: { text },
    // Select the language and voice
    voice: voice,
    // Select the type of audio encoding
    audioConfig: { audioEncoding: 'MP3' as const },
  };

  try {
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('Audio content is missing in the TTS response.');
    }

    // The audio content is returned as a buffer. Convert it to a base64 string
    // to easily send it over JSON, prefixed with the data URI scheme.
    const audioBase64 = (response.audioContent as Buffer).toString('base64');
    return `data:audio/mp3;base64,${audioBase64}`;

  } catch (error) {
    console.error('Text-to-Speech API error:', error);
    throw new Error('Failed to synthesize speech.');
  }
}

/**
 * Lists available voices for a given language.
 * @param languageCode The language code (e.g., 'en-US', 'ar-XA').
 * @returns A list of available voices.
 */
export async function listVoices(languageCode?: string) {
    try {
        const [result] = await client.listVoices({ languageCode });
        return result.voices || [];
    } catch (error) {
        console.error('Failed to list TTS voices:', error);
        throw new Error('Failed to retrieve voice list.');
    }
}
