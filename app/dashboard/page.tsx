"use client";

export const dynamic = "force-dynamic";

import { useAuthState } from "@campnetwork/origin/react";
import { CampModal } from "@campnetwork/origin/react";
import TweetManager from "../components/TweetManager";
import AIBrandPlanner from "../components/AIBrandPlanner";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const { authenticated } = useAuthState();
  const [activeTab, setActiveTab] = useState<"tweets" | "planner">("tweets");

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* Navigation */}
      <div className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                xcampBanana
              </span>
            </Link>
            <CampModal />
          </div>
        </nav>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-zinc-200">
            <button
              onClick={() => setActiveTab("tweets")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "tweets"
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              📊 Top Performing Tweets
            </button>
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "planner"
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              🤖 AI Brand Planner
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "tweets" ? (
            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
              <TweetManager />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
              <AIBrandPlanner />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto text-center text-zinc-600">
          <p className="mb-2">Built with ❤️ on Camp Network</p>
          <p className="text-sm">© 2024 xcampBanana. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
