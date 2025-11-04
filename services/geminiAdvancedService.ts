import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality, FunctionDeclaration } from "@google/genai";
import { TravelPlan, Workflow, SystemVoice, WorkflowNode, WorkflowConnection, ExecutionLogEntry, SkillID, Engram, UserAction, DashboardLayout, AppID, SocialPost, SharedContent, RideOption, WeatherData, FastFoodRestaurant, CleaningService, NightlifeEvent, CurrentWeather, ForecastDay, FinancialNews, FinancialAnalysis, FlightOption, FlightSearchDetails, TrendingItem, CustomAgent } from "../types.ts";
import { skills } from '../data/skills.ts';
import { initialNexusPosts } from "../data/nexus.ts";
import { aiNewsData, aiMarketData } from "../data/aiNews.ts";

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
        
        if (!response.text) {
            throw new Error("The AI search returned an empty response. This could be due to the topic or an internal error. Please try a different query.");
        }
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map(chunk => ({ title: chunk.web?.title || '', uri: chunk.web?.uri || ''}))
            .filter(source => source.uri);

        return { text: response.text, sources };
    } catch (error) {
        console.error("Error calling Gemini Search API:", error);
        throw new Error("An error occurred during the AI search.");
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
        
        if (!response.text) {
            throw new Error("The AI maps search returned an empty response. Please try a different location or query.");
        }
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map(chunk => ({ title: chunk.maps?.title || '', uri: chunk.maps?.uri || ''}))
            .filter(source => source.uri);

        return { text: response.text, sources };
    } catch (error) {
        console.error("Error calling Gemini Maps API:", error);
        throw new Error("An error occurred during the AI maps search.");
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
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const flightCall = response.functionCalls.find(fc => fc.name === 'findFlights');
            if (flightCall) {
                // In a real app, we'd use flightCall.args to query a flight API.
                // For this playground, we'll return mock data as if the tool was called.
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
                return mockFlights.filter(f => f.price <= 500 || details.cabinClass === 'Business' || details.cabinClass === 'First');
            }
        }
        
        // If the AI doesn't call the tool, it means no flights were found or it couldn't understand.
        // We can either return an empty array or throw an error. Throwing an error provides more feedback to the UI.
        throw new Error("AI did not determine a flight search was needed or failed to provide a valid function call.");

    } catch (error) {
        console.error("Error searching flights:", error);
        // The specific SyntaxError check is no longer needed as we are not parsing JSON.
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
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const createTravelPlanTool: FunctionDeclaration = {
        name: 'createTravelPlan',
        description: 'Creates a structured travel plan including itinerary, budget, and links.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                destination: { type: Type.STRING },
                tripTitle: { type: Type.STRING },
                itinerary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["day", "title", "activities"]
                    }
                },
                budget: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            cost: { type: Type.NUMBER }
                        },
                        required: ["category", "cost"]
                    }
                },
                dealsAndLinks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            url: { type: Type.STRING }
                        },
                        required: ["title", "url"]
                    }
                }
            },
            required: ["destination", "tripTitle", "itinerary", "budget", "dealsAndLinks"]
        }
    };

    try {
        const prompt = `Create a detailed travel plan for a trip to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate} with a budget of $${tripDetails.budget}. Use the createTravelPlan tool. The plan should include a creative trip title, a day-by-day itinerary with specific activities, a detailed budget breakdown into categories, and a list of useful web links and potential deals.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [createTravelPlanTool] }],
            },
        });

        const functionCall = response.functionCalls?.find(fc => fc.name === 'createTravelPlan');
        if (functionCall?.args) {
            // The arguments from the function call are the structured travel plan.
            return functionCall.args as unknown as TravelPlan;
        }

        throw new Error("AI did not generate a valid travel plan structure.");

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
                        },
                        required: ["title", "start", "end"]
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
 * @param {number} [rate=1.0] - The speech rate (e.g., 1.0 is normal).
 * @param {number} [pitch=0.0] - The speech pitch (e.g., 0.0 is normal).
 * @returns {Promise<string>} A promise that resolves to the base64 encoded audio string.
 */
export const generateSpeech = async (text: string, voiceName: SystemVoice = 'Kore', rate = 1.0, pitch = 0.0): Promise<string> => {
    if (!API_KEY) {
        return ''; // Return empty string for mock
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName as string },
                    },
                    // Note: rate and pitch are not directly supported in the config object for this API version.
                    // Voice style can be influenced via the prompt.
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech from AI.");
    }
};

export const suggestDashboardLayout = async (prompt: string): Promise<DashboardLayout> => {
    if (!API_KEY) {
        return 'default';
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on this user description of their workflow: "${prompt}", suggest the best dashboard layout. The options are 'default', 'work', or 'developer'. Return only one of these three options in a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        layout: {
                            type: Type.STRING,
                            enum: ['default', 'work', 'developer']
                        }
                    },
                    required: ["layout"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json.layout || 'default';
    } catch (error) {
        console.error("Error suggesting dashboard layout:", error);
        return 'default';
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
    }

    const { imageUrl } = await response.json();
    return imageUrl;
};

export async function* generateVideoFromImage(prompt: string, imageBytes: string, mimeType: string, aspectRatio: '16:9' | '9:16'): AsyncGenerator<{ status: 'processing' | 'completed' | 'error'; progress: number; message: string; url?: string }> {
    if (!API_KEY) {
        yield { status: 'processing', progress: 50, message: 'Simulating video generation...' };
        await new Promise(resolve => setTimeout(resolve, 3000));
        yield { status: 'completed', progress: 100, message: 'Video generation successful!', url: 'https://storage.googleapis.com/gweb-aip.appspot.com/v1/g-veo-v2.mp4' };
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: { imageBytes, mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        yield { status: 'processing', progress: 10, message: 'Operation started...' };

        let progress = 10;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            progress = Math.min(95, progress + 10);
            yield { status: 'processing', progress, message: 'Processing video...' };
        }
        
        if (operation.error) {
            throw new Error(operation.error.message);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed but no download link was found.");
        }

        const finalUrl = `${downloadLink}&key=${API_KEY}`;
        yield { status: 'completed', progress: 100, message: 'Video ready!', url: finalUrl };

    } catch (e: any) {
        console.error("Error generating video:", e);
        const message = e.message || 'An unknown error occurred during video generation.';
        if (message.includes('API key not valid')) {
             yield { status: 'error', progress: 0, message: 'API key is invalid. Please select a valid key.' };
        } else {
            yield { status: 'error', progress: 0, message };
        }
    }
}

export const executeDynamicWorkflow = async (initialPrompt: string): Promise<ExecutionLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return [
        { step: 1, thought: "I need to plan a trip.", action: "Agent: Luna", result: "Itinerary created." },
        { step: 2, thought: "Now find deals.", action: "Agent: Scout", result: "Deals found." },
        { step: 3, thought: "Finalize budget.", action: "Agent: Karim", result: "Budget optimized." },
    ];
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        return "This is a mock transcription.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { data: base64Audio, mimeType } },
                    { text: "Transcribe this audio." }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to transcribe audio.");
    }
};

export const analyzeVideo = async (base64Video: string, mimeType: string, prompt: string): Promise<string> => {
    if (!API_KEY) {
        return "This is a mock video analysis. The video shows a cat playing with a toy.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { data: base64Video, mimeType } },
                    { text: prompt }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video.");
    }
};

export const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
    if (!API_KEY) {
        return { title: `Workflow for "${prompt}"`, nodes: [{id: '1', agentId: 'luna', description: 'Step 1'}], connections: [] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Based on the prompt "${prompt}", create a simple workflow. The workflow should have a title, a list of nodes (with id, agentId, description), and connections (from, to). Use agents like 'luna', 'scout', 'karim'.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, agentId: { type: Type.STRING }, description: { type: Type.STRING } } } },
                        connections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING } } } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating workflow:", error);
        throw new Error("Failed to generate workflow.");
    }
};

export const generateSeoIdeas = async (url: string, topic: string): Promise<{ keywords: string[], blogOutline: { title: string, points: string[] }, adCopy: string[] }> => {
    if (!API_KEY) {
        return { keywords: ['mock', 'seo'], blogOutline: { title: 'Mock Blog', points: ['Point 1'] }, adCopy: ['Mock Ad'] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate SEO ideas for a website at ${url} with the primary topic being "${topic}". Provide a list of 5-7 relevant keywords, a blog post outline with a title and bullet points, and 3 short ad copy headlines.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        blogOutline: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, points: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                        adCopy: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating SEO ideas:", error);
        throw new Error("Failed to generate SEO ideas.");
    }
};

export const createAdCopy = async (productDescription: string, targetAudience: string): Promise<{ headline: string, body: string, cta: string }> => {
    if (!API_KEY) {
        return { headline: 'Mock Headline', body: 'Mock body text.', cta: 'Click Here' };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Create ad copy for a product described as "${productDescription}". The target audience is "${targetAudience}". Provide a headline, body text, and a call to action (CTA).`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error creating ad copy:", error);
        throw new Error("Failed to create ad copy.");
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    if (!API_KEY) {
        return "This is a mock summary of the text.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following text: \n\n${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw new Error("Failed to summarize text.");
    }
};

