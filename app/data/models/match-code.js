module.exports = (sequelize, DataTypes) => {
  const matchCode = sequelize.define('match_code', {
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
    }
  }, {
    sequelize,
    tableName: 'match_code',
    timestamps: false,
    indexes: [
      {
        name: 'match_code_key',
        unique: false,
        fields: [
          { name: 'match_code' }
        ]
      },
      {
        name: 'match_code_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  matchCode.associate = models => {
    matchCode.belongsTo(sequelize.models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
  }

  return matchCode
}
