module.exports = (sequelize, DataTypes) => {
  const searchMatchCode = sequelize.define('search_match_code', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    match_code: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'search_match_code',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'search_match_code_key',
        unique: false,
        fields: [
          { name: 'match_code' }
        ]
      },
      {
        name: 'search_match_code_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  searchMatchCode.associate = models => {
    searchMatchCode.belongsTo(sequelize.models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
  }

  return searchMatchCode
}
