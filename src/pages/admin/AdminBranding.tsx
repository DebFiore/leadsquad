import { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { brandingService } from '@/services/brandingService';
import { OrganizationBranding } from '@/types/branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  RefreshCw,
  Palette,
  Upload,
  Save,
  Eye,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BrandingWithOrg extends OrganizationBranding {
  organization_name: string;
}

function AdminBrandingContent() {
  const [brandings, setBrandings] = useState<BrandingWithOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranding, setSelectedBranding] = useState<BrandingWithOrg | null>(null);
  const [editForm, setEditForm] = useState({
    primary_color: '',
    secondary_color: '',
    company_name: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadBrandings = async () => {
    setIsLoading(true);
    try {
      const data = await brandingService.getAllBrandings();
      setBrandings(data);
    } catch (error) {
      console.error('Failed to load brandings:', error);
      toast.error('Failed to load branding data');
      // Demo data
      setBrandings([
        {
          id: '1',
          organization_id: 'org-1',
          organization_name: 'Acme HVAC',
          logo_url: null,
          primary_color: '27 92% 53%',
          secondary_color: '201 100% 78%',
          company_name: 'Acme HVAC',
          favicon_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          organization_id: 'org-2',
          organization_name: 'Quick Plumbing',
          logo_url: null,
          primary_color: '210 100% 50%',
          secondary_color: '45 100% 50%',
          company_name: 'Quick Plumbing Pro',
          favicon_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrandings();
  }, []);

  const handleEdit = (branding: BrandingWithOrg) => {
    setSelectedBranding(branding);
    setEditForm({
      primary_color: branding.primary_color,
      secondary_color: branding.secondary_color || '',
      company_name: branding.company_name || '',
    });
  };

  const handleSave = async () => {
    if (!selectedBranding) return;
    
    setIsSaving(true);
    try {
      await brandingService.upsertBranding(selectedBranding.organization_id, {
        primary_color: editForm.primary_color,
        secondary_color: editForm.secondary_color || null,
        company_name: editForm.company_name || null,
      });
      toast.success('Branding updated successfully');
      loadBrandings();
      setSelectedBranding(null);
    } catch (error) {
      console.error('Failed to update branding:', error);
      toast.error('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  const hslToHex = (hsl: string): string => {
    try {
      const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v.replace('%', '')));
      const hDecimal = l / 100;
      const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    } catch {
      return '#F47E1C';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Whitelabel Branding</h1>
            <p className="text-muted-foreground">
              Manage client dashboard branding and colors
            </p>
          </div>
          <Button variant="outline" onClick={loadBrandings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Brandings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Branding</CardTitle>
            <CardDescription>
              Click "Edit" to customize colors and logos for each client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Primary Color</TableHead>
                    <TableHead>Secondary Color</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandings.map((branding) => (
                    <TableRow key={branding.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{branding.organization_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {branding.company_name || 'No custom name'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full border"
                            style={{ backgroundColor: `hsl(${branding.primary_color})` }}
                          />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {branding.primary_color}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        {branding.secondary_color ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-full border"
                              style={{ backgroundColor: `hsl(${branding.secondary_color})` }}
                            />
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {branding.secondary_color}
                            </code>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {branding.logo_url ? (
                          <img
                            src={branding.logo_url}
                            alt="Logo"
                            className="h-8 w-auto"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">No logo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(branding)}
                            >
                              <Palette className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Branding</DialogTitle>
                              <DialogDescription>
                                Customize {branding.organization_name}'s dashboard appearance
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Company Display Name</Label>
                                <Input
                                  value={editForm.company_name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, company_name: e.target.value })
                                  }
                                  placeholder="e.g., Acme HVAC Pro"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Primary Color (HSL)</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={editForm.primary_color}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, primary_color: e.target.value })
                                    }
                                    placeholder="27 92% 53%"
                                  />
                                  <div
                                    className="h-10 w-10 rounded-md border shrink-0"
                                    style={{ backgroundColor: `hsl(${editForm.primary_color})` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Format: hue saturation% lightness% (e.g., "27 92% 53%")
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>Secondary Color (HSL)</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={editForm.secondary_color}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, secondary_color: e.target.value })
                                    }
                                    placeholder="201 100% 78%"
                                  />
                                  {editForm.secondary_color && (
                                    <div
                                      className="h-10 w-10 rounded-md border shrink-0"
                                      style={{ backgroundColor: `hsl(${editForm.secondary_color})` }}
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Logo Upload</Label>
                                <div className="flex gap-2">
                                  <Input type="file" accept="image/*" />
                                  <Button variant="outline" size="icon">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Recommended: 200x50px PNG with transparent background
                                </p>
                              </div>

                              {/* Preview */}
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </Label>
                                <div
                                  className="p-4 rounded-lg border"
                                  style={{
                                    background: `linear-gradient(135deg, hsl(${editForm.primary_color}) 0%, hsl(${editForm.secondary_color || editForm.primary_color}) 100%)`,
                                  }}
                                >
                                  <p className="text-white font-bold">
                                    {editForm.company_name || 'Company Name'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminBranding() {
  return (
    <SuperAdminRoute>
      <AdminBrandingContent />
    </SuperAdminRoute>
  );
}
