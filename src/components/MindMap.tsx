
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node as FlowNode,
  Edge as FlowEdge,
  MarkerType,
  ConnectionLineType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TopicData, getNodeClassName } from '../utils/topicData';
import { useToast } from '@/components/ui/use-toast';

interface MindMapProps {
  data: TopicData;
}

const MindMap = ({ data }: MindMapProps) => {
  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();
  const [isInitialized, setIsInitialized] = useState(false);

  // Transform topic data into ReactFlow nodes and edges
  const initialNodes: FlowNode[] = useMemo(() => 
    data.nodes.map((node) => ({
      id: node.id,
      data: { label: node.label },
      position: { x: 0, y: 0 }, // Will be laid out automatically
      className: getNodeClassName(node.status || 'neutral'),
      style: {
        minWidth: node.type === 'core' ? 160 : node.type === 'subtopic' ? 140 : 120,
        fontSize: node.type === 'core' ? '16px' : node.type === 'subtopic' ? '14px' : '13px',
        fontWeight: node.type === 'core' ? 600 : 500,
      },
    })), [data.nodes]
  );

  const initialEdges: FlowEdge[] = useMemo(() => 
    data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      style: { 
        stroke: '#94a3b8',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#94a3b8',
      },
      animated: false,
    })), [data.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Apply layout on initial render
  useEffect(() => {
    if (!isInitialized && nodes.length > 0) {
      setTimeout(() => {
        applyLayout();
        setIsInitialized(true);
      }, 10);
    }
  }, [nodes, isInitialized]);

  // Apply dagre layout
  const applyLayout = useCallback(() => {
    try {
      if (nodes.length === 0) return;

      // Apply a simple force-directed layout
      const centerX = window.innerWidth / 2 - 100;
      const centerY = window.innerHeight / 3 - 100;
      
      const newNodes = [...nodes];
      
      // Position core node at center
      const coreNode = newNodes.find(node => node.id === data.nodes[0].id);
      if (coreNode) {
        coreNode.position = { x: centerX, y: centerY };
      }
      
      // Position subtopic nodes around core
      const subtopicNodes = newNodes.filter(
        node => data.nodes.find(n => n.id === node.id)?.type === 'subtopic'
      );
      
      const radius = 250;
      subtopicNodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / subtopicNodes.length;
        node.position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
      
      // Position concept nodes around their parent subtopics
      const conceptNodes = newNodes.filter(
        node => data.nodes.find(n => n.id === node.id)?.type === 'concept'
      );
      
      conceptNodes.forEach(node => {
        // Find which subtopic this concept is connected to
        const edge = edges.find(e => e.target === node.id);
        if (!edge) return;
        
        const parentNode = newNodes.find(n => n.id === edge.source);
        if (!parentNode) return;
        
        // Position around the parent with some randomness
        const conceptRadius = 150;
        const angle = Math.random() * 2 * Math.PI;
        
        node.position = {
          x: parentNode.position.x + conceptRadius * Math.cos(angle),
          y: parentNode.position.y + conceptRadius * Math.sin(angle),
        };
      });
      
      setNodes([...newNodes]);
      
      // Center the flow
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 50);
      
    } catch (error) {
      console.error('Layout error:', error);
      toast({
        title: "Visualization error",
        description: "There was an error rendering the knowledge map.",
        variant: "destructive"
      });
    }
  }, [nodes, edges, data.nodes, reactFlowInstance, setNodes, toast]);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    const clickedNode = data.nodes.find(n => n.id === node.id);
    if (clickedNode) {
      toast({
        title: clickedNode.label,
        description: clickedNode.status === 'known' 
          ? "You already understand this concept." 
          : clickedNode.status === 'gap'
          ? "This is a knowledge gap you should explore."
          : "Core concept in this domain.",
        variant: "default"
      });
    }
  }, [data.nodes, toast]);

  return (
    <div className="w-full h-[70vh] min-h-[500px] rounded-xl overflow-hidden glass-panel animate-fade-in">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f1f5f9" gap={16} size={1} />
        <Controls className="m-4" />
        <MiniMap 
          nodeColor={(node) => {
            const status = data.nodes.find(n => n.id === node.id)?.status;
            if (status === 'known') return '#0ea5e9';
            if (status === 'gap') return '#ef4444';
            return '#94a3b8';
          }}
          maskColor="rgba(240, 245, 250, 0.6)"
          className="hidden md:block"
        />
      </ReactFlow>
    </div>
  );
};

export default MindMap;
