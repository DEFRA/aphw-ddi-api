module.exports = (sequelize, DataTypes) => {
  const microchipType = sequelize.define('microchip_type', {
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
      unique: "microchip_type_ukey"
    }
  }, {
    sequelize,
    tableName: 'microchip_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "microchip_type_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "microchip_type_ukey",
        unique: true,
        fields: [
          { name: "type" },
        ]
      },
    ]
  });

  microchipType.associate = models => {
    microchipType.hasMany(models.dog, {
      as: "dogs",
      foreignKey: "microchip_type_id"
    })
  }

  return microchipType
};
