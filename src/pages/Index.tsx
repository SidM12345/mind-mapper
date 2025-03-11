
import { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import Header from "../components/Header";
import TopicForm from "../components/TopicForm";
import MindMap from "../components/MindMap";
import AnalysisOverview from "../components/AnalysisOverview";
import useKnowledgeAnalysis from "../hooks/useKnowledgeAnalysis";
import { Button } from "../components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import ClaudeApiKeyForm from "../components/ClaudeApiKeyForm";
import { Toaster } from "sonner";

const Index = () => {
  const [step, setStep] = useState<"input" | "result" | "settings">("input");
  const { analyzeKnowledge, result, isAnalyzing, hasClaudeApiKey, setClaudeApiKey } = useKnowledgeAnalysis();
  const [topic, setTopic] = useState("");

  const handleSubmit = (topic: string, currentKnowledge: string) => {
    setTopic(topic);
    analyzeKnowledge(topic, currentKnowledge);
    setStep("result");
  };

  const handleReset = () => {
    setStep("input");
  };

  const handleSettingsClick = () => {
    setStep("settings");
  };

  const handleApiKeySubmit = (apiKey: string) => {
    setClaudeApiKey(apiKey);
    setStep("input");
  };

  return (
    <div className="min-h-screen bg-background bg-dot-pattern bg-dot-small">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container max-w-7xl px-4 sm:px-6 pt-28 pb-16">
        {step === "input" && (
          <div className="flex flex-col items-center justify-center gap-10 max-w-4xl mx-auto">
            <div className="text-center space-y-4 animate-fade-down">
              <div className="text-xs font-medium text-primary/80 uppercase tracking-widest mb-2">
                Knowledge Gap Finder
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Discover what you don't know<br />
                <span className="animated-gradient-text">you don't know</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Visualize your understanding and uncover knowledge gaps to accelerate your learning journey.
              </p>
              
              {!hasClaudeApiKey && (
                <div className="flex justify-center mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSettingsClick}
                    className="text-sm"
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Connect Claude AI
                  </Button>
                </div>
              )}
            </div>
            
            <TopicForm onSubmit={handleSubmit} />
          </div>
        )}
        
        {step === "settings" && (
          <div className="flex flex-col items-center justify-center gap-8 max-w-md mx-auto">
            <div className="w-full flex justify-start">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => setStep("input")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            <ClaudeApiKeyForm onApiKeySubmit={handleApiKeySubmit} />
          </div>
        )}
        
        {step === "result" && (
          <div className="flex flex-col gap-8 pb-20">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={handleReset}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start over
              </Button>
              
              <h2 className="text-2xl font-semibold animate-fade-up">
                {topic}
              </h2>
              
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
            
            {result && (
              <>
                <div className="w-full mb-4">
                  <ReactFlowProvider>
                    <MindMap data={result.topicData} />
                  </ReactFlowProvider>
                </div>
                
                <AnalysisOverview 
                  statistics={result.statistics}
                  knownConcepts={result.knownConcepts}
                  gapConcepts={result.gapConcepts}
                />
              </>
            )}
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">
              GapFinder — Map your knowledge journey
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
