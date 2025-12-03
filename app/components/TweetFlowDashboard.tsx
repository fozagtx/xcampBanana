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
        throw new Error("Failed to generate result")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let resultText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const jsonStr = line.slice(2)
                const parsed = JSON.parse(jsonStr)
                if (parsed.parts && parsed.parts[0] && parsed.parts[0].text) {
                  resultText += parsed.parts[0].text
                  // Update result in real-time
                  setResultContent(resultText)
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      setResultContent(resultText.trim())
    } catch (error) {
      console.error("Error generating result:", error)
      setResultContent("Error: Failed to generate result. Please try again.")
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
                onMintNFT: onMintNFT,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
