module.exports = (sequelize, DataTypes) => {
  const activityEvent = sequelize.define('activity_event', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    target_primary_key: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'activity_event_ukey'
    }
  }, {
    sequelize,
    tableName: 'activity_event',
    timestamps: false,
    indexes: [
      {
        name: 'activity_event_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'activity_event_ukey',
        unique: true,
        fields: [
          { name: 'target_primary_key' }
        ]
      }
    ]
  })

  activityEvent.associate = models => {
    activityEvent.hasMany(models.activity, {
      as: 'activity',
      foreignKey: 'activity_event_id'
    })
  }

  return activityEvent
}
