import { Sparkles } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <div className="max-w-2xl mx-auto mb-8 text-center">
      <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">You're Almost Live!</span>
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-3">
        Welcome to LeadSquad
      </h1>
      
      <p className="text-muted-foreground text-lg leading-relaxed">
        This 10-minute questionnaire helps us set up your LeadSquad account and create your custom AI voice script. 
        <span className="block mt-2 font-medium text-foreground">
          The more accurate your answers, the better your agents will sound and convert.
        </span>
      </p>
    </div>
  );
}
