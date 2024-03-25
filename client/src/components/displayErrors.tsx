import React, { useState } from 'react';
import './displayErrors.css';
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = () => {
    const { fileErrors, errorFileInfo, handleRetryConversion } = useToggle();
    const [isOpen, setIsOpen] = useState(false);

    if (fileErrors.length === 0) return null;
    
    return (
        <div className="error-dropdown">
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close Errors' : `Show Errors (${fileErrors.length})`}
            </button>
            {isOpen && (
                <div className="error-content">
                    <ul>
                        {fileErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                    <div className="error-actions">
                        <button onClick={() => handleRetryConversion(errorFileInfo[0], errorFileInfo[1])}>Proceed Anyway</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ErrorDropdown;