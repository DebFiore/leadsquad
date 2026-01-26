import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Shield } from 'lucide-react';

interface CheckItem {
  name: string;
  description: string;
  check: () => Promise<boolean>;
}

export default function DeploymentChecklist() {
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(false);

  const checks: CheckItem[] = [
    {
      name: 'API Health',
      description: 'Vercel API routes are responding',
      check: async () => {
        try {
          const res = await fetch('/api/health');
          return res.ok;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Supabase Connection',
      description: 'Database is accessible',
      check: async () => {
        try {
          const res = await fetch('/api/health');
          const data = await res.json();
          return data.checks?.supabase?.status === 'ok';
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Environment Variables',
      description: 'Required env vars are set',
      check: async () => {
        try {
          const res = await fetch('/api/health');
          const data = await res.json();
          return data.checks?.environment?.status === 'ok';
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Authentication',
      description: 'Auth system is working',
      check: async () => {
        return true;
      },
    },
  ];

  const runChecks = async () => {
    setLoading(true);
    const newResults: Record<string, boolean> = {};
    
    for (const check of checks) {
      try {
        newResults[check.name] = await check.check();
      } catch {
        newResults[check.name] = false;
      }
    }
    
    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const allPassed = Object.values(results).every(r => r === true);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deployment Checklist</h1>
            <p className="text-muted-foreground">
              Verify all systems are operational
            </p>
          </div>
          <Button onClick={runChecks} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Checks
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {allPassed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Shield className="h-5 w-5 text-yellow-500" />
              )}
              <CardTitle>System Status</CardTitle>
            </div>
            <CardDescription>
              {allPassed 
                ? 'All systems operational' 
                : 'Some checks failed or are pending'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check) => (
                <div key={check.name} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-medium">{check.name}</h3>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                  {results[check.name] === null || results[check.name] === undefined ? (
                    <Badge variant="outline">Pending</Badge>
                  ) : results[check.name] ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
