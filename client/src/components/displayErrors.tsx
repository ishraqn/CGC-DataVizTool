import React, { useState } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = () => {
    const { uploadedFiles, currentFileIndex, fileErrors } = useToggle();
    const [isOpen, setIsOpen] = useState(false);

    const currentFileId = uploadedFiles[currentFileIndex]?.id;
    const currentFileErrors = fileErrors[currentFileId] || []; // Retrieve errors using currentFileId

    if (currentFileErrors.length === 0) return null;

    return (
        <div className="error-dropdown">
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "Close Errors" : `Show Errors (${currentFileErrors.length})`}
            </button>
            {isOpen && (
                <div className="error-content">
                    <ul>
                        {currentFileErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ErrorDropdown;
