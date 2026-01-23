import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, Database, Rocket } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  booking_process: z.string().min(1, 'Please select a booking process'),
  calendar_systems: z.array(z.string()).optional(),
  crm_system: z.string().optional(),
  crm_integration_notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step4Props {
  data: Partial<ClientIntakeResponse>;
  onSubmit: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const bookingOptions = [
  { value: 'direct', label: 'Direct Booking', description: 'Book directly into calendar' },
  { value: 'request', label: 'Booking Request', description: 'Team confirms appointment' },
  { value: 'callback', label: 'Callback Only', description: 'Schedule team callback' },
  { value: 'none', label: 'No Booking', description: 'Information only' },
];

const calendarOptions = [
  { id: 'google_calendar', label: 'Google Calendar' },
  { id: 'outlook', label: 'Outlook' },
  { id: 'calendly', label: 'Calendly' },
  { id: 'servicetitan', label: 'ServiceTitan' },
  { id: 'housecall_pro', label: 'Housecall Pro' },
  { id: 'jobber', label: 'Jobber' },
];

const crmOptions = [
  { value: 'none', label: 'None' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'servicetitan', label: 'ServiceTitan' },
  { value: 'housecall_pro', label: 'Housecall Pro' },
  { value: 'gohighlevel', label: 'GoHighLevel' },
  { value: 'other', label: 'Other' },
];

export function OnboardingStep4({ data, onSubmit, onBack, isSaving }: Step4Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      booking_process: data.booking_process || '',
      calendar_systems: data.calendar_systems || [],
      crm_system: data.crm_system || 'none',
      crm_integration_notes: data.crm_integration_notes || '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      booking_process: values.booking_process,
      calendar_systems: values.calendar_systems || [],
      crm_system: values.crm_system || null,
      crm_integration_notes: values.crm_integration_notes || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Connect Your Tools</h2>
          <p className="text-muted-foreground mt-2">
            Set up integrations with your calendar and CRM systems.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="booking_process"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      {bookingOptions.map((opt) => (
                        <div key={opt.value}>
                          <RadioGroupItem value={opt.value} id={`booking-${opt.value}`} className="peer sr-only" />
                          <Label
                            htmlFor={`booking-${opt.value}`}
                            className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{opt.description}</span>
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
            <CardTitle className="text-lg">Calendar Systems</CardTitle>
            <CardDescription>Which scheduling tools do you use?</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="calendar_systems"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {calendarOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="calendar_systems"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(field.value?.filter((v) => v !== item.id))
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              CRM System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="crm_system"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-4 gap-2"
                    >
                      {crmOptions.map((opt) => (
                        <div key={opt.value}>
                          <RadioGroupItem value={opt.value} id={`crm-${opt.value}`} className="peer sr-only" />
                          <Label
                            htmlFor={`crm-${opt.value}`}
                            className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer text-sm"
                          >
                            {opt.label}
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
              name="crm_integration_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any specific CRM requirements or custom fields to sync..."
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

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg" disabled={isSaving} className="gap-2">
            <Rocket className="h-4 w-4" />
            {isSaving ? 'Building Your Voice Pod...' : 'Complete Setup'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
