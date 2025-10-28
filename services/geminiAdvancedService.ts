import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality, FunctionDeclaration } from "@google/genai";
import { TravelPlan, Workflow, SystemVoice, WorkflowNode, WorkflowConnection, ExecutionLogEntry, SkillID, Engram, UserAction, DashboardLayout, AppID, SocialPost, SharedContent, RideOption, WeatherData, FastFoodRestaurant, CleaningService, NightlifeEvent, CurrentWeather, ForecastDay, FinancialNews, FinancialAnalysis, FlightOption, FlightSearchDetails } from "../types";
import { skills } from '../data/skills';
import { initialNexusPosts } from "../data/nexus";

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
 * Synthesizes a memory engram from a given thought or experience.
 * This is a placeholder function.
 * @param {string} thought - The thought or experience to synthesize.
 * @returns {Promise<Engram>} A promise that resolves to a new Engram.
 */
export const synthesizeMemory = async (thought: string): Promise<Engram> => {
    console.log("Synthesizing memory for:", thought);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        id: `engram-${Date.now()}`,
        timestamp: new Date().toISOString(),
        content: thought,
        type: 'thought',
        mood: 'neutral',
        keywords: thought.split(' '),
        relatedEngrams: [],
    };
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
        if (error instanceof Error) {
            throw new Error(`Error during grounded search: ${error.message}`);
        }
        throw new Error("An unknown error occurred during grounded search.");
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
        if (error instanceof Error) {
            throw new Error(`Error during maps search: ${error.message}`);
        }
        throw new Error("An unknown error occurred during maps search.");
    }
};

/**
 * Searches for flight options based on provided details using the Gemini API with a tool call.
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

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [flightSearchTool] }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            carrier: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            currency: { type: Type.STRING },
                            departureTime: { type: Type.STRING },
                            arrivalTime: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            stops: { type: Type.INTEGER },
                            url: { type: Type.STRING },
                        }
                    }
                }
            },
        });

        // In a real scenario, you'd execute the function call from response.functionCalls
        // For this example, we'll assume Gemini directly returns the desired JSON structure if configured correctly.
        // If Gemini were to return a FunctionCall, the application would parse it, call the actual flight API,
        // and then feed the results back to Gemini using `sendToolResponse`.
        // For now, we expect the response.text to be the JSON output from the `responseSchema`.
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error searching flights:", error);
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
        if (error instanceof Error) {
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
        throw new Error("An unknown error occurred during speech generation.");
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
        if (error instanceof Error) {
            throw new Error(`Failed to translate text: ${error.message}`);
        }
        throw new Error("An unknown error occurred during translation.");
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
        const audioPart = { inlineData: { mimeType, data: audioBase64 } };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, { text: "Transcribe this audio." }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
        throw new Error("An unknown error occurred during transcription.");
    }
};

/**
 * Generates a structured workflow from a natural language prompt.
 * Uses 'gemini-2.5-pro' for workflow design.
 * @param {string} prompt - The user's prompt describing the desired workflow.
 * @returns {Promise<Workflow>} A promise that resolves to the AI-generated workflow object.
 * @throws {Error} If the AI fails to generate a workflow.
 */
