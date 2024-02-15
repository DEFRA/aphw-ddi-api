module.exports = (sequelize, DataTypes) => {
  const activitySource = sequelize.define('activity_source', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'activity_source_ukey'
    }
  }, {
    sequelize,
    tableName: 'activity_source',
    timestamps: false,
    indexes: [
      {
        name: 'activity_source_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'activity_source_ukey',
        unique: true,
        fields: [
          { name: 'name' }
        ]
      }
    ]
  })

  activitySource.associate = models => {
    activitySource.hasMany(models.activity, {
      as: 'activity',
      foreignKey: 'activity_source_id'
    })
  }

  return activitySource
}
