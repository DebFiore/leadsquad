// src/pages/dashboard/Leads.tsx
import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Upload, 
  Trash2, 
  Users,
  Phone,
  Mail,
  Building,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import { useLeads, useLeadStats, useDeleteLead, useBulkDeleteLeads, useAssignLeadsToCampaign } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Lead, LeadStatus } from '@/types/leads';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { CSVImportWizard } from '@/components/leads/CSVImportWizard';
import { BulkActionsBar } from '@/components/leads/BulkActionsBar';
import { formatDistanceToNow } from 'date-fns';
import { formatPhoneNumber } from '@/lib/phoneUtils';

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  qualified: { label: 'Qualified', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  appointment_set: { label: 'Appointment Set', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  converted: { label: 'Converted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  not_interested: { label: 'Not Interested', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  do_not_call: { label: 'Do Not Call', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  invalid: { label: 'Invalid', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: leadsData, isLoading } = useLeads();
  const { data: campaigns } = useCampaigns();
  const { data: stats } = useLeadStats();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();
  const assignToCampaign = useAssignLeadsToCampaign();

  const leads = leadsData?.leads || [];

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone_number?.includes(searchQuery) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter;
      const matchesCampaign = campaignFilter === 'all' || 
        (campaignFilter === 'none' ? !lead.campaign_id : lead.campaign_id === campaignFilter);
      
      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [leads, searchQuery, statusFilter, campaignFilter]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const clearSelection = () => setSelectedLeads(new Set());

  // Bulk actions
  const handleBulkDelete = () => {
    bulkDelete.mutate(Array.from(selectedLeads), {
      onSuccess: () => clearSelection(),
    });
  };

  const handleBulkAssign = (campaignId: string | null) => {
    assignToCampaign.mutate(
      { leadIds: Array.from(selectedLeads), campaignId },
      { onSuccess: () => clearSelection() }
    );
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const isAllSelected = filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length;
  const hasSelection = selectedLeads.size > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage your leads database and import contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportWizardOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.total || leads.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.new || 0}</p>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <Phone className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.contacted || 0}</p>
                  <p className="text-sm text-muted-foreground">Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.converted || 0}</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={campaignFilter}
                onValueChange={setCampaignFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="none">No Campaign</SelectItem>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {hasSelection && (
          <BulkActionsBar
            selectedCount={selectedLeads.size}
            onClear={clearSelection}
            onDelete={handleBulkDelete}
            onAssign={handleBulkAssign}
            campaigns={campaigns || []}
            isDeleting={bulkDelete.isPending}
            isAssigning={assignToCampaign.isPending}
          />
        )}

        {/* Leads Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mb-2">
                  {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
                </CardTitle>
                <CardDescription className="text-center max-w-sm mb-4">
                  {leads.length === 0 
                    ? 'Import leads from a CSV file or add them manually.'
                    : 'Try adjusting your search or filter criteria.'}
                </CardDescription>
                {leads.length === 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setImportWizardOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleLeadClick(lead)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {lead.first_name || lead.last_name 
                            ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                            : 'Unknown'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {formatPhoneNumber(lead.phone_number)}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.company ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            {lead.company}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[lead.lead_status].color}>
                          {statusConfig[lead.lead_status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.campaign_id ? (
                          <Badge variant="outline">
                            {campaigns?.find(c => c.id === lead.campaign_id)?.name || 'Unknown'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>{lead.total_calls}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleLeadClick(lead)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteLead.mutate(lead.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Lead Dialog */}
      <AddLeadDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        campaigns={campaigns || []}
      />

      {/* CSV Import Wizard */}
      <CSVImportWizard
        open={importWizardOpen}
        onOpenChange={setImportWizardOpen}
        campaigns={campaigns || []}
      />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        campaigns={campaigns || []}
      />
    </DashboardLayout>
  );
}
