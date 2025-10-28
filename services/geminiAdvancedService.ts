import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality, FunctionDeclaration } from "@google/genai";
import { TravelPlan, Workflow, SystemVoice, WorkflowNode, WorkflowConnection, ExecutionLogEntry, SkillID, Engram, UserAction, DashboardLayout, AppID, SocialPost, SharedContent, RideOption, WeatherData, FastFoodRestaurant, CleaningService, NightlifeEvent, CurrentWeather, ForecastDay, FinancialNews, FinancialAnalysis, FlightOption, FlightSearchDetails, TrendingItem } from "../types";
import { skills } from '../data/skills';
import { initialNexusPosts } from "../data/nexus";
import { aiNewsData, aiMarketData } from "../data/aiNews";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

/**
 * Helper function to escape characters for SSML (Speech Synthesis Markup Language).
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
const escapeSSML = (text: string) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Performs a grounded search using Google Search for up-to-date information.
 * Uses 'gemini-2.5-flash' for general queries and 'gemini-2.5-pro' with thinking mode for complex queries.
 * @param {string} prompt - The user's input prompt.
 * @param {boolean} thinkingMode - Whether to enable thinking mode for more complex reasoning.
 * @returns {Promise<{ text: string, sources: {title: string, uri: string}[] }>} A promise that resolves to the AI's response text and a list of sources.
 */
export const groundedSearch = async (prompt: string, thinkingMode: boolean): Promise<{ text: string, sources: {title: string, uri: string}[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { text: "This is a simulated search response. To connect to Gemini, please provide an API key.", sources: [] };
    }
    
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const modelName = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config: any = { tools: [{googleSearch: {}}] };

    if (thinkingMode) {
        // For gemini-2.5-pro, thinkingBudget can be higher.
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: config,
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map(chunk => ({ title: chunk.web?.title || '', uri: chunk.web?.uri || ''}))
            .filter(source => source.uri);

        return { text: response.text, sources };
    } catch (error) {
        console.error("Error calling Gemini Search API:", error);
        return { text: "An error occurred while searching.", sources: [] };
    }
};

/**
 * Performs a grounded search using Google Maps for geographical or place information.
 * @param {string} prompt - The user's query for maps.
 * @param {object} location - The user's current geographical coordinates.
 * @param {number} location.latitude - The latitude.
 * @param {number} location.longitude - The longitude.
 * @returns {Promise<{ text: string, sources: {title: string, uri: string}[] }>} A promise that resolves to the AI's response text and a list of map-related sources.
 */
export const mapsSearch = async (prompt: string, location: {latitude: number, longitude: number}): Promise<{ text: string, sources: {title: string, uri: string}[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { text: "Simulated maps response: La Trattoria is a great Italian restaurant nearby.", sources: [] };
    }
    
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: { latLng: location }
                }
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map(chunk => ({ title: chunk.maps?.title || '', uri: chunk.maps?.uri || ''}))
            .filter(source => source.uri);

        return { text: response.text, sources };
    } catch (error) {
        console.error("Error calling Gemini Maps API:", error);
        return { text: "An error occurred while searching maps.", sources: [] };
    }
};

/**
 * Searches for flight options based on provided details using the Gemini API with a tool call.
 * This function defines a `findFlights` tool that the Gemini model can invoke.
 *
 * @param {FlightSearchDetails} details - The flight search criteria.
 * @returns {Promise<FlightOption[]>} A promise that resolves to an array of flight options.
 * @throws {Error} If the API call fails or returns an invalid response.
 */
export const searchFlights = async (details: FlightSearchDetails): Promise<FlightOption[]> => {
    if (!API_KEY) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockFlights: FlightOption[] = [
            {
                carrier: 'MockAir',
                price: 350,
                currency: 'USD',
                departureTime: '08:00',
                arrivalTime: '14:30',
                duration: '6h 30m',
                stops: 1,
                url: 'https://mockair.com/book/1',
            },
            {
                carrier: 'BudgetFly',
                price: 280,
                currency: 'USD',
                departureTime: '10:15',
                arrivalTime: '17:00',
                duration: '6h 45m',
                stops: 1,
                url: 'https://budgetfly.com/book/2',
            },
            {
                carrier: 'LuxuryJets',
                price: 1200,
                currency: 'USD',
                departureTime: '09:00',
                arrivalTime: '14:00',
                duration: '5h 00m',
                stops: 0,
                url: 'https://luxuryjets.com/book/3',
            },
        ];
        return mockFlights.filter(f => f.price <= 500 || details.cabinClass === 'Business' || details.cabinClass === 'First'); // Simple mock filtering
    }

    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Define a function declaration for the model to call a hypothetical flight search tool
    const flightSearchTool: FunctionDeclaration = {
        name: 'findFlights',
        description: 'Finds flight options based on origin, destination, dates, and other criteria.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                origin: { type: Type.STRING, description: 'The origin airport code (e.g., LAX).' },
                destination: { type: Type.STRING, description: 'The destination airport code (e.g., JFK).' },
                departureDate: { type: Type.STRING, description: 'The departure date in YYYY-MM-DD format.' },
                returnDate: { type: Type.STRING, description: 'The return date in YYYY-MM-DD format (optional for round trip).' },
                passengers: { type: Type.INTEGER, description: 'The number of passengers.' },
                cabinClass: { type: Type.STRING, enum: ['Economy', 'Premium Economy', 'Business', 'First'], description: 'The cabin class.' },
            },
            required: ['origin', 'destination', 'departureDate', 'passengers', 'cabinClass'],
        },
    };

    try {
        const prompt = `Find flights from ${details.origin} to ${details.destination} departing on ${details.departureDate} ${details.returnDate ? `and returning on ${details.returnDate}` : ''} for ${details.passengers} passengers in ${details.cabinClass} class.`;

        // Step 1: Ask Gemini if it needs to use the findFlights tool
        // CRITICAL FIX: Removed responseMimeType and responseSchema from this initial call
        // as they conflict with the function calling paradigm. Gemini will return a FunctionCall
        // if it decides to use the tool, not a direct JSON response to the prompt.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [flightSearchTool] }],
            },
        });

        // Step 2: Check if Gemini has made a function call
        if (response.functionCalls && response.functionCalls.length > 0) {
            const flightCall = response.functionCalls.find(fc => fc.name === 'findFlights');
            if (flightCall) {
                // Step 3: Simulate execution of the 'findFlights' tool
                // In a real application, you would call an actual external flight API here
                // using the arguments from flightCall.args.
                // For this demo, we'll use the existing mock logic to provide dummy flights.
                const mockFlights: FlightOption[] = [
                    {
                        carrier: 'MockAir', price: 350, currency: 'USD', departureTime: '08:00', arrivalTime: '14:30', duration: '6h 30m', stops: 1, url: 'https://mockair.com/book/1',
                    },
                    {
                        carrier: 'BudgetFly', price: 280, currency: 'USD', departureTime: '10:15', arrivalTime: '17:00', duration: '6h 45m', stops: 1, url: 'https://budgetfly.com/book/2',
                    },
                    {
                        carrier: 'LuxuryJets', price: 1200, currency: 'USD', departureTime: '09:00', arrivalTime: '14:00', duration: '5h 00m', stops: 0, url: 'https://luxuryjets.com/book/3',
                    },
                ];
                // Apply a simple filter based on details, similar to the mock for !API_KEY
                return mockFlights.filter(f => f.price <= 500 || details.cabinClass === 'Business' || details.cabinClass === 'First');
            }
        }
        
        // If Gemini did not call the expected tool, or if response.functionCalls was empty.
        // For this specific function, if no flight tool call, it's an error as its purpose is to find flights.
        throw new Error("AI did not determine a flight search was needed or failed to provide a valid function call.");

    } catch (error) {
        console.error("Error searching flights:", error);
        // If it's a SyntaxError from trying to parse empty text, specifically capture it or rethrow.
        if (error instanceof SyntaxError) {
             throw new Error(`Invalid AI response format: ${error.message}. This might indicate a configuration issue or that the AI did not return a function call as expected.`);
        }
        throw new Error("Failed to search flights from AI.");
    }
};


