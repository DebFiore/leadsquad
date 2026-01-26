import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("overflow-x-auto -mx-4 md:mx-0", className)}>
      <div className="inline-block min-w-full align-middle px-4 md:px-0">
        {children}
      </div>
    </div>
  );
}

interface MobileCardListProps<T> {
  items: T[];
  renderCard: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function MobileCardList<T>({ 
  items, 
  renderCard, 
  keyExtractor,
  className 
}: MobileCardListProps<T>) {
  return (
    <div className={cn("space-y-3 md:hidden", className)}>
      {items.map((item) => (
        <Card key={keyExtractor(item)}>
          <CardContent className="p-4">
            {renderCard(item)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
