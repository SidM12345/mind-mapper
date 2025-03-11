import { useState, useEffect } from "react";
import { TopicData, getTopicData } from "../utils/topicData";
import { analyzeWithClaude, ClaudeAnalysisResponse } from "../utils/claudeApi";
import { toast } from "sonner";

type Status = "known" | "gap" | "neutral";

interface AnalysisResult {
  topicData: TopicData;
  statistics: {
    totalNodes: number;
    knownNodes: number;
    gapNodes: number;
    percentageKnown: number;
    averageConfidence: number;
  };
  knownConcepts: string[];
  gapConcepts: string[];
}

const useKnowledgeAnalysis = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState<string | null>(
    localStorage.getItem("claudeApiKey")
  );

  // Save API key to local storage when it changes
  useEffect(() => {
    if (claudeApiKey) {
      localStorage.setItem("claudeApiKey", claudeApiKey);
    }
  }, [claudeApiKey]);

  const analyzeKnowledge = async (topic: string, currentKnowledge: string) => {
    setIsAnalyzing(true);
    console.log(`Starting analysis for topic: ${topic}`);
    
    try {
      let topicData: TopicData;
      
      // If Claude API key is available, use Claude for analysis
      if (claudeApiKey) {
        console.log("Using Claude API for analysis");
        try {
          const claudeResponse = await analyzeWithClaude({
            topic,
            currentKnowledge,
            apiKey: claudeApiKey
          });
          
          console.log("Claude analysis successful:", 
            `${claudeResponse.nodes.length} nodes, ${claudeResponse.edges.length} edges`);
          
          // Convert Claude response to our TopicData format
          topicData = convertClaudeResponseToTopicData(claudeResponse, topic);
          console.log("Converted Claude response to TopicData format");
        } catch (error) {
          console.error("Claude analysis failed:", error);
          toast.error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to built-in analysis.`);
          
          // Fallback to built-in analysis if Claude fails
          console.log("Falling back to built-in analysis");
          topicData = analyzeWithBuiltInLogic(topic, currentKnowledge);
        }
      } else {
        // Use built-in analysis if no Claude API key
        console.log("No Claude API key found, using built-in analysis");
        topicData = analyzeWithBuiltInLogic(topic, currentKnowledge);
      }
      
      // Calculate statistics
      const statistics = calculateStatistics(topicData);
      console.log("Analysis statistics:", statistics);
      
      // Separate concepts by status
      const { knownConcepts, gapConcepts } = categorizeConceptsByStatus(topicData);
      console.log(`Found ${knownConcepts.length} known concepts and ${gapConcepts.length} gap concepts`);
      
      setResult({
        topicData,
        statistics,
        knownConcepts,
        gapConcepts
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(`Failed to analyze your knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert Claude response to our TopicData format
  const convertClaudeResponseToTopicData = (
    claudeResponse: ClaudeAnalysisResponse,
    topicName: string
  ): TopicData => {
    console.log("Converting Claude response to TopicData format", claudeResponse);
    
    try {
      // Ensure IDs are clean and valid for ReactFlow
      const cleanedNodes = claudeResponse.nodes.map(node => {
        // Clean the ID to be valid for ReactFlow
        const cleanId = node.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        // Set confidence value based on status if not provided
        const confidence = node.confidence !== undefined ? node.confidence : 
                          node.status === 'known' ? 80 : 
                          node.status === 'gap' ? 20 : 50;
        
        // Ensure the core node is labeled as the topic
        const label = node.type === 'core' && node.label !== topicName 
                    ? topicName 
                    : node.label;
        
        return {
          ...node,
          id: cleanId,
          label,
          confidence,
          description: undefined
        };
      });
      
      // Clean up edge IDs and ensure source/target references use the cleaned node IDs
      const nodeIdMap = Object.fromEntries(
        claudeResponse.nodes.map((node, i) => [node.id, cleanedNodes[i].id])
      );
      
      const cleanedEdges = claudeResponse.edges.map(edge => ({
        id: edge.id.replace(/[^a-zA-Z0-9_-]/g, '_'),
        source: nodeIdMap[edge.source] || edge.source,
        target: nodeIdMap[edge.target] || edge.target
      }));
      
      // Add validation to ensure all edges reference valid nodes
      const validEdges = cleanedEdges.filter(edge => {
        const sourceExists = cleanedNodes.some(node => node.id === edge.source);
        const targetExists = cleanedNodes.some(node => node.id === edge.target);
        
        if (!sourceExists) {
          console.warn(`Edge ${edge.id} has invalid source: ${edge.source}`);
        }
        
        if (!targetExists) {
          console.warn(`Edge ${edge.id} has invalid target: ${edge.target}`);
        }
        
        return sourceExists && targetExists;
      });
      
      const finalData = {
        nodes: cleanedNodes,
        edges: validEdges
      };
      
      console.log("Final processed data:", finalData);
      return finalData;
    } catch (error) {
      console.error("Error converting Claude response:", error);
      throw new Error(`Failed to process Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Built-in analysis logic (fallback if Claude is not available)
  const analyzeWithBuiltInLogic = (topic: string, currentKnowledge: string): TopicData => {
    // Get the base topic structure
    const topicData = getTopicData(topic);
    
    // Process the user's current knowledge
    const knowledgeKeywords = extractKeywords(currentKnowledge);
    
    // Analyze which concepts are known vs. gaps
    return analyzeTopicWithKeywords(topicData, knowledgeKeywords);
  };

  // Extract keywords from user's knowledge description
  const extractKeywords = (knowledgeText: string): string[] => {
    if (!knowledgeText) return [];
    
    // Simple keyword extraction - split by spaces and punctuation
    const words = knowledgeText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Remove duplicates
    return Array.from(new Set(words));
  };

  // Analyze the topic structure against user's knowledge
  const analyzeTopicWithKeywords = (topicData: TopicData, keywords: string[]): TopicData => {
    const result = JSON.parse(JSON.stringify(topicData));
    
    result.nodes = result.nodes.map(node => {
      let status: Status = "neutral";
      let confidence: number = 50; // Default confidence is 50%
      
      // Skip analysis for core node
      if (node.type === 'core') {
        return { ...node, status, confidence };
      }
      
      // Check if the node label matches any keywords
      const nodeWords = node.label.toLowerCase().split(/\s+/);
      let matchScore = 0;
      
      // Calculate a confidence score based on keyword matches
      for (const nodeWord of nodeWords) {
        // Skip very short words
        if (nodeWord.length <= 2) continue;
        
        // Check for keyword matches
        const matchingKeywords = keywords.filter(keyword => 
          keyword.toLowerCase().includes(nodeWord) || 
          nodeWord.includes(keyword.toLowerCase())
        );
        
        if (matchingKeywords.length > 0) {
          // Stronger match if the keyword is close to the node word in length
          const bestMatch = matchingKeywords.reduce((best, current) => {
            const currentSimilarity = current.length / Math.max(current.length, nodeWord.length);
            const bestSimilarity = best.length / Math.max(best.length, nodeWord.length);
            return currentSimilarity > bestSimilarity ? current : best;
          }, matchingKeywords[0]);
          
          // Calculate match quality (0-1)
          const matchQuality = bestMatch.length / Math.max(bestMatch.length, nodeWord.length);
          matchScore += matchQuality;
        }
      }
      
      // Normalize confidence score based on the number of words in the node label
      const significantWords = nodeWords.filter(w => w.length > 2).length;
      if (significantWords > 0) {
        confidence = Math.min(100, Math.round((matchScore / significantWords) * 100));
      }
      
      // Determine status based on confidence
      if (confidence >= 60) {
        status = "known";
      } else if (node.type === "concept" && confidence < 40) {
        status = "gap";
      }
      
      return { ...node, status, confidence };
    });
    
    return result;
  };

  // Calculate statistics based on the analyzed data
  const calculateStatistics = (topicData: TopicData) => {
    const relevantNodes = topicData.nodes.filter(node => node.type !== 'core');
    const totalNodes = relevantNodes.length;
    
    // Count nodes with confidence >= 60% as "known"
    const knownNodes = relevantNodes.filter(node => 
      (node.confidence !== undefined && node.confidence >= 60) || node.status === 'known'
    ).length;
    
    // Count nodes with confidence < 40% and type "concept" as "gaps"
    const gapNodes = relevantNodes.filter(node => 
      (node.confidence !== undefined && node.confidence < 40 && node.type === 'concept') || 
      node.status === 'gap'
    ).length;
    
    // Calculate average confidence across all nodes
    const totalConfidence = relevantNodes.reduce((sum, node) => {
      return sum + (node.confidence !== undefined ? node.confidence : 
                   node.status === 'known' ? 100 : 
                   node.status === 'gap' ? 20 : 50);
    }, 0);
    
    const averageConfidence = Math.round(totalConfidence / totalNodes);
    const percentageKnown = Math.round((knownNodes / totalNodes) * 100);
    
    return {
      totalNodes,
      knownNodes,
      gapNodes,
      percentageKnown,
      averageConfidence
    };
  };

  // Categorize concepts by their status
  const categorizeConceptsByStatus = (topicData: TopicData) => {
    const knownConcepts = topicData.nodes
      .filter(node => (node.confidence !== undefined && node.confidence >= 60) || node.status === 'known')
      .map(node => node.label);
      
    const gapConcepts = topicData.nodes
      .filter(node => 
        ((node.confidence !== undefined && node.confidence < 40) || node.status === 'gap') && 
        node.type === 'concept'
      )
      .map(node => node.label);
      
    return { knownConcepts, gapConcepts };
  };

  return {
    analyzeKnowledge,
    result,
    isAnalyzing,
    hasClaudeApiKey: !!claudeApiKey,
    setClaudeApiKey
  };
};

export default useKnowledgeAnalysis;