export const suggestAgentPersona = async (role: string): Promise<Pick<CustomAgent, 'name' | 'icon' | 'skillIDs'>> => {
    if (!API_KEY) {
        return { name: 'Suggested Agent', icon: '💡', skillIDs: ['gemini-pro-text'] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const skillList = skills.map(s => s.id).join(', ');
    const prompt = `Based on the role "${role}", suggest a creative name, a single emoji icon, and a list of relevant skill IDs from the following list: ${skillList}.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        skillIDs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error suggesting agent persona:", error);
        throw new Error("Failed to suggest agent persona.");
    }
};

export const synthesizeMemory = async (prompt: string, engrams: Engram[]): Promise<Omit<Engram, 'id' | 'timestamp'>> => {
    if (!API_KEY) {
        return { label: 'New Insight', type: 'synthesized_insight', content: 'This is a mock synthesized memory.', potentiality: 0, color: '#FFFFFF' };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const context = engrams.map(e => `${e.label}: ${e.content}`).join('\n');
    const fullPrompt = `Given the following memories:\n${context}\n\nSynthesize a new insight based on this prompt: "${prompt}". Provide a label, content, and color for the new memory.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        content: { type: Type.STRING },
                        color: { type: Type.STRING },
                    }
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return { ...result, type: 'synthesized_insight', potentiality: 0 };
    } catch (error) {
        console.error("Error synthesizing memory:", error);
        throw new Error("Failed to synthesize memory.");
    }
};

