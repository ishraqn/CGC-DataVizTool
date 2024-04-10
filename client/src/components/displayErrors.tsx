import React from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors } = useToggle();
    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = fileErrors[currentFileId] || [];

    // Assuming `handleInputChange` will be passed down or managed elsewhere
    const handleInputChange = (event, row, headerName) => {
        // This function would need to be implemented in the parent component
        // or within a context where the corrections state is now managed.
        console.log('Input change handled externally');
    };

    const renderErrorRows = (error) => {
        return (
            <tr key={error.row}>
                <td>{error.row}</td>
                {Object.entries(error.rowData).map(([headerName, value], index) => {
                    const isEditable = ["0", "NA", ""].includes(value);
                    const cellKey = `${error.row}-${headerName}`;

                    return (
                        <td key={cellKey}>
                            {isEditable ? (
                                <input
                                    type="text"
                                    value={value} // Directly using the value from error.rowData
                                    className="table-input"
                                    onChange={e => handleInputChange(e, error.row, headerName)}
                                />
                            ) : (
                                <span>{value}</span>
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    const headers = currentFileErrors[0]?.header || [];

    return (
        <div className="error-dropdown">
            <div className="error-content">
                <div className="error-header">
                    <div>Row Number</div>
                    {headers.map((header, index) => (
                        <div key={index}>{header}</div>
                    ))}
                </div>
                <table>
                    <tbody>
                        {currentFileErrors.map(renderErrorRows)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ErrorDropdown;
