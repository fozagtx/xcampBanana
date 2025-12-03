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
import { Maximize2, Minimize2, PlusCircle } from "lucide-react"

import TweetWriterNode from "./nodes/TweetWriterNode"
import ChatMessageNode from "./nodes/ChatMessageNode"

const nodeTypes = {
  tweetWriter: TweetWriterNode,
  chatMessage: ChatMessageNode,
}

interface GeneratedTweet {
  id: string
  prompt: string
  tweet: string
}

export default function TweetFlowDashboard() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "writer-1",
      type: "tweetWriter",
      position: { x: 100, y: 200 },
      data: {
        onGenerateTweet: (prompt: string) => handleGenerateTweet("writer-1", prompt),
        isGenerating: false,
      },
    },
  ])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const handleGenerateTweet = useCallback(
    async (writerId: string, prompt: string) => {
      setIsGenerating(true)

      // Update the node to show generating state
      setNodes((nds) =>
        nds.map((node) =>
          node.id === writerId
            ? { ...node, data: { ...node.data, isGenerating: true } }
            : node
        )
      )

      try {
        // Call AI API to generate tweet
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
                    text: `You are a viral tweet writer. Create a single engaging, concise tweet (max 280 characters) about: ${prompt}.

Rules:
- Keep it under 280 characters
- Make it engaging and authentic
- Use relevant hashtags sparingly (1-2 max)
- No quotation marks around the tweet
- Return ONLY the tweet text, nothing else`,
                  },
                ],
              },
            ],
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate tweet")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let tweetText = ""

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
                    tweetText += parsed.parts[0].text
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        const generatedTweet: GeneratedTweet = {
          id: `tweet-${Date.now()}`,
          prompt,
          tweet: tweetText.trim(),
        }

        setGeneratedTweets((prev) => [...prev, generatedTweet])

        // Update writer node with generated tweet
        setNodes((nds) =>
          nds.map((node) =>
            node.id === writerId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    generatedTweet: tweetText.trim(),
                    isGenerating: false,
                  },
                }
              : node
          )
        )

        // Create a message node to show the generated tweet
        const messageNodeId = `message-${generatedTweet.id}`
        const writerNode = nodes.find((n) => n.id === writerId)

        if (writerNode) {
          const newMessageNode: Node = {
            id: messageNodeId,
            type: "chatMessage",
            position: {
              x: writerNode.position.x + 500,
              y: writerNode.position.y,
            },
            data: {
              role: "assistant",
              content: tweetText.trim(),
              isLoading: false,
            },
          }

          setNodes((nds) => [...nds, newMessageNode])

          // Create edge from writer to message
          setEdges((eds) => [
            ...eds,
            {
              id: `${writerId}-${messageNodeId}`,
              source: writerId,
              target: messageNodeId,
              animated: true,
              style: { stroke: "#3b82f6", strokeWidth: 2 },
            },
          ])
        }
      } catch (error) {
        console.error("Error generating tweet:", error)
        setNodes((nds) =>
          nds.map((node) =>
            node.id === writerId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    generatedTweet: "Error generating tweet. Please try again.",
                    isGenerating: false,
                  },
                }
              : node
          )
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [nodes, setNodes, setEdges]
  )

  const addNewWriter = useCallback(() => {
    const newId = `writer-${Date.now()}`
    const newNode: Node = {
      id: newId,
      type: "tweetWriter",
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        onGenerateTweet: (prompt: string) => handleGenerateTweet(newId, prompt),
        isGenerating: false,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [handleGenerateTweet, setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      } bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={addNewWriter}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Writer
        </Button>
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

      {/* Info Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">
          ✍️ Tweet Writer Flow
        </p>
        <p className="text-xs text-gray-600">
          {generatedTweets.length} tweet{generatedTweets.length !== 1 ? "s" : ""} generated
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
