
import { createEmbedding } from './openaiUtils';
import db from '/server/models';



export async function findSimilarChunks(query, userId, limit = 5) {
    const queryEmbedding = await createEmbedding(query);
  
    const similarChunks = await db.DocumentChunk.findAll({
      attributes: [
        'id',
        'content',
        [db.sequelize.literal(`embedding <=> ARRAY[${queryEmbedding}]::vector`), 'distance']
      ],
      include: [
        {
          model: db.Document,
          required: true, // Ensures INNER JOIN with Document
          include: [
            {
              model: db.KnowledgeBase,
              required: true, // Ensures INNER JOIN with KnowledgeBase
              where: { userId: userId }
            }
          ]
        }
      ],
      order: [[db.sequelize.literal('distance'), 'ASC']],
      limit: limit
    });
  
    return similarChunks;
  }