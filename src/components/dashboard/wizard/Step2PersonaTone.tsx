import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle, Sparkles, Ban } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  communication_style: z.string().min(1, 'Please select a communication style'),
  words_to_use: z.string().optional(),
  words_to_avoid: z.string().optional(),
  ideal_customer_tone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step2Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const communicationStyles = [
  { value: 'friendly', label: 'Friendly & Warm', description: 'Casual, approachable, uses first names' },
  { value: 'professional', label: 'Professional', description: 'Polished, formal, business-focused' },
  { value: 'energetic', label: 'Energetic & Enthusiastic', description: 'Upbeat, excited, motivating' },
  { value: 'calm', label: 'Calm & Reassuring', description: 'Patient, soothing, builds trust' },
  { value: 'direct', label: 'Direct & Efficient', description: 'To the point, no-nonsense, time-conscious' },
];

export function Step2PersonaTone({ data, onNext, onBack, isSaving }: Step2Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      communication_style: data.communication_style || '',
      words_to_use: data.words_to_use || '',
      words_to_avoid: data.words_to_avoid || '',
      ideal_customer_tone: data.ideal_customer_tone || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      communication_style: values.communication_style,
      words_to_use: values.words_to_use || null,
      words_to_avoid: values.words_to_avoid || null,
      ideal_customer_tone: values.ideal_customer_tone || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Communication Style
            </CardTitle>
            <CardDescription>
              How should your AI agent sound when speaking with customers?
            </CardDescription>
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
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {communicationStyles.map((style) => (
                        <div key={style.value}>
                          <RadioGroupItem
                            value={style.value}
                            id={style.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={style.value}
                            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold">{style.label}</span>
                            <span className="text-sm text-muted-foreground mt-1">
                              {style.description}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Brand Language
            </CardTitle>
            <CardDescription>
              Define the tone and phrases for your brand
            </CardDescription>
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
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Sparkles className="h-5 w-5" />
                Words to Use
              </CardTitle>
              <CardDescription>
                Specific phrases your brand prefers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="words_to_use"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., We'd be happy to help with that&#10;Let me get you scheduled&#10;That's a great question"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Key phrases your brand uses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                Words to Avoid
              </CardTitle>
              <CardDescription>
                Words or phrases that don't fit your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="words_to_avoid"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., No problem&#10;I don't know&#10;That's not my department"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Words that don't fit your brand
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue to Knowledge Base'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
