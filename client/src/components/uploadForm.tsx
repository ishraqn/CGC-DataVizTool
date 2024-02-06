import React from 'react';

const FileUploadForm = () => {
    const handleFileUpload = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        const formData = new FormData(event.target as HTMLFormElement);
        const file = formData.get('csvFile') as File;
    
        if (file) {
        fetch('api/v1/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
            console.log('File uploaded successfully');
            (event.target as HTMLFormElement).reset();
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
        window.alert('Failed to upload file. Please try again.');
        }
    };

    return (
        <form encType="multipart/form-data" onSubmit={handleFileUpload}>
            <input type="file" name="csvFile" accept=".csv"/>
            <button type="submit">Upload CSV</button>
        </form>
    );
  };

  export default FileUploadForm;