/**
 * Generates a detailed travel plan based on user-provided trip details.
 * Uses 'gemini-2.5-pro' for complex planning.
 * @param {object} tripDetails - Details about the trip.
 * @param {string} tripDetails.destination - The travel destination.
 * @param {string} tripDetails.startDate - The start date of the trip.
 * @param {string} tripDetails.endDate - The end date of the trip.
 * @param {string} tripDetails.budget - The budget for the trip.
 * @returns {Promise<TravelPlan>} A promise that resolves to the AI-generated travel plan.
 * @throws {Error} If the AI fails to generate a travel plan.
 */
export const generateTravelPlan = async (tripDetails: { destination: string, startDate: string, endDate: string, budget: string }): Promise<TravelPlan> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            destination: tripDetails.destination,
            tripTitle: `An Amazing Mock Adventure in ${tripDetails.destination}`,
            itinerary: [
                { day: 1, title: 'Arrival & Exploration', activities: ['Check into hotel', 'Explore the local market', 'Dinner at a traditional restaurant'] },
                { day: 2, title: 'Cultural Immersion', activities: ['Visit the main museum', 'Walking tour of the historic district', 'Attend a local performance'] },
                { day: 3, title: 'Departure', activities: ['Souvenir shopping', 'Enjoy a final local breakfast', 'Head to the airport'] }
            ],
            budget: [ { category: 'Flights', cost: parseInt(tripDetails.budget) * 0.4 }, { category: 'Accommodation', cost: parseInt(tripDetails.budget) * 0.3 }, { category: 'Food & Activities', cost: parseInt(tripDetails.budget) * 0.3 } ],
            dealsAndLinks: [ { title: `Best Hotels in ${tripDetails.destination}`, url: 'https://example.com' }, { title: 'Local City Guide', url: 'https://example.com' } ]
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Create a detailed travel plan for a trip to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate} with a budget of $${tripDetails.budget}. The plan should include a creative trip title, a day-by-day itinerary with specific activities, a detailed budget breakdown into categories, and a list of useful web links and potential deals.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        destination: { type: Type.STRING }, tripTitle: { type: Type.STRING },
                        itinerary: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, title: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
                        budget: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, cost: { type: Type.NUMBER } } } },
                        dealsAndLinks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING } } } }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating travel plan:", error);
        throw new Error("Failed to generate travel plan from AI.");
    }
};

/**
 * Creates a list of calendar events from a given travel plan.
 * Uses 'gemini-2.5-flash' for event extraction.
 * @param {TravelPlan} plan - The travel plan to convert into calendar events.
 * @returns {Promise<{title: string, start: string, end: string}[]>} A promise that resolves to an array of event objects.
 * @throws {Error} If the AI fails to create calendar events.
 */
export const createCalendarEventFromPlan = async (plan: TravelPlan): Promise<{title: string, start: string, end: string}[]> => {
    if (!API_KEY) return [{ title: "Mock Event: Museum Visit", start: new Date().toISOString(), end: new Date().toISOString() }];
    
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a scheduling assistant. Given a travel plan, extract key activities and convert them into a list of calendar events. Each event needs a title, a start time, and an end time. Assume a reasonable duration for each activity. The output must be a valid JSON array.`;
    
    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is the travel plan: ${JSON.stringify(plan.itinerary)}`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            start: { type: Type.STRING },
                            end: { type: Type.STRING },
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error(e);
        throw new Error("AI failed to create calendar events.");
    }
}


/**
 * Generates speech from text using the text-to-speech model.
 * Uses 'gemini-2.5-flash-preview-tts' and accepts voice, rate, and pitch parameters.
 * @param {string} text - The text to convert to speech.
 * @param {SystemVoice} [voiceName='Kore'] - The name of the voice to use.
 * @param {number} [rate=1.0] - The speech rate (e.g., 1.0 for normal).
 * @param {number} [pitch=0] - The speech pitch (e.g., 0 for normal).
 * @returns {Promise<string>} A promise that resolves to the base64 encoded audio string.
 */
export const generateSpeech = async (text: string, voiceName: SystemVoice = 'Kore', rate: number = 1.0, pitch: number = 0): Promise<string> => {
    if (!API_KEY) return '';
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Use SSML to control speech rate and pitch
    const ssmlText = `<speak><prosody rate="${rate}" pitch="${pitch}dB">${escapeSSML(text)}</prosody></speak>`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: ssmlText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    } catch (error) {
        console.error("Error generating speech:", error);
        return '';
    }
};

