import React from 'react';
import { Input } from '@mui/material';

const FileUpload = ({ handleFileUpload }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    handleFileUpload(files);
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