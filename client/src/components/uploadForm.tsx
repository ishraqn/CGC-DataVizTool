import React from 'react';

const FileUploadForm = () => {
    const handleFileUpload = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent the default form submission behavior
        
        const formData = new FormData(event.target as HTMLFormElement);
        const file = formData.get('csvFile') as File;
    
        if (file.size <= 0) {
        } else {
            fetch('api/v1/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    (event.target as HTMLFormElement).reset();
                    window.alert('File uploaded successfully.');
                } else {
                    // Handle other HTTP status codes (e.g., 400, 500) as errors
                    console.error('Error uploading file:', response.status, response.statusText);
                    // Inform the user about the failure to upload the file
                    window.alert('Failed to upload file. Please try again.');
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
        <form encType="multipart/form-data" onSubmit={handleFileUpload}>
            <input type="file" name="csvFile" accept=".csv"/>
            <button type="submit">Upload CSV</button>
        </form>
    );
  };

  export default FileUploadForm;