import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ClipboardList, PhoneIncoming, PhoneOutgoing, ArrowRightLeft } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  info_to_collect: z.array(z.string()).min(1, 'Select at least one piece of information to collect'),
  inbound_goals: z.string().optional(),
  outbound_goals: z.string().optional(),
  transfer_protocols: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step4Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const infoToCollectOptions = [
  { id: 'name', label: 'Full Name' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'email', label: 'Email Address' },
  { id: 'address', label: 'Service Address' },
  { id: 'issue', label: 'Description of Issue/Need' },
  { id: 'urgency', label: 'Urgency Level' },
  { id: 'availability', label: 'Availability/Preferred Times' },
  { id: 'budget', label: 'Budget Range' },
  { id: 'decision_maker', label: 'Decision Maker Status' },
  { id: 'referral', label: 'How They Found You' },
];

export function Step4CallFlow({ data, onNext, onBack, isSaving }: Step4Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      info_to_collect: data.info_to_collect || ['name', 'phone', 'email'],
      inbound_goals: data.inbound_goals?.join('\n') || '',
      outbound_goals: data.outbound_goals?.join('\n') || '',
      transfer_protocols: data.transfer_protocols || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      info_to_collect: values.info_to_collect,
      inbound_goals: values.inbound_goals?.split('\n').map(s => s.trim()).filter(Boolean) || [],
      outbound_goals: values.outbound_goals?.split('\n').map(s => s.trim()).filter(Boolean) || [],
      transfer_protocols: values.transfer_protocols || null,
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
              name="info_to_collect"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {infoToCollectOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="info_to_collect"
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
                                      ? field.onChange([...field.value, item.id])
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIncoming className="h-5 w-5 text-green-600" />
                Inbound Call Goals
              </CardTitle>
              <CardDescription>
                Primary objectives when receiving calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="inbound_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g.,&#10;Book an appointment&#10;Qualify the lead&#10;Collect contact information&#10;Answer basic questions&#10;Transfer to technician if urgent"
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      One goal per line, in order of priority
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
                <PhoneOutgoing className="h-5 w-5 text-blue-600" />
                Outbound Call Goals
              </CardTitle>
              <CardDescription>
                Primary objectives when making calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="outbound_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g.,&#10;Confirm scheduled appointments&#10;Follow up on estimates&#10;Collect customer feedback&#10;Offer seasonal promotions&#10;Reactivate past customers"
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      One goal per line, in order of priority
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

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
              name="transfer_protocols"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g.,&#10;Transfer immediately if caller mentions emergency or safety issue.&#10;Transfer to sales for quotes over $5,000.&#10;Transfer to owner if caller asks for manager.&#10;Take message if no one available - promise callback within 1 hour."
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
