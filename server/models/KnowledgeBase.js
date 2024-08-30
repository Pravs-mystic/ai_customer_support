module.exports = (sequelize, DataTypes) => {
    const KnowledgeBase = sequelize.define('KnowledgeBase', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
  
    KnowledgeBase.associate = (models) => {
      KnowledgeBase.belongsTo(models.User);
      KnowledgeBase.hasMany(models.Document,{
        foreignKey: 'knowledgeBaseId',
      });
    };
  
    return KnowledgeBase;
  };