'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ScriptInputNode from './nodes/ScriptInputNode';
import AudioOutputNode from './nodes/AudioOutputNode';

const nodeTypes = {
  scriptInput: ScriptInputNode,
  audioOutput: AudioOutputNode,
};

const initialNodes: Node[] = [
  {
    id: 'script-1',
    type: 'scriptInput',
    position: { x: 200, y: 150 },
    data: {
      script: '',
      charCount: 0,
      wordCount: 0,
      onScriptChange: (script: string) => {
        console.log('Script changed:', script);
      },
    },
  },
  {
    id: 'audio-1',
    type: 'audioOutput',
    position: { x: 750, y: 150 },
    data: {
      hasAudio: false,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-script-audio',
    source: 'script-1',
    target: 'audio-1',
    sourceHandle: 'output',
    targetHandle: 'input',
    animated: true,
    style: { stroke: '#9333ea', strokeWidth: 2 },
  },
];

export default function BrandAIFlowDashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update script in node data
  const handleScriptChange = useCallback(
    (nodeId: string, script: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const words = script.trim().split(/\s+/).filter(Boolean);
            return {
              ...node,
              data: {
                ...node.data,
                script,
                charCount: script.length,
                wordCount: words.length,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Initialize script change handler
  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === 'scriptInput') {
      return {
        ...node,
        data: {
          ...node.data,
          onScriptChange: (script: string) => handleScriptChange(node.id, script),
        },
      };
    }
    return node;
  });

  return (
    <div className="w-full h-full bg-pink-50">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="bg-white rounded-lg shadow-md" />
        <MiniMap
          className="bg-white rounded-lg shadow-md"
          nodeColor={(node) => {
            if (node.type === 'scriptInput') return '#9333ea';
            if (node.type === 'audioOutput') return '#ec4899';
            return '#6b7280';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#fecaca" />
      </ReactFlow>
    </div>
  );
}
