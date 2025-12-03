"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import BrandAIFlowDashboard from "../components/BrandAIFlowDashboard"

export default function BrandPlannerPage() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              AI Brand Planner
            </h1>
            <p className="text-sm text-gray-600">
              Create viral tweet strategies, analyze brand case studies, and generate AI image prompts
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen React Flow */}
      <main className="flex-1 overflow-hidden">
        <BrandAIFlowDashboard />
      </main>
    </div>
  )
}
