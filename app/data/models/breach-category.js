module.exports = (sequelize, DataTypes) => {
  const breachType = sequelize.define('breach_category', {
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
      unique: 'breach_category_label_ukey'
    },
    short_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: 'breach_category_short_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'breach_category',
    timestamps: false,
    indexes: [
      {
        name: 'breach_category_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'breach_category_label_ukey',
        unique: true,
        fields: [
          { name: 'label' }
        ]
      },
      {
        name: 'breach_category_short_name_ukey',
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
      foreignKey: 'breach_category_id'
    })
  }

  return breachType
}
