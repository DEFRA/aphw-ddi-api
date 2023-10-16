module.exports = (sequelize, DataTypes) => {
  const country = sequelize.define('country', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    country: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'country_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'country',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'country_name_ukey',
        unique: true,
        fields: [
          { name: 'country' }
        ]
      },
      {
        name: 'country_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  country.associate = models => {
    country.hasMany(models.address, {
      as: 'addresses',
      foreignKey: 'country_id'
    })
  }

  return country
}
