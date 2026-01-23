import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, MapPin, Shield, Award } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  services: z.string().min(1, 'Please list your services'),
  geographic_area: z.string().min(1, 'Geographic area is required'),
  years_in_business: z.coerce.number().min(0, 'Must be 0 or greater').nullable(),
  is_licensed_insured: z.boolean(),
  trust_factors: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step1Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  isSaving: boolean;
}

const trustFactorOptions = [
  'Licensed & Insured',
  'BBB Accredited',
  'Industry Certifications',
  'Money-Back Guarantee',
  'Free Estimates',
  '24/7 Availability',
  'Family Owned',
  'Veteran Owned',
];

export function Step1BusinessProfile({ data, onNext, isSaving }: Step1Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: data.business_name || '',
      services: data.services?.join(', ') || '',
      geographic_area: data.geographic_area || '',
      years_in_business: data.years_in_business || null,
      is_licensed_insured: data.is_licensed_insured || false,
      trust_factors: data.trust_factors?.join(', ') || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      business_name: values.business_name,
      services: values.services.split(',').map(s => s.trim()).filter(Boolean),
      geographic_area: values.geographic_area,
      years_in_business: values.years_in_business,
      is_licensed_insured: values.is_licensed_insured,
      trust_factors: values.trust_factors?.split(',').map(s => s.trim()).filter(Boolean) || [],
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
              name="services"
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
                    List your main services, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="geographic_area"
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
                name="years_in_business"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Years in Business
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="e.g., 15" 
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Trust Factors
            </CardTitle>
            <CardDescription>
              What makes your business trustworthy? These will be mentioned during calls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_licensed_insured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    We are Licensed & Insured
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trust_factors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Trust Factors</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., BBB A+ Rating, 500+ 5-star reviews, Same-day service available"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    List any certifications, awards, or trust signals (separated by commas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
