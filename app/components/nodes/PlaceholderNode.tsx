"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, FileText, HelpCircle } from "lucide-react"

export interface PlaceholderNodeData extends Record<string, unknown> {
  onSelectAction: (action: string) => void
  selectedAction?: string | null
  onToggleHelp: () => void
}

const PlaceholderNode = memo(({ data }: { data: PlaceholderNodeData }) => {
  return (
    <div className="rounded-xl border-2 border-orange-400 bg-gradient-to-br from-orange-50 via-white to-yellow-50 shadow-xl p-6 min-w-[380px] h-full">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
          🎨 AI Brand Kit
        </h2>
        <p className="text-sm text-gray-600">
          Choose what you want to create
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => data.onSelectAction("image-prompt")}
            variant={data.selectedAction === "image-prompt" ? "default" : "outline"}
            className={`w-full h-auto py-4 px-4 flex items-center gap-3 justify-start transition-all ${
              data.selectedAction === "image-prompt"
                ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50"
            }`}
          >
            <ImageIcon size={20} className={data.selectedAction === "image-prompt" ? "text-white" : "text-orange-600"} />
            <div className="text-left">
              <div className="font-semibold">AI Image Prompt</div>
              <div className="text-xs opacity-80">Generate detailed prompts for AI image generation</div>
            </div>
          </Button>

          <Button
            onClick={() => data.onSelectAction("case-study")}
            variant={data.selectedAction === "case-study" ? "default" : "outline"}
            className={`w-full h-auto py-4 px-4 flex items-center gap-3 justify-start transition-all ${
              data.selectedAction === "case-study"
                ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50"
            }`}
          >
            <FileText size={20} className={data.selectedAction === "case-study" ? "text-white" : "text-orange-600"} />
            <div className="text-left">
              <div className="font-semibold">Brand Case Study</div>
              <div className="text-xs opacity-80">Create comprehensive brand analysis and strategies</div>
            </div>
          </Button>

          <Button
            onClick={data.onToggleHelp}
            variant="outline"
            className="w-full h-auto py-3 px-4 flex items-center gap-3 justify-start border-green-200 hover:border-green-400 hover:bg-green-50/50"
          >
            <HelpCircle size={20} className="text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-green-700">Help & Usage</div>
              <div className="text-xs text-gray-600">Learn how to use this tool</div>
            </div>
          </Button>
        </div>

        {data.selectedAction && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-xs text-orange-700 font-medium">
              ✓ {data.selectedAction === "image-prompt" ? "AI Image Prompt" : "Brand Case Study"} selected
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Now add your input in the next card →
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

PlaceholderNode.displayName = "PlaceholderNode"

export default PlaceholderNode
