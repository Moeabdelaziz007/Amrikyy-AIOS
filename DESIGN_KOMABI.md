Komabi Unified Experience — Design Notes

Overview
--------
Komabi aims to consolidate 50+ micro-apps into 10–15 focused Hubs. Each Hub is a micro-universe with Sub Agents and a unified UX pattern.

Hubs
----
1. Creative Hub
2. DevLab
3. Travel Intelligence
4. Business Suite
5. Cognition Hub
6. Conversational Core
7. Insight Lab
8. System Center
9. Nexus Portal
10. Gemini Connect

Design Principles
-----------------
- Each Hub has HubShell (title + local search + quick actions + Sub Agent cards)
- Lazy-load Hub content
- Single Theme: Komabi (dark, neon accents)
- Motion: subtle pulses & glassy frosts

File structure
--------------
components/
  hubs/
    NexusPortal.tsx
    HubShell.tsx
    hubs/
      CreativeHub.tsx
      DevLabHub.tsx
      TravelHub.tsx
      BusinessHub.tsx
      CognitionHub.tsx
      ConversationHub.tsx
      InsightHub.tsx
      SystemHub.tsx
      IntegrationsHub.tsx

Styling
-------
- Tailwind base with custom theme variables
- komabi-theme.css contains base variables for non-Tailwind utilities

Next steps
----------
1. Wire Nexus Portal into App (App.tsx) as primary route
2. Scaffold per-Hub components (simple placeholders)
3. Lazy-load each Hub and add prefetch for AI endpoints
4. Create a small demo flow: Nexus -> Travel Intelligence -> Plan Trip