/**
 * Translates text from a source language to a target language.
 * Uses 'gemini-2.5-flash' for translation.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguageCode - The ISO 639-1 code of the target language (e.g., 'es', 'ar').
 * @param {string} [sourceLanguageCode] - Optional ISO 639-1 code of the source language. If not provided, AI detects it.
 * @returns {Promise<string>} A promise that resolves to the translated text.
 */
export const translateText = async (text: string, targetLanguageCode: string, sourceLanguageCode?: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `[Simulated Translation to ${targetLanguageCode}]: Hello, how are you?`;
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a sophisticated translation AI. Translate the given text to the target language code. If a source language is provided, use it. Otherwise, detect the source language. Respond only with the translated text.`;
    
    const prompt = sourceLanguageCode 
        ? `Translate from ${sourceLanguageCode} to ${targetLanguageCode}: "${text}"`
        : `Translate to ${targetLanguageCode}: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        return "Failed to translate text.";
    }
};

/**
 * Translates audio from one language to another by transcribing, translating text, and then generating speech.
 * @param {string} audioBase64 - The base64 encoded audio data.
 * @param {string} mimeType - The MIME type of the audio.
 * @param {string} targetLanguageCode - The ISO 639-1 code of the target language (e.g., 'es', 'ar').
 * @param {SystemVoice} [voiceName='Kore'] - The name of the voice for the generated speech.
 * @param {number} [rate=1.0] - The speech rate for the generated audio.
 * @param {number} [pitch=0] - The speech pitch for the generated audio.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded translated audio string.
 */
export const translateAudio = async (audioBase64: string, mimeType: string, targetLanguageCode: string, voiceName: SystemVoice = 'Kore', rate: number = 1.0, pitch: number = 0): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return ''; // Return empty string for mock audio
    }
    // Step 1: Transcribe the audio
    const transcribedText = await transcribeAudio(audioBase64, mimeType);

    // Step 2: Translate the transcribed text
    const translatedText = await translateText(transcribedText, targetLanguageCode);

    // Step 3: Generate speech from the translated text
    const translatedAudioBase64 = await generateSpeech(translatedText, voiceName, rate, pitch);
    
    return translatedAudioBase64;
};

/**
 * Transcribes audio into text.
 * Uses 'gemini-2.5-flash' for transcription.
 * @param {string} audioBase64 - The base64 encoded audio data.
 * @param {string} mimeType - The MIME type of the audio.
 * @returns {Promise<string>} A promise that resolves to the transcribed text.
 */
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return "This is a mock transcription of your audio: Plan a trip to Tokyo for next week.";
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{
                    inlineData: {
                        mimeType,
                        data: audioBase64,
                    },
                }],
            },
            config: {
                systemInstruction: 'Transcribe the provided audio into text. Respond only with the text.',
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to transcribe audio.");
    }
};

/**
 * Generates an image from a text prompt.
 * Uses 'imagen-4.0-generate-001' for high-quality image generation.
 * @param {string} prompt - The text prompt for image generation.
 * @param {'1:1' | '3:4' | '4:3' | '9:16' | '16:9'} [aspectRatio='1:1'] - The aspect ratio of the generated image.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image string (data URI).
 */
export const generateImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog.jpg'; // Mock image
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio,
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};

