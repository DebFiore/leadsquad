import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardList, Target, DollarSign } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  essential_info_to_collect: z.string().min(1, 'Please specify what info to collect'),
  hot_lead_criteria: z.string().optional(),
  qualifying_questions: z.string().optional(),
  escalation_situations: z.string().optional(),
  pricing_discussion_approach: z.string().min(1, 'Select a pricing approach'),
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
  { value: 'exact', label: 'Exact Pricing', description: 'Quote specific prices' },
  { value: 'ranges', label: 'Price Ranges', description: 'Provide general ranges' },
  { value: 'quote', label: 'Schedule Quote', description: 'Book for estimate' },
  { value: 'never', label: 'No Pricing', description: 'Redirect questions' },
];

export function OnboardingStep3({ data, onNext, onBack, isSaving }: Step3Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      essential_info_to_collect: data.essential_info_to_collect || '',
      hot_lead_criteria: data.hot_lead_criteria || '',
      qualifying_questions: data.qualifying_questions || '',
      escalation_situations: data.escalation_situations || '',
      pricing_discussion_approach: data.pricing_discussion_approach || '',
      current_promotions: data.current_promotions || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      essential_info_to_collect: values.essential_info_to_collect,
      hot_lead_criteria: values.hot_lead_criteria || null,
      qualifying_questions: values.qualifying_questions || null,
      escalation_situations: values.escalation_situations || null,
      pricing_discussion_approach: values.pricing_discussion_approach,
      current_promotions: values.current_promotions || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Configure Call Logic</h2>
          <p className="text-muted-foreground mt-2">
            What information should your agent collect and how should they qualify leads?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Information to Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="essential_info_to_collect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essential Info to Collect *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Full name&#10;Phone number&#10;Email address&#10;Service address&#10;Description of issue&#10;Preferred appointment time"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>List the key information your agent should gather</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Lead Qualification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hot_lead_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hot Lead Criteria</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ready to book today&#10;Has budget approved&#10;Emergency situation&#10;Decision maker on call"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>What makes a lead "hot"?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualifying_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualifying Questions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Are you the homeowner?&#10;What's your timeline?&#10;Have you gotten other quotes?"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Questions to qualify leads</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="escalation_situations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation Situations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Emergency or safety issue&#10;Angry customer&#10;Complex technical question&#10;Request for manager"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>When should calls be transferred to a human?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing Strategy
            </CardTitle>
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
                      className="grid grid-cols-2 gap-3"
                    >
                      {pricingApproaches.map((s) => (
                        <div key={s.value}>
                          <RadioGroupItem value={s.value} id={`pricing-${s.value}`} className="peer sr-only" />
                          <Label
                            htmlFor={`pricing-${s.value}`}
                            className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold text-sm">{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.description}</span>
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
                      placeholder="10% off first service&#10;Free estimates&#10;Senior discount available"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Any active promotions the agent should mention</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
