import { useState, useEffect, useRef } from 'react';
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
import { WelcomeMessage } from './WelcomeMessage';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import logo from '@/assets/leadsquad-logo-transparent.png';

const STEP_LABELS = ['Business Basics', 'Brand Identity', 'Call Logic', 'Integration'];

export function OnboardingWizard() {
  const { user, organization, refreshOrganization } = useAuth();
  const navigate = useNavigate();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [localOrgId, setLocalOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrCreateOrganizationAndIntake() {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        let orgId = organization?.id;
        
        // If no organization exists, create one with a placeholder name
        if (!orgId) {
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: 'My Business', // Placeholder, will be updated in step 1
              owner_id: user.id,
              onboarding_completed: false,
            })
            .select()
            .single();
          
          if (orgError) throw orgError;
          
          // Add the user as an owner in organization_members
          await supabase
            .from('organization_members')
            .insert({
              organization_id: newOrg.id,
              user_id: user.id,
              role: 'owner',
            });
          
          orgId = newOrg.id;
          setLocalOrgId(orgId);
          await refreshOrganization();
        } else {
          setLocalOrgId(orgId);
        }
        
        // Now load or create intake
        let existingIntake = await intakeService.getIntakeByOrganization(orgId);
        
        if (!existingIntake) {
          existingIntake = await intakeService.createIntake(orgId);
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

    loadOrCreateOrganizationAndIntake();
  }, [user?.id, organization?.id, refreshOrganization]);

  const handleStepComplete = async (stepData: Partial<ClientIntakeResponse>, nextStep: number) => {
    if (!intake?.id) return;
    const orgId = localOrgId || organization?.id;

    try {
      setIsSaving(true);
      
      // If completing step 1, update organization name
      if (nextStep === 2 && stepData.business_name && orgId) {
        await supabase
          .from('organizations')
          .update({ name: stepData.business_name })
          .eq('id', orgId);
        await refreshOrganization();
      }
      
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
    const orgId = localOrgId || organization?.id;
    if (!intake?.id || !orgId) return;

    try {
      setIsCompleting(true);
      
      // Save step 4 data
      await intakeService.updateIntake(intake.id, stepData);
      
      // Mark intake as complete
      await intakeService.completeIntake(intake.id);
      
      // Mark organization onboarding as complete
      await intakeService.markOnboardingComplete(orgId);
      
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

  const currentOrgId = localOrgId || organization?.id;

  if (isCompleting && currentOrgId) {
    return (
      <DeploymentScreen 
        organizationId={currentOrgId} 
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

      {/* Welcome Message - Only show on step 1 */}
      {currentStep === 1 && (
        <div className="px-4">
          <WelcomeMessage />
        </div>
      )}

      {/* Content */}
      <main className="px-4 pb-16">
        {currentStep === 1 && intake && (
          <OnboardingStep1
            key={`step1-${intake.id}`}
            data={intake}
            onNext={(data) => handleStepComplete(data, 2)}
            isSaving={isSaving}
          />
        )}

        {currentStep === 2 && intake && (
          <OnboardingStep2
            key={`step2-${intake.id}`}
            data={intake}
            onNext={(data) => handleStepComplete(data, 3)}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}

        {currentStep === 3 && intake && (
          <OnboardingStep3
            key={`step3-${intake.id}`}
            data={intake}
            onNext={(data) => handleStepComplete(data, 4)}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}

        {currentStep === 4 && intake && (
          <OnboardingStep4
            key={`step4-${intake.id}`}
            data={intake}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  );
}
