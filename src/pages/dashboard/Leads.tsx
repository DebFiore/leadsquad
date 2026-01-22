import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function Leads() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your leads database
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No leads yet</CardTitle>
            <CardDescription className="text-center max-w-sm mb-4">
              Import leads or connect an integration to start building your pipeline.
            </CardDescription>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Import Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
