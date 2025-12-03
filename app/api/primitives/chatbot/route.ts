import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, tool, UIMessage } from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are an AI Personal Brand Kit Planner. You help users:
1. Generate brand case studies and tweet analogies for going viral
2. Create JSON context prompts for image generation (for tools like Midjourney, DALL-E, Stable Diffusion)
3. Analyze viral content trends and provide strategic insights
4. Help craft engaging content strategies

When generating JSON context prompts for images, provide detailed, structured descriptions with:
- Subject/main focus
- Style (artistic style, mood, lighting)
- Composition details
- Color palette
- Technical parameters (resolution, aspect ratio suggestions)
- Keywords and tags

For brand case studies, analyze successful viral content patterns and provide actionable insights.

Use the webSearch tool to find real-time information about viral trends, successful campaigns, and current social media strategies.`,
    messages: convertToModelMessages(messages),
    tools: {
      webSearch: tool({
        description: "Search the web using Brave Search API for current trends, viral content analysis, and brand strategies",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
          count: z.number().optional().describe("Number of results to return (default 5)"),
        }),
        execute: async ({ query, count = 5 }) => {
          try {
            const apiKey = process.env.BRAVE_SEARCH_API_KEY
            if (!apiKey) {
              return { error: "Brave Search API key not configured" }
            }

            const response = await fetch(
              `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
              {
                headers: {
                  "Accept": "application/json",
                  "X-Subscription-Token": apiKey,
                },
              }
            )

            if (!response.ok) {
              return { error: `Search failed: ${response.statusText}` }
            }

            const data = await response.json()
            const results = data.web?.results?.slice(0, count).map((result: {title: string, description: string, url: string}) => ({
              title: result.title,
              description: result.description,
              url: result.url,
            })) || []

            return { results, query }
          } catch (error) {
            return { error: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }
        },
      }),
      generateImagePrompt: tool({
        description: "Generate detailed JSON context prompts for AI image generation tools",
        inputSchema: z.object({
          concept: z.string().describe("The main concept or idea for the image"),
          style: z.string().optional().describe("Desired artistic style"),
          mood: z.string().optional().describe("Mood or atmosphere"),
        }),
        execute: async ({ concept, style = "professional", mood = "engaging" }) => {
          const prompt = {
            version: "1.0",
            concept: concept,
            style: style,
            mood: mood,
            composition: {
              mainSubject: concept,
              background: "contextually appropriate",
              perspective: "eye-level or slightly elevated",
            },
            visualStyle: {
              artisticStyle: style,
              mood: mood,
              lighting: "natural, well-balanced",
              colorPalette: "vibrant yet professional",
            },
            technicalSpecs: {
              aspectRatio: "16:9 or 1:1 recommended",
              resolution: "high resolution, 4K preferred",
              quality: "high detail, sharp focus",
            },
            keywords: concept.toLowerCase().split(" ").concat([style, mood]),
            promptText: `${concept}, ${style} style, ${mood} atmosphere, high quality, professional composition, detailed, 4k resolution`,
          }

          return { prompt, success: true }
        },
      }),
      analyzeTweetVirality: tool({
        description: "Analyze tweet content and provide insights on viral potential",
        inputSchema: z.object({
          tweetContent: z.string().describe("The tweet text to analyze"),
        }),
        execute: async ({ tweetContent }) => {
          const analysis = {
            contentLength: tweetContent.length,
            hasHashtags: /#\w+/.test(tweetContent),
            hasMentions: /@\w+/.test(tweetContent),
            hasEmojis: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(tweetContent),
            hasQuestion: /\?/.test(tweetContent),
            hasCallToAction: /(click|check|visit|reply|share|retweet|follow|dm|learn)/i.test(tweetContent),
            wordCount: tweetContent.split(/\s+/).length,
            viralityScore: 0,
            insights: [] as string[],
          }

          // Calculate virality score
          let score = 50
          if (analysis.contentLength > 100 && analysis.contentLength < 200) score += 10
          if (analysis.hasHashtags) score += 5
          if (analysis.hasEmojis) score += 5
          if (analysis.hasQuestion) score += 10
          if (analysis.hasCallToAction) score += 15
          if (analysis.wordCount >= 15 && analysis.wordCount <= 30) score += 5

          analysis.viralityScore = Math.min(score, 100)

          // Generate insights
          if (!analysis.hasCallToAction) analysis.insights.push("Consider adding a call-to-action")
          if (!analysis.hasEmojis) analysis.insights.push("Emojis can increase engagement")
          if (analysis.contentLength < 50) analysis.insights.push("Tweet might be too short for maximum impact")
          if (analysis.contentLength > 250) analysis.insights.push("Consider making the message more concise")
          if (!analysis.hasQuestion && !analysis.hasCallToAction) analysis.insights.push("Questions or CTAs boost engagement")

          return analysis
        },
      }),
      generateCaseStudy: tool({
        description: "Generate a brand case study based on successful viral content patterns",
        inputSchema: z.object({
          topic: z.string().describe("The topic or niche for the case study"),
          includeMetrics: z.boolean().optional().describe("Include example metrics"),
        }),
        execute: async ({ topic, includeMetrics = true }) => {
          const caseStudy = {
            title: `Viral Success Case Study: ${topic}`,
            overview: `This case study explores successful viral strategies in the ${topic} niche, analyzing content patterns, engagement tactics, and growth strategies.`,
            keyStrategies: [
              "Consistent posting schedule (2-3 times daily)",
              "Authentic storytelling and personal experiences",
              "Data-driven content with unique insights",
              "Strategic use of trending topics and hashtags",
              "Community engagement and reply interactions",
            ],
            contentTypes: [
              "Educational threads (how-to, tips)",
              "Behind-the-scenes content",
              "Controversial but thoughtful takes",
              "Visual content (images, infographics)",
              "Story-driven posts with emotional hooks",
            ],
            bestPractices: [
              "Hook readers in the first line",
              "Use line breaks for readability",
              "Include a clear call-to-action",
              "Post during peak engagement hours",
              "Engage with comments within first hour",
            ],
            ...(includeMetrics && {
              exampleMetrics: {
                averageEngagementRate: "3-5%",
                viralThreshold: "1000+ likes, 100+ retweets",
                optimalPostLength: "150-250 characters",
                bestPostingTimes: "9-11 AM, 5-7 PM local time",
              },
            }),
            actionableSteps: [
              `1. Identify your unique angle in ${topic}`,
              "2. Create a content calendar with diverse content types",
              "3. Analyze your top-performing posts monthly",
              "4. Engage with 10-20 accounts in your niche daily",
              "5. Experiment with different formats and track results",
            ],
          }

          return caseStudy
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
