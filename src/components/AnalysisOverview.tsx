import { useState } from "react";
import { Progress } from "../components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Check, ChevronDown, ChevronUp, Lightbulb, Search } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface AnalysisOverviewProps {
  statistics: {
    totalNodes: number;
    knownNodes: number;
    gapNodes: number;
    percentageKnown: number;
    averageConfidence: number;
  };
  knownConcepts: string[];
  gapConcepts: string[];
}

const AnalysisOverview = ({ statistics, knownConcepts, gapConcepts }: AnalysisOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllKnown, setShowAllKnown] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);
  
  // Default display count
  const defaultDisplayCount = 5;
  
  // Filter concepts based on search term
  const filteredKnownConcepts = knownConcepts.filter(concept => 
    concept.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGapConcepts = gapConcepts.filter(concept => 
    concept.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Display limited number unless "show all" is toggled
  const displayedKnownConcepts = showAllKnown 
    ? filteredKnownConcepts 
    : filteredKnownConcepts.slice(0, defaultDisplayCount);
    
  const displayedGapConcepts = showAllGaps 
    ? filteredGapConcepts 
    : filteredGapConcepts.slice(0, defaultDisplayCount);

  return (
    <div className="grid grid-cols-1 gap-6 w-full animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Knowledge Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <Progress 
                  value={statistics.averageConfidence} 
                  className="h-32 w-32 rounded-full [transform:rotate(-90deg)_scale(1.2)]"
                />
                <span className="absolute text-3xl font-semibold animate-fade-in">
                  {statistics.averageConfidence}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Average understanding level across all concepts
                </div>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="bg-knowledge-known/10 hover:bg-knowledge-known/20 text-knowledge-known">
                    {statistics.knownNodes} Known
                  </Badge>
                  <Badge variant="outline" className="bg-knowledge-gap/10 hover:bg-knowledge-gap/20 text-knowledge-gap">
                    {statistics.gapNodes} Gaps
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Exploration Guide</CardTitle>
              <div className="relative w-[180px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter concepts..."
                  className="pl-8 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gaps" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="gaps" className="flex gap-2 items-center">
                  <Lightbulb className="h-4 w-4" />
                  <span>Gaps to Explore</span>
                  <Badge variant="outline" className="ml-1 bg-knowledge-gap/10 text-knowledge-gap">
                    {gapConcepts.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="known" className="flex gap-2 items-center">
                  <Check className="h-4 w-4" />
                  <span>Known Concepts</span>
                  <Badge variant="outline" className="ml-1 bg-knowledge-known/10 text-knowledge-known">
                    {knownConcepts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="gaps" className="mt-0">
                {filteredGapConcepts.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {displayedGapConcepts.map((concept, index) => (
                        <li key={`gap-${index}`} className="flex items-center bg-knowledge-gap/5 px-3 py-2 rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <span className="w-2 h-2 rounded-full bg-knowledge-gap mr-2"></span>
                          {concept}
                        </li>
                      ))}
                    </ul>
                    
                    {filteredGapConcepts.length > defaultDisplayCount && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs w-full text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAllGaps(!showAllGaps)}
                      >
                        {showAllGaps ? (
                          <span className="flex items-center">
                            Show Less <ChevronUp className="ml-1 h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Show All {filteredGapConcepts.length} Gaps <ChevronDown className="ml-1 h-3 w-3" />
                          </span>
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm italic p-4 text-center">
                    {searchTerm ? "No matching gap concepts found." : "Great job! No knowledge gaps identified."}
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="known" className="mt-0">
                {filteredKnownConcepts.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {displayedKnownConcepts.map((concept, index) => (
                        <li key={`known-${index}`} className="flex items-center bg-knowledge-known/5 px-3 py-2 rounded-lg text-sm animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <span className="w-2 h-2 rounded-full bg-knowledge-known mr-2"></span>
                          {concept}
                        </li>
                      ))}
                    </ul>
                    
                    {filteredKnownConcepts.length > defaultDisplayCount && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs w-full text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAllKnown(!showAllKnown)}
                      >
                        {showAllKnown ? (
                          <span className="flex items-center">
                            Show Less <ChevronUp className="ml-1 h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Show All {filteredKnownConcepts.length} Known Concepts <ChevronDown className="ml-1 h-3 w-3" />
                          </span>
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm italic p-4 text-center">
                    {searchTerm ? "No matching known concepts found." : "No concepts identified as known yet."}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on your knowledge profile, here are some recommended areas to focus your learning:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gapConcepts.slice(0, 3).map((concept, index) => (
                <Card key={`rec-${index}`} className="bg-gradient-to-br from-white/50 to-white/30 border-white/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-1">{concept}</h4>
                    <p className="text-xs text-muted-foreground">
                      Understanding this concept will help strengthen your knowledge foundation.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisOverview;
