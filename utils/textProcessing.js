
import { encode, decode } from 'gpt-3-encoder';


export function splitIntoChunks(text, maxTokens = 500, overlap = 100) {
    const tokens = encode(text);
    const chunks = [];
    let startIndex = 0;
  
    while (startIndex < tokens.length) {
      let endIndex = startIndex + maxTokens;
      if (endIndex > tokens.length) {
        endIndex = tokens.length;
      }
  
      chunks.push(tokens.slice(startIndex, endIndex));
      startIndex = endIndex - overlap;
    }
  
    return chunks.map(chunk => decode(chunk));
  }


 