# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (get from https://platform.openai.com/)
- Brave Search API key (get from https://api.search.brave.com/)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env.local` file has been created with placeholders. Add your API keys:

```env
# OpenAI API Key (Required for AI Brand Planner)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Brave Search API Key (Required for web search functionality)
BRAVE_SEARCH_API_KEY=your-brave-search-api-key-here

# Camp Network Client ID (Already configured)
NEXT_PUBLIC_CAMP_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
```

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4. Build for Production
```bash
npm run build
npm start
```

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env.local`

**Note:** OpenAI API usage is pay-as-you-go. Make sure to set up billing.

### Brave Search API Key
1. Go to https://api.search.brave.com/
2. Sign up for an account
3. Subscribe to a plan (has free tier)
4. Get your API key from the dashboard
5. Copy and paste into `.env.local`

## Features Overview

### 📊 Top Performing Tweets
- Add your best tweets with metrics
- Track likes, retweets, replies, impressions
- Calculate engagement rates
- Export to professional PDF

### 🤖 AI Brand Planner
- Generate brand case studies
- Create AI image prompts (JSON format)
- Analyze tweet virality
- Research trends with web search
- Export conversations to PDF

## Usage Examples

### Adding a Tweet
1. Connect your wallet
2. Go to Dashboard
3. Click "Top Performing Tweets" tab
4. Click "Add Tweet"
5. Fill in the tweet text and metrics
6. Click "Add Tweet"

### Using AI Brand Planner
1. Go to Dashboard
2. Click "AI Brand Planner" tab
3. Try these prompts:
   - "Generate a case study about tech influencer growth"
   - "Create an image prompt for a modern tech brand logo"
   - "Analyze this tweet: [your tweet text]"
   - "Search for viral marketing trends in 2024"

### Exporting to PDF
- **Tweets:** Click "Export to PDF" button in Top Performing Tweets tab
- **Conversations:** Click "Export PDF" button in AI Brand Planner header

## Troubleshooting

### Build Errors
If you encounter build errors, try:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### API Key Not Working
- Verify the key is correct in `.env.local`
- Restart the development server after adding keys
- Check your API quota/billing

### Chat Not Responding
- Check OpenAI API key is valid
- Check you have credits/billing set up
- Check browser console for errors

### Search Not Working
- Check Brave Search API key is valid
- Verify you haven't exceeded rate limits
- Check API subscription status

## Architecture

### Frontend
- Next.js 15 (App Router)
- React 18
- Tailwind CSS 4
- Shadcn UI components

### AI/Backend
- Vercel AI SDK
- OpenAI GPT-4o
- Brave Search API
- Server-side API routes

### PDF Generation
- jsPDF library
- Client-side generation
- Multi-page support

## Project Structure
```
├── app/
│   ├── components/          # React components
│   │   ├── TweetManager.tsx
│   │   └── AIBrandPlanner.tsx
│   ├── api/                 # API routes
│   │   └── primitives/chatbot/
│   ├── dashboard/           # Dashboard page
│   └── page.tsx            # Landing page
├── components/             # Shadcn UI components
├── lib/                    # Utilities
└── .env.local             # Environment variables
```

## Development Tips

### Testing AI Features
Use these example prompts to test:
```
1. "Generate a case study about SaaS product launches"
2. "Create an image prompt for a futuristic workspace"
3. "Analyze tweet: Building in public is the best marketing strategy"
4. "Search for content marketing trends 2024"
```

### Customizing AI Behavior
Edit `app/api/primitives/chatbot/route.ts` to:
- Change the system prompt
- Add new tools
- Modify tool behavior
- Change AI model (currently GPT-4o)

### Styling
- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Inline Tailwind classes

## Performance

### Bundle Sizes
- Landing page: ~292 KB
- Dashboard: ~629 KB
- Streaming responses for fast AI interaction

### Optimization Tips
- Images optimized via Next.js Image component
- API responses streamed for better UX
- Components lazy-loaded where possible

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Other Platforms
1. Build the project: `npm run build`
2. Upload `.next` folder and dependencies
3. Set environment variables
4. Run `npm start`

## Support

### Common Issues
- **"Module not found"**: Run `npm install`
- **"Invalid API key"**: Check `.env.local` formatting
- **"Build failed"**: Check for TypeScript errors
- **"No response from AI"**: Verify API keys and billing

### Resources
- Next.js Docs: https://nextjs.org/docs
- Shadcn UI: https://ui.shadcn.com/
- Vercel AI SDK: https://sdk.vercel.ai/
- OpenAI API: https://platform.openai.com/docs

## License
See LICENSE file for details.

---

**Need help?** Check REFACTORING_SUMMARY.md for detailed implementation notes.
