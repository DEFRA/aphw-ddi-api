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
    }
  }, {
    sequelize,
    tableName: 'search_index',
    timestamps: false,
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
