import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone } from 'lucide-react';

export default function Campaigns() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your outreach campaigns
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No campaigns yet</CardTitle>
            <CardDescription className="text-center max-w-sm mb-4">
              Launch your first campaign to reach out to potential leads automatically.
            </CardDescription>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