export const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Return a mock travel workflow
        return {
            title: `Workflow for: "${prompt}"`,
            nodes: [
                { id: '1', agentId: 'luna', description: 'Plan itinerary for Tokyo' },
                { id: '2', agentId: 'scout', description: 'Find flights and hotels' },
                { id: '3', agentId: 'karim', description: 'Create budget' },
            ],
            connections: [{ from: '1', to: '2' }, { from: '2', to: '3' }]
        };
    }
    // FIX: Initialize the GoogleGenAI client inside the function to ensure the API key is available.
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are an expert workflow designer. Based on the user's prompt, create a logical sequence of steps. Each step should be assigned to an agent that possesses the necessary skills. Available agent IDs are 'luna' (planning, flight-search), 'scout' (searching, web-search, flight-search), 'karim' (finance, web-search), 'maya' (communication, fast-text, text-to-speech), 'jules' (technical), 'leo' (marketing manager). A travel plan needs Luna, Scout, and Karim. A business plan needs Leo. A coding task needs Jules. Break down the user's request into a series of nodes and connect them logically. The output must be a valid JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction,
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
                                    agentId: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ['id', 'agentId', 'description'],
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
                                required: ['from', 'to'],
                            },
                        },
                    },
                    required: ['title', 'nodes', 'connections'],
                },
                tools: [{
                    functionDeclarations: [
                        // Include hypothetical function declarations that agents might use.
                        // For this demo, these are not directly called but inform the AI's planning.
                        {
                            name: 'planItinerary',
                            description: 'Creates a detailed daily itinerary for a trip.',
                            parameters: { type: Type.OBJECT, properties: { destination: { type: Type.STRING }, startDate: { type: Type.STRING }, endDate: { type: Type.STRING } } }
                        },
                        {
                            name: 'findBestDeals',
                            description: 'Searches for the best prices on flights, hotels, and activities.',
                            parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING }, budget: { type: Type.NUMBER } } }
                        },
                        {
                            name: 'optimizeBudget',
                            description: 'Analyzes and optimizes a travel budget.',
                            parameters: { type: Type.OBJECT, properties: { plan: { type: Type.STRING } } }
                        },
                        flightSearchTool, // Include the flight search tool in the workflow agent's capabilities
                    ],
                }],
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating workflow:", error);
        throw new Error("Failed to generate workflow from AI.");
    }
};

/**
 * Executes a simulated dynamic AI workflow, generating log entries based on predefined agents and tasks.
 * This function is for demonstration purposes and does not actually call external services in real-time.
 * @param {Workflow} workflow - The workflow to execute.
 * @param {any} [initialData] - Optional initial data to pass to the workflow.
 * @returns {AsyncGenerator<ExecutionLogEntry, void, void>} An async generator that yields execution log entries.
 */
export async function* executeDynamicWorkflow(workflow: Workflow, initialData?: any): AsyncGenerator<ExecutionLogEntry, void, void> {
    const executedNodes = new Set<string>();
    const queue: { node: WorkflowNode; input: any }[] = [];
    const results: Record<string, any> = { ...initialData };

    // Start with nodes that have no incoming connections (or are explicitly triggered)
    const allNodeIds = new Set(workflow.nodes.map(node => node.id));
    const nodesWithIncomingConnections = new Set(workflow.connections.map(conn => conn.to));
    const startingNodes = workflow.nodes.filter(node => !nodesWithIncomingConnections.has(node.id));

    startingNodes.forEach(node => queue.push({ node, input: initialData }));

    let step = 0;
    while (queue.length > 0) {
        const { node, input } = queue.shift()!;
        if (executedNodes.has(node.id)) continue;

        step++;
        yield { step, thought: `Agent ${node.agentId} is starting task: ${node.description}`, action: `Executing ${node.description}`, result: 'Processing...' };

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

        let nodeResult: any;
        if (node.agentId === 'luna' && node.description.includes('Plan Itinerary')) {
            nodeResult = await generateTravelPlan(input as { destination: string, startDate: string, endDate: string, budget: string });
            results.travelPlan = nodeResult;
        } else if (node.agentId === 'scout' && node.description.includes('Find Deals')) {
             nodeResult = { deals: [{ title: '5% off hotels', url: '#' }] };
        } else if (node.agentId === 'karim' && node.description.includes('Optimize Budget')) {
             nodeResult = { optimizedBudget: (input.travelPlan?.budget || []).reduce((sum: number, item: {cost:number}) => sum + item.cost, 0) * 0.9 };
        } else {
            nodeResult = `Task '${node.description}' completed by ${node.agentId}.`;
        }
        
        results[node.id] = nodeResult;
        executedNodes.add(node.id);

        yield { step, thought: `Task '${node.description}' completed by ${node.agentId}.`, action: `Completed ${node.description}`, result: nodeResult || 'Success' };

        // Add next nodes to queue
        workflow.connections.filter(conn => conn.from === node.id).forEach(conn => {
            const nextNode = workflow.nodes.find(n => n.id === conn.to);
            if (nextNode && !executedNodes.has(nextNode.id)) {
                queue.push({ node: nextNode, input: results }); // Pass along accumulated results
            }
        });
    }

    yield { step: step + 1, thought: "Workflow execution complete.", action: "Finalizing workflow", result: results };
}

/**
 * Generates an image based on a text prompt.
 * Uses 'imagen-4.0-generate-001' for high-quality image generation.
 * @param {string} prompt - The text prompt for image generation.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image URL.
 * @throws {Error} If the image generation fails.
 */
