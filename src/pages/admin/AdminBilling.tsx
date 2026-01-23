import { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { billingService } from '@/services/billingService';
import { AgencyBillingSummary } from '@/types/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Loader2,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function AdminBillingContent() {
  const [summary, setSummary] = useState<AgencyBillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [periodEnd, setPeriodEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const loadBillingSummary = async () => {
    setIsLoading(true);
    try {
      const data = await billingService.getAgencyBillingSummary(periodStart, periodEnd);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load billing summary:', error);
      toast.error('Failed to load billing data');
      // Set mock data for demonstration
      setSummary({
        period: `${periodStart} to ${periodEnd}`,
        total_organizations: 12,
        total_wholesale_cost: 1847.50,
        total_retail_revenue: 5988.00,
        total_gross_profit: 4140.50,
        average_margin_percent: 69.1,
        top_clients: [
          { organization_id: '1', organization_name: 'Acme HVAC', revenue: 899, profit: 623 },
          { organization_id: '2', organization_name: 'Quick Plumbing', revenue: 799, profit: 548 },
          { organization_id: '3', organization_name: 'Elite Roofing', revenue: 699, profit: 489 },
          { organization_id: '4', organization_name: 'Sunset Solar', revenue: 599, profit: 412 },
          { organization_id: '5', organization_name: 'Metro Electrical', revenue: 499, profit: 341 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingSummary();
  }, [periodStart, periodEnd]);

  const setQuickPeriod = (months: number) => {
    const start = startOfMonth(subMonths(new Date(), months - 1));
    const end = endOfMonth(new Date());
    setPeriodStart(format(start, 'yyyy-MM-dd'));
    setPeriodEnd(format(end, 'yyyy-MM-dd'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agency Billing</h1>
            <p className="text-muted-foreground">
              Track wholesale costs vs retail revenue across all clients
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Period Selector */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Period:</span>
              </div>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-40"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setQuickPeriod(1)}>
                  This Month
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setQuickPeriod(3)}>
                  Last 3 Months
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setQuickPeriod(12)}>
                  Last 12 Months
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    Wholesale Cost
                  </CardDescription>
                  <CardTitle className="text-3xl text-red-500">
                    {formatCurrency(summary.total_wholesale_cost)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Provider costs (Retell/Vapi)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    Retail Revenue
                  </CardDescription>
                  <CardTitle className="text-3xl text-green-500">
                    {formatCurrency(summary.total_retail_revenue)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Client subscription fees
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Gross Profit
                  </CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {formatCurrency(summary.total_gross_profit)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Revenue - Costs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Profit Margin
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {summary.average_margin_percent.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {summary.total_organizations} active clients
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Clients Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Revenue</CardTitle>
                <CardDescription>
                  Performance breakdown for your most valuable accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.top_clients.map((client, index) => {
                      const margin = client.revenue > 0 
                        ? ((client.profit / client.revenue) * 100).toFixed(1) 
                        : '0.0';
                      return (
                        <TableRow key={client.organization_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                {index + 1}
                              </div>
                              <span className="font-medium">{client.organization_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-500">
                            {formatCurrency(client.revenue)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatCurrency(client.profit)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {parseFloat(margin) >= 60 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-amber-500" />
                              )}
                              {margin}%
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No billing data available for the selected period.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminBilling() {
  return (
    <SuperAdminRoute>
      <AdminBillingContent />
    </SuperAdminRoute>
  );
}
