/**
 * Decodes a base64 string into a Uint8Array.
 * This function is used to convert base64 audio data received from the API
 * into a format that can be processed by the Web Audio API.
 * @param {string} base64 - The base64 encoded string.
 * @returns {Uint8Array} The decoded byte array.
 */
export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Encodes a Uint8Array into a base64 string.
 * This function is used to convert raw audio data (e.g., from microphone)
 * into a base64 format suitable for sending to the API.
 * @param {Uint8Array} bytes - The byte array to encode.
 * @returns {string} The base64 encoded string.
 */
export function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Decodes raw PCM audio data (Uint8Array) into an AudioBuffer.
 * This custom decoding logic is necessary because the Gemini Live API returns raw
 * PCM data, not a standard audio file format (like WAV, MP3) that `AudioContext.decodeAudioData` expects.
 * @param {Uint8Array} data - The raw PCM audio data as a Uint8Array.
 * @param {AudioContext} ctx - The Web Audio API AudioContext.
 * @param {number} sampleRate - The sample rate of the audio (e.g., 24000 for Gemini TTS).
 * @param {number} numChannels - The number of audio channels (e.g., 1 for mono).
 * @returns {Promise<AudioBuffer>} A promise that resolves to the decoded AudioBuffer.
 */
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert 16-bit PCM to float32 range [-1, 1]
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

/**
 * Plays decoded raw PCM audio data using the Web Audio API.
 * It takes a Uint8Array of audio data, decodes it into an AudioBuffer,
 * and then plays it through the provided AudioContext.
 * @param {Uint8Array} decodedData - The raw PCM audio data (Uint8Array) to play.
 * @param {AudioContext} audioContext - The Web Audio API AudioContext to use for playback.
 * @returns {Promise<void>} A promise that resolves when the audio playback is complete.
 */
export async function playDecodedAudio(decodedData: Uint8Array, audioContext: AudioContext): Promise<void> {
    if (audioContext.state === 'closed') {
        console.warn("Audio context was closed before playback could start.");
        return;
    }

    const audioBuffer = await decodeAudioData(
        decodedData,
        audioContext,
        24000, // Sample rate for gemini-2.5-flash-preview-tts and Live API
        1,     // Number of channels
    );
    
    return new Promise((resolve) => {
        if (audioContext.state === 'closed') {
             console.warn("Audio context was closed before buffer source could be created.");
             resolve();
             return;
        }
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => resolve();
        source.start();
    });
}