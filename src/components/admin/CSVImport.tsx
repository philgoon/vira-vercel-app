'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/import-csv', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Projects from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <Button onClick={handleImport} disabled={!file || loading}>
          {loading ? 'Importing...' : 'Start Import'}
        </Button>
        {result && (
          <pre className="p-4 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  )
}
