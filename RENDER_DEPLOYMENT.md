# Deploying the Backend to Render

This guide provides step-by-step instructions for deploying the backend of the Amrikyy AI OS to Render.

## Prerequisites

- A Render account.
- The project cloned to your local machine.

## Configuration

1.  **Project Setup:** In the Render dashboard, create a new "Web Service" and connect it to your Git repository.
2.  **Runtime:** Select the "Node" runtime.
3.  **Build Command:** Use the following build command: `npm install`
4.  **Start Command:** Use the following start command: `npm start`
5.  **Environment Variables:** Set the following environment variable in the Render project settings:
    - `API_KEY`: Your Google Gemini API key.

## Deployment

Once the project is configured, Render will automatically deploy the backend every time you push a change to the main branch.
