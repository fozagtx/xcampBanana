'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Volume2 } from 'lucide-react';

interface AudioOutputNodeData {
  hasAudio: boolean;
  audioUrl?: string;
}

function AudioOutputNode({ data, isConnectable }: NodeProps<AudioOutputNodeData>) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-[280px]">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-800">Audio Output</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-600 mb-4">Generated voice-over playback</p>

        {/* Audio Preview Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[140px]">
          {data.hasAudio ? (
            <div className="w-full">
              <audio controls className="w-full">
                <source src={data.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <>
              <Volume2 className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">No audio generated yet</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Paste the script text and generate voice-over
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AudioOutputNode);
