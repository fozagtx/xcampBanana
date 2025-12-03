"use client"

import { memo } from "react"
import { Handle, Position, Node } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRight } from "lucide-react"

export interface TextInputNodeData extends Record<string, unknown> {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  disabled: boolean
  isLoading: boolean
  selectedAction?: string | null
}

export type TextInputNodeType = Node<TextInputNodeData, "textInput">

const TextInputNode = memo(({ data }: { data: TextInputNodeData }) => {
  const handleSubmit = () => {
    if (data.value.trim() && !data.disabled && !data.isLoading) {
      data.onSubmit(data.value)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-xl p-6 min-w-[400px]">
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />

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
            onChange={(e) => data.onChange(e.target.value)}
            onKeyPress={handleKeyPress}
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
              disabled={!data.value.trim() || data.disabled || data.isLoading}
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
})

TextInputNode.displayName = "TextInputNode"

export default TextInputNode