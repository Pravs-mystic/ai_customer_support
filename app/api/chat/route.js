import { NextResponse } from "next/server";
import openAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import {queryPineconeVectorStoreAndQueryLLM} from "../../../utils";
import {indexName} from '../../../config'

const systemPrompt = `
Your goal is to provide helpful and accurate responses to user inquiries based on the data provided to you. If you cannot answer based on the data provided and if you do not know the answer, then respond to the user that you cannot answer based on the information provided.
`;

export async function POST(req) {
    const openai = new openAI(process.env.OPENAI_API_KEY);
    const data = await req.json();
    console.log(`data: ${JSON.stringify(data)}`)
    const query_submit = data[data.length - 1].content;
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY || '',
    })

    const text = await queryPineconeVectorStoreAndQueryLLM(pinecone, indexName, query_submit)
  
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