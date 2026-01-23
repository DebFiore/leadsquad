import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AgentConfigWizard } from '@/components/dashboard/AgentConfigWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bot, Settings } from 'lucide-react';

export default function Agents() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground mt-1">
              Configure your AI agents to handle calls and lead generation
            </p>
          </div>
          {!showWizard && (
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Configure Agent
            </Button>
          )}
        </div>

        {showWizard ? (
          <AgentConfigWizard onComplete={() => setShowWizard(false)} />
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">Configure Your AI Agent</CardTitle>
              <CardDescription className="text-center max-w-sm mb-4">
                Set up your AI agent by completing our 5-step configuration wizard. 
                This will train your agent to represent your business perfectly.
              </CardDescription>
              <Button onClick={() => setShowWizard(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Start Configuration Wizard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
