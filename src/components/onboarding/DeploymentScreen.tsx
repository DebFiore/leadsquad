import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Check, Loader2, Phone, Zap, Users, Sparkles, Server, Cpu, Wifi } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/leadsquad-logo-transparent.png';

interface DeploymentStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // seconds
}

const DEPLOYMENT_STEPS: DeploymentStep[] = [
  {
    id: 'provisioning',
    label: 'Provisioning Accounts',
    description: 'Creating your dedicated voice infrastructure...',
    icon: <Server className="h-5 w-5" />,
    duration: 45,
  },
  {
    id: 'synthesis',
    label: 'Voice Synthesis',
    description: 'Training AI models with your brand voice...',
    icon: <Cpu className="h-5 w-5" />,
    duration: 60,
  },
  {
    id: 'agents',
    label: 'Deploying Agents',
    description: 'Configuring your Revenue Squad agents...',
    icon: <Users className="h-5 w-5" />,
    duration: 90,
  },
  {
    id: 'phone_numbers',
    label: 'Assigning Phone Numbers',
    description: 'Provisioning dedicated phone lines...',
    icon: <Phone className="h-5 w-5" />,
    duration: 45,
  },
  {
    id: 'integration',
    label: 'Connecting Integrations',
    description: 'Linking your CRM and calendar...',
    icon: <Wifi className="h-5 w-5" />,
    duration: 30,
  },
  {
    id: 'testing',
    label: 'Running Diagnostics',
    description: 'Testing call flows and responses...',
    icon: <Zap className="h-5 w-5" />,
    duration: 30,
  },
  {
    id: 'finalizing',
    label: 'Finalizing Setup',
    description: 'Your sales floor is almost ready...',
    icon: <Sparkles className="h-5 w-5" />,
    duration: 20,
  },
];

interface DeploymentScreenProps {
  organizationId: string;
  onComplete: () => void;
}

