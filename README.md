# P5Canvas

P5Canvas is a web application that allows children to generate simple p5.js games (like Breakout) using natural language prompts. It leverages OpenRouter (LLM) to generate game configurations and visualizes them instantly using Sandpack.

Built with **Hono**, **React**, **Vite**, and **Tailwind CSS**, deployed on **Cloudflare Workers**.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm**
- **Cloudflare Account** (for deployment)
- **OpenRouter API Key** (for AI generation)

## Getting Started

### 1. Installation

Clone the repository and install dependencies. This will install dependencies for both the Hono backend and the React client.

```bash
npm install
```

### 2. Environment Setup

You need an OpenRouter API Key to create games.

**For Local Development:**
Create a `.dev.vars` file in the root directory:

```bash
# .dev.vars
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Run Locally

Start the development server. This command builds the React client and starts the Hono worker in development mode.

```bash
npm run dev
```

- Access the application at `http://localhost:8787`.

**Note:** For live frontend editing with Hot Module Replacement (HMR), you can run the client separately in another terminal:
`cd client && npm run dev`

## running Tests

This project uses **Vitest** for testing both backend and frontend.

```bash
# Run all tests
npm test

# Run frontend tests only
cd client && npm test
```

## Deployment

P5Canvas is designed to be deployed to Cloudflare Workers.

1.  **Login to Cloudflare**:

    ```bash
    npx wrangler login
    ```

2.  **Deploy**:
    This script builds the frontend and deploys the worker with the static assets.

    ```bash
    npm run deploy
    ```

3.  **Set Secrets**:
    Don't forget to set your API key in the deployed worker environment.
    ```bash
    npx wrangler secret put OPENROUTER_API_KEY
    ```

## Development

- **Linting & Formatting**: This project uses **Biome**.
  ```bash
  npx biome check .         # Check for errors
  npx biome check --write . # Fix errors and format
  ```

## Project Structure

- `src/`: Hono backend (Cloudflare Worker)
  - `index.tsx`: API endpoints and static asset serving
- `client/`: React frontend (Vite)
  - `src/components/`: UI Components (`PromptInput`, `GameView`)
  - `src/templates/`: p5.js game logic templates
