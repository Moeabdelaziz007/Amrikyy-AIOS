import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality, FunctionDeclaration } from "@google/genai";
import { TravelPlan, Workflow, SystemVoice, WorkflowNode, WorkflowConnection, ExecutionLogEntry, SkillID, Engram, UserAction, DashboardLayout, AppID, SocialPost, SharedContent, DeliveryOption, RideOption, WeatherData, FastFoodRestaurant, CleaningService, NightlifeEvent } from "../types";
import { skills } from '../data/skills';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

// Helper to escape characters for SSML
const escapeSSML = (text: string) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Grounded Search with Google
export const groundedSearch = async (prompt: string, thinkingMode: boolean): Promise<{ text: string, sources: {title: string, uri: string}[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { text: "This is a simulated search response. To connect to Gemini, please provide an API key.", sources: [] };
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const modelName = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config: any = { tools: [{googleSearch: {}}] };

    if (thinkingMode) {
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

// Maps Search with Google
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


// Travel Plan Generation
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


// Text-to-Speech
export const generateSpeech = async (text: string, voiceName: SystemVoice = 'Kore', rate: number = 1.0, pitch: number = 0): Promise<string> => {
    if (!API_KEY) return '';
    const ai = new GoogleGenAI({ apiKey: API_KEY });

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

// Text Translation
export const translateText = async (text: string, targetLanguageCode: string, sourceLanguageCode?: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `[Simulated Translation to ${targetLanguageCode}]: Hello, how are you?`;
    }
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

// Audio Translation (using transcription + text translation + speech generation)
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

// Audio Transcription
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return "This is a mock transcription of your audio: Plan a trip to Tokyo for next week.";
    }
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
        return "Failed to transcribe audio.";
    }
};

// Dynamic Workflow Generation
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
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are an expert workflow designer. Based on the user's prompt, create a logical sequence of steps. Each step should be assigned to an agent that possesses the necessary skills. Available agent IDs are 'luna' (planning), 'scout' (searching), 'karim' (finance), 'maya' (communication), 'jules' (technical), 'leo' (marketing manager). A travel plan needs Luna, Scout, and Karim. A business plan needs Leo. A coding task needs Jules. Break down the user's request into a series of nodes and connect them logically. The output must be a valid JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Prompt: "${prompt}"`,
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
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        connections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    from: { type: Type.STRING },
                                    to: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating workflow:", error);
        throw new Error("Failed to generate workflow from prompt.");
    }
};

// Dynamic Workflow Execution
export const executeDynamicWorkflow = async (nodes: WorkflowNode[], connections: WorkflowConnection[]): Promise<ExecutionLogEntry[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [
            { step: 1, thought: "User wants to run a custom workflow. I need to start with the first node.", action: "Executing Node 1 (luna): Plan itinerary for Tokyo", result: "Itinerary draft created." },
            { step: 2, thought: "The workflow connects to the next node. I will proceed.", action: "Executing Node 2 (scout): Find flights and hotels", result: "Found 5 flight options and 10 hotel deals." },
            { step: 3, thought: "The workflow is complete. I will provide a final summary.", action: "Finalizing", result: "Workflow executed successfully. All tasks completed." },
        ];
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const workflowDescription = `
        Nodes: ${JSON.stringify(nodes.map(n => ({ id: n.id, agent: n.agentId, task: n.description })))}
        Connections: ${JSON.stringify(connections)}
    `;

    const systemInstruction = `You are Orion, a master AI orchestrator. You have been given a workflow defined by nodes (agents and their tasks) and connections (the flow of execution).
    Your task is to interpret this workflow and generate a step-by-step execution log of how you would carry it out.
    For each step, provide your "thought" process, the "action" you are taking (which agent is doing what), and the simulated "result" of that action.
    Follow the connections logically from start to end. The final result should be a summary of the entire operation.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Execute the following workflow:\n${workflowDescription}`,
            config: {
                systemInstruction,
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
                        required: ["step", "thought", "action", "result"]
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error executing dynamic workflow:", error);
        throw new Error("Failed to execute dynamic workflow.");
    }
};

export const suggestAgentPersona = async (role: string): Promise<{ name: string; icon: string; skillIDs: SkillID[] }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            name: 'Creative Writer',
            icon: '✍️',
            skillIDs: ['gemini-pro-text', 'fast-text']
        };
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const availableSkills = skills.map(s => `- ${s.id} (${s.name}): ${s.description}`).join('\n');

    const systemInstruction = `You are an AI Agent Persona Designer. Your task is to suggest a creative name, a single suitable emoji icon, and a list of relevant skill IDs for a new AI agent based on its described role. You must choose from the provided list of available skills.

    Available Skills:
    ${availableSkills}
    
    The output must be a valid JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Design a persona for an agent with this role: "${role}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        skillIDs: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["name", "icon", "skillIDs"]
                }
            }
        });
        
        const result = JSON.parse(response.text.trim());
        const validSkillIDs = result.skillIDs.filter((id: string) => skills.some(s => s.id === id));
        
        return { ...result, skillIDs: validSkillIDs };

    } catch (error) {
        console.error("Error suggesting agent persona:", error);
        throw new Error("Failed to get agent suggestions from AI.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog.jpg';
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from AI.");
    }
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return 'https://storage.googleapis.com/gweb-aip.appspot.com/experiments/mediapipe/cat_and_dog.jpg';
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("No image found in response.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image with AI.");
    }
};

