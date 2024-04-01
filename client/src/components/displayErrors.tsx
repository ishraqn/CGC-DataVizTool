import React, { useState, useEffect } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors, updateFileErrors } = useToggle();
    const [isOpen, setIsOpen] = useState(false);

    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = fileErrors[currentFileId] || [];

    useEffect(() => {
        fetch('/api/csv-errors')
            .then(response => response.json())
            .then(errors => {
                if (errors && errors.length > 0) {
                    updateFileErrors(currentFileId, errors);
                }
            })
            .catch(console.error); // Error handling for the fetch request
    }, [currentFileId, updateFileErrors]); // Dependencies for useEffect

    if (currentFileErrors.length === 0) return null;

    const renderErrorRows = (error) => {
        return (
            <tr key={error.row}>
                <td>{error.row}</td> {/* Reintroducing <td> for the row number */}
                {Object.values(error.rowData).map((value, index) => (
                    <td key={index}>{value}</td>
                ))}
            </tr>
        );
    };

    return (
        <div className="error-dropdown">
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "Close Errors" : `Show Errors (${currentFileErrors.length})`}
            </button>
            {isOpen && (
                <div className="error-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Row Number</th> {/* Reintroducing <th> for "Row Number" */}
                                {currentFileErrors[0]?.header?.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentFileErrors.map(renderErrorRows)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ErrorDropdown;
