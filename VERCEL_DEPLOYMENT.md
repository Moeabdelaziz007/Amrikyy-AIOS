# Deploying the Frontend to Vercel

This guide provides step-by-step instructions for deploying the frontend of the Amrikyy AI OS to Vercel.

## Prerequisites

- A Vercel account.
- The project cloned to your local machine.

## Configuration

1.  **Project Setup:** In the Vercel dashboard, create a new project and connect it to your Git repository.
2.  **Build Command:** Use the following build command: `npm run build`
3.  **Output Directory:** The output directory should be set to `dist`.
4.  **Environment Variables:** Set the following environment variable in the Vercel project settings:
    - `VITE_API_KEY`: Your Google Gemini API key.

## Deployment

Once the project is configured, Vercel will automatically deploy the frontend every time you push a change to the main branch.
