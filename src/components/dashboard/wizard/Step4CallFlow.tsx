import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ClipboardList, Target, ArrowRightLeft } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  essential_info_to_collect: z.string().min(1, 'Please specify what info to collect'),
  hot_lead_criteria: z.string().optional(),
  qualifying_questions: z.string().optional(),
  escalation_situations: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step4Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

export function Step4CallFlow({ data, onNext, onBack, isSaving }: Step4Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      essential_info_to_collect: data.essential_info_to_collect || '',
      hot_lead_criteria: data.hot_lead_criteria || '',
      qualifying_questions: data.qualifying_questions || '',
      escalation_situations: data.escalation_situations || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      essential_info_to_collect: values.essential_info_to_collect,
      hot_lead_criteria: values.hot_lead_criteria || null,
      qualifying_questions: values.qualifying_questions || null,
      escalation_situations: values.escalation_situations || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Information to Collect
            </CardTitle>
            <CardDescription>
              What information should your AI agent gather from every caller?
            </CardDescription>
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
                      placeholder="e.g., Full name&#10;Phone number&#10;Email address&#10;Service address&#10;Description of issue&#10;Preferred appointment time"
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    List the key information your agent should gather
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
              <Target className="h-5 w-5 text-primary" />
              Lead Qualification
            </CardTitle>
            <CardDescription>
              How should your agent identify and qualify leads?
            </CardDescription>
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
                      placeholder="e.g., Ready to book today&#10;Has budget approved&#10;Emergency situation&#10;Decision maker on call"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    What makes a lead "hot"?
                  </FormDescription>
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
                      placeholder="e.g., Are you the homeowner?&#10;What's your timeline?&#10;Have you gotten other quotes?"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Questions to qualify leads
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
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Transfer Protocols
            </CardTitle>
            <CardDescription>
              When and how should calls be transferred to a human?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="escalation_situations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation Situations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Transfer immediately if caller mentions emergency or safety issue.&#10;Transfer to sales for quotes over $5,000.&#10;Transfer to owner if caller asks for manager."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe scenarios and the appropriate response
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
            {isSaving ? 'Saving...' : 'Continue to Technical & CRM'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
