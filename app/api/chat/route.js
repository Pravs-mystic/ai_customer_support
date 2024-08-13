import { NextResponse } from "next/server";
import openAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import {queryPineconeVectorStoreAndQueryLLM} from "../../../utils";
import {indexName} from '../../../config'


export async function POST(req) {
    const openai = new openAI(process.env.OPENAI_API_KEY);
    const body = await req.json();
    const { messages, userId } = body;
 
    const query_submit = messages[messages.length - 1].content;
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || '',
    })

    const text = await queryPineconeVectorStoreAndQueryLLM(pinecone, indexName, query_submit,userId)
  
    // const completion = await openai.chat.completions.create({
    //     messages: [
    //         {
    //             role: "system",
    //             content: systemPrompt
    //         },
    //        ...data
    //     ],
    //     model: "gpt-4o-mini",
    //     stream:true
    // })

    const stream = new ReadableStream({
        async start(controller) {

            const encoder = new TextEncoder()
            try {

                // for await (const chunk of completion){
                    // const content = chunk.choices[0]?.delta?.content;
                const content = text;

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
}