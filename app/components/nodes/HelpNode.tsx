"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { X, HelpCircle, ArrowRight, Zap, FileText, Image as ImageIcon, Download, Wallet } from "lucide-react"

export interface HelpNodeData extends Record<string, unknown> {
  onClose: () => void
}

const HelpNode = memo(({ data }: { data: HelpNodeData }) => {
  return (
    <div className="rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-xl p-6 w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-green-600" size={20} />
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              How to Use AI Brand Kit
            </h3>
          </div>
          <Button
            onClick={data.onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold">1</span>
              Choose Your Action
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Select what you want to create from the first card:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon size={16} className="text-orange-500" />
                <span><strong>AI Image Prompt:</strong> Generate detailed prompts for AI image generation tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-orange-500" />
                <span><strong>Brand Case Study:</strong> Create comprehensive brand analysis and strategies</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold">2</span>
              Add Your Input
            </h4>
            <p className="text-sm text-gray-600">
              Enter your requirements in the text input card:
            </p>
            <ul className="text-sm text-gray-600 ml-4 mt-2 space-y-1">
              <li>• For <strong>Image Prompts:</strong> Describe the image you want to generate</li>
              <li>• For <strong>Case Studies:</strong> Enter the brand or product name</li>
              <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> or click Generate</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-green-200 p-4">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-bold">3</span>
              Get Results & Export
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Once your content is generated, you can:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-center gap-2 text-sm">
                <Download size={16} className="text-green-500" />
                <span><strong>Export PDF:</strong> Download your content as a PDF file</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wallet size={16} className="text-purple-500" />
                <span><strong>MY ORIGIN:</strong> Mint your content as an NFT on the blockchain</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-purple-600" />
              Pro Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Be specific in your input for better results</li>
              <li>• Use the fullscreen mode for better visibility</li>
              <li>• All generated content can be minted as NFTs</li>
              <li>• PDF exports include timestamps and formatting</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={data.onClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Got it! Let&apos;s start
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

HelpNode.displayName = "HelpNode"

export default HelpNode
