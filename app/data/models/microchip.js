module.exports = (sequelize, DataTypes) => {
  const microchip = sequelize.define('microchip', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    microchip_number: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'microchip',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    timestamps: true,
    indexes: [
      {
        name: 'microchip_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  microchip.associate = models => {
    microchip.hasMany(models.dog_microchip, {
      as: 'dog_microchips',
      foreignKey: 'microchip_id'
    })
  }

  return microchip
}
