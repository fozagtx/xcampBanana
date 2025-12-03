'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Trash2 } from 'lucide-react';

interface ScriptInputNodeData {
  script: string;
  charCount: number;
  wordCount: number;
  onScriptChange?: (script: string) => void;
  onDelete?: () => void;
}

function ScriptInputNode({ data, isConnectable }: NodeProps<ScriptInputNodeData>) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newScript = e.target.value;
    if (data.onScriptChange) {
      data.onScriptChange(newScript);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-800">Script Input</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          value={data.script}
          onChange={handleTextChange}
          placeholder="Paste or type your script here..."
          className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        {/* Character/Word Count */}
        <div className="mt-2 text-xs text-gray-500">
          {data.charCount} chars · {data.wordCount} words
        </div>

        {/* Paste Button */}
        <button className="mt-3 w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Paste
        </button>

        {/* Generate Button */}
        <button className="mt-2 w-full px-3 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors font-medium">
          Generate Voice-Over
        </button>

        {/* Tips */}
        <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-700">
          <span className="font-medium">Tips:</span> Write in a conversational tone, include hooks, and keep scripts between 50-200 words for best results.
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
}

export default memo(ScriptInputNode);
