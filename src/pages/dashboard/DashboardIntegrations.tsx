import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProviderCard } from '@/components/dashboard/integrations/ProviderCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Puzzle, Check, Loader2, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { providerService } from '@/services/providerService';
import { ProviderSettings, PROVIDER_CONFIGS, ProviderType } from '@/types/providers';
import { toast } from 'sonner';

const additionalIntegrations = [
  {
    name: 'Salesforce',
    description: 'Sync leads and contacts with Salesforce CRM',
    connected: false,
    comingSoon: true,
  },
  {
    name: 'HubSpot',
    description: 'Connect your HubSpot CRM for seamless data sync',
    connected: false,
    comingSoon: true,
  },
  {
    name: 'Twilio',
    description: 'Send SMS messages and handle voice calls',
    connected: false,
    comingSoon: true,
  },
  {
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    connected: false,
    comingSoon: true,
  },
];

export default function DashboardIntegrations() {
  const { organization } = useAuth();
  const [providerSettings, setProviderSettings] = useState<ProviderSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProviderSettings = async () => {
    if (!organization?.id) return;

    try {
      const settings = await providerService.getProviderSettings(organization.id);
      setProviderSettings(settings);
    } catch (error) {
      console.error('Failed to load provider settings:', error);
      toast.error('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderSettings();
  }, [organization?.id]);

  const getSettingsForProvider = (provider: ProviderType): ProviderSettings | null => {
    return providerSettings.find(s => s.provider === provider) || null;
  };

  const connectedProviders = providerSettings.filter(s => s.is_connected).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your AI voice providers and favorite tools
          </p>
        </div>

        {/* Voice Provider Integrations */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Voice Providers</h2>
              <p className="text-sm text-muted-foreground">
                Configure AI voice agents for automated calling
                {connectedProviders > 0 && (
                  <span className="ml-2 text-green-500">
                    • {connectedProviders} connected
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(PROVIDER_CONFIGS) as ProviderType[]).map((provider) => (
              <ProviderCard
                key={provider}
                config={PROVIDER_CONFIGS[provider]}
                settings={getSettingsForProvider(provider)}
                organizationId={organization?.id || ''}
                onUpdate={loadProviderSettings}
              />
            ))}
          </div>
        </section>

        {/* Additional Integrations */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Puzzle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Other Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Connect your CRM and automation tools
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {additionalIntegrations.map((integration) => (
              <Card key={integration.name} className="bg-card border-border">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <Puzzle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {integration.comingSoon && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {integration.connected ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Connected
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled={integration.comingSoon}>
                      {integration.comingSoon ? 'Coming Soon' : 'Connect'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
