import React from 'react';
import { Input } from '@mui/material';
import { useAuth } from '../providers/AuthProvider';

export default function FileUpload({knowledgeBaseId,onUploadComplete}) {

  const { user } = useAuth();

  const handleFileUpload = async (newFiles) => {
	if (!user) return;
	console.log("newFiles", newFiles)

	const uploadPromises = newFiles.map(async (file) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("userId", user.id);
		formData.append("knowledgeBaseId", knowledgeBaseId);

		console.log("formData",formData)
		try {
			const response = await fetch("/api/testUpload", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) throw new Error("File upload failed");
			const data = await response.json();
			return data.document;
		} catch (error) {
			console.error("Error uploading file:", error);
			throw error;
		}
	});

	try {
		const uploadedDocuments = await Promise.all(uploadPromises);
		// Update your state or perform any necessary actions with the uploaded documents
		console.log("Uploaded documents:", uploadedDocuments);
		onUploadComplete(uploadedDocuments); // Call the callback with the uploaded documents

	} catch (error) {
		console.error("Error uploading files:", error);
	}
	};

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

