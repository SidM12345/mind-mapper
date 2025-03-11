
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
        system: `You are an expert knowledge analyzer. Your task is to analyze a user's understanding of a topic and identify both what they know and gaps in their knowledge. Output ONLY valid JSON matching this interface:
        {
          "nodes": [
            {"id": "string", "label": "string", "type": "core|subtopic|concept", "status": "known|gap|neutral"}
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
        - "known" if the user clearly understands the concept
        - "gap" if the concept is not mentioned or poorly understood
        - "neutral" for the core topic
        
        Create an id for each node (alphanumeric, no spaces).
        Create edges to connect nodes in a hierarchical structure.
        Include at least 8-12 nodes in total.`,
        messages: [
          {
            role: 'user',
            content: `Topic: ${topic}\n\nMy current understanding:\n${currentKnowledge}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }
    
    const result = JSON.parse(jsonMatch[0]) as ClaudeAnalysisResponse;
    return result;
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
};
