/**
 * @typedef {Object<string, any>} Insurance
 * @property {number} id
 * @property {string} policy_number
 * @property {number} company_id
 * @property {Date} renewal_date
 * @property {Dog[]} dogs
 * @property {InsuranceCompany} company
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Insurance}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Insurance}
   */
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
      allowNull: true,
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
    renewal_date: {
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
