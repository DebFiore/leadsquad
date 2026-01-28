import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { questionnaireService, ParsedQuestion } from '@/services/questionnaireService';
import { intakeService } from '@/services/intakeService';
import { ClientIntakeResponse } from '@/types/database';
import { TypeformQuestion } from './TypeformQuestion';
import { DeploymentScreen } from './DeploymentScreen';
import { WelcomeMessage } from './WelcomeMessage';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import logo from '@/assets/leadsquad-logo-transparent.png';

export function TypeformWizard() {
  const { user, organization, refreshOrganization } = useAuth();
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [localOrgId, setLocalOrgId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const initializationRef = useRef(false);

  // Load questions and initialize
  useEffect(() => {
    async function initialize() {
      if (initializationRef.current && intake) return;
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setInitError(null);
        initializationRef.current = true;

        // Fetch questions from database
        const rows = await questionnaireService.fetchQuestions();
        const sections = questionnaireService.parseQuestionsIntoSections(rows);
        const flatQuestions = questionnaireService.flattenToQuestions(sections);
        setQuestions(flatQuestions);

        // Get or create organization
        let orgId = organization?.id || localOrgId;

        if (!orgId) {
          console.log('Creating new organization for user:', user.id);
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: 'My Business',
              owner_id: user.id,
              onboarding_completed: false,
            })
            .select()
            .single();

          if (orgError) {
            console.error('Failed to create organization:', orgError);
            setInitError(`Failed to create organization: ${orgError.message}`);
            throw orgError;
          }

          // Add user as owner member
          await supabase.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner',
          });

          orgId = newOrg.id;
          setLocalOrgId(orgId);
          refreshOrganization();
        } else {
          setLocalOrgId(orgId);
        }

        // Load or create intake
        let existingIntake = await intakeService.getIntakeByOrganization(orgId);
        if (!existingIntake) {
          existingIntake = await intakeService.createIntake(orgId);
        }

        setIntake(existingIntake);

        // Load existing answers
        const existingAnswers: Record<string, string> = {};
        for (const q of flatQuestions) {
          const val = (existingIntake as any)[q.answerKey];
          if (val) {
            existingAnswers[q.answerKey] = String(val);
          }
        }
        setAnswers(existingAnswers);

        // Resume from where they left off
        if (existingIntake.current_step > 1) {
          // Find first unanswered question
          const firstUnansweredIndex = flatQuestions.findIndex(q => !existingAnswers[q.answerKey]);
          if (firstUnansweredIndex >= 0) {
            setCurrentIndex(firstUnansweredIndex);
          }
          setShowWelcome(false);
        }

      } catch (error: any) {
        console.error('Failed to initialize:', error);
        setInitError(error?.message || 'Failed to load onboarding');
        initializationRef.current = false;
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [user?.id, organization?.id]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = useCallback((value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.answerKey]: value,
    }));
  }, [currentQuestion]);

  const saveProgress = async () => {
    if (!intake?.id) return;

    try {
      setIsSaving(true);
      
      // Convert answers to intake format
      const updateData: Partial<ClientIntakeResponse> = {};
      for (const [key, value] of Object.entries(answers)) {
        (updateData as any)[key] = value || null;
      }

      // Calculate step based on progress
      const progressPercent = (currentIndex + 1) / questions.length;
      const step = Math.min(4, Math.ceil(progressPercent * 4));

      await intakeService.saveStepProgress(intake.id, updateData, step);

      // Update org name if business_name changed
      const orgId = localOrgId || organization?.id;
      if (answers.business_name && orgId) {
        await supabase
          .from('organizations')
          .update({ name: answers.business_name })
          .eq('id', orgId);
      }

    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Validate required fields
    if (currentQuestion?.isRequired && !answers[currentQuestion.answerKey]?.trim()) {
      toast.error('This field is required');
      return;
    }

    // Save periodically (every 5 questions or on important fields)
    const shouldSave = 
      currentIndex % 5 === 0 || 
      currentQuestion?.answerKey === 'business_name' ||
      currentIndex === questions.length - 1;

    if (shouldSave) {
      await saveProgress();
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Complete setup
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    const orgId = localOrgId || organization?.id;
    if (!intake?.id || !orgId) return;

    try {
      setIsCompleting(true);

      // Save all answers
      const updateData: Partial<ClientIntakeResponse> = {};
      for (const [key, value] of Object.entries(answers)) {
        (updateData as any)[key] = value || null;
      }

      await intakeService.updateIntake(intake.id, updateData);
      await intakeService.completeIntake(intake.id);
      await intakeService.markOnboardingComplete(orgId);
      await refreshOrganization();

      toast.success('Setup complete! Building your AI agent...');
    } catch (error) {
      console.error('Failed to complete:', error);
      toast.error('Failed to complete setup');
      setIsCompleting(false);
    }
  };

  const handleStartQuestionnaire = () => {
    setShowWelcome(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!intake && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Setup Error</h2>
          <p className="text-muted-foreground mb-4">
            {initError || "We couldn't load your onboarding data."}
          </p>
          <Button
            onClick={() => {
              initializationRef.current = false;
              setInitError(null);
              setIsLoading(true);
              setLocalOrgId(null);
              setTimeout(() => window.location.reload(), 100);
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Deployment screen
  if (isCompleting && (localOrgId || organization?.id)) {
    return (
      <DeploymentScreen
        organizationId={(localOrgId || organization?.id)!}
        onComplete={() => console.log('Deployment complete!')}
      />
    );
  }

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
            <img src={logo} alt="LeadSquad" className="h-8" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <WelcomeMessage />
            <div className="mt-8">
              <Button size="lg" onClick={handleStartQuestionnaire} className="gap-2">
                Start Questionnaire
                <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {questions.length} questions • Takes about 10-15 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  if (currentQuestion) {
    return (
      <TypeformQuestion
        question={currentQuestion}
        value={answers[currentQuestion.answerKey] || null}
        onChange={handleAnswerChange}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={currentIndex === 0}
        isLast={currentIndex === questions.length - 1}
        isSaving={isSaving}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    );
  }

  return null;
}
