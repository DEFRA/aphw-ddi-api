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
  return country
}