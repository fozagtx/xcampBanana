"use client";

export const dynamic = "force-dynamic";

import { useAuthState } from "@campnetwork/origin/react";
import { CampModal, useAuth } from "@campnetwork/origin/react";
import TweetManager from "../components/TweetManager";
import TweetFlowDashboard from "../components/TweetFlowDashboard";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { authenticated } = useAuthState();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<"tweets" | "flow">("flow");
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintContent, setMintContent] = useState("");
  const [mintName, setMintName] = useState("");
  const [mintPrice, setMintPrice] = useState("0.001");
  const [mintDuration, setMintDuration] = useState("1");
  const [mintRoyalty, setMintRoyalty] = useState("10");
  const [isMinting, setIsMinting] = useState(false);

  const handleMintNFT = useCallback((content: string) => {
    setMintContent(content);
    setMintName(`AI Generated - ${new Date().toLocaleDateString()}`);
    setShowMintModal(true);
  }, []);

  const executeMint = async () => {
    if (!mintContent || !mintName) return;

    const priceFloat = parseFloat(mintPrice);
    const durationDays = parseFloat(mintDuration);
    const royaltyPercent = parseFloat(mintRoyalty);

    if (isNaN(priceFloat) || priceFloat < 0.001) {
      alert("Price must be at least 0.001 CAMP");
      return;
    }

    if (isNaN(durationDays) || durationDays < 1) {
      alert("Duration must be at least 1 day");
      return;
    }

    if (isNaN(royaltyPercent) || royaltyPercent < 0 || royaltyPercent > 100) {
      alert("Royalty must be between 0% and 100%");
      return;
    }

    setIsMinting(true);
    try {
      const jsonContent = JSON.stringify(
        { content: mintContent, type: "AI Generated Brandkit" },
        null,
        2
      );
      const blob = new Blob([jsonContent], { type: "application/json" });
      const file = new File(
        [blob],
        `${mintName.replace(/\s+/g, "-").toLowerCase()}.json`,
        { type: "application/json" }
      );

      const priceInWei = BigInt(Math.floor(priceFloat * 1e18));
      const durationInSeconds = Math.floor(durationDays * 86400);
      const royaltyInBps = Math.floor(royaltyPercent * 100);

      const license = {
        price: priceInWei,
        duration: durationInSeconds,
        royaltyBps: royaltyInBps,
        paymentToken: "0x0000000000000000000000000000000000000000" as const,
      };

      const metadata = {
        name: `Brandkit: ${mintName}`,
        description: "AI Generated Brandkit from xcampBanana",
        price: priceFloat,
        duration: durationDays,
        royalty: royaltyPercent,
      };

      if (!auth.origin) {
        throw new Error("Origin SDK not initialized");
      }

      const result = await auth.origin.mintFile(file, metadata, license);

      console.log("Mint result:", result);
      alert(
        `Brandkit minted successfully! Token ID: ${result}\n\nPrice: ${priceFloat} CAMP\nDuration: ${durationDays} day(s)\nRoyalty: ${royaltyPercent}%`
      );

      setShowMintModal(false);
      setMintContent("");
      setMintName("");
    } catch (e) {
      console.error("Error minting:", e);
      alert(
        `Failed to mint: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    } finally {
      setIsMinting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Please connect your wallet
          </h2>
          <p className="text-zinc-600 mb-6">
            You need to connect your wallet to access the dashboard
          </p>
          <CampModal />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex flex-col">
      {/* Navigation */}
      <div className="py-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <nav className="max-w-full mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                xcampBanana
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/brand-planner"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                AI Brand Planner
              </Link>
              <CampModal />
            </div>
          </div>
        </nav>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-full mx-auto">
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-zinc-200">
            <button
              onClick={() => setActiveTab("flow")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "flow"
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              AI Brand Kit Flow
            </button>
            <button
              onClick={() => setActiveTab("tweets")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "tweets"
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Top Performing Tweets
            </button>
          </div>
        </div>
      </div>

      {/* Content Section - Full Page */}
      <section className="flex-1 px-4 sm:px-6 lg:px-8 py-4 min-h-0">
        {activeTab === "flow" ? (
          <div className="h-full w-full rounded-2xl overflow-hidden">
            <TweetFlowDashboard onMintNFT={handleMintNFT} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8 h-full overflow-auto">
            <TweetManager />
          </div>
        )}
      </section>

      {/* Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Coins className="text-orange-600" size={24} />
                  Mint as NFT
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMintModal(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">
                    NFT Name *
                  </label>
                  <input
                    type="text"
                    value={mintName}
                    onChange={(e) => setMintName(e.target.value)}
                    className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
                    placeholder="e.g. AI Brand Strategy"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">
                      Price (CAMP)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={mintPrice}
                      onChange={(e) => setMintPrice(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white border-zinc-300 text-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={mintDuration}
                      onChange={(e) => setMintDuration(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white border-zinc-300 text-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">
                      Royalty (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={mintRoyalty}
                      onChange={(e) => setMintRoyalty(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white border-zinc-300 text-black text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-zinc-700">
                    Content Preview
                  </label>
                  <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 max-h-40 overflow-auto">
                    <pre className="text-xs text-zinc-700 whitespace-pre-wrap">
                      {mintContent.substring(0, 500)}
                      {mintContent.length > 500 && "..."}
                    </pre>
                  </div>
                </div>

                <button
                  onClick={executeMint}
                  disabled={isMinting || !mintContent || !mintName}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {isMinting ? "Minting..." : "Mint to IP & Create NFT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
