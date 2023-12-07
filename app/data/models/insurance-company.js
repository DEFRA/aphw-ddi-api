module.exports = (sequelize, DataTypes) => {
  const insuranceCompany = sequelize.define('insurance_company', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'insurance_company_ukey'
    }
  }, {
    sequelize,
    tableName: 'insurance_company',
    timestamps: false,
    indexes: [
      {
        name: 'insurance_company_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'insurance_company_ukey',
        unique: true,
        fields: [
          { name: 'company_name' }
        ]
      }
    ]
  })

  insuranceCompany.associate = models => {
    insuranceCompany.hasMany(models.insurance, {
      as: 'insurances',
      foreignKey: 'company_id'
    })
  }

  return insuranceCompany
}
