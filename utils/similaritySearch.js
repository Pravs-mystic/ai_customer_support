
import { createEmbedding } from './openaiUtils';
import db from '/server/models';



export async function findSimilarChunks(query, limit = 5) {
    const queryEmbedding = await createEmbedding(query);
  
    const similarChunks = await db.DocumentChunk.findAll({
      attributes: [
        'id',
        'content',
        [db.sequelize.literal(`embedding <=> ARRAY[${queryEmbedding}]::vector`), 'distance']
      ],
      order: [[db.sequelize.literal('distance'), 'ASC']],
      limit: limit
    });
  
    return similarChunks;
  }