export const generateImage = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog.jpg'; // Mock image
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
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
 * Uses 'gemini-2.5-flash-image' for image editing.
 * @param {string} prompt - The text prompt describing the desired edits.
 * @param {string} base64ImageData - The base64 encoded image data of the source image (without prefix).
 * @param {string} mimeType - The MIME type of the source image.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded URL of the edited image.
 * @throws {Error} If the image editing fails.
 */
export const editImage = async (prompt: string, base64ImageData: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Return a slightly different mock image to simulate editing
        return 'https://images.unsplash.com/photo-1582769923234-9279184589d8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG9otby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const generatedPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (generatedPart?.inlineData) {
            return `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};

/**
 * Generates a video from an image and a text prompt.
 * Uses 'veo-3.1-fast-generate-preview' for general video generation.
 *
 * @param {string} prompt - The text prompt for video generation.
 * @param {string} imageBytes - Base64 encoded string of the starting image (without prefix).
 * @param {string} mimeType - MIME type of the image.
 * @param {'16:9' | '9:16'} aspectRatio - Aspect ratio of the video.
 * @returns {AsyncGenerator<{status: 'processing' | 'completed' | 'error', progress?: number, message: string, url?: string}, void, void>} An async generator that yields video generation status updates.
 */
export async function* generateVideoFromImage(
    prompt: string,
    imageBytes: string,
    mimeType: string,
    aspectRatio: '16:9' | '9:16'
): AsyncGenerator<{status: 'processing' | 'completed' | 'error', progress?: number, message: string, url?: string}, void, void> {
    if (!API_KEY) {
        yield { status: 'processing', progress: 50, message: 'Simulating video generation...' };
        await new Promise(resolve => setTimeout(resolve, 5000));
        yield { status: 'completed', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', message: 'Simulated video generated.' };
        return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: { imageBytes: imageBytes, mimeType: mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        let progress = 0;
        const messages = [
            "Analyzing prompt and image...",
            "Composing initial frames...",
            "Applying motion dynamics...",
            "Enhancing visual fidelity...",
            "Finalizing video rendering...",
        ];
        let messageIndex = 0;

        while (!operation.done) {
            progress = Math.min(progress + 10, 90); // Increment progress, max 90% before done
            yield { status: 'processing', progress: progress, message: messages[messageIndex % messages.length] };
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            const downloadLink = operation.response.generatedVideos[0].video.uri;
            // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
            // In a real application, you might use a proxy or sign the URL to hide the API key.
            const videoUrl = `${downloadLink}&key=${API_KEY}`;
            yield { status: 'completed', url: videoUrl, message: 'Video generation successful!' };
        } else if (operation.error) {
            throw new Error(operation.error.message);
        } else {
            throw new Error("Video generation completed, but no video URI found.");
        }
    } catch (error: any) {
        console.error("Error generating video:", error);
        yield { status: 'error', message: error.message || 'An unexpected error occurred during video generation.' };
    }
}

/**
 * Analyzes video content based on a text prompt.
 * Uses 'gemini-2.5-flash' with video input capabilities.
 * @param {string} videoBase64 - The base64 encoded video data (without prefix).
 * @param {string} mimeType - The MIME type of the video.
 * @param {string} prompt - The question or instruction for video analysis.
 * @returns {Promise<string>} A promise that resolves to the AI's video analysis.
 * @throws {Error} If the video analysis fails.
 */
export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return "This is a mock video analysis: The main subject appears to be a cat playing with a toy. Key events include the cat pouncing at 0:05 and a close-up of its eyes at 0:12.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const videoPart = { inlineData: { mimeType, data: videoBase64 } };
        const textPart = { text: prompt };
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [videoPart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video.");
    }
};


/**
 * Generates SEO ideas including keywords, blog outlines, and ad copy.
 * Uses 'gemini-2.5-pro' for comprehensive marketing strategy.
 * @param {string} url - The website URL to analyze.
 * @param {string} topic - The primary topic or keyword.
 * @returns {Promise<{keywords: string[]; blogOutline: {title: string; points: string[];}; adCopy: string[];}>} A promise that resolves to structured SEO data.
 * @throws {Error} If the AI fails to generate SEO ideas.
 */
export const generateSeoIdeas = async (url: string, topic: string): Promise<{keywords: string[]; blogOutline: {title: string; points: string[];}; adCopy: string[];}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            keywords: ['mock-seo', 'ai-strategy', topic],
            blogOutline: { title: `Mock Blog: The Future of ${topic}`, points: ['Introduction', 'Key trends', 'Conclusion'] },
            adCopy: [`Discover the power of ${topic}!`, `Revolutionize your strategy with AI.`],
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Generate comprehensive SEO ideas for the website ${url} focusing on the topic "${topic}". Provide a list of target keywords, a detailed blog post outline (title and bullet points), and three distinct ad copy headlines. The output must be a valid JSON object.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        blogOutline: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                        adCopy: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating SEO ideas:", error);
        throw new Error("Failed to generate SEO ideas.");
    }
};

/**
 * Creates ad copy (headline, body, CTA) based on product description and target audience.
 * Uses 'gemini-2.5-pro' for compelling ad creative.
 * @param {string} productDescription - Description of the product or service.
 * @param {string} targetAudience - Description of the target audience.
 * @returns {Promise<{headline: string; body: string; cta: string;}>} A promise that resolves to structured ad copy.
 * @throws {Error} If the AI fails to create ad copy.
 */
export const createAdCopy = async (productDescription: string, targetAudience: string): Promise<{headline: string; body: string; cta: string;}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            headline: `Mock Headline for ${productDescription}`,
            body: `Engaging copy for ${targetAudience} to learn more about ${productDescription}.`,
            cta: 'Learn More Now!',
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const prompt = `Create a compelling ad copy (headline, body, and call-to-action) for a product/service described as "${productDescription}", targeting "${targetAudience}". The output must be a valid JSON object.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error creating ad copy:", error);
        throw new Error("Failed to create ad copy.");
    }
};

