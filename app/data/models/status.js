/**
 * @typedef {Object<string, any>} Status
 * @property {number} id
 * @property {string} status
 * @property {string} status_type
 * @property {Dog[]} dogs
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Status}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Status}
   */
  const status = sequelize.define('status', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'status_name_ukey'
    },
    status_type: {
      type: DataTypes.STRING(24),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'status',
    timestamps: false,
    indexes: [
      {
        name: 'status_name_ukey',
        unique: true,
        fields: [
          { name: 'status' }
        ]
      },
      {
        name: 'status_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  status.associate = models => {
    status.hasMany(models.dog, {
      as: 'dogs',
      foreignKey: 'status_id'
    })
  }

  return status
}
