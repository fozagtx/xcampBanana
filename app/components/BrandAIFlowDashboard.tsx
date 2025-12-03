"use client"

import { useState, useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2 } from "lucide-react"
import jsPDF from "jspdf"
import { useAuth, useAuthState } from "@campnetwork/origin/react"

import PlaceholderNode from "./nodes/PlaceholderNode"
import TextInputNode from "./nodes/TextInputNode"
import ResultNode from "./nodes/ResultNode"
import HelpNode from "./nodes/HelpNode"

const nodeTypes = {
  placeholder: PlaceholderNode,
  textInput: TextInputNode,
  result: ResultNode,
  help: HelpNode,
}

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

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "placeholder",
      type: "placeholder",
      position: { x: 50, y: 200 },
      data: {
        onSelectAction: handleSelectAction,
        selectedAction: null,
        onToggleHelp: handleToggleHelp,
      },
    },
    {
      id: "text-input",
      type: "textInput",
      position: { x: 450, y: 200 },
      data: {
        value: inputText,
        onChange: setInputText,
        onSubmit: handleSubmit,
        disabled: !selectedAction || isProcessing,
        isLoading: isProcessing,
        selectedAction,
      },
    },
    {
      id: "result",
      type: "result",
      position: { x: 850, y: 200 },
      data: {
        content: resultContent,
        isLoading: isProcessing,
        selectedAction,
        onExportPDF: exportToPDF,
        onMintNFT: handleMintNFT,
        isExporting,
        authenticated,
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: "placeholder-input",
      source: "placeholder",
      target: "text-input",
      animated: !!selectedAction,
      style: { stroke: "#f97316", strokeWidth: 2 },
    },
    {
      id: "input-result",
      source: "text-input",
      target: "result",
      animated: isProcessing,
      style: { stroke: "#8b5cf6", strokeWidth: 2 },
    },
  ])

  // Add help node when showHelp is true
  useEffect(() => {
    if (showHelp) {
      const helpNode: Node = {
        id: "help",
        type: "help",
        position: { x: 50, y: 450 },
        data: {
          onClose: handleCloseHelp,
        },
      }

      setNodes((prev) => {
        // Check if help node already exists to avoid duplicate adds
        if (prev.some((node) => node.id === "help")) {
          return prev
        }
        return [...prev, helpNode]
      })
      
      // Add edge from placeholder to help
      setEdges((prev) => {
        // Check if edge already exists to avoid duplicate adds
        if (prev.some((edge) => edge.id === "placeholder-help")) {
          return prev
        }
        return [
          ...prev,
          {
            id: "placeholder-help",
            source: "placeholder",
            target: "help",
            animated: true,
            style: { stroke: "#22c55e", strokeWidth: 2 },
          },
        ]
      })
    } else {
      setNodes((prev) => prev.filter((node) => node.id !== "help"))
      setEdges((prev) => prev.filter((edge) => edge.id !== "placeholder-help"))
    }
  }, [showHelp, handleCloseHelp, setNodes, setEdges])

  // Update nodes when state changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "placeholder") {
          return {
            ...node,
            data: {
              ...node.data,
              onSelectAction: handleSelectAction,
              selectedAction,
              onToggleHelp: handleToggleHelp,
            },
          }
        }
        if (node.id === "text-input") {
          return {
            ...node,
            data: {
              ...node.data,
              value: inputText,
              onChange: setInputText,
              onSubmit: handleSubmit,
              disabled: !selectedAction || isProcessing,
              isLoading: isProcessing,
              selectedAction,
            },
          }
        }
        if (node.id === "result") {
          return {
            ...node,
            data: {
              ...node.data,
              content: resultContent,
              isLoading: isProcessing,
              selectedAction,
              onExportPDF: exportToPDF,
              onMintNFT: handleMintNFT,
              isExporting,
              authenticated,
            },
          }
        }
        return node
      })
    )

    // Update edge animation
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === "placeholder-input") {
          return {
            ...edge,
            animated: !!selectedAction,
          }
        }
        if (edge.id === "input-result") {
          return {
            ...edge,
            animated: isProcessing,
          }
        }
        return edge
      })
    )
  }, [selectedAction, inputText, resultContent, isProcessing, isExporting, authenticated, handleSelectAction, handleSubmit, exportToPDF, handleMintNFT, handleToggleHelp, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      } bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50`}
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
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-white/80 backdrop-blur-sm"
        />
      </ReactFlow>
    </div>
  )
}