/**
 * Edits an existing image based on a text prompt.
 * Uses 'gemini-2.5-flash-image' for general image editing tasks.
 * @param {string} prompt - The text prompt for editing.
 * @param {string} imageBase64 - The base64 encoded source image data (without data URI prefix).
 * @param {string} mimeType - The MIME type of the source image.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded edited image string (data URI).
 */
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog_edited.jpg'; // Mock edited image
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const generatedPart = response.candidates?.[0]?.content?.parts?.[0];
        if (generatedPart?.inlineData) {
            return `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;
        }
        throw new Error("No image data returned from API.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};

/**
 * Generates a video from a text prompt and an optional starting image.
 * Uses 'veo-3.1-fast-generate-preview' for general video generation tasks.
 * Returns an async generator to stream progress updates.
 *
 * @param {string} prompt - The text prompt for video generation.
 * @param {string} [imageBase64] - Optional base64 encoded starting image data (without data URI prefix).
 * @param {string} [imageMimeType] - Optional MIME type of the starting image.
 * @param {'16:9' | '9:16'} [aspectRatio='16:9'] - The aspect ratio of the video.
 * @returns {AsyncGenerator<{status: 'processing' | 'completed' | 'error', progress: number, message: string, url?: string}>}
 *   An async generator yielding progress updates and the final video URL.
 */
export async function* generateVideoFromImage(
    prompt: string,
    imageBase64?: string,
    imageMimeType?: string,
    aspectRatio: '16:9' | '9:16' = '16:9'
) {
    if (!API_KEY) {
        yield { status: 'processing', progress: 25, message: 'Simulating video generation...' };
        await new Promise(resolve => setTimeout(resolve, 2000));
        yield { status: 'processing', progress: 75, message: 'Almost done...' };
        await new Promise(resolve => setTimeout(resolve, 1000));
        yield { status: 'completed', progress: 100, message: 'Simulated video ready!', url: 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/video_cat_dog.mp4' };
        return;
    }

    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // FIX: Initialize progress variable here
    let progress = 0;

    try {
        const request: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p', // Default to 720p for fast preview model
                aspectRatio,
            },
        };

        if (imageBase64 && imageMimeType) {
            request.image = {
                imageBytes: imageBase64,
                mimeType: imageMimeType,
            };
        }

        let operation = await ai.models.generateVideos(request);
        yield { status: 'processing', progress: 10, message: 'Starting video generation...' };
        progress = 10; // Update progress after initial yield

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
            
            // Simulate progress increase or use actual progress if available from API
            progress = Math.min(95, progress + Math.floor(Math.random() * 10) + 5); // Random increment
            const message = operation.metadata?.state ? `Status: ${operation.metadata.state}...` : 'Processing video...';
            yield { status: 'processing', progress, message };
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            const videoUrl = `${operation.response.generatedVideos[0].video.uri}&key=${API_KEY}`;
            yield { status: 'completed', progress: 100, message: 'Video generation successful!', url: videoUrl };
        } else {
            const errorMessage = operation.error?.message || 'Video generation failed: No video URI returned.';
            yield { status: 'error', progress: progress, message: errorMessage };
        }
    } catch (error: any) {
        console.error("Error generating video:", error);
        yield { status: 'error', progress: progress || 0, message: error.message || "Failed to generate video." };
    }
}

/**
 * Executes a dynamic workflow by sending it to Gemini and getting execution logs.
 * Uses 'gemini-2.5-pro' for complex workflow orchestration.
 * @param {Workflow} workflow - The workflow to execute.
 * @param {any} [initialData] - Optional initial data to pass to the workflow.
 * @returns {Promise<ExecutionLogEntry[]>} A promise that resolves to the execution log.
 */
export const executeDynamicWorkflow = async (workflow: Workflow, initialData?: any): Promise<ExecutionLogEntry[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return [
            { step: 1, thought: "Simulating Luna's planning...", action: "Generate itinerary", result: "Mock itinerary generated." },
            { step: 2, thought: "Simulating Scout's deal finding...", action: "Find hotel deals", result: "Mock deals found." },
            { step: 3, thought: "Simulating Karim's optimization...", action: "Optimize budget", result: "Mock budget optimized." },
            { step: 4, thought: "Simulating workflow completion...", action: "Complete workflow", result: "Mock workflow completed." },
        ];
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Execute the following workflow. Respond with a JSON array of execution steps, each containing 'step', 'thought', 'action', and 'result'.
    Workflow: ${JSON.stringify(workflow)}
    Initial data: ${JSON.stringify(initialData || {})}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: "You are a workflow orchestration AI. Simulate the execution of the provided workflow, detailing each step.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.INTEGER },
                            thought: { type: Type.STRING },
                            action: { type: Type.STRING },
                            result: { type: Type.STRING },
                        },
                        required: ["step", "thought", "action", "result"],
                    },
                },
                thinkingConfig: { thinkingBudget: 20000 },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error executing dynamic workflow:", error);
        throw new Error("Failed to execute dynamic workflow.");
    }
};

/**
 * Analyzes a video file based on a given prompt.
 * Uses 'gemini-2.5-pro' for complex video understanding.
 * @param {string} videoBase64 - The base64 encoded video data (without data URI prefix).
 * @param {string} mimeType - The MIME type of the video.
 * @param {string} prompt - The prompt or question about the video.
 * @returns {Promise<string>} A promise that resolves to the AI's analysis text.
 */
export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return "Simulated video analysis: The video shows a cat playing with a ball, duration 15 seconds. Key events: 0:03 - cat chases ball, 0:08 - cat catches ball.";
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: videoBase64,
                            mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video.");
    }
};

/**
 * Generates a workflow definition from a natural language prompt.
 * Uses 'gemini-2.5-pro' for complex understanding and structured output.
 * @param {string} prompt - The natural language description of the desired workflow.
 * @returns {Promise<Workflow>} A promise that resolves to a structured Workflow object.
 */
export const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        return {
            title: `Mock Workflow for "${prompt.substring(0, 20)}..."`,
            nodes: [
                { id: '1', agentId: 'luna', description: 'Understand request' },
                { id: '2', agentId: 'scout', description: 'Gather data' },
                { id: '3', agentId: 'karim', description: 'Process and output' },
            ],
            connections: [{ from: '1', to: '2' }, { from: '2', to: '3' }],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Generate a structured workflow based on this request: "${prompt}". The workflow should include a title, nodes (each with an id, agentId from 'luna', 'karim', 'scout', 'maya', 'jules', 'orion', 'atlas', 'cortex', 'echo', and a description), and connections between nodes. Output as a JSON object.`,
            config: {
                systemInstruction: `You are a workflow generator. Create logical workflows based on user requests, utilizing available AI agents.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        nodes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    agentId: { type: Type.STRING, enum: ['luna', 'karim', 'scout', 'maya', 'jules', 'orion', 'atlas', 'cortex', 'echo'] },
                                    description: { type: Type.STRING },
                                },
                                required: ["id", "agentId", "description"],
                            },
                        },
                        connections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    from: { type: Type.STRING },
                                    to: { type: Type.STRING },
                                },
                                required: ["from", "to"],
                            },
                        },
                    },
                    required: ["title", "nodes", "connections"],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating workflow from prompt:", error);
        throw new Error("Failed to generate workflow from prompt.");
    }
};

/**
 * Generates SEO ideas including keywords, blog outlines, and ad copy.
 * Uses 'gemini-2.5-pro' for comprehensive content strategy.
 * @param {string} url - The website URL for context.
 * @param {string} topic - The primary topic/keyword.
 * @returns {Promise<{keywords: string[], blogOutline: {title: string, points: string[]}, adCopy: string[]}>}
 *   A promise that resolves to structured SEO data.
 */
export const generateSeoIdeas = async (url: string, topic: string): Promise<{keywords: string[], blogOutline: {title: string, points: string[]}, adCopy: string[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            keywords: ['mock-seo', 'ai-marketing'],
            blogOutline: { title: 'Mock SEO Blog', points: ['Mock Intro', 'Mock Conclusion'] },
            adCopy: ['Mock Ad Headline'],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Generate SEO ideas for the website ${url} focusing on the topic "${topic}". Provide a list of target keywords, a blog post outline (title and bullet points), and three short ad copy headlines. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert SEO and marketing strategist.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        blogOutline: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                points: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ["title", "points"],
                        },
                        adCopy: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["keywords", "blogOutline", "adCopy"],
                },
                thinkingConfig: { thinkingBudget: 15000 },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating SEO ideas:", error);
        throw new Error("Failed to generate SEO ideas.");
    }
};

/**
 * Creates compelling ad copy (headline, body, CTA) for a product/service.
 * Uses 'gemini-2.5-pro' for creative and persuasive writing.
 * @param {string} productDescription - Description of the product or service.
 * @param {string} targetAudience - Description of the target audience.
 * @returns {Promise<{headline: string, body: string, cta: string}>} A promise that resolves to structured ad copy.
 */
export const createAdCopy = async (productDescription: string, targetAudience: string): Promise<{headline: string, body: string, cta: string}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            headline: 'Mock Ad Headline: Amazing Product!',
            body: 'This is the mock body copy for your amazing product, tailored for your audience.',
            cta: 'Click Here Now!',
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Create ad copy for a product/service.
        Product Description: "${productDescription}"
        Target Audience: "${targetAudience}"
        Provide a headline, body copy, and a call-to-action (CTA). Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: "You are a highly creative and persuasive advertising copywriter.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING },
                    },
                    required: ["headline", "body", "cta"],
                },
                thinkingConfig: { thinkingBudget: 10000 },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error creating ad copy:", error);
        throw new Error("Failed to create ad copy.");
    }
};

/**
 * Summarizes a given text using AI.
 * Uses 'gemini-2.5-flash' for concise text summarization.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} A promise that resolves to the summarized text.
 */
export const summarizeText = async (text: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "This is a simulated summary of the provided text. It covers the main points efficiently.";
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following text concisely: ${text}`,
            config: {
                systemInstruction: "You are a summarization expert. Provide clear and brief summaries.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw new Error("Failed to summarize text.");
    }
};

/**
 * Mocks or implements getting a research summary based on a topic.
 * @param {string} topic - The topic to research.
 * @returns {Promise<string>} A promise that resolves to a research summary.
 */
// FIX: Added missing exported member `getResearchSummary`.
export const getResearchSummary = async (topic: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `This is a simulated research summary for "${topic}". Key findings include: AI can generate text, images, and video. It requires large datasets and computational power. Ethical considerations are crucial for development.`;
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a brief research summary on the topic: "${topic}".`,
            config: {
                systemInstruction: "You are a research assistant. Provide concise and informative summaries.",
                tools: [{ googleSearch: {} }], // Use Google Search for research grounding
                thinkingConfig: { thinkingBudget: 10000 },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting research summary:", error);
        throw new Error("Failed to get research summary.");
    }
};

/**
 * Suggests an AI agent persona (name, icon, skills) based on a described role.
 * Uses 'gemini-2.5-pro' for creative and functional agent design.
 * @param {string} roleDescription - A description of the agent's desired role.
 * @returns {Promise<{name: string, icon: string, skillIDs: SkillID[]}>} A promise that resolves to a suggested agent persona.
 */
export const suggestAgentPersona = async (roleDescription: string): Promise<{name: string, icon: string, skillIDs: SkillID[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        return {
            name: 'Mock Agent',
            icon: '✨',
            skillIDs: ['gemini-pro-text'],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const availableSkills = skills.map(s => s.id); // Get actual skill IDs from data

    try {
        const prompt = `Given the role description: "${roleDescription}", suggest a creative agent name, a single emoji icon for it, and a list of up to 5 relevant skill IDs from the following list: ${JSON.stringify(availableSkills)}. Prioritize skills that directly match the role. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: "You are an AI agent designer. Create engaging and functional agent personas.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        skillIDs: { type: Type.ARRAY, items: { type: Type.STRING, enum: availableSkills } },
                    },
                    required: ["name", "icon", "skillIDs"],
                },
                thinkingConfig: { thinkingBudget: 10000 },
            },
        });
        const result = JSON.parse(response.text.trim());
        // Ensure only valid skill IDs are returned
        result.skillIDs = result.skillIDs.filter((id: SkillID) => availableSkills.includes(id));
        return result;
    } catch (error) {
        console.error("Error suggesting agent persona:", error);
        throw new Error("Failed to suggest agent persona.");
    }
};

