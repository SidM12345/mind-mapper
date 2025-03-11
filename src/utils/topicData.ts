export interface TopicNode {
  id: string;
  label: string;
  type: 'core' | 'subtopic' | 'concept';
  status?: 'known' | 'gap' | 'neutral';
  confidence?: number;
  description?: string;
}

export interface TopicEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface TopicData {
  nodes: TopicNode[];
  edges: TopicEdge[];
}

// Mock data repository with predefined topic structures
const topicRepository: Record<string, TopicData> = {
  "machine learning": {
    nodes: [
      { id: "ml", label: "Machine Learning", type: "core", status: "neutral" },
      
      // Core ML Paradigms
      { id: "supervised", label: "Supervised Learning", type: "subtopic", status: "neutral" },
      { id: "unsupervised", label: "Unsupervised Learning", type: "subtopic", status: "neutral" },
      { id: "reinforcement", label: "Reinforcement Learning", type: "subtopic", status: "neutral" },
      { id: "deep", label: "Deep Learning", type: "subtopic", status: "neutral" },
      { id: "foundations", label: "ML Foundations", type: "subtopic", status: "neutral" },
      
      // Supervised Learning concepts
      { id: "regression", label: "Regression", type: "concept", status: "neutral" },
      { id: "classification", label: "Classification", type: "concept", status: "neutral" },
      { id: "linear_reg", label: "Linear Regression", type: "concept", status: "neutral" },
      { id: "logistic_reg", label: "Logistic Regression", type: "concept", status: "neutral" },
      { id: "decision_trees", label: "Decision Trees", type: "concept", status: "neutral" },
      { id: "random_forest", label: "Random Forests", type: "concept", status: "neutral" },
      { id: "svm", label: "Support Vector Machines", type: "concept", status: "neutral" },
      
      // Unsupervised Learning concepts
      { id: "clustering", label: "Clustering", type: "concept", status: "neutral" },
      { id: "dimensionality", label: "Dimensionality Reduction", type: "concept", status: "neutral" },
      { id: "kmeans", label: "K-means", type: "concept", status: "neutral" },
      { id: "hierarchical", label: "Hierarchical Clustering", type: "concept", status: "neutral" },
      { id: "pca", label: "PCA", type: "concept", status: "neutral" },
      { id: "anomaly", label: "Anomaly Detection", type: "concept", status: "neutral" },
      
      // Reinforcement Learning concepts
      { id: "qlearning", label: "Q-Learning", type: "concept", status: "neutral" },
      { id: "policy_gradient", label: "Policy Gradient", type: "concept", status: "neutral" },
      { id: "mdp", label: "Markov Decision Process", type: "concept", status: "neutral" },
      { id: "rl_agents", label: "RL Agents", type: "concept", status: "neutral" },
      
      // Deep Learning concepts
      { id: "neural", label: "Neural Networks", type: "concept", status: "neutral" },
      { id: "cnn", label: "Convolutional NNs", type: "concept", status: "neutral" },
      { id: "rnn", label: "Recurrent NNs", type: "concept", status: "neutral" },
      { id: "transformers", label: "Transformers", type: "concept", status: "neutral" },
      { id: "gans", label: "GANs", type: "concept", status: "neutral" },
      { id: "transfer", label: "Transfer Learning", type: "concept", status: "neutral" },
      
      // Foundations concepts
      { id: "evaluation", label: "Model Evaluation", type: "concept", status: "neutral" },
      { id: "feature_eng", label: "Feature Engineering", type: "concept", status: "neutral" },
      { id: "regularization", label: "Regularization", type: "concept", status: "neutral" },
      { id: "overfitting", label: "Overfitting & Bias", type: "concept", status: "neutral" },
      { id: "optimization", label: "Optimization Algorithms", type: "concept", status: "neutral" },
      { id: "validation", label: "Cross-Validation", type: "concept", status: "neutral" },
    ],
    edges: [
      // Main paradigms connection to core
      { id: "e-ml-supervised", source: "ml", target: "supervised" },
      { id: "e-ml-unsupervised", source: "ml", target: "unsupervised" },
      { id: "e-ml-reinforcement", source: "ml", target: "reinforcement" },
      { id: "e-ml-deep", source: "ml", target: "deep" },
      { id: "e-ml-foundations", source: "ml", target: "foundations" },
      
      // Supervised learning connections
      { id: "e-supervised-regression", source: "supervised", target: "regression" },
      { id: "e-supervised-classification", source: "supervised", target: "classification" },
      { id: "e-regression-linear_reg", source: "regression", target: "linear_reg" },
      { id: "e-classification-logistic_reg", source: "classification", target: "logistic_reg" },
      { id: "e-classification-decision_trees", source: "classification", target: "decision_trees" },
      { id: "e-decision_trees-random_forest", source: "decision_trees", target: "random_forest" },
      { id: "e-classification-svm", source: "classification", target: "svm" },
      
      // Unsupervised learning connections
      { id: "e-unsupervised-clustering", source: "unsupervised", target: "clustering" },
      { id: "e-unsupervised-dimensionality", source: "unsupervised", target: "dimensionality" },
      { id: "e-clustering-kmeans", source: "clustering", target: "kmeans" },
      { id: "e-clustering-hierarchical", source: "clustering", target: "hierarchical" },
      { id: "e-dimensionality-pca", source: "dimensionality", target: "pca" },
      { id: "e-unsupervised-anomaly", source: "unsupervised", target: "anomaly" },
      
      // Reinforcement learning connections
      { id: "e-reinforcement-qlearning", source: "reinforcement", target: "qlearning" },
      { id: "e-reinforcement-policy_gradient", source: "reinforcement", target: "policy_gradient" },
      { id: "e-reinforcement-mdp", source: "reinforcement", target: "mdp" },
      { id: "e-reinforcement-rl_agents", source: "reinforcement", target: "rl_agents" },
      
      // Deep learning connections
      { id: "e-deep-neural", source: "deep", target: "neural" },
      { id: "e-neural-cnn", source: "neural", target: "cnn" },
      { id: "e-neural-rnn", source: "neural", target: "rnn" },
      { id: "e-neural-transformers", source: "neural", target: "transformers" },
      { id: "e-deep-gans", source: "deep", target: "gans" },
      { id: "e-deep-transfer", source: "deep", target: "transfer" },
      
      // Foundations connections
      { id: "e-foundations-evaluation", source: "foundations", target: "evaluation" },
      { id: "e-foundations-feature_eng", source: "foundations", target: "feature_eng" },
      { id: "e-foundations-regularization", source: "foundations", target: "regularization" },
      { id: "e-foundations-overfitting", source: "foundations", target: "overfitting" },
      { id: "e-foundations-optimization", source: "foundations", target: "optimization" },
      { id: "e-evaluation-validation", source: "evaluation", target: "validation" },
      
      // Cross-paradigm connections
      { id: "e-deep-supervised", source: "deep", target: "supervised" },
      { id: "e-neural-regression", source: "neural", target: "regression" },
      { id: "e-neural-classification", source: "neural", target: "classification" },
    ]
  },
  "react": {
    nodes: [
      { id: "react", label: "React", type: "core", status: "neutral" },
      { id: "components", label: "Components", type: "subtopic", status: "neutral" },
      { id: "props", label: "Props", type: "concept", status: "neutral" },
      { id: "state", label: "State", type: "concept", status: "neutral" },
      { id: "lifecycle", label: "Lifecycle Methods", type: "concept", status: "neutral" },
      { id: "hooks", label: "Hooks", type: "subtopic", status: "neutral" },
      { id: "useState", label: "useState", type: "concept", status: "neutral" },
      { id: "useEffect", label: "useEffect", type: "concept", status: "neutral" },
      { id: "useContext", label: "useContext", type: "concept", status: "neutral" },
      { id: "routing", label: "Routing", type: "subtopic", status: "neutral" },
      { id: "state-management", label: "State Management", type: "subtopic", status: "neutral" },
      { id: "redux", label: "Redux", type: "concept", status: "neutral" },
      { id: "context", label: "Context API", type: "concept", status: "neutral" },
    ],
    edges: [
      { id: "e-react-components", source: "react", target: "components" },
      { id: "e-components-props", source: "components", target: "props" },
      { id: "e-components-state", source: "components", target: "state" },
      { id: "e-components-lifecycle", source: "components", target: "lifecycle" },
      { id: "e-react-hooks", source: "react", target: "hooks" },
      { id: "e-hooks-useState", source: "hooks", target: "useState" },
      { id: "e-hooks-useEffect", source: "hooks", target: "useEffect" },
      { id: "e-hooks-useContext", source: "hooks", target: "useContext" },
      { id: "e-react-routing", source: "react", target: "routing" },
      { id: "e-react-state-management", source: "react", target: "state-management" },
      { id: "e-state-management-redux", source: "state-management", target: "redux" },
      { id: "e-state-management-context", source: "state-management", target: "context" },
      { id: "e-useContext-context", source: "useContext", target: "context" },
    ]
  },
  "javascript": {
    nodes: [
      { id: "js", label: "JavaScript", type: "core", status: "neutral" },
      { id: "syntax", label: "Syntax", type: "subtopic", status: "neutral" },
      { id: "variables", label: "Variables", type: "concept", status: "neutral" },
      { id: "functions", label: "Functions", type: "concept", status: "neutral" },
      { id: "dom", label: "DOM Manipulation", type: "subtopic", status: "neutral" },
      { id: "events", label: "Events", type: "concept", status: "neutral" },
      { id: "async", label: "Asynchronous JS", type: "subtopic", status: "neutral" },
      { id: "promises", label: "Promises", type: "concept", status: "neutral" },
      { id: "async-await", label: "Async/Await", type: "concept", status: "neutral" },
      { id: "es6", label: "ES6+ Features", type: "subtopic", status: "neutral" },
      { id: "arrow", label: "Arrow Functions", type: "concept", status: "neutral" },
      { id: "destructuring", label: "Destructuring", type: "concept", status: "neutral" },
      { id: "modules", label: "Modules", type: "concept", status: "neutral" },
    ],
    edges: [
      { id: "e-js-syntax", source: "js", target: "syntax" },
      { id: "e-syntax-variables", source: "syntax", target: "variables" },
      { id: "e-syntax-functions", source: "syntax", target: "functions" },
      { id: "e-js-dom", source: "js", target: "dom" },
      { id: "e-dom-events", source: "dom", target: "events" },
      { id: "e-js-async", source: "js", target: "async" },
      { id: "e-async-promises", source: "async", target: "promises" },
      { id: "e-async-async-await", source: "async", target: "async-await" },
      { id: "e-promises-async-await", source: "promises", target: "async-await" },
      { id: "e-js-es6", source: "js", target: "es6" },
      { id: "e-es6-arrow", source: "es6", target: "arrow" },
      { id: "e-es6-destructuring", source: "es6", target: "destructuring" },
      { id: "e-es6-modules", source: "es6", target: "modules" },
    ]
  },
  // Default fallback topic structure
  "default": {
    nodes: [
      { id: "core", label: "Core Topic", type: "core", status: "neutral" },
      { id: "sub1", label: "Subtopic 1", type: "subtopic", status: "neutral" },
      { id: "sub2", label: "Subtopic 2", type: "subtopic", status: "neutral" },
      { id: "sub3", label: "Subtopic 3", type: "subtopic", status: "neutral" },
      { id: "concept1", label: "Concept 1", type: "concept", status: "neutral" },
      { id: "concept2", label: "Concept 2", type: "concept", status: "neutral" },
      { id: "concept3", label: "Concept 3", type: "concept", status: "neutral" },
      { id: "concept4", label: "Concept 4", type: "concept", status: "neutral" },
      { id: "concept5", label: "Concept 5", type: "concept", status: "neutral" },
      { id: "concept6", label: "Concept 6", type: "concept", status: "neutral" },
    ],
    edges: [
      { id: "e-core-sub1", source: "core", target: "sub1" },
      { id: "e-core-sub2", source: "core", target: "sub2" },
      { id: "e-core-sub3", source: "core", target: "sub3" },
      { id: "e-sub1-concept1", source: "sub1", target: "concept1" },
      { id: "e-sub1-concept2", source: "sub1", target: "concept2" },
      { id: "e-sub2-concept3", source: "sub2", target: "concept3" },
      { id: "e-sub2-concept4", source: "sub2", target: "concept4" },
      { id: "e-sub3-concept5", source: "sub3", target: "concept5" },
      { id: "e-sub3-concept6", source: "sub3", target: "concept6" },
    ]
  }
};

// Find the best matching topic structure for user's input
export const getTopicData = (topicInput: string): TopicData => {
  const normalizedInput = topicInput.toLowerCase();
  
  // Try to find an exact match first
  if (topicRepository[normalizedInput]) {
    return JSON.parse(JSON.stringify(topicRepository[normalizedInput]));
  }
  
  // Try to find a partial match
  for (const [key, data] of Object.entries(topicRepository)) {
    if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
      return JSON.parse(JSON.stringify(data));
    }
  }
  
  // Return the default topic structure if no match found
  const defaultData = JSON.parse(JSON.stringify(topicRepository.default));
  
  // Customize the default structure with the user's topic
  defaultData.nodes[0].label = topicInput.charAt(0).toUpperCase() + topicInput.slice(1);
  
  return defaultData;
};

// Generate node colors based on status
export const getNodeClassName = (status: string) => {
  switch (status) {
    case 'known':
      return 'node-known';
    case 'gap':
      return 'node-gap';
    default:
      return 'node-neutral';
  }
};