export const interpretVoiceCommand = async (transcript: string): Promise<{ action: 'open' | 'close', target: AppID | 'all' }> => {
    if (!API_KEY) {
        if (transcript.toLowerCase().includes('open chat')) return { action: 'open', target: AppID.chat };
        return { action: 'open', target: AppID.chat };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Interpret the following voice command: "${transcript}". Determine the action ('open' or 'close') and the target (an application ID like 'chat', 'settings', or 'all').`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['open', 'close'] },
                        target: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error interpreting voice command:", error);
        throw new Error("Failed to interpret voice command.");
    }
};

export const generateProactiveSuggestion = async (actions: UserAction[]): Promise<{ title: string, suggestions: { text: string, actionAppId?: AppID }[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { title: 'Mock Suggestions', suggestions: [{ text: 'Open the travel planner?', actionAppId: AppID.travelAgent }] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Based on the user's recent actions: ${JSON.stringify(actions)}, provide a title and a list of 1-2 proactive suggestions. Each suggestion should have text and an optional actionAppId if it directly relates to opening an app.`;

    const createSuggestionsTool: FunctionDeclaration = {
        name: 'createProactiveSuggestions',
        description: 'Creates a list of proactive suggestions for the user based on their recent actions.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A creative title for the suggestion box, e.g., 'Creative Spark?' or 'Next Steps?'." },
                suggestions: {
                    type: Type.ARRAY,
                    description: "A list of 1 to 2 suggestion objects.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "The suggestion text to show the user." },
                            actionAppId: { type: Type.STRING, description: "Optional. If the suggestion is to open an app, provide its AppID." }
                        },
                        required: ["text"]
                    }
                }
            },
            required: ["title", "suggestions"]
        }
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ functionDeclarations: [createSuggestionsTool] }]
            }
        });

        const functionCall = response.functionCalls?.find(fc => fc.name === 'createProactiveSuggestions');
        if (functionCall?.args) {
            return functionCall.args as any;
        }

        throw new Error("AI did not generate a valid suggestion structure.");

    } catch (error) {
        console.error("Error generating proactive suggestion:", error);
        throw new Error("Failed to generate proactive suggestion.");
    }
};

