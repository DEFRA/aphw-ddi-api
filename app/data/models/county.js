module.exports = (sequelize, DataTypes) => {
  const county = sequelize.define('county', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    county: DataTypes.STRING
  },
  {
    tableName: 'county',
    freezeTableName: true,
    timestamps: false
  })
  county.associate = (models) => {
    county.hasMany(models.address, { foreignKey: 'county_id', as: 'addresses' })
  }
  return county
}
