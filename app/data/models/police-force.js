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
    },
    short_name: {
      type: DataTypes.STRING(30),
      allowNull: true
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
    tableName: 'police_force',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
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
    policeForce.hasMany(models.user_account, {
      as: 'user_accounts',
      foreignKey: 'police_force_id'
    })
  }

  return policeForce
}
