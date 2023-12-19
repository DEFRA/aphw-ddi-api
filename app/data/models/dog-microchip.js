module.exports = (sequelize, DataTypes) => {
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