export function DeploymentScreen({ organizationId, onComplete }: DeploymentScreenProps) {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'deploying' | 'success' | 'error'>('deploying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  const totalDuration = DEPLOYMENT_STEPS.reduce((acc, step) => acc + step.duration, 0);

  // Handle redirect after deployment - check for pending checkout
  const handlePostDeploymentRedirect = async () => {
    const pendingPriceId = localStorage.getItem('pendingCheckoutPriceId');
    
    if (pendingPriceId && organization?.id) {
      // User came from pricing - redirect to Stripe checkout
      setIsRedirectingToCheckout(true);
      try {
        const response = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: pendingPriceId,
            organizationId: organization.id,
            successUrl: `${window.location.origin}/dashboard/live?checkout=success`,
            cancelUrl: `${window.location.origin}/dashboard/billing`,
          }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');

        // Clear the stored priceId
        localStorage.removeItem('pendingCheckoutPriceId');

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch (error: any) {
        console.error('Checkout redirect error:', error);
        toast.error('Failed to start checkout. You can subscribe from the billing page.');
        localStorage.removeItem('pendingCheckoutPriceId');
      }
    }
    
    // Default: go to live dashboard
    navigate('/dashboard/live', { replace: true });
  };

  // Trigger n8n webhook on mount
  useEffect(() => {
    const triggerDeployment = async () => {
      try {
        console.log('Triggering deployment for org:', organizationId);
        
        const { data, error } = await supabase.functions.invoke('trigger-deployment', {
          body: { organization_id: organizationId },
        });

        if (error) {
          console.error('Deployment trigger error:', error);
          // Don't fail immediately - n8n might still process
        } else {
          console.log('Deployment triggered:', data);
        }
      } catch (error) {
        console.error('Failed to trigger deployment:', error);
      }
    };

    triggerDeployment();
  }, [organizationId]);

  // Simulate step progression with timing
  useEffect(() => {
    if (deploymentStatus !== 'deploying' || currentStepIndex >= DEPLOYMENT_STEPS.length) return;

    const currentStep = DEPLOYMENT_STEPS[currentStepIndex];
    const stepDurationMs = currentStep.duration * 1000;
    const incrementMs = 100;
    const incrementPercent = (incrementMs / stepDurationMs) * 100;

    const interval = setInterval(() => {
      setStepProgress(prev => {
        const next = prev + incrementPercent;
        if (next >= 100) {
          clearInterval(interval);
          setCompletedSteps(prev => [...prev, currentStep.id]);
          
          if (currentStepIndex < DEPLOYMENT_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            return 0;
          }
          return 100;
        }
        return next;
      });
    }, incrementMs);

    return () => clearInterval(interval);
  }, [currentStepIndex, deploymentStatus]);

  // Update overall progress
  useEffect(() => {
    const completedDuration = DEPLOYMENT_STEPS
      .filter(step => completedSteps.includes(step.id))
      .reduce((acc, step) => acc + step.duration, 0);
    
    const currentStep = DEPLOYMENT_STEPS[currentStepIndex];
    const currentProgress = currentStep ? (stepProgress / 100) * currentStep.duration : 0;
    
    const total = ((completedDuration + currentProgress) / totalDuration) * 100;
    setOverallProgress(Math.min(total, 99)); // Cap at 99% until actual success
  }, [completedSteps, stepProgress, currentStepIndex, totalDuration]);

  // Poll for deployment completion
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('deployment_status')
          .select('status, phone_numbers, agent_ids, error_message')
          .eq('organization_id', organizationId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Polling error:', error);
          return;
        }

        if (data?.status === 'completed') {
          setDeploymentStatus('success');
          setOverallProgress(100);
          setIsPolling(false);
          
          // Wait a moment then check for pending checkout or redirect to dashboard
          setTimeout(() => {
            onComplete();
            handlePostDeploymentRedirect();
          }, 2000);
        } else if (data?.status === 'failed') {
          setDeploymentStatus('error');
          setErrorMessage(data.error_message || 'Deployment failed');
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [organizationId, isPolling, onComplete]);

  // Auto-complete after animation finishes (fallback if n8n hasn't responded)
  useEffect(() => {
    if (currentStepIndex >= DEPLOYMENT_STEPS.length - 1 && stepProgress >= 100) {
      // Give n8n a bit more time, then auto-complete
      const timeout = setTimeout(() => {
        if (deploymentStatus === 'deploying') {
          setDeploymentStatus('success');
          setOverallProgress(100);
          setIsPolling(false);
          
          setTimeout(() => {
            onComplete();
            handlePostDeploymentRedirect();
          }, 2000);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, stepProgress, deploymentStatus, onComplete]);

  const currentStep = DEPLOYMENT_STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <img src={logo} alt="LeadSquad" className="h-8" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Hero section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
                deploymentStatus === 'success' 
                  ? 'bg-green-500/20' 
                  : deploymentStatus === 'error'
                  ? 'bg-destructive/20'
                  : 'bg-primary/10'
              }`}>
                {deploymentStatus === 'success' ? (
                  <Check className="h-12 w-12 text-green-500" />
                ) : deploymentStatus === 'error' ? (
                  <span className="text-4xl">⚠️</span>
                ) : (
                  <Rocket className="h-12 w-12 text-primary animate-bounce" />
                )}
              </div>
              
              {/* Animated rings */}
              {deploymentStatus === 'deploying' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {deploymentStatus === 'success' 
                ? '🎉 Your Sales Floor is Live!'
                : deploymentStatus === 'error'
                ? 'Deployment Issue'
                : 'Building Your Sales Floor'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {deploymentStatus === 'success'
                ? 'Your AI Revenue Squad is ready to take calls!'
                : deploymentStatus === 'error'
                ? errorMessage || 'Something went wrong. Please try again.'
                : 'Hang tight! We\'re setting up your AI Revenue Squad.'}
            </p>
          </div>

          {/* Overall progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Current step indicator */}
          {deploymentStatus === 'deploying' && currentStep && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {currentStep.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{currentStep.label}</h3>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                  <Progress value={stepProgress} className="h-1.5 mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* Steps list */}
          <div className="space-y-3">
            {DEPLOYMENT_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStepIndex && deploymentStatus === 'deploying';

              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : isCurrent
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-muted/30 border border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    isCompleted 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Estimated time */}
          {deploymentStatus === 'deploying' && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Estimated time remaining: ~{Math.ceil((totalDuration * (1 - overallProgress / 100)) / 60)} minutes
            </p>
          )}

          {/* Success action */}
          {deploymentStatus === 'success' && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                {isRedirectingToCheckout 
                  ? 'Redirecting you to complete your subscription...'
                  : 'Redirecting you to your live dashboard...'}
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