export async function* generateVideoFromImage(
    prompt: string,
    imageBase64: string,
    mimeType: string,
    aspectRatio: '16:9' | '9:16'
): AsyncGenerator<{ status: 'processing' | 'completed' | 'error', progress: number, message: string, url?: string }> {
    if (!API_KEY) {
        yield { status: 'processing', progress: 25, message: 'Simulating video generation...' };
        await new Promise(resolve => setTimeout(resolve, 2000));
        yield { status: 'processing', progress: 75, message: 'Finalizing video...' };
        await new Promise(resolve => setTimeout(resolve, 2000));
        yield { status: 'completed', progress: 100, message: 'Simulation complete.', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' };
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        yield { status: 'processing', progress: 10, message: 'Sending request to Veo...' };

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes: imageBase64, mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        yield { status: 'processing', progress: 30, message: 'Veo is processing your video...' };
        
        let progress = 30;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            progress = Math.min(90, progress + 10);
            yield { status: 'processing', progress: progress, message: 'Generating frames...' };
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
             throw new Error("Video generation completed but no download link was found.");
        }
        
        const videoUrl = `${downloadLink}&key=${API_KEY}`;
        yield { status: 'completed', progress: 100, message: 'Video generated successfully!', url: videoUrl };

    } catch (error: any) {
        console.error("Error generating video:", error);
        let message = "An unexpected error occurred during video generation.";
        if (error.message && (error.message.includes("not found") || error.message.includes("API key not valid"))) {
            message = "API key is invalid or lacks permissions. Please select a valid key.";
        }
        yield { status: 'error', progress: 100, message, url: undefined };
    }
}

export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return "This is a mock analysis. The video appears to show a cat playing with a ball of yarn.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const videoPart = { inlineData: { mimeType, data: videoBase64 } };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [videoPart, { text: prompt }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        return "Failed to analyze video.";
    }
};

export const generateSeoIdeas = async (url: string, topic: string): Promise<{ keywords: string[]; blogOutline: { title: string; points: string[]; }; adCopy: string[]; }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            keywords: ['AI travel', 'automated trip planning', 'gemini travel'],
            blogOutline: { title: 'How AI is Revolutionizing Travel Planning', points: ['Introduction to AI in travel', 'Benefits of using AI planners', 'Top AI travel tools', 'Future of travel tech'] },
            adCopy: ['Plan your dream trip in seconds.', 'The future of travel is here.', 'Never stress about planning again.']
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a world-class SEO and marketing strategist. Based on the user's website URL and primary topic, generate a comprehensive SEO strategy. The output must be a valid JSON object.`;
    const prompt = `Generate an SEO strategy for a website at ${url} with the primary topic of "${topic}".`;

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
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        blogOutline: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                points: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["title", "points"]
                        },
                        adCopy: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["keywords", "blogOutline", "adCopy"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating SEO ideas:", error);
        throw new Error("Failed to generate SEO ideas from AI.");
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "This is a simulated summary of the provided text content.";
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following text:\n\n${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        return "Failed to summarize text.";
    }
};

