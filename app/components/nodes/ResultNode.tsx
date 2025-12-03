"use client"

import { memo } from "react"
import { Handle, Position, Node } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Download, Wallet, Loader2, CheckCircle, FileText } from "lucide-react"

export interface ResultNodeData extends Record<string, unknown> {
  content: string
  isLoading: boolean
  selectedAction?: string | null
  onExportPDF: () => void
  onMintNFT: () => void
  isExporting: boolean
  authenticated: boolean
}

export type ResultNodeType = Node<ResultNodeData, "result">

const ResultNode = memo(({ data }: { data: ResultNodeData }) => {
  return (
    <div className="rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-xl p-6 min-w-[450px]">
      <Handle type="target" position={Position.Left} className="!bg-green-500" />

      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Generated Result
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {data.selectedAction === "image-prompt" 
              ? "AI Image Prompt Generated"
              : "Brand Case Study Generated"
            }
          </p>
        </div>

        <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
          {data.isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm text-gray-600">Generating your content...</p>
              </div>
            </div>
          ) : data.content ? (
            <div className="bg-white rounded-lg border border-green-200 p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {data.content}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="text-center text-gray-500">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No content generated yet</p>
                <p className="text-xs mt-1">Complete the input to generate results</p>
              </div>
            </div>
          )}
        </div>

        {data.content && !data.isLoading && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={data.onExportPDF}
                disabled={data.isExporting}
                variant="outline"
                size="sm"
                className="flex-1 border-green-200 hover:border-green-400 hover:bg-green-50"
              >
                {data.isExporting ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={14} className="mr-2" />
                    Export PDF
                  </>
                )}
              </Button>

              <Button
                onClick={data.onMintNFT}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {data.authenticated ? (
                  <>
                    <CheckCircle size={14} className="mr-2" />
                    MY ORIGIN
                  </>
                ) : (
                  <>
                    <Wallet size={14} className="mr-2" />
                    MY ORIGIN
                  </>
                )}
              </Button>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700">
                ✓ Content ready for export and minting
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {data.authenticated 
                  ? "Connect with MY ORIGIN to mint as NFT"
                  : "Click MY ORIGIN to connect wallet and mint"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ResultNode.displayName = "ResultNode"

export default ResultNode