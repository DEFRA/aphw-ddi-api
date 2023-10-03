module.exports = (sequelize, DataTypes) => {
  const country = sequelize.define('country', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    country: DataTypes.STRING
  },
  {
    tableName: 'country',
    freezeTableName: true,
    timestamps: false
  })
  country.associate = (models) => {
    country.hasMany(models.address, { foreignKey: 'country_id', as: 'addresses' })
  }
  return country
}
