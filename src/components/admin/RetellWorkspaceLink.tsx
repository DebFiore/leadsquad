import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Rocket,
  Key,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { retellWorkspaceService } from '@/services/retellWorkspaceService';

interface RetellWorkspaceLinkProps {
  organizationId: string;
  organizationName: string;
  existingWorkspaceId?: string | null;
  existingApiKey?: string | null;
  isConnected?: boolean;
  onLinked?: () => void;
}

export function RetellWorkspaceLink({
  organizationId,
  organizationName,
  existingWorkspaceId,
  existingApiKey,
  isConnected = false,
  onLinked,
}: RetellWorkspaceLinkProps) {
  const [workspaceId, setWorkspaceId] = useState(existingWorkspaceId || '');
  const [apiKey, setApiKey] = useState(existingApiKey ? '••••••••' : '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!workspaceId || !apiKey || apiKey === '••••••••') {
      toast.error('Please enter both Workspace ID and API Key');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await retellWorkspaceService.testConnection(organizationId);
      setTestResult({
        success: result.success,
        message: result.success ? 'Connection successful!' : result.error || 'Connection failed',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId || !apiKey || apiKey === '••••••••') {
      toast.error('Please enter both Workspace ID and API Key');
      return;
    }

    setIsSaving(true);

    try {
      await retellWorkspaceService.saveWorkspaceCredentials(organizationId, workspaceId, apiKey);
      toast.success('Workspace credentials saved');
      onLinked?.();
    } catch (error) {
      console.error('Failed to save workspace:', error);
      toast.error('Failed to save workspace credentials');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeployAgents = async () => {
    setIsDeploying(true);

    try {
      await retellWorkspaceService.triggerAgentDeployment(organizationId);
      toast.success('Agent deployment triggered! Check the Provisioning tab for progress.');
    } catch (error) {
      console.error('Failed to deploy agents:', error);
      toast.error('Failed to trigger agent deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Retell Workspace</CardTitle>
          </div>
          {isConnected && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
        </div>
        <CardDescription>
          Link {organizationName}'s Retell sub-account to enable AI agents
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Workspace ID */}
        <div className="space-y-2">
          <Label htmlFor="workspace-id" className="text-sm">
            Workspace ID
          </Label>
          <Input
            id="workspace-id"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="e.g., ws_abc123..."
            className="font-mono text-sm"
          />
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-sm flex items-center gap-2">
            <Key className="h-3 w-3" />
            API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="Enter Retell API Key"
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              className="shrink-0"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            testResult.success 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {testResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || !workspaceId || !apiKey}
          >
            {isTesting && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
            Test Connection
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !workspaceId || !apiKey}
          >
            {isSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
            <Link2 className="h-3 w-3 mr-2" />
            Link Account
          </Button>
        </div>

        {/* Deploy Agents Button (only shown when connected) */}
        {isConnected && (
          <div className="pt-4 border-t">
            <Button
              className="w-full"
              onClick={handleDeployAgents}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying Agents...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy AI Agents (3)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Creates Receptionist, Outreach, and Setter agents using intake data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
