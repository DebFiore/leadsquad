import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { IntakeReviewSection } from '@/components/dashboard/IntakeReviewSection';

export default function Settings() {
  const { user, profile, organization } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, organization, and AI agent configuration
          </p>
        </div>

        {/* AI Configuration / Intake Review */}
        {organization?.id && (
          <IntakeReviewSection organizationId={organization.id} />
        )}

        {/* Profile Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                defaultValue={profile?.full_name || ''} 
                placeholder="Your full name"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                defaultValue={user?.email || ''} 
                disabled
                className="bg-muted"
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Manage your organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input 
                defaultValue={organization?.name || ''} 
                placeholder="Organization name"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input 
                defaultValue={organization?.industry || ''} 
                placeholder="Industry"
                className="bg-muted"
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
