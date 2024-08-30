import { NextResponse } from 'next/server';
import db from '../../../server/models'

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const knowledgeBases = await db.KnowledgeBase.findAll({
      where: { userId: userId},
      include: [{
        model: db.Document,
        attributes: ['id', 'fileName', 'fileType', 'fileSize']
      }],
      order: [
        ['createdAt', 'DESC'],
        [db.Document, 'createdAt', 'DESC']
      ]
    });
    console.log("knw:", knowledgeBases )
    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json({ error: 'Error fetching knowledge bases' }, { status: 500 });
  }
}

export async function POST(request) {
    try {
      const { name, userId } = await request.json();
  
      if (!name || !userId) {
        return NextResponse.json({ error: 'Name and userId are required' }, { status: 400 });
      }
  
      const newKnowledgeBase = await db.KnowledgeBase.create({
        name,
        userId
      });
  
      return NextResponse.json({ 
        message: 'Knowledge base created successfully', 
        knowledgeBase: newKnowledgeBase 
      }, { status: 201 });
  
    } catch (error) {
      console.error('Error creating knowledge base:', error);
      return NextResponse.json({ error: 'Error creating knowledge base' }, { status: 500 });
    }
  }