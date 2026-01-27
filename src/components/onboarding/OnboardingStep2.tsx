import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle, Sparkles, Ban, HelpCircle, AlertTriangle } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  communication_style: z.string().min(1, 'Please select a communication style'),
  words_to_use: z.string().optional(),
  words_to_avoid: z.string().optional(),
  ideal_customer_tone: z.string().optional(),
  frequent_questions: z.string().min(1, 'Add at least one common question'),
  common_objections: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step2Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const communicationStyles = [
  { value: 'friendly', label: 'Friendly & Warm', description: 'Casual, approachable' },
  { value: 'professional', label: 'Professional', description: 'Polished, formal' },
  { value: 'energetic', label: 'Energetic', description: 'Upbeat, enthusiastic' },
  { value: 'calm', label: 'Calm & Reassuring', description: 'Patient, soothing' },
  { value: 'direct', label: 'Direct & Efficient', description: 'To the point' },
];

export function OnboardingStep2({ data, onNext, onBack, isSaving }: Step2Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      communication_style: data.communication_style || '',
      words_to_use: data.words_to_use || '',
      words_to_avoid: data.words_to_avoid || '',
      ideal_customer_tone: data.ideal_customer_tone || '',
      frequent_questions: data.frequent_questions || '',
      common_objections: data.common_objections || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      communication_style: values.communication_style,
      words_to_use: values.words_to_use || null,
      words_to_avoid: values.words_to_avoid || null,
      ideal_customer_tone: values.ideal_customer_tone || null,
      frequent_questions: values.frequent_questions,
      common_objections: values.common_objections || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Define Your Brand Voice</h2>
          <p className="text-muted-foreground mt-2">
            How should your AI agent communicate with customers?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="communication_style"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {communicationStyles.map((style) => (
                        <div key={style.value}>
                          <RadioGroupItem value={style.value} id={style.value} className="peer sr-only" />
                          <Label
                            htmlFor={style.value}
                            className="flex flex-col items-start rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold text-sm">{style.label}</span>
                            <span className="text-xs text-muted-foreground">{style.description}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Brand Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ideal_customer_tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ideal Customer Tone</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how you want the agent to sound when speaking with your ideal customer..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="words_to_use"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-600 flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Words/Phrases to Use
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="We'd be happy to help&#10;Let me get you scheduled" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Key phrases your brand uses</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="words_to_avoid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-destructive flex items-center gap-1">
                      <Ban className="h-4 w-4" />
                      Words/Phrases to Avoid
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="No problem&#10;I don't know" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Words that don't fit your brand</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
              Customer Questions & Objections
            </CardTitle>
            <CardDescription>What do customers commonly ask or push back on?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="frequent_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequently Asked Questions *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How much does a drain cleaning cost?&#10;Do you offer emergency services?&#10;How soon can you come out?&#10;Are you licensed and insured?&#10;Do you offer financing?"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>List the top questions customers ask</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="common_objections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Common Objections
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="That's too expensive&#10;I need to think about it&#10;I'm getting other quotes"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Objections customers commonly raise</FormDescription>
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
