module.exports = (sequelize, DataTypes) => {
  const activityType = sequelize.define('activity_type', {
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
      unique: 'activity_type_ukey'
    }
  }, {
    sequelize,
    tableName: 'activity_type',
    timestamps: false,
    indexes: [
      {
        name: 'activity_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'activity_type_ukey',
        unique: true,
        fields: [
          { name: 'name' }
        ]
      }
    ]
  })

  activityType.associate = models => {
    activityType.hasMany(models.activity, {
      as: 'activity',
      foreignKey: 'activity_type_id'
    })
  }

  return activityType
}
