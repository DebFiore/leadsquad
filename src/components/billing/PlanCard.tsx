import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  popular?: boolean;
  features: string[];
  limits: {
    minutes: number;
    campaigns: number;
    leads: number;
  };
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isCurrentPlan, isLoading, onSelect }: PlanCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all hover:shadow-lg',
        plan.popular && 'border-primary shadow-md',
        isCurrentPlan && 'ring-2 ring-primary'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1 mt-2">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
          disabled={isCurrentPlan || isLoading}
          onClick={onSelect}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            'Upgrade'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
