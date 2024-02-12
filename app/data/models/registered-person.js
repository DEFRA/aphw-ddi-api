/**
 * @typedef {Object<string, any>} RegisteredPerson
 * @property {number} id
 * @property {number} person_id
 * @property {number} dog_id
 * @property {number} person_type_id
 * @property {Dog} dog
 * @property {Person} person
 * @property {PersonType} person_type
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {RegisteredPerson}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {RegisteredPerson}
   */
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