/**
 * Summarizes a given text content.
 * Uses 'gemini-2.5-flash' for concise summarization.
 * @param {string} text - The text content to summarize.
 * @returns {Promise<string>} A promise that resolves to the summarized text.
 */
export const summarizeText = async (text: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `This is a mock summary of: "${text.substring(0, 50)}..."`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following text concisely: ${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to summarize text: ${error.message}`);
        }
        throw new Error("An unknown error occurred during summarization.");
    }
};

/**
 * Suggests an AI agent persona (name, icon, skills) based on a desired role.
 * Uses 'gemini-2.5-flash' for creative agent design.
 * @param {string} roleDescription - A description of the agent's desired role.
 * @returns {Promise<{name: string; icon: string; skillIDs: string[];}>} A promise that resolves to suggested agent persona details.
 * @throws {Error} If the AI fails to suggest a persona.
 */
export const suggestAgentPersona = async (roleDescription: string): Promise<{name: string; icon: string; skillIDs: string[];}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            name: `Mock ${roleDescription.split(' ')[0]} Bot`,
            icon: '✨',
            skillIDs: ['gemini-pro-text'],
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const availableSkills = skills.map(s => s.id).join(', ');
    const systemInstruction = `You are an AI agent designer. Given a role description, suggest a fitting name (max 3 words), a single emoji icon, and a list of up to 3 relevant skill IDs from the following: [${availableSkills}]. The output must be a valid JSON object.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Suggest a persona for an agent with the role: "${roleDescription}".`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        skillIDs: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error suggesting agent persona:", error);
        throw new Error("Failed to suggest agent persona.");
    }
};

/**
 * Suggests a dashboard layout based on a user's description.
 * Uses 'gemini-2.5-flash' for layout recommendations.
 * @param {string} userDescription - Description of the user's ideal dashboard.
 * @returns {Promise<DashboardLayout>} A promise that resolves to a suggested dashboard layout ID.
 * @throws {Error} If the AI fails to suggest a layout.
 */
export const suggestDashboardLayout = async (userDescription: string): Promise<DashboardLayout> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'work'; // Mock suggestion
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const layouts: DashboardLayout[] = ['default', 'work', 'developer'];
    const systemInstruction = `Given a user's description of their ideal dashboard, suggest the best matching layout from: ${layouts.join(', ')}. Respond with only the layout ID (e.g., 'work').`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User describes ideal dashboard: "${userDescription}".`,
            config: { systemInstruction },
        });
        const suggestedLayout = response.text.trim();
        if (layouts.includes(suggestedLayout as DashboardLayout)) {
            return suggestedLayout as DashboardLayout;
        }
        return 'default'; // Fallback to default
    } catch (error) {
        console.error("Error suggesting dashboard layout:", error);
        throw new Error("Failed to suggest dashboard layout.");
    }
};

