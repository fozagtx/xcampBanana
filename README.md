<div align="center">
  <img src="public/nano.jpeg" alt="xcampBanana Logo" width="200" />
  <h1>xcampBanana</h1>
  <p><strong>Monetize your Content on Camp Network</strong></p>
</div>

---

## About

xcampBanana is a decentralized application that allows content creators to monetize their work on the Camp Network. Link your X (Twitter) account to discover your best-performing tweets and mint them as IpNFTs (Intellectual Property NFTs). Additionally, create and sell Nanabanapro Brandkit prompts.

## Features

- **X Account Integration** - Connect your Twitter/X account seamlessly
- **Tweet Analytics** - View your most popular tweets with engagement metrics
- **Mint Tweets as IpNFTs** - Convert your viral tweets into tradable digital assets
- **Brandkit Creation** - Design and sell Nanabanapro Brandkit JSON prompts
- **Monetization** - Set royalties and pricing for your digital content
- **Camp Network Powered** - Built on the Camp Network infrastructure

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Camp Network compatible wallet

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
npm run build
# or
bun run build
```

### Start Production Server

```bash
npm start
# or
bun start
```

## Usage

1. **Connect Wallet** - Click the Camp Modal button to connect your wallet
2. **Link X Account** - Navigate to the Twitter/X Dashboard and link your account
3. **Fetch Tweets** - Enter your X username to retrieve your tweets
4. **Mint as IpNFT** - Select tweets to mint as IpNFTs with custom royalties
5. **Create Brandkits** - Design and mint Nanabanapro Brandkit prompts

## Technology Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **Blockchain**: Camp Network Origin SDK
- **State Management**: TanStack React Query
- **Language**: TypeScript

## Project Structure

```
xcamp/
├── app/
│   ├── components/
│   │   ├── TweetDashboard.tsx    # Twitter integration
│   │   └── BrandkitMint.tsx      # Brandkit creation
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # Camp & Query providers
├── public/
│   └── nano.jpeg                 # Brand assets
└── next.config.ts                # Next.js configuration
```

## Configuration

The application uses the Camp Network Origin SDK. Configure your client ID in `app/providers.tsx`:

```typescript
<CampProvider clientId="your-client-id">
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Open an issue on GitHub
- Visit [Camp Network Documentation](https://docs.camp.network)

---

<div align="center">
  Built with ❤️ using Camp Network
</div>
