import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <OnboardingWizard />
    </ProtectedRoute>
  );
}
