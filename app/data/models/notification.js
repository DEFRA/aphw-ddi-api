module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
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
    notification_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'notification_type',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'notification',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'notification_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  notification.associate = models => {
    notification.belongsTo(models.notification_type, {
      as: 'notification_type',
      foreignKey: 'notification_type_id'
    })
  }

  return notification
}
