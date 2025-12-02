"use client";

export const dynamic = "force-dynamic";
import { CampModal } from "@campnetwork/origin/react";
import { useAuthState } from "@campnetwork/origin/react";
import ChatWidget from "./components/ChatWidget";
import Link from "next/link";

export default function Home() {
  const { authenticated } = useAuthState();

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100">
      {/* Navigation */}
      <div className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                xcampBanana
              </span>
            </div>
            <div className="flex items-center gap-4">
              {authenticated && (
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-linear-to-r from-yellow-600 to-orange-600 text-white rounded-full font-medium hover:from-yellow-700 hover:to-orange-700 transition-all shadow-md"
                >
                  Dashboard
                </Link>
              )}
              <CampModal />
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-linear-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Value Your Content
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed">
              Transform your viral tweets into valuable IpNFTs and create unique
              Nanabanapro Brandkit prompts on Camp Network
            </p>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-[0_-10px_40px_rgba(234,179,8,0.6),0_-5px_20px_rgba(249,115,22,0.4)]">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=1&modestbranding=1"
                title="xcampBanana Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900">
              Powerful Features
            </h2>
            <p className="text-lg text-zinc-600">
              Everything you need to monetize your digital content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "X Integration",
                description:
                  "Seamlessly connect your X (Twitter) account and import your content",
              },
              {
                title: "Tweet Analytics",
                description:
                  "View engagement metrics to identify your most valuable content",
              },
              {
                title: "Mint as IpNFTs",
                description:
                  "Convert your viral tweets into tradable intellectual property",
              },
              {
                title: "Brandkit Creation",
                description:
                  "Design and sell Nanabanapro Brandkit JSON prompts",
              },
              {
                title: "Custom Royalties",
                description: "Set your own pricing and royalty percentages",
              },
              {
                title: "Camp Network",
                description: "Built on secure, decentralized infrastructure",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-linear-to-br from-white to-zinc-50 border border-zinc-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-12 h-1 bg-linear-to-r from-yellow-600 to-orange-600 rounded-full mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900">
                  {feature.title}
                </h3>
                <p className="text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-yellow-600 to-orange-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Join xcampBanana today and turn your content into valuable digital
              assets
            </p>
            <CampModal />
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <ChatWidget />

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto text-center text-zinc-600">
          <p className="mb-2">Built with ❤️ on Camp Network</p>
        </div>
      </footer>
    </div>
  );
}
