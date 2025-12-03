"use client"

import { memo, useState } from "react"
import { Handle, Position, Node } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2 } from "lucide-react"

export interface TextInputNodeData extends Record<string, unknown> {
  basePrompt: string
  useCaseTitle: string
  onSubmit: (fullPrompt: string) => void
  disabled?: boolean
  isLoading?: boolean
  useCaseId?: string
}

export type TextInputNodeType = Node<TextInputNodeData, "textInput">

const TextInputNode = memo(({ data }: { data: TextInputNodeData }) => {
  const [userContext, setUserContext] = useState("")
  const [lastUseCaseId, setLastUseCaseId] = useState(data.useCaseId)

  // Reset user context when use case changes
  if (data.useCaseId !== lastUseCaseId) {
    setLastUseCaseId(data.useCaseId)
    setUserContext("")
  }

  const handleSubmit = () => {
    if (!userContext.trim()) return
    const fullPrompt = data.basePrompt + userContext.trim()
    data.onSubmit(fullPrompt)
  }

  return (
    <div className="rounded-xl border-2 border-purple-400 bg-white shadow-xl p-5 min-w-[450px]">
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />

      <div className="mb-3">
        <h3 className="text-sm font-semibold text-purple-700 mb-1">
          {data.useCaseTitle || "Your Input"}
        </h3>
        {data.basePrompt && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-purple-600 font-medium mb-1">AI will use this base prompt:</p>
            <p className="text-xs text-gray-700 italic line-clamp-3">{data.basePrompt}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Add your context:</label>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !data.disabled) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={
              data.basePrompt
                ? "Add specific details here (e.g., brand name, topic, tweet text)..."
                : "Select a use case first..."
            }
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={data.disabled || !data.basePrompt}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!userContext.trim() || data.disabled || data.isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {data.isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUp size={16} className="mr-2" />
              Generate Result
            </>
          )}
        </Button>
      </div>
    </div>
  )
})

TextInputNode.displayName = "TextInputNode"

export default TextInputNode
