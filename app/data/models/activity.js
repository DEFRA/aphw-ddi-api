module.exports = (sequelize, DataTypes) => {
  const activity = sequelize.define('activity', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    activity_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    activity_source_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'activity',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'activity_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  activity.associate = models => {
    activity.belongsTo(models.activity_type, {
      as: 'activity_type',
      foreignKey: 'activity_type_id'
    })
    activity.belongsTo(models.activity_source, {
      as: 'activity_source',
      foreignKey: 'activity_source_id'
    })
    activity.belongsTo(models.activity_event, {
      as: 'activity_event',
      foreignKey: 'activity_event_id'
    })
  }

  return activity
}
