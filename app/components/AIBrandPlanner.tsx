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
          "mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 md:px-10",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        {isAssistant ? (
          <div className="group flex w-full flex-col gap-0">
            <MessageContent
              className="text-foreground prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0"
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
                  className="rounded-full"
                  onClick={copyToClipboard}
                >
                  <Copy />
                </Button>
              </MessageAction>
              <MessageAction tooltip="Upvote" delayDuration={100}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ThumbsUp />
                </Button>
              </MessageAction>
              <MessageAction tooltip="Downvote" delayDuration={100}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ThumbsDown />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        ) : (
          <div className="group flex w-full flex-col items-end gap-1">
            <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
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
                  className="rounded-full"
                  onClick={copyToClipboard}
                >
                  <Copy />
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
  <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-0 md:px-10">
    <div className="group flex w-full flex-col gap-0">
      <div className="text-foreground prose w-full min-w-0 flex-1 rounded-lg bg-transparent p-0">
        <DotsLoader />
      </div>
    </div>
  </Message>
))

LoadingMessage.displayName = "LoadingMessage"

const ErrorMessage = memo(({ error }: { error: Error }) => (
  <Message className="not-prose mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-0 md:px-10">
    <div className="group flex w-full flex-col items-start gap-0">
      <div className="text-primary flex min-w-0 flex-1 flex-row items-center gap-2 rounded-lg border-2 border-red-300 bg-red-300/20 px-2 py-1">
        <AlertTriangle size={16} className="text-red-500" />
        <p className="text-red-500">{error.message}</p>
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
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header with export button */}
      <div className="border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">AI Personal Brand Kit Planner</h2>
            <p className="text-sm text-gray-600">
              Generate case studies, image prompts, and viral content strategies
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              onClick={exportConversationToPDF}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          )}
        </div>
      </div>

      <ChatContainerRoot className="relative flex-1 space-y-0 overflow-y-auto">
        <ChatContainerContent className="space-y-12 px-4 py-12">
          {messages.length === 0 && (
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              <h3 className="text-2xl font-bold">
                Welcome to Your AI Brand Kit Planner
              </h3>
              <p className="text-gray-600">
                I can help you with:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
                  <h4 className="mb-2 font-semibold">Brand Case Studies</h4>
                  <p className="text-sm text-gray-600">
                    Generate detailed case studies with viral strategies and
                    best practices
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
                  <h4 className="mb-2 font-semibold">Image Prompts</h4>
                  <p className="text-sm text-gray-600">
                    Create JSON context prompts for AI image generation tools
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
                  <h4 className="mb-2 font-semibold">Tweet Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Analyze tweet virality and get engagement insights
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-left">
                  <h4 className="mb-2 font-semibold">Trend Research</h4>
                  <p className="text-sm text-gray-600">
                    Search current trends and successful content strategies
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Try: &quot;Generate a case study about tech influencer growth&quot; or
                &quot;Create an image prompt for a professional brand logo&quot;
              </p>
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

      <div className="inset-x-0 bottom-0 mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <PromptInput
          isLoading={status !== "ready"}
          value={input}
          onValueChange={setInput}
          onSubmit={handleSubmit}
          className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
        >
          <div className="flex flex-col">
            <PromptInputTextarea
              placeholder="Ask me to generate case studies, image prompts, or analyze content..."
              className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            />

            <PromptInputActions className="mt-3 flex w-full items-center justify-between gap-2 p-2">
              <div />
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  disabled={
                    !input.trim() || (status !== "ready" && status !== "error")
                  }
                  onClick={handleSubmit}
                  className="size-9 rounded-full"
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
  )
}
