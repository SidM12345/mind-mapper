import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";

interface ClaudeApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ClaudeApiKeyForm = ({ onApiKeySubmit }: ClaudeApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateApiKey = (key: string): boolean => {
    // Claude API keys typically start with "sk-ant-" and are at least 32 chars
    if (!key.startsWith("sk-ant-")) {
      setError("Claude API keys should start with 'sk-ant-'");
      return false;
    }
    
    if (key.length < 32) {
      setError("API key appears to be too short");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!apiKey.trim()) {
      setError("Please enter your Claude API key");
      return;
    }

    if (!validateApiKey(apiKey)) {
      return;
    }

    setIsLoading(true);
    
    // We'll do a basic format check but not a live check to avoid unnecessary API calls
    setTimeout(() => {
      onApiKeySubmit(apiKey);
      toast.success("API key saved successfully");
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
        
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) validateApiKey(e.target.value);
            }}
            className="text-base h-10 bg-white/50 border-muted"
          />
          <div className="text-xs text-muted-foreground space-y-2">
            <p>Your API key is stored locally and never sent to our servers</p>
            <p>You can get an API key from the <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic Console</a></p>
          </div>
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
