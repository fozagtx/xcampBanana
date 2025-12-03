"use client";

export const dynamic = "force-dynamic";
import { CampModal } from "@campnetwork/origin/react";
import { useAuthState } from "@campnetwork/origin/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { authenticated } = useAuthState();
  const router = useRouter();

  // Automatically redirect to brand-planner when wallet is connected
  useEffect(() => {
    if (authenticated) {
      router.push("/brand-planner");
    }
  }, [authenticated, router]);

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
                  href="/brand-planner"
                  className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                >
                  AI Brand Planner
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
                Build Your Brand
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed">
              Track your top tweets, generate viral content strategies, and create AI image prompts with your personal brand kit planner
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
                src="https://www.youtube.com/embed/N5qbR0BVnG8?autoplay=1&mute=1&loop=1&playlist=N5qbR0BVnG8&controls=1&modestbranding=1"
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
              Everything you need to build and grow your brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Tweet Performance Tracking",
                description:
                  "Add and track your top-performing tweets with detailed metrics",
              },
              {
                title: "PDF Export",
                description:
                  "Export your tweet collections and AI insights to professional PDFs",
              },
              {
                title: "AI Brand Planner",
                description: "Get personalized brand strategies and viral content insights",
              },
              {
                title: "Case Study Generation",
                description: "Generate detailed brand case studies with actionable strategies",
              },
              {
                title: "Image Prompt Creator",
                description: "Create JSON context prompts for AI image generation tools",
              },
              {
                title: "Web Search Integration",
                description: "Real-time trend analysis with Brave Search API",
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
              Ready to Build Your Brand?
            </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Join xcampBanana today and unlock AI-powered brand growth tools
            </p>
            <CampModal />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto text-center text-zinc-600">
          <p className="mb-2">Built with ❤️ on Camp Network</p>
        </div>
      </footer>
    </div>
  );
}
