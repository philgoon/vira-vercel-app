// [R2]: CSV Import Pipeline - Flexible import system for ViRA project data
// Supports both project-only and complete (with ratings) CSV imports
// Designed for the fresh 2-table schema with auto-calculation features

import { createClient } from '@supabase/supabase-js';

// =====================================
// TYPE DEFINITIONS & INTERFACES
// =====================================

export interface CSVRowBase {
  'Ticket Assignee': string;                    // vendor_name (REQUIRED)
  'Ticket Submitted By'?: string;               // submitted_by
  'Ticket Title': string;                       // project_title (REQUIRED)
  'Ticket Company Name': string;                // client_company (REQUIRED)
  'Ticket Status'?: string;                     // status
}

export interface CSVRowComplete extends CSVRowBase {
  'Project Success (1-10)'?: string;            // project_success_rating
  'Quality (1-10)'?: string;                    // quality_rating
  'Communication (1-10)'?: string;              // communication_rating
  'What went well?'?: string;                   // what_went_well
  'Areas for improvement?'?: string;            // areas_for_improvement
  'Would you recommend this vendor again?'?: string; // recommend_vendor_again
  'Project Overall Rating'?: string;            // Calculated field - ignore from CSV
}

export interface ProjectRecord {
  project_id?: string;
  vendor_name: string;
  submitted_by?: string;
  project_title: string;
  client_company: string;
  status?: string;
  project_success_rating?: number;
  quality_rating?: number;
  communication_rating?: number;
  what_went_well?: string;
  areas_for_improvement?: string;
  recommend_vendor_again?: boolean;
  recommendation_scope?: string;
  project_overall_rating?: number; // Will be auto-calculated by trigger
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errors: ImportValidationError[];
  summary: {
    newVendors: string[];
    updatedVendors: string[];
    projectsWithRatings: number;
    projectsWithoutRatings: number;
  };
}

export interface ImportOptions {
  mode: 'preview' | 'import';
  skipValidation?: boolean;
  overwriteExisting?: boolean;
  batchSize?: number;
}

// =====================================
// CSV PARSING & VALIDATION
// =====================================

