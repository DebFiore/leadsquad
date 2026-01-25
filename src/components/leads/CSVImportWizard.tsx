// src/components/leads/CSVImportWizard.tsx
import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useBulkCreateLeads } from '@/hooks/useLeads';
import { Campaign } from '@/types/campaigns';
import { validatePhoneNumber } from '@/lib/phoneUtils';
import { cn } from '@/lib/utils';

interface CSVImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Campaign[];
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

interface ParsedRow {
  [key: string]: string;
}

interface MappedLead {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  company: string | null;
  job_title: string | null;
  isValid: boolean;
  errors: string[];
  originalRow: number;
}

const LEAD_FIELDS = [
  { key: 'phone_number', label: 'Phone Number', required: true },
  { key: 'first_name', label: 'First Name', required: false },
  { key: 'last_name', label: 'Last Name', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
];

export function CSVImportWizard({ open, onOpenChange, campaigns }: CSVImportWizardProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [mappedLeads, setMappedLeads] = useState<MappedLead[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const bulkCreate = useBulkCreateLeads();

  const resetWizard = () => {
    setStep('upload');
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({});
    setSelectedCampaign('');
    setMappedLeads([]);
    setImportResult(null);
    setImportProgress(0);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvHeaders(results.meta.fields || []);
        setCsvData(results.data);
        
        // Auto-detect column mapping
        const autoMapping: Record<string, string> = {};
        const headers = results.meta.fields || [];
        
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, '');
          
          if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('cell')) {
            autoMapping['phone_number'] = header;
          } else if (lowerHeader.includes('firstname') || lowerHeader === 'first') {
            autoMapping['first_name'] = header;
          } else if (lowerHeader.includes('lastname') || lowerHeader === 'last') {
            autoMapping['last_name'] = header;
          } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
            autoMapping['email'] = header;
          } else if (lowerHeader.includes('company') || lowerHeader.includes('organization') || lowerHeader.includes('business')) {
            autoMapping['company'] = header;
          } else if (lowerHeader.includes('title') || lowerHeader.includes('position') || lowerHeader.includes('role')) {
            autoMapping['job_title'] = header;
          }
        });
        
        setColumnMapping(autoMapping);
        setStep('mapping');
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
      },
    });
  };

  const handleMappingChange = (field: string, csvColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: csvColumn === 'none' ? '' : csvColumn,
    }));
  };

  const processMapping = () => {
    const leads: MappedLead[] = csvData.map((row, index) => {
      const errors: string[] = [];
      
      const phoneRaw = columnMapping.phone_number ? row[columnMapping.phone_number] : '';
      const phoneValidation = validatePhoneNumber(phoneRaw);
      
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error || 'Invalid phone');
      }

      const email = columnMapping.email ? row[columnMapping.email]?.trim() : null;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }

      return {
        first_name: columnMapping.first_name ? row[columnMapping.first_name]?.trim() || null : null,
        last_name: columnMapping.last_name ? row[columnMapping.last_name]?.trim() || null : null,
        email: email || null,
        phone_number: phoneValidation.e164 || phoneRaw,
        company: columnMapping.company ? row[columnMapping.company]?.trim() || null : null,
        job_title: columnMapping.job_title ? row[columnMapping.job_title]?.trim() || null : null,
        isValid: errors.length === 0,
        errors,
        originalRow: index + 2,
      };
    });

    setMappedLeads(leads);
    setStep('preview');
  };

  const startImport = async () => {
    setStep('importing');
    setImportProgress(10);
    
    const validLeads = mappedLeads.filter((l) => l.isValid);
    
    try {
      setImportProgress(30);
      
      const result = await bulkCreate.mutateAsync(
        validLeads.map((lead) => ({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone_number: lead.phone_number,
          company: lead.company,
          job_title: lead.job_title,
          campaign_id: selectedCampaign || null,
          lead_status: 'new' as const,
          lead_source: 'csv_import',
          custom_fields: {},
          tags: [],
          notes: null,
          last_call_date: null,
          next_call_date: null,
          import_batch_id: null,
          imported_at: new Date().toISOString(),
        }))
      );
      
      setImportProgress(100);
      setImportResult({
        success: result.length,
        failed: validLeads.length - result.length,
      });
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      setImportProgress(100);
      setImportResult({
        success: 0,
        failed: validLeads.length,
      });
      setStep('complete');
    }
  };

  const validCount = mappedLeads.filter((l) => l.isValid).length;
  const invalidCount = mappedLeads.filter((l) => !l.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Leads from CSV
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file with your leads data'}
            {step === 'mapping' && 'Map your CSV columns to lead fields'}
            {step === 'preview' && 'Review the data before importing'}
            {step === 'importing' && 'Importing leads...'}
            {step === 'complete' && 'Import complete'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                "hover:border-primary/50 hover:bg-muted/50"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Supported: .csv files with headers
              </p>
            </div>
          )}

          {/* Step: Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  {file?.name}
                </div>
                <Badge variant="secondary">{csvData.length} rows</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-3">Map Columns</h4>
                <div className="space-y-3">
                  {LEAD_FIELDS.map((field) => (
                    <div key={field.key} className="flex items-center gap-4">
                      <div className="w-1/3">
                        <span className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </span>
                      </div>
                      <Select
                        value={columnMapping[field.key] || 'none'}
                        onValueChange={(value) => handleMappingChange(field.key, value)}
                      >
                        <SelectTrigger className="w-2/3">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Don't import --</SelectItem>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Assign to Campaign (Optional)</h4>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Campaign</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                    <XCircle className="h-3 w-3 mr-1" />
                    {invalidCount} invalid
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedLeads.slice(0, 100).map((lead, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-muted-foreground">{lead.originalRow}</TableCell>
                        <TableCell>
                          {lead.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="flex items-center gap-1 text-red-400 text-xs">
                              <XCircle className="h-4 w-4" />
                              {lead.errors[0]}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{`${lead.first_name || ''} ${lead.last_name || ''}`.trim() || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{lead.phone_number || '-'}</TableCell>
                        <TableCell>{lead.email || '-'}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {mappedLeads.length > 100 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing first 100 of {mappedLeads.length} rows
                </p>
              )}
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-6">
              <div className="animate-pulse">
                <Upload className="h-16 w-16 mx-auto text-primary mb-4" />
              </div>
              <div>
                <p className="text-lg font-medium mb-2">Importing leads...</p>
                <p className="text-muted-foreground mb-4">
                  Please wait while we import {validCount} leads
                </p>
                <Progress value={importProgress} className="w-64 mx-auto" />
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <div className="py-12 text-center space-y-6">
              {importResult.success > 0 ? (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 mx-auto text-red-500" />
              )}
              
              <div>
                <p className="text-lg font-medium mb-2">
                  {importResult.success > 0 ? 'Import Complete!' : 'Import Failed'}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  {importResult.success > 0 && (
                    <span className="text-green-400">
                      {importResult.success} imported successfully
                    </span>
                  )}
                  {importResult.failed > 0 && (
                    <span className="text-red-400">
                      {importResult.failed} failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-4 border-t">
          {step === 'upload' && (
            <>
              <div />
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </>
          )}
          
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={processMapping}
                disabled={!columnMapping.phone_number}
              >
                Preview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={startImport}
                disabled={validCount === 0}
              >
                Import {validCount} Leads
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
          
          {step === 'complete' && (
            <>
              <div />
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
