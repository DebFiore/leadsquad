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
import { Calendar, Database, Settings, CheckCircle2 } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  booking_process: z.string().min(1, 'Please select a booking process'),
  calendar_systems: z.array(z.string()).optional(),
  crm_system: z.string().optional(),
  crm_integration_notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step5Props {
  data: Partial<ClientIntakeResponse>;
  onSubmit: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const bookingProcessOptions = [
  { value: 'direct', label: 'Direct Booking', description: 'Agent books appointments directly into calendar' },
  { value: 'request', label: 'Booking Request', description: 'Agent collects info, team confirms appointment' },
  { value: 'callback', label: 'Callback Scheduling', description: 'Agent schedules a callback from your team' },
  { value: 'none', label: 'No Booking', description: 'Agent only collects information' },
];

const calendarSystemOptions = [
  { id: 'google_calendar', label: 'Google Calendar' },
  { id: 'outlook', label: 'Microsoft Outlook' },
  { id: 'calendly', label: 'Calendly' },
  { id: 'acuity', label: 'Acuity Scheduling' },
  { id: 'servicetitan', label: 'ServiceTitan' },
  { id: 'housecall_pro', label: 'Housecall Pro' },
  { id: 'jobber', label: 'Jobber' },
  { id: 'other', label: 'Other' },
];

const crmOptions = [
  { value: 'none', label: 'No CRM' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'servicetitan', label: 'ServiceTitan' },
  { value: 'housecall_pro', label: 'Housecall Pro' },
  { value: 'jobber', label: 'Jobber' },
  { value: 'gohighlevel', label: 'GoHighLevel' },
  { value: 'other', label: 'Other' },
];

export function Step5TechnicalCRM({ data, onSubmit, onBack, isSaving }: Step5Props) {
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Process
            </CardTitle>
            <CardDescription>
              How should your AI agent handle appointment scheduling?
            </CardDescription>
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
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {bookingProcessOptions.map((option) => (
                        <div key={option.value}>
                          <RadioGroupItem
                            value={option.value}
                            id={`booking-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`booking-${option.value}`}
                            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold">{option.label}</span>
                            <span className="text-sm text-muted-foreground mt-1">
                              {option.description}
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
              <Settings className="h-5 w-5 text-primary" />
              Calendar Systems
            </CardTitle>
            <CardDescription>
              Which calendar or scheduling systems do you use?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="calendar_systems"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {calendarSystemOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="calendar_systems"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
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
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              CRM Integration
            </CardTitle>
            <CardDescription>
              Which CRM system should we integrate with?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="crm_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CRM System</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3"
                    >
                      {crmOptions.map((option) => (
                        <div key={option.value}>
                          <RadioGroupItem
                            value={option.value}
                            id={`crm-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`crm-${option.value}`}
                            className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-sm"
                          >
                            {option.label}
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
                      placeholder="e.g., Need to sync contacts bidirectionally. Want call recordings attached to contact records. Specific custom fields to populate..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Any specific requirements for your CRM integration
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
          <Button type="submit" disabled={isSaving} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {isSaving ? 'Completing Setup...' : 'Complete Agent Setup'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
