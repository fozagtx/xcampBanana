"use client";

import { useAuth, useLinkSocials, useSocials, useAuthState } from "@campnetwork/origin/react";
import { useState } from "react";

class TwitterAPI {
  private apiKey: string;
  private clientId: string;
  private baseUrl = "https://wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev";

  constructor({ apiKey, clientId }: { apiKey: string; clientId: string }) {
    this.apiKey = apiKey;
    this.clientId = clientId;
  }

  async fetchTweetsByUsername(username: string, page: number, limit: number) {
    console.log(`Fetching tweets for @${username} with API key: ${this.apiKey?.substring(0, 8)}...`);
    
    // Try multiple endpoint structures
    const endpoints = [
      `${this.baseUrl}/twitter/tweets?username=${username}&page=${page}&limit=${limit}`,
      `${this.baseUrl}/twitter/user/${username}/tweets?page=${page}&limit=${limit}`,
      `${this.baseUrl}/api/twitter/tweets?username=${username}&page=${page}&limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          return data;
        } else {
          console.warn(`Endpoint ${endpoint} failed with status: ${response.status}`);
          const errorText = await response.text();
          console.warn("Error response:", errorText);
        }
      } catch (error) {
        console.warn(`Endpoint ${endpoint} error:`, error);
      }
    }

    throw new Error(`Failed to fetch tweets from all endpoints for user: ${username}`);
  }
}

const twitterApi = new TwitterAPI({
  apiKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY || "4f1a2c9c-008e-4a2e-8712-055fa04f9ffa",
  clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "fce77d7a-8085-47ca-adff-306a933e76aa",
});

export default function TweetDashboard() {
  const { authenticated } = useAuthState();
  const { linkTwitter } = useLinkSocials();
  const { data: socials } = useSocials();
  const auth = useAuth();
  
  const [username, setUsername] = useState("");
  const [tweets, setTweets] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState<string | null>(null);

  const fetchTweets = async () => {
    if (!username) {
      alert("Please enter a username");
      return;
    }
    
    // Clean username (remove @ if present)
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
    setLoading(true);
    setTweets([]); // Clear previous results
    try {
      console.log(`Fetching tweets for ${cleanUsername}...`);
      const data = await twitterApi.fetchTweetsByUsername(cleanUsername, 1, 20);
      console.log("Raw tweets data:", data);
      
      // Handle different response formats
      let tweetsList: Array<Record<string, unknown>> = [];
      
      if (Array.isArray(data)) {
        tweetsList = data;
      } else if (data && typeof data === 'object') {
        // Try common response structures
        tweetsList = (data.data as Array<Record<string, unknown>>) || 
                     (data.tweets as Array<Record<string, unknown>>) ||
                     (data.items as Array<Record<string, unknown>>) ||
                     (data.results as Array<Record<string, unknown>>) ||
                     [];
      }
      
      console.log(`Processed ${tweetsList.length} tweets`);
      setTweets(tweetsList);
      
      if (tweetsList.length === 0) {
        alert(`No tweets found for @${cleanUsername}. Make sure the username is correct and the account is public.`);
      }
    } catch (e) {
      console.error("Error fetching tweets", e);
      alert(`Failed to fetch tweets: ${e instanceof Error ? e.message : 'Unknown error'}. Make sure the username is correct and you have authenticated with Twitter.`);
    } finally {
      setLoading(false);
    }
  };

  const mintTweet = async (tweet: Record<string, unknown>) => {
    const tweetId = (tweet.id as string) || "unknown";
    setMinting(tweetId);
    try {
        console.log("Minting tweet:", tweet);
        
        const blob = new Blob([JSON.stringify(tweet, null, 2)], { type: "application/json" });
        const file = new File([blob], `tweet-${tweet.id || Date.now()}.json`, { type: "application/json" });
        
        // Fixed license terms according to Origin SDK constraints
        const license = {
            price: 1000000000000000n, // 0.001 CAMP minimum
            duration: 86400, // 1 day minimum (86400 seconds)
            royaltyBps: 500, // 5% royalty (500 basis points)
            paymentToken: "0x0000000000000000000000000000000000000000" as const
        };
        
        const metadata = {
            name: `Tweet by @${username}`,
            description: (tweet.text as string) || (tweet.full_text as string) || "A tweet on X",
        };

        if (!auth.origin) {
            throw new Error("Origin SDK not initialized");
        }

        const result = await auth.origin.mintFile(file, metadata, license);
        console.log("Mint result:", result);
        alert(`Tweet minted successfully! Token ID: ${result}`);
    } catch (e) {
        console.error("Error minting tweet:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        alert(`Failed to mint tweet: ${errorMessage}. Please check your wallet connection and try again.`);
    } finally {
        setMinting(null);
    }
  };

  if (!authenticated) {
    return <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-800">Please connect your wallet to view the dashboard.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">Twitter / X Dashboard</h2>
        
        {!socials || !(socials as Record<string, unknown>)['twitter'] ? (
          <div className="text-center py-8">
             <p className="mb-4 text-zinc-600">Link your X account to get started.</p>
             <button 
               onClick={() => linkTwitter()}
               className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-full font-medium hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
             >
               Link X Account
             </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter your X username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-2 border rounded-md bg-white border-zinc-300 text-zinc-900"
              />
              <button 
                onClick={fetchTweets}
                disabled={loading || !username}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {loading ? "Fetching..." : "Fetch Tweets"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tweets.map((tweet: Record<string, unknown>, i) => (
                <div key={(tweet.id as string) || i} className="p-4 border rounded-lg border-zinc-200 hover:shadow-md transition bg-white">
                  <p className="mb-2 text-sm text-zinc-800">
                    {(tweet.text as string) || (tweet.full_text as string) || JSON.stringify(tweet)}
                  </p>
                  <div className="flex justify-between items-center text-xs text-zinc-500 mt-4">
                    <span>Likes: {Number((tweet.public_metrics as Record<string, unknown>)?.like_count || tweet.likes || tweet.favorite_count || 0)}</span>
                    <span>Retweets: {Number((tweet.public_metrics as Record<string, unknown>)?.retweet_count || tweet.retweets || tweet.retweet_count || 0)}</span>
                  </div>
                  <button
                    onClick={() => mintTweet(tweet)}
                    disabled={!!minting}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {minting === ((tweet.id as string) || "unknown") ? "Minting..." : "Sell (Mint as IpNFT)"}
                  </button>
                </div>
              ))}
              {tweets.length === 0 && !loading && username && (
                <p className="text-center col-span-2 text-zinc-500">
                  No tweets found for @{username}. Try a different username or check if the account is public.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}