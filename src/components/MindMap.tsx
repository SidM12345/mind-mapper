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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TopicData, getNodeClassName } from '../utils/topicData';
import { useToast } from '@/components/ui/use-toast';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MindMapProps {
  data: TopicData;
}

// Simple grid-based layout configuration
const LAYOUT_CONFIG = {
  HORIZONTAL_SPACING: 180,  // Reduced for more compact layout
  VERTICAL_SPACING: 100,    // Reduced for more compact layout
  NODE_SIZES: {
    core: { width: 160, height: 50 },      // Smaller core node
    subtopic: { width: 130, height: 45 },  // Smaller subtopic nodes
    concept: { width: 110, height: 40 }    // Smaller concept nodes
  }
};

const MindMap = ({ data }: MindMapProps) => {
  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();
  const [isInitialized, setIsInitialized] = useState(false);

  // Transform topic data into ReactFlow nodes with appropriate styling
  const initialNodes: FlowNode[] = useMemo(() => 
    data.nodes.map((node) => {
      // Node styling based on type and confidence
      const confidenceValue = node.confidence !== undefined ? node.confidence : 
                             (node.status === 'known' ? 100 : node.status === 'gap' ? 0 : 50);
      
      // Determine color based on confidence
      const getConfidenceColor = () => {
        if (node.type === 'core') return 'node-core';
        if (confidenceValue >= 80) return 'node-high-confidence';
        if (confidenceValue >= 40) return 'node-medium-confidence';
        return 'node-low-confidence';
      };
      
      return {
        id: node.id,
        data: { 
          label: node.label,
          confidence: confidenceValue,
          type: node.type
        },
        position: { x: 0, y: 0 }, // Will be positioned by the layout algorithm
        className: `${getConfidenceColor()} node-animation-${Math.floor(Math.random() * 3) + 1}`,
        style: {
          width: LAYOUT_CONFIG.NODE_SIZES[node.type].width,
          height: LAYOUT_CONFIG.NODE_SIZES[node.type].height,
          fontSize: node.type === 'core' ? '15px' : node.type === 'subtopic' ? '13px' : '12px',
          fontWeight: node.type === 'core' ? 700 : node.type === 'subtopic' ? 600 : 500,
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        },
      };
    }), [data.nodes]
  );

  // Create edges with appropriate styling
  const initialEdges: FlowEdge[] = useMemo(() => 
    data.edges.map((edge) => {
      const sourceNode = data.nodes.find(n => n.id === edge.source);
      const isMainPath = sourceNode?.type === 'core';
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        style: { 
          stroke: isMainPath ? '#8b5cf6' : '#94a3b8',
          strokeWidth: isMainPath ? 2 : 1,
          opacity: 0.7,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: isMainPath ? '#8b5cf6' : '#94a3b8',
        },
        animated: isMainPath,
        className: isMainPath ? 'animated' : '',
      };
    }), [data.edges, data.nodes]
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

  /**
   * Grid-based Hierarchical Layout:
   * - Organizes nodes in a structured grid
   * - Avoids overlaps by strict positioning
   */
  const applyLayout = useCallback(() => {
    try {
      if (nodes.length === 0) return;
      
      // Get viewport dimensions for centering
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const centerX = viewportWidth / 2;
      
      // Create node type groups
      const coreNode = nodes.find(n => 
        data.nodes.find(d => d.id === n.id)?.type === 'core'
      );
      
      if (!coreNode) return;
      
      // Step 1: Position core node at top center
      coreNode.position = { 
        x: centerX - (LAYOUT_CONFIG.NODE_SIZES.core.width / 2), 
        y: 50 
      };
      
      // Get other node categories
      const subtopicNodes = nodes.filter(n => 
        data.nodes.find(d => d.id === n.id)?.type === 'subtopic'
      );
      
      const conceptNodes = nodes.filter(n => 
        data.nodes.find(d => d.id === n.id)?.type === 'concept'
      );
      
      // Step 2: Create a map of parent-child relationships
      const childrenMap = new Map();
      edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;
        
        if (!childrenMap.has(source)) {
          childrenMap.set(source, []);
        }
        
        childrenMap.get(source).push(target);
      });
      
      // Get direct children of core node (subtopics)
      const coreChildren = childrenMap.get(coreNode.id) || [];
      const directSubtopics = subtopicNodes.filter(n => coreChildren.includes(n.id));
      
      // Step 3: Position subtopics in a row
      const level1Y = coreNode.position.y + LAYOUT_CONFIG.VERTICAL_SPACING;
      let totalSubtopicWidth = directSubtopics.length * LAYOUT_CONFIG.HORIZONTAL_SPACING;
      let subtopicStartX = centerX - (totalSubtopicWidth / 2) + (LAYOUT_CONFIG.HORIZONTAL_SPACING / 2);
      
      // Ensure minimum starting position
      subtopicStartX = Math.max(100, subtopicStartX);
      
      // Create a map to track node positions
      const nodePositions = new Map();
      nodePositions.set(coreNode.id, coreNode.position);
      
      // Position direct subtopics
      directSubtopics.forEach((node, index) => {
        const x = subtopicStartX + (index * LAYOUT_CONFIG.HORIZONTAL_SPACING);
        node.position = { 
          x: x - (LAYOUT_CONFIG.NODE_SIZES.subtopic.width / 2), 
          y: level1Y 
        };
        nodePositions.set(node.id, node.position);
      });
      
      // Step 4: Organize concepts into columns under their parent subtopics
      const levelMap = new Map(); // Maps node id to its level
      const processedNodes = new Set([coreNode.id]);
      directSubtopics.forEach(node => processedNodes.add(node.id));
      
      // Mark levels for all nodes via breadth-first traversal
      levelMap.set(coreNode.id, 0);
      directSubtopics.forEach(node => levelMap.set(node.id, 1));
      
      // Assign remaining nodes to appropriate levels
      const assignLevels = (startNodes, startLevel) => {
        let currentLevel = startLevel;
        let currentNodes = [...startNodes];
        
        while (currentNodes.length > 0) {
          const nextNodes = [];
          
          currentNodes.forEach(nodeId => {
            const children = childrenMap.get(nodeId) || [];
            children.forEach(childId => {
              if (!levelMap.has(childId)) {
                levelMap.set(childId, currentLevel + 1);
                nextNodes.push(childId);
              }
            });
          });
          
          currentLevel++;
          currentNodes = nextNodes;
        }
      };
      
      assignLevels(directSubtopics.map(n => n.id), 1);
      
      // Get maximum level
      const maxLevel = Math.max(...Array.from(levelMap.values()));
      
      // Position nodes level by level
      for (let level = 2; level <= maxLevel; level++) {
        // Find nodes at this level
        const nodesAtLevel = Array.from(levelMap.entries())
          .filter(([_, nodeLevel]) => nodeLevel === level)
          .map(([id, _]) => id);
        
        // Group concepts by their parent
        const parentGroups = new Map();
        
        nodesAtLevel.forEach(nodeId => {
          // Find parent
          const parentEdge = edges.find(edge => edge.target === nodeId);
          if (!parentEdge) return;
          
          const parentId = parentEdge.source;
          if (!parentGroups.has(parentId)) {
            parentGroups.set(parentId, []);
          }
          parentGroups.get(parentId).push(nodeId);
        });
        
        // Position each group of child nodes under their parent
        parentGroups.forEach((childIds, parentId) => {
          const parentPos = nodePositions.get(parentId);
          if (!parentPos) return;
          
          const levelY = level1Y + (level - 1) * LAYOUT_CONFIG.VERTICAL_SPACING;
          
          // Calculate width required for children
          const totalWidth = childIds.length * LAYOUT_CONFIG.HORIZONTAL_SPACING;
          const startX = parentPos.x + (LAYOUT_CONFIG.NODE_SIZES.subtopic.width / 2) - (totalWidth / 2);
          
          // Position each child
          childIds.forEach((childId, index) => {
            const childNode = nodes.find(n => n.id === childId);
            if (!childNode) return;
            
            const x = startX + (index * LAYOUT_CONFIG.HORIZONTAL_SPACING);
            childNode.position = { 
              x: x - (LAYOUT_CONFIG.NODE_SIZES.concept.width / 2),
              y: levelY 
            };
            nodePositions.set(childId, childNode.position);
            processedNodes.add(childId);
          });
        });
      }
      
      // Step 5: Handle any remaining unpositioned nodes
      const remainingNodes = nodes.filter(n => !processedNodes.has(n.id));
      
      if (remainingNodes.length > 0) {
        const lastY = level1Y + maxLevel * LAYOUT_CONFIG.VERTICAL_SPACING;
        const totalWidth = remainingNodes.length * LAYOUT_CONFIG.HORIZONTAL_SPACING;
        let startX = centerX - (totalWidth / 2) + (LAYOUT_CONFIG.HORIZONTAL_SPACING / 2);
        
        remainingNodes.forEach((node, index) => {
          const nodeType = data.nodes.find(n => n.id === node.id)?.type || 'concept';
          const x = startX + (index * LAYOUT_CONFIG.HORIZONTAL_SPACING);
          node.position = {
            x: x - (LAYOUT_CONFIG.NODE_SIZES[nodeType].width / 2),
            y: lastY
          };
        });
      }
      
      // Update nodes with new positions
      setNodes([...nodes]);
      
      // Center view on the layout
      setTimeout(() => {
        reactFlowInstance.fitView({ 
          padding: 0.2,
          duration: 800
        });
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
      const confidenceDisplay = clickedNode.confidence !== undefined 
        ? `${clickedNode.confidence}% understanding` 
        : clickedNode.status === 'known' 
          ? "Well understood" 
          : clickedNode.status === 'gap'
          ? "Knowledge gap"
          : "Neutral";
          
      toast({
        title: clickedNode.label,
        description: clickedNode.type === 'core'
          ? "Core concept in this domain."
          : clickedNode.type === 'subtopic'
          ? `Major area within the subject. ${confidenceDisplay}.`
          : `${confidenceDisplay}.`,
        variant: "default"
      });
    }
  }, [data.nodes, toast]);

  // Add zoom controls
  const zoomIn = () => {
    reactFlowInstance.zoomIn({ duration: 300 });
  };

  const zoomOut = () => {
    reactFlowInstance.zoomOut({ duration: 300 });
  };

  const fitView = () => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
  };

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
        nodesDraggable={true}
      >
        <Background color="#f1f5f9" gap={20} size={1.5} />
        <Controls showInteractive={false} className="m-4" />
        <MiniMap 
          nodeColor={(node) => {
            const nodeData = data.nodes.find(n => n.id === node.id);
            if (!nodeData) return '#94a3b8';
            
            if (nodeData.type === 'core') return '#8b5cf6';
            
            const confidence = nodeData.confidence !== undefined 
              ? nodeData.confidence 
              : nodeData.status === 'known' ? 100 : nodeData.status === 'gap' ? 20 : 50;
            
            if (confidence >= 80) return '#0ea5e9';
            if (confidence >= 40) return '#6366f1';
            return '#ef4444';
          }}
          maskColor="rgba(240, 245, 250, 0.6)"
          className="hidden md:block"
        />
        
        <Panel position="top-right" className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={zoomIn} 
            className="h-8 w-8 rounded-full bg-white shadow-md border-gray-200"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={zoomOut} 
            className="h-8 w-8 rounded-full bg-white shadow-md border-gray-200"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fitView} 
            className="h-8 w-8 rounded-full bg-white shadow-md border-gray-200"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindMap;
