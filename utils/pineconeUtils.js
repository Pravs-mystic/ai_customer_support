import { OpenAIEmbeddings } from '@langchain/openai'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'
import {OpenAI} from '@langchain/openai'
import {Document} from 'langchain/document'
import {timeout} from '../config'
import { PromptTemplate } from "@langchain/core/prompts";


// CREATES PINECONE INDEX
export const createPineconeIndex = async(
    client,
    indexName,
    vectorDimension
) => {
    console.log('indexName:', indexName )
    const existingIndexes = await client.listIndexes()
    console.log(`Existing indexes: ${JSON.stringify(existingIndexes)}`)
    const indexNames = existingIndexes['indexes'].map((index) => index.name)
    if (!indexNames.includes(indexName)) {

        await client.createIndex({
            name: indexName,
            dimension: vectorDimension, // Replace with your model dimensions
            metric: 'cosine', // Replace with your model metric
            spec: { 
                serverless: { 
                    cloud: 'aws', 
                    region: 'us-east-1' 
                }
            } 
        });
        console.log(`Creating index ${indexName}`)
        await new Promise((resolve) => setTimeout(resolve, timeout))
        console.log(`Index ${indexName} created`)
    } else{
        console.log(`Index ${indexName} already exists`)
    }

}

export const generateDocEmbeddings = async (client, chunkTexts) => {
    const docParameters = {
        inputType: 'passage',
        truncate: 'END',
        };
    const model = "multilingual-e5-large"
    try {
        return await client.inference.embed(
            model,
            chunkTexts,
            docParameters
        );
        } catch (error) {
        console.error('Error generating embeddings:', error);
        }
  };

// TAKES IN DOCUMENTS, SPLITS THEM INTO CHUNKS, EMBEDS THEM, CREATES VECTOR OF EMBEDDINGS, AND UPLOADS TO PINECONE
export const updatePinecone = async(client, indexName, docs, userId) => {
    const index = client.Index(indexName)
    console.log(`retrieved index ${indexName}`)

    for (const doc of docs){
        console.log(`Processing doc ${doc.metadata.source}`)
        const txtPath = doc.metadata.source
        const text = doc.pageContent;

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        })
        console.log(`Splitting text into chunks`)

        const chunks = await textSplitter.createDocuments([text])
        console.log(`Split ${chunks.length} chunks`)
        console.log('Generating embeddings using Pinecone');

        // Convert chunks to array of strings
        const chunkTexts = chunks.map(chunk => chunk.pageContent.replace(/\n/g, " "));

        console.log("chunkTexts", chunkTexts)
        console.log('Generating embeddings using Pinecone');

        // Generate embeddings using Pinecone

        let embeddingsArrays = [];

        await generateDocEmbeddings(client, chunkTexts).then((embeddingsResponse) => {
            if (embeddingsResponse && embeddingsResponse.data) {
                console.log("Embeddings generated successfully");
                embeddingsArrays = embeddingsResponse.data.map(embedding => embedding.values);
            } else {
                console.error("Unexpected embeddings response structure:", embeddingsResponse);
            }
        }).catch(error => {
            console.error("Error generating embeddings:", error);
        });

        // Log the first embedding to verify the structure
        if (embeddingsArrays.length > 0) {
            console.log("First embedding:", embeddingsArrays[0].slice(0, 5), "...");
        }

        console.log("embeddingsArrays", embeddingsArrays)

        console.log(`Embedding chunks with length ${chunks.length}`)

        const batchSize = 100
        let batch = []

        for(let idx=0; idx< chunks.length;idx++){
            const chunk = chunks[idx];
            const vector = {
                id: `${userId}_${txtPath}_${idx}`,
                values: embeddingsArrays[idx],
                metadata:{
                    ...chunk.metadata,
                    loc: JSON.stringify(chunk.metadata.loc),
                    pageContent: chunk.pageContent,
                    txtPath: txtPath,
                    userId: userId,  // Add user ID to metadata
                }
            }
            batch =[...batch, vector]
            if(batch.length === batchSize || idx === chunks.length - 1){
                await index.upsert(batch);
                batch = []
            }
        }
    }
}

// CONVERTS USER QUERY TO EMBEDDING, RETRIEVES MATCHES FROM PINECONE, AND QUERIES LLM GIVING IT QUERY AND QUERY MATCHES
export const queryPineconeVectorStoreAndQueryLLM = async(
    client,
    indexName,
    query,
    userId
) => {
    console.log(`Querying pinecone index ${indexName} for user ${userId}`)
    const index = client.Index(indexName)
    // const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query)
    let queryEmbedding = []
    await generateDocEmbeddings(client, [query]).then((embeddingsResponse) => {
        if (embeddingsResponse && embeddingsResponse.data) {
            console.log("Embeddings generated successfully");
            queryEmbedding = embeddingsResponse.data[0].values
        } else {
            console.error("Unexpected embeddings response structure:", embeddingsResponse);
        }
    }).catch(error => {
        console.error("Error generating embeddings:", error);
    });
    const queryResult = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeValues: true,
        includeMetadata: true,
        filter: { userId: userId }  // Filter results by user ID
    });
    console.log(`Retrieved ${queryResult.matches.length} matches`)
    console.log(`Asking question: ${query}`)

    if(queryResult.matches.length){
        const llm = new OpenAI({})
        const concatenatedPageContent = queryResult.matches.map((match)=>match.metadata.pageContent).join(" ")
    

        const promptTemplate = PromptTemplate.fromTemplate(
        `You are an AI assistant designed to provide helpful and accurate responses to user inquiries. 
        If you know the answer to the <user_query> based on your general knowledge, 
        provide that answer directly. \n If you don't know the answer, use the information 
        provided in the <context> to formulate a response. If you cannot answer the query based 
        on either your knowledge or the provided information, respond with: I'm sorry, but I cannot 
        answer this question based on the information provided.  \n 
        <context>{context}</context> \n \n 
        <user_query>{query}</user_query>`
        );
        const formattedPrompt = await promptTemplate.invoke({ 
        context: concatenatedPageContent,
        query: query
        });

        console.log(`Formatted prompt: ${formattedPrompt}`)
        const result = await llm.invoke(formattedPrompt)
        console.log(`Result: ${result}`)
        return result
          

    } else{
        console.log(`No matches found for query: ${query}`)
        return "No matches found"
    }
}