
import { Progress } from "../components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Check, Lightbulb } from "lucide-react";
import { Separator } from "../components/ui/separator";

interface AnalysisOverviewProps {
  statistics: {
    totalNodes: number;
    knownNodes: number;
    gapNodes: number;
    percentageKnown: number;
  };
  knownConcepts: string[];
  gapConcepts: string[];
}

const AnalysisOverview = ({ statistics, knownConcepts, gapConcepts }: AnalysisOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full animate-fade-up">
      <Card className="glass-panel col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Knowledge Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <Progress 
                value={statistics.percentageKnown} 
                className="h-32 w-32 rounded-full [transform:rotate(-90deg)_scale(1.2)]"
              />
              <span className="absolute text-3xl font-semibold animate-fade-in">
                {statistics.percentageKnown}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{statistics.knownNodes}</span> out of <span className="font-medium">{statistics.totalNodes}</span> concepts understood
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-panel col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <div className="p-1.5 rounded-full bg-knowledge-known/10 text-knowledge-known mr-2">
                  <Check className="h-4 w-4" />
                </div>
                <h4 className="font-medium">Concepts You Know</h4>
              </div>
              
              {knownConcepts.length > 0 ? (
                <ul className="space-y-2">
                  {knownConcepts.map((concept, index) => (
                    <li key={`known-${index}`} className="flex items-center bg-knowledge-known/5 px-3 py-2 rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <span className="w-2 h-2 rounded-full bg-knowledge-known mr-2"></span>
                      {concept}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm italic">No concepts identified as known yet.</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <div className="p-1.5 rounded-full bg-knowledge-gap/10 text-knowledge-gap mr-2">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <h4 className="font-medium">Concepts to Explore</h4>
              </div>
              
              {gapConcepts.length > 0 ? (
                <ul className="space-y-2">
                  {gapConcepts.map((concept, index) => (
                    <li key={`gap-${index}`} className="flex items-center bg-knowledge-gap/5 px-3 py-2 rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <span className="w-2 h-2 rounded-full bg-knowledge-gap mr-2"></span>
                      {concept}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm italic">Great job! No knowledge gaps identified.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisOverview;
