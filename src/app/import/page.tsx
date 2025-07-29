'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'

type ImportType = 'vendors' | 'projects' | 'ratings'

interface ImportResult {
  success: boolean
  message: string
  details?: {
    imported: number
    skipped: number
    errors: string[]
  }
}

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<ImportType>('vendors')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setImporting(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('type', importType)

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Import failed. Please check your file and try again.',
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = (type: ImportType) => {
    const link = document.createElement('a')
    link.href = `/templates/${type}_template.csv`
    link.download = `${type}_template.csv`
    link.click()
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Import Data</h1>

      <div className="grid gap-6">
        {/* Step 1: Download Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Download Templates</CardTitle>
            <CardDescription>
              Download and fill out the CSV templates with your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => downloadTemplate('vendors')}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Vendors Template
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadTemplate('projects')}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Projects Template
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadTemplate('ratings')}
                className="justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Ratings Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Import Type */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Import Type</CardTitle>
            <CardDescription>
              Choose what type of data you're importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="vendors"
                  checked={importType === 'vendors'}
                  onChange={(e) => setImportType(e.target.value as ImportType)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    importType === 'vendors'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold">Vendors</h3>
                  <p className="text-sm text-gray-600">Import vendor profiles</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="projects"
                  checked={importType === 'projects'}
                  onChange={(e) => setImportType(e.target.value as ImportType)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    importType === 'projects'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold">Projects</h3>
                  <p className="text-sm text-gray-600">Import project data</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="importType"
                  value="ratings"
                  checked={importType === 'ratings'}
                  onChange={(e) => setImportType(e.target.value as ImportType)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    importType === 'ratings'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold">Ratings</h3>
                  <p className="text-sm text-gray-600">Import vendor ratings</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Upload File */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Upload File</CardTitle>
            <CardDescription>
              Select your filled CSV file to import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">CSV files only</span>
                </label>
                {selectedFile && (
                  <div className="mt-4 text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="w-full"
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-4 w-4 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2" />
              )}
              <div className="flex-1">
                <AlertDescription>{result.message}</AlertDescription>
                {result.details && (
                  <div className="mt-2 text-sm">
                    <p>Imported: {result.details.imported}</p>
                    <p>Skipped: {result.details.skipped}</p>
                    {result.details.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc list-inside">
                          {result.details.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  )
}