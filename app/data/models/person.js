/**
 * @typedef {Object<string, any>} Person
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} person_reference
 * @property {Date} birth_date
 * @property {Address[]} addresses
 * @property {PersonContact[]} person_contacts
 * @property {RegisteredPerson[]} registered_people
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Person}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Person}
   */
  const person = sequelize.define('person', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    person_reference: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'person',
    timestamps: false,
    indexes: [
      {
        name: 'person_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  person.associate = models => {
    person.hasMany(models.person_address, {
      as: 'addresses',
      foreignKey: 'person_id'
    })

    person.hasMany(models.person_contact, {
      as: 'person_contacts',
      foreignKey: 'person_id'
    })

    person.hasMany(models.registered_person, {
      as: 'registered_people',
      foreignKey: 'person_id'
    })
  }

  return person
}
