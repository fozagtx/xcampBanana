<div align="center">
  <img src="public/nano.jpeg" alt="xcampBanana Logo" width="400" />
  <h1>xcampBanana</h1>
  <p><strong>Monetize your Content on Camp Network</strong></p>
</div>

---

## About

Decentralized app for content creators to monetize work on Camp Network. Link X account, mint tweets as IpNFTs, and sell Nanabanapro Brandkit prompts.

## Architecture

```mermaid
graph TB
    A[User Wallet] --> B[xcampBanana dApp]
    B --> C[Camp Network SDK]
    B --> D[X/Twitter API]

    D --> E[Fetch Tweets]
    E --> F[Tweet Analytics]
    F --> G[Mint as IpNFT]

    B --> H[Brandkit Creator]
    H --> I[Mint Brandkit]

    G --> C
    I --> C
    C --> J[Camp Network Blockchain]

    style B fill:#f9f,stroke:#333,stroke-width:4px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
```

## Quick Start

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build
```

## Features

- X Account Integration
- Tweet Analytics
- Mint Tweets as IpNFTs
- Brandkit Creation & Sales
- Custom Royalties
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
│   │   ├── TweetDashboard.tsx
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
    participant X as X/Twitter
    participant C as Camp Network

    U->>W: Connect Wallet
    W->>A: Authenticated
    U->>A: Link X Account
    A->>X: Authorize
    X->>A: Return Tweets
    A->>U: Display Analytics
    U->>A: Select Tweet to Mint
    A->>C: Mint IpNFT
    C->>A: NFT Created
    A->>U: Success + NFT Details
```
---

<div align="center">
  Built with ❤️ using Camp Network
</div>