export const analyzeDocumentAndVisualize = async (fileContent: string, prompt: string): Promise<any> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (prompt.includes('bar chart')) {
             return { type: 'bar', title: 'Simulated Financials', data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'Revenue', data: [120, 190, 150, 240], backgroundColor: ['#3B82F6'] }] } };
        }
        return { type: 'summary', title: 'Simulated Summary', data: 'This is a mock summary of the document provided.' };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a data analysis AI. Analyze the provided document content based on the user's prompt. Your output must be one of two types: 'summary' or a chart ('bar', 'pie').
    - If the user asks for a chart, respond with a JSON object for that chart, including a title, labels, and datasets.
    - If the user asks for a summary or general analysis, respond with a JSON object of type 'summary' with a title and the text content in the 'data' field.
    The response must be a single, valid JSON object that matches the specified schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Document Content:\n"""\n${fileContent}\n"""\n\nUser Prompt: "${prompt}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        data: {
                          oneOf: [
                            { type: Type.STRING },
                            {
                              type: Type.OBJECT,
                              properties: {
                                labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                                datasets: {
                                  type: Type.ARRAY,
                                  items: {
                                    type: Type.OBJECT,
                                    properties: {
                                      label: { type: Type.STRING },
                                      data: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                      backgroundColor: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                    },
                    required: ['type', 'title', 'data']
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error analyzing document:", error);
        throw new Error("AI analysis failed.");
    }
}

export const synthesizeMemory = async (prompt: string, existingEngrams: Engram[]): Promise<Omit<Engram, 'id' | 'timestamp'>> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            label: 'Synthesized Mock Insight',
            type: 'synthesized_insight',
            content: 'Based on existing memories, it appears the user enjoys both technology and cultural experiences, suggesting a future trip to Seoul.',
            color: '#EC4899', // Pink for synthesized
            potentiality: 0,
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const memoryContext = existingEngrams.map(e => `- ${e.label}: ${e.content}`).join('\n');

    const systemInstruction = `You are a Quantum Reasoning Engine within an an AI OS. Your task is to analyze a user's query and a set of existing memories (engrams).
    Synthesize a new, insightful memory that connects or expands upon the existing ones based on the query.
    The new memory should have a concise label, a summary content, and a color. Assign it the type 'synthesized_insight'.
    The output must be a valid JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `User Query: "${prompt}"\n\nExisting Memories:\n${memoryContext}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['synthesized_insight'] },
                        content: { type: Type.STRING },
                        color: { type: Type.STRING, description: "A hex color code, e.g., '#EC4899'" }
                    },
                    required: ["label", "type", "content", "color"]
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return { ...result, potentiality: 0 }; // Start in superposition
    } catch (error) {
        console.error("Error synthesizing memory:", error);
        throw new Error("Failed to synthesize new memory from AI.");
    }
};

