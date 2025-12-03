import { NextRequest } from 'next/server';

export const maxDuration = 30;

interface MessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
}

interface BraveSearchResult {
  title: string;
  description: string;
  url: string;
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Brave Search function
async function braveSearch(query: string, count: number = 5): Promise<{ results?: BraveSearchResult[]; error?: string; query: string }> {
  try {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
      return { error: "Brave Search API key not configured", query };
    }

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      {
        headers: {
          "Accept": "application/json",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    if (!response.ok) {
      return { error: `Search failed: ${response.statusText}`, query };
    }

    const data = await response.json();
    const results = data.web?.results?.slice(0, count).map((result: { title: string; description: string; url: string }) => ({
      title: result.title,
      description: result.description,
      url: result.url,
    })) || [];

    return { results, query };
  } catch (error) {
    return { error: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`, query };
  }
}

// Detect if user wants a web search
function detectSearchIntent(message: string): { needsSearch: boolean; searchQuery: string } {
  const searchKeywords = [
    'search for', 'search', 'find', 'look up', 'lookup', 'google',
    'what is the latest', 'current', 'recent', 'trending', 'news about',
    'real-time', 'realtime', 'right now', 'today', 'this week',
    'viral', 'trending topics', 'latest trends'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of searchKeywords) {
    if (lowerMessage.includes(keyword)) {
      // Extract potential search query
      let searchQuery = message;
      
      // Try to extract the actual search term
      const patterns = [
        /search for (.+)/i,
        /search (.+)/i,
        /find (.+)/i,
        /look up (.+)/i,
        /lookup (.+)/i,
        /what is the latest (.+)/i,
        /latest (.+)/i,
        /trending (.+)/i,
        /news about (.+)/i,
      ];
      
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          searchQuery = match[1].trim();
          break;
        }
      }
      
      return { needsSearch: true, searchQuery };
    }
  }
  
  return { needsSearch: false, searchQuery: '' };
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Processing chatbot request with", messages.length, "messages");

    // Convert UIMessage format to OpenAI format
    const openaiMessages: OpenAIMessage[] = [];
    
    // Add system message
    let systemMessage = `You are an AI Personal Brand Kit Planner. You help users:
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

For brand case studies, analyze successful viral content patterns and provide actionable insights.`;

    // Check if the last user message needs web search
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    let searchResults: BraveSearchResult[] | null = null;
    
    if (lastUserMessage) {
      const messageText = lastUserMessage.parts
        .filter(p => p.type === 'text')
        .map(p => p.text || '')
        .join(' ');
      
      const { needsSearch, searchQuery } = detectSearchIntent(messageText);
      
      if (needsSearch) {
        console.log("Performing web search for:", searchQuery);
        const searchResponse = await braveSearch(searchQuery, 5);
        
        if (searchResponse.results && searchResponse.results.length > 0) {
          searchResults = searchResponse.results;
          systemMessage += `\n\nI have access to real-time web search. Here are the latest search results for "${searchQuery}":\n\n`;
          searchResults.forEach((result, index) => {
            systemMessage += `${index + 1}. **${result.title}**\n   ${result.description}\n   URL: ${result.url}\n\n`;
          });
          systemMessage += "\nUse this information to provide an informed, up-to-date response.";
        }
      }
    }

    openaiMessages.push({
      role: 'system',
      content: systemMessage
    });

    // Convert messages
    for (const msg of messages) {
      const textContent = msg.parts
        .filter(p => p.type === 'text')
        .map(p => p.text || '')
        .join('');
      
      if (textContent.trim()) {
        openaiMessages.push({
          role: msg.role,
          content: textContent
        });
      }
    }

    console.log("Sending request to OpenAI with", openaiMessages.length, "messages");

    // Make direct OpenAI API call with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        stream: true,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      let errorMessage = "OpenAI API error";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a readable stream that transforms OpenAI's SSE format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // Send in a simple format that the client can easily parse
                    const chunk = JSON.stringify({ type: 'text-delta', textDelta: content });
                    controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                  console.warn("Failed to parse OpenAI chunk:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream reading error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
