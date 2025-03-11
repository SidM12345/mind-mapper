
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChevronRight } from "lucide-react";
import { toast } from "../components/ui/sonner";

interface TopicFormProps {
  onSubmit: (topic: string, currentKnowledge: string) => void;
}

const TopicForm = ({ onSubmit }: TopicFormProps) => {
  const [topic, setTopic] = useState("");
  const [currentKnowledge, setCurrentKnowledge] = useState("");
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

  return (
    <Card className="glass-panel w-full max-w-xl p-8 animate-fade-up">
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
            className="min-h-[120px] resize-none text-base bg-white/50 border-muted"
          />
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
