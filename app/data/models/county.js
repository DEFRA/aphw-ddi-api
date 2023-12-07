module.exports = (sequelize, DataTypes) => {
  const county = sequelize.define('county', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    county: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'county_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'county',
    timestamps: false,
    indexes: [
      {
        name: 'county_name_ukey',
        unique: true,
        fields: [
          { name: 'county' }
        ]
      },
      {
        name: 'county_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return county
}
