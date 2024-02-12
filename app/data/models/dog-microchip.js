/**
 * @typedef {Object<string, any>} DogMicrochip
 * @property {number} id
 * @property {number} dog_id
 * @property {number} microchip_id
 * @property {Microchip} microchip
 * @property {Dog} dog
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {DogMicrochip}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {DogMicrochip}
   */
  const dogMicrochip = sequelize.define('dog_microchip', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    microchip_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'dog_microchip',
    timestamps: false,
    indexes: [
      {
        name: 'dog_microchip_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  dogMicrochip.associate = models => {
    dogMicrochip.belongsTo(models.microchip, {
      as: 'microchip',
      foreignKey: 'microchip_id'
    })

    dogMicrochip.belongsTo(models.dog, {
      as: 'dog',
      foreignKey: 'dog_id'
    })
  }

  return dogMicrochip
}
