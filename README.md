# Amrikyy AI OS

<div align="center">

**The World's First AI-Native Operating System for Intelligence & Creativity**

*Powered by Google Gemini*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646cff.svg)](https://vitejs.dev/)

[English](README.md) | [العربية](README.ar.md)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🌟 Overview

Amrikyy AI OS is a revolutionary web-based, simulated operating system designed to explore the future of human-computer interaction. It features a complete desktop experience, a sophisticated multi-agent AI system, real-time collaboration capabilities, and a comprehensive suite of creative and productivity tools—all orchestrated by Google's cutting-edge Gemini models.

This project represents a forward-looking concept that demonstrates how artificial intelligence can be deeply integrated into every layer of an operating system to create a truly proactive, personalized, and intelligent computing environment.

### 🎯 Key Highlights

- **100% Web-Based**: No installation required - runs entirely in your browser
- **AI-First Design**: Every feature is enhanced with Google Gemini AI
- **Multi-Agent System**: Specialized AI agents work together seamlessly
- **Real-Time Collaboration**: Work together with your team in real-time
- **Extensible Platform**: Create and deploy custom AI agents
- **Modern UI/UX**: Beautiful, responsive desktop environment with animated backgrounds

---

## ✨ Core Features

### 🤖 AI Agent Ecosystem

The heart of Amrikyy AI OS is its sophisticated multi-agent architecture:

- **Multi-Agent System**
  - Specialized AI agents (Luna for travel, Marketing HQ team, Atlas for finance, etc.)
  - Agents collaborate, share knowledge, and delegate tasks autonomously
  - Each agent has unique skills and personality traits
  
- **Agent Forge & Avatar Studio**
  - Create custom AI agents with personalized personas
  - Equip agents with specific skills from the Skill Forge
  - Design unique visual avatars and voice profiles
  - Deploy agents to the community marketplace
  
- **Shared Knowledge Bus (Chrono Vault)**
  - Central "Quantum Reasoning Engine" stores collective agent learnings
  - System becomes progressively smarter and more context-aware
  - Cross-agent memory and knowledge sharing

### 🎨 Creative Suite

Professional-grade creative tools powered by state-of-the-art AI models:

- **Image Generation & Editing**
  - Text-to-image generation using Imagen 4 (`imagen-4.0-generate-001`)
  - Advanced editing capabilities with AI assistance
  - Multiple style presets and customization options
  
- **Veo Video Studio**
  - Generate high-quality videos from text or image prompts
  - Powered by Google's Veo model
  - Built-in AI "Prompt Enhancer" for optimal results
  - Support for various video formats and durations
  
- **Audio Studio**
  - Text-to-speech with premium voice models
  - Wide variety of languages, accents, and voice styles
  - Fine-tuned control over speech parameters
  
- **Cognitive Canvas**
  - Upload and analyze documents (PDF, text, images)
  - AI-powered content summarization
  - Automatic visual chart generation
  - Interactive data visualization

### 🚀 Productivity & Workflow

Streamline your work with intelligent productivity tools:

- **Creator Studio**
  - Comprehensive project management system
  - Task tracking and organization
  - Real-time synchronization with dashboards
  - AI-powered task suggestions and prioritization
  
- **Workflow Studio**
  - Visual workflow designer with drag-and-drop interface
  - Multi-agent automation capabilities
  - "Smart Execute" engine powered by Gemini
  - Pre-built workflow templates
  
- **Collaborative Workspace**
  - Real-time collaborative note editing
  - Shared whiteboard for visual brainstorming
  - Integrated media playback (music, YouTube)
  - Voice and video communication support
  
- **Smart Watch**
  - World clock with multiple timezone support
  - Pomodoro-style focus timer
  - Activity tracking and productivity insights
  - Customizable notifications and reminders

### 🛠️ Developer & Power-User Tools

Advanced tools for developers and power users:

- **Developer Console**
  - API key management interface
  - Service configuration and monitoring
  - Real-time logs and debugging tools
  
- **API Reference**
  - Comprehensive in-app API documentation
  - Interactive examples and code snippets
  - Version tracking and changelog
  
- **Developer Toolkit**
  - Playground for testing AI prompts
  - `systemInstruction` fine-tuning interface
  - Response testing and comparison tools
  
- **Prompt Weaver**
  - Visual prompt chaining tool
  - Create sophisticated multi-step AI workflows
  - Template library for common patterns
  
- **Resource Hub**
  - Curated library of open-source tools
  - AI/ML frameworks and libraries
  - Design resources and assets
  - Community contributions and tutorials

### 🌐 Social & Economic Hub

Connect, share, and monetize within the ecosystem:

- **Gemini Store**
  - Discover community-created AI agents
  - One-click installation and configuration
  - User reviews and ratings
  - Featured and trending agents
  
- **The Agora Marketplace**
  - Peer-to-peer marketplace for AI agents and workflows
  - Transaction system using AI Credits
  - Seller dashboard and analytics
  - Buyer protection and quality guarantees
  
- **Nexus Live Chat**
  - System-wide real-time chat
  - Public channels and private messaging
  - Rich media support (images, files, links)
  - AI-moderated community guidelines

### 📈 Growth & Monetization

Engage users and creators through gamification:

- **Growth Hub (Creator Rewards)**
  - Gamified bounty system
  - Earn AI Credits for contributions
  - Achievement badges and leaderboards
  - Creator tiers and exclusive perks
  
- **Creator Spotlight**
  - Viral feed showcasing community content
  - AI-assisted content creation
  - Automated social media post generation
  - Hashtag suggestions and trend analysis
  
- **Subscription & Billing**
  - Flexible subscription tiers
  - AI Credit balance management
  - Multiple payment method support
  - Usage analytics and cost optimization

### 💻 Core OS Features

Foundation features that power the entire system:

- **Modern Desktop UI**
  - Beautiful, responsive interface
  - Dynamic, theme-aware animated backgrounds
  - Customizable window management
  - Dark/light mode support
  
- **Customizable Dashboards**
  - AI-powered layout suggestions
  - Pre-built dashboard presets (Default, Work, Developer)
  - Widget-based customization
  - Drag-and-drop interface builder
  
- **System-Wide Voice Control**
  - Natural language command interface
  - Voice-activated app launching
  - Hands-free navigation
  - Multi-language support
  
- **Smart Notification Center**
  - Unified notification hub
  - Priority-based notification sorting
  - "Do Not Disturb" and focus modes
  - Custom notification rules and filters

---

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
