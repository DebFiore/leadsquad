import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Zap, 
  Clock, 
  Phone, 
  ExternalLink,
  AlertTriangle,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useSubscription, useCurrentUsage, useUsageHistory } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { PlanCard } from '@/components/billing/PlanCard';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 197,
    priceId: 'price_starter_monthly',
    features: [
      '100 minutes/month',
      '1 campaign',
      '500 leads',
      'Email support',
      'Basic analytics',
    ],
    limits: {
      minutes: 100,
      campaigns: 1,
      leads: 500,
    },
  },
  {
    id: 'professional',
    name: 'Scale',
    price: 497,
    priceId: 'price_professional_monthly',
    popular: true,
    features: [
      '500 minutes/month',
      '5 campaigns',
      '5,000 leads',
      'Priority support',
      'Advanced analytics',
      'Custom voice',
      'API access',
    ],
    limits: {
      minutes: 500,
      campaigns: 5,
      leads: 5000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 997,
    priceId: 'price_enterprise_monthly',
    features: [
      '2,000 minutes/month',
      'Unlimited campaigns',
      'Unlimited leads',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'Custom training',
    ],
    limits: {
      minutes: 2000,
      campaigns: -1,
      leads: -1,
    },
  },
];

export default function Billing() {
  const [searchParams] = useSearchParams();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { organization } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useCurrentUsage();
  const { data: usageHistory } = useUsageHistory(30);

  const currentPlan = PLANS.find(p => p.id === subscription?.plan_name) || PLANS[0];
  const isLoading = subLoading || usageLoading;

  // Handle success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription updated successfully!');
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout was canceled.');
    }
  }, [searchParams]);

  const handleUpgrade = async (priceId: string, planId: string) => {
    setSelectedPlan(planId);
    setIsLoadingCheckout(true);

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          organizationId: organization?.id,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoadingCheckout(false);
      setSelectedPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);

    try {
      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization?.id,
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  // Calculate usage percentages
  const minutesPercent = subscription?.monthly_minutes_limit
    ? Math.min((usage?.minutesUsed || 0) / subscription.monthly_minutes_limit * 100, 100)
    : 0;

  const isNearLimit = minutesPercent >= 80;
  const isOverLimit = minutesPercent >= 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your plan, view usage, and update payment methods
            </p>
          </div>
          {subscription?.stripe_customer_id && (
            <Button onClick={handleManageSubscription} disabled={isLoadingPortal}>
              {isLoadingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Current Plan & Usage */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Plan Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Current Plan</CardTitle>
                    </div>
                    <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                      {subscription?.status || 'No subscription'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{currentPlan.name}</span>
                    <span className="text-muted-foreground">
                      ${currentPlan.price}/month
                    </span>
                  </div>

                  {subscription?.current_period_end && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </div>
                  )}

                  {subscription?.cancel_at && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Cancellation scheduled</p>
                          <p className="text-sm text-muted-foreground">
                            Your plan will end on {format(new Date(subscription.cancel_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Current Usage
                  </CardTitle>
                  <CardDescription>
                    {subscription?.current_period_start && subscription?.current_period_end && (
                      <>
                        Billing period: {format(new Date(subscription.current_period_start), 'MMM d')} - {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <UsageMeter
                      label="Voice Minutes"
                      icon={<Clock className="h-4 w-4" />}
                      current={usage?.minutesUsed || 0}
                      limit={subscription?.monthly_minutes_limit || 100}
                      unit="minutes"
                    />
                    <UsageMeter
                      label="Calls Made"
                      icon={<Phone className="h-4 w-4" />}
                      current={usage?.callsUsed || 0}
                      limit={subscription?.monthly_calls_limit || 500}
                      unit="calls"
                    />
                  </div>

                  {isNearLimit && !isOverLimit && (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-500">Approaching usage limit</p>
                          <p className="text-sm text-muted-foreground">
                            You've used {minutesPercent.toFixed(0)}% of your minutes. Consider upgrading to avoid interruptions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isOverLimit && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Usage limit reached</p>
                          <p className="text-sm text-muted-foreground">
                            You've used all your minutes for this billing period. Upgrade now to continue making calls.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Plans & Usage History Tabs */}
            <Tabs defaultValue="plans" className="space-y-4">
              <TabsList>
                <TabsTrigger value="plans">Available Plans</TabsTrigger>
                <TabsTrigger value="history">Usage History</TabsTrigger>
              </TabsList>

              <TabsContent value="plans">
                <div className="grid gap-6 md:grid-cols-3">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrentPlan={subscription?.plan_name === plan.id}
                      isLoading={isLoadingCheckout && selectedPlan === plan.id}
                      onSelect={() => handleUpgrade(plan.priceId, plan.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Usage History
                    </CardTitle>
                    <CardDescription>
                      Daily breakdown of your voice AI usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!usageHistory || usageHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">No usage data available for this period</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead className="text-right">Minutes</TableHead>
                            <TableHead className="text-right">Calls</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usageHistory.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                {format(new Date(record.usage_date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {record.provider}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {record.minutes_used.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-right">
                                {record.calls_made}
                              </TableCell>
                              <TableCell className="text-right">
                                ${record.cost_amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
