import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { intakeService } from '@/services/intakeService';
import { ClientIntakeResponse } from '@/types/database';
import { WizardProgress } from './wizard/WizardProgress';
import { Step1BusinessProfile } from './wizard/Step1BusinessProfile';
import { Step2PersonaTone } from './wizard/Step2PersonaTone';
import { Step3KnowledgeBase } from './wizard/Step3KnowledgeBase';
import { Step4CallFlow } from './wizard/Step4CallFlow';
import { Step5TechnicalCRM } from './wizard/Step5TechnicalCRM';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

const STEP_LABELS = [
  'Business Profile',
  'Persona & Tone',
  'Knowledge Base',
  'Call Flow',
  'Technical & CRM',
];

interface AgentConfigWizardProps {
  onComplete?: () => void;
}

export function AgentConfigWizard({ onComplete }: AgentConfigWizardProps) {
  const { organization } = useAuth();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function loadOrCreateIntake() {
      if (!organization?.id) return;
      
      try {
        setIsLoading(true);
        let existingIntake = await intakeService.getIntakeByOrganization(organization.id);
        
        if (!existingIntake) {
          existingIntake = await intakeService.createIntake(organization.id);
        }
        
        setIntake(existingIntake);
        setCurrentStep(existingIntake.current_step || 1);
        setIsComplete(existingIntake.is_complete);
      } catch (error) {
        console.error('Failed to load intake:', error);
        toast.error('Failed to load agent configuration');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreateIntake();
  }, [organization?.id]);

  const handleStepComplete = async (stepData: Partial<ClientIntakeResponse>, nextStep: number) => {
    if (!intake?.id) return;

    try {
      setIsSaving(true);
      const updatedIntake = await intakeService.saveStepProgress(
        intake.id,
        stepData,
        nextStep
      );
      setIntake(updatedIntake);
      setCurrentStep(nextStep);
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async (stepData: Partial<ClientIntakeResponse>) => {
    if (!intake?.id) return;

    try {
      setIsSaving(true);
      
      // Save step 5 data
      await intakeService.updateIntake(intake.id, stepData);
      
      // Mark as complete
      const completedIntake = await intakeService.completeIntake(intake.id);
      setIntake(completedIntake);
      setIsComplete(true);
      
      toast.success('Agent configuration complete!');
      onComplete?.();
    } catch (error) {
      console.error('Failed to complete setup:', error);
      toast.error('Failed to complete setup');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading agent configuration...</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-green-500/10 p-4 mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Agent Configuration Complete!</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Your AI agent has been configured and is ready to start handling calls. 
            Our team will review your settings and activate your agent within 24 hours.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsComplete(false)}>
              Review Settings
            </Button>
            <Button onClick={onComplete}>
              <Rocket className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WizardProgress 
        currentStep={currentStep} 
        totalSteps={5} 
        stepLabels={STEP_LABELS} 
      />

      {currentStep === 1 && (
        <Step1BusinessProfile
          data={intake || {}}
          onNext={(data) => handleStepComplete(data, 2)}
          isSaving={isSaving}
        />
      )}

      {currentStep === 2 && (
        <Step2PersonaTone
          data={intake || {}}
          onNext={(data) => handleStepComplete(data, 3)}
          onBack={handleBack}
          isSaving={isSaving}
        />
      )}

      {currentStep === 3 && (
        <Step3KnowledgeBase
          data={intake || {}}
          onNext={(data) => handleStepComplete(data, 4)}
          onBack={handleBack}
          isSaving={isSaving}
        />
      )}

      {currentStep === 4 && (
        <Step4CallFlow
          data={intake || {}}
          onNext={(data) => handleStepComplete(data, 5)}
          onBack={handleBack}
          isSaving={isSaving}
        />
      )}

      {currentStep === 5 && (
        <Step5TechnicalCRM
          data={intake || {}}
          onSubmit={handleFinalSubmit}
          onBack={handleBack}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
