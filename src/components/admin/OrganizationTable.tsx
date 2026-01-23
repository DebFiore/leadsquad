import { useState } from 'react';
import { Organization } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Building2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OrganizationTableProps {
  organizations: Organization[];
  onSelectOrganization: (org: Organization) => void;
  selectedOrgId?: string;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  active: { label: 'Active', variant: 'default' as const, icon: CheckCircle },
  flagged: { label: 'Flagged', variant: 'destructive' as const, icon: AlertCircle },
  needs_clarification: { label: 'Needs Clarification', variant: 'outline' as const, icon: AlertCircle },
};

export function OrganizationTable({ 
  organizations, 
  onSelectOrganization,
  selectedOrgId 
}: OrganizationTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by business name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No organizations match your search' : 'No organizations found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => {
                const status = statusConfig[org.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <TableRow 
                    key={org.id}
                    className={`cursor-pointer transition-colors ${
                      selectedOrgId === org.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => onSelectOrganization(org)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {org.industry || '—'}
                    </TableCell>
                    <TableCell>
                      {org.onboarding_completed ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {org.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(org.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
