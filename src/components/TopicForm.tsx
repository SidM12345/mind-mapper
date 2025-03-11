import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChevronRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

interface TopicFormProps {
  onSubmit: (topic: string, currentKnowledge: string) => void;
}

const TopicForm = ({ onSubmit }: TopicFormProps) => {
  const [topic, setTopic] = useState("Machine Learning");
  const [currentKnowledge, setCurrentKnowledge] = useState(
    "I understand the basics of supervised learning and regression. I've built simple models using linear regression and know about training/test splits. I've heard about neural networks but haven't used them yet. I also know a bit about classification problems and decision trees."
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate loading state to show beautiful transition
    setTimeout(() => {
      onSubmit(topic, currentKnowledge);
      setIsLoading(false);
    }, 1000);
  };

  const useDemoData = () => {
    setTopic("Machine Learning");
    setCurrentKnowledge(
      "I understand the basics of supervised learning and regression. I've built simple models using linear regression and know about training/test splits. I've heard about neural networks but haven't used them yet. I also know a bit about classification problems and decision trees."
    );
    toast.success("Demo data loaded");
  };

  return (
    <Card className="glass-panel w-full max-w-xl p-8 animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Your Knowledge Profile</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={useDemoData}
                className="text-xs flex items-center gap-1 text-muted-foreground"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Load Demo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Load a Machine Learning example</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 animate-fade-up delay-100">
          <Label 
            htmlFor="topic" 
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            Topic you want to understand
          </Label>
          <Input
            id="topic"
            placeholder="e.g., Machine Learning, React Hooks, Quantum Physics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="text-base h-12 bg-white/50 border-muted"
          />
        </div>
        
        <div className="space-y-2 animate-fade-up delay-200">
          <Label 
            htmlFor="knowledge" 
            className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
          >
            What do you already know about this topic?
          </Label>
          <Textarea
            id="knowledge"
            placeholder="Describe your current understanding, concepts you're familiar with, or areas you're confused about..."
            value={currentKnowledge}
            onChange={(e) => setCurrentKnowledge(e.target.value)}
            className="min-h-[150px] resize-none text-base bg-white/50 border-muted"
          />
          <p className="text-xs text-muted-foreground italic mt-1">
            Be specific about what you know and don't know. This helps identify your knowledge gaps more effectively.
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 mt-6 animate-fade-up delay-300 bg-primary hover:bg-primary/90 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              Analyzing
              <span className="ml-2 flex space-x-1">
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></span>
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></span>
              </span>
            </span>
          ) : (
            <span className="flex items-center">
              Identify Knowledge Gaps
              <ChevronRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default TopicForm;
