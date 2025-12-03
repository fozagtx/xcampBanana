"use client"

import { memo } from "react"
import { MessageContent } from "@/components/prompt-kit/message"
import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { DotsLoader } from "@/components/prompt-kit/loader"

export interface ChatMessageNodeData extends Record<string, unknown> {
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

const ChatMessageNode = memo(({ data }: { data: ChatMessageNodeData }) => {
  const isAssistant = data.role === "assistant"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.content)
  }

  return (
    <div
      className={`rounded-xl border-2 shadow-xl p-4 min-w-[400px] max-w-[600px] ${
        isAssistant
          ? "border-green-400 bg-gradient-to-br from-green-50 to-white"
          : "border-blue-400 bg-gradient-to-br from-blue-50 to-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3
          className={`text-sm font-semibold ${
            isAssistant ? "text-green-700" : "text-blue-700"
          }`}
        >
          {isAssistant ? "🤖 AI Brand Planner" : "👤 You"}
        </h3>
        {!data.isLoading && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={copyToClipboard}
              title="Copy"
            >
              <Copy size={14} />
            </Button>
            {isAssistant && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  title="Upvote"
                >
                  <ThumbsUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  title="Downvote"
                >
                  <ThumbsDown size={14} />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        {data.isLoading ? (
          <DotsLoader />
        ) : isAssistant ? (
          <MessageContent markdown className="text-gray-800">
            {data.content}
          </MessageContent>
        ) : (
          <div className="whitespace-pre-wrap text-gray-800">{data.content}</div>
        )}
      </div>
    </div>
  )
})

ChatMessageNode.displayName = "ChatMessageNode"

export default ChatMessageNode
