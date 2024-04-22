import React, { useState } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";
import { fetchCsvFile, parseCsv, applyCorrections, convertArrayToCSV } from '../utils/dataHandlingUtil';

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors, fetchUploadedFiles, removeUploadedFile, updateFileErrors } = useToggle();
    const [corrections, setCorrections] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);  // State to control modal visibility

    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = fileErrors[currentFileId] || [];

    const handleInputChange = (event, rowIndex, columnName) => {
        const cellKey = `${rowIndex}-${columnName}`;
        const updatedCorrections = { ...corrections, [cellKey]: event.target.value };
        setCorrections(updatedCorrections);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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
        
            // Cleaning name to match previous file name before upload
            const cleanName = originalFileName.includes("_")
                ? originalFileName.split("_").slice(1).join("_").split('.').slice(0, -1).join('.')
                : originalFileName.split('.').slice(0, -1).join('.');  // Clean up extension if no underscore
            const finalFileName = `${cleanName}.csv`;
            const blob = new Blob([correctedCsvText], { type: 'text/csv' });
            const formData = new FormData();
            formData.append('csvFile', blob, finalFileName);
            removeUploadedFile(currentFileIndex);  // Assuming this function is synchronous or its asynchronous effects are handled elsewhere
    
            // Reuploading the file.
            const response = await fetch('api/v1/upload', {
                method: 'POST',
                body: formData
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            if (!data.success) {
                updateFileErrors(data.fileInfo[1], data.errors);
                fetchUploadedFiles();
            }
            else{
                fetchUploadedFiles();
            }
            setCorrections({}); // Resetting the corrections after successful upload
        } catch (error) {
            console.error('Network or other error:', error);
        }
    };
    

    if (currentFileErrors.length === 0) {
        return null;
    }

    const renderTable = (errors) => (
        <div className="table-scroll-container"> {/* Wrapper for scrolling */}
            <table>
                <thead>
                    <tr>
                        <th>Row Number</th>
                        {errors.length > 0 && errors[0].header.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {errors.map((error, index) => (
                        <tr key={index}>
                            <td>{error.row + 1}</td>
                            {error.header.map((header, cellIndex) => {
                                const cellKey = `${error.row}-${header}`;
                                const isError = error.incorrectCells.some(inc => inc.row === error.row && inc.column === header.toLowerCase());
                                const cellValue = corrections[cellKey] ?? error.rowData[cellIndex];
                                return (
                                    <td key={cellIndex} className={isError ? 'error-cell' : ''}>
                                        {isError ? (
                                            <input
                                                type="text"
                                                value={cellValue}
                                                onChange={(e) => handleInputChange(e, error.row, header)}
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
    );

    if (!currentFileErrors.length) {
        return null;  // Return null if there are no errors to display
    }

    return (
        <div className="error-dropdown">
            <div className="outside-button-container button-container"> 
                <button className="button" onClick={handleUserEntries}>Submit Changes</button>
                <button className="button" onClick={openModal}>Expand Errors</button>
            </div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="button-container"> {/* Inside modal */}
                            <button className="submit-button" onClick={handleUserEntries}>Submit Changes</button>
                            <button className="close-button" onClick={closeModal}>Close</button>
                        </div>
                        {renderTable(currentFileErrors)}
                    </div>
                </div>
            )}
            <div className="error-content">
                {renderTable(currentFileErrors)}
            </div>
        </div>
    );
};

export default ErrorDropdown;