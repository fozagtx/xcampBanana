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
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2 } from "lucide-react"
import jsPDF from "jspdf"

import ChatInputNode from "./nodes/ChatInputNode"
import ChatMessageNode from "./nodes/ChatMessageNode"
import WelcomeNode from "./nodes/WelcomeNode"

const nodeTypes = {
  chatInput: ChatInputNode,
  chatMessage: ChatMessageNode,
  welcome: WelcomeNode,
}

export default function BrandAIFlowDashboard() {
  const [input, setInput] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/primitives/chatbot",
    }),
  })

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return

    sendMessage({ text: input })
    setInput("")
  }, [input, sendMessage])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "welcome",
      type: "welcome",
      position: { x: 50, y: 200 },
      data: {},
    },
    {
      id: "input",
      type: "chatInput",
      position: { x: 650, y: 200 },
      data: {
        value: input,
        onChange: setInput,
        onSubmit: handleSubmit,
        disabled: status !== "ready" && status !== "error",
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: "welcome-input",
      source: "welcome",
      target: "input",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2 },
    },
  ])

  // Update nodes when messages change
  useEffect(() => {
    const welcomeNode: Node = {
      id: "welcome",
      type: "welcome",
      position: { x: 50, y: 200 },
      data: {},
    }

    const inputNode: Node = {
      id: "input",
      type: "chatInput",
      position: { x: 650, y: 200 },
      data: {
        value: input,
        onChange: setInput,
        onSubmit: handleSubmit,
        disabled: status !== "ready" && status !== "error",
      },
    }

    if (messages.length === 0) {
      setNodes([welcomeNode, inputNode])
      setEdges([
        {
          id: "welcome-input",
          source: "welcome",
          target: "input",
          animated: true,
          style: { stroke: "#f97316", strokeWidth: 2 },
        },
      ])
      return
    }

    const messageNodes: Node[] = []
    const messageEdges: Edge[] = []
    let yPosition = 100

    messages.forEach((message, index) => {
      const nodeId = `message-${index}`
      const isUser = message.role === "user"
      const content = message.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("")

      messageNodes.push({
        id: nodeId,
        type: "chatMessage",
        position: { x: 1200 + (index % 2) * 50, y: yPosition },
        data: {
          role: message.role,
          content,
          isLoading: false,
        },
      })

      // Connect input to first message
      if (index === 0) {
        messageEdges.push({
          id: `input-${nodeId}`,
          source: "input",
          target: nodeId,
          animated: true,
          style: {
            stroke: isUser ? "#3b82f6" : "#22c55e",
            strokeWidth: 2,
          },
        })
      }

      // Connect previous message to current message
      if (index > 0) {
        messageEdges.push({
          id: `message-${index - 1}-${nodeId}`,
          source: `message-${index - 1}`,
          target: nodeId,
          animated: true,
          style: {
            stroke: isUser ? "#3b82f6" : "#22c55e",
            strokeWidth: 2,
          },
        })
      }

      yPosition += 250
    })

    // Add loading node if status is submitted
    if (status === "submitted") {
      const loadingNodeId = `message-${messages.length}`
      messageNodes.push({
        id: loadingNodeId,
        type: "chatMessage",
        position: {
          x: 1200 + (messages.length % 2) * 50,
          y: yPosition,
        },
        data: {
          role: "assistant",
          content: "",
          isLoading: true,
        },
      })

      messageEdges.push({
        id: `message-${messages.length - 1}-${loadingNodeId}`,
        source: `message-${messages.length - 1}`,
        target: loadingNodeId,
        animated: true,
        style: { stroke: "#22c55e", strokeWidth: 2 },
      })
    }

    setNodes([welcomeNode, inputNode, ...messageNodes])
    setEdges([
      {
        id: "welcome-input",
        source: "welcome",
        target: "input",
        animated: true,
        style: { stroke: "#f97316", strokeWidth: 2 },
      },
      ...messageEdges,
    ])
  }, [messages, input, status, handleSubmit, setInput, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

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

        const lines = pdf.splitTextToSize(text, contentWidth)
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

      pdf.save(
        `brand-planner-conversation-${new Date().toISOString().split("T")[0]}.pdf`
      )
    } catch (error) {
      console.error("PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      } bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50`}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {messages.length > 0 && (
          <Button
            onClick={exportConversationToPDF}
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

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-10">
          <p className="font-semibold">Error: {error.message}</p>
        </div>
      )}
    </div>
  )
}
