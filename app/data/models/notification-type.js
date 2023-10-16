module.exports = (sequelize, DataTypes) => {
  const notificationType = sequelize.define('notification_type', {
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
      unique: 'notification_type_ukey'
    }
  }, {
    sequelize,
    tableName: 'notification_type',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'notification_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'notification_type_ukey',
        unique: true,
        fields: [
          { name: 'type' }
        ]
      }
    ]
  })

  notificationType.associate = models => {
    notificationType.hasMany(models.notification, {
      as: 'notifications',
      foreignKey: 'notification_type_id'
    })
  }

  return notificationType
}