export const generateProactiveSuggestion = async (actions: UserAction[]): Promise<{ title: string; suggestions: { text: string; actionAppId?: AppID, appProps?: Record<string, any> }[] }> => {
    if (!API_KEY || actions.length === 0) {
        return { title: "Suggestions", suggestions: [{text: "Open the Creator Studio to start a new project."}]};
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const context = `A user in an AI OS has performed these recent actions: ${actions.map(a => `Action: Opened app '${a.appId}' with details: ${JSON.stringify(a.details)}`).join(', ')}.`;

    const systemInstruction = `You are Echo, a proactive AI assistant. Based on the user's recent actions, provide a concise title and a list of 2-3 helpful, short, and relevant suggestions. For each suggestion, provide the text, an optional 'actionAppId' to open an app, and optional 'appProps' to pass data to that app.

    Example actionAppIds: 'chat', 'workflow', 'creatorStudio', 'marketing'.
    
    Example: If the user just created a project (e.g., details: {event: 'project_created', projectName: 'New Website'}), you could suggest 'Draft a marketing plan for New Website' with actionAppId 'marketing' and appProps { initialTopic: 'Marketing for New Website' }.
    If the user opens 'travelAgent', suggest 'Shall I find flight deals for you?' with actionAppId 'search'.

    The output must be a valid JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: context,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
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
                                    actionAppId: { type: Type.STRING },
                                    appProps: { type: Type.OBJECT, properties: {} }
                                }
                            }
                        }
                    },
                    required: ['title', 'suggestions']
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating proactive suggestion:", error);
        return { title: "Suggestions", suggestions: [{ text: "Keep exploring the OS to see what you can do!"}] };
    }
};

const osCommandFunctionDeclaration: FunctionDeclaration = {
  name: 'execute_os_command',
  parameters: {
    type: Type.OBJECT,
    description: 'Executes a command within the AI OS, like opening or closing an application.',
    properties: {
      action: { type: Type.STRING, description: 'The action to perform, either "open" or "close".' },
      target: { type: Type.STRING, description: 'The ID of the app to target (e.g., "chat", "settings") or "all" to close all windows.' },
    },
    required: ['action', 'target'],
  },
};

export const interpretVoiceCommand = async (prompt: string) => {
    if (!API_KEY) {
         if (prompt.toLowerCase().includes('open chat')) return { action: 'open', target: 'chat' };
         return null;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User command: "${prompt}"`,
            config: {
                tools: [{ functionDeclarations: [osCommandFunctionDeclaration] }],
            },
        });
        const functionCall = response.functionCalls?.[0];
        if (functionCall?.name === 'execute_os_command') {
            return functionCall.args as { action: 'open' | 'close', target: AppID | 'all' };
        }
        return null;
    } catch (error) {
        console.error("Error interpreting voice command:", error);
        return null;
    }
};

export const getFinancialNews = async (): Promise<{ title: string; source: string; url: string }[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [
            { title: 'AI Chipmakers Surge on New Announcements', source: 'Tech News', url: '#' },
            { title: 'Crypto Markets See Volatility Ahead of Regulations', source: 'Finance Today', url: '#' },
            { title: 'The Future of Decentralized Finance: A Deep Dive', source: 'Blockchain Weekly', url: '#' },
        ];
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "What are the top 3 trending news articles in finance and technology, especially related to AI, stocks, and crypto?",
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        // Since we can't guarantee JSON, we'll parse the text and use grounding for URLs
        const text = response.text;
        // Basic parsing - this is a simplification. A more robust solution might use another LLM call to structure the text.
        const newsItems = text.split('\n').filter(line => line.trim().length > 10).map((line, index) => {
            const match = line.match(/^(?:\d+\.\s*)?(.+?)(?:\s\((.+)\))?$/);
            return {
                title: match ? match[1] : line,
                source: match ? match[2] || (groundingChunks[index]?.web?.title || 'Web Source') : (groundingChunks[index]?.web?.title || 'Web Source'),
                url: groundingChunks[index]?.web?.uri || '#'
            };
        }).slice(0, 3);
        
        return newsItems;
    } catch (error) {
        console.error("Error getting financial news:", error);
        throw new Error("Failed to get financial news.");
    }
};

export const getFinancialAnalysis = async (ticker: string): Promise<{ summary: string; bullCase: string; bearCase: string; keyMetrics: { name: string; value: string }[], recentNews: string }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            summary: `This is a mock analysis for ${ticker}. It appears to be a leading company in its sector with strong growth potential but facing regulatory headwinds.`,
            bullCase: 'Strong market position and innovative product pipeline could lead to significant upside.',
            bearCase: 'Increased competition and potential for new regulations pose risks to future growth.',
            keyMetrics: [{ name: 'P/E Ratio', value: '25.5' }, { name: 'Market Cap', value: '$1.2T' }],
            recentNews: 'Announced a new AI-driven product line last week.'
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are "Atlas," a professional financial analyst AI. Provide a concise, unbiased, and data-driven analysis of the given stock or cryptocurrency ticker. Use Google Search to get the latest information. The response must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Provide a financial analysis for the ticker: ${ticker}.`,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}],
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
                    required: ["summary", "bullCase", "bearCase", "keyMetrics", "recentNews"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting financial analysis:", error);
        throw new Error("Failed to get financial analysis.");
    }
};

export const expandTopic = async (topic: string): Promise<{ mainIdea: string; subTopics: string[]; questions: string[]; }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            mainIdea: topic,
            subTopics: ['Key Concepts', 'Historical Context', 'Future Implications', 'Related Fields'],
            questions: ['What is the origin?', 'How does it work?', 'Who are the key figures?']
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a brainstorming assistant. Your goal is to expand a given topic into a structured mind map, providing a central main idea, several related sub-topics, and a few thought-provoking questions. The output must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a mind map structure for the topic: "${topic}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mainIdea: { type: Type.STRING },
                        subTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['mainIdea', 'subTopics', 'questions']
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error expanding topic:", error);
        throw new Error("Failed to expand topic.");
    }
};

export const getResearchSummary = async (topic: string): Promise<string> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `This is a mock summary about ${topic}. It provides key insights and context in a concise format.`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a concise research summary about the topic: "${topic}" using Google Search for up-to-date information.`,
            config: {
                tools: [{googleSearch: {}}]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting research summary:", error);
        throw new Error("Failed to get research summary.");
    }
};


