"use client"

import { useState, useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import UseCaseNode from "./nodes/UseCaseNode"
import TextInputNode from "./nodes/TextInputNode"
import ResultNode from "./nodes/ResultNode"

const nodeTypes = {
  useCase: UseCaseNode,
  textInput: TextInputNode,
  result: ResultNode,
}

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

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "use-case",
      type: "useCase",
      position: { x: 50, y: 150 },
      data: {
        onSelectUseCase: handleSelectUseCase,
        selectedUseCase: selectedUseCase?.id,
      },
    },
    {
      id: "text-input",
      type: "textInput",
      position: { x: 550, y: 150 },
      data: {
        basePrompt: selectedUseCase?.basePrompt || "",
        useCaseTitle: selectedUseCase?.title || "",
        useCaseId: selectedUseCase?.id,
        onSubmit: handleSubmit,
        disabled: !selectedUseCase,
        isLoading: isProcessing,
      },
    },
    {
      id: "result",
      type: "result",
      position: { x: 1080, y: 150 },
      data: {
        content: resultContent,
        isLoading: isProcessing,
        useCaseTitle: selectedUseCase?.title,
        onMintNFT: onMintNFT,
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([
    {
      id: "usecase-input",
      source: "use-case",
      target: "text-input",
      animated: true,
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

  // Update nodes when state changes using useEffect
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "use-case") {
          return {
            ...node,
            data: {
              ...node.data,
              onSelectUseCase: handleSelectUseCase,
              selectedUseCase: selectedUseCase?.id,
            },
          }
        }
        if (node.id === "text-input") {
          return {
            ...node,
            data: {
              ...node.data,
              basePrompt: selectedUseCase?.basePrompt || "",
              useCaseTitle: selectedUseCase?.title || "",
              useCaseId: selectedUseCase?.id,
              onSubmit: handleSubmit,
              disabled: !selectedUseCase,
              isLoading: isProcessing,
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
              useCaseTitle: selectedUseCase?.title,
              onMintNFT: onMintNFT,
            },
          }
        }
        return node
      })
    )

    // Update edge animation
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === "input-result") {
          return {
            ...edge,
            animated: isProcessing,
          }
        }
        return edge
      })
    )
  }, [selectedUseCase, isProcessing, resultContent, handleSelectUseCase, handleSubmit, setNodes, setEdges, onMintNFT])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Info Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">
          AI Brand Kit Flow
        </p>
        <p className="text-xs text-gray-600">
          Select Action -&gt; Add Context -&gt; Get Result
        </p>
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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="w-full h-full"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg" />
      </ReactFlow>
    </div>
  )
}
