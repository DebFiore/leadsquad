import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Rocket } from 'lucide-react';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'E-commerce',
  'Marketing & Advertising',
  'Education',
  'Manufacturing',
  'Consulting',
  'Other',
];

const onboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const { user, refreshOrganization } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: '',
      industry: '',
    },
  });

  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: values.businessName,
          industry: values.industry,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add the user as an owner in organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      await refreshOrganization();
      toast.success('Welcome to LeadSquad! Your organization has been created.');
      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to LeadSquad!</DialogTitle>
          <DialogDescription className="text-center">
            Let's get you set up. Tell us a bit about your business.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your business name" 
                      {...field} 
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
