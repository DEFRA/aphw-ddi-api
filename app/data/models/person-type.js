module.exports = (sequelize, DataTypes) => {
  const personType = sequelize.define('person_type', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    person_type: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'person_type_ukey'
    }
  }, {
    sequelize,
    tableName: 'person_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'person_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'person_type_ukey',
        unique: true,
        fields: [
          { name: 'person_type' }
        ]
      }
    ]
  })

  personType.associate = models => {
    personType.hasMany(models.registered_person, {
      as: 'registered_people',
      foreignKey: 'person_type_id'
    })
  }

  return personType
}