export const generateSocialMediaPost = async (content: SharedContent): Promise<SocialPost> => {
    if (!API_KEY) {
        return { caption: `Check out this mock ${content.type}!`, hashtags: ['#mock', '#ai'] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate a social media post for the following content: ${JSON.stringify(content)}. Provide a catchy caption and a list of relevant hashtags.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post.");
    }
};

export const testSystemPrompt = async (systemInstruction: string, userPrompt: string): Promise<string> => {
    if (!API_KEY) {
        return `This is a mock response based on the system prompt: "${systemInstruction}"`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction }
        });
        return response.text;
    } catch (error) {
        console.error("Error testing system prompt:", error);
        throw new Error("Failed to test system prompt.");
    }
};

export const getFinancialNews = async (): Promise<FinancialNews[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
        { title: 'AI Stocks Rally on New Chip Announcements', source: 'TechCrunch', url: '#' },
        { title: 'Market Volatility Expected to Increase Next Quarter', source: 'Bloomberg', url: '#' },
    ];
};

export const getFinancialAnalysis = async (ticker: string): Promise<FinancialAnalysis> => {
    if (!API_KEY) {
        return { summary: `Mock analysis for ${ticker}.`, bullCase: 'It could go up.', bearCase: 'It could go down.', keyMetrics: [{name: 'P/E', value: 'N/A'}], recentNews: 'No recent news.' };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Provide a financial analysis for the stock ticker ${ticker}. Include a summary, a bull case, a bear case, key metrics, and recent news.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        bullCase: { type: Type.STRING },
                        bearCase: { type: Type.STRING },
                        keyMetrics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.STRING } } } },
                        recentNews: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting financial analysis:", error);
        throw new Error("Failed to get financial analysis.");
    }
};