/**
 * Synthesizes a new memory (Engram) based on a prompt and existing Engrams.
 * Uses 'gemini-2.5-pro' for advanced memory synthesis.
 * @param {string} prompt - The user's prompt for memory synthesis.
 * @param {Engram[]} existingEngrams - An array of existing Engrams to provide context.
 * @returns {Promise<Omit<Engram, 'id' | 'timestamp'>>} A promise that resolves to the new Engram data.
 */
export const synthesizeMemory = async (prompt: string, existingEngrams: Engram[]): Promise<Omit<Engram, 'id' | 'timestamp'>> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            label: `Mock Insight from "${prompt.substring(0, 20)}..."`,
            type: 'synthesized_insight',
            content: "This is a simulated AI-synthesized memory based on your prompt and existing data. It suggests a potential new connection or understanding.",
            color: '#FFD700', // Gold color for new insights
            potentiality: 0, // Starts in superposition
            authorAgentId: 'echo',
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Synthesize a new memory (Engram) based on this prompt: "${prompt}". Consider the following existing memories: ${JSON.stringify(existingEngrams.map(e => ({label: e.label, content: e.content, type: e.type})))}.
            The new Engram should have a 'label', 'type' (from 'travel_plan', 'conversation', 'seo_strategy', 'user_preference', 'synthesized_insight', 'project_creation', 'campaign_launch'), 'content' (summary), 'color' (hex code, e.g., #FFD700), and 'potentiality' (0 for new/unstable, 1 for stable). Output as a JSON object.`,
            config: {
                systemInstruction: "You are the Quantum Reasoning Engine, capable of synthesizing new insights from existing memories.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['travel_plan', 'conversation', 'seo_strategy', 'user_preference', 'synthesized_insight', 'project_creation', 'campaign_launch'] },
                        content: { type: Type.STRING },
                        color: { type: Type.STRING },
                        potentiality: { type: Type.NUMBER, enum: [0, 1] },
                        authorAgentId: {type: Type.STRING, enum: ['echo']}, // Always echo for synthesis
                    },
                    required: ["label", "type", "content", "color", "potentiality"],
                },
                thinkingConfig: { thinkingBudget: 25000 },
            },
        });
        const result = JSON.parse(response.text.trim());
        return { ...result, authorAgentId: result.authorAgentId || 'echo' }; // Ensure authorAgentId is set
    } catch (error) {
        console.error("Error synthesizing memory:", error);
        throw new Error("Failed to synthesize new memory.");
    }
};

/**
 * Interprets a natural language voice command and converts it into a structured command.
 * Uses 'gemini-2.5-flash' for quick command parsing.
 * @param {string} transcript - The transcribed voice input.
 * @returns {Promise<{action: 'open' | 'close', target: AppID | 'all'}>} A promise that resolves to the structured command.
 */
