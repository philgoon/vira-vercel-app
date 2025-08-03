// [R4]: Admin CSV Import API Route
// Handles file upload, validation, and CSV import operations
// Supports both preview and full import modes with proper pipeline integration

import { createCSVImportPipeline, ImportResult } from '@/lib/csv-import-pipeline';
import { NextRequest, NextResponse } from 'next/server';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface CSVRowData {
  [key: string]: string | number | undefined;
}

interface CSVPreviewResponse {
  success: boolean;
  error?: string;
  preview?: {
    headers: string[];
    sampleData: CSVRowData[];
    totalRows: number;
    hasRatings: boolean;
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
  };
  importResult?: ImportResult;
}

export async function POST(request: NextRequest): Promise<NextResponse<CSVPreviewResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string || 'preview';
    const batchSize = parseInt(formData.get('batchSize') as string || '50');

    // Validate file upload
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Read and validate file content
    const csvContent = await file.text();

    if (!csvContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Create pipeline instance for processing
    const pipeline = createCSVImportPipeline();

    // Parse and validate CSV content using pipeline
    const { records, errors } = pipeline.parseCsvContent(csvContent);

    // Handle validation errors
    if (errors.length > 0) {
      const validationErrors = errors.map(e => `Row ${e.row}: ${e.error}`);

      return NextResponse.json({
        success: false,
        error: 'CSV validation failed',
        preview: {
          headers: [],
          sampleData: [],
          totalRows: 0,
          hasRatings: false,
          validation: {
            isValid: false,
            errors: validationErrors,
            warnings: []
          }
        }
      });
    }

    // Generate preview data for frontend display
    const previewData = generatePreviewData(csvContent);

    if (mode === 'preview') {
      // Return preview without processing
      return NextResponse.json({
        success: true,
        preview: {
          ...previewData,
          validation: {
            isValid: true,
            errors: [],
            warnings: []
          }
        }
      });
    }

    // Process full import for 'import' mode
    if (mode === 'import') {
      const startTime = Date.now();

      const importResult = await pipeline.importRecords(records, {
        mode: 'import',
        batchSize,
        skipValidation: false,
        overwriteExisting: false
      });

      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // Add processing time to result
      const enhancedResult = {
        ...importResult,
        processingTime,
        summary: {
          ...importResult.summary,
          processingTime
        }
      };

      return NextResponse.json({
        success: true,
        importResult: enhancedResult
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode specified. Use "preview" or "import".' },
      { status: 400 }
    );

  } catch (error) {
    console.error('CSV import API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during CSV processing',
        preview: {
          headers: [],
          sampleData: [],
          totalRows: 0,
          hasRatings: false,
          validation: {
            isValid: false,
            errors: [error instanceof Error ? error.message : 'Unknown server error'],
            warnings: []
          }
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Generate preview data from CSV content for frontend display
 */
function generatePreviewData(csvContent: string): {
  headers: string[];
  sampleData: CSVRowData[];
  totalRows: number;
  hasRatings: boolean;
} {
  const lines = csvContent.trim().split('\n');
  const headers = parseCSVRow(lines[0]);

  // Detect if CSV contains rating columns
  const hasRatings = detectRatingColumns(headers);

  // Generate sample data (first 5 rows)
  const sampleData: CSVRowData[] = [];
  const maxSampleRows = Math.min(6, lines.length); // Header + 5 data rows

  for (let i = 1; i < maxSampleRows; i++) {
    if (lines[i] && lines[i].trim()) {
      const row = parseCSVRow(lines[i]);
      const rowData: CSVRowData = {};

      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      sampleData.push(rowData);
    }
  }

  return {
    headers,
    sampleData,
    totalRows: lines.length - 1, // Exclude header
    hasRatings
  };
}

/**
 * Detect if CSV contains rating columns for complete import
 */
function detectRatingColumns(headers: string[]): boolean {
  const ratingColumnPatterns = [
    /project.success/i,
    /quality.*\(1-10\)/i,
    /communication.*\(1-10\)/i,
    /what.*went.*well/i,
    /recommend.*vendor/i
  ];

  return ratingColumnPatterns.some(pattern =>
    headers.some(header => pattern.test(header))
  );
}

/**
 * Parse individual CSV row handling quoted fields and commas
 */
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
