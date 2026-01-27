import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HelpCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  frequent_questions: z.string().min(1, 'Please add at least one common question'),
  common_objections: z.string().optional(),
  pricing_discussion_approach: z.string().min(1, 'Please select a pricing approach'),
  current_promotions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step3Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const pricingApproaches = [
  { value: 'exact', label: 'Provide Exact Pricing', description: 'Agent quotes specific prices for services' },
  { value: 'ranges', label: 'Give Price Ranges', description: 'Agent provides general price ranges' },
  { value: 'quote', label: 'Schedule for Quote', description: 'Agent schedules appointments for estimates' },
  { value: 'never', label: 'Never Discuss Pricing', description: 'Agent redirects all pricing questions' },
];

export function Step3KnowledgeBase({ data, onNext, onBack, isSaving }: Step3Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequent_questions: data.frequent_questions || '',
      common_objections: data.common_objections || '',
      pricing_discussion_approach: data.pricing_discussion_approach || '',
      current_promotions: data.current_promotions || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      frequent_questions: values.frequent_questions,
      common_objections: values.common_objections || null,
      pricing_discussion_approach: values.pricing_discussion_approach,
      current_promotions: values.current_promotions || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Top Customer Questions
            </CardTitle>
            <CardDescription>
              What are the most common questions your customers ask? Your AI will be trained to answer these.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="frequent_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequently Asked Questions *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., How much does a drain cleaning cost?&#10;Do you offer emergency services?&#10;How soon can you come out?&#10;Are you licensed and insured?&#10;Do you offer financing?"
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    List the common questions customers ask
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Objection Handling
            </CardTitle>
            <CardDescription>
              What objections do customers commonly raise?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="common_objections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Objections</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., That's too expensive&#10;I need to think about it&#10;I'm getting other quotes&#10;Can you do it cheaper?"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    List the objections customers commonly raise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing Strategy
            </CardTitle>
            <CardDescription>
              How should your AI agent handle pricing questions?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pricing_discussion_approach"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {pricingApproaches.map((approach) => (
                        <div key={approach.value}>
                          <RadioGroupItem
                            value={approach.value}
                            id={`pricing-${approach.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`pricing-${approach.value}`}
                            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold">{approach.label}</span>
                            <span className="text-sm text-muted-foreground mt-1">
                              {approach.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_promotions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Promotions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., 10% off first service&#10;Free estimates&#10;Senior discount available"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Any active promotions the agent should mention
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue to Call Flow'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