/**
 * Interprets a natural language voice command into a structured action and target.
 * Uses 'gemini-2.5-flash' for command parsing.
 * @param {string} voiceInput - The raw voice input from the user.
 * @returns {Promise<{action: 'open' | 'close', target: AppID | 'all'} | null>} A promise that resolves to a structured command or null if not understood.
 */
export const interpretVoiceCommand = async (voiceInput: string): Promise<{action: 'open' | 'close', target: AppID | 'all'} | null> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (voiceInput.toLowerCase().includes('chat')) return { action: 'open', target: AppID.chat };
        if (voiceInput.toLowerCase().includes('close all')) return { action: 'close', target: 'all' };
        return null;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const appIds = Object.values(AppID); // FIX: Ensure AppID is used as an enum
    const systemInstruction = `You are a voice command interpreter for an operating system. Convert the user's voice input into a structured JSON command with 'action' ('open' or 'close') and 'target' (one of ${appIds.join(', ')} or 'all'). If the command is unclear, respond with an empty JSON object.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Interpret voice command: "${voiceInput}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['open', 'close'] },
                        target: { type: Type.STRING, enum: [...appIds, 'all'] }
                    },
                    // Allow partial response, if only action or target is understood, fill the rest with null/default
                    required: [], // Make required optional to handle partial understanding
                }
            },
        });
        const jsonText = response.text.trim();
        const command = JSON.parse(jsonText);
        if (command && command.action && command.target) {
            return command;
        }
        return null;
    } catch (error) {
        console.error("Error interpreting voice command:", error);
        return null;
    }
};

/**
 * Generates proactive suggestions for the user based on recent actions.
 * Uses 'gemini-2.5-flash' for contextual recommendations.
 * @param {UserAction[]} recentActions - An array of recent user actions.
 * @returns {Promise<{title: string; suggestions: {text: string; actionAppId?: AppID;}[]}>} A promise that resolves to a list of suggestions.
 */
export const generateProactiveSuggestion = async (recentActions: UserAction[]): Promise<{title: string; suggestions: {text: string; actionAppId?: AppID;}[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            title: "Mock Suggestions",
            suggestions: [{ text: "Try the Chat app!", actionAppId: AppID.chat }],
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const actionDescriptions = recentActions.map(a => `App: ${a.appId}, Details: ${JSON.stringify(a.details || {})}`).join('; ');
    const appIDs = Object.values(AppID); // FIX: Ensure AppID is used as an enum.
    const systemInstruction = `You are a proactive AI assistant. Based on recent user actions ("${actionDescriptions}"), generate 1-2 relevant and helpful suggestions. Each suggestion should include a 'text' and an optional 'actionAppId' if it can directly open an app. Use one of these AppIDs: ${appIDs.join(', ')}. If no app is suitable, omit 'actionAppId'. Respond with only a valid JSON object containing a 'title' for the suggestions and a 'suggestions' array.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User's recent activities: ${actionDescriptions}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        title: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, actionAppId: { type: Type.STRING, enum: appIDs } } } }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating proactive suggestions:", error);
        throw new Error("Failed to generate proactive suggestions.");
    }
};

/**
 * Generates a social media post (caption and hashtags) based on shared content.
 * Uses 'gemini-2.5-flash' for social media copywriting.
 * @param {SharedContent} content - The content to be shared.
 * @returns {Promise<SocialPost>} A promise that resolves to a generated social media post.
 */
