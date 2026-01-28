import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParsedQuestion } from '@/services/questionnaireService';
import { HoursOfOperationInput } from './HoursOfOperationInput';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface TypeformQuestionProps {
  question: ParsedQuestion;
  value: string | null;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function TypeformQuestion({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  isSaving,
  questionNumber,
  totalQuestions,
}: TypeformQuestionProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value, question.id]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setError(null);
    onChange(newValue);
  };

  const handleNext = () => {
    if (question.isRequired && !localValue.trim()) {
      setError('This field is required');
      return;
    }
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && question.fieldType !== 'textarea') {
      e.preventDefault();
      handleNext();
    }
  };

  const progress = ((questionNumber) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section indicator */}
      <div className="pt-8 px-4 text-center">
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {question.section}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {question.question}
              {question.isRequired && <span className="text-destructive ml-1">*</span>}
            </h2>
          </div>

          {/* Field rendering based on type */}
          <div className="mb-6">
            {question.fieldType === 'text' && (
              <Input
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className={cn(
                  "text-lg py-6 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent",
                  error && "border-destructive"
                )}
                autoFocus
              />
            )}

            {question.fieldType === 'textarea' && (
              <Textarea
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Type your answer here... (separate multiple entries with commas)"
                className={cn(
                  "text-lg min-h-[150px] border-2 focus-visible:ring-0 focus-visible:border-primary",
                  error && "border-destructive"
                )}
                autoFocus
              />
            )}

            {question.fieldType === 'phone' && (
              <Input
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="(555) 123-4567"
                type="tel"
                className={cn(
                  "text-lg py-6 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent",
                  error && "border-destructive"
                )}
                autoFocus
              />
            )}

            {question.fieldType === 'url' && (
              <Input
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://www.example.com"
                type="url"
                className={cn(
                  "text-lg py-6 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent",
                  error && "border-destructive"
                )}
                autoFocus
              />
            )}

            {question.fieldType === 'zip' && (
              <Input
                value={localValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleChange(val);
                }}
                onKeyDown={handleKeyDown}
                placeholder="12345"
                maxLength={5}
                className={cn(
                  "text-lg py-6 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary bg-transparent",
                  error && "border-destructive"
                )}
                autoFocus
              />
            )}

            {question.fieldType === 'state' && (
              <Select value={localValue} onValueChange={handleChange}>
                <SelectTrigger className={cn(
                  "text-lg py-6 border-0 border-b-2 rounded-none focus:ring-0 bg-transparent",
                  error && "border-destructive"
                )}>
                  <SelectValue placeholder="Select a state..." />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {question.fieldType === 'dropdown' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      handleChange(option);
                      // Auto-advance after selection
                      setTimeout(onNext, 300);
                    }}
                    className={cn(
                      "w-full text-left px-6 py-4 rounded-lg border-2 transition-all",
                      localValue === option
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        localValue === option ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                      )}>
                        {localValue === option && <Check className="w-4 h-4" />}
                      </span>
                      <span className="font-medium">{option}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {question.fieldType === 'hours' && (
              <HoursOfOperationInput
                value={localValue}
                onChange={handleChange}
              />
            )}

            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Navigation hint */}
          {question.fieldType !== 'dropdown' && (
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter ↵</kbd> to continue
            </p>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isFirst}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              'Saving...'
            ) : isLast ? (
              <>
                Complete Setup
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
