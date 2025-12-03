"use client";

export const dynamic = "force-dynamic";

import { useAuthState } from "@campnetwork/origin/react";
import { CampModal } from "@campnetwork/origin/react";
import BrandkitMint from "../components/BrandkitMint";
import ChatWidget from "../components/ChatWidget";
import Link from "next/link";

export default function Dashboard() {
  const { authenticated } = useAuthState();

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
        <nav className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 px-6 py-4">
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

      {/* Brandkit Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900">
              Nanabanapro Brandkit
            </h2>
            <p className="text-lg text-zinc-600">
              Create and sell custom brandkit prompts
            </p>
          </div>
          <BrandkitMint />
        </div>
      </section>

      {/* AI Chat Widget */}
      <ChatWidget />

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