// FIX: Added mock function for suggestDashboardLayout
export const suggestDashboardLayout = async (userDescription: string): Promise<DashboardLayout> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (userDescription.toLowerCase().includes('work')) return 'work';
        if (userDescription.toLowerCase().includes('developer')) return 'developer';
        return 'default';
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are an AI assistant specialized in user interface and dashboard design. Based on the user's description of their ideal dashboard, suggest one of the following layouts: 'default', 'work', or 'developer'. Prioritize 'work' for productivity-focused descriptions, 'developer' for technical/coding descriptions, and 'default' otherwise. Respond only with the suggested layout ID.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User describes their ideal dashboard: "${userDescription}"`,
            config: {
                systemInstruction,
                responseMimeType: "text/plain",
            }
        });
        const layout = response.text.trim().toLowerCase();
        if (['default', 'work', 'developer'].includes(layout)) {
            return layout as DashboardLayout;
        }
        return 'default';
    } catch (error) {
        console.error("Error suggesting dashboard layout:", error);
        return 'default';
    }
};

// FIX: Added mock function for createAdCopy
export const createAdCopy = async (productDescription: string, targetAudience: string): Promise<{headline: string, body: string, cta: string}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            headline: `Unlock Your Potential with AI: ${productDescription}`,
            body: `Designed for ${targetAudience}, this innovative solution leverages the power of AI to transform your workflow. Experience unparalleled efficiency and creativity.`,
            cta: 'Learn More & Get Started Today!'
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a highly creative and persuasive marketing AI specializing in digital advertising. Your task is to generate compelling ad copy (headline, body, call-to-action) for a given product/service and target audience. The output must be a valid JSON object.`;
    try {
        const prompt = `Generate ad copy for a product/service: "${productDescription}" targeting: "${targetAudience}".`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING },
                    },
                    required: ["headline", "body", "cta"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error creating ad copy:", error);
        throw new Error("Failed to generate ad copy.");
    }
};

// FIX: Added mock function for generateSocialMediaPost
export const generateSocialMediaPost = async (content: SharedContent): Promise<SocialPost> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        let defaultCaption = `Check out my latest creation: ${content.title}!`;
        if (content.type === 'travel_plan') defaultCaption = `My AI-powered trip to ${content.title} looks amazing!`;
        if (content.type === 'image') defaultCaption = `Just generated this cool image: ${content.title}!`;

        return {
            caption: defaultCaption,
            hashtags: ['#AI', '#AmrikyyOS', `#${content.type.charAt(0).toUpperCase() + content.type.slice(1)}Gen`]
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a social media manager AI. Given content details, craft an engaging social media post with a caption and relevant hashtags. Focus on making the content appealing for sharing. The output must be a valid JSON object.`;
    try {
        const prompt = `Create a social media post for this content:\nTitle: ${content.title}\nSubtitle: ${content.subtitle}\nType: ${content.type}\nCall to Action: ${content.cta}`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["caption", "hashtags"]
                }
            },
        });
        const result = JSON.parse(response.text.trim());
        // Ensure hashtags are always an array of strings
        if (!Array.isArray(result.hashtags)) {
            result.hashtags = [];
        }
        return result;
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post.");
    }
};

// FIX: Added mock function for testSystemPrompt
export const testSystemPrompt = async (systemInstruction: string, userPrompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `[Simulated AI Response] Under the instruction "${systemInstruction}", I would respond to "${userPrompt}" with: "This is a helpful answer related to your query."`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction: systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error("Error testing system prompt:", error);
        return `Failed to get response: ${error instanceof Error ? error.message : String(error)}`;
    }
};

// FIX: Added mock function for getAiWeatherReport
export const getAiWeatherReport = async (weatherData: WeatherData): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `[AI Weather Report] Today in ${weatherData.current.location}, expect ${weatherData.current.condition} with a high of ${weatherData.current.high}°C and a low of ${weatherData.current.low}°C. The next few days show varied conditions, with some ${weatherData.forecast[1].condition} on ${weatherData.forecast[1].day}. Stay prepared!`;
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are a helpful AI weather reporter. Given detailed weather data, provide a concise and informative summary of the current conditions and the 5-day forecast. Highlight any significant changes or warnings.`;
    try {
        const prompt = `Current weather: ${JSON.stringify(weatherData.current)}\n5-day forecast: ${JSON.stringify(weatherData.forecast)}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI weather report:", error);
        return "Failed to generate AI weather report.";
    }
};


// Enhanced: Added trending focus and Google Search grounding for fast food
export const findDeliveryOptions = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: FastFoodRestaurant[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockOptions: FastFoodRestaurant[] = [
            { name: 'Burger Bot', cuisine: 'Fast Food', rating: 4.2, deliveryTime: '20-30 min', priceLevel: '$$', isTrending: true, imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', address: '123 Main St', website: '#', reason: 'Currently trending and known for fast delivery.' },
            { name: 'Taco AI', cuisine: 'Mexican', rating: 4.5, deliveryTime: '25-35 min', priceLevel: '$', isTrending: true, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a04225?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', address: '456 Oak Ave', website: '#', reason: 'High user ratings and budget-friendly.' },
            { name: 'Noodle Nexus', cuisine: 'Asian', rating: 4.0, deliveryTime: '35-50 min', priceLevel: '$$', isTrending: false, imageUrl: 'https://images.unsplash.com/photo-1585238342084-2a13e5123d53?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', address: '789 Pine Ln', website: '#', reason: 'Known for authentic flavors.' },
        ];
        return {
            aiSummary: `Based on your craving for "${query}", I've found some highly-rated and trending fast food options nearby.`,
            options: mockOptions,
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are "NexusGo Delivery AI", a helpful assistant that finds trending fast food delivery options. Given a user's food craving and current location (latitude, longitude), provide an AI summary and a list of up to 3 relevant, trending fast food options. For each option, include its name, cuisine, rating, estimated delivery time, price level, a boolean indicating if it's trending, an image URL, address, website, and an AI-generated reason for its recommendation (e.g., "fastest delivery," "most popular this week," "best for late-night cravings"). Use Google Search and Maps for up-to-date restaurant information. The output must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find trending fast food delivery options for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}.`,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}, {googleMaps: {}}],
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
                                    priceLevel: { type: Type.STRING },
                                    isTrending: { type: Type.BOOLEAN },
                                    imageUrl: { type: Type.STRING },
                                    address: { type: Type.STRING },
                                    website: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                }
                            }
                        }
                    },
                    required: ["aiSummary", "options"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting delivery options:", error);
        throw new Error("Failed to get delivery options from AI.");
    }
};

// Enhanced: Added Google Maps grounding and more details for taxi
export const getRideOptions = async (destination: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, options: RideOption[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockOptions: RideOption[] = [
            { service: 'Standard Ride', estimatedCost: '$15-20', estimatedTime: '10 min', currency: '$', surgePricing: false, eta: '5 min', providerLogo: 'https://cdn-icons-png.flaticon.com/512/5977/5977579.png' },
            { service: 'Premium Ride', estimatedCost: '$25-35', estimatedTime: '8 min', currency: '$', surgePricing: false, eta: '3 min', providerLogo: 'https://cdn-icons-png.flaticon.com/512/5977/5977581.png' },
            { service: 'Economy Ride', estimatedCost: '$10-14', estimatedTime: '12 min', currency: '$', surgePricing: true, eta: '7 min', providerLogo: 'https://cdn-icons-png.flaticon.com/512/5977/5977579.png' },
        ];
        return {
            aiSummary: `I've found several ride options to "${destination}" from your current location.`,
            options: mockOptions,
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are "NexusGo Rides AI", a helpful assistant that finds ride-sharing options. Given a user's destination and current location (latitude, longitude), provide an AI summary and a list of up to 3 relevant ride options. For each option, include service name (e.g., "UberX", "Lyft Standard"), estimated cost, estimated time, currency, whether surge pricing is active, estimated time of arrival (ETA), and a mock provider logo URL. Use Google Maps for route, time, and distance estimation. The output must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find ride options to "${destination}" from latitude ${location.latitude}, longitude ${location.longitude}.`,
            config: {
                systemInstruction,
                tools: [{googleMaps: {}}],
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
                                }
                            }
                        }
                    },
                    required: ["aiSummary", "options"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting ride options:", error);
        throw new Error("Failed to get ride options from AI.");
    }
};

