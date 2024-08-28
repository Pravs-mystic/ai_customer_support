import { NextResponse } from 'next/server';
import { createEmbedding } from '@/utils/openai';
import { splitIntoChunks } from '@/utils/textProcessing';
import db from '@/server/models';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const userId = formData.get('userId');
  const knowledgeBaseId = formData.get('knowledgeBaseId');

  if (!file || !userId || !knowledgeBaseId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf-8');

    // Create document
    const document = await db.Document.create({
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      content: content,
      KnowledgeBaseId: knowledgeBaseId
    });

    // Split content into chunks
    const chunks = splitIntoChunks(content);

    // Create embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await createEmbedding(chunkContent);

      await db.DocumentChunk.create({
        content: chunkContent,
        embedding: embedding,
        chunkIndex: i,
        DocumentId: document.id
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}