module.exports = (sequelize, DataTypes) => {
  const court = sequelize.define('court', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'court_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'court',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'court_name_ukey',
        unique: true,
        fields: [
          { name: 'name' }
        ]
      },
      {
        name: 'court_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  court.associate = models => {
    court.hasMany(models.registration, {
      as: 'courts',
      foreignKey: 'court_id'
    })
  }

  return court
}
