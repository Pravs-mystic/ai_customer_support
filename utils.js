import { OpenAIEmbeddings } from '@langchain/openai'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'
import {OpenAI} from '@langchain/openai'
import {loadQAStuffChain} from 'langchain/chains'
import {Document} from 'langchain/document'
import {timeout} from './config'

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

// TAKES IN DOCUMENTS, SPLITS THEM INTO CHUNKS, EMBEDS THEM, CREATES VECTOR OF EMBEDDINGS, AND UPLOADS TO PINECONE
export const updatePinecone = async(client, indexName, docs)=>{
    const index = client.Index(indexName)
    console.log(`retrieved index ${indexName}`)

    for (const doc of docs){
        console.log(`Processing doc ${doc.metadata.source}`)
        const txtPath = doc.metadata.source
        const text = doc.pageContent;

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,  // to be changed later
            chunkOverlap: 100,
        })
        console.log(`Splitting text into chunks`)

        const chunks = await textSplitter.createDocuments([text])
        console.log(`Split ${chunks.length} chunks`)
        console.log('Calling openai embeddings')
        console.log('chunks', chunks)
        const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        )
 
        console.log(`Embedding chunks with length ${chunks.length}`)

        // upload to pinecone
        const batchSize = 100 //to be changed later
        let batch = []

        for(let idx=0; idx< chunks.length;idx++){
            const chunk = chunks[idx];
            const vector = {
                id: `${txtPath}_${idx}`,
                values: embeddingsArrays[idx],
                metadata:{
                    ...chunk.metadata,
                    loc: JSON.stringify(chunk.metadata.loc),
                    pageContent: chunk.pageContent,
                    txtPath: txtPath,
                }
           
            }
            batch =[...batch, vector]
            // console.log('batch', batch)
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
)=>{
    console.log(`Querying pinecone index ${indexName}`)
    const index = client.Index(indexName)
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query)
  
    const queryResult = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeValues: true,
        includeMetadata: true,
    });
    console.log(`Retrieved ${queryResult.matches.length} matches`)
    console.log(`Asking question: ${query}`)

    if(queryResult.matches.length){
        const llm = new OpenAI({})
        const chain = loadQAStuffChain(llm) //can change this chain to RefineDocumentsChain  for more documents

        const concatenatedPageContent = queryResult.matches.map((match)=>match.metadata.pageContent).join(" ")

        const result = await chain.call({
            input_documents: [new Document({pageContent: concatenatedPageContent})],
            question: query,
        })
        console.log(`Got result: ${JSON.stringify(result)}`)
        return result.text
    } else{
        console.log(`No matches found for query: ${query}`)
        return "No matches found"

    }


}