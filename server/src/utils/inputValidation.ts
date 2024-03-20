import { parse } from 'csv-parse';
import fs from 'fs';

interface ValidationResult {
  hasErrors: boolean;
  errors: string[];
}

export function validateCsvRecords(filePath: string): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const errors: string[] = [];
    let rowIndex = 0;

    parser.on('readable', () => {
      let record;
      while (record = parser.read()) {
        rowIndex++;
        for (const [column, value] of Object.entries(record)) {
          const stringValue = String(value).trim();
          if (stringValue === '' || stringValue.toLowerCase() === 'na' || stringValue === '0') {
            errors.push(`Missing or invalid data in row ${rowIndex}, column ${column}`);
          }
        }
      }
    });

    parser.on('error', reject);

    parser.on('end', () => {
      resolve({ hasErrors: errors.length > 0, errors });
    });
  });
};