export const interpretVoiceCommand = async (transcript: string): Promise<{action: 'open' | 'close', target: AppID | 'all'} | null> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('open chat')) return { action: 'open', target: AppID.chat };
        if (lowerTranscript.includes('open settings')) return { action: 'open', target: AppID.settings };
        if (lowerTranscript.includes('close all')) return { action: 'close', target: 'all' };
        return { action: 'open', target: AppID.terminal }; // Default mock
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const availableApps: AppID[] = Object.values(AppID); // Get all valid AppIDs

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Interpret the voice command "${transcript}" and convert it into a structured action (open/close) and target (an AppID or 'all'). If the command cannot be parsed, return null. Available apps are: ${JSON.stringify(availableApps)}. Output as a JSON object like {action: "open", target: "chat"} or {action: "close", target: "all"}.`,
            config: {
                systemInstruction: "You are a voice command interpreter. Convert natural language commands to structured actions.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['open', 'close'] },
                        target: { type: Type.STRING, enum: [...availableApps, 'all'] },
                    },
                    required: ["action", "target"],
                },
            },
        });
        const result = JSON.parse(response.text.trim());
        return result;
    } catch (error) {
        console.error("Error interpreting voice command:", error);
        return null;
    }
};

/**
 * Generates proactive suggestions based on recent user actions.
 * Uses 'gemini-2.5-pro' for contextual reasoning.
 * @param {UserAction[]} recentActions - An array of recent user actions.
 * @returns {Promise<{title: string, suggestions: {text: string, actionAppId?: AppID}[]}>} A promise that resolves to suggestions.
 */
export const generateProactiveSuggestion = async (recentActions: UserAction[]): Promise<{title: string, suggestions: {text: string, actionAppId?: AppID}[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            title: "Mock Suggestions",
            suggestions: [
                { text: "Looks like you're planning a trip. Try the Travel Agent app!", actionAppId: AppID.travelAgent },
                { text: "Need to clear your schedule? Check your Smart Watch alarms.", actionAppId: AppID.smartwatch },
            ],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Based on these recent user actions: ${JSON.stringify(recentActions)}, generate a concise title for suggestions and 1-3 proactive suggestions. Each suggestion should have 'text' and an optional 'actionAppId' (from the AppID enum) if it's actionable. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful AI assistant providing proactive suggestions based on user behavior.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    actionAppId: { type: Type.STRING, enum: Object.values(AppID) },
                                },
                                required: ["text"],
                            },
                        },
                    },
                    required: ["title", "suggestions"],
                },
                thinkingConfig: { thinkingBudget: 5000 },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating proactive suggestion:", error);
        throw new Error("Failed to generate proactive suggestion.");
    }
};

/**
 * Generates an AI-powered social media post (caption and hashtags) for shared content.
 * Uses 'gemini-2.5-flash' for creative social media content.
 * @param {SharedContent} content - The content to be shared.
 * @returns {Promise<SocialPost>} A promise that resolves to a generated social media post.
 */
export const generateSocialMediaPost = async (content: SharedContent): Promise<SocialPost> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            caption: `Mock caption for ${content.title}. This was generated by AI!`,
            hashtags: ['#AIContent', '#AmrikyyAIOS'],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Generate a compelling social media caption and up to 5 relevant hashtags for the following content:
        Title: "${content.title}"
        Subtitle: "${content.subtitle}"
        Call to action: "${content.cta}"
        ${content.imageUrl ? `Image URL: ${content.imageUrl}` : ''}
        Output as a JSON object with 'caption' and 'hashtags' (an array of strings).`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a social media expert, crafting engaging posts.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["caption", "hashtags"],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post.");
    }
};

/**
 * Tests a given system instruction and user prompt against a Gemini model.
 * Uses 'gemini-2.5-pro' for robust testing of system prompts.
 * @param {string} systemInstruction - The system-level instruction for the AI.
 * @param {string} userPrompt - The user's input prompt.
 * @returns {Promise<string>} A promise that resolves to the AI's response.
 */
export const testSystemPrompt = async (systemInstruction: string, userPrompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `[SIMULATED RESPONSE] With system instruction: "${systemInstruction}", and user prompt: "${userPrompt}", AI responds with a relevant, helpful answer.`;
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.7, // Keep it balanced for testing
                topP: 0.95,
                topK: 64,
                thinkingConfig: { thinkingBudget: 10000 },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error testing system prompt:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to test system prompt.");
    }
};

/**
 * Fetches recent financial news articles.
 * Uses 'gemini-2.5-flash' with Google Search grounding for up-to-date news.
 * @returns {Promise<FinancialNews[]>} A promise that resolves to an array of financial news articles.
 */
export const getFinancialNews = async (): Promise<FinancialNews[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return aiNewsData
            .filter(n => n.category === 'Market Watch' || n.category === 'Top Story')
            .map(n => ({ title: n.title, source: n.source, url: '#' }));
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "What are the top 3 financial news headlines right now?",
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            source: { type: Type.STRING },
                            url: { type: Type.STRING },
                        },
                        required: ["title", "source", "url"],
                    },
                },
            },
        });
        // The API might return markdown with JSON inside, so try to extract and parse
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching financial news:", error);
        // Fallback to mock data on error, or rethrow based on desired error handling strategy
        return aiNewsData
            .filter(n => n.category === 'Market Watch' || n.category === 'Top Story')
            .map(n => ({ title: n.title, source: n.source, url: '#' }));
    }
};

/**
 * Provides a detailed financial analysis for a given stock or crypto ticker.
 * Uses 'gemini-2.5-pro' with Google Search grounding for comprehensive analysis.
 * @param {string} ticker - The stock or cryptocurrency ticker symbol.
 * @returns {Promise<FinancialAnalysis>} A promise that resolves to a detailed financial analysis report.
 */
export const getFinancialAnalysis = async (ticker: string): Promise<FinancialAnalysis> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            summary: `Mock summary for ${ticker}: A strong performer with good growth potential.`,
            bullCase: "Mock Bull Case: Continued market expansion and product innovation will drive revenue.",
            bearCase: "Mock Bear Case: Increased competition and regulatory headwinds could impact profitability.",
            keyMetrics: [
                { name: "Market Cap", value: "Unknown" }, // Mocked as Unknown since we don't fetch real data
                { name: "P/E Ratio", value: "N/A" },
                { name: "52-Week High", value: "N/A" },
            ],
            recentNews: "Mock recent news: Positive analyst reports. No real-time data integration in mock mode.",
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Provide a detailed financial analysis for ${ticker}. Include a summary, bull case, bear case, 3-5 key metrics, and a brief section on recent news/developments. Output as a JSON object.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are a seasoned financial analyst. Provide objective and detailed reports.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        bullCase: { type: Type.STRING },
                        bearCase: { type: Type.STRING },
                        keyMetrics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.STRING } } } },
                        recentNews: { type: Type.STRING },
                    },
                    required: ["summary", "bullCase", "bearCase", "keyMetrics", "recentNews"],
                },
                thinkingConfig: { thinkingBudget: 20000 },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting financial analysis:", error);
        throw new Error("Failed to get financial analysis.");
    }
};

