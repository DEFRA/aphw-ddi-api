module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define('address', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address_line_1: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    address_line_2: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    address_line_3: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    postcode: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    county_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'address',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'address_line_1_ukey',
        unique: true,
        fields: [
          { name: 'address_line_1' }
        ]
      },
      {
        name: 'address_line_2_ukey',
        unique: true,
        fields: [
          { name: 'address_line_2' }
        ]
      },
      {
        name: 'address_line_3_ukey',
        unique: true,
        fields: [
          { name: 'address_line_3' }
        ]
      },
      {
        name: 'address_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'postcode_ukey',
        unique: true,
        fields: [
          { name: 'postcode' }
        ]
      }
    ]
  })

  address.associate = models => {
    address.hasMany(models.person_address, {
      as: 'person_addresses',
      foreignKey: 'address_id'
    })

    address.belongsTo(models.country, {
      as: 'country',
      foreignKey: 'country_id'
    })

    address.belongsTo(models.county, {
      as: 'county',
      foreignKey: 'county_id'
    })
  }

  return address
}
