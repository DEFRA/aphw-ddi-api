/**
 * @typedef {Object<string, any>} Backlog
 * @property {number} id
 * @property {JSON} json
 * @property {string} errors
 * @property {string} status
 * @property {string} warnings
 */

/**
 * @param sequelize
 * @param DataTypes
 * @returns {Backlog}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   *
   * @type {Backlog}
   */
  const backlog = sequelize.define('backlog', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    json: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    errors: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    warnings: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'backlog',
    timestamps: false,
    indexes: [
      {
        name: 'backlog_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return backlog
}
