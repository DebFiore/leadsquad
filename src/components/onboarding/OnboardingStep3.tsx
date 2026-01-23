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
import { ClipboardList, PhoneIncoming, PhoneOutgoing, DollarSign } from 'lucide-react';
import { ClientIntakeResponse } from '@/types/database';

const schema = z.object({
  info_to_collect: z.array(z.string()).min(1, 'Select at least one'),
  inbound_goals: z.string().optional(),
  outbound_goals: z.string().optional(),
  transfer_protocols: z.string().optional(),
  pricing_strategy: z.string().min(1, 'Select a pricing strategy'),
  pricing_details: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step3Props {
  data: Partial<ClientIntakeResponse>;
  onNext: (data: Partial<ClientIntakeResponse>) => void;
  onBack: () => void;
  isSaving: boolean;
}

const infoOptions = [
  { id: 'name', label: 'Full Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'address', label: 'Service Address' },
  { id: 'issue', label: 'Issue Description' },
  { id: 'urgency', label: 'Urgency Level' },
  { id: 'availability', label: 'Availability' },
  { id: 'referral', label: 'How They Found You' },
];

const pricingStrategies = [
  { value: 'exact', label: 'Exact Pricing', description: 'Quote specific prices' },
  { value: 'ranges', label: 'Price Ranges', description: 'Provide general ranges' },
  { value: 'quote', label: 'Schedule Quote', description: 'Book for estimate' },
  { value: 'never', label: 'No Pricing', description: 'Redirect questions' },
];

export function OnboardingStep3({ data, onNext, onBack, isSaving }: Step3Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      info_to_collect: data.info_to_collect || ['name', 'phone', 'email'],
      inbound_goals: data.inbound_goals?.join('\n') || '',
      outbound_goals: data.outbound_goals?.join('\n') || '',
      transfer_protocols: data.transfer_protocols || '',
      pricing_strategy: data.pricing_strategy || '',
      pricing_details: data.pricing_details || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onNext({
      info_to_collect: values.info_to_collect,
      inbound_goals: values.inbound_goals?.split('\n').map(s => s.trim()).filter(Boolean) || [],
      outbound_goals: values.outbound_goals?.split('\n').map(s => s.trim()).filter(Boolean) || [],
      transfer_protocols: values.transfer_protocols || null,
      pricing_strategy: values.pricing_strategy,
      pricing_details: values.pricing_details || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Configure Call Logic</h2>
          <p className="text-muted-foreground mt-2">
            What information should your agent collect and what are your goals?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Information to Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="info_to_collect"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {infoOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="info_to_collect"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneIncoming className="h-5 w-5 text-green-600" />
                Inbound Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="inbound_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Book an appointment&#10;Qualify the lead&#10;Answer questions"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>One goal per line</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneOutgoing className="h-5 w-5 text-blue-600" />
                Outbound Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="outbound_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Confirm appointments&#10;Follow up on quotes&#10;Collect feedback"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>One goal per line</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pricing_strategy"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      {pricingStrategies.map((s) => (
                        <div key={s.value}>
                          <RadioGroupItem value={s.value} id={`pricing-${s.value}`} className="peer sr-only" />
                          <Label
                            htmlFor={`pricing-${s.value}`}
                            className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer"
                          >
                            <span className="font-semibold text-sm">{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.description}</span>
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
              name="pricing_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Details (if applicable)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Drain cleaning: $99-$199&#10;Service call: $49" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer Protocols</CardTitle>
            <CardDescription>When should calls be transferred to a human?</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="transfer_protocols"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Transfer if emergency or safety issue&#10;Transfer to sales for quotes over $5,000"
                      className="min-h-[100px]"
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
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
