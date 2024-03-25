import React, { useState } from 'react';
import './displayErrors.css'; // Import CSS file with styling
import { useToggle } from "../contexts/useToggle";

const ErrorDropdown = ({}) => {
    const {errors, setErrors, fetchUploadedFiles } = useToggle();
    const [isOpen, setIsOpen] = useState(false);

    // Function to close the dropdown
    const handleClose = () => {
        setIsOpen(false);
    };

    const handleContinue = async () => {
        // Perform actions to continue with conversion
        try {
            // Send a POST request to the server to continue conversion
            const response = await fetch('/api/v1/continue-conversion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ processAsIs: true }), // Include the flag in the request body
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Handle the response from the server
            const result = await response.json();
            console.log('Conversion continued successfully:', result);
    
            // Clear errors and fetch uploaded files to reset state
            setErrors([]);

        } catch (error) {
            console.error('Error continuing conversion:', error);
            // Optionally, handle the error (e.g., show an error message to the user)
        }
    };
    
    // Function to handle reuploading files
    const handleReupload = () => {
        //remove the file from the queue.
    };


    if (!errors || !errors.length) return null;

    return (
        <div className="error-dropdown">
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'These are the errors:' : `Hi, uploaded file here. I have a few errors: ${errors.length}.`}
            </button>
            {isOpen && (
                <div className="error-content">
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                    <div className="error-actions">
                        <button onClick={handleContinue}>Proceed Anyways</button>
                        <button onClick={handleReupload}>Reupload File</button>
                    </div>
                </div>
            )}
        </div>
    );   
};

export default ErrorDropdown;
