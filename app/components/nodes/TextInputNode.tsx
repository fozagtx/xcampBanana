"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRight } from "lucide-react"

export interface TextInputNodeData extends Record<string, unknown> {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (text: string) => void
  disabled?: boolean
  isLoading?: boolean
  selectedAction?: string | null
  basePrompt?: string
  useCaseTitle?: string
  useCaseId?: string
}

const TextInputNode = memo(({ data }: { data: TextInputNodeData }) => {
  // Check which mode we're in based on the data structure
  const isBrandDashboard = data.value !== undefined && data.onChange !== undefined
  const isTweetDashboard = data.basePrompt !== undefined

  const handleSubmit = () => {
    if (isBrandDashboard) {
      // Brand dashboard mode
      if (data.value?.trim() && !data.disabled && !data.isLoading && data.onSubmit) {
        data.onSubmit(data.value)
      }
    } else if (isTweetDashboard) {
      // Tweet dashboard mode
      const textarea = document.getElementById("tweet-input") as HTMLTextAreaElement
      if (textarea?.value.trim() && !data.disabled && !data.isLoading && data.onSubmit) {
        const fullPrompt = data.basePrompt + textarea.value
        data.onSubmit(fullPrompt)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // For Brand Dashboard mode
  if (isBrandDashboard) {
    return (
      <div className="rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-xl p-6 min-w-[400px] h-full">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Input Details
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {data.selectedAction === "image-prompt"
                ? "Describe what image you want to generate"
                : "Enter the brand or product to analyze"
              }
            </p>
          </div>

          <div className="space-y-3">
            <Textarea
              value={data.value}
              onChange={(e) => data.onChange?.(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                data.selectedAction === "image-prompt"
                  ? "e.g., A futuristic city with flying cars at sunset, cyberpunk style..."
                  : "e.g., Nike, Tesla, or your brand name..."
              }
              disabled={data.disabled}
              className="min-h-[100px] resize-none border-purple-200 focus:border-purple-400"
            />

            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Press Ctrl+Enter to submit
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!data.value?.trim() || data.disabled || data.isLoading}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {data.isLoading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate
                    <ArrowRight size={14} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {data.selectedAction && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 font-medium">
                Mode: {data.selectedAction === "image-prompt" ? "🎨 Image Prompt" : "📊 Case Study"}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // For Tweet Dashboard mode
  return (
    <div className="rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-xl p-6 min-w-[400px] h-full">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Input Details
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {data.useCaseTitle
              ? `Enter details for: ${data.useCaseTitle}`
              : "Select a use case first"
            }
          </p>
        </div>

        <div className="space-y-3">
          <Textarea
            id="tweet-input"
            onKeyDown={handleKeyPress}
            placeholder={
              data.useCaseId
                ? "Enter your content here..."
                : "Please select a use case first"
            }
            disabled={data.disabled}
            className="min-h-[100px] resize-none border-purple-200 focus:border-purple-400"
          />

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to submit
            </p>
            <Button
              onClick={handleSubmit}
              disabled={data.disabled || data.isLoading}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {data.isLoading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight size={14} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {data.useCaseTitle && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-medium">
              Use Case: {data.useCaseTitle}
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

TextInputNode.displayName = "TextInputNode"

export default TextInputNode
