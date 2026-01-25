import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { CampaignType } from '@/types/campaigns';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  campaign_type: z.enum(['inbound', 'outbound', 'hybrid']),
});

type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      campaign_type: 'outbound',
    },
  });

  const onSubmit = async (data: CreateCampaignForm) => {
    createCampaign.mutate(
      {
        name: data.name,
        description: data.description || null,
        campaign_type: data.campaign_type as CampaignType,
        status: 'draft',
        selected_voice_id: null,
        voice_provider: null,
        ai_script: null,
        ai_prompt: null,
        phone_number: null,
        agent_id: null,
        start_date: null,
        end_date: null,
        calling_hours_start: '09:00',
        calling_hours_end: '17:00',
        calling_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'America/New_York',
      },
      {
        onSuccess: (newCampaign) => {
          form.reset();
          onOpenChange(false);
          navigate(`/dashboard/campaigns/${newCampaign.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new voice AI calling campaign. You can configure voice, script, and schedule after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q1 Sales Outreach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this campaign's goals..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaign_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outbound">
                        <div className="flex flex-col items-start">
                          <span>Outbound</span>
                          <span className="text-xs text-muted-foreground">AI calls your leads proactively</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inbound">
                        <div className="flex flex-col items-start">
                          <span>Inbound</span>
                          <span className="text-xs text-muted-foreground">AI handles incoming calls</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <div className="flex flex-col items-start">
                          <span>Hybrid</span>
                          <span className="text-xs text-muted-foreground">Both inbound and outbound</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how this campaign will handle calls
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createCampaign.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
