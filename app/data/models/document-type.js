/**
 * @typedef {Object<string, any>} DocumentType
 * @property {number} id
 * @property {string} type
 * @property {number} documents
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {DocumentType}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {DocumentType}
   */
  const documentType = sequelize.define('document_type', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'document_type_ukey'
    }
  }, {
    sequelize,
    tableName: 'document_type',
    timestamps: false,
    indexes: [
      {
        name: 'document_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'document_type_ukey',
        unique: true,
        fields: [
          { name: 'type' }
        ]
      }
    ]
  })

  documentType.associate = models => {
    documentType.hasMany(models.document, {
      as: 'documents',
      foreignKey: 'document_type_id'
    })
  }

  return documentType
}