export const generateSocialMediaPost = async (content: SharedContent): Promise<SocialPost> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            caption: `Check out this amazing ${content.type}! ${content.title}. #AI #AmrikyyOS`,
            hashtags: ['#AI', '#AmrikyyOS', `#${content.type.replace(/\s/g, '')}`],
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate a compelling social media caption (max 120 characters) and 3-5 relevant hashtags for the following content:\nTitle: ${content.title}\nSubtitle: ${content.subtitle}\nCTA: ${content.cta}\nType: ${content.type}\nOutput must be in JSON format: { "caption": "...", "hashtags": ["#tag1", "#tag2"] }`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post.");
    }
};

/**
 * Generates an AI-powered weather report, summarizing current conditions and forecast.
 * Uses 'gemini-2.5-flash' for concise weather reporting.
 * @param {WeatherData} data - The complete weather data (current and forecast).
 * @returns {Promise<string>} A promise that resolves to the AI-generated weather summary.
 */
export const getAiWeatherReport = async (data: WeatherData): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Mock AI Weather Report: The weather in ${data.current.location} is currently ${data.current.condition} with a temperature of ${data.current.temp}°C. The forecast indicates ${data.forecast[0]?.condition} tomorrow.`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate a concise, friendly AI weather report based on this data:\nCurrent: ${JSON.stringify(data.current)}\nForecast: ${JSON.stringify(data.forecast)}. Focus on key information and a pleasant tone.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating AI weather report:", error);
        throw new Error("Failed to get AI weather report.");
    }
};

/**
 * Tests a system prompt with a user prompt and returns the AI's response.
 * Uses 'gemini-2.5-flash' for quick testing of system instructions.
 * @param {string} systemPrompt - The system instruction to test.
 * @param {string} userPrompt - The user's input prompt.
 * @returns {Promise<string>} A promise that resolves to the AI's response.
 */
