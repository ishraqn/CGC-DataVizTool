import React, { useState } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";
import { fetchCsvFile, parseCsv, applyCorrections, convertArrayToCSV } from '../utils/dataHandlingUtil';

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors, fetchUploadedFiles, removeUploadedFile, updateFileErrors } = useToggle();
    const [corrections, setCorrections] = useState({});
    const [isVisible] = useState(true);  // State to manage dropdown visibility


    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = currentFileId ? fileErrors[currentFileId] || [] : [];

    const handleInputChange = (event, rowIndex, columnName) => {
        const cellKey = `${rowIndex-1}-${columnName}`;
        const updatedCorrections = { ...corrections, [cellKey]: event.target.value };
        setCorrections(updatedCorrections);
    };


    const handleUserEntries = async () => {
        console.log("Corrections to apply:", corrections);
        try {
            const getFile = `/api/v1/getCSV/${currentFileId}`;
            const csvText = await fetchCsvFile(getFile);
            const parsedData = parseCsv(csvText);
            const correctedData = applyCorrections(parsedData, corrections);
            const correctedCsvText = convertArrayToCSV(correctedData);
            const originalFileName = uploadedFiles[currentFileIndex]?.name;
    
            // cleaning name to match previous file name before upload
            const cleanName = originalFileName.includes("_")
            ? originalFileName.split("_").slice(1).join("_").split('.').slice(0, -1).join('.')
            : originalFileName.split('.').slice(0, -1).join('.');  // Clean up extension if no underscore
            const finalFileName = `${cleanName}.csv`;
            const blob = new Blob([correctedCsvText], { type: 'text/csv' });
            const formData = new FormData();
            formData.append('csvFile', blob, finalFileName);
            removeUploadedFile(currentFileIndex);
            // reuploading the file.
            const response = await fetch(`/api/v1/upload?overwrite=true`, {
                method: 'POST',
                body: formData
            });
    
            if (response.ok) {
                console.log("Re-upload was successful.");
                // Clear any previous errors if the upload is successful
            } else {
                console.error(`Error uploading file: ${response.status} ${await response.text()}`);
            }

            fetchUploadedFiles(); // Refresh the list of files, if necessary
            setCorrections({}); // resetting the corrections 
        } catch (error) {
            console.error('Network or other error:', error);
        }
    };

    
      if (!isVisible || currentFileErrors.length === 0) {
        return null;
    }


    return (
        <div className="error-dropdown">
            <div class="buttons-container">
                <button class="button" onClick = {handleUserEntries} id="confirmation-button">Submit Changes</button>
            </div>
        <div className="error-content">
            <table>
                <thead>
                    <tr>
                        <th>Row Number</th>
                        {currentFileErrors[0]?.header.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentFileErrors.map((error, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{error.row+1}</td>
                            {error.header.map((headerName, cellIndex) => {
                                const cellKey = `${error.row}-${headerName}`;
                                const cellValue = corrections[cellKey] ?? error.rowData[cellIndex];
                                const isEditable = ["0", "NA", "", "na"].includes(error.rowData[cellIndex]);

                                return (
                                    <td key={cellIndex}>
                                        {isEditable ? (
                                            <input 
                                                type="text" 
                                                value={cellValue}
                                                onChange={(e) => handleInputChange(e, error.row+1, headerName)}
                                                className="table-input"
                                            />
                                        ) : (
                                            error.rowData[cellIndex]
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

export default ErrorDropdown;
