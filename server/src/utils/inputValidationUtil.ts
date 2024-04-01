import { parse } from 'csv-parse';
import fs from 'fs';

interface ValidationError {
  row: number; // This will now accurately reflect the row number from the CSV file
  header: string[];
  rowData: string[];
}

interface ValidationResult {
  hasErrors: boolean;
  errors: ValidationError[];
}

export function validateCsvRecords(filePath: string): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const errors: ValidationError[] = [];
    const headers: string[] = [];
    let currentRow = 0; // Variable to track the current row number

    parser.on('readable', () => {
      let record;
      while (record = parser.read()) {
        currentRow++; // Increment the row counter for each row read
        if (headers.length === 0) {
          headers.push(...Object.keys(record));
        }

        const rowData = Object.values(record).map(value => String(value).trim());
        const errorDetected = rowData.some(value => value === '0' || value.toLowerCase() === 'na' || value === '');

        if (errorDetected) {
          errors.push({ row: currentRow, header: headers, rowData }); // Use currentRow for the error row number
        }
      }
    });

    parser.on('error', reject);

    parser.on('end', () => {
      resolve({ hasErrors: errors.length > 0, errors });
    });
  });
};