/**
 * Expands a given topic into a mind map structure (main idea, sub-topics, questions).
 * Uses 'gemini-2.5-pro' for comprehensive ideation and structuring.
 * @param {string} topic - The main topic to expand.
 * @returns {Promise<{mainIdea: string, subTopics: string[], questions: string[]}>} A promise that resolves to the mind map data.
 */
export const expandTopic = async (topic: string): Promise<{mainIdea: string, subTopics: string[], questions: string[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            mainIdea: topic,
            subTopics: [`Mock Sub-topic 1 for ${topic}`, `Mock Sub-topic 2 for ${topic}`],
            questions: [`Mock Question 1 about ${topic}`, `Mock Question 2 about ${topic}`],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Expand the topic "${topic}" into a mind map structure. Provide a 'mainIdea', an array of 2-3 'subTopics', and an array of 2-3 'questions' related to the topic. Output as a JSON object.`,
            config: {
                systemInstruction: "You are a brainstorming and ideation assistant, helping users organize their thoughts.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mainIdea: { type: Type.STRING },
                        subTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["mainIdea", "subTopics", "questions"],
                },
                thinkingConfig: { thinkingBudget: 10000 },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error expanding topic:", error);
        throw new Error("Failed to expand topic.");
    }
};

/**
 * Generates an AI-powered weather report summary.
 * Uses 'gemini-2.5-flash' for concise weather reporting.
 * @param {WeatherData} weatherData - The detailed weather data (current and forecast).
 * @returns {Promise<string>} A promise that resolves to an AI-generated weather summary.
 */
export const getAiWeatherReport = async (weatherData: WeatherData): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Simulated AI Weather Report for ${weatherData.current.location}: It's currently ${weatherData.current.temp}°C and ${weatherData.current.condition}. The next few days look ${weatherData.forecast[0]?.condition}.`;
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Based on the following weather data, provide a concise and helpful AI weather report summary for the user.
        Current Weather: ${JSON.stringify(weatherData.current)}
        5-Day Forecast: ${JSON.stringify(weatherData.forecast)}`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a friendly weather reporter AI. Provide helpful and easy-to-understand weather summaries.",
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI weather report:", error);
        throw new Error("Failed to get AI weather report.");
    }
};

/**
 * Finds fast food delivery options based on a query and user location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding for local search.
 * @param {string} query - The user's food craving or restaurant type.
 * @param {GeolocationState} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, options: FastFoodRestaurant[]}>} A promise that resolves to AI summary and options.
 */
export const findDeliveryOptions = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: FastFoodRestaurant[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Simulated AI: Craving pizza? Here are some top picks nearby.",
            options: [
                { name: 'Mock Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '30-40 min', priceLevel: '$$', isTrending: true, imageUrl: 'https://images.unsplash.com/photo-1594007654729-407edc192566?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', address: '123 Fake St', website: '#', reason: 'Known for speedy delivery.' },
                { name: 'Burger Heaven', cuisine: 'American', rating: 4.2, deliveryTime: '20-30 min', priceLevel: '$', isTrending: false, imageUrl: 'https://images.unsplash.com/photo-1568901346379-8ce8b97c8d9e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', address: '456 Mock Rd', website: '#', reason: 'Great value for money.' },
            ],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const prompt = `Find fast food delivery options for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Provide an AI summary and a list of up to 3 fast food restaurants. Each restaurant should have: name, cuisine, rating, deliveryTime, priceLevel ($, $$, $$$), isTrending (boolean), imageUrl (relevant image), address, website, and a concise AI-generated 'reason' for the recommendation. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: { retrievalConfig: { latLng: location } },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    cuisine: { type: Type.STRING },
                                    rating: { type: Type.NUMBER },
                                    deliveryTime: { type: Type.STRING },
                                    priceLevel: { type: Type.STRING, enum: ["$", "$$", "$$$", "$$$$"] },
                                    isTrending: { type: Type.BOOLEAN },
                                    imageUrl: { type: Type.STRING },
                                    address: { type: Type.STRING },
                                    website: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ["name", "cuisine", "rating", "deliveryTime", "priceLevel", "isTrending", "imageUrl", "address", "website", "reason"],
                            },
                        },
                    },
                    required: ["aiSummary", "options"],
                },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding delivery options:", error);
        throw new Error("Failed to find delivery options.");
    }
};

/**
 * Gets ride-sharing options based on a destination and user location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding for local search.
 * @param {string} destination - The desired destination.
 * @param {GeolocationState} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, options: RideOption[]}>} A promise that resolves to AI summary and ride options.
 */
export const getRideOptions = async (destination: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: RideOption[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Simulated AI: Here are a few ride options to your destination.",
            options: [
                { service: 'MockRide Basic', estimatedCost: '$15.00', estimatedTime: '10 min', currency: 'USD', surgePricing: false, eta: '3 min', providerLogo: 'https://www.svgrepo.com/show/303649/car-side-view.svg' },
                { service: 'MockRide Premium', estimatedCost: '$25.00', estimatedTime: '8 min', currency: 'USD', surgePricing: true, eta: '5 min', providerLogo: 'https://www.svgrepo.com/show/303649/car-side-view.svg' },
            ],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const prompt = `Find ride-sharing options to "${destination}" from latitude ${location.latitude}, longitude ${location.longitude}. Provide an AI summary and a list of up to 3 ride options. Each option should have: service name, estimatedCost, estimatedTime, currency, surgePricing (boolean), optional eta (string), and optional providerLogo (URL). Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: { retrievalConfig: { latLng: location } },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    service: { type: Type.STRING },
                                    estimatedCost: { type: Type.STRING },
                                    estimatedTime: { type: Type.STRING },
                                    currency: { type: Type.STRING },
                                    surgePricing: { type: Type.BOOLEAN },
                                    eta: { type: Type.STRING },
                                    providerLogo: { type: Type.STRING },
                                },
                                required: ["service", "estimatedCost", "estimatedTime", "currency", "surgePricing"],
                            },
                        },
                    },
                    required: ["aiSummary", "options"],
                },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting ride options:", error);
        throw new Error("Failed to get ride options.");
    }
};

/**
 * Finds cleaning services based on a query and user location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding for local search.
 * @param {string} query - The user's query for cleaning services.
 * @param {GeolocationState} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, services: CleaningService[]}>} A promise that resolves to AI summary and service options.
 */
export const findCleaningServices = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, services: CleaningService[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Simulated AI: Here are some highly-rated cleaning services nearby.",
            services: [
                { name: 'Sparkle Solutions', type: 'Deep Clean', priceRange: '$150-250', rating: 4.8, availability: 'Next Day', contact: 'tel:+15551234', imageUrl: 'https://images.unsplash.com/photo-1581578731548-a646959104df?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Excellent for thorough cleaning.' },
                { name: 'Eco Shine', type: 'Eco-Friendly', priceRange: '$120-180', rating: 4.5, availability: 'Same Week', contact: 'https://ecoshine.com', imageUrl: 'https://images.unsplash.com/photo-1542838124-74c7b8086088?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Uses only green products.' },
            ],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const prompt = `Find cleaning services for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Provide an AI summary and a list of up to 3 cleaning services. Each service should have: name, type, priceRange, rating, availability, contact (phone number or website URL), optional imageUrl, and a concise AI-generated 'reason' for the recommendation. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: { retrievalConfig: { latLng: location } },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        services: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    priceRange: { type: Type.STRING },
                                    rating: { type: Type.NUMBER },
                                    availability: { type: Type.STRING },
                                    contact: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ["name", "type", "priceRange", "rating", "availability", "contact", "reason"],
                            },
                        },
                    },
                    required: ["aiSummary", "services"],
                },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding cleaning services:", error);
        throw new Error("Failed to find cleaning services.");
    }
};

