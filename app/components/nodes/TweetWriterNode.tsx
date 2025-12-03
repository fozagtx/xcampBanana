"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Copy, Check } from "lucide-react"

interface TweetWriterNodeData {
  onGenerateTweet: (prompt: string) => void
  generatedTweet?: string
  isGenerating?: boolean
}

export default function TweetWriterNode({
  data,
}: {
  data: TweetWriterNodeData
}) {
  const [prompt, setPrompt] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (prompt.trim() && data.onGenerateTweet) {
      data.onGenerateTweet(prompt)
    }
  }

  const handleCopy = async () => {
    if (data.generatedTweet) {
      await navigator.clipboard.writeText(data.generatedTweet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleGenerate()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-400 p-6 min-w-[350px] max-w-[450px]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-blue-600" size={20} />
          <h3 className="font-bold text-lg text-blue-900">Tweet Writer</h3>
        </div>
        <p className="text-sm text-gray-600">
          Generate viral tweets with AI
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to tweet about?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="E.g., Share an insight about web3 development..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={data.isGenerating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Ctrl+Enter to generate
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || data.isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
        >
          {data.isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Generate Tweet
            </>
          )}
        </Button>

        {data.generatedTweet && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Generated Tweet
              </span>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {data.generatedTweet}
            </p>
            <div className="mt-2 text-xs text-gray-600">
              {data.generatedTweet.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
