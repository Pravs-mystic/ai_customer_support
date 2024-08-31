import { NextResponse } from 'next/server';
import db from '../../../server/models';

export async function POST(req) {
  const { action, ...data } = await req.json();
  console.log(`action : ${action} , data: ${data}`)

  try {
    switch (action) {
      case 'createUser':
        const user = await db.User.create({
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
        });
        return NextResponse.json(user);

      case 'createConversation':
        const conversation = await db.Conversation.create({
          userId: data.userId,
        });
        console.log("conversation:",conversation)
        return NextResponse.json(conversation);

      case 'saveMessage':
        const message = await db.Message.create({
          conversationId: data.conversationId,
          role: data.role,
          content: data.content,
        });
        return NextResponse.json(message);

      case 'getConversationMessages':
        const messages = await db.Message.findAll({
          where: { conversationId: data.conversationId },
          order: [['createdAt', 'ASC']],
        });
        return NextResponse.json(messages);

      case 'getUserConversations':
        const conversations = await db.Conversation.findAll({
          where: { userId: data.userId },
          order: [['createdAt', 'DESC']],
        });
        return NextResponse.json(conversations);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    throw NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}