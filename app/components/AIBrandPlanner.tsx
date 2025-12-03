"use client"

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import { DotsLoader } from "@/components/prompt-kit/loader"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import {
  AlertTriangle,
  ArrowUp,
  Copy,
  Download,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import { memo, useState } from "react"
import jsPDF from "jspdf"
import ResizableSidebar from "./ResizableSidebar"
import BrandAIFlowDashboard from "./BrandAIFlowDashboard"

type MessageComponentProps = {
  message: UIMessage
  isLastMessage: boolean
}

export const MessageComponent = memo(
  ({ message, isLastMessage }: MessageComponentProps) => {
    const isAssistant = message.role === "assistant"

    const copyToClipboard = () => {
      const text = message.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("")
      navigator.clipboard.writeText(text)
    }

    return (
      <Message
        className={cn(
          "flex w-full flex-col gap-2 px-2",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        {isAssistant ? (
          <div className="group flex w-full flex-col gap-0">
            <MessageContent
              className="text-foreground prose prose-sm w-full min-w-0 flex-1 rounded-lg bg-transparent p-0"
              markdown
            >
              {message.parts
                .map((part) => (part.type === "text" ? part.text : null))
                .join("")}
            </MessageContent>
            <MessageActions
              className={cn(
                "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                isLastMessage && "opacity-100"
              )}
            >
              <MessageAction tooltip="Copy" delayDuration={100}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </MessageAction>
              <MessageAction tooltip="Upvote" delayDuration={100}>
                <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              </MessageAction>
              <MessageAction tooltip="Downvote" delayDuration={100}>
                <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        ) : (
          <div className="group flex w-full flex-col items-end gap-1">
            <MessageContent className="bg-muted text-primary max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap text-sm">
              {message.parts
                .map((part) => (part.type === "text" ? part.text : null))
                .join("")}
            </MessageContent>
            <MessageActions
              className={cn(
                "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              )}
            >
              <MessageAction tooltip="Copy" delayDuration={100}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        )}
      </Message>
    )
  }
)

MessageComponent.displayName = "MessageComponent"

const LoadingMessage = memo(() => (
  <Message className="flex w-full flex-col items-start gap-2 px-2">
    <div className="group flex w-full flex-col gap-0">
      <div className="text-foreground prose prose-sm w-full min-w-0 flex-1 rounded-lg bg-transparent p-0">
        <DotsLoader />
      </div>
    </div>
  </Message>
))

LoadingMessage.displayName = "LoadingMessage"

const ErrorMessage = memo(({ error }: { error: Error }) => (
  <Message className="not-prose flex w-full flex-col items-start gap-2 px-2">
    <div className="group flex w-full flex-col items-start gap-0">
      <div className="text-primary flex min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border-2 border-red-300 bg-red-300/20 px-2 py-1">
        <AlertTriangle size={14} className="text-red-500" />
        <p className="text-red-500 text-xs">{error.message}</p>
      </div>
    </div>
  </Message>
))

ErrorMessage.displayName = "ErrorMessage"

export default function AIBrandPlanner() {
  const [input, setInput] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/primitives/chatbot",
    }),
  })

  const handleSubmit = () => {
    if (!input.trim()) return

    sendMessage({ text: input })
    setInput("")
  }

  const exportConversationToPDF = async () => {
    if (messages.length === 0) {
      alert("No conversation to export")
      return
    }

    setIsExporting(true)

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      pdf.setFontSize(22)
      pdf.setFont("helvetica", "bold")
      pdf.text("AI Brand Planner - Conversation Export", margin, yPosition)
      yPosition += 12

      // Date
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 15

      // Add each message
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const isUser = message.role === "user"
        const text = message.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")

        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = margin
        }

        // Role label
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        if (isUser) {
          pdf.setTextColor(59, 130, 246) // blue for user
        } else {
          pdf.setTextColor(34, 197, 94) // green for AI
        }
        pdf.text(isUser ? "You:" : "AI Brand Planner:", margin, yPosition)
        yPosition += 7

        // Message content
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(0, 0, 0)

        // Split text into lines
        const lines = pdf.splitTextToSize(text, contentWidth)

        // Check if all lines fit on current page
        const estimatedHeight = lines.length * 5 + 10
        if (yPosition + estimatedHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.text(lines, margin + 5, yPosition)
        yPosition += lines.length * 5 + 10
      }

      // Footer
      const pageCount = pdf.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        )
        pdf.text(
          "Generated by xcampBanana - AI Brand Kit Planner",
          margin,
          pageHeight - 10
        )
      }

      // Save PDF
      pdf.save(`brand-planner-conversation-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Resizable Sidebar with AI Chat */}
      <ResizableSidebar defaultWidth={400} minWidth={300} maxWidth={600}>
        <div className="flex h-full flex-col overflow-hidden bg-pink-50">
          {/* Header with export button */}
          <div className="border-b border-pink-100 bg-pink-50 px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    AI
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-bold text-gray-800">Relo</h2>
                    <span className="px-2 py-0.5 bg-white text-xs font-medium text-gray-700 rounded border border-gray-300">
                      AI
                    </span>
                  </div>
                </div>
                {messages.length > 0 && (
                  <Button
                    onClick={exportConversationToPDF}
                    disabled={isExporting}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 h-7 text-xs bg-white"
                  >
                    <Download size={14} />
                    {isExporting ? "..." : "PDF"}
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center font-medium">
                ideate viral
              </p>
            </div>
          </div>

          <ChatContainerRoot className="relative flex-1 space-y-0 overflow-y-auto">
            <ChatContainerContent className="space-y-6 px-3 py-6">
              {messages.length === 0 && (
                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-bold">
                    Welcome to Your AI Brand Kit Planner
                  </h3>
                  <p className="text-xs text-gray-600">
                    I can help you with:
                  </p>
                  <div className="grid gap-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-left">
                      <h4 className="mb-1 font-semibold text-sm">Brand Case Studies</h4>
                      <p className="text-xs text-gray-600">
                        Generate detailed case studies with viral strategies
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-left">
                      <h4 className="mb-1 font-semibold text-sm">Image Prompts</h4>
                      <p className="text-xs text-gray-600">
                        Create JSON context prompts for AI image generation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1

                return (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isLastMessage={isLastMessage}
                  />
                )
              })}

              {status === "submitted" && <LoadingMessage />}
              {status === "error" && error && <ErrorMessage error={error} />}
            </ChatContainerContent>
          </ChatContainerRoot>

          <div className="shrink-0 px-4 pb-4 bg-pink-50">
            <PromptInput
              isLoading={status !== "ready"}
              value={input}
              onValueChange={setInput}
              onSubmit={handleSubmit}
              className="border-input bg-white relative z-10 w-full rounded-3xl border border-gray-300 p-0 pt-1 shadow-md"
            >
              <div className="flex flex-col">
                <PromptInputTextarea
                  placeholder="Ask the AI agent..."
                  className="min-h-[44px] pt-3 pl-4 text-sm leading-[1.3]"
                />

                <PromptInputActions className="mt-2 flex w-full items-center justify-between gap-2 p-2 pr-3">
                  <div />
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      disabled={
                        !input.trim() || (status !== "ready" && status !== "error")
                      }
                      onClick={handleSubmit}
                      className="size-9 rounded-full bg-purple-700 hover:bg-purple-800"
                    >
                      {status === "ready" || status === "error" ? (
                        <ArrowUp size={18} />
                      ) : (
                        <span className="size-3 rounded-xs bg-white" />
                      )}
                    </Button>
                  </div>
                </PromptInputActions>
              </div>
            </PromptInput>
          </div>
        </div>
      </ResizableSidebar>

      {/* ReactFlow Dashboard */}
      <div className="flex-1 h-full">
        <BrandAIFlowDashboard />
      </div>
    </div>
  )
}
