import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Loader2, ExternalLink, Unplug, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProviderConfig, ProviderSettings, ProviderType } from '@/types/providers';
import { providerService } from '@/services/providerService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProviderCardProps {
  config: ProviderConfig;
  settings: ProviderSettings | null;
  organizationId: string;
  onUpdate: () => void;
}

export function ProviderCard({ config, settings, organizationId, onUpdate }: ProviderCardProps) {
  const [apiKey, setApiKey] = useState(settings?.api_key || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const isConnected = settings?.is_connected || false;
  const hasChanges = apiKey !== (settings?.api_key || '');

  // Subscribe to real-time updates for provisioning state
  useEffect(() => {
    if (!organizationId || isConnected) return;

    // Check if there might be a provisioning in progress
    const checkProvisioning = async () => {
      // If no settings exist, could be provisioning
      if (!settings) {
        setIsProvisioning(true);
      }
    };

    checkProvisioning();

    // Subscribe to provider_settings changes
    const channel = supabase
      .channel(`provider-${config.id}-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_settings',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('Provider settings changed:', payload);
          const newData = payload.new as ProviderSettings;
          if (newData?.provider === config.id && newData?.is_connected) {
            setIsProvisioning(false);
            toast.success(`${config.name} connected automatically!`);
            onUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, config.id, isConnected, settings]);

  // If connected via N8N provisioning, stop the provisioning state
  useEffect(() => {
    if (settings?.is_connected) {
      setIsProvisioning(false);
      setApiKey(settings.api_key || '');
    }
  }, [settings]);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await providerService.testConnection(config.id, apiKey);
      setTestResult(result);
      
      if (result.success) {
        toast.success(`${config.name} connection verified!`);
      } else {
        toast.error(result.error || 'Connection test failed');
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Test failed unexpectedly' });
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsSaving(true);

    try {
      // Test connection first if not already tested
      let connectionValid = testResult?.success || false;
      
      if (!testResult) {
        const result = await providerService.testConnection(config.id, apiKey);
        setTestResult(result);
        connectionValid = result.success;
        
        if (!result.success) {
          toast.error(`Connection test failed: ${result.error}`);
          setIsSaving(false);
          return;
        }
      }

      await providerService.saveProviderApiKey(organizationId, config.id, apiKey, connectionValid);
      toast.success(`${config.name} API key saved successfully`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      await providerService.disconnectProvider(organizationId, config.id);
      setApiKey('');
      setTestResult(null);
      toast.success(`${config.name} disconnected`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Provisioning state UI
  if (isProvisioning && !isConnected) {
    return (
      <Card className="bg-card border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 animate-pulse" />
        <CardHeader className="flex flex-row items-start gap-4 relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
            <img 
              src={config.logo} 
              alt={config.name} 
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-bold text-primary">${config.name[0]}</span>`;
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Provisioning...
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {config.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />
            <div>
              <p className="text-sm font-medium text-foreground">Setting up your account...</p>
              <p className="text-xs text-muted-foreground">
                N8N is creating your {config.name} sub-account. This usually takes 1-2 minutes.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsProvisioning(false)}
            className="w-full text-muted-foreground"
          >
            Enter API Key Manually
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden ${isConnected ? 'bg-green-500/10' : 'bg-muted'}`}>
          <img 
            src={config.logo} 
            alt={config.name} 
            className="h-8 w-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-bold ${isConnected ? 'text-green-500' : 'text-muted-foreground'}">${config.name[0]}</span>`;
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{config.name}</CardTitle>
            {isConnected && (
              <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          <CardDescription className="mt-1">
            {config.description}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-muted-foreground"
        >
          <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">API Key</label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder={`Enter your ${config.name} API key`}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {testResult && (
          <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-500' : 'text-destructive'}`}>
            {testResult.success ? (
              <>
                <Check className="h-4 w-4" />
                <span>Connection verified</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                <span>{testResult.error || 'Connection failed'}</span>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!apiKey.trim() || isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || !hasChanges || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Connection'
            )}
          </Button>
        </div>

        {isConnected && (
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Unplug className="h-4 w-4 mr-2" />
                Disconnect
              </>
            )}
          </Button>
        )}

        {settings?.last_tested_at && (
          <p className="text-xs text-muted-foreground text-center">
            Last verified: {new Date(settings.last_tested_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
