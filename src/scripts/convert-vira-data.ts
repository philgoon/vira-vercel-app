import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import * as fs from 'fs'
import * as path from 'path'

// Read the original CSV file
const csvPath = path.join(process.cwd(), 'ViRA _ Accelo Ticket Export - Sheet1.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
})

// Extract unique vendors
const vendorsMap = new Map<string, any>()
const projectsList: any[] = []
const ratingsList: any[] = []

records.forEach((record: any) => {
  // Extract vendor info
  const vendorName = record['Ticket Assignee']
  if (vendorName && !vendorsMap.has(vendorName)) {
    vendorsMap.set(vendorName, {
      name: vendorName,
      type: 'Freelancer', // Default, you can adjust
      email: '', // To be filled manually
      primary_contact: vendorName,
      service_category: '', // To be filled based on project types
      skills: '', // To be filled manually
      pricing_structure: '', // To be filled manually
      rate_cost: '', // To be filled manually
      availability: 'Part-time', // Default
      time_zone: '', // To be filled manually
      contact_preference: 'Email', // Default
    })
  }

  // Extract project info
  if (record['Ticket Title'] && record['Ticket Company Name']) {
    projectsList.push({
      client_name: record['Ticket Company Name'],
      project_name: record['Ticket Title'],
      vendor_name: vendorName || '',
      due_date: '', // Not in original data
      budget: '', // Not in original data
      status: record['Ticket Status'] || 'Closed',
      description: '', // Not in original data
    })
  }

  // Extract ratings info
  if (vendorName && record['Overall Vendor Rating? (1-10)']) {
    // Keep 10-point scale as-is
    const convertRating = (rating: string) => {
      const num = parseInt(rating)
      if (isNaN(num)) return ''
      return num.toString()
    }

    const feedback = []
    if (record['What went well? (Optional) (1-10)']) {
      feedback.push(`What went well: ${record['What went well? (Optional) (1-10)']}`)
    }
    if (record['Areas for improvement? (Optional)']) {
      feedback.push(`Areas for improvement: ${record['Areas for improvement? (Optional)']}`)
    }

    ratingsList.push({
      vendor_name: vendorName,
      client_name: record['Ticket Company Name'] || '',
      project_name: record['Ticket Title'] || '',
      quality_rating: convertRating(record['Work Quality Rating (Optional) (1-10)']),
      communication_rating: convertRating(record['Communication Rating (Optional) (1-10)']),
      reliability_rating: convertRating(record['Overall Vendor Rating? (1-10)']),
      turnaround_time_rating: record['Project Delivered On Time?'] === 'Yes' ? '10' : '6',
      feedback: feedback.join(' '),
      strengths: record['What went well? (Optional) (1-10)'] || '',
      weaknesses: record['Areas for improvement? (Optional)'] || '',
    })
  }
})

// Write converted files
const outputDir = path.join(process.cwd(), 'converted_data')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// Write vendors CSV
const vendorsData = Array.from(vendorsMap.values())
const vendorsCsv = stringify(vendorsData, { header: true })
fs.writeFileSync(path.join(outputDir, 'vendors_converted.csv'), vendorsCsv)

// Write projects CSV
const projectsCsv = stringify(projectsList, { header: true })
fs.writeFileSync(path.join(outputDir, 'projects_converted.csv'), projectsCsv)

// Write ratings CSV
const ratingsCsv = stringify(ratingsList, { header: true })
fs.writeFileSync(path.join(outputDir, 'ratings_converted.csv'), ratingsCsv)

console.log('Data conversion complete!')
console.log(`- Vendors: ${vendorsData.length} unique vendors extracted`)
console.log(`- Projects: ${projectsList.length} projects extracted`)
console.log(`- Ratings: ${ratingsList.length} ratings extracted`)
console.log(`\nConverted files saved in: ${outputDir}`)