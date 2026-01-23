import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function OnboardingProgress({ currentStep, totalSteps, stepLabels }: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted mx-12" />
        
        {/* Progress line fill */}
        <div 
          className="absolute top-6 left-0 h-1 bg-primary transition-all duration-500 ease-out mx-12"
          style={{ width: `calc(${((currentStep - 1) / (totalSteps - 1)) * 100}% - 6rem)` }}
        />
        
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 border-4",
                  isCompleted && "bg-primary text-primary-foreground border-primary",
                  isCurrent && "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-background text-muted-foreground border-muted"
                )}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
              </div>
              <span 
                className={cn(
                  "mt-3 text-sm font-medium text-center max-w-[100px]",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
