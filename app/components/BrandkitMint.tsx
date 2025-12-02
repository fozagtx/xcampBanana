"use client";

import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { useState } from "react";

export default function BrandkitMint() {
  const { authenticated } = useAuthState();
  const auth = useAuth();

  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [minting, setMinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  const isValidJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const mintBrandkit = async () => {
    if (!content || !name) return;
    setMinting(true);
    try {
      const jsonContent = JSON.stringify(
        { prompt: content, type: "Nanabanapro Brandkit" },
        null,
        2,
      );
      const blob = new Blob([jsonContent], { type: "application/json" });
      const file = new File(
        [blob],
        `${name.replace(/\s+/g, "-").toLowerCase()}.json`,
        { type: "application/json" },
      );

      const license = {
        price: 1000000000000000n,
        duration: 0,
        royaltyBps: 1000,
        paymentToken: "0x0000000000000000000000000000000000000000" as const,
      };

      const metadata = {
        name: `Brandkit: ${name}`,
        description: "Nanabanapro Brandkit JSON Prompt",
      };

      if (!auth.origin) {
        throw new Error("Origin SDK not initialized");
      }

      const result = await auth.origin.mintFile(file, metadata, license);
      console.log("Mint result:", result);
      alert(`Brandkit minted successfully! Token ID: ${result}`);
      setContent("");
      setName("");
      setShowPreview(false);
    } catch (e) {
      console.error("Error minting brandkit:", e);
      alert("Failed to mint brandkit.");
    } finally {
      setMinting(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">
          Sell Nanabanapro Brandkit
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 tex-black">
              Brandkit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
              placeholder="e.g. Cyberpunk Theme"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-900">
              JSON Prompt Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-md h-32 bg-white border-zinc-300 font-mono text-sm text-black"
              placeholder='{"style": "cyberpunk", "colors": ["#ff00ff", "#00ffff"]}'
            />
            {content && !isValidJSON(content) && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Invalid JSON format
              </p>
            )}
          </div>

          {content && isValidJSON(content) && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-zinc-900">
                  Preview (Formatted)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  {showPreview ? "👁️ Hide" : "👁️ Show"} Preview
                </button>
              </div>
              {showPreview && (
                <pre className="w-full p-4 border rounded-md bg-zinc-50 border-zinc-300 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
                  <code className="text-zinc-800">{formatJSON(content)}</code>
                </pre>
              )}
            </div>
          )}

          <button
            onClick={mintBrandkit}
            disabled={minting || !content || !name || !isValidJSON(content)}
            className="w-full py-3 bg-linear-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {minting ? "Minting..." : "Mint Brandkit"}
          </button>
        </div>
      </div>
    </div>
  );
}
