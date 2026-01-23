import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { intakeService } from '@/services/intakeService';
import { ClientIntakeResponse } from '@/types/database';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep4 } from './OnboardingStep4';
import { DeploymentScreen } from './DeploymentScreen';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/leadsquad-logo-transparent.png';

const STEP_LABELS = ['Business Basics', 'Brand Identity', 'Call Logic', 'Integration'];

export function OnboardingWizard() {
  const { organization, refreshOrganization } = useAuth();
  const navigate = useNavigate();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
      } catch (error) {
        console.error('Failed to load intake:', error);
        toast.error('Failed to load onboarding data');
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
      const updatedIntake = await intakeService.saveStepProgress(intake.id, stepData, nextStep);
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
    if (!intake?.id || !organization?.id) return;

    try {
      setIsCompleting(true);
      
      // Save step 4 data
      await intakeService.updateIntake(intake.id, stepData);
      
      // Mark intake as complete
      await intakeService.completeIntake(intake.id);
      
      // Mark organization onboarding as complete
      await intakeService.markOnboardingComplete(organization.id);
      
      // Refresh organization data
      await refreshOrganization();
      
      toast.success('Configuration saved! Starting deployment...');
      
      // Show deployment screen (don't navigate away yet)
    } catch (error) {
      console.error('Failed to complete setup:', error);
      toast.error('Failed to complete setup');
      setIsCompleting(false);
    }
  };

  const handleDeploymentComplete = () => {
    // This is called when deployment finishes
    console.log('Deployment complete!');
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    );
  }

  if (isCompleting && organization?.id) {
    return (
      <DeploymentScreen 
        organizationId={organization.id} 
        onComplete={handleDeploymentComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <img src={logo} alt="LeadSquad" className="h-8" />
        </div>
      </header>

      {/* Progress */}
      <div className="py-8 px-4">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={4} 
          stepLabels={STEP_LABELS} 
        />
      </div>

      {/* Content */}
      <main className="px-4 pb-16">
        {currentStep === 1 && (
          <OnboardingStep1
            data={intake || {}}
            onNext={(data) => handleStepComplete(data, 2)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 2 && (
          <OnboardingStep2
            data={intake || {}}
            onNext={(data) => handleStepComplete(data, 3)}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}

        {currentStep === 3 && (
          <OnboardingStep3
            data={intake || {}}
            onNext={(data) => handleStepComplete(data, 4)}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}

        {currentStep === 4 && (
          <OnboardingStep4
            data={intake || {}}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  );
}
