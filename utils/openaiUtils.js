// import OpenAI from "openai";
// const openai = new OpenAI();
import {OpenAI} from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'

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

export const generateResponse=(text)=> {
  try {
    console.log(text)
    
  } catch (error) {
    console.error('Error generating Response:', error);
    throw error;
  }
}

const embedding = createEmbedding("hello how are you doing?")

console.log("embedding:", embedding)