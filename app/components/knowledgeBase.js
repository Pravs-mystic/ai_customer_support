"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import Tooltip from "@mui/material/Tooltip";
import FileUpload from "./fileUpload";

export default function KnowledgeBase() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [currentKnowledgeBaseId, setCurrentKnowledgeBaseId] = useState(null);
  const [newKnowledgeBaseName, setNewKnowledgeBaseName] = useState("");
  const { user, loading } = useAuth();

  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch(`/api/knowledgebases?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
		console.log("data",data)
        setKnowledgeBases(data.knowledgeBases);
		console.log("knowledgeBases xxx",knowledgeBases)
        if (data.knowledgeBases.length > 0) {
          setCurrentKnowledgeBaseId(data.knowledgeBases[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
    }
  };

  const createKnowledgeBase = async () => {
    if (!newKnowledgeBaseName.trim()) return;
    try {
      const response = await fetch("/api/knowledgebases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKnowledgeBaseName, userId: user.id }),
      });
      if (response.ok) {
        setNewKnowledgeBaseName("");
        fetchKnowledgeBases();
      }
    } catch (error) {
      console.error("Error creating knowledge base:", error);
    }
  };

  const handleUploadComplete = (knowledgeBaseId, uploadedDocuments) => {
    setKnowledgeBases((prevKnowledgeBases) =>
      prevKnowledgeBases.map((kb) =>
        kb.id === knowledgeBaseId
          ? { ...kb, Documents: [...(kb.Documents || []), ...uploadedDocuments] }
          : kb
      )
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      createKnowledgeBase();
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user) {
      fetchKnowledgeBases();
    }
  }, [user]);

  return (
    <Box width="80%" mx="auto">
      <Typography variant="h5" component="h2" gutterBottom>
        Knowledge Base
      </Typography>
      <Box display="flex" alignItems="center" mb={4}>
        <TextField
          label="Knowledge Base Name"
          value={newKnowledgeBaseName}
          onChange={(e) => setNewKnowledgeBaseName(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          fullWidth
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={createKnowledgeBase}
        >
          Create
        </Button>
      </Box>

      {knowledgeBases.map((kb) => (
        <Box key={kb.id} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="h3" gutterBottom>
              {kb.name}
            </Typography>
            <Tooltip title="Upload documents" arrow>
              <IconButton onClick={() => document.getElementById('fileInput').click()}>
                <UploadIcon />
              </IconButton>
            </Tooltip>
            <FileUpload 
			knowledgeBaseId={kb.id} 
			onUploadComplete={(uploadedDocuments) => handleUploadComplete(kb.id, uploadedDocuments)}
 			/>
          </Box>
          {kb.Documents && kb.Documents.length > 0 ? (
            kb.Documents.map((file, index) => (
              <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={1} border={1} borderColor="grey.300" borderRadius={2} mb={1}>
                <Typography variant="body2">
                  {file.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {file.fileSize} bytes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {file.fileType}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files uploaded.
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
        </Box>
      ))}
    </Box>
  );
}