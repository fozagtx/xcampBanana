"use client"

import { useState, useCallback } from "react"
import UseCaseNode from "./nodes/UseCaseNode"
import TextInputNode from "./nodes/TextInputNode"
import ResultNode from "./nodes/ResultNode"

interface UseCase {
  id: string
  title: string
  description: string
  basePrompt: string
  icon: string
}

interface TweetFlowDashboardProps {
  onMintNFT?: (content: string) => void
}

export default function TweetFlowDashboard({ onMintNFT }: TweetFlowDashboardProps) {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultContent, setResultContent] = useState("")

  const handleSelectUseCase = useCallback((useCase: UseCase) => {
    setSelectedUseCase(useCase)
    setResultContent("") // Clear previous result when selecting new use case
  }, [])

  const handleSubmit = useCallback(async (fullPrompt: string) => {
    setIsProcessing(true)
    setResultContent("")

    try {
      const response = await fetch("/api/primitives/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              parts: [
                {
                  type: "text",
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || "Failed to generate result"
        console.error("API Error:", errorMessage)
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let resultText = ""

      if (reader) {
        console.log("Starting to read stream...")
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("Stream reading completed. Final text length:", resultText.length)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || ""

          for (const line of lines) {
            console.log("Processing line:", line.substring(0, 100))

            // Handle AI SDK v5 SSE format: lines starting with "data: "
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.slice(6) // Remove "data: " prefix

                // Skip heartbeat messages
                if (jsonStr.trim() === "[DONE]" || jsonStr.trim() === "") {
                  continue
                }

                const parsed = JSON.parse(jsonStr)
                console.log("Parsed message type:", parsed.type)

                // Handle text delta events from AI SDK v5
                if (parsed.type === "text-delta" && parsed.textDelta) {
                  resultText += parsed.textDelta
                  setResultContent(resultText)
                  console.log("Added text delta, total length:", resultText.length)
                }
                // Handle legacy "0:" format for backwards compatibility
                else if (parsed.parts && parsed.parts[0] && parsed.parts[0].text) {
                  resultText += parsed.parts[0].text
                  setResultContent(resultText)
                  console.log("Added text from parts, total length:", resultText.length)
                }
              } catch (e) {
                console.warn("Failed to parse stream line:", line.substring(0, 100), e)
              }
            }
            // Handle old "0:" format if present
            else if (line.startsWith("0:")) {
              try {
                const jsonStr = line.slice(2)
                const parsed = JSON.parse(jsonStr)
                if (parsed.parts && parsed.parts[0] && parsed.parts[0].text) {
                  resultText += parsed.parts[0].text
                  setResultContent(resultText)
                  console.log("Added text from 0: format, total length:", resultText.length)
                }
              } catch (e) {
                console.warn("Failed to parse 0: format line:", e)
              }
            }
          }
        }
      } else {
        console.error("No reader available from response body")
        throw new Error("Unable to read response stream")
      }

      if (resultText.trim() === "") {
        console.error("No content was extracted from the stream!")
        throw new Error("No content was generated. This might be a parsing issue or empty response from the API.")
      }

      setResultContent(resultText.trim())
    } catch (error) {
      console.error("Error generating result:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setResultContent(`❌ Error: ${errorMessage}\n\nPlease check:\n1. OpenAI API key is configured (OPENAI_API_KEY environment variable)\n2. You have sufficient API credits\n3. Your internet connection is stable\n\nTry again or contact support if the issue persists.`)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-auto">
      {/* Info Badge */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-6 py-4 border border-gray-200">
          <p className="text-lg font-semibold text-gray-700">
            AI Brand Kit Flow
          </p>
          <p className="text-sm text-gray-600">
            Select Action → Add Context → Get Result
          </p>
        </div>

        {/* Horizontal Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Use Case Selection Card */}
          <div className="lg:col-span-1">
            <UseCaseNode
              data={{
                onSelectUseCase: handleSelectUseCase,
                selectedUseCase: selectedUseCase?.id,
              }}
            />
          </div>

          {/* Text Input Card */}
          <div className="lg:col-span-1">
            <TextInputNode
              data={{
                basePrompt: selectedUseCase?.basePrompt || "",
                useCaseTitle: selectedUseCase?.title || "",
                useCaseId: selectedUseCase?.id,
                onSubmit: handleSubmit,
                disabled: !selectedUseCase,
                isLoading: isProcessing,
              }}
            />
          </div>

          {/* Result Card */}
          <div className="lg:col-span-1">
            <ResultNode
              data={{
                content: resultContent,
                isLoading: isProcessing,
                useCaseTitle: selectedUseCase?.title,
                onMintNFT: onMintNFT ? () => onMintNFT(resultContent) : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
