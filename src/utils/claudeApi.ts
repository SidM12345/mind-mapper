export interface ClaudeAnalysisRequest {
  topic: string;
  currentKnowledge: string;
  apiKey: string;
}

export interface ClaudeTopicNode {
  id: string;
  label: string;
  type: 'core' | 'subtopic' | 'concept';
  status: 'known' | 'gap' | 'neutral';
  confidence?: number;
}

export interface ClaudeTopicEdge {
  id: string;
  source: string;
  target: string;
}

export interface ClaudeAnalysisResponse {
  nodes: ClaudeTopicNode[];
  edges: ClaudeTopicEdge[];
}

export const analyzeWithClaude = async ({
  topic,
  currentKnowledge,
  apiKey
}: ClaudeAnalysisRequest): Promise<ClaudeAnalysisResponse> => {
  try {
    // Log to verify the API key is being used (will be removed in production)
    console.log("Using Claude API key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.2,
        system: `You are an expert knowledge analyzer. Your task is to analyze a user's understanding of a topic and identify both what they know and gaps in their knowledge. Output ONLY valid JSON matching this interface:
        {
          "nodes": [
            {"id": "string", "label": "string", "type": "core|subtopic|concept", "status": "known|gap|neutral", "confidence": number}
          ],
          "edges": [
            {"id": "string", "source": "string", "target": "string"}
          ]
        }
        
        The nodes should represent:
        1. The core topic as the central node (type: "core", status: "neutral")
        2. Major subtopics as second-level nodes (type: "subtopic", status based on analysis)
        3. Specific concepts as third-level nodes (type: "concept", status based on analysis)
        
        Status should be:
        - "known" if the user clearly understands the concept (confidence >= 60%)
        - "gap" if the concept is not mentioned or poorly understood (confidence < 40%)
        - "neutral" for the core topic or things that are partially understood (confidence 40-60%)
        
        The confidence value should be a number from 0-100 representing the percentage of understanding.
        For example:
        - 0 = No understanding at all
        - 50 = Partial understanding
        - 100 = Complete understanding
        
        Create an id for each node (alphanumeric, no spaces).
        Create edges to connect nodes in a hierarchical structure.
        Include at least 8-12 nodes in total.
        
        DO NOT include any explanatory text outside the JSON object - return ONLY valid JSON.`,
        messages: [
          {
            role: 'user',
            content: `Topic: ${topic}\n\nMy current understanding:\n${currentKnowledge}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error response:", errorText);
      let errorMessage = "Unknown error";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || "API error: " + response.status;
      } catch (e) {
        errorMessage = `HTTP error ${response.status}: ${errorText.substring(0, 100)}...`;
      }
      
      throw new Error(`Claude API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Claude API raw response:", data);
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Unexpected response format from Claude API');
    }
    
    const content = data.content[0].text;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON. Claude response:", content);
      throw new Error('Could not parse JSON from Claude response');
    }
    
    try {
      const result = JSON.parse(jsonMatch[0]) as ClaudeAnalysisResponse;
      
      // Validate the response structure
      if (!result.nodes || !Array.isArray(result.nodes) || !result.edges || !Array.isArray(result.edges)) {
        throw new Error('Invalid response structure from Claude');
      }
      
      return result;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", jsonMatch[0]);
      throw new Error('Failed to parse Claude response as valid JSON');
    }
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
};
