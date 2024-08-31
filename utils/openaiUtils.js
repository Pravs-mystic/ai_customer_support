import OpenAI from "openai";
const openai = new OpenAI();
// import {OpenAI} from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import {loadQAStuffChain} from 'langchain/chains'
import {Document} from 'langchain/document'


const systemPrompt = `
Your goal is to provide helpful and accurate responses to user inquiries based on the data provided to you.
`;
export const createEmbedding=async(text) => {
  try {
    // const response = await openai.createEmbedding({
    //   model: "text-embedding-ada-002",
    //   input: text,
    // });
    // return response.data.data[0].embedding;
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(text)
    return queryEmbedding
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

export const generateResponse= async(query, messages, context)=> {
  try {
    
      // const llm = new OpenAI({})
      // const chain = loadQAStuffChain(llm)

      // const result = await chain.call({
      //     input_documents: [new Document({pageContent: context})],
      //     question: query,
      // return result
  
      // })

       // Add context and query to the messages array
    const contextMessage = {
      role: 'system',
      content: context,
    };

    const queryMessage = {
      role: 'user',
      content: query,
    };

    // Combine context, historical messages, and the new query
    const combinedMessages = [contextMessage, ...messages, queryMessage];

    const completion = await openai.chat.completions.create({
      messages: combinedMessages,
      model: "gpt-4o-mini",
      stream: true,
    });

    let result = '';
    for await (const chunk of completion) {
      result += chunk.choices[0]?.delta?.content || '';
    }

    return result;
      
    
  } catch (error) {
    console.error('Error generating Response:', error);
    throw error;
  }
}
