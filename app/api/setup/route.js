import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from 'langchain/document';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { createPineconeIndex, updatePinecone } from '../../../utils';
import { indexName } from '../../../config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';



// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }
  
  const bucket = getStorage().bucket(NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// AUTOMATICALLY TAKES THE DOCS IN DOCUMENTS FOLDER AND UPLOADS TO PINECONE
export async function POST(req) {
    const { userId } = await req.json();
  
    if (!userId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }
  
    try {
        // List all files in the user's directory
        const [files] = await bucket.getFiles({ prefix: `files/${userId}/` });
    
        const docs = [];
        for (const file of files) {
          const [content] = await file.download();
          const fileExtension = file.name.split('.').pop().toLowerCase();
    
          if (fileExtension === 'txt' || fileExtension === 'md') {
            // For text files, create a Document directly
            const text = content.toString('utf-8');
            docs.push(new Document({ pageContent: text, metadata: { source: file.name } }));
          } else if (fileExtension === 'pdf') {
            // For PDF files, use PDFLoader
            const pdfLoader = new PDFLoader(new Blob([content]));
            const pdfDocs = await pdfLoader.load();
            docs.push(...pdfDocs);
          } else {
            console.warn(`Unsupported file type: ${file.name}`);
            continue;
          }
        }
    
        console.log("docs loaded");
        const vectorDimension = 1536;
    
        const pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY || '',
        });
        console.log("pinecone client created");
    
        await createPineconeIndex(pinecone, indexName, vectorDimension);
        console.log("index created");
        await updatePinecone(pinecone, indexName, docs, userId);
        console.log("docs uploaded to pinecone");
    
        return NextResponse.json({
          data: "successfully created index and loaded data into pinecone..."
        });
      } catch (error) {
        console.error("Error creating index or updating Pinecone:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
}