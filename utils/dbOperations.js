async function dbOperation(action, data) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  return response.json();
}

export async function createUser(id, email, displayName, photoURL) {
  return dbOperation('createUser', { id, email, displayName, photoURL });
}

export async function getOrCreateConversation(userId) {
  return dbOperation('getOrCreateConversation', { userId });
}

export async function saveMessage(conversationId, role, content) {
  return dbOperation('saveMessage', { conversationId, role, content });
}

export async function getConversationMessages(conversationId) {
  return dbOperation('getConversationMessages', { conversationId });
}

export async function getUserConversations(userId) {
  return dbOperation('getUserConversations', { userId });
}