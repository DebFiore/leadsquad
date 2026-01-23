import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, MapPin, Clock, Globe, Shield, Award } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_address: z.string().optional(),
  business_website: z.string().optional(),
  business_hours: z.string().optional(),
  services: z.string().min(1, 'Please list your services'),
  geographic_area: z.string().min(1, 'Service area is required'),
  years_in_business: z.coerce.number().min(0, 'Must be 0 or greater').nullable(),
  is_licensed_insured: z.boolean(),
  trust_factors: z.string().optional(),
  unique_selling_points: z.string().optional(),
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
      business_website: data.business_website || '',
      business_hours: data.business_hours || '',
      services: data.services?.join(', ') || '',
      geographic_area: data.geographic_area || '',
      years_in_business: data.years_in_business || null,
      is_licensed_insured: data.is_licensed_insured || false,
      trust_factors: data.trust_factors?.join(', ') || '',
      unique_selling_points: data.unique_selling_points?.join('\n') || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      business_name: values.business_name,
      business_address: values.business_address || null,
      business_website: values.business_website || null,
      business_hours: values.business_hours || null,
      services: values.services.split(',').map(s => s.trim()).filter(Boolean),
      geographic_area: values.geographic_area,
      years_in_business: values.years_in_business,
      is_licensed_insured: values.is_licensed_insured,
      trust_factors: values.trust_factors?.split(',').map(s => s.trim()).filter(Boolean) || [],
      unique_selling_points: values.unique_selling_points?.split('\n').map(s => s.trim()).filter(Boolean) || [],
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="www.yoursite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Business Hours
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Mon-Fri 8am-6pm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="business_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Phoenix, AZ 85001" {...field} />
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
                      placeholder="e.g., Plumbing repairs, Water heater installation, Drain cleaning"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Separated by commas</FormDescription>
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
                      <Input placeholder="Greater Phoenix Metro" {...field} />
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
                      <Input type="number" min="0" placeholder="15" {...field} value={field.value ?? ''} />
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Credentials & Trust Factors
            </CardTitle>
            <CardDescription>What makes your business stand out?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_licensed_insured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">We are Licensed & Insured</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trust_factors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Credentials</FormLabel>
                  <FormControl>
                    <Input placeholder="BBB A+ Rating, 500+ 5-star reviews" {...field} />
                  </FormControl>
                  <FormDescription>Separated by commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unique_selling_points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What Makes You Different? (USPs)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;Same-day service guaranteed&#10;Family owned since 1985&#10;Free estimates on all repairs"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>One per line</FormDescription>
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
