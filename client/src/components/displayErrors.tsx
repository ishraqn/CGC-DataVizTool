import React, { useState, useEffect } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors } = useToggle();
    const [corrections, setCorrections] = useState({});

    // Load corrections from local storage when the component mounts
    useEffect(() => {
        const savedCorrections = localStorage.getItem('corrections');
        if (savedCorrections) {
            setCorrections(JSON.parse(savedCorrections));
        }
    }, []);

    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = currentFileId ? fileErrors[currentFileId] || [] : [];

    if (currentFileErrors.length === 0) return null;

    const handleInputChange = (event, row, columnName) => {
        const cellKey = `${row}-${columnName}`;
        const updatedCorrections = { ...corrections, [cellKey]: event.target.value };
        setCorrections(updatedCorrections);
        // Save the updated corrections to local storage
        localStorage.setItem('corrections', JSON.stringify(updatedCorrections));
    };

    const renderErrorRows = (error, rowIndex) => {
        // Assuming the first error object contains headers in the rowData property
        const headers = Object.keys(currentFileErrors[0]?.rowData || {});

        return (
            <tr key={rowIndex}>
                <td>{error.row}</td>
                {headers.map((headerName, cellIndex) => {
                    const cellKey = `${error.row}-${headerName}`;
                    const cellValue = corrections[cellKey] ?? error.rowData[headerName];
                    const isEditable = ["0", "NA", ""].includes(error.rowData[headerName]); // Condition for editable cells

                    return (
                        <td key={headerName}>
                            {isEditable ? (
                                <input 
                                    type="text" 
                                    value={cellValue}
                                    onChange={(e) => handleInputChange(e, error.row, headerName)}
                                    className="table-input"
                                />
                            ) : (
                                error.rowData[headerName]
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    const testCorrections = async () => {
        try {
            const response = await fetch('/api/corrections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ corrections, fileId: currentFileId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('Corrections sent successfully.');
        } catch (error) {
            console.error('Failed to send corrections:', error);
        }
    };

    return (
        <div className="error-content">
            <button onClick={testCorrections}>Test Corrections</button>
            <table>
                <thead>
                    <tr>
                        <th>Row Number</th>
                        {Object.keys(currentFileErrors[0]?.rowData || {}).map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentFileErrors.map(renderErrorRows)}
                </tbody>
            </table>
        </div>
    );
};

export default ErrorDropdown;