export class CSVImportPipeline {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Parse CSV content into structured records with flexible column support
   * Handles both project-only and complete (with ratings) CSV formats
   */
  public parseCsvContent(csvContent: string): { records: ProjectRecord[], errors: ImportValidationError[] } {
    const lines = csvContent.trim().split('\n');
    const errors: ImportValidationError[] = [];
    const records: ProjectRecord[] = [];

    if (lines.length === 0) {
      errors.push({ row: 0, field: 'file', value: null, error: 'CSV file is empty' });
      return { records, errors };
    }

    // Parse header row to determine available columns
    const headers = this.parseCsvRow(lines[0]);
    const hasRatingColumns = this.detectRatingColumns(headers);

    console.log(`📊 CSV Analysis: ${hasRatingColumns ? 'Complete' : 'Project-only'} import detected`);
    console.log(`📋 Available columns: ${headers.join(', ')}`);

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCsvRow(lines[i]);

      if (row.length === 0 || row.every(cell => !cell.trim())) {
        continue; // Skip empty rows
      }

      try {
        const record = this.parseRowToRecord(headers, row, hasRatingColumns);
        const rowErrors = this.validateRecord(record, i + 1);

        if (rowErrors.length === 0) {
          records.push(record);
        } else {
          errors.push(...rowErrors);
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          field: 'parsing',
          value: row.join(','),
          error: `Failed to parse row: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return { records, errors };
  }

  /**
   * Detect if CSV contains rating columns for complete import
   */
  private detectRatingColumns(headers: string[]): boolean {
    const ratingColumnPatterns = [
      /project.success.*rating.*\(1-10\)/i,  // Match "Project Success Rating (1-10)"
      /quality.*rating.*\(1-10\)/i,          // Match "Quality Rating (1-10)"
      /communication.*rating.*\(1-10\)/i,    // Match "Communication Rating (1-10)"
      /what.*went.*well/i,                   // Match "What went well?"
      /recommend.*vendor/i                   // Match "Would you recommend this vendor again?"
    ];

    const hasRatings = ratingColumnPatterns.some(pattern =>
      headers.some(header => pattern.test(header))
    );

    console.log(`🔍 Rating column detection:`, hasRatings);
    console.log(`📋 Headers found:`, headers);

    return hasRatings;
  }

  /**
   * Parse individual CSV row handling quoted fields and commas
   */
  private parseCsvRow(line: string): string[] {
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

  /**
   * Convert CSV row data to ProjectRecord based on available columns
   */
  private parseRowToRecord(headers: string[], row: string[], hasRatingColumns: boolean): ProjectRecord {
    const record: ProjectRecord = {
      vendor_name: '',
      project_title: '',
      client_company: ''
    };

    // Map CSV columns to record fields
    for (let i = 0; i < Math.min(headers.length, row.length); i++) {
      const header = headers[i].trim();
      const value = row[i].trim();

      switch (header) {
        case 'Ticket Assignee':
          record.vendor_name = value;
          break;
        case 'Ticket Submitted By':
          record.submitted_by = value || undefined;
          break;
        case 'Ticket Title':
          record.project_title = value;
          break;
        case 'Ticket Company Name':
          record.client_company = value;
          break;
        case 'Ticket Status':
          record.status = value || 'closed';
          break;
      }

      // Only parse rating columns if they exist in CSV
      if (hasRatingColumns) {
        switch (header) {
          case 'Project Success Rating (1-10)':  // Fixed to match actual CSV
          case 'Project Success (1-10)':         // Keep backward compatibility
            record.project_success_rating = this.parseRating(value);
            break;
          case 'Quality Rating (1-10)':          // Fixed to match actual CSV
          case 'Quality (1-10)':                 // Keep backward compatibility
            record.quality_rating = this.parseRating(value);
            break;
          case 'Communication Rating (1-10)':    // Fixed to match actual CSV
          case 'Communication (1-10)':           // Keep backward compatibility
            record.communication_rating = this.parseRating(value);
            break;
          case 'What went well? (Optional) (1-10)': // Match actual CSV
          case 'What went well?':                    // Keep backward compatibility
            record.what_went_well = value || undefined;
            break;
          case 'Areas for improvement? (Optional)': // Match actual CSV
          case 'Areas for improvement?':             // Keep backward compatibility
            record.areas_for_improvement = value || undefined;
            break;
          case 'Would you reccomend this vendor again?': // Match actual CSV (note misspelling)
          case 'Would you recommend this vendor again?': // Keep backward compatibility
            const recommendation = this.parseRecommendation(value);
            record.recommend_vendor_again = recommendation.recommend;
            record.recommendation_scope = recommendation.scope;
            break;
        }
      }
    }

    return record;
  }

  /**
   * Parse rating value (1-10) with validation
   */
  private parseRating(value: string): number | undefined {
    if (!value || value.trim() === '') return undefined;

    const parsed = parseInt(value.trim(), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 10) return undefined;

    return parsed;
  }

  /**
   * Parse recommendation text into boolean + scope
   */
  private parseRecommendation(value: string): { recommend?: boolean, scope?: string } {
    if (!value || value.trim() === '') {
      return { recommend: undefined, scope: undefined };
    }

    const cleaned = value.toLowerCase().trim();

    if (cleaned === 'yes') {
      return { recommend: true, scope: 'general' };
    } else if (cleaned.includes('yes') && (cleaned.includes('for') || cleaned.includes('only'))) {
      return { recommend: true, scope: 'client-specific' };
    }

    return { recommend: undefined, scope: undefined };
  }

  /**
   * Validate individual project record
   */
  private validateRecord(record: ProjectRecord, rowNumber: number): ImportValidationError[] {
    const errors: ImportValidationError[] = [];

    // Required field validation
    if (!record.vendor_name) {
      errors.push({
        row: rowNumber,
        field: 'vendor_name',
        value: record.vendor_name,
        error: 'Vendor name is required (Ticket Assignee column)'
      });
    }

    if (!record.project_title) {
      errors.push({
        row: rowNumber,
        field: 'project_title',
        value: record.project_title,
        error: 'Project title is required (Ticket Title column)'
      });
    }

    if (!record.client_company) {
      errors.push({
        row: rowNumber,
        field: 'client_company',
        value: record.client_company,
        error: 'Client company is required (Ticket Company Name column)'
      });
    }

    // Rating validation (if present)
    if (record.project_success_rating !== undefined) {
      if (record.project_success_rating < 1 || record.project_success_rating > 10) {
        errors.push({
          row: rowNumber,
          field: 'project_success_rating',
          value: record.project_success_rating,
          error: 'Project success rating must be between 1 and 10'
        });
      }
    }

    if (record.quality_rating !== undefined) {
      if (record.quality_rating < 1 || record.quality_rating > 10) {
        errors.push({
          row: rowNumber,
          field: 'quality_rating',
          value: record.quality_rating,
          error: 'Quality rating must be between 1 and 10'
        });
      }
    }

    if (record.communication_rating !== undefined) {
      if (record.communication_rating < 1 || record.communication_rating > 10) {
        errors.push({
          row: rowNumber,
          field: 'communication_rating',
          value: record.communication_rating,
          error: 'Communication rating must be between 1 and 10'
        });
      }
    }

    return errors;
  }

  // =====================================
  // DATABASE IMPORT OPERATIONS
  // =====================================

  /**
   * Execute import operation with batch processing and error handling
   */
  public async importRecords(
    records: ProjectRecord[],
    options: ImportOptions = { mode: 'import' }
  ): Promise<ImportResult> {

    console.log(`🚀 Starting ${options.mode} for ${records.length} records...`);

    const result: ImportResult = {
      success: false,
      totalRows: records.length,
      importedRows: 0,
      skippedRows: 0,
      errors: [],
      summary: {
        newVendors: [],
        updatedVendors: [],
        projectsWithRatings: 0,
        projectsWithoutRatings: 0
      }
    };

    if (options.mode === 'preview') {
      return this.previewImport(records, result);
    }

    try {
      const batchSize = options.batchSize || 50;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const batchResult = await this.processBatch(batch, options);

        result.importedRows += batchResult.importedRows;
        result.skippedRows += batchResult.skippedRows;
        result.errors.push(...batchResult.errors);

        // Merge summary data
        result.summary.newVendors.push(...batchResult.summary.newVendors);
        result.summary.updatedVendors.push(...batchResult.summary.updatedVendors);
        result.summary.projectsWithRatings += batchResult.summary.projectsWithRatings;
        result.summary.projectsWithoutRatings += batchResult.summary.projectsWithoutRatings;

        console.log(`📦 Processed batch ${Math.floor(i / batchSize) + 1}: ${batchResult.importedRows} imported, ${batchResult.skippedRows} skipped`);
      }

      result.success = result.errors.length === 0;

      console.log(`✅ Import completed: ${result.importedRows} imported, ${result.skippedRows} skipped, ${result.errors.length} errors`);

    } catch (error) {
      result.errors.push({
        row: 0,
        field: 'system',
        value: null,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  /**
   * Preview import without actually inserting data
   */
  private async previewImport(records: ProjectRecord[], result: ImportResult): Promise<ImportResult> {
    const vendorNames = new Set<string>();

    for (const record of records) {
      vendorNames.add(record.vendor_name);

      // Count projects with/without ratings
      const hasAllRatings = record.project_success_rating !== undefined &&
        record.quality_rating !== undefined &&
        record.communication_rating !== undefined;

      if (hasAllRatings) {
        result.summary.projectsWithRatings++;
      } else {
        result.summary.projectsWithoutRatings++;
      }
    }

    // Check which vendors already exist
    const { data: existingVendors } = await this.supabase
      .from('vendors_enhanced')
      .select('vendor_name')
      .in('vendor_name', Array.from(vendorNames));

    const existingVendorNames = new Set(existingVendors?.map(v => v.vendor_name) || []);

    result.summary.newVendors = Array.from(vendorNames).filter(name => !existingVendorNames.has(name));
    result.summary.updatedVendors = Array.from(vendorNames).filter(name => existingVendorNames.has(name));
    result.importedRows = records.length;
    result.success = true;

    console.log(`🔍 Preview: ${result.summary.newVendors.length} new vendors, ${result.summary.updatedVendors.length} updated vendors`);

    return result;
  }

  /**
   * Process a batch of records for database insertion
   * NOW ENFORCES: All vendors must exist before any project imports
   */
  private async processBatch(batch: ProjectRecord[], _options: ImportOptions): Promise<ImportResult> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for future overwriteExisting functionality
    const batchResult: ImportResult = {
      success: true,
      totalRows: batch.length,
      importedRows: 0,
      skippedRows: 0,
      errors: [],
      summary: { newVendors: [], updatedVendors: [], projectsWithRatings: 0, projectsWithoutRatings: 0 }
    };

    try {
      // STEP 1: Validate ALL vendors exist before ANY imports
      console.log(`🔍 Validating vendors for batch of ${batch.length} projects...`);

      const vendorNames = [...new Set(batch.map(record => record.vendor_name))];
      console.log(`📋 Checking ${vendorNames.length} unique vendors: ${vendorNames.join(', ')}`);

      const { data: existingVendors, error: vendorQueryError } = await this.supabase
        .from('vendors_enhanced')
        .select('vendor_name')
        .in('vendor_name', vendorNames);

      if (vendorQueryError) {
        batchResult.errors.push({
          row: 0,
          field: 'vendor_validation',
          value: null,
          error: `Failed to validate vendors: ${vendorQueryError.message}`
        });
        batchResult.skippedRows = batch.length;
        return batchResult;
      }

      // STEP 2: Identify missing vendors and FAIL FAST with helpful suggestions
      const existingVendorNames = new Set(existingVendors?.map(v => v.vendor_name) || []);
      const missingVendors = vendorNames.filter(name => !existingVendorNames.has(name));

      if (missingVendors.length > 0) {
        console.log(`❌ Missing vendors detected: ${missingVendors.join(', ')}`);

        // Generate fuzzy match suggestions for each missing vendor
        const suggestions = this.generateVendorSuggestions(missingVendors, Array.from(existingVendorNames));
        const enhancedError = this.buildEnhancedVendorError(missingVendors, suggestions);

        batchResult.errors.push({
          row: 0,
          field: 'vendor_pre_existence',
          value: missingVendors,
          error: enhancedError
        });
        batchResult.skippedRows = batch.length;
        batchResult.success = false;
        return batchResult;
      }

      console.log(`✅ All ${vendorNames.length} vendors exist - proceeding with project import`);

      // STEP 3: Only proceed if ALL vendors exist - NO auto-creation
      // Cast ProjectRecord[] to Record<string, unknown>[] for Supabase compatibility
      const batchForInsert = batch.map(record => record as unknown as Record<string, unknown>);

      const { data, error } = await this.supabase
        .from('projects_consolidated')
        .insert(batchForInsert)
        .select();

      if (error) {
        batchResult.errors.push({
          row: 0,
          field: 'batch_insert',
          value: null,
          error: `Batch insert failed: ${error.message}`
        });
        batchResult.skippedRows = batch.length;
      } else {
        batchResult.importedRows = data?.length || 0;
        console.log(`✅ Successfully imported ${data?.length || 0} projects`);

        // Update summary statistics
        batch.forEach(record => {
          const hasAllRatings = record.project_success_rating !== undefined &&
            record.quality_rating !== undefined &&
            record.communication_rating !== undefined;

          if (hasAllRatings) {
            batchResult.summary.projectsWithRatings++;
          } else {
            batchResult.summary.projectsWithoutRatings++;
          }
        });
      }

    } catch (error) {
      batchResult.errors.push({
        row: 0,
        field: 'batch_processing',
        value: null,
        error: `Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      batchResult.skippedRows = batch.length;
    }

    return batchResult;
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Get import statistics and vendor performance metrics
   */
  public async getImportStatistics(): Promise<{
    totalProjects: number;
    totalVendors: number;
    projectsWithRatings: number;
    averageOverallRating: number;
    topPerformers: Array<{ vendor_name: string; avg_rating: number; total_projects: number }>;
  }> {

    const [projectStats, vendorStats, topPerformers] = await Promise.all([
      // Project statistics
      this.supabase
        .from('projects_consolidated')
        .select('project_overall_rating', { count: 'exact' }),

      // Vendor count
      this.supabase
        .from('vendors_enhanced')
        .select('*', { count: 'exact' }),

      // Top performers
      this.supabase
        .from('vendors_enhanced')
        .select('vendor_name, avg_overall_rating, total_projects')
        .not('avg_overall_rating', 'is', null)
        .order('avg_overall_rating', { ascending: false })
        .limit(5)
    ]);

    const projectsWithRatings = projectStats.data?.filter(p => p.project_overall_rating !== null).length || 0;
    const totalRatings = projectStats.data?.filter(p => p.project_overall_rating !== null) || [];

    // Safe arithmetic with proper type checking
    const averageRating = totalRatings.length > 0
      ? totalRatings.reduce((sum, p) => {
        const rating = typeof p.project_overall_rating === 'number' ? p.project_overall_rating : 0;
        return sum + rating;
      }, 0) / totalRatings.length
      : 0;

    return {
      totalProjects: projectStats.count || 0,
      totalVendors: vendorStats.count || 0,
      projectsWithRatings,
      averageOverallRating: Math.round(averageRating * 100) / 100,
      topPerformers: topPerformers.data?.map(v => ({
        vendor_name: String(v.vendor_name || ''),
        avg_rating: Math.round((typeof v.avg_overall_rating === 'number' ? v.avg_overall_rating : 0) * 100) / 100,
        total_projects: typeof v.total_projects === 'number' ? v.total_projects : 0
      })) || []
    };
  }

  /**
   * Validate database connection and schema
   */
  public async validateDatabaseSchema(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if new tables exist
      const { error: vendorError } = await this.supabase
        .from('vendors_enhanced')
        .select('vendor_id')
        .limit(1);

      const { error: projectError } = await this.supabase
        .from('projects_consolidated')
        .select('project_id')
        .limit(1);

      if (vendorError) {
        errors.push(`vendors_enhanced table issue: ${vendorError.message}`);
      }

      if (projectError) {
        errors.push(`projects_consolidated table issue: ${projectError.message}`);
      }

    } catch (error) {
      errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate fuzzy match suggestions for missing vendor names
   */
  private generateVendorSuggestions(missingVendors: string[], existingVendorNames: string[]): Map<string, string[]> {
    const suggestions = new Map<string, string[]>();
    
    for (const missingVendor of missingVendors) {
      const matches: { name: string, score: number }[] = [];
      
      for (const existingName of existingVendorNames) {
        const score = this.calculateStringSimilarity(missingVendor.toLowerCase(), existingName.toLowerCase());
        if (score > 0.6) { // Only suggest if similarity > 60%
          matches.push({ name: existingName, score });
        }
      }
      
      // Sort by similarity score (descending) and take top 3
      const topMatches = matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(match => match.name);
      
      suggestions.set(missingVendor, topMatches);
    }
    
    return suggestions;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const n = str1.length;
    const m = str2.length;

    if (n === 0) return m === 0 ? 1 : 0;
    if (m === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= n; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= m; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    // Convert distance to similarity score (0-1)
    const maxLength = Math.max(n, m);
    return 1 - (matrix[n][m] / maxLength);
  }

  /**
   * Build enhanced error message with vendor suggestions
   */
  private buildEnhancedVendorError(missingVendors: string[], suggestions: Map<string, string[]>): string {
    let errorMsg = `Missing vendors found: ${missingVendors.join(', ')}\n\n`;
    errorMsg += 'These vendors do not exist in the database. Please either:\n';
    errorMsg += '1. Add these vendors to the database first, or\n';
    errorMsg += '2. Check for typos and use exact vendor names\n\n';
    
    // Add specific suggestions for each missing vendor
    for (const vendor of missingVendors) {
      const vendorSuggestions = suggestions.get(vendor);
      if (vendorSuggestions && vendorSuggestions.length > 0) {
        errorMsg += `"${vendor}" - Did you mean: ${vendorSuggestions.join(', ')}\n`;
      } else {
        errorMsg += `"${vendor}" - No similar vendors found\n`;
      }
    }
    
    return errorMsg.trim();
  }
}

// =====================================
// EXPORT DEFAULT FACTORY FUNCTION
// =====================================

/**
 * Create CSV import pipeline instance with service role key for admin operations
 */
export function createCSVImportPipeline(): CSVImportPipeline {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key to bypass RLS

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return new CSVImportPipeline(supabaseUrl, supabaseKey);
}

// =====================================
// USAGE EXAMPLES
// =====================================

/*
// Example 1: Import complete CSV with ratings
const pipeline = createCSVImportPipeline();
const csvContent = "..."; // Your CSV file content
const { records, errors } = pipeline.parseCsvContent(csvContent);

if (errors.length === 0) {
  const result = await pipeline.importRecords(records, { mode: 'import' });
  console.log(`Imported ${result.importedRows} projects`);
}

// Example 2: Preview import before committing
const previewResult = await pipeline.importRecords(records, { mode: 'preview' });
console.log(`Preview: ${previewResult.summary.newVendors.length} new vendors`);

// Example 3: Import project-only CSV (no ratings)
const projectOnlyContent = "Ticket Assignee,Ticket Title,Ticket Company Name\nJohn Doe,Website Design,Acme Corp";
const { records: projectRecords } = pipeline.parseCsvContent(projectOnlyContent);
const projectResult = await pipeline.importRecords(projectRecords);
*/