/**
 * Finds nightlife events and venues based on a query and user location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding for local search.
 * @param {string} query - The user's query for nightlife (e.g., "live music", "bars").
 * @param {GeolocationState} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, events: NightlifeEvent[]}>} A promise that resolves to AI summary and event options.
 */
export const findNightlifeEvents = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, events: NightlifeEvent[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Simulated AI: Explore these exciting nightlife options tonight!",
            events: [
                { name: 'The Electric Lounge', type: 'Nightclub', description: 'Vibrant club with top DJs.', location: 'Downtown', date: 'Tonight', time: '10 PM', ticketsUrl: '#', vipOptions: true, imageUrl: 'https://images.unsplash.com/photo-1540324021-9957d079d857?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Best for dancing and high energy.' },
                { name: 'Quiet Jazz Corner', type: 'Bar', description: 'Cozy spot with live jazz music.', location: 'West Side', date: 'Tonight', time: '8 PM', ticketsUrl: '#', vipOptions: false, imageUrl: 'https://images.unsplash.com/photo-1517487829777-66a93bf81d11?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Perfect for a relaxing evening.' },
            ],
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const prompt = `Find nightlife events or venues for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Provide an AI summary and a list of up to 3 events. Each event should have: name, type, description, location, date, time, optional ticketsUrl, optional vipOptions (boolean), optional imageUrl, and a concise AI-generated 'reason' for the recommendation. Output as a JSON object.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: { retrievalConfig: { latLng: location } },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiSummary: { type: Type.STRING },
                        events: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    date: { type: Type.STRING },
                                    time: { type: Type.STRING },
                                    ticketsUrl: { type: Type.STRING },
                                    vipOptions: { type: Type.BOOLEAN },
                                    imageUrl: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ["name", "type", "description", "location", "date", "time", "reason"],
                            },
                        },
                    },
                    required: ["aiSummary", "events"],
                },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding nightlife events:", error);
        throw new Error("Failed to find nightlife events.");
    }
};

/**
 * Suggests a dashboard layout based on user input.
 * Uses 'gemini-2.5-flash' for quick layout recommendations.
 * @param {string} userDescription - A description of the user's ideal dashboard or workflow.
 * @returns {Promise<DashboardLayout>} A promise that resolves to a suggested dashboard layout.
 */
export const suggestDashboardLayout = async (userDescription: string): Promise<DashboardLayout> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const lowerDesc = userDescription.toLowerCase();
        if (lowerDesc.includes('work') || lowerDesc.includes('project') || lowerDesc.includes('email')) {
            return 'work';
        } else if (lowerDesc.includes('code') || lowerDesc.includes('dev') || lowerDesc.includes('terminal')) {
            return 'developer';
        }
        return 'default';
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the user's description: "${userDescription}", suggest the most suitable dashboard layout from 'default', 'work', or 'developer'. Respond only with the suggested layout name.`,
            config: {
                systemInstruction: "You are a dashboard layout assistant. Recommend layouts that best match user needs.",
            },
        });
        const layout = response.text.trim().toLowerCase();
        if (['default', 'work', 'developer'].includes(layout)) {
            return layout as DashboardLayout;
        }
        return 'default'; // Fallback
    } catch (error) {
        console.error("Error suggesting dashboard layout:", error);
        throw new Error("Failed to suggest dashboard layout.");
    }
};

/**
 * Gets trending news and tools for a widget display.
 * @returns {Promise<TrendingItem[]>} A promise that resolves to an array of trending items.
 */
export const getTrendingItems = async (): Promise<TrendingItem[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockTrending: TrendingItem[] = [
            { rank: 1, name: 'Gemini 2.5 Pro', category: 'Model', change: 15 },
            { rank: 2, name: 'Veo Video', category: 'Tool', change: 10 },
            { rank: 3, name: 'AI Safety', category: 'News', change: 8 },
        ];
        return mockTrending;
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "List 3 currently trending AI models, tools, or news topics, including their name, category (Model, Tool, News), and a 'change' score indicating popularity trend. Output as a JSON array.",
            config: {
                tools: [{googleSearch: {}}],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rank: { type: Type.INTEGER },
                            name: { type: Type.STRING },
                            category: { type: Type.STRING, enum: ['Tool', 'Model', 'News'] },
                            change: { type: Type.NUMBER },
                        },
                        required: ["rank", "name", "category", "change"],
                    },
                },
            },
        });
        const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting trending items:", error);
        // Fallback to mock data on error
        const mockTrending: TrendingItem[] = [
            { rank: 1, name: 'Gemini 2.5 Pro', category: 'Model', change: 15 },
            { rank: 2, name: 'Veo Video', category: 'Tool', change: 10 },
            { rank: 3, name: 'AI Safety', category: 'News', change: 8 },
        ];
        return mockTrending;
    }
};