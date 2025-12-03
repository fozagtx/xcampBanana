"use client";

import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { useState, useEffect } from "react";

interface BrandkitItem {
  tokenId: string;
  name: string;
  description: string;
  owner: string;
  price: string;
  duration: number;
  royaltyBps: number;
  contentHash?: string;
  metadata?: Record<string, unknown>;
}

export default function Marketplace() {
  const { authenticated } = useAuthState();
  const auth = useAuth();
  const [items, setItems] = useState<BrandkitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<BrandkitItem | null>(null);
  const [periods, setPeriods] = useState(1);

  const loadMarketplaceItems = async () => {
    setLoading(true);
    try {
      // For now, we'll use a simple approach - users can manually add token IDs
      // In a production environment, you would query from a backend or indexer
      // that tracks all minted tokens

      // Mock data for demonstration
      // In a real app, you'd fetch this from an API or blockchain indexer
      const mockItems: BrandkitItem[] = [
        {
          tokenId: "1",
          name: "Sample Brandkit 1",
          description: "A sample brandkit for demonstration",
          owner: "0x0000...0000",
          price: "0.001",
          duration: 1,
          royaltyBps: 1000,
        },
      ];

      setItems(mockItems);

      // Note: In production, you would:
      // 1. Query a backend API for all minted tokens
      // 2. Or use a blockchain indexer/subgraph
      // 3. Then fetch details for each token using:
      //    - auth.origin.getTerms(tokenId)
      //    - auth.origin.ownerOf(tokenId)
      //    - auth.origin.getData(tokenId)
    } catch (error) {
      console.error("Error loading marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && auth.origin) {
      void loadMarketplaceItems();
    }
  }, [authenticated, auth.origin]);

  const buyAccessAction = async (tokenId: string) => {
    if (!auth.origin || !selectedItem) {
      alert("Origin SDK not initialized");
      return;
    }

    setBuying(tokenId);
    try {
      const tokenIdBigInt = BigInt(tokenId);

      // Calculate expected values
      const pricePerPeriod = BigInt(Math.floor(parseFloat(selectedItem.price) * 1e18));
      const totalPrice = pricePerPeriod * BigInt(periods);
      const durationInSeconds = BigInt(selectedItem.duration);
      const paymentToken = "0x0000000000000000000000000000000000000000" as const;

      // Get current user address from auth
      // For now, we'll use a placeholder - in production you'd get this from the wallet
      const userAddress = "0x0000000000000000000000000000000000000000" as const;

      // Use regular buyAccess method
      const result = await auth.origin.buyAccess(
        userAddress,
        tokenIdBigInt,
        totalPrice,
        durationInSeconds,
        paymentToken,
        totalPrice // Pass the value for native token payment
      );

      console.log("Access purchased:", result);
      alert(`Successfully purchased ${periods} period(s) of access!`);

      // Close modal
      setSelectedItem(null);
      setPeriods(1);
    } catch (error) {
      console.error("Error buying access:", error);
      alert(`Failed to purchase access: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setBuying(null);
    }
  };

  const downloadContent = async (tokenId: string) => {
    if (!auth.origin) return;

    try {
      // Fetch metadata for the token
      const metadata = await auth.origin.getData(BigInt(tokenId));

      if (metadata) {
        // Create downloadable content
        const content = JSON.stringify(metadata, null, 2);
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `brandkit-${tokenId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Content downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading content:", error);
      alert("Failed to download content. You may need to purchase access first.");
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">
            Brandkit Marketplace
          </h2>
          <button
            onClick={loadMarketplaceItems}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">Loading marketplace items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-lg">No items available yet.</p>
            <p className="text-zinc-500 text-sm mt-2">Create and mint a Brandkit to see it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.tokenId}
                className="border border-zinc-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-zinc-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-zinc-900 flex-1 pr-2">
                    {item.name}
                  </h3>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    #{item.tokenId}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Price:</span>
                    <span className="font-semibold text-zinc-900">{item.price} CAMP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Duration:</span>
                    <span className="font-medium text-zinc-700">
                      {item.duration / 86400} day(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Royalty:</span>
                    <span className="font-medium text-zinc-700">
                      {item.royaltyBps / 100}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium text-sm"
                  >
                    Buy Access
                  </button>
                  <button
                    onClick={() => downloadContent(item.tokenId)}
                    className="px-3 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors text-sm"
                    title="Download (requires access)"
                  >
                    📥
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy Access Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-zinc-900">
              Purchase Access
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold text-lg text-zinc-800 mb-2">
                {selectedItem.name}
              </h4>
              <p className="text-sm text-zinc-600 mb-4">
                {selectedItem.description}
              </p>

              <div className="bg-zinc-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Price per period:</span>
                  <span className="font-semibold">{selectedItem.price} CAMP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Duration per period:</span>
                  <span className="font-medium">{selectedItem.duration / 86400} day(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Royalty:</span>
                  <span className="font-medium">{selectedItem.royaltyBps / 100}%</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-zinc-900">
                Number of Periods
              </label>
              <input
                type="number"
                min="1"
                value={periods}
                onChange={(e) => setPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 border rounded-lg bg-white border-zinc-300 text-black"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Total: {(parseFloat(selectedItem.price) * periods).toFixed(4)} CAMP for{" "}
                {(selectedItem.duration / 86400) * periods} day(s)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setPeriods(1);
                }}
                disabled={buying !== null}
                className="flex-1 py-3 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => buyAccessAction(selectedItem.tokenId)}
                disabled={buying !== null}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium disabled:opacity-50"
              >
                {buying === selectedItem.tokenId ? "Processing..." : "Confirm Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
