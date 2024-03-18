import React from 'react';
import { useToggle } from '../contexts/useToggle';
import './uploadForm.css';
import GuideTooltip from './GuideTooltip';
import { FaRegQuestionCircle } from "react-icons/fa";

const FileUploadForm = ({onUploadSuccess}) => {
    const { fetchUploadedFiles } = useToggle();
    const handleFileUpload = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        const formData = new FormData(event.target as HTMLFormElement);
        const file = formData.get('csvFile') as File;

        if (file.size > 1024 * 1024) { 
            console.error('File size exceeds 1MB limit.');
        } else if (file.size <= 0) {
            console.error('File is empty');
        } else if (file.type != "text/csv"){
            console.error('Wrong file type. Must be csv');
        } else {
            fetch('api/v1/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    (event.target as HTMLFormElement).reset();
                    onUploadSuccess();
                    fetchUploadedFiles();
                } else {
                    // Handle other HTTP status codes (e.g., 400, 500) as errors
                    console.error('Error uploading file:', response.status, response.statusText);
                    // Access the response body for further details
                    response.text().then(errorMessage => {
                        console.error('Error message:', errorMessage);
                    });
                }
            })
            .catch(error => console.error('Error uploading file:', error));

            
        }
    };

    return (
        <div className="upload-form-container">
            <form className="upload-form" encType="multipart/form-data" onSubmit={handleFileUpload}>
                <GuideTooltip id='test'>
                    <FaRegQuestionCircle className="question-icon" />
                </GuideTooltip>
                <label htmlFor="csvFile" className="visually-hidden">Choose CSV file</label>
                <input id="csvFile" className="upload-input" type="file" name="csvFile" accept=".csv"/>
                <button className="upload-button" type="submit">Upload CSV</button>
            </form>
        </div>
    );
  };

  export default FileUploadForm;