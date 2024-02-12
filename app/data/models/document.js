/**
 * @typedef {Object<string, any>} Document
 * @property {number} id
 * @property {number} registration_id
 * @property {number} document_type_id
 * @property {Date} created_on
 * @property {string} uri
 * @property {DocumentType} document_type
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Document}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Document}
   */
  const document = sequelize.define('document', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'registration',
        key: 'id'
      }
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'document_type',
        key: 'id'
      }
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    uri: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'document',
    timestamps: false,
    indexes: [
      {
        name: 'document_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  document.associate = models => {
    document.belongsTo(models.document_type, {
      as: 'document_type',
      foreignKey: 'document_type_id'
    })
  }

  return document
}
