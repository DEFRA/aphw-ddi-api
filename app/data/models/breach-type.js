module.exports = (sequelize, DataTypes) => {
  const breachType = sequelize.define('breach_type', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: 'breach_type_label_ukey'
    },
    short_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: 'breach_type_short_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'breach_type',
    timestamps: false,
    indexes: [
      {
        name: 'breach_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'breach_type_label_ukey',
        unique: true,
        fields: [
          { name: 'label' }
        ]
      },
      {
        name: 'breach_type_short_name_ukey',
        unique: true,
        fields: [
          { name: 'short_name' }
        ]
      }
    ]
  })

  breachType.associate = models => {
    breachType.hasMany(models.dog_breach, {
      as: 'dog_breaches',
      foreignKey: 'breach_type_id'
    })
  }

  return breachType
}
