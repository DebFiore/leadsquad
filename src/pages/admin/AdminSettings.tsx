import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Webhook,
  Key,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface SecretFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isConfigured?: boolean;
}

function SecretField({ label, description, value, onChange, placeholder, isConfigured }: SecretFieldProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-foreground">{label}</Label>
        {isConfigured && (
          <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="relative">
        <Input
          type={showSecret ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10 bg-muted font-mono text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => setShowSecret(!showSecret)}
        >
          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

export default function AdminSettings() {
  const [retellWebhookSecret, setRetellWebhookSecret] = useState('');
  const [vapiWebhookSecret, setVapiWebhookSecret] = useState('');
  const [n8nWebhookSecret, setN8nWebhookSecret] = useState('');
  const [internalApiToken, setInternalApiToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateToken = (setter: (value: string) => void) => {
    const token = generateSecureToken(32);
    setter(token);
    toast.success('Secure token generated');
  };

  const handleSaveSecrets = async () => {
    setIsSaving(true);
    
    // Note: In production, these would be saved to Vercel environment variables
    // For now, we show instructions to the user
    const secrets = [
      { name: 'RETELL_WEBHOOK_SECRET', value: retellWebhookSecret },
      { name: 'VAPI_WEBHOOK_SECRET', value: vapiWebhookSecret },
      { name: 'N8N_WEBHOOK_SECRET', value: n8nWebhookSecret },
      { name: 'INTERNAL_API_TOKEN', value: internalApiToken },
    ].filter(s => s.value);

    if (secrets.length === 0) {
      toast.error('Please enter at least one secret');
      setIsSaving(false);
      return;
    }

    // Copy to clipboard for easy pasting into Vercel
    const envFormat = secrets.map(s => `${s.name}=${s.value}`).join('\n');
    
    try {
      await navigator.clipboard.writeText(envFormat);
      toast.success(
        'Secrets copied to clipboard! Paste them into your Vercel Environment Variables.',
        { duration: 5000 }
      );
    } catch {
      toast.info('Please copy the secrets manually from the fields above');
    }
    
    setIsSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure webhook secrets and API tokens for secure integrations
          </p>
        </div>

        {/* Retell.ai Webhook */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Retell.ai Webhook Secret</CardTitle>
                <CardDescription>
                  Used to verify webhook signatures from Retell.ai call events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretField
              label="Webhook Secret"
              description="Find this in your Retell.ai dashboard under Settings → Webhooks"
              value={retellWebhookSecret}
              onChange={setRetellWebhookSecret}
              placeholder="Enter your Retell webhook secret..."
              isConfigured={!!retellWebhookSecret}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateToken(setRetellWebhookSecret)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Secret
              </Button>
              <p className="text-xs text-muted-foreground">
                Then configure this same secret in Retell.ai
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Webhook URL:</strong>{' '}
                <code className="bg-background px-1 py-0.5 rounded">
                  https://app.leadsquad.ai/api/webhooks/retell
                </code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vapi.ai Webhook */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Webhook className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Vapi.ai Webhook Secret</CardTitle>
                <CardDescription>
                  Used to verify webhook signatures from Vapi.ai call events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretField
              label="Webhook Secret"
              description="Find this in your Vapi.ai dashboard under Settings → Webhooks"
              value={vapiWebhookSecret}
              onChange={setVapiWebhookSecret}
              placeholder="Enter your Vapi webhook secret..."
              isConfigured={!!vapiWebhookSecret}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateToken(setVapiWebhookSecret)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Secret
              </Button>
              <p className="text-xs text-muted-foreground">
                Then configure this same secret in Vapi.ai
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Webhook URL:</strong>{' '}
                <code className="bg-background px-1 py-0.5 rounded">
                  https://app.leadsquad.ai/api/webhooks/vapi
                </code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* N8N Webhook */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Key className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">N8N Webhook Token</CardTitle>
                <CardDescription>
                  Shared token for authenticating automation requests from N8N
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretField
              label="Webhook Token"
              description="Generate a secure token and configure it in your N8N workflows"
              value={n8nWebhookSecret}
              onChange={setN8nWebhookSecret}
              placeholder="Enter or generate a secure token..."
              isConfigured={!!n8nWebhookSecret}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateToken(setN8nWebhookSecret)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Token
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
              <p className="text-xs text-muted-foreground">
                <strong>Webhook URL:</strong>{' '}
                <code className="bg-background px-1 py-0.5 rounded">
                  https://app.leadsquad.ai/api/webhooks/n8n
                </code>
              </p>
              <p className="text-xs text-muted-foreground">
                Include token as header: <code className="bg-background px-1 py-0.5 rounded">x-n8n-token: YOUR_TOKEN</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Internal API Token */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Internal API Token</CardTitle>
                <CardDescription>
                  Secures internal endpoints like usage aggregation cron jobs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretField
              label="API Token"
              description="Used to authorize internal system requests (cron jobs, admin tasks)"
              value={internalApiToken}
              onChange={setInternalApiToken}
              placeholder="Enter or generate a secure token..."
              isConfigured={!!internalApiToken}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateToken(setInternalApiToken)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Token
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                Use in requests: <code className="bg-background px-1 py-0.5 rounded">Authorization: Bearer YOUR_TOKEN</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Instructions */}
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base text-amber-500">How to Save These Secrets</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Fill in the secrets above (generate new ones or enter existing)</li>
              <li>Click "Copy All Secrets" to copy them in environment variable format</li>
              <li>Go to your <strong>Vercel Dashboard → Project → Settings → Environment Variables</strong></li>
              <li>Paste each secret as a new environment variable</li>
              <li>Redeploy your application to apply changes</li>
            </ol>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSecrets} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Copy All Secrets
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
