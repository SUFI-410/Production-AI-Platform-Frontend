# Production AI Platform — Frontend

React and TypeScript frontend for the Production AI Platform, a production-oriented Retrieval-Augmented Generation (RAG) application.

## Features

- Conversational RAG interface
- Groundedness indicators
- Numbered source citations
- Source relevance scores
- Conversation session support
- Response caching
- Loading and error states
- Markdown rendering and syntax highlighting
- Responsive user interface

## Technology stack

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Zustand
- Axios
- React Router
- React Markdown
- Lucide React

## Requirements

- Node.js
- npm
- Production AI Platform backend

## Getting started from a fresh clone

These instructions are for developers cloning the repository on a new computer.

### 1. Clone the repository

```bash
git clone https://github.com/SUFI-410/Production-AI-Platform-Frontend.git
cd Production-AI-Platform-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Environment variables

| Variable | Description | Local value |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

Production environment variables should be configured through the hosting platform and must not be committed to Git.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Backend

The FastAPI backend is maintained in a separate repository:

[Production AI Platform backend](https://github.com/SUFI-410/Production-AI-Platform)

Production API:

```text
https://api.buildwithsufyan.com
```

## Branch strategy

- `main` contains stable releases.
- `develop` contains active development.
- Feature branches should normally be created from `develop`.
