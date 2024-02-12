/**
 * @typedef {Object<string, any>} PoliceForce
 * @property {number} id
 * @property {string} name
 * @property {Registration[]} registrations
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {PoliceForce}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {PoliceForce}
   */
  const policeForce = sequelize.define('police_force', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'police_force',
    timestamps: false,
    indexes: [
      {
        name: 'police_force_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  policeForce.associate = models => {
    policeForce.hasMany(models.registration, {
      as: 'registrations',
      foreignKey: 'police_force_id'
    })
  }

  return policeForce
}
