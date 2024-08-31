import { NextResponse } from 'next/server';
import { findSimilarChunks } from '/utils/similaritySearch';
import { generateResponse } from '/utils/openaiUtils';

export async function POST(req) {
  const body = await req.json();
    const { messages, userId, conversationId} = body;
 
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }
    const query = lastMessage.content;
  try {
    const similarChunks = await findSimilarChunks(query, userId);
    const context = similarChunks.map(chunk => chunk.content).join('\n\n');
    console.log("context",context)
    const messageContext = context + JSON.stringify(messages)
    console.log("messageContext",messageContext)
    let response = ''
    if(context){
      response = await generateResponse(query, messages, context);
      console.log("llm response:", response)
    }
    else{
      console.log("error: No context provided" )
    }

    const stream = new ReadableStream({
      async start(controller) {

          const encoder = new TextEncoder()
          try {
              const content = response;

              if(content){
                  const response_text = encoder.encode(content);
                  controller.enqueue(response_text);
              }
              // }
              controller.close();
          }
          catch (error) {
              controller.error(error);
          }
              
          }
      
  })

  return new NextResponse(stream)
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json({ error: 'Error processing query' }, { status: 500 });
  }
}