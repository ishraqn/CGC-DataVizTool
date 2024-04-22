import { parse } from 'csv-parse';
import fs from 'fs';

interface IncorrectCell {
  row: number;
  column: string;
}

interface ValidationError {
  row: number;
  header: string[];
  rowData: string[];
  incorrectCells: IncorrectCell[];
}

interface ValidationResult {
  hasErrors: boolean;
  errors: ValidationError[];
}

const provinceAbbreviations = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

export function validateCsvRecords(filePath: string): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    const errors: ValidationError[] = [];
    let headers: string[] = [];
    let currentRow = 0;

    parser.on('readable', () => {
      let record: { [x: string]: any; };
      while (record = parser.read()) {
        currentRow++;
        if (headers.length === 0) {
          headers = Object.keys(record);
        }

        const rowData = headers.map(header => record[header] || '');
        const incorrectCells: IncorrectCell[] = []; // Initialize array to track incorrect cells
        let errorDetected = false;

        rowData.forEach((value, index) => {
          const header = headers[index].toLowerCase();

          // Check type for 'Station' field
          if (header === 'station') {
            if (typeof value !== 'string') {
              errorDetected = true;
              incorrectCells.push({ row: currentRow, column: header });
            }
          }

          // Check type for 'Commodity' field
          if (header === 'commodity') {
            if (typeof value !== 'string') {
              errorDetected = true;
              incorrectCells.push({ row: currentRow, column: header });
            }
          }

          // Check for province abbreviation
          if (header === 'province') {
            if (!provinceAbbreviations.includes(value.toUpperCase())) {
              errorDetected = true;
              incorrectCells.push({ row: currentRow, column: header });
            }
          }

          // Check for numeric fields
          if (['caruid', 'samples', 'grade', 'cropdistrict', 'CD', 'year'].includes(header) && isNaN(Number(value))) {
            errorDetected = true;
            incorrectCells.push({ row: currentRow, column: header });
          }

          // Check for special values
          if (value === '0' 
          || value.toLowerCase() === 'na' || value === 'n/a' 
          || value === 'nd' || value === ''
          || value === 'NA') {
            errorDetected = true;
            incorrectCells.push({ row: currentRow, column: header });
          }

          // check for latitude and longitude range
          if (header === 'long' || header === 'lat' || header === 'longitude' || header === 'latitude' ) {
            const floatValue = parseFloat(value);
            if (isNaN(floatValue) || floatValue < -90 || floatValue > 90) {
              errorDetected = true;
              incorrectCells.push({ row: currentRow, column: header });
            }
          }
        });

        if (errorDetected) {
          errors.push({ row: currentRow, header: headers, rowData, incorrectCells}); // Include incorrectCells in ValidationError object
        }
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      resolve({ hasErrors: errors.length > 0, errors });
    });
  });
}