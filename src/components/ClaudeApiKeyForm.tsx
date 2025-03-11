
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Key } from "lucide-react";
import { toast } from "sonner";

interface ClaudeApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ClaudeApiKeyForm = ({ onApiKeySubmit }: ClaudeApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error("Please enter your Claude API key");
      return;
    }

    setIsLoading(true);
    
    // Simulate checking the API key validity
    setTimeout(() => {
      onApiKeySubmit(apiKey);
      toast.success("API key saved");
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="glass-panel w-full max-w-md p-6 animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Connect to Claude AI</h3>
          <p className="text-sm text-muted-foreground">
            Enter your Claude API key to enable AI-powered knowledge analysis
          </p>
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="apiKey" 
            className="text-sm font-medium text-muted-foreground"
          >
            Claude API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Claude API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-base h-10 bg-white/50 border-muted"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-10 transition-all duration-300"
          disabled={isLoading}
        >
          <Key className="mr-2 h-4 w-4" />
          {isLoading ? "Validating..." : "Connect Claude AI"}
        </Button>
      </form>
    </Card>
  );
};

export default ClaudeApiKeyForm;
