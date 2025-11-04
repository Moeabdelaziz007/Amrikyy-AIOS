import { GoogleGenerativeAI } from "@google/genai";

async function run() {
  try {
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("API key not found. Please set the VITE_API_KEY environment variable.");
      return;
    }

    // Correct way to initialize
    const genAI = new GoogleGenerativeAI(apiKey);

    // Correct way to get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = "Write a story about a magic backpack.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    console.error("Error running test:", error);
  }
}

run();
