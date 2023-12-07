module.exports = (sequelize, DataTypes) => {
  const registeredPerson = sequelize.define('registered_person', {
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
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    person_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'registered_person',
    timestamps: false,
    indexes: [
      {
        name: 'registered_person_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  registeredPerson.associate = models => {
    registeredPerson.belongsTo(models.dog, {
      as: 'dog',
      foreignKey: 'dog_id'
    })

    registeredPerson.belongsTo(models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })

    registeredPerson.belongsTo(models.person_type, {
      as: 'person_type',
      foreignKey: 'person_type_id'
    })
  }

  return registeredPerson
}
