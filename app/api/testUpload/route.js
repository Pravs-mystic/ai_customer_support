import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import db from "../../../server/models";
// import { encode, decode } from 'gpt-3-encoder';
import { createEmbedding } from "../../../utils/openaiUtils";
import { splitIntoChunks } from "../../../utils/textProcessing";


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
			  doc.push(...pdfDocs);
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


		const chunkTexts = splitIntoChunks(doc);
        console.log("chunkTexts",chunkTexts)
        

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
