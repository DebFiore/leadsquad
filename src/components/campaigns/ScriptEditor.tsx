import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScriptEditorProps {
  script: string;
  prompt: string;
  onScriptChange: (value: string) => void;
  onPromptChange: (value: string) => void;
}

const VARIABLES = [
  { name: '{{first_name}}', description: 'Lead\'s first name' },
  { name: '{{last_name}}', description: 'Lead\'s last name' },
  { name: '{{company}}', description: 'Lead\'s company name' },
  { name: '{{phone}}', description: 'Lead\'s phone number' },
  { name: '{{email}}', description: 'Lead\'s email address' },
  { name: '{{agent_name}}', description: 'AI agent\'s name' },
  { name: '{{company_name}}', description: 'Your company name' },
  { name: '{{current_date}}', description: 'Today\'s date' },
  { name: '{{current_time}}', description: 'Current time' },
];

export function ScriptEditor({ script, prompt, onScriptChange, onPromptChange }: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState('script');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    toast.success(`Copied ${variable} to clipboard`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const insertVariable = (variable: string) => {
    if (activeTab === 'script') {
      onScriptChange(script + variable);
    } else {
      onPromptChange(prompt + variable);
    }
    toast.success(`Inserted ${variable}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>AI Script & Prompt</CardTitle>
            </div>
            <CardDescription>
              Configure what your AI agent says and how it behaves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="script">Script Template</TabsTrigger>
                <TabsTrigger value="prompt">System Prompt</TabsTrigger>
              </TabsList>

              <TabsContent value="script">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Opening Script</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          This is what your AI agent will say when the call starts. 
                          Use variables to personalize the message.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    value={script}
                    onChange={(e) => onScriptChange(e.target.value)}
                    placeholder={`Hi {{first_name}}, this is {{agent_name}} calling from {{company_name}}. I'm reaching out because...`}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {script.length} characters • Use variables to personalize
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="prompt">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">System Prompt</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Instructions for how the AI should behave, respond to questions,
                          and handle different scenarios.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder={`You are a friendly and professional sales representative for {{company_name}}. Your goal is to...

Key behaviors:
- Be polite and respectful
- Answer questions accurately
- If you don't know something, offer to have a team member follow up
- Always confirm next steps before ending the call`}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters • Define AI behavior and guidelines
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Variables</CardTitle>
            </div>
            <CardDescription>
              Click to insert or copy personalization variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {VARIABLES.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <code className="text-sm font-mono text-primary">{variable.name}</code>
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyVariable(variable.name)}
                    >
                      {copiedVar === variable.name ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
