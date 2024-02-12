/**
 * @typedef {Object<string, any>} PersonAddress
 * @property {number} id
 * @property {number} person_id
 * @property {number} address_id
 * @property {Address} address
 * @property {Person} person
 *
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {PersonAddress}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {PersonAddress}
   */
  const personAddress = sequelize.define('person_address', {
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
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'person_address',
    timestamps: false,
    indexes: [
      {
        name: 'person_address_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  personAddress.associate = models => {
    personAddress.belongsTo(models.address, {
      as: 'address',
      foreignKey: 'address_id'
    })

    personAddress.belongsTo(models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
  }

  return personAddress
}
