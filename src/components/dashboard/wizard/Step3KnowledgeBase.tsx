import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HelpCircle, AlertTriangle, DollarSign, MessageSquare } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  top_customer_questions: z.string().min(1, 'Please add at least one common question'),
  common_objections: z.string().optional(),
  objection_responses: z.string().optional(),
  pricing_strategy: z.string().min(1, 'Please select a pricing strategy'),
  pricing_details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step3Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const pricingStrategies = [
  { value: 'exact', label: 'Provide Exact Pricing', description: 'Agent quotes specific prices for services' },
  { value: 'ranges', label: 'Give Price Ranges', description: 'Agent provides general price ranges' },
  { value: 'quote', label: 'Schedule for Quote', description: 'Agent schedules appointments for estimates' },
  { value: 'never', label: 'Never Discuss Pricing', description: 'Agent redirects all pricing questions' },
];

export function Step3KnowledgeBase({ data, onNext, onBack, isSaving }: Step3Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      top_customer_questions: data.top_customer_questions?.join('\n') || '',
      common_objections: data.common_objections?.join('\n') || '',
      objection_responses: data.objection_responses 
        ? Object.entries(data.objection_responses).map(([k, v]) => `${k}: ${v}`).join('\n') 
        : '',
      pricing_strategy: data.pricing_strategy || '',
      pricing_details: data.pricing_details || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    // Parse objection responses into key-value pairs
    const objectionResponses: Record<string, string> = {};
    if (values.objection_responses) {
      values.objection_responses.split('\n').forEach(line => {
        const [objection, ...responseParts] = line.split(':');
        if (objection && responseParts.length > 0) {
          objectionResponses[objection.trim()] = responseParts.join(':').trim();
        }
      });
    }

    onNext({
      top_customer_questions: values.top_customer_questions.split('\n').map(s => s.trim()).filter(Boolean),
      common_objections: values.common_objections?.split('\n').map(s => s.trim()).filter(Boolean) || [],
      objection_responses: Object.keys(objectionResponses).length > 0 ? objectionResponses : null,
      pricing_strategy: values.pricing_strategy,
      pricing_details: values.pricing_details || null,
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
              What are the 5 most common questions your customers ask? Your AI will be trained to answer these.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="top_customer_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Questions *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;How much does a drain cleaning cost?&#10;Do you offer emergency services?&#10;How soon can you come out?&#10;Are you licensed and insured?&#10;Do you offer financing?"
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    One question per line (aim for 5-10 questions)
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
              What objections do customers commonly raise, and how should your agent respond?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="common_objections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Objections</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;That's too expensive&#10;I need to think about it&#10;I'm getting other quotes&#10;Can you do it cheaper?"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    One objection per line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objection_responses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Objection Responses
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;Too expensive: I understand budget is important. We offer financing options and our pricing includes a full warranty.&#10;Need to think: Absolutely, take your time. Would you like me to send you more information via email?"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Format: Objection: Response (one per line)
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
              name="pricing_strategy"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {pricingStrategies.map((strategy) => (
                        <div key={strategy.value}>
                          <RadioGroupItem
                            value={strategy.value}
                            id={`pricing-${strategy.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`pricing-${strategy.value}`}
                            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold">{strategy.label}</span>
                            <span className="text-sm text-muted-foreground mt-1">
                              {strategy.description}
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
              name="pricing_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Details (if applicable)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;Drain cleaning: $99-$199&#10;Water heater install: $1,500-$3,000&#10;Service call fee: $49 (waived with repair)"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add specific prices or ranges your agent can reference
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
