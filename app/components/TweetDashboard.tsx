"use client";

import { useAuth, useLinkSocials, useSocials, useAuthState } from "@campnetwork/origin/react";
import { useState } from "react";

class TwitterAPI {
  private apiKey: string;
  private baseUrl = "https://wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev";

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  async fetchTweetsByUsername(username: string, page: number, limit: number) {
    const response = await fetch(`${this.baseUrl}/twitter/tweets?username=${username}&page=${page}&limit=${limit}`, {
      headers: {
        "x-api-key": this.apiKey
      }
    });

    if (!response.ok) {
        // Fallback to try another endpoint structure if the first one fails
        const response2 = await fetch(`${this.baseUrl}/twitter/user/${username}/tweets?page=${page}&limit=${limit}`, {
            headers: {
                "x-api-key": this.apiKey
            }
        });
        if (!response2.ok) {
            throw new Error(`Failed to fetch tweets`);
        }
        return response2.json();
    }

    return response.json();
  }
}

const twitterApi = new TwitterAPI({
  apiKey: "4f1a2c9c-008e-4a2e-8712-055fa04f9ffa",
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
    if (!username) return;
    setLoading(true);
    try {
      const data = await twitterApi.fetchTweetsByUsername(username, 1, 20);
      console.log("Tweets data:", data);
      // Adjust based on actual API response, assuming it might be { data: [...] } or [...]
      // The SDK docs example: const tweets = await twitter.fetchTweetsByUsername("jack", 1, 10);
      // Usually returns an array or object.
      // We will handle both safely.
      const tweetsList = Array.isArray(data) 
        ? data 
        : (data as Record<string, unknown>).data || (data as Record<string, unknown>).items || [];
      setTweets(Array.isArray(tweetsList) ? tweetsList : []);
    } catch (e) {
      console.error("Error fetching tweets", e);
      alert("Failed to fetch tweets. Make sure the username is correct and you have authenticated.");
    } finally {
      setLoading(false);
    }
  };

  const mintTweet = async (tweet: Record<string, unknown>) => {
    setMinting((tweet.id as string) || "unknown");
    try {
        const blob = new Blob([JSON.stringify(tweet, null, 2)], { type: "application/json" });
        const file = new File([blob], `tweet-${tweet.id || Date.now()}.json`, { type: "application/json" });
        
        const license = {
            price: 0n, 
            duration: 0,
            royaltyBps: 500, // 5%
            paymentToken: "0x0000000000000000000000000000000000000000" as const
        };
        
        const metadata = {
            name: `Tweet by @${username}`,
            description: tweet.text || "A tweet on X",
            // Assuming tweet object has text or id
        };

        if (!auth.origin) {
            throw new Error("Origin SDK not initialized");
        }

        const result = await auth.origin.mintFile(file, metadata, license);
        console.log("Mint result:", result);
        alert(`Tweet minted successfully! Token ID: ${result}`);
    } catch (e) {
        console.error("Error minting tweet:", e);
        alert("Failed to mint tweet.");
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
                  <p className="mb-2 text-sm text-zinc-800">{(tweet.text as string) || JSON.stringify(tweet)}</p>
                  <div className="flex justify-between items-center text-xs text-zinc-500 mt-4">
                    <span>Likes: {Number((tweet.public_metrics as Record<string, unknown>)?.like_count || tweet.likes || 0)}</span>
                    <span>Retweets: {Number((tweet.public_metrics as Record<string, unknown>)?.retweet_count || tweet.retweets || 0)}</span>
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
                <p className="text-center col-span-2 text-zinc-500">No tweets found or search not initiated.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}