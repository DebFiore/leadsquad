import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { retellWorkspaceService } from '@/services/retellWorkspaceService';
import { UsageProgress } from '@/types/retell';

interface UsageMonitorProps {
  organizationId: string;
}

export function UsageMonitor({ organizationId }: UsageMonitorProps) {
  const [usage, setUsage] = useState<UsageProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsage = async () => {
    try {
      const data = await retellWorkspaceService.getUsageProgress(organizationId);
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
      // Set mock data for demo
      setUsage({
        used_minutes: 342,
        included_minutes: 500,
        percentage: 68.4,
        overage_minutes: 0,
        estimated_overage_cost: 0,
        days_remaining: 12,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, [organizationId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsage();
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const isNearLimit = usage.percentage >= 80;
  const isOverLimit = usage.overage_minutes > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Monthly Usage</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          {usage.days_remaining} days remaining in billing cycle
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Minutes Used</span>
            <span className="font-medium">
              {usage.used_minutes.toLocaleString()} / {usage.included_minutes.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={usage.percentage} 
            className={`h-3 ${isOverLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usage.percentage.toFixed(1)}% used</span>
            <span>{usage.included_minutes - usage.used_minutes} mins remaining</span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          {isOverLimit ? (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overage: {usage.overage_minutes} mins (${usage.estimated_overage_cost.toFixed(2)})
            </Badge>
          ) : isNearLimit ? (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Approaching Limit
            </Badge>
          ) : (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
              On Track
            </Badge>
          )}
        </div>

        {/* Projection */}
        {!isOverLimit && usage.days_remaining > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="text-muted-foreground">
              At this rate, you'll use approximately{' '}
              <span className="font-medium text-foreground">
                {Math.round((usage.used_minutes / (30 - usage.days_remaining)) * 30).toLocaleString()}
              </span>{' '}
              minutes this month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
