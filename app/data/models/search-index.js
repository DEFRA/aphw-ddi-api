module.exports = (sequelize, DataTypes) => {
  const searchIndex = sequelize.define('search_index', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    search: {
      type: DataTypes.TSVECTOR,
      allowNull: false
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    json: {
      type: DataTypes.JSONB
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'search_index',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'search_index_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return searchIndex
}
