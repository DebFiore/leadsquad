import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  icon: React.ReactNode;
  current: number;
  limit: number;
  unit: string;
}

export function UsageMeter({ label, icon, current, limit, unit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toFixed(num % 1 === 0 ? 0 : 1);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatNumber(current)} / {formatNumber(limit)} {unit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-2',
          isOverLimit && '[&>div]:bg-destructive',
          isNearLimit && !isOverLimit && '[&>div]:bg-yellow-500'
        )}
      />
      <p className="text-xs text-muted-foreground">
        {Math.max(0, limit - current).toFixed(0)} {unit} remaining
      </p>
    </div>
  );
}