// New: Find Cleaning Services
export const findCleaningServices = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, services: CleaningService[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockServices: CleaningService[] = [
            { name: 'Sparkle AI Cleaners', type: 'Deep Clean', priceRange: '$100-200', rating: 4.8, availability: 'Tomorrow', contact: '555-0101', imageUrl: 'https://images.unsplash.com/photo-1581578731548-264b681f4222?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Highest rated for deep cleaning.' },
            { name: 'Eco-Glow Cleaning', type: 'Eco-Friendly Standard Clean', priceRange: '$70-150', rating: 4.5, availability: 'Same Week', contact: '555-0102', imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427fdce84?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Best value for eco-friendly options.' },
        ];
        return {
            aiSummary: `Here are some highly-rated cleaning services near you based on your request for "${query}".`,
            services: mockServices,
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are "Travel Services AI", a helpful assistant that finds local cleaning services. Given a user's query and location, provide an AI summary and a list of up to 3 relevant cleaning services. For each service, include its name, type of service (e.g., "Deep Clean", "Standard Clean", "Move-out Clean"), price range, rating, availability, contact information (e.g., phone or website), an image URL, and an AI-generated reason for its recommendation. Use Google Search and Maps for up-to-date information. The output must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find cleaning services for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}.`,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}, {googleMaps: {}}],
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
                                }
                            }
                        }
                    },
                    required: ["aiSummary", "services"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error finding cleaning services:", error);
        throw new Error("Failed to find cleaning services from AI.");
    }
};

