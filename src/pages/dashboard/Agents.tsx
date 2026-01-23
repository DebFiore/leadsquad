import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { intakeService } from '@/services/intakeService';
import { ClientIntakeResponse } from '@/types/database';

export default function Agents() {
  const { organization } = useAuth();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIntake() {
      if (!organization?.id) return;
      try {
        const data = await intakeService.getIntakeByOrganization(organization.id);
        setIntake(data);
      } catch (error) {
        console.error('Failed to load intake:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadIntake();
  }, [organization?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground mt-1">
              Your AI agents and their configurations
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : intake?.is_complete ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-green-500/10 p-4 mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="mb-2">Your AI Agent is Configured</CardTitle>
              <CardDescription className="text-center max-w-md mb-6">
                Your Voice Pod has been set up with your business information, brand voice, and integration preferences. Our team is reviewing your configuration.
              </CardDescription>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  View Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">Agent Configuration Pending</CardTitle>
              <CardDescription className="text-center max-w-sm mb-4">
                Complete your onboarding to configure your AI agent.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
