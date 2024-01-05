module.exports = (sequelize, DataTypes) => {
  const exemptionOrder = sequelize.define('exemption_order', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    exemption_order: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'exemption_order_ukey'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'exemption_order',
    timestamps: false,
    indexes: [
      {
        name: 'exemption_order_ukey',
        unique: true,
        fields: [
          { name: 'breed' }
        ]
      },
      {
        name: 'breed_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  exemptionOrder.associate = models => {
    exemptionOrder.hasMany(models.registration, {
      as: 'registrations',
      foreignKey: 'exemption_order_id'
    })
  }

  return exemptionOrder
}
