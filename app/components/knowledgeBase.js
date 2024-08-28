'use client'

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";

export default function KnowledgeBase() {

  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [currentKnowledgeBaseId, setCurrentKnowledgeBaseId] = useState(null);
  const { user, loading } = useAuth()

  
  const handleFileUpload = async (newFiles, knowledgeBaseId) => {
    if (!user) return;
  
    const uploadPromises = newFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('knowledgeBaseId', knowledgeBaseId);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('File upload failed');
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
      console.log('Uploaded documents:', uploadedDocuments);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch(`/api/knowledgebases?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data.knowledgeBases);
        if (data.knowledgeBases.length > 0) {
          setCurrentKnowledgeBaseId(data.knowledgeBases[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
    }
  };
  
  const createKnowledgeBase = async (name, description) => {
    try {
      const response = await fetch('/api/knowledgebases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, userId: user.id }),
      });
      if (response.ok) {
        const newKnowledgeBase = await response.json();
        setKnowledgeBases([...knowledgeBases, newKnowledgeBase]);
        setCurrentKnowledgeBaseId(newKnowledgeBase.id);
      }
    } catch (error) {
      console.error('Error creating knowledge base:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchKnowledgeBases();
    }
  },[]);
  
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Knowledge Base</h2>
        {/* Add your knowledge base content here */}
        <p>This is where you&apos;ll implement the knowledge base functionality.</p>
      </div>
    );
  }