// New: Find Nightlife Events
export const findNightlifeEvents = async (query: string, location: {latitude: number, longitude: number}): Promise<{aiSummary: string, events: NightlifeEvent[]}> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockEvents: NightlifeEvent[] = [
            { name: 'Quantum Beats Nightclub', type: 'Nightclub', description: 'Hottest new club with AI-generated music.', location: 'Downtown', date: 'Tonight', time: '10:00 PM', vipOptions: true, imageUrl: 'https://images.unsplash.com/photo-1514525253164-ff47466cd9f0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', reason: 'Trending for unique AI music experience with VIP tables available.' },
            { name: 'Neon Lights Bar', type: 'Bar/Lounge', description: 'Relaxed atmosphere with craft cocktails and a futuristic vibe.', location: 'Uptown', date: 'Tonight', time: '8:00 PM', ticketsUrl: '#', reason: 'Great reviews for cocktails and ambiance.' },
        ];
        return {
            aiSummary: `Here are some exciting nightlife options near you based on your request for "${query}".`,
            events: mockEvents,
        };
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = `You are "Travel Services AI", a helpful assistant that finds local nightlife and VIP events. Given a user's query and location, provide an AI summary and a list of up to 3 relevant nightlife events or venues. For each event, include its name, type (e.g., "Nightclub", "Bar", "Live Music", "VIP Event"), description, location (e.g., neighborhood), date, time, optional ticket URL, a boolean for VIP options, an image URL, and an AI-generated reason for its recommendation. Use Google Search and Maps for up-to-date event information. The output must be a valid JSON object.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find nightlife events including VIP options for "${query}" near latitude ${location.latitude}, longitude ${location.longitude}.`,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}, {googleMaps: {}}],
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
                                }
                            }
                        }
                    },
                    required: ["aiSummary", "events"]
                }
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error finding nightlife events:", error);
        throw new Error("Failed to find nightlife events from AI.");
    }
};