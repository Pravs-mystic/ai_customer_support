import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { createPineconeIndex, updatePinecone } from '../../../utils'
import { indexName } from '../../../config'  
import path from 'path'

// AUTOMATICALLY TAKES THE DOCS IN DOCUMENTS FOLDER AND UPLOADS TO PINECONE
export async function POST(){
    const documentsPath = path.join(process.cwd(), 'app', 'api', 'setup', 'documents')
    const loader = new DirectoryLoader(documentsPath, {
        ".txt": (path) => new TextLoader(path),
        ".pdf": (path) => new PDFLoader(path),
        ".md": (path) => new TextLoader(path),
    })


    const docs = await loader.load()
    console.log("docs loaded")
    const vectorDimension = 1536

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || '',
    })
    console.log("pinecone client created")
    try {
        await createPineconeIndex(pinecone, indexName, vectorDimension)
        console.log("index created")
        await updatePinecone(pinecone, indexName, docs)
        console.log("docs uploaded to pinecone")
    } catch (error) {
        console.error("Error creating index or updating Pinecone:", error)
    }

    return NextResponse.json({
        data: "successfully created index and loaded data into pinecone..."
    })


}