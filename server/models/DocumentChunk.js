module.exports = (sequelize, DataTypes) => {
    const DocumentChunk = sequelize.define('DocumentChunk', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      documentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      embedding: {
        type: DataTypes.VECTOR(1536), // Adjust based on your embedding model
        allowNull: false
      },
      chunkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
  
    DocumentChunk.associate = (models) => {
      DocumentChunk.belongsTo(models.Document);
    };
  
    return DocumentChunk;
  };