"use client"

import { memo } from "react"

const WelcomeNode = memo(() => {
  return (
    <div className="rounded-xl border-2 border-orange-400 bg-gradient-to-br from-orange-50 via-white to-yellow-50 shadow-xl p-6 min-w-[500px]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
          🎨 AI Personal Brand Kit Planner
        </h2>
        <p className="text-gray-600">
          Generate case studies, image prompts, and viral content strategies
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg border border-orange-200 bg-white p-3 text-left">
            <h4 className="mb-1 font-semibold text-sm text-orange-700">📊 Brand Case Studies</h4>
            <p className="text-xs text-gray-600">
              Generate detailed case studies with viral strategies
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-white p-3 text-left">
            <h4 className="mb-1 font-semibold text-sm text-orange-700">🖼️ Image Prompts</h4>
            <p className="text-xs text-gray-600">
              Create JSON prompts for AI image generation
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-white p-3 text-left">
            <h4 className="mb-1 font-semibold text-sm text-orange-700">🐦 Tweet Analysis</h4>
            <p className="text-xs text-gray-600">
              Analyze tweet virality and engagement
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-white p-3 text-left">
            <h4 className="mb-1 font-semibold text-sm text-orange-700">📈 Trend Research</h4>
            <p className="text-xs text-gray-600">
              Search trends and content strategies
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Select an action to get started →
        </p>
      </div>
    </div>
  )
})

WelcomeNode.displayName = "WelcomeNode"

export default WelcomeNode
