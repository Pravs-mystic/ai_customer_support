import { NextResponse } from 'next/server';
import { findSimilarChunks } from '@/utils/similaritySearch';
import { generateResponse } from '@/utils/openaiUtils';

export async function POST(request) {
  const { query } = await request.json();

  try {
    const similarChunks = await findSimilarChunks(query);
    const context = similarChunks.map(chunk => chunk.content).join('\n\n');

    const response = await generateResponse(query, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json({ error: 'Error processing query' }, { status: 500 });
  }
}