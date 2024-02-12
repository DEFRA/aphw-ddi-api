/**
 * @typedef {Object<string, number>} Contact
 * @property {number} id
 * @property {string} contact
 * @property {number} contact_type_id
 * @property {PersonContact} person_contacts
 * @property {ContactType} contact_type
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Contact}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Contact}
   */
  const contact = sequelize.define('contact', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    contact: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'contact_ukey'
    },
    contact_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'contact',
    timestamps: false,
    indexes: [
      {
        name: 'contact_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'contact_ukey',
        unique: true,
        fields: [
          { name: 'contact' }
        ]
      }
    ]
  })

  contact.associate = models => {
    contact.hasMany(models.person_contact, {
      as: 'person_contacts',
      foreignKey: 'contact_id'
    })

    contact.belongsTo(models.contact_type, {
      as: 'contact_type',
      foreignKey: 'contact_type_id'
    })
  }

  return contact
}
