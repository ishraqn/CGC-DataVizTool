export const fetchCsvFile = async (url: string) => {
    console.log("Reaches fetchAndParseCSV");
    const response = await fetch(url);
    const csvText = await response.text();
    if(!response.ok){
        throw new Error("fetchAndParseCSV not okay.");
    }
    return csvText;
};

export const applyCorrections = (data, corrections) => {

    console.log("Reaches applyCorrections");

    // Log the corrections to see what we have
    console.log("Corrections:", corrections);

    // Create a new array to hold the corrected data
    const correctedData = data.map((row, index) => {
        // The index here is 0-based, so adjust to 1-based for correction matching
        const rowIndex = index + 1;
        // Find corrections for the 1-based row index
        const rowCorrections = Object.entries(corrections).filter(([key]) => {
            const [correctionIndex] = key.split('-');
            return parseInt(correctionIndex, 10) === rowIndex; // Match with 1-based index
        });

        // Apply each correction to the row
        rowCorrections.forEach(([key, value]) => {
            const [, columnName] = key.split('-');
            row[columnName] = value;
        });

        return row; // Return the updated row
    });

    return correctedData;
};

export const convertArrayToCSV = (data) => {
    if (!data.length) {
        return '';  // If the data is empty, return an empty string.
    }
    // Extract headers from the first row object keys.
    const headers = Object.keys(data[0]);

    // Construct the CSV content starting with the header row.
    const csvContent = [
        headers.join(','),  // Correctly join headers with commas
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                if (value === undefined || value === null) {
                    return '';
                }
                const stringValue = value.toString();
                // Enclose in quotes if there are commas, quotes, or newlines and escape double quotes inside.
                if (/["\n,]/.test(stringValue)) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')  // Correctly join row fields with commas
        )
    ].join('\n');

    return csvContent;
};

export const parseCsv = (csvText) => {
    if (!csvText || typeof csvText !== 'string') {
        return []; // Return an empty array or handle this case as needed
    }

    console.log("Starting parsing CSV");

    // Define a regex that correctly parses CSV lines
    const re = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;

    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        console.log("No lines found after splitting CSV text.");
        return [];
    }

    // Process headers to cleanly remove quotes and unnecessary commas
    const headers = lines[0].match(re).map(field =>
        field.trim() // Remove whitespace
            .replace(/^,/, '') // Remove leading comma
            .replace(/^"|"$/g, '') // Remove surrounding quotes
            .replace(/""/g, '"') // Unescape double quotes
    );

    const data = lines.slice(1).map(line => {
        const row = line.match(re) || [];
        return headers.reduce((obj, header, index) => {
            let value = (index < row.length ? row[index] : '')
                .trim() // Trim whitespace
                .replace(/^,/, '') // Remove leading comma
                .replace(/^"|"$/g, '') // Remove surrounding quotes
                .replace(/""/g, '"'); // Unescape double quotes
            obj[header] = value;
            return obj;
        }, {});
    });
    
    return data;
};