export const expandTopic = async (topic: string): Promise<{ mainIdea: string, subTopics: string[], questions: string[] }> => {
    if (!API_KEY) {
        return { mainIdea: topic, subTopics: ['Sub-topic 1', 'Sub-topic 2'], questions: ['Question 1?', 'Question 2?'] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Expand the topic "${topic}" into a mind map structure. Provide the main idea, a list of sub-topics, and a list of thought-provoking questions.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mainIdea: { type: Type.STRING },
                        subTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error expanding topic:", error);
        throw new Error("Failed to expand topic.");
    }
};

export const getResearchSummary = async (topic: string): Promise<string> => {
    const { text } = await groundedSearch(`Provide a concise summary of ${topic}.`, false);
    return text;
};

export const translateText = async (text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> => {
    if (!API_KEY) {
        return `(Mock translation of "${text}" to ${targetLanguage})`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Translate the following text to ${targetLanguage}${sourceLanguage ? ` from ${sourceLanguage}` : ''}: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("Failed to translate text.");
    }
};

export const getAiWeatherReport = async (weatherData: WeatherData): Promise<string> => {
    if (!API_KEY) {
        return `Mock AI summary: It looks ${weatherData.current.condition.toLowerCase()} today, with a high of ${weatherData.current.high} degrees. The rest of the week looks mixed.`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Provide a conversational, brief weather summary and forecast based on this data: ${JSON.stringify(weatherData)}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI weather report:", error);
        throw new Error("Failed to get AI weather report.");
    }
};

/**
 * Generates a video from a text prompt.
 * This is a mock implementation.
 * @param {string} prompt - The text prompt for video generation.
 * @returns {Promise<string>} A promise that resolves to the URL of the generated video.
 */
export const generateVideo = async (prompt: string): Promise<{ jobId: string }> => {
    console.log(`Generating video for prompt: "${prompt}"`);
    // In a real implementation, you would make an API call to a video generation service.
    // This is a placeholder for that logic.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    return { jobId: `vid-${Date.now()}` };
};

export const getVideoStatus = async (jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed', url?: string }> => {
    console.log(`Getting status for video job: "${jobId}"`);
    // Mock logic to simulate video processing
    const mockStatus = Math.random();
    if (mockStatus < 0.7) {
        return { status: 'processing' };
    } else if (mockStatus < 0.9) {
        return { status: 'completed', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' };
    } else {
        return { status: 'failed' };
    }
};

export const findDeliveryOptions = async (query: string, location: { latitude: number, longitude: number }): Promise<{ aiSummary: string, options: FastFoodRestaurant[] }> => {
    if (!API_KEY) {
        return { aiSummary: 'Mock summary', options: [] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find fast food delivery options for "${query}" near the user. Provide an AI summary and a list of options with details. Respond in JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        aiSummary: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    name: { type: Type.STRING }, cuisine: { type: Type.STRING }, rating: { type: Type.NUMBER }, deliveryTime: { type: Type.STRING }, priceLevel: { type: Type.STRING }, isTrending: { type: Type.BOOLEAN }, imageUrl: { type: Type.STRING }, address: { type: Type.STRING }, website: { type: Type.STRING }, reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error finding delivery options:", error);
        throw new Error("Failed to find delivery options.");
    }
};

export const getRideOptions = async (destination: string, location: { latitude: number, longitude: number }): Promise<{ aiSummary: string, options: RideOption[] }> => {
    if (!API_KEY) {
        return { aiSummary: 'Mock summary', options: [] };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find ride-sharing options to "${destination}" from the user's current location. Provide an AI summary and a list of options. Respond in JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        aiSummary: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    service: { type: Type.STRING }, estimatedCost: { type: Type.STRING }, estimatedTime: { type: Type.STRING }, currency: { type: Type.STRING }, surgePricing: { type: Type.BOOLEAN }, eta: { type: Type.STRING }, providerLogo: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting ride options:", error);
        throw new Error("Failed to get ride options.");
    }
};

export const findCleaningServices = async (query: string, location: { latitude: number, longitude: number }): Promise<{ aiSummary: string, services: CleaningService[] }> => {
    if (!API_KEY) { return { aiSummary: 'Mock summary', services: [] }; }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find cleaning services for "${query}" near the user. Provide an AI summary and a list of options. Respond in JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        aiSummary: { type: Type.STRING },
                        services: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, priceRange: { type: Type.STRING }, rating: { type: Type.NUMBER }, availability: { type: Type.STRING }, contact: { type: Type.STRING }, imageUrl: { type: Type.STRING }, reason: { type: Type.STRING } } } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (e) { console.error("Error finding cleaning services:", e); throw new Error("Failed to find cleaning services."); }
};

export const findNightlifeEvents = async (query: string, location: { latitude: number, longitude: number }): Promise<{ aiSummary: string, events: NightlifeEvent[] }> => {
    if (!API_KEY) { return { aiSummary: 'Mock summary', events: [] }; }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Find nightlife events for "${query}" near the user. Provide an AI summary and a list of options. Respond in JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        aiSummary: { type: Type.STRING },
                        events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING }, location: { type: Type.STRING }, date: { type: Type.STRING }, time: { type: Type.STRING }, ticketsUrl: { type: Type.STRING }, vipOptions: { type: Type.BOOLEAN }, imageUrl: { type: Type.STRING }, reason: { type: Type.STRING } } } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (e) { console.error("Error finding nightlife events:", e); throw new Error("Failed to find nightlife events."); }
};

export const runSystemDiagnostics = async (): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `### System Diagnostic Report
**AI Core:** Nominal. All models responding within parameters.
**Agent Comm Bus:** Healthy. Latency at 12ms.
**Memory Subsystem:** Stable. 76% Engram capacity utilized.
**Cognitive Load:** Optimal at 38%.`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are Jules, an AI system diagnostics and self-healing agent for the Amrikyy AI OS. Your goal is to provide a concise, technical, but optimistic system status report. The user has requested a diagnostic scan. Report on key areas like AI Core, Agent Communication Bus, Memory Subsystem (Engrams), and Cognitive Load. Use markdown for formatting, specifically headings (###) and bold text (**). Keep the report under 50 words.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Run a full system diagnostic and report status.",
            config: { systemInstruction }
        });
        return response.text;
    } catch (error) {
        console.error("Error running system diagnostics:", error);
        throw new Error("Failed to run system diagnostics.");
    }
};

export const generateDocsSummary = async (query: string, lang: 'en' | 'ar'): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return lang === 'ar' ? `هذا ملخص محاكى لـ: ${query}` : `This is a mock summary for: ${query}`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const model = 'gemini-2.5-flash';
        const prompt = lang === "ar"
            ? `قدّم ملخصًا ذكيًا وواضحًا حول: ${query}`
            : `Generate a concise, intelligent summary about: ${query}`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("AI Docs Summary Error:", error);
        throw new Error(lang === "ar" ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." : "AI request failed.");
    }
};