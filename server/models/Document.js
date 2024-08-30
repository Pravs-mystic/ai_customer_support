module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define('Document', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      knowledgeBaseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileType: DataTypes.STRING,
      fileSize: DataTypes.INTEGER
    });
  
    Document.associate = (models) => {
      Document.belongsTo(models.KnowledgeBase,{
        foreignKey: 'knowledgeBaseId', 
      });
      Document.hasMany(models.DocumentChunk);
    };
  
    return Document;
  };