export const testSystemPrompt = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Mock AI Response for System Prompt Test: "${userPrompt}" was processed with system instruction: "${systemPrompt}".`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
            },
        });
        return response.text;
    } catch (error: any) {
        console.error("Error testing system prompt:", error);
        throw new Error(`AI Test Failed: ${error.message || "Unknown error."}`);
    }
};

/**
 * Fetches recent financial news.
 * Uses 'gemini-2.5-flash' with Google Search grounding.
 * @returns {Promise<FinancialNews[]>} A promise that resolves to an array of financial news articles.
 */
export const getFinancialNews = async (): Promise<FinancialNews[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [
            { title: "Mock Stock Market Rally", source: "Mock News", url: "#" },
            { title: "AI Sector Growth Continues", source: "Tech Insights", url: "#" },
        ];
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Summarize top 3 recent financial news headlines relevant to technology and AI, including source and URL. Provide the output in JSON format.",
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
                        }
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting financial news:", error);
        throw new Error("Failed to retrieve financial news.");
    }
};

/**
 * Generates a detailed financial analysis for a given stock or crypto ticker.
 * Uses 'gemini-2.5-pro' for in-depth analysis with Google Search grounding.
 * @param {string} ticker - The stock or cryptocurrency ticker symbol.
 * @returns {Promise<FinancialAnalysis>} A promise that resolves to a detailed financial analysis.
 */
export const getFinancialAnalysis = async (ticker: string): Promise<FinancialAnalysis> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            summary: `Mock analysis for ${ticker}: The company shows strong growth potential.`,
            bullCase: "Strong market position and innovation.",
            bearCase: "Increased competition and regulatory risks.",
            keyMetrics: [{ name: "P/E Ratio", value: "25x" }],
            recentNews: "Recent positive earnings report.",
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Provide a detailed financial analysis for ${ticker}. Include a summary, bull case, bear case, key metrics (e.g., P/E, market cap, last closing price), and very recent news impacting it. The output must be a valid JSON object.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        bullCase: { type: Type.STRING },
                        bearCase: { type: Type.STRING },
                        keyMetrics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, value: { type: Type.STRING } }
                            }
                        },
                        recentNews: { type: Type.STRING },
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting financial analysis:", error);
        throw new Error("Failed to retrieve financial analysis.");
    }
};

/**
 * Expands a given topic into a mind map structure including main idea, sub-topics, and questions.
 * Uses 'gemini-2.5-pro' for comprehensive brainstorming.
 * @param {string} topic - The main topic to expand.
 * @returns {Promise<{mainIdea: string; subTopics: string[]; questions: string[];}>} A promise that resolves to a structured mind map.
 */
export const expandTopic = async (topic: string): Promise<{mainIdea: string; subTopics: string[]; questions: string[];}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            mainIdea: `The Concept of ${topic}`,
            subTopics: [`History of ${topic}`, `Applications of ${topic}`, `Future of ${topic}`],
            questions: [`How does ${topic} work?`, `What are the challenges of ${topic}?`],
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Expand the topic "${topic}" into a mind map. Provide a main idea, 3-5 sub-topics, and 2-3 key questions related to the topic. The output must be a valid JSON object.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mainIdea: { type: Type.STRING },
                        subTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error expanding topic:", error);
        throw new Error("Failed to expand topic.");
    }
};

/**
 * Gets a research summary for a given topic.
 * Uses 'gemini-2.5-flash' with Google Search grounding.
 * @param {string} topic - The topic to research.
 * @returns {Promise<string>} A promise that resolves to the research summary.
 */
export const getResearchSummary = async (topic: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Mock Research Summary for ${topic}: This is a concise overview of the key findings and concepts related to ${topic}. Further details can be found in academic papers and reliable online sources.`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Provide a concise research summary for the topic: "${topic}".`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting research summary:", error);
        throw new Error("Failed to get research summary.");
    }
};

/**
 * Finds fast food delivery options based on a user's query and location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding.
 * @param {string} query - The user's food craving or restaurant type.
 * @param {{latitude: number, longitude: number}} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, options: FastFoodRestaurant[] }>} A promise that resolves to AI-generated summary and delivery options.
 */
export const findDeliveryOptions = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: FastFoodRestaurant[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Mock AI Delivery Summary: Here are some top-rated fast-food options near you, based on your craving for pizza.",
            options: [
                { name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '30-40 min', priceLevel: '$$', isTrending: true, imageUrl: 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg', address: '123 Main St', website: '#', reason: 'Known for authentic Neapolitan pizzas.' },
                { name: 'Burger Baron', cuisine: 'American', rating: 4.2, deliveryTime: '20-30 min', priceLevel: '$', isTrending: false, imageUrl: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246_1280.jpg', address: '456 Oak Ave', website: '#', reason: 'Classic burgers and fries, fast delivery.' },
            ]
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find top 2-3 fast food delivery options for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Include restaurant name, cuisine, rating, delivery time, price level ($, $$, $$$), if it's trending, an image URL, address, website, and a concise AI-generated reason for the recommendation. Also provide an overall AI summary of the recommendations. Output must be in JSON format: { "aiSummary": "...", "options": [...] }.`;
    try {
        const response = await ai.models.generateContent({
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
                                    name: { type: Type.STRING }, cuisine: { type: Type.STRING }, rating: { type: Type.NUMBER },
                                    deliveryTime: { type: Type.STRING }, priceLevel: { type: Type.STRING, enum: ['$', '$$', '$$$', '$$$$'] },
                                    isTrending: { type: Type.BOOLEAN }, imageUrl: { type: Type.STRING },
                                    address: { type: Type.STRING }, website: { type: Type.STRING }, reason: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding delivery options:", error);
        throw new Error("Failed to find delivery options.");
    }
};

/**
 * Finds ride-sharing options for a given destination and current location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding.
 * @param {string} destination - The desired destination for the ride.
 * @param {{latitude: number, longitude: number}} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, options: RideOption[] }>} A promise that resolves to AI-generated summary and ride options.
 */
export const getRideOptions = async (destination: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: RideOption[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            aiSummary: `Mock AI Ride Summary: Here are some popular ride options to ${destination} from your current location.`,
            options: [
                { service: 'Uber', estimatedCost: '$15.00', estimatedTime: '10 min', currency: 'USD', surgePricing: false, eta: '3 min', providerLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/256px-Uber_logo_2018.svg.png' },
                { service: 'Lyft', estimatedCost: '$14.50', estimatedTime: '12 min', currency: 'USD', surgePricing: false, eta: '5 min', providerLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Lyft_Logo.svg/256px-Lyft_Logo.svg.png' },
            ]
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find top 2-3 ride-sharing options to "${destination}" from latitude ${location.latitude}, longitude ${location.longitude}. Include service name, estimated cost, estimated time, currency, if surge pricing is active, ETA, a logo URL (if available), and an overall AI summary of the options. Output must be in JSON format: { "aiSummary": "...", "options": [...] }.`;
    try {
        const response = await ai.models.generateContent({
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
                                    service: { type: Type.STRING }, estimatedCost: { type: Type.STRING },
                                    estimatedTime: { type: Type.STRING }, currency: { type: Type.STRING },
                                    surgePricing: { type: Type.BOOLEAN }, eta: { type: Type.STRING }, providerLogo: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting ride options:", error);
        throw new Error("Failed to get ride options.");
    }
};

/**
 * Finds cleaning services based on a user's query and location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding.
 * @param {string} query - The type of cleaning service needed.
 * @param {{latitude: number, longitude: number}} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, services: CleaningService[] }>} A promise that resolves to AI-generated summary and cleaning service options.
 */
export const findCleaningServices = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, services: CleaningService[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Mock AI Cleaning Summary: Based on your request, here are highly-rated cleaning services available in your area.",
            services: [
                { name: 'Sparkle & Shine', type: 'Deep Clean', priceRange: '$150-300', rating: 4.8, availability: 'Next Day', contact: 'tel:+1234567890', imageUrl: 'https://images.unsplash.com/photo-1581578731548-adabda61320a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Offers eco-friendly deep cleaning with excellent reviews.' },
                { name: 'Swift Cleaners', type: 'Standard Clean', priceRange: '$100-200', rating: 4.5, availability: 'Same Week', contact: 'https://swiftcleaners.com', imageUrl: 'https://images.unsplash.com/photo-1521749842100-d8f8a8b19a16?q=80&w=2940&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Fast and efficient service for regular home maintenance.' },
            ]
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find top 2-3 cleaning services for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Include service name, type (e.g., "Deep Clean", "Standard Clean"), price range, rating, availability, contact info (phone or website URL), an image URL, and a concise AI-generated reason for the recommendation. Also provide an overall AI summary of the recommendations. Output must be in JSON format: { "aiSummary": "...", "services": [...] }.`;
    try {
        const response = await ai.models.generateContent({
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
                                    name: { type: Type.STRING }, type: { type: Type.STRING }, priceRange: { type: Type.STRING },
                                    rating: { type: Type.NUMBER }, availability: { type: Type.STRING }, contact: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING }, reason: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding cleaning services:", error);
        throw new Error("Failed to find cleaning services.");
    }
};

/**
 * Finds nightlife events or venues based on a user's query and location.
 * Uses 'gemini-2.5-flash' with Google Maps grounding.
 * @param {string} query - The type of nightlife event or venue (e.g., "live music", "cocktail bar").
 * @param {{latitude: number, longitude: number}} location - The user's current geographical coordinates.
 * @returns {Promise<{aiSummary: string, events: NightlifeEvent[] }>} A promise that resolves to AI-generated summary and nightlife event options.
 */
export const findNightlifeEvents = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, events: NightlifeEvent[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            aiSummary: "Mock AI Nightlife Summary: Here are some exciting nightlife options near you, tailored to your search for live music.",
            events: [
                { name: 'The Blue Note', type: 'Jazz Club', description: 'Legendary jazz venue with nightly live performances.', location: 'Greenwich Village', date: 'Tonight', time: '8:00 PM', ticketsUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1543880572-cfc3d79031d2?q=80&w=2940&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Iconic club with a rich history and top-tier musicians.' },
                { name: 'Electric Groove', type: 'Nightclub', description: 'High-energy club with electronic dance music.', location: 'Meatpacking District', date: 'Fri & Sat', time: '10:00 PM', vipOptions: true, imageUrl: 'https://images.unsplash.com/photo-1594191632007-84687d603a11?q=80&w=2940&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Best place for dancing with renowned DJs and a vibrant atmosphere.' },
            ]
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find top 2-3 nightlife events or venues for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}. Include event/venue name, type (e.g., "Nightclub", "Bar", "Live Music"), description, location, date, time, an optional tickets URL, if VIP options are available, an image URL, and a concise AI-generated reason for the recommendation. Also provide an overall AI summary of the recommendations. Output must be in JSON format: { "aiSummary": "...", "events": [...] }.`;
    try {
        const response = await ai.models.generateContent({
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
                                    name: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING },
                                    location: { type: Type.STRING }, date: { type: Type.STRING }, time: { type: Type.STRING },
                                    ticketsUrl: { type: Type.STRING }, vipOptions: { type: Type.BOOLEAN },
                                    imageUrl: { type: Type.STRING }, reason: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error finding nightlife events:", error);
        throw new Error("Failed to find nightlife events.");
    }
};
