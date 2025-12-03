"use client"

import { memo } from "react"
import { Handle, Position, Node } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Image as ImageIcon,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react"

export interface UseCaseNodeData extends Record<string, unknown> {
  onSelectUseCase: (useCase: {
    id: string
    title: string
    description: string
    basePrompt: string
    icon: string
  }) => void
  selectedUseCase?: string
}

export type UseCaseNodeType = Node<UseCaseNodeData, "useCase">

const USE_CASES = [
  {
    id: "case-study",
    title: "Brand Case Study",
    description: "Generate detailed case studies with viral strategies",
    basePrompt: "Create a comprehensive brand case study analyzing the following brand/product. Include: target audience analysis, unique value proposition, viral marketing strategies, content pillars, and growth tactics. Brand/Product: ",
    icon: "FileText"
  },
  {
    id: "image-prompt",
    title: "AI Image Prompt",
    description: "Create prompts for AI image generation (DALL-E, Midjourney)",
    basePrompt: "Generate a detailed, vivid image generation prompt for AI art tools (DALL-E, Midjourney, Stable Diffusion). Include style, composition, colors, mood, lighting, and specific visual details. Create an image of: ",
    icon: "Image"
  },
  {
    id: "tweet-analysis",
    title: "Tweet Analysis",
    description: "Analyze tweet virality and engagement potential",
    basePrompt: "Analyze this tweet for virality potential. Provide: sentiment analysis, key themes, engagement factors, audience appeal, optimal posting time, and suggestions for improvement. Tweet: ",
    icon: "MessageSquare"
  },
  {
    id: "trend-research",
    title: "Trend Research",
    description: "Research trending topics and content strategies",
    basePrompt: "Research current trends and create a content strategy around the following topic. Include: trending hashtags, content angles, audience insights, competitor analysis, and viral content ideas. Topic: ",
    icon: "TrendingUp"
  },
  {
    id: "content-ideation",
    title: "Content Ideation",
    description: "Generate creative content ideas for your brand",
    basePrompt: "Generate 10 creative content ideas for social media marketing. Include: content format, hook, key message, call-to-action, and expected engagement type. Create content ideas for: ",
    icon: "Sparkles"
  },
  {
    id: "viral-hook",
    title: "Viral Hook Generator",
    description: "Create attention-grabbing hooks for content",
    basePrompt: "Generate 5 viral hooks/opening lines that will stop the scroll and capture attention. These hooks should be intriguing, relatable, and shareable. Create hooks for: ",
    icon: "Zap"
  }
]

const IconComponent = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case "FileText": return <FileText size={18} />
    case "Image": return <ImageIcon size={18} />
    case "MessageSquare": return <MessageSquare size={18} />
    case "TrendingUp": return <TrendingUp size={18} />
    case "Sparkles": return <Sparkles size={18} />
    case "Zap": return <Zap size={18} />
    default: return <FileText size={18} />
  }
}

const UseCaseNode = memo(({ data }: { data: UseCaseNodeData }) => {
  return (
    <div className="rounded-xl border-2 border-orange-400 bg-gradient-to-br from-orange-50 via-white to-yellow-50 shadow-xl p-6 min-w-[420px]">
      <Handle type="source" position={Position.Right} className="!bg-orange-500" />

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
          Select AI Agent Action
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose what you want the AI to help you with
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {USE_CASES.map((useCase) => (
          <Button
            key={useCase.id}
            variant="outline"
            onClick={() => data.onSelectUseCase(useCase)}
            className={`h-auto py-3 px-3 flex flex-col items-start gap-1 text-left transition-all ${
              data.selectedUseCase === useCase.id
                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-300"
                : "border-orange-200 hover:border-orange-400 hover:bg-orange-50/50"
            }`}
          >
            <div className="flex items-center gap-2 text-orange-700">
              <IconComponent iconName={useCase.icon} />
              <span className="font-semibold text-sm">{useCase.title}</span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {useCase.description}
            </p>
          </Button>
        ))}
      </div>
    </div>
  )
})

UseCaseNode.displayName = "UseCaseNode"

export default UseCaseNode
