"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2 } from "lucide-react"
import jsPDF from "jspdf"
import { useAuth, useAuthState, CampModal } from "@campnetwork/origin/react"

import PlaceholderNode from "./nodes/PlaceholderNode"
import TextInputNode from "./nodes/TextInputNode"
import ResultNode from "./nodes/ResultNode"
import HelpNode from "./nodes/HelpNode"

export default function BrandAIFlowDashboard() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [resultContent, setResultContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const { authenticated } = useAuthState()
  const auth = useAuth()

  const handleSelectAction = useCallback((action: string) => {
    setSelectedAction(action)
    setResultContent("")
    setInputText("")
  }, [])

  const handleToggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev)
  }, [])

  const handleCloseHelp = useCallback(() => {
    setShowHelp(false)
  }, [])

  const handleSubmit = useCallback(async (text: string) => {
    if (!text.trim() || !selectedAction) return

    setIsProcessing(true)
    setResultContent("")

    try {
      let prompt = ""
      if (selectedAction === "image-prompt") {
        prompt = `Generate a detailed, vivid image generation prompt for AI art tools (DALL-E, Midjourney, Stable Diffusion). Include style, composition, colors, mood, lighting, and specific visual details. Create an image of: ${text}`
      } else {
        prompt = `Create a comprehensive brand case study analyzing the following brand/product. Include: target audience analysis, unique value proposition, viral marketing strategies, content pillars, and growth tactics. Brand/Product: ${text}`
      }

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
                  text: prompt,
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
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("Stream reading completed")
            break
          }

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const jsonStr = line.slice(2)
                const parsed = JSON.parse(jsonStr)
                if (parsed.parts && parsed.parts[0] && parsed.parts[0].text) {
                  resultText += parsed.parts[0].text
                  setResultContent(resultText)
                  console.log("Accumulated text length:", resultText.length)
                }
              } catch (e) {
                console.warn("Failed to parse stream line:", e)
              }
            }
          }
        }
      } else {
        console.error("No reader available from response body")
      }

      setResultContent(resultText.trim())
    } catch (error) {
      console.error("Error generating result:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setResultContent(`❌ Error: ${errorMessage}\n\nPlease check:\n1. OpenAI API key is configured (OPENAI_API_KEY environment variable)\n2. You have sufficient API credits\n3. Your internet connection is stable\n\nTry again or contact support if the issue persists.`)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedAction])

  const handleMintNFT = useCallback(async () => {
    if (!authenticated) {
      auth?.connect()
      return
    }

    if (!resultContent) {
      alert("No content to mint")
      return
    }

    if (!auth?.origin) {
      alert("Origin SDK not initialized")
      return
    }

    try {
      // Create a text file from the content
      const fileName = selectedAction === "image-prompt" ? "ai-image-prompt" : "brand-case-study"
      const contentName = selectedAction === "image-prompt" ? "AI Image Prompt" : "Brand Case Study"

      const fileContent = JSON.stringify({
        type: contentName,
        content: resultContent,
        generatedAt: new Date().toISOString(),
        action: selectedAction
      }, null, 2)

      const blob = new Blob([fileContent], { type: "application/json" })
      const file = new File([blob], `${fileName}-${Date.now()}.json`, { type: "application/json" })

      // Set default licensing terms
      const license = {
        price: BigInt("1000000000000000"), // 0.001 CAMP in wei
        duration: 86400, // 1 day in seconds
        royaltyBps: 1000, // 10% in basis points
        paymentToken: "0x0000000000000000000000000000000000000000" as const,
      }

      const metadata = {
        name: `${contentName} - AI Generated`,
        description: `AI-generated ${contentName.toLowerCase()} from xCampBanana Brand Kit`,
        price: 0.001,
        duration: 1,
        royalty: 10,
      }

      const result = await auth.origin.mintFile(file, metadata, license)

      alert(`Successfully minted! Token ID: ${result}\n\nPrice: 0.001 CAMP\nDuration: 1 day\nRoyalty: 10%`)
    } catch (error) {
      console.error("Minting error:", error)
      alert(`Failed to mint: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }, [authenticated, auth, resultContent, selectedAction])

  const exportToPDF = useCallback(async () => {
    if (!resultContent) {
      alert("No content to export")
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
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text(selectedAction === "image-prompt" ? "AI Image Prompt" : "Brand Case Study", margin, yPosition)
      yPosition += 12

      // Date
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 15

      // Content
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(0, 0, 0)

      const lines = pdf.splitTextToSize(resultContent, contentWidth)
      const estimatedHeight = lines.length * 5 + 10
      if (yPosition + estimatedHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.text(lines, margin, yPosition)

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

      pdf.save(
        `${selectedAction === "image-prompt" ? "image-prompt" : "brand-case-study"}-${new Date().toISOString().split("T")[0]}.pdf`
      )
    } catch (error) {
      console.error("PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [resultContent, selectedAction])

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      } bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-auto`}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {resultContent && (
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <Download size={16} className="mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        )}
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          {isFullscreen ? (
            <Minimize2 size={16} />
          ) : (
            <Maximize2 size={16} />
          )}
        </Button>
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-md">
          <CampModal />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 pt-20">
        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Selection Card */}
          <div className="lg:col-span-1">
            <PlaceholderNode
              data={{
                onSelectAction: handleSelectAction,
                selectedAction: selectedAction,
                onToggleHelp: handleToggleHelp,
              }}
            />
          </div>

          {/* Text Input Card */}
          <div className="lg:col-span-1">
            <TextInputNode
              data={{
                value: inputText,
                onChange: setInputText,
                onSubmit: handleSubmit,
                disabled: !selectedAction || isProcessing,
                isLoading: isProcessing,
                selectedAction,
              }}
            />
          </div>

          {/* Result Card */}
          <div className="lg:col-span-1">
            <ResultNode
              data={{
                content: resultContent,
                isLoading: isProcessing,
                selectedAction,
                onExportPDF: exportToPDF,
                onMintNFT: handleMintNFT,
                isExporting,
                authenticated,
              }}
            />
          </div>
        </div>

        {/* Help Card (appears below when toggled) */}
        {showHelp && (
          <div className="mt-6">
            <HelpNode
              data={{
                onClose: handleCloseHelp,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
