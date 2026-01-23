import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';

export function ImpersonationBanner() {
  const { impersonatedOrg, exitImpersonation } = useAdmin();

  if (!impersonatedOrg) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="font-medium">
            Viewing as: <strong>{impersonatedOrg.name}</strong>
          </span>
          <span className="text-amber-800 text-sm">
            (You are in impersonation mode)
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={exitImpersonation}
          className="text-amber-950 hover:bg-amber-600 hover:text-amber-950"
        >
          <X className="h-4 w-4 mr-1" />
          Return to Admin
        </Button>
      </div>
    </div>
  );
}
