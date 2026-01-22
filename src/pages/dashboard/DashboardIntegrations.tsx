import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Puzzle, Check } from 'lucide-react';

const integrations = [
  {
    name: 'Salesforce',
    description: 'Sync leads and contacts with Salesforce CRM',
    connected: false,
  },
  {
    name: 'HubSpot',
    description: 'Connect your HubSpot CRM for seamless data sync',
    connected: false,
  },
  {
    name: 'Slack',
    description: 'Get notifications and updates in Slack',
    connected: false,
  },
  {
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    connected: false,
  },
];

export default function DashboardIntegrations() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and services
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map((integration) => (
            <Card key={integration.name} className="bg-card border-border">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Puzzle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {integration.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {integration.connected ? (
                  <Button variant="outline" className="w-full">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Connected
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
