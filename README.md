# Production AI Platform — Frontend

Production React and TypeScript frontend for the **Production AI Platform**, an end-to-end Retrieval-Augmented Generation (RAG) application.

The interface connects to the FastAPI RAG backend and provides conversational question answering, isolated chat sessions, source attribution, groundedness indicators, response states, Cloudflare Turnstile verification, and persistent recent-chat history.

---

## Live Application

**Frontend**

https://www.buildwithsufyan.com

**Backend API**

https://api.buildwithsufyan.com

**Frontend Repository**

https://github.com/SUFI-410/Production-AI-Platform-Frontend

**Backend Repository**

https://github.com/SUFI-410/Production-AI-Platform

---

## Project Status

The frontend is deployed and connected to the production RAG backend.

Current functionality includes:

* conversational RAG interface
* isolated backend conversation sessions
* recent chat history
* reopening previous conversations
* deleting saved conversations
* automatic conversation titles
* per-tab active conversation persistence
* Grounded / Not Grounded status
* supporting source display
* Cross-Encoder relevance display
* Markdown answer rendering
* syntax highlighting
* Cloudflare Turnstile verification
* structured production error handling
* backend health status
* responsive application layout

---

## Features

### Conversational Interface

* Send natural-language questions to the RAG backend
* Display user and assistant messages
* Multi-turn conversation support
* Context-aware follow-up questions
* Loading and generation states
* Failed-request states
* Keyboard-based message submission

### Conversation Sessions

The frontend works with the backend's isolated conversation-session system.

When a new conversation starts:

1. The frontend sends the first request without an existing session ID.
2. The backend generates a unique session ID.
3. The frontend stores that session ID.
4. Subsequent messages for the conversation reuse the same ID.

This allows each chat to maintain its own backend conversation history without sharing memory with unrelated sessions.

---

## Recent Chats

The application includes recent conversation management.

Supported behavior includes:

* create a new chat
* automatically title conversations
* save recent conversations
* reopen previous chats
* delete conversations
* keep a bounded recent-chat list
* preserve the active conversation across page refreshes
* isolate the active conversation between browser tabs

Recent conversation data is maintained client-side while the backend session ID preserves server-side conversational context.

---

## Grounded Answers

Assistant responses display whether the backend considers the response grounded in retrieved knowledge-base documents.

Possible states include:

```text
Grounded
```

and:

```text
Not Grounded
```

Unsupported questions can return a refusal without displaying misleading supporting sources.

---

## Sources and Relevance

When supporting documents are returned, the frontend displays the source document information supplied by the backend.

Example:

```text
Sources

1. python_oop.md
   Relevance 0.15
```

The relevance value is a **Cross-Encoder document relevance score**.

It is not displayed as an answer-confidence percentage.

---

## Markdown Rendering

Assistant responses support Markdown rendering using React Markdown.

The interface supports content such as:

* headings
* paragraphs
* lists
* inline code
* code blocks
* formatted technical answers

Code blocks use syntax highlighting through Highlight.js and `rehype-highlight`.

---

## Cloudflare Turnstile

The production chat flow integrates Cloudflare Turnstile.

Before a chat request is processed:

1. The frontend obtains a Turnstile token.
2. The token is included in the `/chat` request.
3. The backend verifies the token.
4. Only verified requests proceed into the RAG application.

The frontend uses a **Turnstile site key**, which is a public client-side value.

The Turnstile **secret key is never stored in this frontend repository**.

---

## Error Handling

The frontend converts backend and network failures into user-friendly application messages.

Handled scenarios include:

* request timeouts
* network failures
* verification failures
* rate limiting
* validation errors
* internal server errors
* bad gateway responses
* unavailable backend services
* gateway timeouts

This prevents raw Axios or backend implementation errors from being shown directly to users.

---

## Backend Health

The application checks the backend health endpoint and displays the service status in the interface.

Production backend:

```text
https://api.buildwithsufyan.com
```

Health endpoint:

```text
https://api.buildwithsufyan.com/health
```

---

## Technology Stack

### Core

* React 19
* React DOM 19
* TypeScript 6
* Vite 8

### Styling and UI

* Tailwind CSS 4
* `@tailwindcss/vite`
* Geist Variable Font
* Lucide React
* Base UI
* Class Variance Authority
* `clsx`
* `tailwind-merge`
* `tw-animate-css`

### State and Data

* Zustand
* TanStack React Query
* Axios

### Routing

* React Router

### Content Rendering

* React Markdown
* `rehype-highlight`
* Highlight.js

### Tooling

* ESLint
* TypeScript ESLint
* Vite React plugin

---

## Application Structure

The frontend follows a component-oriented structure.

```text
Production-AI-Platform-Frontend/
|
├── .github/
│   └── workflows/
│
├── public/
│
├── src/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── chat.ts
│   │   │   └── types.ts
│   │   └── client.ts
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── MessageList.tsx
│   │   │
│   │   └── layout/
│   │       ├── AppLayout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── pages/
│   │   └── chat/
│   │       └── ChatPage.tsx
│   │
│   ├── store/
│   ├── styles/
│   │   └── globals.css
│   ├── utils/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── .gitattributes
├── .gitignore
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Frontend Request Flow

A typical message follows this path:

```text
User
  |
  v
Chat Interface
  |
  v
Cloudflare Turnstile
  |
  v
