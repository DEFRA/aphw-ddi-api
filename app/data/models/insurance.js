module.exports = (sequelize, DataTypes) => {
  const insurance = sequelize.define('insurance', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    policy_number: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'insurance_policy_number_ukey'
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'insurance_company',
        key: 'id'
      }
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'insurance',
    timestamps: false,
    indexes: [
      {
        name: 'insurance_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'insurance_policy_number_ukey',
        unique: true,
        fields: [
          { name: 'policy_number' }
        ]
      }
    ]
  })

  insurance.associate = models => {
    insurance.belongsTo(models.dog, {
      as: 'dogs',
      foreignKey: 'dog_id'
    })

    insurance.belongsTo(models.insurance_company, {
      as: 'company',
      foreignKey: 'company_id'
    })
  }

  return insurance
}
