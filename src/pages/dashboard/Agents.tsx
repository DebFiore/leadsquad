import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bot } from 'lucide-react';

export default function Agents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI agents and their configurations
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No agents yet</CardTitle>
            <CardDescription className="text-center max-w-sm mb-4">
              Create your first AI agent to start automating your lead generation and outreach.
            </CardDescription>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
