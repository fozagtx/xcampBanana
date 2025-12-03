"use client"

import { useState, useCallback } from "react"
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
import { FileText, Sparkles, Image as ImageIcon, Code } from "lucide-react"
import jsPDF from "jspdf"

import ChatInputNode from "./nodes/ChatInputNode"
import ChatMessageNode from "./nodes/ChatMessageNode"

const nodeTypes = {
  chatInput: ChatInputNode,
  chatMessage: ChatMessageNode,
}

export default function TweetFlowDashboard() {
  const [tweetContent, setTweetContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "input-1",
      type: "chatInput",
      position: { x: 250, y: 200 },
      data: {
        onSubmit: (content: string) => handleTweetSubmit("input-1", content),
        placeholder: "Paste your tweet content here...",
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const handleTweetSubmit = useCallback(
    async (inputId: string, content: string) => {
      setTweetContent(content)
    },
    []
  )

  const analyzeTweet = useCallback(async () => {
    if (!tweetContent.trim()) {
      alert("Please paste tweet content first")
      return
    }

    setIsAnalyzing(true)

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
                  text: `Analyze this tweet and provide detailed insights:

Tweet: "${tweetContent}"

Provide:
1. Sentiment analysis
2. Key themes and topics
3. Potential engagement factors
4. Audience appeal
5. Suggestions for improvement`,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze tweet")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let analysisText = ""

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
                  analysisText += parsed.parts[0].text
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Create analysis node
      const analysisNodeId = `analysis-${Date.now()}`
      const inputNode = nodes.find((n) => n.type === "chatInput")

      if (inputNode) {
        const newAnalysisNode: Node = {
          id: analysisNodeId,
          type: "chatMessage",
          position: {
            x: inputNode.position.x + 500,
            y: inputNode.position.y,
          },
          data: {
            role: "assistant",
            content: analysisText.trim(),
            isLoading: false,
          },
        }

        setNodes((nds) => [...nds, newAnalysisNode])

        setEdges((eds) => [
          ...eds,
          {
            id: `input-${analysisNodeId}`,
            source: inputNode.id,
            target: analysisNodeId,
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          },
        ])
      }
    } catch (error) {
      console.error("Error analyzing tweet:", error)
      alert("Failed to analyze tweet. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [tweetContent, nodes, setNodes, setEdges])

  const generateImagePrompt = useCallback(async () => {
    if (!tweetContent.trim()) {
      alert("Please paste tweet content first")
      return
    }

    setIsAnalyzing(true)

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
                  text: `Generate a detailed image generation prompt for this tweet:

Tweet: "${tweetContent}"

Create a vivid, detailed prompt for AI image generation (like DALL-E, Midjourney, or Stable Diffusion) that would create an engaging visual to accompany this tweet. Include style, composition, colors, mood, and specific details.`,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image prompt")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let promptText = ""

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
                  promptText += parsed.parts[0].text
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Create prompt node
      const promptNodeId = `image-prompt-${Date.now()}`
      const inputNode = nodes.find((n) => n.type === "chatInput")

      if (inputNode) {
        const newPromptNode: Node = {
          id: promptNodeId,
          type: "chatMessage",
          position: {
            x: inputNode.position.x + 500,
            y: inputNode.position.y + 250,
          },
          data: {
            role: "assistant",
            content: `🎨 Image Prompt:\n\n${promptText.trim()}`,
            isLoading: false,
          },
        }

        setNodes((nds) => [...nds, newPromptNode])

        setEdges((eds) => [
          ...eds,
          {
            id: `input-${promptNodeId}`,
            source: inputNode.id,
            target: promptNodeId,
            animated: true,
            style: { stroke: "#ec4899", strokeWidth: 2 },
          },
        ])
      }
    } catch (error) {
      console.error("Error generating image prompt:", error)
      alert("Failed to generate image prompt. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [tweetContent, nodes, setNodes, setEdges])

  const generateJSONPrompt = useCallback(async () => {
    if (!tweetContent.trim()) {
      alert("Please paste tweet content first")
      return
    }

    setIsAnalyzing(true)

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
                  text: `Create a structured JSON prompt/template based on this tweet:

Tweet: "${tweetContent}"

Generate a JSON object that includes:
- tweet content
- suggested hashtags
- target audience
- best posting times
- engagement strategies
- content categories
- tone and style descriptors

Return a well-formatted JSON object.`,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate JSON prompt")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let jsonText = ""

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
                  jsonText += parsed.parts[0].text
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Create JSON node
      const jsonNodeId = `json-prompt-${Date.now()}`
      const inputNode = nodes.find((n) => n.type === "chatInput")

      if (inputNode) {
        const newJsonNode: Node = {
          id: jsonNodeId,
          type: "chatMessage",
          position: {
            x: inputNode.position.x + 500,
            y: inputNode.position.y + 500,
          },
          data: {
            role: "assistant",
            content: `📝 JSON Prompt:\n\n${jsonText.trim()}`,
            isLoading: false,
          },
        }

        setNodes((nds) => [...nds, newJsonNode])

        setEdges((eds) => [
          ...eds,
          {
            id: `input-${jsonNodeId}`,
            source: inputNode.id,
            target: jsonNodeId,
            animated: true,
            style: { stroke: "#10b981", strokeWidth: 2 },
          },
        ])
      }
    } catch (error) {
      console.error("Error generating JSON prompt:", error)
      alert("Failed to generate JSON prompt. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [tweetContent, nodes, setNodes, setEdges])

  const exportToPDF = useCallback(async () => {
    if (!tweetContent.trim()) {
      alert("No content to export")
      return
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      pdf.setFontSize(24)
      pdf.setFont("helvetica", "bold")
      pdf.text("Tweet Analysis Report", margin, yPosition)
      yPosition += 15

      // Date
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 20

      // Tweet Content Section
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(0, 0, 0)
      pdf.text("Tweet Content:", margin, yPosition)
      yPosition += 10

      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      const tweetLines = pdf.splitTextToSize(tweetContent, contentWidth)
      pdf.text(tweetLines, margin, yPosition)
      yPosition += tweetLines.length * 7 + 15

      // Add analysis results from nodes
      const analysisNodes = nodes.filter((n) => n.type === "chatMessage")
      
      for (const node of analysisNodes) {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.setFontSize(12)
        pdf.setFont("helvetica", "bold")
        pdf.text("Analysis:", margin, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        const contentLines = pdf.splitTextToSize(node.data.content, contentWidth)
        pdf.text(contentLines, margin, yPosition)
        yPosition += contentLines.length * 6 + 15
      }

      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(
        "Generated by xcampBanana - Personal Brand Kit",
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
      )

      pdf.save(`tweet-analysis-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    }
  }, [tweetContent, nodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={analyzeTweet}
          disabled={isAnalyzing || !tweetContent.trim()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Sparkles size={16} className="mr-2" />
          Analyze Tweet
        </Button>
        <Button
          onClick={generateImagePrompt}
          disabled={isAnalyzing || !tweetContent.trim()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <ImageIcon size={16} className="mr-2" />
          Image Prompt
        </Button>
        <Button
          onClick={generateJSONPrompt}
          disabled={isAnalyzing || !tweetContent.trim()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Code size={16} className="mr-2" />
          JSON Prompt
        </Button>
        <Button
          onClick={exportToPDF}
          disabled={!tweetContent.trim()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <FileText size={16} className="mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Info Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">
          📊 Tweet Analysis Flow
        </p>
        <p className="text-xs text-gray-600">
          Paste, Analyze & Export
        </p>
      </div>

      {/* React Flow Canvas - Full Page */}
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
        className="w-full h-full"
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
