import React from 'react';
import { Input } from '@mui/material';

const FileUpload = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    console.log('files-fileupload', files);
    onFileUpload(files);
  };

  return (
    <Input
      type="file"
      id="fileInput"
      inputProps={{ multiple: true }}
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  );
};

export default FileUpload;