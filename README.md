<div align="center">
  <img src="public/nano.jpeg" alt="xcampBanana Logo" width="400" />
  <h1>xcampBanana</h1>
  <p><strong>Monetize your Content on Camp Network</strong></p>
</div>

---

## About

Decentralized app for content creators to monetize work on Camp Network. Create and sell Nanabanapro Brandkit prompts.

## Architecture

```mermaid
graph TB
    A[User Wallet] --> B[xcampBanana dApp]
    B --> C[Camp Network SDK]

    B --> D[Brandkit Creator]
    D --> E[Mint Brandkit]

    E --> C
    C --> F[Camp Network Blockchain]

    style B fill:#f9f,stroke:#333,stroke-width:4px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

1. **OpenAI API Key** (Required)
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add to `.env.local`: `OPENAI_API_KEY=sk-your-key-here`
   - Used for AI brand kit generation and chatbot features

2. **Brave Search API** (Optional)
   - Get your API key from [Brave Search API](https://brave.com/search/api/)
   - Add to `.env.local`: `BRAVE_SEARCH_API_KEY=your-key-here`
   - Used for web search functionality in brand case studies

## Features

- Brandkit Creation & Sales
- PDF Export & Upload
- Custom Royalties
- AI Assistant
- Camp Network Powered

## Tech Stack

- Next.js 15
- Tailwind CSS 4
- Camp Network Origin SDK
- TanStack React Query
- TypeScript

## Project Structure

```
xcamp/
├── app/
│   ├── components/
│   │   └── BrandkitMint.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
└── public/
    └── nano.jpeg
```

## Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant A as xcampBanana
    participant C as Camp Network

    U->>W: Connect Wallet
    W->>A: Authenticated
    U->>A: Create Brandkit
    A->>U: Display Preview
    U->>A: Export PDF / Mint
    A->>C: Mint Brandkit
    C->>A: NFT Created
    A->>U: Success + NFT Details
```
---

<div align="center">
  Built with ❤️ using Camp Network
</div>
