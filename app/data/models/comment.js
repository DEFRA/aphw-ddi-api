/**
 * @typedef {Object<string, any>} Comment
 * @property {number} id
 * @property {number} registration_id
 * @property {string} comment
 * @property {Date} created_on
 * @property {Registration} registration
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Comment}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   *
   * @type {Comment}
   */
  const comment = sequelize.define('comment', {
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'comment',
    timestamps: false,
    indexes: [
      {
        name: 'comment_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  comment.associate = models => {
    comment.belongsTo(models.registration, {
      as: 'registration',
      foreignKey: 'registration_id'
    })
  }

  return comment
}
