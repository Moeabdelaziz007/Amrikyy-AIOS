# Amrikyy AI OS

**The World's First AI-Native Operating System for Intelligence & Creativity, Powered by Google Gemini.**

Amrikyy AI OS is a web-based, simulated operating system designed to explore the future of human-computer interaction. It features a complete desktop experience, a multi-agent AI system, real-time collaboration, and a suite of powerful creative and productivity tools, all orchestrated by Google's Gemini models.

This project is a forward-looking concept that visualizes how AI can be deeply integrated into every layer of an operating system to create a proactive, personalized, and intelligent computing environment.

## Core Features

### 🤖 AI Agent Ecosystem
- **Multi-Agent System:** A team of specialized AI agents (like Luna for travel, and a full Marketing HQ) work together, sharing knowledge and delegating tasks.
- **Agent Forge & Avatar Studio:** Create and deploy your own custom AI agents. Define their persona, equip them with skills, and even give them a unique voice and visual avatar.
- **Shared Knowledge Bus:** Agents contribute learnings to a central "Quantum Reasoning Engine" (Chrono Vault), making the entire system smarter and more context-aware over time.

### 🎨 Creative Suite
- **Image Generation & Editing:** Create and edit stunning images with text prompts, powered by `imagen-4.0-generate-001`.
- **Veo Video Studio:** Generate high-quality videos from text or image prompts using Google's Veo model, complete with an AI-powered "Prompt Enhancer".
- **Audio Studio:** A dedicated hub for text-to-speech generation with a wide variety of high-quality voices and accents.
- **Cognitive Canvas:** Upload documents (PDFs, text) and use AI to analyze the content and generate visual charts or summaries on demand.

### 🚀 Productivity & Workflow
- **Creator Studio & Dynamic Dashboards:** Manage your projects and tasks. The "Work" dashboard provides a real-time, dynamic view of your projects, syncing instantly with the Creator Studio.
- **Workflow Studio:** Visually design complex, multi-agent automation workflows and execute them with a "Smart Execute" engine powered by Gemini.
- **Collaborative Workspace:** A real-time hub for teams to edit notes, draw on a whiteboard, and listen to music or watch YouTube together.
- **Smart Watch:** A multi-function productivity tool featuring a world clock and a Pomodoro-style focus timer.

### 🛠️ Developer & Power-User Tools
- **Developer Console & API Reference:** A simulated developer console to manage API keys and a professional, in-app guide to the OS's public API.
- **Developer Toolkit & Prompt Weaver:** A playground to test and fine-tune AI `systemInstruction` prompts, and a visual tool to chain prompts together for sophisticated text-generation workflows.
- **Resource Hub:** A curated library of open-source tools, AI/ML frameworks, and design resources.

### 🌐 Social & Economic Hub
- **Gemini Store & The Agora Marketplace:** Discover and install community-created AI agents from a central store, or buy and sell agents and workflows on a peer-to-peer marketplace using "AI Credits".
- **Nexus Live Chat:** A system-wide, real-time chat room to communicate with other (simulated) users of the OS.

### 📈 Growth & Monetization
- **Growth Hub (Creator Rewards):** A gamified rewards program where users earn AI Credits for completing "bounties" like sharing their creations.
- **Creator Spotlight & AI-Assisted Sharing:** A "viral feed" widget showcases community content. When sharing, AI helps you draft the perfect social media post with catchy captions and hashtags.
- **Subscription & Billing:** A clear, integrated system for managing subscription tiers, AI Credit balance, and payment methods.

### 核心 OS Features
- **Modern Desktop UI:** A beautiful, responsive desktop environment with dynamic, theme-aware animated backgrounds.
- **Customizable Dashboards:** Choose from AI-powered dashboard presets like 'Default', 'Work', or 'Developer', or ask the AI to suggest one for you.
- **System-Wide Voice Control:** Navigate the OS, open apps, and perform actions using natural language voice commands.
- **Smart Notification Center:** A central hub for all system, app, and agent notifications, complete with a "Do Not Disturb" mode.

## Tech Stack

- **Frontend:** React 19, TypeScript
- **AI Engine:** Google Gemini API (`@google/genai`), including Gemini Pro, Gemini Flash, Imagen 4, and Veo models.
- **Styling:** Tailwind CSS (via CDN for this playground environment)
- **State Management:** React Hooks (useState, useContext, etc.)

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set up your environment variables:**
    - Create a `.env` file in the root of the project.
    - Add your Google Gemini API key:
      ```
      API_KEY=your_google_ai_api_key_here
      ```
4.  **Run the development server:** `npm run dev`
5.  Open your browser to the local server address provided.
