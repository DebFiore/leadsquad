import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, MapPin, Clock } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.string().optional(),
  services_offered: z.string().min(1, 'Please list your services'),
  business_coverage: z.string().min(1, 'Service area is required'),
  hours_of_operation: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step1Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  isSaving: boolean;
}

export function Step1BusinessProfile({ data, onNext, isSaving }: Step1Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: data.business_name || '',
      business_type: data.business_type || '',
      services_offered: data.services_offered || '',
      business_coverage: data.business_coverage || '',
      hours_of_operation: data.hours_of_operation || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      business_name: values.business_name,
      business_type: values.business_type || null,
      services_offered: values.services_offered,
      business_coverage: values.business_coverage,
      hours_of_operation: values.hours_of_operation || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
            <CardDescription>
              Tell us about your business so your AI agent can represent you accurately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith Plumbing & HVAC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home Services, HVAC Contractor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="services_offered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services Offered *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Plumbing repairs, Water heater installation, Drain cleaning, HVAC maintenance"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your main services
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_coverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Service Area *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Greater Phoenix Metro Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours_of_operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Hours of Operation
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mon-Fri 8am-6pm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue to Persona & Tone'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
