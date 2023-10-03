module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define('address', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    address_line_1: DataTypes.STRING,
    address_line_2: DataTypes.STRING,
    address_line_3: DataTypes.STRING,
    postcode: DataTypes.STRING,
    county_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER
  },
  {
    tableName: 'address',
    freezeTableName: true,
    timestamps: false
  })
  address.associate = (models) => {
    address.belongsTo(models.county, { foreignKey: 'county_id', as: 'county' })
    address.belongsTo(models.country, { foreignKey: 'country_id', as: 'country' })
  }
  return address
}
