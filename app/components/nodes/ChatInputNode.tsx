"use client"

import { memo } from "react"
import { Handle, Position, Node } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export interface ChatInputNodeData extends Record<string, unknown> {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export type ChatInputNodeType = Node<ChatInputNodeData, "chatInput">

const ChatInputNode = memo(({ data }: { data: ChatInputNodeData }) => {
  return (
    <div className="rounded-xl border-2 border-purple-400 bg-white shadow-xl p-4 min-w-[400px]">
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />

      <div className="mb-2">
        <h3 className="text-sm font-semibold text-purple-700">Your Message</h3>
      </div>

      <div className="flex gap-2">
        <textarea
          value={data.value}
          onChange={(e) => data.onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              data.onSubmit()
            }
          }}
          placeholder="Ask me to generate case studies, image prompts, or analyze content..."
          className="flex-1 min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={data.disabled}
        />
        <Button
          onClick={data.onSubmit}
          disabled={!data.value.trim() || data.disabled}
          className="self-end h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700"
          size="icon"
        >
          <ArrowUp size={18} />
        </Button>
      </div>
    </div>
  )
})

ChatInputNode.displayName = "ChatInputNode"

export default ChatInputNode
