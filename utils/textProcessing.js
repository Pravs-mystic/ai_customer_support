
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'


export async function splitIntoChunks(doc) {
    // const tokens = encode(text);
    // const chunks = [];
    // let startIndex = 0;
  
    // while (startIndex < tokens.length) {
    //   let endIndex = startIndex + maxTokens;
    //   if (endIndex > tokens.length) {
    //     endIndex = tokens.length;
    //   }
  
    //   chunks.push(tokens.slice(startIndex, endIndex));
    //   startIndex = endIndex - overlap;
    //   return chunks.map(chunk => decode(chunk));
    // }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
        chunkOverlap: 100,
    })
    console.log(`Splitting text into chunks`)

    const chunks = await textSplitter.createDocuments([doc[0]])
    console.log('Generating embeddings');
    console.log("Chunks:", chunks)
    const chunkTexts = chunks.map(chunk => chunk.pageContent.replace(/\n/g, " "));
    console.log("ChunkTexts:", chunkTexts)
    return chunkTexts
    
  }


 