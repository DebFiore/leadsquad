import { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { OrganizationTable } from '@/components/admin/OrganizationTable';
import { IntakeDetailDrawer } from '@/components/admin/IntakeDetailDrawer';
import { adminService } from '@/services/adminService';
import { Organization } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Building2, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, DollarSign, Palette, Zap } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/leadsquad-logo-transparent.png';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboardContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    setDrawerOpen(true);
  };

  const stats = {
    total: organizations.length,
    active: organizations.filter(o => o.status === 'active').length,
    pending: organizations.filter(o => o.status === 'pending' || !o.status).length,
    flagged: organizations.filter(o => o.status === 'flagged' || o.status === 'needs_clarification').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={logo} alt="LeadSquad" className="h-8" />
            </Link>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Super Admin
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/provisioning')}>
              <Zap className="h-4 w-4 mr-2" />
              Provisioning
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/branding')}>
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/billing')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Billing
            </Button>
            <Button variant="outline" size="sm" onClick={loadOrganizations} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organization Review Queue</h1>
          <p className="text-muted-foreground">
            Review onboarding submissions and manage client organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Organizations</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                {stats.total}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                {stats.active}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2 text-amber-600">
                <Clock className="h-6 w-6" />
                {stats.pending}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Needs Attention</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                {stats.flagged}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Organizations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Organizations</CardTitle>
            <CardDescription>
              Click on a row to view intake details and manage the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <OrganizationTable
                organizations={organizations}
                onSelectOrganization={handleSelectOrg}
                selectedOrgId={selectedOrg?.id}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Drawer */}
      <IntakeDetailDrawer
        organization={selectedOrg}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onOrganizationUpdate={loadOrganizations}
      />
    </div>
  );
}

export default function Admin() {
  return (
    <SuperAdminRoute>
      <AdminDashboardContent />
    </SuperAdminRoute>
  );
}
