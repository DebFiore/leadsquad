import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TypeformWizard } from '@/components/onboarding/TypeformWizard';

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <TypeformWizard />
    </ProtectedRoute>
  );
}
