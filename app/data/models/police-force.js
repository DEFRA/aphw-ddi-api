module.exports = (sequelize, DataTypes) => {
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
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "police_force_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  
  policeForce.associate = models => {
    policeForce.hasMany(models.registration, {
      as: "registrations",
      foreignKey: "police_force_id"
    })
  }

  return policeForce
};
