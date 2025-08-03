'use client';

// [R9.1] Comprehensive CSV Import Admin Interface
// Leverages simplified API routes for instant feedback and processing
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, AlertCircle, Info, BarChart3 } from 'lucide-react';

interface CSVRowData {
  project_name?: string;
  client_name?: string;
  vendor_name?: string;
  overall_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  timeline_rating?: number;
  budget_rating?: number;
  [key: string]: string | number | undefined; // Type-safe flexible CSV column mapping
}

interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  format: 'project-only' | 'complete' | 'unknown';
  sampleData: CSVRowData[];
  validationErrors: string[];
}

interface ImportProgress {
  processed: number;
  total: number;
  errors: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
  currentBatch?: number;
  totalBatches?: number;
}

interface ImportStats {
  projectsImported: number;
  vendorsUpdated: number;
  ratingsProcessed: number;
  processingTime: number;
  averageRating: number | null;
}

export default function CSVImportInterface() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({ processed: 0, total: 0, errors: 0, status: 'idle' });
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [R9.2] File drag and drop handling
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setImportStats(null);

    // Generate preview using our CSV import pipeline
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('preview', 'true');

      const response = await fetch('/api/admin/csv-import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.preview) {
        setPreview(result.preview);
      } else {
        console.error('Preview generation failed:', result.error);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  // [R9.3] Process CSV import with real-time progress
  const processImport = async () => {
    if (!file || !preview) return;

    setIsProcessing(true);
    setProgress({ processed: 0, total: preview.validRows, errors: 0, status: 'processing' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchSize', '50'); // Configurable batch size

      const response = await fetch('/api/admin/csv-import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProgress({
          processed: result.stats.projectsImported,
          total: preview.validRows,
          errors: result.stats.errors || 0,
          status: 'complete'
        });
        setImportStats(result.stats);
      } else {
        setProgress({
          processed: 0,
          total: preview.validRows,
          errors: 1,
          status: 'error'
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      setProgress({
        processed: 0,
        total: preview.validRows,
        errors: 1,
        status: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetInterface = () => {
    setFile(null);
    setPreview(null);
    setProgress({ processed: 0, total: 0, errors: 0, status: 'idle' });
    setImportStats(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ViRA CSV Import Admin</h1>
        <p className="text-muted-foreground">
          Streamlined project and vendor data import with instant validation
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Preview</TabsTrigger>
          <TabsTrigger value="process">Process Import</TabsTrigger>
          <TabsTrigger value="results">Results & Stats</TabsTrigger>
        </TabsList>

        {/* Upload and Preview Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload CSV files with project data. Supports both project-only and complete formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {file ? file.name : 'Drop CSV file here or click to upload'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .csv files up to 10MB
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant={file ? "outline" : "default"}
                >
                  {file ? 'Choose Different File' : 'Select File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Preview Results */}
              {preview && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Preview Results</h3>
                    <Badge variant={preview.format === 'unknown' ? 'destructive' : 'default'}>
                      {preview.format === 'project-only' ? 'Project Data Only' :
                        preview.format === 'complete' ? 'Complete Dataset' : 'Unknown Format'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{preview.validRows}</p>
                          <p className="text-sm text-muted-foreground">Valid Rows</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{preview.totalRows}</p>
                          <p className="text-sm text-muted-foreground">Total Rows</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{preview.invalidRows}</p>
                          <p className="text-sm text-muted-foreground">Invalid Rows</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {preview.validationErrors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Validation Issues:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {preview.validationErrors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                          {preview.validationErrors.length > 5 && (
                            <li className="text-sm">...and {preview.validationErrors.length - 5} more</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {preview.validRows > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Ready to import {preview.validRows} valid rows.
                        {preview.format === 'project-only' ? ' Project data will be imported without ratings.' :
                          preview.format === 'complete' ? ' Complete project and rating data will be imported.' : ''}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Import Tab */}
        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Import Processing
              </CardTitle>
              <CardDescription>
                Process the validated CSV data into your ViRA database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!preview ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please upload and preview a CSV file first.
                  </AlertDescription>
                </Alert>
              ) : preview.validRows === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No valid rows found in the uploaded file. Please check your CSV format.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ready to process {preview.validRows} rows</p>
                      <p className="text-sm text-muted-foreground">
                        Import will be processed in batches for optimal performance
                      </p>
                    </div>
                    <Button
                      onClick={processImport}
                      disabled={isProcessing || progress.status === 'complete'}
                      className="min-w-[120px]"
                    >
                      {isProcessing ? 'Processing...' :
                        progress.status === 'complete' ? 'Complete' : 'Start Import'}
                    </Button>
                  </div>

                  {progress.status !== 'idle' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {progress.processed} / {progress.total}</span>
                        <span>{Math.round((progress.processed / progress.total) * 100)}%</span>
                      </div>
                      <Progress value={(progress.processed / progress.total) * 100} />

                      {progress.errors > 0 && (
                        <p className="text-sm text-red-600">
                          {progress.errors} errors encountered during processing
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetInterface}>
                  Reset Interface
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Import Results
              </CardTitle>
              <CardDescription>
                Detailed statistics and outcomes from your CSV import
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!importStats ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No import results available. Complete an import process to see statistics.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{importStats.projectsImported}</p>
                          <p className="text-sm text-muted-foreground">Projects Imported</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{importStats.vendorsUpdated}</p>
                          <p className="text-sm text-muted-foreground">Vendors Updated</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{importStats.ratingsProcessed}</p>
                          <p className="text-sm text-muted-foreground">Ratings Processed</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {importStats.processingTime}s
                          </p>
                          <p className="text-sm text-muted-foreground">Processing Time</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {importStats.averageRating && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Success!</strong> Import completed successfully.
                        Average project rating: {importStats.averageRating.toFixed(1)}/10
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={resetInterface}>
                      Import Another File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
