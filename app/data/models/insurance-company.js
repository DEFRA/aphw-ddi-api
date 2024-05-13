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
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'insurance_company',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
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
