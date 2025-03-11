
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
    
    try {
      let topicData: TopicData;
      
      // If Claude API key is available, use Claude for analysis
      if (claudeApiKey) {
        try {
          const claudeResponse = await analyzeWithClaude({
            topic,
            currentKnowledge,
            apiKey: claudeApiKey
          });
          
          // Convert Claude response to our TopicData format
          topicData = convertClaudeResponseToTopicData(claudeResponse, topic);
        } catch (error) {
          console.error("Claude analysis failed:", error);
          toast.error("Claude analysis failed. Falling back to built-in analysis.");
          
          // Fallback to built-in analysis if Claude fails
          topicData = analyzeWithBuiltInLogic(topic, currentKnowledge);
        }
      } else {
        // Use built-in analysis if no Claude API key
        topicData = analyzeWithBuiltInLogic(topic, currentKnowledge);
      }
      
      // Calculate statistics
      const statistics = calculateStatistics(topicData);
      
      // Separate concepts by status
      const { knownConcepts, gapConcepts } = categorizeConceptsByStatus(topicData);
      
      setResult({
        topicData,
        statistics,
        knownConcepts,
        gapConcepts
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze your knowledge");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert Claude response to our TopicData format
  const convertClaudeResponseToTopicData = (
    claudeResponse: ClaudeAnalysisResponse,
    topicName: string
  ): TopicData => {
    return {
      nodes: claudeResponse.nodes.map(node => ({
        ...node,
        description: undefined
      })),
      edges: claudeResponse.edges
    };
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
      
      // Check if the node label matches any keywords
      const nodeKeywords = node.label.toLowerCase().split(/\s+/);
      
      // If we find a match in user's keywords, mark as known
      const isKnown = nodeKeywords.some(word => 
        keywords.some(keyword => keyword.includes(word) || word.includes(keyword))
      );
      
      if (isKnown) {
        status = "known";
      } else if (node.type === "concept") {
        // Only mark concepts as gaps (not core or subtopics)
        status = "gap";
      }
      
      return { ...node, status };
    });
    
    return result;
  };

  // Calculate statistics based on the analyzed data
  const calculateStatistics = (topicData: TopicData) => {
    const totalNodes = topicData.nodes.length;
    const knownNodes = topicData.nodes.filter(node => node.status === "known").length;
    const gapNodes = topicData.nodes.filter(node => node.status === "gap").length;
    const percentageKnown = Math.round((knownNodes / totalNodes) * 100);
    
    return {
      totalNodes,
      knownNodes,
      gapNodes,
      percentageKnown
    };
  };

  // Categorize concepts by their status
  const categorizeConceptsByStatus = (topicData: TopicData) => {
    const knownConcepts = topicData.nodes
      .filter(node => node.status === "known")
      .map(node => node.label);
      
    const gapConcepts = topicData.nodes
      .filter(node => node.status === "gap")
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
