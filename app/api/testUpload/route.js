import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import db from "../../../server/models";
import { createEmbedding } from "../../../utils/openaiUtils";
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'


export async function POST(req) {
	const formData = await req.formData();
	const file = formData.get("file");
	const userId = formData.get("userId");
	const knowledgeBaseId = formData.get("knowledgeBaseId");

	console.log("formData", formData);
	if (!file || !userId || !knowledgeBaseId) {
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 }
		);
	}

	try {
		const doc = [];
		const fileExtension = file.name.split(".").pop().toLowerCase();
		let content;

		if (["txt", "json", "html", "js", "css", "md"].includes(fileExtension)) {
			content = await file.text();
			doc.push(content);
		} else if (fileExtension === "pdf") {
			const arrayBuffer = await file.arrayBuffer();
			  const pdfLoader = new PDFLoader(new Blob([arrayBuffer]));
			  const pdfDocs = await pdfLoader.load();
			  console.log("pdfDocs:",pdfDocs)
			  doc.push(pdfDocs[0].pageContent);
		} else {
			return NextResponse.json(
				{ error: `Unsupported file type: ${file.name}` },
				{ status: 400 }
			);
		}
        console.log("doc:",doc)
        console.log("file for document:", file.name, file.type, file.size, knowledgeBaseId)

		const document = await db.Document.create({
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
			knowledgeBaseId: knowledgeBaseId,
		});

		const splitIntoChunks = async (doc) => {
			const textSplitter = new RecursiveCharacterTextSplitter({
			  chunkSize: 1000,
			  chunkOverlap: 100,
			});
			console.log(`Splitting text into chunks`);
	  
			const chunks = await textSplitter.createDocuments([doc[0]]);
			console.log('Generating embeddings');
			console.log("Chunks:", chunks);
			const chunkTexts = chunks.map(chunk => chunk.pageContent.replace(/\n/g, " "));
			console.log("ChunkTexts:", chunkTexts);
			return chunkTexts;
		  };
	  
		  const chunkTexts = await splitIntoChunks(doc);
		  console.log("chunkTexts", chunkTexts);
        

		for (let i = 0; i < chunkTexts.length; i++) {
			const chunkContent = chunkTexts[i];
			const embedding = await createEmbedding(chunkContent);
            console.log("embedding",embedding)
            
			await db.DocumentChunk.create({
				content: chunkContent,
				embedding: embedding,
				chunkIndex: i,
				documentId: document.id,
			});
		}

		return NextResponse.json({ success: true, document });
	} catch (error) {
		console.error("Error processing file:", error);
		return NextResponse.json(
			{ error: "Error processing file" },
			{ status: 500 }
		);
	}
}
