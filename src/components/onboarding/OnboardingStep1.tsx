import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, MapPin } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';
import { HoursOfOperationInput } from './HoursOfOperationInput';

const schema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_address: z.string().optional(),
  business_city: z.string().optional(),
  business_state: z.string().optional(),
  business_zip: z.string().optional(),
  hours_of_operation: z.string().optional(),
  business_coverage: z.string().min(1, 'Service area is required'),
  business_type: z.string().optional(),
  services_offered: z.string().min(1, 'Please list your services'),
});

type FormValues = z.infer<typeof schema>;

interface Step1Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  isSaving: boolean;
}

export function OnboardingStep1({ data, onNext, isSaving }: Step1Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: data.business_name || '',
      business_address: data.business_address || '',
      business_city: data.business_city || '',
      business_state: data.business_state || '',
      business_zip: data.business_zip || '',
      hours_of_operation: data.hours_of_operation || '',
      business_coverage: data.business_coverage || '',
      business_type: data.business_type || '',
      services_offered: data.services_offered || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      business_name: values.business_name,
      business_address: values.business_address || null,
      business_city: values.business_city || null,
      business_state: values.business_state || null,
      business_zip: values.business_zip || null,
      hours_of_operation: values.hours_of_operation || null,
      business_coverage: values.business_coverage,
      business_type: values.business_type || null,
      services_offered: values.services_offered,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Tell Us About Your Business</h2>
          <p className="text-muted-foreground mt-2">
            This information helps your AI agent represent your business accurately.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Phoenix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="AZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="85001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hours_of_operation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <HoursOfOperationInput 
                      value={field.value} 
                      onChange={field.onChange}
                    />
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
                      placeholder="e.g., Plumbing repairs, Water heater installation, Drain cleaning"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Describe your main services</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input placeholder="Greater Phoenix Metro Area" {...field} />
                  </FormControl>
                  <FormDescription>Geographic area you serve</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