Frontend API Client
  |
  v
POST /chat
  |
  v
FastAPI RAG Backend
  |
  v
Answer + Sources + Session Metadata
  |
  v
Frontend State
  |
  v
Rendered Chat Message
```

The frontend request can include:

```text
question
turnstile_token
session_id
use_cache
```

The backend response includes application information such as:

```text
answer
sources
session_id
cached
grounded
latency_ms
```

---

## Requirements

You need:

* Git
* Node.js
* npm
* access to a running Production AI Platform backend

For local development, the backend normally runs at:

```text
http://localhost:8000
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SUFI-410/Production-AI-Platform-Frontend.git
cd Production-AI-Platform-Frontend
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Create the Environment File

Copy `.env.example` to `.env`.

#### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

#### Linux / macOS

```bash
cp .env.example .env
```

---

## Environment Variables

The repository contains the following safe template:

```env
VITE_API_URL=http://localhost:8000
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

### `VITE_API_URL`

Base URL of the FastAPI backend.

Local example:

```env
VITE_API_URL=http://localhost:8000
```

Production uses:

```text
https://api.buildwithsufyan.com
```

### `VITE_TURNSTILE_SITE_KEY`

Cloudflare Turnstile public site key used by the browser.

Example:

```env
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

The Turnstile site key is a public browser-side value.

The private Turnstile secret belongs only on the backend and must never be added to this repository.

---

## Environment Security

The repository tracks:

```text
.env.example
```

but excludes real local environment files such as:

```text
.env
.env.*
```

The `.gitignore` also excludes generated and local files including:

* `node_modules/`
* `dist/`
* test output
* coverage output
* logs
* Vite caches
* editor state
* deployment-platform state
* temporary files

Do not commit production environment values or secrets.

---

## Start Development Server

```bash
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

---

## Production Build

Create an optimized production build with:

```bash
npm run build
```

The build script runs:

```text
tsc -b && vite build
```

This performs TypeScript compilation before Vite creates the production bundle.

Generated output is written to:

```text
dist/
```

The `dist/` directory is excluded from Git.

---

## Linting

Run ESLint with:

```bash
npm run lint
```

The configured command is:

```text
eslint .
```

---

## Preview Production Build

After building:

```bash
npm run preview
```

This starts Vite's local production-build preview server.

---

## Available Commands

| Command           | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Start the Vite development server                          |
| `npm run build`   | Run TypeScript compilation and create the production build |
| `npm run lint`    | Run ESLint across the project                              |
| `npm run preview` | Preview the generated production build locally             |

---

## Backend Integration

The frontend communicates with the FastAPI backend maintained in:

https://github.com/SUFI-410/Production-AI-Platform

Production API:

```text
https://api.buildwithsufyan.com
```

The backend provides:

* RAG retrieval
* BM25 and vector search
* Reciprocal Rank Fusion
* adaptive retrieval
* query rewriting
* multi-query retrieval
* context compression
* Cross-Encoder reranking
* source attribution
* conversation memory
* isolated sessions
* response caching
* groundedness/refusal semantics
* Turnstile verification
* rate limiting

The frontend intentionally keeps retrieval and model logic on the backend.

---

## Client-Side Persistence

The application uses browser storage for frontend conversation persistence.

The active conversation is kept separately from the list of recent conversations so that:

* page refreshes can restore the current chat
* recent chats can be reopened
* separate browser tabs can maintain independent active conversations

The backend remains responsible for server-side conversation memory associated with each session ID.

---

## Production Application

Production frontend:

```text
https://www.buildwithsufyan.com
```

Production backend:

```text
https://api.buildwithsufyan.com
```

The browser communicates with the production FastAPI API over HTTPS.

Cloudflare Turnstile is used in the public request flow before expensive backend RAG processing occurs.

---

## Validation

Before merging frontend changes into the production branch, run:

```bash
npm run build
```

and:

```bash
npm run lint
```

Both commands should complete successfully.

You can also verify repository whitespace with:

```bash
git diff --check
```

---

## Branch Strategy

The repository uses two primary branches:

### `develop`

Used for active development and validation.

### `main`

Used for stable production-ready changes.

Typical flow:

```text
develop
   |
   v
build + lint
   |
   v
main
   |
   v
production
```

Changes should be validated before being merged from `develop` into `main`.

---

## Repository Hygiene

The repository is configured to prevent common generated and private files from being committed.

Ignored content includes:

* local environment files
* dependencies
* production build output
* coverage output
* test artifacts
* application logs
* Vite caches
* IDE-specific files
* temporary files
* deployment-platform state

Only safe configuration templates such as `.env.example` should be committed.

---

## Related Repository

### Backend

https://github.com/SUFI-410/Production-AI-Platform

The backend repository contains the FastAPI application, RAG pipeline, session management, caching, retrieval system, automated tests, Docker configuration, and production infrastructure documentation.

---

## Design Goals

The frontend was built to provide a usable production interface for the RAG backend rather than a minimal API demo.

Primary goals include:

* clear conversational interaction
* backend session integration
* reliable state handling
* source transparency
* groundedness visibility
* readable technical answers
* secure public request flow
* user-friendly production errors
* recent conversation management
* maintainable frontend structure
* reproducible local development
* production deployment readiness

---

## License

Refer to the repository's license information and the related backend project for licensing details.
