module.exports = (sequelize, DataTypes) => {
  const searchTgram = sequelize.define('search_tgram', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    match_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'search_tgram',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'search_tgram_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  searchTgram.associate = models => {
    searchTgram.belongsTo(sequelize.models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
    searchTgram.belongsTo(sequelize.models.dog, {
      as: 'dog',
      foreignKey: 'dog_id'
    })
  }

  return searchTgram
}
