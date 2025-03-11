
import { useState, useEffect } from "react";
import { Brain, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../components/ui/dialog";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-10 py-4 flex items-center justify-between ${
          scrolled 
            ? "bg-white/80 backdrop-blur-md shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center space-x-2 animate-fade-down">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">GapFinder</span>
        </div>
        
        <div className="flex items-center space-x-4 animate-fade-down">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">How it works</span>
          </Button>
        </div>
      </header>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="glass-panel max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium">How GapFinder Works</DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed">
              GapFinder helps you identify gaps in your knowledge about a specific topic. Here's how:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <span className="flex h-6 w-6 items-center justify-center font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Enter a topic</h4>
                <p className="text-muted-foreground">Choose any subject you're interested in learning more about.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <span className="flex h-6 w-6 items-center justify-center font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium">Describe your current knowledge</h4>
                <p className="text-muted-foreground">Share what you already know about the topic.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <span className="flex h-6 w-6 items-center justify-center font-medium">3</span>
              </div>
              <div>
                <h4 className="font-medium">Explore your knowledge map</h4>
                <p className="text-muted-foreground">GapFinder creates a visual map showing both concepts you know and potential knowledge gaps.</p>
              </div>
            </div>
          </div>
          
          <DialogClose asChild>
            <Button className="w-full">Got it, thanks!</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
